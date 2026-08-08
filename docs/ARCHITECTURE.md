# CYBER-OS Alpha 1 Architecture

## Core layers

```text
Desktop / Web UI
      |
Workspace Engine ---- Widget Engine ---- Theme Engine
      |
Shared Domain Model
      |
+-----+---------+---------+---------+---------+
| Assets | Events | Alerts | Cases | Tools |
+-----+---------+---------+---------+---------+
      |
Integration Boundary
      |
+-----------+-----------+-----------+-----------+
| Host OS   | Containers| VMs/Lab   | AI Providers|
+-----------+-----------+-----------+-----------+
```

## Workspace profiles

- Red Team: authorized assessment mission control, scoped assets, attack-path visualization, assessment notes, evidence, and reporting.
- Blue Team: SOC monitoring, alerts, endpoints, network activity, threat intelligence, hunting, cases, and response playbooks.
- Purple Team: ATT&CK coverage, attack-vs-detection correlation, control validation, detection gaps, and retesting.
- DFIR: cases, evidence, chain of custody, artifacts, investigation timeline, and reporting.
- DevSecOps, Threat Intel, NOC, Executive, and AI Operations extend the same workspace contract.

## Workspace contract

A workspace owns a layout and references shared domain objects. It must not duplicate authoritative asset/event/tool records.

```ts
interface Workspace {
  id: string;
  name: string;
  profile: WorkspaceProfile;
  layout: WorkspaceLayout;
  widgets: WidgetInstance[];
  toolIds: string[];
  noteIds: string[];
  workflowIds: string[];
  themeId: string;
}
```

## Tool boundary

Tool metadata is cataloged separately from execution. Launch adapters must declare capabilities and permissions. The platform should not execute arbitrary scripts from imported repositories.

## AI boundary

The AI layer receives explicit workspace context through a context provider. Model providers and agents are adapters; they do not receive unrestricted host access by default.
