import type { PanelLayout, WidgetInstance, Workspace } from '../../shared/src/domain';

export interface WidgetDefinition {
  type: string;
  title: string;
  minWidth?: number;
  minHeight?: number;
}

export class WidgetEngine {
  constructor(private readonly definitions: WidgetDefinition[] = []) {}

  register(definition: WidgetDefinition): void {
    if (this.definitions.some((item) => item.type === definition.type)) return;
    this.definitions.push(definition);
  }

  available(): WidgetDefinition[] {
    return [...this.definitions];
  }

  add(workspace: Workspace, definition: WidgetDefinition, panel?: Partial<PanelLayout>): WidgetInstance {
    const instance: WidgetInstance = {
      id: crypto.randomUUID(),
      type: definition.type,
      title: definition.title,
      config: {},
    };
    workspace.widgets.push(instance);
    workspace.layout.panels.push({
      id: crypto.randomUUID(),
      widgetId: instance.id,
      x: panel?.x ?? 0,
      y: panel?.y ?? 0,
      width: panel?.width ?? 4,
      height: panel?.height ?? 3,
      dock: panel?.dock ?? 'center',
      collapsed: false,
    });
    return instance;
  }

  remove(workspace: Workspace, widgetId: string): void {
    workspace.widgets = workspace.widgets.filter((widget) => widget.id !== widgetId);
    workspace.layout.panels = workspace.layout.panels.filter((panel) => panel.widgetId !== widgetId);
  }

  resize(workspace: Workspace, widgetId: string, width: number, height: number): void {
    const panel = workspace.layout.panels.find((item) => item.widgetId === widgetId);
    if (!panel) throw new Error(`Panel not found for widget ${widgetId}`);
    panel.width = Math.max(1, width);
    panel.height = Math.max(1, height);
  }

  move(workspace: Workspace, widgetId: string, x: number, y: number): void {
    const panel = workspace.layout.panels.find((item) => item.widgetId === widgetId);
    if (!panel) throw new Error(`Panel not found for widget ${widgetId}`);
    panel.x = Math.max(0, x);
    panel.y = Math.max(0, y);
  }
}
