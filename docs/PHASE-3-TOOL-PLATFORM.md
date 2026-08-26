# Phase 3 — Unified Tool Platform

## Objective

Phase 3 establishes the Tool Registry as the canonical metadata layer for security tools across CYBER-OS workspace profiles. A tool has one identity and can be associated with multiple profiles instead of being duplicated in Red Team, Blue Team, Purple Team, DFIR, or other menus.

## Current implementation

The `packages/tool-registry` package now provides:

- `ToolRegistry` contract
- `InMemoryToolRegistry`
- profile-aware listing
- case-insensitive tool search
- capability filtering
- defensive cloning of registered definitions
- dependency resolution
- missing-dependency detection
- dependency-cycle detection

The shared `ToolDefinition` contract contains identity, description, category, workspace associations, dependencies, capabilities, installation state, favorites, repository metadata, and documentation metadata.

## Registry model

```text
ToolDefinition
├── id
├── name
├── category
├── description
├── version
├── repository
├── documentation
├── workspaceProfiles[]
├── capabilities[]
├── dependencies[]
├── installed
└── favorite
```

The catalog layer adds source metadata and tags.

## Workspace associations

The same canonical tool can be associated with multiple profiles. This avoids duplicate definitions and keeps dependencies consistent across workspaces.

```text
                    Tool
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
       Red Team   Blue Team  Purple Team
          │          │          │
     Assessment  Detection   Validation
```

## Search and filtering

The registry supports search by ID, name, category, description, and capability, plus profile filtering and exact capability filtering. An empty search returns the same profile-filtered catalog as `list()`.

## Dependency resolution

`DependencyResolver` traverses dependencies depth-first and returns a dependency-first order suitable for validation and planning. It reports missing dependencies, dependency cycles, traversal paths, and completion state. The resolver only evaluates metadata; it does not install or execute tools.

## Security boundary

The Tool Registry is metadata-only. Registering a tool does not grant execution privileges.

```text
Tool Registry
     ↓
Capability Requirements
     ↓
Policy / Approval
     ↓
Execution Adapter
     ↓
Result
     ↓
Audit
```

Privileged host, filesystem, network, VM/lab, and external-service operations remain outside the registry itself.

## Red / Blue / Purple integration

Red-oriented tools can be classified by authorized assessment capabilities. Blue-oriented tools can be classified by monitoring, detection, triage, hunting, response, and investigation capabilities. Purple-oriented workspaces can consume shared tools where capabilities support controlled validation and coverage analysis.

The registry remains source-neutral. Distribution-specific menus and package managers belong behind adapters and catalog metadata rather than being embedded in workspace components.

## Next implementation slice

1. Tool Registry UI
2. Tool detail drawer
3. Profile/category/capability filters
4. Dependency graph visualization
5. Installation/availability state adapters
6. Plugin manifest → tool dependency linkage
7. Capability approval integration
8. Audit events for registry changes and privileged requests
9. Contract tests for registry/search/dependency behavior

## Non-goals

Phase 3 does not implement unrestricted command execution, automated exploitation, malware execution, or implicit host privilege. Execution belongs behind explicit adapters and authorization boundaries in later platform layers.
