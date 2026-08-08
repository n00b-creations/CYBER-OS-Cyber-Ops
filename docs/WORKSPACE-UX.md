# CYBER-OS Workspace UX Contract

All workspaces share navigation, search, notifications, AI context, notes, layout controls, and asset/event selection. Profile-specific widgets are layered on top of the common shell.

## Red Team

Mission-oriented layout with scope, assets, assessment status, interactive graph, tool catalog, findings, evidence, notes, and reporting. Graph interactions are visualization-only in Alpha 1; execution requires a future explicitly authorized adapter.

## Blue Team

SOC layout with security posture, alert stream, endpoint health, network activity, threat intelligence, hunting, cases, and response playbooks.

## Purple Team

Correlation layout showing ATT&CK technique coverage, attack-versus-detection status, control validation, gaps, evidence, and retest state.

## DFIR

Case-centric layout showing evidence, chain of custody, artifacts, investigation timeline, affected assets, notes, and reporting.

## Interaction rules

- Selecting an asset opens an asset detail drawer.
- Selecting an alert opens an investigation drawer.
- Selecting a graph node opens contextual metadata.
- Timeline filters update visible events.
- Tool filters update the Tool Registry.
- Workspace profile changes swap profile-specific layout/widgets.
- Layout changes are persisted through WorkspaceManager.
- AI receives only the explicit workspace context exposed by the context provider.
