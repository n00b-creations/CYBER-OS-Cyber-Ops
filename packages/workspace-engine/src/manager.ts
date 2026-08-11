import type { Workspace } from '../../shared/src/domain';
import type { WorkspaceStorage } from './persistence';
import { LayoutController, type LayoutCommand } from './layout';

export class WorkspaceManager {
  private active?: Workspace;
  constructor(private readonly storage: WorkspaceStorage, private readonly layout = new LayoutController()) {}

  async open(id: string): Promise<Workspace | undefined> {
    this.active = await this.storage.load(id);
    return this.active;
  }

  async save(workspace = this.requireActive()): Promise<void> {
    this.active = workspace;
    await this.storage.save(workspace);
  }

  async applyLayout(command: LayoutCommand): Promise<Workspace> {
    const workspace = this.layout.apply(this.requireActive(), command);
    await this.save(workspace);
    return workspace;
  }

  current(): Workspace | undefined { return this.active ? structuredClone(this.active) : undefined; }
  private requireActive(): Workspace { if (!this.active) throw new Error('No active workspace'); return this.active; }
}
