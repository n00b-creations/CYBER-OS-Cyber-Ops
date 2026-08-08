export type WorkspaceProfile =
  | 'red-team'
  | 'blue-team'
  | 'purple-team'
  | 'dfir'
  | 'devsecops'
  | 'threat-intel'
  | 'noc'
  | 'executive'
  | 'ai-ops';

export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';

export interface WorkspaceLayout {
  id: string;
  version: number;
  panels: PanelLayout[];
  monitorId?: string;
}

export interface PanelLayout {
  id: string;
  widgetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dock?: 'left' | 'right' | 'top' | 'bottom' | 'center' | 'floating';
  collapsed?: boolean;
}

export interface WidgetInstance {
  id: string;
  type: string;
  title: string;
  config: Record<string, unknown>;
}

export interface Asset {
  id: string;
  name: string;
  kind: 'host' | 'user' | 'service' | 'container' | 'vm' | 'network-device' | 'cloud-resource';
  status: 'online' | 'offline' | 'degraded' | 'unknown';
  tags: string[];
  metadata: Record<string, string>;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  source: string;
  assetId?: string;
  severity: Severity;
  type: string;
  summary: string;
  metadata: Record<string, unknown>;
}

export interface Alert {
  id: string;
  eventId?: string;
  assetId?: string;
  severity: Severity;
  status: 'new' | 'investigating' | 'contained' | 'resolved';
  title: string;
  techniqueId?: string;
}

export interface ToolDefinition {
  id: string;
  name: string;
  workspaceProfiles: WorkspaceProfile[];
  category: string;
  description: string;
  repository?: string;
  documentation?: string;
  version?: string;
  dependencies: string[];
  capabilities: string[];
  installed: boolean;
  favorite: boolean;
}

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  linkedEntityIds: string[];
  updatedAt: string;
}

export interface CaseRecord {
  id: string;
  title: string;
  status: 'open' | 'investigating' | 'contained' | 'closed';
  severity: Severity;
  assetIds: string[];
  evidenceIds: string[];
}

export interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'approval' | 'output';
  label: string;
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  name: string;
  enabled: boolean;
  nodes: WorkflowNode[];
  edges: Array<{ source: string; target: string }>;
}

export interface Workspace {
  id: string;
  name: string;
  profile: WorkspaceProfile;
  layout: WorkspaceLayout;
  widgets: WidgetInstance[];
  toolIds: string[];
  noteIds: string[];
  workflowIds: string[];
  themeId: string;
}
