export type AuditAction = 'workspace.open' | 'workspace.save' | 'layout.move' | 'layout.resize' | 'layout.dock' | 'plugin.request' | 'plugin.approve' | 'plugin.deny' | 'workflow.validate' | 'workflow.approve';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AuditSink { append(event: AuditEvent): Promise<void>; list(): Promise<AuditEvent[]>; }

export class MemoryAuditSink implements AuditSink {
  private readonly events: AuditEvent[] = [];
  async append(event: AuditEvent): Promise<void> { this.events.push(structuredClone(event)); }
  async list(): Promise<AuditEvent[]> { return structuredClone(this.events); }
}
