import type { ExtendedPluginManifest, PluginDependency, PluginValidationResult } from './manifest';
import { validateManifest } from './manifest';
import type { PluginCapability } from './permissions';
import { evaluateCapabilities, summarizeDecision, type CapabilityDecisionResult, type CapabilityDecision } from './policy';

export type AdmissionStatus = 'admit' | 'approval_required' | 'deny';

export interface DependencyCheckResult {
  dependency: PluginDependency;
  satisfied: boolean;
  reason: string;
}

export interface PluginAdmissionResult {
  status: AdmissionStatus;
  manifest: PluginValidationResult;
  capabilities: CapabilityDecisionResult[];
  dependencies: DependencyCheckResult[];
  errors: string[];
  warnings: string[];
}

export interface PluginDependencyResolver {
  resolve(id: string, versionRange: string): boolean;
}

const defaultResolver: PluginDependencyResolver = {
  resolve: () => true,
};

function mapDecision(decision: CapabilityDecision): AdmissionStatus {
  if (decision === 'deny') return 'deny';
  if (decision === 'approval_required') return 'approval_required';
  return 'admit';
}

export function evaluatePluginAdmission(
  manifest: ExtendedPluginManifest,
  resolver: PluginDependencyResolver = defaultResolver,
): PluginAdmissionResult {
  const manifestResult = validateManifest(manifest);
  const capabilities = evaluateCapabilities(manifest.capabilities as PluginCapability[]);
  const dependencies = (manifest.dependencies ?? []).map((dependency) => {
    const satisfied = resolver.resolve(dependency.id, dependency.versionRange);
    return {
      dependency,
      satisfied,
      reason: satisfied ? 'Dependency requirement is satisfied.' : `Dependency ${dependency.id}@${dependency.versionRange} is unavailable.`,
    };
  });

  const errors = [...manifestResult.errors];
  const warnings = [...manifestResult.warnings];
  for (const check of dependencies) {
    if (!check.satisfied && !check.dependency.optional) errors.push(check.reason);
    if (!check.satisfied && check.dependency.optional) warnings.push(`Optional dependency unavailable: ${check.dependency.id}@${check.dependency.versionRange}`);
  }

  const dependencyBlocked = dependencies.some((check) => !check.satisfied && !check.dependency.optional);
  const capabilityDecision = summarizeDecision(capabilities);
  const status: AdmissionStatus = !manifestResult.valid || dependencyBlocked
    ? 'deny'
    : mapDecision(capabilityDecision);

  return { status, manifest: manifestResult, capabilities, dependencies, errors, warnings };
}
