# Changelog

All notable CYBER-OS platform changes are recorded here by implementation phase.

## [Unreleased] — Alpha 1 Workspace Platform

### Added — Phase 1: Real Workspace Interaction

- Pointer-driven panel dragging in the Layout Designer.
- Pointer-driven bottom-right resize handles.
- Percentage-based snap-to-grid positioning and sizing.
- Bounds and minimum-size enforcement.
- Visual docking zones for top/left/right/bottom workspace edges.
- Explicit panel dock-state controls.
- Panel collapse and restore behavior.
- Profile-specific default workspace layouts.
- Layout Editor mode in the web application shell.
- Save Layout and Reset Layout actions.
- Versioned browser-local saved-layout storage.
- Profile-scoped saved layout identifiers.
- Saved layout duplication/removal/listing APIs for the future workspace manager.
- Detailed Phase 1 architecture documentation.

### Workspace Profiles Covered

- Red Team
- Blue Team
- Purple Team
- DFIR
- DevSecOps
- Threat Intel
- NOC
- Executive
- AI Operations

### Persistence

The Alpha web application uses a browser-local layout adapter under:

`apps/web/src/workspaceLayoutPersistence.ts`

The storage contract is intentionally isolated so a future Electron, SQLite, backend, or synchronized workspace adapter can replace browser storage without changing the Layout Designer interaction model.

### Security

Phase 1 changes only workspace presentation/state. It does not grant plugins, AI workflows, tools, or UI components direct host execution, network, filesystem, or other privileged capabilities.

### Documentation

See:

- `README.md` — project architecture and current Alpha overview.
- `docs/PHASE-1-WORKSPACE-INTERACTION.md` — detailed Phase 1 implementation and interaction model.

## Next

Phase 2 — Multi-Monitor Workspace Manager.
