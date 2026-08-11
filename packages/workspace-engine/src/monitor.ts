import type { WorkspaceLayout } from '../../shared/src/domain';

export interface MonitorDefinition {
  id: string;
  name: string;
  width: number;
  height: number;
  scale: number;
  primary?: boolean;
}

export interface MultiMonitorLayout {
  id: string;
  name: string;
  monitors: Array<{ monitorId: string; layoutId: string }>;
}

export function assignLayoutToMonitor(layout: WorkspaceLayout, monitorId: string): WorkspaceLayout {
  return { ...structuredClone(layout), monitorId };
}
