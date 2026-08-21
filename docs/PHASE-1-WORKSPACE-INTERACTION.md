# Phase 1 — Real Workspace Interaction

## Status

**Alpha 1 — implemented in the web workspace editor.**

Phase 1 turns the previously declarative layout model into an interactive workspace-editing surface. The implementation is intentionally UI-first and uses browser-local persistence so layout behavior can be exercised without introducing a server-side state dependency.

## Objectives

Phase 1 establishes the substrate required for a Figma-style CYBER-OS desktop workspace:

1. Pointer-driven panel movement.
2. Pointer-driven panel resizing.
3. Snap-to-grid positioning and sizing.
4. Dock-zone affordances.
5. Panel collapse and restoration.
6. Workspace-profile-specific default layouts.
7. Saved layout state per workspace profile.
8. Reset-to-profile-default behavior.
9. Layout-editor mode separate from the normal operational workspace.
10. A storage contract that can later be replaced by desktop/server persistence.

## Interaction Model

```text
Pointer Down
     │
     ├── Header → DRAG
     │
     └── Resize Handle → RESIZE
             │
             ▼
       Pointer Movement
             │
             ▼
        Canvas Delta
             │
             ▼
         Snap to Grid
             │
             ▼
     Bounds / Minimum Size
             │
             ▼
       Workspace State
             │
             ▼
          React UI
             │
             ▼
       Save Layout
```

## Dragging

Panels expose a dedicated header as the drag surface. Pointer capture is used so movement remains stable while the pointer leaves the immediate header element.

The layout engine converts pointer movement into percentage coordinates relative to the workspace canvas. Coordinates are snapped to a configurable grid and constrained so panels cannot be moved beyond the usable canvas bounds.

### Current behavior

- Dragging begins from a panel header.
- The current panel state is captured at pointer-down.
- Pointer deltas are calculated against the layout canvas.
- X/Y coordinates are snapped to the grid.
- X/Y coordinates are bounded.
- State changes are emitted through the component callback.

## Resizing

Each expanded panel exposes a bottom-right resize handle.

```text
┌──────────────────────────────┐
│ PANEL HEADER                 │
├──────────────────────────────┤
│                              │
│         PANEL CONTENT        │
│                              │
│                         ╲    │
│                          ╲   │ ← resize handle
└──────────────────────────────┘
```

The resize operation:

- Captures the panel dimensions at pointer-down.
- Converts pointer deltas into canvas-relative percentages.
- Snaps width and height to the same layout grid.
- Enforces minimum dimensions.
- Enforces maximum dimensions.
- Emits the resulting layout state.

## Snap-to-Grid

The current editor uses a small percentage-based grid so layouts remain portable across browser viewport sizes. The grid is an interaction aid and not a fixed-pixel desktop coordinate system.

This distinction is important for future multi-monitor support: a workspace layout can be transformed for a target monitor rather than storing absolute screen coordinates.

## Dock Zones

The editor exposes visual docking zones at the top, left, right, and bottom edges of the workspace canvas.

The current Alpha implementation represents docking as explicit layout metadata and provides controls for assigning a panel to a dock. The visual zones are the first step toward pointer-based docking; automatic drop-to-zone commits are the next refinement.

Supported dock states currently include:

- `left`
- `right`
- `center`
- `bottom`

The shared domain model also supports top/floating states for future layout expansion.

## Collapse / Restore

Panels can be collapsed to a compact header state without deleting their layout information. Expanding restores the panel's prior position and dimensions.

This is intended for high-density operational workspaces where a user may temporarily remove a panel from visual focus without losing its workspace placement.

## Workspace Profiles

The application now associates a default layout with each supported profile:

- Red Team
- Blue Team
- Purple Team
- DFIR
- DevSecOps
- Threat Intel
- NOC
- Executive
- AI Operations

Each profile has a different starting arrangement based on its operational role.

Examples:

### Blue Team

- Alert Stream
- Endpoint Health
- Network Activity
- Cases

### DFIR

- Investigation Timeline
- Case Queue
- Affected Assets
- Evidence Locker

### AI Operations

- AI Context
- Workflow Builder
- Approval & Audit

## Persistence

The browser layout adapter stores a versioned `SavedLayout` object in `localStorage`.

```text
cyber-os:layout:<profile>:<layout-id>
```

A saved layout contains:

- layout ID
- display name
- workspace profile
- schema version
- panel definitions
- save timestamp

The storage implementation is deliberately isolated from the layout editor so it can later be replaced with:

- Electron local storage
- SQLite
- a CYBER-OS backend
- synchronized workspace storage
- encrypted user profiles

without changing the panel interaction model.

## Save / Reset Behavior

### Save

The active layout is serialized and stored under the current workspace profile.

### Reset

Reset replaces the active editor state with the profile's built-in default layout. Reset does not automatically destroy the saved layout, which provides a safer recovery path during Alpha development.

### Restore

When a workspace profile is selected, the editor first checks for a saved `default` layout for that profile. If none exists, the built-in profile layout is loaded.

## Current UI Flow

```text
CYBER-OS
   │
   ▼
Workspace Profile Switcher
   │
   ▼
Profile Selection
   │
   ├───────────────┐
   ▼               ▼
Saved Layout    Default Layout
   │               │
   └───────┬───────┘
           ▼
     Workspace Canvas
           │
      Layout Editor
           │
     ┌─────┼─────┐
     ▼     ▼     ▼
    Drag Resize Dock
     │     │     │
     └─────┼─────┘
           ▼
      Updated State
           │
           ▼
       Save Layout
```

## Files

Primary Phase 1 implementation files:

- `apps/web/src/App.tsx` — profile/layout integration and editor mode.
- `apps/web/src/components/LayoutDesigner.tsx` — pointer drag, resize, docking metadata, collapse behavior.
- `apps/web/src/workspaceLayoutPersistence.ts` — browser saved-layout adapter.
- `apps/web/src/styles.css` — editor grid, panel chrome, handles, and docking affordances.
- `packages/shared/src/domain.ts` — shared workspace/panel layout contracts.

## Deliberate Alpha Limitations

The following are intentionally not treated as complete Phase 1 features yet:

- Automatic pointer-drop docking into a zone.
- Collision resolution between overlapping panels.
- Multi-monitor runtime enumeration.
- Cross-device synchronization.
- Server-side workspace persistence.
- Undo/redo history.
- Keyboard-only layout editing.
- Touch-specific gesture handling.
- Pixel-perfect monitor calibration.

These belong to the next workspace integration passes.

## Security Boundary

The layout editor changes UI/workspace state only. It does not execute shell commands, security tools, plugins, or host capabilities.

Privileged plugin and tool operations remain behind the separate capability approval and adapter architecture.

## Next Phase

Phase 2 will make the monitor model operational:

1. Define monitor profiles.
2. Assign layouts to monitors.
3. Add monitor-aware workspace presets.
4. Introduce display metadata.
5. Add multi-monitor validation.
6. Preserve portable layouts when monitor topology changes.
7. Add a monitor-layout selector to the workspace shell.

Phase 2 will build directly on the Phase 1 layout state rather than creating a second layout system.
