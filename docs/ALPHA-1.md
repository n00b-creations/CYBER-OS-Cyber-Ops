# Alpha 1 Implementation Checklist

## Platform

- [x] Repository initialized
- [x] Shared domain contracts
- [x] Workspace profile definitions
- [x] Workspace state manager
- [x] Tool Registry contract
- [x] Plugin permission boundary
- [ ] Persistent storage adapter
- [ ] Desktop shell
- [ ] Web UI shell
- [ ] Widget/docking engine

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

- [ ] Asset service
- [ ] Event service
- [ ] Alert service
- [ ] Case service
- [ ] Timeline service
- [ ] Graph service
- [ ] Tool metadata importers
- [ ] Notes service

## AI

- [ ] Context provider
- [ ] Copilot interface
- [ ] Workflow editor
- [ ] Provider adapters
- [ ] Agent permission model

## Safety / reliability

- [ ] Unit tests
- [ ] Type checking
- [ ] Integration tests
- [ ] Audit events
- [ ] Capability approval UI
- [ ] Secure defaults

## Integration order

1. Finish application/package scaffolding.
2. Add persistent workspace storage.
3. Build the desktop shell and docking engine.
4. Build shared mock services for assets/events/alerts/cases/tools.
5. Implement Red, Blue, Purple, and DFIR views against those services.
6. Add plugin loading with capability checks.
7. Add AI context and workflow interfaces.
8. Add host/container/VM/lab adapters behind explicit interfaces.
