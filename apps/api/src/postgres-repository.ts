import { Pool, type PoolClient } from 'pg';
import type { CrmRepository, LeadRecord, OpportunityRecord } from './repository.js';

async function withTenant<T>(pool: Pool, organizationId: string, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('begin');
    await client.query("select set_config('app.organization_id', $1, true)", [organizationId]);
    const result = await work(client);
    await client.query('commit');
    return result;
  } catch (error) {
    await client.query('rollback').catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

export class PostgresCrmRepository implements CrmRepository {
  constructor(private readonly pool: Pool) {}

  async listLeads(organizationId: string): Promise<LeadRecord[]> {
    return withTenant(this.pool, organizationId, async client => {
      const result = await client.query<LeadRecord>(
        `select id, organization_id as "organizationId", name, company, email, source, score, stage,
                created_at as "createdAt", updated_at as "updatedAt"
           from leads
          order by score desc, created_at desc`,
      );
      return result.rows;
    });
  }

  async listOpportunities(organizationId: string): Promise<OpportunityRecord[]> {
    return withTenant(this.pool, organizationId, async client => {
      const result = await client.query<OpportunityRecord>(
        `select id, organization_id as "organizationId", name, company, value::float8 as value,
                stage, probability, owner_user_id as "ownerUserId",
                created_at as "createdAt", updated_at as "updatedAt"
           from opportunities
          order by updated_at desc`,
      );
      return result.rows;
    });
  }
}

export function createPostgresPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is required for PostgreSQL mode');
  return new Pool({
    connectionString,
    max: Number(process.env.DB_POOL_MAX ?? 10),
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: true }
  });
}
