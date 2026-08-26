import type { ToolDefinition } from '../../shared/src/domain';

export type DependencyIssueKind = 'missing' | 'cycle';

export interface DependencyIssue {
  kind: DependencyIssueKind;
  toolId: string;
  dependencyId: string;
  path: string[];
}

export interface DependencyResolution {
  rootId: string;
  order: ToolDefinition[];
  issues: DependencyIssue[];
  complete: boolean;
}

export class DependencyResolver {
  constructor(private readonly registry: Pick<ToolRegistryLike, 'get'>) {}

  resolve(rootId: string): DependencyResolution {
    const order: ToolDefinition[] = [];
    const issues: DependencyIssue[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (toolId: string, path: string[]): void => {
      if (visiting.has(toolId)) {
        issues.push({ kind: 'cycle', toolId: path[path.length - 1] ?? toolId, dependencyId: toolId, path: [...path, toolId] });
        return;
      }
      if (visited.has(toolId)) return;

      const tool = this.registry.get(toolId);
      if (!tool) {
        const parent = path[path.length - 1] ?? rootId;
        issues.push({ kind: 'missing', toolId: parent, dependencyId: toolId, path: [...path, toolId] });
        return;
      }

      visiting.add(toolId);
      for (const dependencyId of tool.dependencies) visit(dependencyId, [...path, toolId]);
      visiting.delete(toolId);
      visited.add(toolId);
      order.push(tool);
    };

    visit(rootId, []);
    return { rootId, order, issues, complete: issues.length === 0 };
  }
}

interface ToolRegistryLike {
  get(id: string): ToolDefinition | undefined;
}
