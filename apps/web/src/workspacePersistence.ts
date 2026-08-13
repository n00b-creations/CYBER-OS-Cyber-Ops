import type { Workspace } from '../../../packages/shared/src/domain';

const PREFIX = 'cyber-os:workspace:';

export function saveWorkspace(workspace: Workspace): void {
  localStorage.setItem(`${PREFIX}${workspace.id}`, JSON.stringify(workspace));
}

export function loadWorkspace(id: string): Workspace | undefined {
  const raw = localStorage.getItem(`${PREFIX}${id}`);
  if (!raw) return undefined;
  try { return JSON.parse(raw) as Workspace; } catch { return undefined; }
}

export function listSavedWorkspaces(): string[] {
  const ids: string[] = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key?.startsWith(PREFIX)) ids.push(key.slice(PREFIX.length));
  }
  return ids.sort();
}
