import type { PluginCapability, PluginManifest } from './permissions';

export interface PluginDependency { id: string; versionRange: string; optional?: boolean; }

export interface ExtendedPluginManifest extends PluginManifest {
  dependencies?: PluginDependency[];
  entrypoint: string;
  description?: string;
}

export interface PluginValidationResult { valid: boolean; errors: string[]; warnings: string[]; }

export function validateManifest(manifest: ExtendedPluginManifest): PluginValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const known = new Set<PluginCapability>(['assets.read','events.read','alerts.read','cases.read','notes.read','notes.write','tools.read','workspace.read','workspace.write','terminal.request','network.request','filesystem.request']);
  if (!manifest.id || !manifest.name || !manifest.version || !manifest.entrypoint) errors.push('id, name, version, and entrypoint are required');
  for (const capability of manifest.capabilities) if (!known.has(capability)) errors.push(`unsupported capability: ${capability}`);
  for (const dependency of manifest.dependencies ?? []) if (!dependency.id || !dependency.versionRange) errors.push('plugin dependency requires id and versionRange');
  if (manifest.capabilities.some((capability) => capability.endsWith('.request'))) warnings.push('Plugin requests host/network/filesystem capability and requires explicit approval.');
  return { valid: errors.length === 0, errors, warnings };
}
