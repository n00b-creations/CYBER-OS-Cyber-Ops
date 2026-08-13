import type { AuditEvent, AuditSink } from './index';

export interface CapabilityDecision { requestId: string; plugin: string; capability: string; decision: 'approved' | 'denied'; actor: string; }

export async function recordCapabilityDecision(sink: AuditSink, decision: CapabilityDecision): Promise<void> {
  const event: AuditEvent = {
    id: `cap-${decision.requestId}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: decision.actor,
    action: 'plugin.request',
    resourceType: 'plugin-capability',
    resourceId: decision.requestId,
    metadata: { plugin: decision.plugin, capability: decision.capability, decision: decision.decision },
  };
  await sink.append(event);
}
