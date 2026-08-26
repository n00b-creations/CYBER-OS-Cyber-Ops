import type { PluginCapability } from './permissions';

export type CapabilityRisk = 'low' | 'moderate' | 'high' | 'critical';
export type CapabilityDecision = 'allow' | 'approval_required' | 'deny';

export interface CapabilityPolicyRule {
  capability: PluginCapability;
  risk: CapabilityRisk;
  decision: CapabilityDecision;
  reason: string;
}

export interface CapabilityDecisionResult {
  capability: PluginCapability;
  risk: CapabilityRisk;
  decision: CapabilityDecision;
  reason: string;
}

const rules: Record<PluginCapability, CapabilityPolicyRule> = {
  'assets.read': { capability: 'assets.read', risk: 'low', decision: 'allow', reason: 'Read-only asset context.' },
  'events.read': { capability: 'events.read', risk: 'low', decision: 'allow', reason: 'Read-only event context.' },
  'alerts.read': { capability: 'alerts.read', risk: 'low', decision: 'allow', reason: 'Read-only alert context.' },
  'cases.read': { capability: 'cases.read', risk: 'low', decision: 'allow', reason: 'Read-only case context.' },
  'notes.read': { capability: 'notes.read', risk: 'low', decision: 'allow', reason: 'Read-only notes context.' },
  'notes.write': { capability: 'notes.write', risk: 'moderate', decision: 'approval_required', reason: 'Plugin may modify investigation notes.' },
  'tools.read': { capability: 'tools.read', risk: 'low', decision: 'allow', reason: 'Read-only tool catalog access.' },
  'workspace.read': { capability: 'workspace.read', risk: 'low', decision: 'allow', reason: 'Read-only workspace context.' },
  'workspace.write': { capability: 'workspace.write', risk: 'moderate', decision: 'approval_required', reason: 'Plugin may modify workspace state.' },
  'terminal.request': { capability: 'terminal.request', risk: 'critical', decision: 'deny', reason: 'Direct terminal execution is not admitted by the default plugin policy.' },
  'network.request': { capability: 'network.request', risk: 'high', decision: 'approval_required', reason: 'Network access requires explicit authorization and a controlled adapter.' },
  'filesystem.request': { capability: 'filesystem.request', risk: 'high', decision: 'approval_required', reason: 'Filesystem access requires explicit authorization and a controlled adapter.' },
};

export function getCapabilityPolicy(capability: PluginCapability): CapabilityPolicyRule {
  return rules[capability];
}

export function evaluateCapabilities(capabilities: PluginCapability[]): CapabilityDecisionResult[] {
  return capabilities.map((capability) => {
    const rule = getCapabilityPolicy(capability);
    return { capability, risk: rule.risk, decision: rule.decision, reason: rule.reason };
  });
}

export function summarizeDecision(results: CapabilityDecisionResult[]): CapabilityDecision {
  if (results.some((result) => result.decision === 'deny')) return 'deny';
  if (results.some((result) => result.decision === 'approval_required')) return 'approval_required';
  return 'allow';
}
