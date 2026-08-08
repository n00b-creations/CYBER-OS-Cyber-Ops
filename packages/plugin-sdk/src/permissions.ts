export const pluginCapabilities = [
  'assets.read',
  'events.read',
  'alerts.read',
  'cases.read',
  'notes.read',
  'notes.write',
  'tools.read',
  'workspace.read',
  'workspace.write',
  'terminal.request',
  'network.request',
  'filesystem.request',
] as const;

export type PluginCapability = (typeof pluginCapabilities)[number];

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  capabilities: PluginCapability[];
  workspaceProfiles?: string[];
}

export function validatePluginCapabilities(manifest: PluginManifest): string[] {
  const allowed = new Set<string>(pluginCapabilities);
  return manifest.capabilities.filter((capability) => !allowed.has(capability));
}
