import type { ToolDefinition, WorkspaceProfile } from '../../shared/src/domain';

export interface ToolRegistry {
  register(tool: ToolDefinition): void;
  get(id: string): ToolDefinition | undefined;
  list(profile?: WorkspaceProfile): ToolDefinition[];
}

export class InMemoryToolRegistry implements ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    this.tools.set(tool.id, tool);
  }

  get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  list(profile?: WorkspaceProfile): ToolDefinition[] {
    const tools = [...this.tools.values()];
    return profile ? tools.filter((tool) => tool.workspaceProfiles.includes(profile)) : tools;
  }
}
