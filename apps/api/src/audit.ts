import { randomUUID } from 'node:crypto';
import type { AuthPrincipal } from './auth.js';

export type AuditOutcome = 'success' | 'denied' | 'failure';

export interface AuditEvent {
  id: string;
  organizationId: string;
  actorUserId: string;
  sessionId?: string;
  correlationId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  outcome: AuditOutcome;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export interface AuditSink {
  append(event: AuditEvent): Promise<void>;
}

export class ConsoleAuditSink implements AuditSink {
  async append(event: AuditEvent): Promise<void> {
    // Structured JSON is intentionally emitted to stdout so a production
    // collector can ingest it without application-specific parsing.
    console.info(JSON.stringify({ type: 'audit.event', ...event }));
  }
}

export async function audit(
  sink: AuditSink,
  principal: AuthPrincipal,
  input: Omit<AuditEvent, 'id' | 'organizationId' | 'actorUserId' | 'createdAt'>
): Promise<void> {
  await sink.append({
    id: randomUUID(),
    organizationId: principal.organizationId,
    actorUserId: principal.userId,
    createdAt: new Date().toISOString(),
    ...input
  });
}
