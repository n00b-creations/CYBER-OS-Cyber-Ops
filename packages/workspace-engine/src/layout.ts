import type { PanelLayout, Workspace } from '../../shared/src/domain';

export interface LayoutCommand {
  type: 'move' | 'resize' | 'dock' | 'collapse';
  widgetId: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  dock?: PanelLayout['dock'];
  collapsed?: boolean;
}

export class LayoutController {
  apply(workspace: Workspace, command: LayoutCommand): Workspace {
    const panel = workspace.layout.panels.find((item) => item.widgetId === command.widgetId);
    if (!panel) throw new Error(`Unknown widget: ${command.widgetId}`);

    if (command.type === 'move') {
      panel.x = Math.max(0, command.x ?? panel.x);
      panel.y = Math.max(0, command.y ?? panel.y);
    }
    if (command.type === 'resize') {
      panel.width = Math.max(1, command.width ?? panel.width);
      panel.height = Math.max(1, command.height ?? panel.height);
    }
    if (command.type === 'dock' && command.dock) panel.dock = command.dock;
    if (command.type === 'collapse' && typeof command.collapsed === 'boolean') panel.collapsed = command.collapsed;
    workspace.updatedAt = new Date().toISOString();
    return workspace;
  }
}
