import type { Alert, Asset, CaseRecord, SecurityEvent, ToolDefinition, Workflow } from './domain';

export const assets: Asset[] = [
  { id: 'asset-001', name: 'SOC-CORE-01', kind: 'host', status: 'online', tags: ['soc', 'linux'], metadata: { environment: 'lab', owner: 'security' } },
  { id: 'asset-002', name: 'WIN-AD-01', kind: 'host', status: 'online', tags: ['identity', 'windows'], metadata: { environment: 'lab', owner: 'identity' } },
  { id: 'asset-003', name: 'K8S-NODE-02', kind: 'vm', status: 'degraded', tags: ['kubernetes', 'prod-sim'], metadata: { environment: 'lab', owner: 'platform' } },
  { id: 'asset-004', name: 'WEB-APP-01', kind: 'service', status: 'online', tags: ['web', 'assessment'], metadata: { environment: 'lab', owner: 'engineering' } },
];

export const events: SecurityEvent[] = [
  { id: 'evt-001', timestamp: '2026-08-08T11:02:00Z', source: 'endpoint', assetId: 'asset-002', severity: 'high', type: 'authentication', summary: 'Repeated authentication failures observed', metadata: { count: 12 } },
  { id: 'evt-002', timestamp: '2026-08-08T11:05:00Z', source: 'network', assetId: 'asset-004', severity: 'medium', type: 'traffic', summary: 'Unexpected outbound connection pattern', metadata: { direction: 'egress' } },
  { id: 'evt-003', timestamp: '2026-08-08T11:08:00Z', source: 'kubernetes', assetId: 'asset-003', severity: 'low', type: 'runtime', summary: 'Node resource pressure crossed threshold', metadata: { metric: 'memory' } },
];

export const alerts: Alert[] = [
  { id: 'alert-001', eventId: 'evt-001', assetId: 'asset-002', severity: 'high', status: 'investigating', title: 'Authentication anomaly', techniqueId: 'T1110' },
  { id: 'alert-002', eventId: 'evt-002', assetId: 'asset-004', severity: 'medium', status: 'new', title: 'Unusual outbound traffic' },
];

export const cases: CaseRecord[] = [
  { id: 'case-001', title: 'Identity authentication investigation', status: 'investigating', severity: 'high', assetIds: ['asset-002'], evidenceIds: ['evidence-001'] },
  { id: 'case-002', title: 'Web service anomaly', status: 'open', severity: 'medium', assetIds: ['asset-004'], evidenceIds: [] },
];

export const tools: ToolDefinition[] = [
  { id: 'tool-red-recon', name: 'Recon Toolkit', workspaceProfiles: ['red-team', 'purple-team'], category: 'recon', description: 'Curated authorized assessment tooling catalog.', dependencies: [], capabilities: ['asset discovery'], installed: true, favorite: true },
  { id: 'tool-blue-detection', name: 'Detection Toolkit', workspaceProfiles: ['blue-team', 'purple-team'], category: 'detection', description: 'Defensive detection and telemetry tooling catalog.', dependencies: [], capabilities: ['detection analysis'], installed: true, favorite: true },
  { id: 'tool-dfir', name: 'Forensics Toolkit', workspaceProfiles: ['dfir', 'blue-team'], category: 'forensics', description: 'Forensic analysis tooling catalog.', dependencies: [], capabilities: ['evidence analysis'], installed: false, favorite: false },
];

export const workflows: Workflow[] = [
  { id: 'workflow-alert-triage', name: 'Alert Triage', enabled: false, nodes: [
    { id: 'n1', type: 'trigger', label: 'New Alert', config: {} },
    { id: 'n2', type: 'action', label: 'Enrich Asset', config: {} },
    { id: 'n3', type: 'condition', label: 'Severity >= High', config: {} },
    { id: 'n4', type: 'approval', label: 'Analyst Approval', config: {} },
    { id: 'n5', type: 'output', label: 'Create Case', config: {} },
  ], edges: [
    { source: 'n1', target: 'n2' }, { source: 'n2', target: 'n3' }, { source: 'n3', target: 'n4' }, { source: 'n4', target: 'n5' },
  ] },
];
