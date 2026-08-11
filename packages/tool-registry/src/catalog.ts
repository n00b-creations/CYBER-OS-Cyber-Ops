import type { ToolDefinition, WorkspaceProfile } from '../../shared/src/domain';

export interface ToolSource { id: string; name: string; repository?: string; sourceType: 'builtin' | 'github' | 'local'; }

export interface CatalogEntry extends ToolDefinition {
  source: ToolSource;
  documentation?: string;
  tags?: string[];
}

export class ToolCatalog {
  private readonly entries = new Map<string, CatalogEntry>();

  upsert(entry: CatalogEntry): void { this.entries.set(entry.id, structuredClone(entry)); }
  get(id: string): CatalogEntry | undefined { const entry = this.entries.get(id); return entry ? structuredClone(entry) : undefined; }
  list(profile?: WorkspaceProfile): CatalogEntry[] {
    return [...this.entries.values()]
      .filter((entry) => !profile || entry.workspaceProfiles.includes(profile))
      .map((entry) => structuredClone(entry));
  }
  dependencies(id: string): CatalogEntry[] {
    const root = this.entries.get(id);
    if (!root) return [];
    return root.dependencies.map((dependency) => this.entries.get(dependency)).filter((entry): entry is CatalogEntry => Boolean(entry)).map((entry) => structuredClone(entry));
  }
}
