import type {
  MonitorDefinition,
  MultiMonitorLayout,
  Workspace,
  WorkspaceProfile,
} from '../../shared/src/domain';

export interface WorkspaceStore {
  get(id: string): Workspace | undefined;
  list(): Workspace[];
  save(workspace: Workspace): void;
}

export class InMemoryWorkspaceStore implements WorkspaceStore {
  private readonly workspaces = new Map<string, Workspace>();

  get(id: string): Workspace | undefined {
    return this.workspaces.get(id);
  }

  list(): Workspace[] {
    return [...this.workspaces.values()];
  }

  save(workspace: Workspace): void {
    this.workspaces.set(workspace.id, workspace);
  }
}

export interface MonitorStore {
  get(id: string): MonitorDefinition | undefined;
  list(): MonitorDefinition[];
  save(monitor: MonitorDefinition): void;
}

export class InMemoryMonitorStore implements MonitorStore {
  private readonly monitors = new Map<string, MonitorDefinition>();

  get(id: string): MonitorDefinition | undefined {
    return this.monitors.get(id);
  }

  list(): MonitorDefinition[] {
    return [...this.monitors.values()];
  }

  save(monitor: MonitorDefinition): void {
    this.monitors.set(monitor.id, monitor);
  }
}

export const PROFILE_MONITOR_LAYOUTS: Record<WorkspaceProfile, string> = {
  'red-team': 'red-mission-triple',
  'blue-team': 'blue-soc-triple',
  'purple-team': 'purple-validation-dual',
  dfir: 'dfir-investigation-triple',
  devsecops: 'devsecops-pipeline-dual',
  'threat-intel': 'threat-intel-correlation-dual',
  noc: 'noc-fleet-triple',
  executive: 'executive-overview-single',
  'ai-ops': 'ai-operations-dual',
};

export const MONITOR_LAYOUT_PRESETS: Record<
  string,
  Omit<MultiMonitorLayout, 'monitors'> & { monitorCount: number }
> = {
  'red-mission-triple': {
    id: 'red-mission-triple',
    name: 'Red Team Mission / Three Monitor',
    monitorCount: 3,
    assignments: [
      { monitorId: 'monitor-1', layoutId: 'red-mission' },
      { monitorId: 'monitor-2', layoutId: 'red-topology' },
      { monitorId: 'monitor-3', layoutId: 'red-findings' },
    ],
  },
  'blue-soc-triple': {
    id: 'blue-soc-triple',
    name: 'Blue Team SOC / Three Monitor',
    monitorCount: 3,
    assignments: [
      { monitorId: 'monitor-1', layoutId: 'blue-soc' },
      { monitorId: 'monitor-2', layoutId: 'blue-topology' },
      { monitorId: 'monitor-3', layoutId: 'blue-investigation' },
    ],
  },
  'purple-validation-dual': {
    id: 'purple-validation-dual',
    name: 'Purple Validation / Dual Monitor',
    monitorCount: 2,
    assignments: [
      { monitorId: 'monitor-1', layoutId: 'purple-validation' },
      { monitorId: 'monitor-2', layoutId: 'purple-coverage' },
    ],
  },
  'dfir-investigation-triple': {
    id: 'dfir-investigation-triple',
    name: 'DFIR Investigation / Three Monitor',
    monitorCount: 3,
    assignments: [
      { monitorId: 'monitor-1', layoutId: 'dfir-case' },
      { monitorId: 'monitor-2', layoutId: 'dfir-evidence' },
      { monitorId: 'monitor-3', layoutId: 'dfir-correlation' },
    ],
  },
  'devsecops-pipeline-dual': {
    id: 'devsecops-pipeline-dual',
    name: 'DevSecOps Pipeline / Dual Monitor',
    monitorCount: 2,
    assignments: [
      { monitorId: 'monitor-1', layoutId: 'devsecops-pipeline' },
      { monitorId: 'monitor-2', layoutId: 'devsecops-findings' },
    ],
  },
  'threat-intel-correlation-dual': {
    id: 'threat-intel-correlation-dual',
    name: 'Threat Intelligence / Dual Monitor',
    monitorCount: 2,
    assignments: [
      { monitorId: 'monitor-1', layoutId: 'intel-correlation' },
      { monitorId: 'monitor-2', layoutId: 'intel-graph' },
    ],
  },
  'noc-fleet-triple': {
    id: 'noc-fleet-triple',
    name: 'NOC Fleet / Three Monitor',
    monitorCount: 3,
    assignments: [
      { monitorId: 'monitor-1', layoutId: 'noc-fleet' },
      { monitorId: 'monitor-2', layoutId: 'noc-topology' },
      { monitorId: 'monitor-3', layoutId: 'noc-incidents' },
    ],
  },
  'executive-overview-single': {
    id: 'executive-overview-single',
    name: 'Executive Overview / Single Monitor',
    monitorCount: 1,
    assignments: [{ monitorId: 'monitor-1', layoutId: 'executive-overview' }],
  },
  'ai-operations-dual': {
    id: 'ai-operations-dual',
    name: 'AI Operations / Dual Monitor',
    monitorCount: 2,
    assignments: [
      { monitorId: 'monitor-1', layoutId: 'ai-workflows' },
      { monitorId: 'monitor-2', layoutId: 'ai-context' },
    ],
  },
};

export class MultiMonitorManager {
  constructor(private readonly monitorStore: MonitorStore) {}

  registerMonitor(monitor: MonitorDefinition): void {
    this.monitorStore.save({ ...monitor });
  }

  monitors(): MonitorDefinition[] {
    return this.monitorStore.list().sort((a, b) => Number(b.primary) - Number(a.primary));
  }

  primary(): MonitorDefinition | undefined {
    return this.monitors().find((monitor) => monitor.primary);
  }

  createLayout(id: string, name: string, assignments: MultiMonitorLayout['assignments']): MultiMonitorLayout {
    const available = new Set(this.monitorStore.list().map((monitor) => monitor.id));
    const validAssignments = assignments.filter((assignment) => available.has(assignment.monitorId));

    return {
      id,
      name,
      monitors: this.monitors(),
      assignments: validAssignments,
    };
  }

  preset(profile: WorkspaceProfile): MultiMonitorLayout {
    const presetId = PROFILE_MONITOR_LAYOUTS[profile];
    const preset = MONITOR_LAYOUT_PRESETS[presetId];
    if (!preset) throw new Error(`No monitor preset for profile: ${profile}`);

    return {
      id: preset.id,
      name: preset.name,
      monitors: this.monitors(),
      assignments: preset.assignments.filter((assignment) =>
        this.monitorStore.get(assignment.monitorId),
      ),
    };
  }
}

export class WorkspaceManager {
  constructor(private readonly store: WorkspaceStore) {}

  activeId?: string;

  create(profile: WorkspaceProfile, name = profile): Workspace {
    const workspace: Workspace = {
      id: crypto.randomUUID(),
      name,
      profile,
      themeId: 'cyber-green',
      layout: { id: `${profile}-default`, version: 1, panels: [] },
      widgets: [],
      toolIds: [],
      noteIds: [],
      workflowIds: [],
    };

    this.store.save(workspace);
    this.activeId = workspace.id;
    return workspace;
  }

  switchTo(id: string): Workspace {
    const workspace = this.store.get(id);
    if (!workspace) throw new Error(`Workspace not found: ${id}`);
    this.activeId = id;
    return workspace;
  }

  active(): Workspace | undefined {
    return this.activeId ? this.store.get(this.activeId) : undefined;
  }
}
