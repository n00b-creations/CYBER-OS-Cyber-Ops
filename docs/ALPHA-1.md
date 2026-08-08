# Alpha 1 Implementation Checklist

## Platform

- [x] Repository initialized
- [x] Shared domain contracts
- [x] Workspace profile definitions
- [x] Workspace state manager
- [x] Tool Registry contract
- [x] Plugin permission boundary
- [x] Operations service contracts
- [x] Safe mock operations dataset
- [x] Dockable/resizable widget engine contract
- [x] Interactive graph engine contract
- [x] Filtered event timeline engine
- [x] Governed AI workspace-context contract
- [ ] Persistent storage adapter
- [ ] Desktop shell
- [ ] Web UI shell
- [ ] Visual widget components

## Workspaces

- [x] Red Team contract
- [x] Blue Team contract
- [x] Purple Team contract
- [x] DFIR contract
- [x] DevSecOps contract
- [x] Threat Intel contract
- [x] NOC contract
- [x] Executive contract
- [x] AI Operations contract

## Operations

- [ ] Asset service implementation
- [ ] Event service implementation
- [ ] Alert service implementation
- [ ] Case service implementation
- [x] Timeline query contract
- [x] Graph selection/neighbor contract
- [ ] Tool metadata importers
- [ ] Notes service

## AI

- [x] Context provider contract
- [ ] Copilot interface
- [ ] Workflow editor
- [ ] Provider adapters
- [ ] Agent permission/approval UI

## Safety / reliability

- [ ] Unit tests
- [ ] Type checking
- [ ] Integration tests
- [ ] Audit events
- [ ] Capability approval UI
- [ ] Secure defaults

## Next build slice

1. Create the desktop/web application shell.
2. Mount WorkspaceManager + WidgetEngine into the UI.
3. Render Red/Blue/Purple/DFIR views from profile definitions.
4. Connect mock assets/events/alerts/cases/tools.
5. Add selectable asset/alert/graph/timeline drawers.
6. Add layout persistence and theme state.
7. Add tests for workspace, widgets, graph, timeline, and AI context.
