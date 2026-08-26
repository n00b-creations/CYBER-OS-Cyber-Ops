# Phase 4 — Plugin Security Control Plane

## Objective

Phase 4 establishes the security boundary between the CYBER-OS Tool Registry / plugin metadata and any future privileged execution adapters.

The control plane is intentionally metadata-first. Registering a plugin does not grant it host execution, filesystem access, network access, or other privileged authority.

## Control flow

```text
Plugin Manifest
      ↓
Manifest Validation
      ↓
Dependency Validation
      ↓
Capability Policy
      ↓
Admission Decision
   ┌──┼─────────────┐
   ▼  ▼             ▼
 ADMIT APPROVAL    DENY
       REQUIRED
          ↓
   Human/Policy Approval
          ↓
   Controlled Adapter
          ↓
        Result
          ↓
        Audit
```

## Capability policy

The default policy classifies capabilities by risk:

| Capability | Risk | Default |
|---|---|---|
| `assets.read` | low | allow |
| `events.read` | low | allow |
| `alerts.read` | low | allow |
| `cases.read` | low | allow |
| `notes.read` | low | allow |
| `notes.write` | moderate | approval required |
| `tools.read` | low | allow |
| `workspace.read` | low | allow |
| `workspace.write` | moderate | approval required |
| `terminal.request` | critical | deny |
| `network.request` | high | approval required |
| `filesystem.request` | high | approval required |

These defaults are deliberately conservative. They are policy decisions for the Alpha control plane, not an execution mechanism.

## Admission

`evaluatePluginAdmission()` combines:

1. Manifest validation.
2. Capability policy evaluation.
3. Dependency validation.
4. Optional-dependency handling.
5. Aggregate admission status.

Possible results:

- `admit` — manifest/dependencies are valid and all requested capabilities are allowed by default.
- `approval_required` — manifest/dependencies are valid but one or more capabilities require explicit authorization.
- `deny` — manifest validation fails, a required dependency is unavailable, or a capability is denied by policy.

## Dependency resolver contract

The admission layer accepts a `PluginDependencyResolver` interface rather than installing or resolving packages itself. This keeps dependency inspection separate from package management and prevents plugin admission from becoming an implicit installer.

## Audit

The audit contract now includes:

- `plugin.request`
- `plugin.approve`
- `plugin.deny`

The Phase 4 policy layer does not silently execute a denied or approval-required capability. A later approval service should record the actor, decision, timestamp, plugin ID, and requested capabilities before any controlled adapter is invoked.

## Security boundary

The plugin SDK remains a policy and validation layer. It does not expose shell execution, arbitrary network clients, filesystem APIs, or package installation APIs.

Future privileged integrations must be implemented behind explicit adapters and must consume the admission/approval result before performing an operation.

## Next implementation slice

Phase 4 UI integration will provide:

- Plugin admission status panel.
- Capability risk badges.
- Approval/deny controls.
- Dependency problems.
- Decision history.
- Audit event display.
- Persisted approval state.

The approval UI should not directly execute plugin code; it should update policy state that a separate runtime adapter can consume.
