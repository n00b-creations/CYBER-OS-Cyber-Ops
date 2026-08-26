import type { ToolDefinition, WorkspaceProfile } from '../../shared/src/domain';
import { DependencyResolver, type DependencyResolution } from './dependency-resolver';

export interface ToolRegistry {
  register(tool: ToolDefinition): void;
  get(id: string): ToolDefinition | undefined;
  list(profile?: WorkspaceProfile): ToolDefinition[];
  search(query: string, profile?: WorkspaceProfile): ToolDefinition[];
  byCapability(capability: string, profile?: WorkspaceProfile): ToolDefinition[];
  resolveDependencies(id: string): DependencyResolution;
}

export class InMemoryToolRegistry implements ToolRegistry {
  private readonly tools = new Map<string, ToolDefinition>();
  private readonly resolver = new DependencyResolver(this);

  register(tool: ToolDefinition): void {
    this.tools.set(tool.id, structuredClone(tool));
  }

  get(id: string): ToolDefinition | undefined {
    const tool = this.tools.get(id);
    return tool ? structuredClone(tool) : undefined;
  }

  list(profile?: WorkspaceProfile): ToolDefinition[] {
    const tools = [...this.tools.values()];
    return (profile ? tools.filter((tool) => tool.workspaceProfiles.includes(profile)) : tools)
      .map((tool) => structuredClone(tool));
  }

  search(query: string, profile?: WorkspaceProfile): ToolDefinition[] {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return this.list(profile);
    return this.list(profile).filter((tool) =>
      [tool.id, tool.name, tool.category, tool.description, ...tool.capabilities]
        .some((value) => value.toLowerCase().includes(normalized))
    );
  }

  byCapability(capability: string, profile?: WorkspaceProfile): ToolDefinition[] {
    const normalized = capability.trim().toLowerCase();
    return this.list(profile).filter((tool) => tool.capabilities.some((value) => value.toLowerCase() === normalized));
  }

  resolveDependencies(id: string): DependencyResolution {
    return this.resolver.resolve(id);
  }
}

export { DependencyResolver } from './dependency-resolver';
export type { DependencyIssue, DependencyIssueKind, DependencyResolution } from './dependency-resolver';
