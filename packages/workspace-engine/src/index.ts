import type { Workspace, WorkspaceProfile } from '../../shared/src/domain';

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
