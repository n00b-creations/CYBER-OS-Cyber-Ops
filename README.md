# CYBER-OS Cyber Operations Platform

CYBER-OS is a modular, desktop-first cyber operations workspace for **authorized security operations, defensive monitoring, incident response, DFIR, DevSecOps, threat intelligence, isolated security labs, and controlled security validation**.

The project is designed as a unified operations layer rather than a replacement for every underlying security tool. Workspace profiles, tools, telemetry adapters, plugins, AI providers, lab/VM integrations, and external systems connect through explicit contracts so that capabilities can be tested, audited, permissioned, and replaced independently.

> **Current status: Alpha 1 — architecture and interactive workspace implementation.**
>
> Alpha 1 intentionally uses shared domain contracts and mock operational data for the UI. Host, network, filesystem, VM/lab, and external-tool adapters remain behind explicit interfaces and capability approval boundaries.

---

## What CYBER-OS Is Becoming

CYBER-OS is organized around a persistent workspace model:

```text
                         CYBER-OS
                            │
                 ┌──────────┴──────────┐
                 │    Workspace Engine │
                 └──────────┬──────────┘
                            │
       ┌────────────────────┼────────────────────┐
       ▼                    ▼                    ▼
  Workspace UI        Operations Data       Platform Services
       │                    │                    │
  ┌────┼────┐         ┌─────┼─────┐        ┌────┼────┐
  ▼    ▼    ▼         ▼     ▼     ▼        ▼    ▼    ▼
 RED  BLUE PURPLE   Assets Events Alerts  Tools Plugins AI
  │    │    │         │     │     │        │    │    │
  └────┼────┘         └─────┼─────┘        └────┼────┘
       ▼                    ▼                    ▼
      DFIR              Timeline             Workflow
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                         Audit
```

The goal is a single operational environment where a user can change mission context without abandoning the common asset, event, alert, case, tool, workflow, and audit model.

---

# Workspace Profiles

CYBER-OS supports specialized workspaces instead of forcing every security function into one dashboard.

| Workspace | Primary purpose | Core surfaces |
|---|---|---|
| **Red Team** | Authorized security validation and controlled assessment workflows | Mission control, scope, findings, attack-path visualization, validation |
| **Blue Team** | Defensive monitoring and SOC operations | Alert stream, endpoint health, network activity, cases |
| **Purple Team** | Detection engineering and adversary-emulation validation | ATT&CK coverage, attack-vs-detection matrix, detection gaps, retests |
| **DFIR** | Investigation and evidence handling | Cases, timeline, affected assets, evidence locker, custody status |
| **DevSecOps** | Secure software delivery and engineering operations | Pipeline context, findings, dependencies, deployment/security workflow surfaces |
| **Threat Intel** | Intelligence collection, enrichment, correlation, and reporting | Indicators, relationships, sources, cases, intelligence workflow |
| **NOC** | Infrastructure and fleet operations | Fleet health, topology, availability, incidents |
| **Executive** | High-level security posture and operational reporting | Risk metrics, trends, incidents, coverage, summaries |
| **AI Operations** | Governed AI-assisted orchestration and workflow management | Context, workflow builder, approvals, audit, execution state |

Each profile can have its own widget set and layout while sharing the same platform contracts.

---

# Current Alpha 1 Capabilities

## 1. Blue Team SOC

The Blue workspace includes an operational SOC-style interface with:

- Security posture metrics
- Critical/high severity indicators
- Alert stream
- Endpoint health
- Network activity visualization
- Case queue
- Selectable alerts and assets
- Contextual investigation drawer

The current telemetry is mock data. Live collectors are intentionally isolated behind future adapters.

## 2. Red Team Mission Control

The Red workspace provides a controlled assessment-oriented interface containing:

- Scoped asset metrics
- Assessment objectives
- Mission readiness
- Findings
- Validation state
- Asset selection
- Visual attack-path representation

The visualization represents authorized assessment relationships and does not itself execute arbitrary commands or repository content.

## 3. Purple Team

Purple Team has a dedicated detection-validation workflow:

- ATT&CK coverage metric
- Validated technique count
- Detection gaps
- Retest queue
- Attack-vs-detection matrix
- Technique identifiers
- Detection status
- Gap assignment/retest controls

This intentionally treats Purple Team as a validation discipline rather than simply combining Red and Blue dashboards.

## 4. DFIR

The DFIR workspace contains:

- Active case metrics
- Evidence counts
- Affected-host tracking
- Chain-of-custody status
- Correlated investigation timeline
- Case queue
- Affected asset list
- Evidence locker

Evidence handling remains a domain contract at Alpha 1; production acquisition and forensic tooling adapters are future integrations.

## 5. Asset Inventory

The asset inventory supports:

- Asset search/filtering
- Asset names
- Asset kinds
- Health state
- Tags
- Inspection controls
- Shared asset data across workspace views

The asset model is intended to become the common identity layer for alerts, events, cases, topology, fleet management, and investigations.

## 6. Alert Investigation

The alert drawer provides contextual information including:

- Severity
- Status
- Technique mapping
- Linked event
- Investigation/case action

This is designed to evolve into a common investigation context rather than separate alert views for each workspace.

## 7. Timeline / Event Correlation

The timeline surface supports:

- Event timestamps
- Severity indicators
- Source filtering
- Event type
- Asset correlation
- Event summaries

The same event model can feed Blue SOC triage, Purple validation, and DFIR investigations.

## 8. Attack-Path Visualization

CYBER-OS contains a graph-oriented visualization model for:

- Assets
- Relationships
- Assessment context
- Validation state
- Visual path representation

The current implementation is a safe visualization layer. Future graph adapters can consume approved topology/telemetry data through explicit interfaces.

## 9. Tool Registry

The Tool Registry provides a common catalog for tools across workspace profiles.

Current concepts include:

- Tool identity
- Category
- Workspace associations
- Installed/available state
- Favorites
- Source metadata
- Documentation metadata
- Tags
- Dependency lookup

Tools remain separate from the core platform so that the UI and orchestration layer are not coupled to a particular Linux distribution or vendor.

## 10. AI Workflow Builder

The AI workflow layer is designed as **governed automation**, not unrestricted autonomous execution.

Workflow concepts include:

- Trigger nodes
- Action nodes
- Condition nodes
- Approval nodes
- Output nodes
- Workflow edges
- Validation
- Draft state
- Approval state
- Audit events

Enabled workflows can be checked for an approval gate before execution.

---

# Additional Operational Panels

## Fleet Management

The fleet panel provides a common view of managed assets and their operational state:

- Online
- Degraded
- Offline
- Asset kind
- Details/inspection action

## Layout Designer

The workspace layout system is designed around dockable panels with explicit layout state.

Supported layout operations include:

- Move
- Resize
- Dock
- Collapse/expand
- Persistent layout state

The platform layout controller bounds positions and dimensions and updates workspace state when changes are applied.

## Plugin Dependency Graph

Plugins can declare dependencies, allowing CYBER-OS to represent relationships between:

- Plugins
- Required dependencies
- Optional dependencies
- Tool/catalog entries

The dependency graph is intended to become part of plugin lifecycle validation and troubleshooting.

## Capability Approval

Plugins do not implicitly receive sensitive host capabilities.

Capability requests can be represented and explicitly approved or denied. Examples include:

- `terminal.request`
- `network.request`
- `filesystem.request`

Requests for host/network/filesystem capabilities are intentionally treated as privileged operations requiring explicit authorization.

---

# Platform Architecture

The repository is organized around reusable contracts rather than tightly coupled UI components.

```text
apps/
  web/                       Application UI and workspace shell

packages/
  shared/                    Domain contracts and shared types
  workspace-engine/          Workspace state, layout, persistence
  tool-registry/             Tool catalog and dependency metadata
  plugin-sdk/                Plugin manifests and capability model
  workflow-engine/           Governed workflow validation
  audit/                     Audit event contracts and sinks

workspaces/
  profiles/                  Workspace profile definitions

plugins/
  manifests/                 Plugin metadata and examples

tools/
  catalog/                   Tool metadata

docs/
  architecture/              Architecture and implementation documentation

tests/
  contracts/                 Contract/unit/integration test targets
```

The exact tree will continue to evolve as Alpha implementation becomes more complete.

---

# Workspace Engine

The Workspace Engine is responsible for maintaining the operational context that the UI renders.

Core responsibilities:

1. Open a workspace.
2. Maintain the active workspace.
3. Save workspace state.
4. Apply layout commands.
5. Persist layout changes through a storage abstraction.
6. Keep layout operations independent from UI implementation.

The layout command model currently supports:

```text
move
resize
dock
collapse
```

This provides the foundation for a Figma-style workspace editor without making the rendering framework responsible for domain state.

---

# Persistence Model

Alpha 1 defines a `WorkspaceStorage` abstraction with:

- `load(id)`
- `save(workspace)`
- `remove(id)`
- `list()`

The current in-memory implementation exists to support development and testing without requiring a production database.

A future persistent adapter can target an appropriate local or server-side storage mechanism without changing workspace logic.

---

# Tool Platform

The Tool Catalog separates tool metadata from execution.

A catalog entry can contain:

- Tool definition
- Source information
- Repository/source metadata
- Documentation
- Tags
- Workspace profile associations
- Dependencies

Supported source classifications currently include:

- `builtin`
- `github`
- `local`

The catalog can filter tools by workspace profile and resolve declared dependencies.

---

# Plugin Architecture

Plugins are intended to extend CYBER-OS without becoming trusted components of the core platform.

Plugin manifests include concepts such as:

- ID
- Name
- Version
- Entrypoint
- Capabilities
- Dependencies
- Description

Manifest validation checks required fields, supported capabilities, and dependency metadata.

Sensitive capabilities are explicitly identified and warned about.

### Capability boundary

```text
Plugin Manifest
       │
       ▼
Manifest Validation
       │
       ▼
Dependency Validation
       │
       ▼
Capability Request
       │
       ▼
Human Approval
    ┌──┴──┐
 APPROVE DENY
    │
    ▼
Plugin Runtime
```

This boundary is a fundamental security property of the architecture.

---

# Audit Architecture

The audit package defines an event model for security-sensitive platform operations.

Current audit action categories include:

- `workspace.open`
- `workspace.save`
- `layout.move`
- `layout.resize`
- `layout.dock`
- `plugin.request`
- `workflow.validate`
- `workflow.approve`

The initial `MemoryAuditSink` supports development/testing. Production persistence and a full audit UI are planned Alpha work.

The intent is to make significant workspace and automation operations observable and attributable.

---

# AI Architecture

AI is treated as another platform provider rather than as an unrestricted authority.

The intended AI flow is:

```text
Workspace Context
       │
       ▼
AI Context Adapter
       │
       ▼
Model / Provider
       │
       ▼
Suggested Action / Workflow
       │
       ▼
Validation
       │
       ▼
Approval Boundary
       │
       ▼
Controlled Adapter
       │
       ▼
Audit Event
```

AI-generated actions should remain subject to the same permission, validation, and audit boundaries as manually initiated automation.

---

# Red / Blue Toolset Integration Strategy

CYBER-OS is intended to organize authorized Red Team and Blue Team toolsets into their appropriate workspace contexts rather than hard-code an entire Linux distribution into the UI.

### Red Team placement

Red-oriented tools should appear through the Tool Registry and Red Team workspace according to metadata such as:

- assessment category
- discovery/visibility category
- validation category
- evidence/output category
- workspace compatibility
- dependencies

### Blue Team placement

Blue-oriented tools should be surfaced according to:

- monitoring
- detection
- triage
- endpoint visibility
- network visibility
- incident response
- threat hunting
- evidence handling

### Purple Team placement

Tools that bridge attack simulation and detection validation can be associated with Purple Team through shared workspace metadata.

The platform does **not** require tools to be duplicated between profiles. A single catalog entry can belong to multiple profiles while retaining one identity and one dependency definition.

---

# Linux Distribution Integration

The architecture intentionally keeps distribution-specific tooling behind adapters and catalog metadata.

This allows the eventual platform to organize tools from security-focused Linux environments without making the CYBER-OS dashboard dependent on one distribution's filesystem, package manager, desktop environment, or menu structure.

The desired model is:

```text
Distribution / Tool Source
          │
          ▼
     Tool Adapter
          │
          ▼
      Tool Catalog
          │
     ┌────┴────┐
     ▼         ▼
 Workspace   Registry
     │
     ▼
 User-facing Tool Surface
```

---

# UI / Figma-Style Direction

The interface is designed around a desktop operations-console metaphor.

Planned and partially implemented interaction patterns include:

- Dockable panels
- Resizable panels
- Workspace profiles
- Saved layouts
- Multi-monitor layouts
- Theme switching
- Drag-and-drop dashboard composition
- Contextual drawers
- Graph visualization
- Timeline visualization
- Widget registry
- Tool registry
- Workflow canvas

The layout engine remains deliberately separated from React components so the underlying workspace state can eventually support different desktop/web rendering surfaces.

---

# Multi-Monitor Strategy

Multi-monitor support is modeled as workspace layout state rather than hard-coded screen coordinates.

A future layout profile can define:

```text
Layout Profile
├── Monitor 0
│   ├── Primary dashboard
│   ├── Alerts
│   └── Timeline
│
├── Monitor 1
│   ├── Topology
│   ├── Asset inventory
│   └── Investigation
│
└── Monitor 2
    ├── Terminal/tool context
    ├── Workflow builder
    └── Documentation
```

This enables different layouts for SOC, DFIR, Red Team, DevSecOps, and other operating modes.

---

# Theme Engine Direction

The current UI establishes dark/light behavior. The planned theme-token system will move visual configuration into reusable tokens for:

- Backgrounds
- Surfaces
- Borders
- Text
- Accent states
- Severity states
- Workspace identity
- Graph states
- Alert states
- Accessibility variants

Workspace profiles can then have visual identities without duplicating component styles.

---

# Data Flow

The common data model is intended to connect operational surfaces:

```text
Assets
  │
  ├──────────────┐
  ▼              ▼
Events          Alerts
  │              │
  └──────┬───────┘
         ▼
      Timeline
         │
    ┌────┴────┐
    ▼         ▼
  Cases    Graphs
    │         │
    └────┬────┘
         ▼
      Workflows
         │
         ▼
       Audit
```

This is important because the same underlying event should not need to be modeled independently by SOC, Purple Team, and DFIR.

---

# Security and Safety Boundaries

CYBER-OS is designed for authorized environments and controlled labs.

The architecture deliberately avoids making arbitrary repository code executable merely because it has been registered as a tool or plugin.

Sensitive integrations should use explicit interfaces and permission boundaries for:

- Host execution
- Network access
- Filesystem access
- VM/lab control
- External service access
- Security-tool execution

The core platform should remain useful even when these adapters are disabled.

---

# Development Principles

## 1. Contract-first design

Shared domain contracts should be defined before coupling UI components to implementations.

## 2. Mock-data-first UI

Operational interfaces can be developed and tested without requiring live infrastructure.

## 3. Explicit capabilities

Plugins and integrations must declare what they require.

## 4. Human-controlled privileged operations

Sensitive capabilities should require explicit authorization rather than implicit trust.

## 5. Auditability

Significant state changes and privileged requests should be observable.

## 6. Replaceable adapters

Tool implementations, telemetry providers, AI providers, VM/lab integrations, and persistence mechanisms should be replaceable.

## 7. Workspace separation

Red, Blue, Purple, DFIR, DevSecOps, Threat Intel, NOC, Executive, and AI Operations should remain purpose-specific while sharing the same platform substrate.

---

# Alpha 1 Roadmap

### Completed / established

- [x] Repository structure
- [x] Shared domain contracts
- [x] Workspace profile definitions
- [x] Red Team workspace
- [x] Blue Team workspace
- [x] Purple Team workspace
- [x] DFIR workspace
- [x] Asset inventory
- [x] Alert investigation surface
- [x] Timeline/event surface
- [x] Attack-path visualization
- [x] Tool Registry
- [x] AI workflow canvas
- [x] Fleet panel
- [x] Workspace persistence abstraction
- [x] Layout controller
- [x] Workspace manager
- [x] Tool catalog
- [x] Plugin manifest validation
- [x] Plugin dependency graph surface
- [x] Capability approval surface
- [x] Audit event infrastructure
- [x] Workflow validation

### Next implementation milestones

- [ ] Correct and harden all shared TypeScript contracts
- [ ] Connect the layout designer to WorkspaceManager
- [ ] Persist saved workspace layouts
- [ ] Implement real pointer-based drag/drop
- [ ] Implement resize handles
- [ ] Implement dock targets
- [ ] Implement workspace save/load UI
- [ ] Implement multi-monitor layout profiles
- [ ] Implement theme-token engine
- [ ] Connect plugin dependency graph to Tool Registry
- [ ] Connect capability approval to audit events
- [ ] Display workflow validation results in the workflow builder
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add type-checking CI
- [ ] Add build CI
- [ ] Add application packaging
- [ ] Add production persistence adapter

---

# Testing Strategy

Testing will be layered:

### Domain tests

Validate:

- Workspace contracts
- Layout commands
- Tool dependencies
- Plugin manifests
- Capability validation
- Workflow validation

### Integration tests

Validate:

- Workspace Manager + persistence
- Layout Controller + workspace state
- Tool Registry + catalog
- Plugin approval + audit
- Workflow validation + UI state

### UI tests

Validate:

- Profile switching
- Panel interactions
- Search/filter behavior
- Drawer behavior
- Workflow editing
- Layout interactions

### End-to-end tests

Eventually validate complete workflows such as:

```text
Open Blue Workspace
      ↓
Review Alert
      ↓
Inspect Asset
      ↓
Correlate Events
      ↓
Open Case
      ↓
Review Timeline
      ↓
Record Audit Event
```

---

# Getting Started

The repository is currently in Alpha architecture/implementation development. The exact application build and packaging commands will be finalized as the application shell and package configuration are completed.

Recommended development order:

1. Review `packages/shared` domain contracts.
2. Review `workspaces/` profile definitions.
3. Review `packages/workspace-engine`.
4. Review `packages/tool-registry`.
5. Review `packages/plugin-sdk`.
6. Review `packages/workflow-engine`.
7. Review `packages/audit`.
8. Review `apps/web` for the interactive workspace.
9. Add adapters only behind explicit interfaces.

---

# Project Status

**Current phase:** Alpha 1 — platform architecture + interactive operational workspace.

**Current emphasis:** integrating the workspace engine, layout system, tool platform, plugin boundaries, audit model, and governed workflow engine into one cohesive application.

**Next major milestone:** a runnable Alpha application with persistent workspace layouts, real drag/resize interactions, multi-monitor profiles, theme tokens, integrated plugin/tool management, automated tests, and CI.

---

# Contribution Direction

Contributions should preserve the separation between:

```text
UI
 ↓
Workspace / Domain Contracts
 ↓
Platform Services
 ↓
Explicit Adapters
 ↓
External Systems
```

Avoid embedding direct host execution, network operations, package-manager behavior, VM control, or vendor-specific logic inside reusable UI components.

Security-sensitive functionality should have:

- Explicit capability declarations
- Authorization boundaries
- Audit events
- Testable interfaces
- Safe mock implementations

---

# License / Project Governance

License and contribution governance should be added before the project is treated as a production distribution.

Until then, CYBER-OS should be considered an actively developed Alpha project rather than a production-ready security platform.
