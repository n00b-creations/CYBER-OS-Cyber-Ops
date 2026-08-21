# Phase 2 — Multi-Monitor Workspace Manager

## Status

Phase 2 establishes the domain model and workspace-engine primitives required for monitor-aware CYBER-OS workspaces.

## Goals

The multi-monitor system is designed to make monitor assignments part of workspace state rather than treating multiple displays as a visual-only feature.

A workspace profile can select a monitor preset. The preset maps individual monitors to purpose-specific layouts, while the same underlying workspace, asset, event, alert, case, tool, and workflow models remain shared.

## Domain model

### MonitorDefinition

Each display is represented by:

- `id` — stable monitor identifier
- `name` — human-readable label
- `width` — native pixel width
- `height` — native pixel height
- `scale` — display scale factor
- `primary` — whether the display is the primary monitor
- `x` / `y` — display position in the virtual desktop coordinate space

### MonitorAssignment

An assignment connects a monitor to a workspace layout:

```text
monitor-1 → blue-soc
monitor-2 → blue-topology
monitor-3 → blue-investigation
```

### MultiMonitorLayout

A multi-monitor layout contains:

- layout identity
- display definitions
- monitor-to-layout assignments

The model intentionally keeps the layout independent from physical display discovery so that saved profiles can be restored when hardware changes.

## Profile presets

The current workspace profiles have initial monitor presets:

| Profile | Preset | Displays | Purpose |
|---|---|---:|---|
| Red Team | Red Mission | 3 | Mission view, topology, findings |
| Blue Team | Blue SOC | 3 | SOC, topology/fleet, investigation |
| Purple Team | Purple Validation | 2 | Validation, coverage |
| DFIR | DFIR Investigation | 3 | Case, evidence, correlation |
| DevSecOps | DevSecOps Pipeline | 2 | Pipeline, findings |
| Threat Intel | Intel Correlation | 2 | Correlation, graph |
| NOC | NOC Fleet | 3 | Fleet, topology, incidents |
| Executive | Executive Overview | 1 | High-level overview |
| AI Ops | AI Operations | 2 | Workflow, AI context |

These are application presets, not claims about a physical user's attached displays.

## Runtime behavior

`MultiMonitorManager` currently provides:

- monitor registration
- monitor enumeration
- primary-monitor lookup
- arbitrary layout construction
- profile-based preset resolution
- validation of assignments against known monitors

The manager uses a `MonitorStore` abstraction, allowing the current in-memory implementation to be replaced later by Electron display APIs or another host integration without changing the domain contracts.

## Intended runtime flow

```text
Physical displays / host adapter
              ↓
       MonitorDefinition
              ↓
      MonitorStore
              ↓
     MultiMonitorManager
              ↓
       Profile preset
              ↓
       MonitorAssignment
              ↓
       WorkspaceManager
              ↓
          Layout UI
```

## Blue Team example

```text
Monitor 1
  └── blue-soc
      ├── alert stream
      ├── cases
      └── endpoint health

Monitor 2
  └── blue-topology
      ├── network topology
      ├── fleet
      └── asset inventory

Monitor 3
  └── blue-investigation
      ├── timeline
      ├── event correlation
      └── investigation drawer
```

## DFIR example

```text
Monitor 1 → dfir-case
Monitor 2 → dfir-evidence
Monitor 3 → dfir-correlation
```

The purpose is to separate investigation concerns without duplicating the underlying evidence, asset, and event data.

## Persistence strategy

Phase 2 defines the runtime contracts but does not claim operating-system display persistence. Saved workspace state can reference a monitor layout by ID. A future host adapter will reconcile saved monitor IDs with the displays currently available.

When a saved layout references an unavailable display, the expected behavior is graceful reassignment to an available monitor rather than failure of the entire workspace.

## Next implementation steps

1. Add host-level monitor discovery.
2. Add a monitor-layout selector to the workspace UI.
3. Render monitor assignment previews.
4. Reconcile saved layouts with changing display IDs.
5. Add drag-and-drop monitor assignment.
6. Add monitor-aware panel drag boundaries.
7. Add persistence for monitor presets.
8. Add tests for missing, reordered, and differently scaled monitors.
9. Connect multi-monitor state to the profile switcher.
10. Document the final behavior in the main README and changelog.

## Security and reliability boundary

Monitor management is a workspace/UI capability. It does not grant plugins terminal, filesystem, network, or other privileged capabilities. Plugin execution remains behind the existing manifest, dependency, capability, approval, and audit architecture.
