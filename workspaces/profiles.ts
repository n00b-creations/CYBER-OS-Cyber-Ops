import type { WorkspaceProfile } from '../packages/shared/src/domain';

export interface WorkspaceProfileDefinition {
  id: WorkspaceProfile;
  label: string;
  description: string;
  defaultWidgets: string[];
  toolCategories: string[];
}

export const workspaceProfiles: WorkspaceProfileDefinition[] = [
  {
    id: 'red-team',
    label: 'Red Team',
    description: 'Authorized assessment mission control and evidence workspace.',
    defaultWidgets: ['mission-overview', 'asset-scope', 'attack-graph', 'terminal-grid', 'findings'],
    toolCategories: ['recon', 'assessment', 'infrastructure', 'reporting'],
  },
  {
    id: 'blue-team',
    label: 'Blue Team',
    description: 'SOC monitoring, detection, hunting, cases, and response.',
    defaultWidgets: ['soc-overview', 'alert-stream', 'endpoint-health', 'network-activity', 'cases'],
    toolCategories: ['detection', 'monitoring', 'dfir', 'incident-response'],
  },
  {
    id: 'purple-team',
    label: 'Purple Team',
    description: 'Control validation and attack-versus-detection correlation.',
    defaultWidgets: ['attack-detection-matrix', 'attack-path', 'detection-gaps', 'retest-queue'],
    toolCategories: ['emulation', 'detection-engineering', 'validation'],
  },
  {
    id: 'dfir',
    label: 'DFIR',
    description: 'Case-centric forensic investigation and evidence management.',
    defaultWidgets: ['case-overview', 'evidence-locker', 'investigation-timeline', 'artifact-browser'],
    toolCategories: ['forensics', 'incident-response', 'evidence'],
  },
  {
    id: 'devsecops',
    label: 'DevSecOps',
    description: 'Secure software delivery and infrastructure visibility.',
    defaultWidgets: ['pipeline-status', 'dependency-health', 'container-inventory', 'iac-findings'],
    toolCategories: ['sast', 'sca', 'secrets', 'containers', 'iac'],
  },
  {
    id: 'threat-intel',
    label: 'Threat Intel',
    description: 'Indicators, campaigns, ATT&CK knowledge, and intelligence analysis.',
    defaultWidgets: ['intel-overview', 'ioc-table', 'campaign-map', 'attack-navigator'],
    toolCategories: ['osint', 'ioc', 'attck', 'feeds'],
  },
  {
    id: 'noc',
    label: 'NOC',
    description: 'Infrastructure and network operations monitoring.',
    defaultWidgets: ['network-topology', 'device-health', 'bandwidth', 'service-status'],
    toolCategories: ['network', 'monitoring', 'infrastructure'],
  },
  {
    id: 'executive',
    label: 'Executive',
    description: 'High-level security posture, risk, and operational reporting.',
    defaultWidgets: ['posture-score', 'risk-heatmap', 'incident-trends', 'compliance'],
    toolCategories: ['reporting', 'risk', 'compliance'],
  },
  {
    id: 'ai-ops',
    label: 'AI Operations',
    description: 'AI context, workflow automation, and governed agent operations.',
    defaultWidgets: ['copilot', 'workflow-builder', 'agent-status', 'task-queue'],
    toolCategories: ['ai', 'automation', 'workflow'],
  },
];
