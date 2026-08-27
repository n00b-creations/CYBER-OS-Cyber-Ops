# JARVIS-SEC Commercial Application Architecture

JARVIS-SEC is the commercial operations surface built on top of the existing CYBER-OS platform. The existing CYBER-OS workspace engine remains the operational substrate; JARVIS-SEC adds a polished revenue/lead-operations experience without coupling business workflows to the CYBER-OS desktop implementation.

## Repository map

```text
apps/
├── web/                         # CYBER-OS desktop/workspace shell
├── jarvis-sec/                  # Commercial JARVIS-SEC UI
└── api/                         # Production API boundary

packages/
├── shared/                      # Cross-platform domain contracts
├── workspace-engine/            # Workspace/layout behavior
├── widget-engine/               # Dashboard/widget contracts
├── workflow-engine/             # Automation graph/runtime
├── event-engine/                # Event bus/correlation
├── graph-engine/                # Graph/topology primitives
├── ai-core/                     # AI orchestration boundary
├── plugin-sdk/                  # Plugin permissions/admission
├── audit/                       # Audit/control plane
├── identity-core/               # Identity, sessions, RBAC
├── crm-core/                    # Leads, contacts, opportunities
├── lead-intelligence/           # Enrichment/scoring/provenance
├── notification-center/         # Notification contracts
└── visual-engine/               # CSS/2.5D/WebGL boundary

docs/
├── ARCHITECTURE.md
├── JARVIS-SEC-ARCHITECTURE.md
├── JARVIS-SEC-P0-P1.md
└── SECURITY.md
```

## P0 trust boundary

```text
OIDC/OAuth identity
        ↓
Application session
        ↓
Organization context
        ↓
Role + permission evaluation
        ↓
Business service
        ↓
Tenant-scoped persistence
        ↓
Audit event
```

The browser is never trusted for authorization. The server derives the organization from the authenticated session and applies RBAC before mutations. Every tenant-owned record contains an `organizationId`/`organization_id`.

## P1 business flow

```text
Lead
  ↓
Enrichment
  ↓
Score
  ↓
Qualification
  ↓
Opportunity
  ↓
Campaign
  ↓
Activity
  ↓
Analytics
```

## Visual strategy

The exact JARVIS-SEC visual system is the primary UI language: charcoal surfaces, cyan telemetry, orange action states, dense information panels, and restrained glow. 3D should be used selectively for interactive topology, AI-agent presence, depth/parallax and state transitions. The data layer must remain usable without WebGL and must honor `prefers-reduced-motion`.

## Release principle

Do not ship the demo-data implementation as production functionality. Replace mock repositories with API-backed repositories before marketplace release. Authentication, tenant isolation, server-side authorization, audit coverage, data export/deletion, AI action approvals and observability are release gates.
