import { Pool } from 'pg';
import type { AuditEvent, AuditSink } from './audit.js';

export class PostgresAuditSink implements AuditSink {
  constructor(private readonly pool: Pool) {}

  async append(event: AuditEvent): Promise<void> {
    await this.pool.query(
      `insert into audit_events
        (id, organization_id, actor_user_id, session_id, correlation_id, action, resource_type, resource_id, outcome, metadata_json, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [event.id, event.organizationId, event.actorUserId, event.sessionId ?? null, event.correlationId, event.action, event.resourceType, event.resourceId ?? null, event.outcome, event.metadata, event.createdAt]
    );
  }
}
