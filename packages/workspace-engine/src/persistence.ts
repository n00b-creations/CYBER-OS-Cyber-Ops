import type { Workspace } from '../../shared/src/domain';

export interface WorkspaceStorage {
  load(id: string): Promise<Workspace | undefined>;
  save(workspace: Workspace): Promise<void>;
  remove(id: string): Promise<void>;
  list(): Promise<string[]>;
}

export class MemoryWorkspaceStorage implements WorkspaceStorage {
  private readonly records = new Map<string, Workspace>();

  async load(id: string): Promise<Workspace | undefined> {
    const workspace = this.records.get(id);
    return workspace ? structuredClone(workspace) : undefined;
  }

  async save(workspace: Workspace): Promise<void> {
    this.records.set(workspace.id, structuredClone(workspace));
  }

  async remove(id: string): Promise<void> {
    this.records.delete(id);
  }

  async list(): Promise<string[]> {
    return [...this.records.keys()];
  }
}
