import type { LayoutPanel } from './components/LayoutDesigner';

const PREFIX = 'cyber-os:layout:';

export interface SavedLayout {
  id: string;
  name: string;
  profile: string;
  version: 1;
  panels: LayoutPanel[];
  savedAt: string;
}

function key(profile: string, id: string) {
  return `${PREFIX}${profile}:${id}`;
}

function storageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function saveLayout(layout: SavedLayout): void {
  if (!storageAvailable()) return;
  window.localStorage.setItem(key(layout.profile, layout.id), JSON.stringify(layout));
}

export function loadLayout(profile: string, id: string): SavedLayout | undefined {
  if (!storageAvailable()) return undefined;
  const raw = window.localStorage.getItem(key(profile, id));
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as SavedLayout;
    if (parsed.version !== 1 || !Array.isArray(parsed.panels)) return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

export function duplicateLayout(profile: string, sourceId: string, targetId: string, targetName: string): SavedLayout | undefined {
  const source = loadLayout(profile, sourceId);
  if (!source) return undefined;
  const copy: SavedLayout = {
    ...source,
    id: targetId,
    name: targetName,
    panels: source.panels.map((panel) => ({ ...panel })),
    savedAt: new Date().toISOString(),
  };
  saveLayout(copy);
  return copy;
}

export function removeLayout(profile: string, id: string): void {
  if (!storageAvailable()) return;
  window.localStorage.removeItem(key(profile, id));
}

export function listLayouts(profile: string): SavedLayout[] {
  if (!storageAvailable()) return [];
  const layouts: SavedLayout[] = [];
  const prefix = `${PREFIX}${profile}:`;
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const storageKey = window.localStorage.key(index);
    if (!storageKey?.startsWith(prefix)) continue;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(storageKey) ?? '') as SavedLayout;
      if (parsed.version === 1 && Array.isArray(parsed.panels)) layouts.push(parsed);
    } catch {
      // Ignore malformed user-local state rather than breaking the workspace.
    }
  }
  return layouts.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}
