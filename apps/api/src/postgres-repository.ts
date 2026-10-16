import { Pool, type PoolClient } from 'pg';
import type { CrmRepository, CreateLeadInput, CreateOpportunityInput, LeadRecord, OpportunityRecord } from './repository.js';

async function withTenant<T>(pool: Pool, organizationId: string, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query("select set_config('app.organization_id', $1, true)", [organizationId]);
    const result = await work(client); await client.query('commit'); return result;
  } catch (error) { await client.query('rollback').catch(() => undefined); throw error; }
  finally { client.release(); }
}

export class PostgresCrmRepository implements CrmRepository {
  constructor(private readonly pool: Pool) {}
  async listLeads(organizationId: string) { return withTenant(this.pool, organizationId, async client => (await client.query<LeadRecord>(`select id, organization_id as "organizationId", name, company, email, source, score, stage, created_at as "createdAt", updated_at as "updatedAt" from leads order by score desc, created_at desc`)).rows); }
  async listOpportunities(organizationId: string) { return withTenant(this.pool, organizationId, async client => (await client.query<OpportunityRecord>(`select id, organization_id as "organizationId", name, company, value::float8 as value, stage, probability, owner_user_id as "ownerUserId", created_at as "createdAt", updated_at as "updatedAt" from opportunities order by updated_at desc`)).rows); }
  async createLead(organizationId: string, input: CreateLeadInput): Promise<LeadRecord> {
    return withTenant(this.pool, organizationId, async client => (await client.query<LeadRecord>(`insert into leads (id, organization_id, name, company, email, source, score, stage) values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) returning id, organization_id as "organizationId", name, company, email, source, score, stage, created_at as "createdAt", updated_at as "updatedAt"`, [organizationId, input.name, input.company, input.email, input.source, input.score ?? 0, input.stage ?? 'new'])).rows[0]);
  }
  async createOpportunity(organizationId: string, input: CreateOpportunityInput): Promise<OpportunityRecord> {
    return withTenant(this.pool, organizationId, async client => (await client.query<OpportunityRecord>(`insert into opportunities (id, organization_id, name, company, value, stage, probability, owner_user_id) values (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7) returning id, organization_id as "organizationId", name, company, value::float8 as value, stage, probability, owner_user_id as "ownerUserId", created_at as "createdAt", updated_at as "updatedAt"`, [organizationId, input.name, input.company, input.value, input.stage ?? 'discovery', input.probability ?? 0, input.ownerUserId])).rows[0]);
  }
}

export function createPostgresPool(): Pool {
  const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error('DATABASE_URL is required for PostgreSQL mode');
  return new Pool({ connectionString, max: Number(process.env.DB_POOL_MAX ?? 10), ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: true } });
}
