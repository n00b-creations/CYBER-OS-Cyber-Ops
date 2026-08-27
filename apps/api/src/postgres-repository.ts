import { Pool } from 'pg';
import type { CrmRepository, LeadRecord, OpportunityRecord } from './repository.js';

export class PostgresCrmRepository implements CrmRepository {
  constructor(private readonly pool: Pool) {}

  async listLeads(organizationId: string): Promise<LeadRecord[]> {
    const result = await this.pool.query<LeadRecord>(
      `select id, organization_id as "organizationId", name, company, email, source, score, stage, created_at as "createdAt", updated_at as "updatedAt"
       from leads where organization_id = $1 order by score desc, created_at desc`,
      [organizationId]
    );
    return result.rows;
  }

  async listOpportunities(organizationId: string): Promise<OpportunityRecord[]> {
    const result = await this.pool.query<OpportunityRecord>(
      `select id, organization_id as "organizationId", name, company, value::float8 as value, stage, probability, owner_user_id as "ownerUserId", created_at as "createdAt", updated_at as "updatedAt"
       from opportunities where organization_id = $1 order by updated_at desc`,
      [organizationId]
    );
    return result.rows;
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
