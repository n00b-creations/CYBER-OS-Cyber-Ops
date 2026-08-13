import React, { useState } from 'react';

export interface DockPanel { id: string; title: string; dock: 'left' | 'right' | 'center' | 'bottom'; width: number; height: number; collapsed?: boolean; }

export function DockLayout({ initial }: { initial: DockPanel[] }) {
  const [panels, setPanels] = useState(initial);
  const move = (id: string, dock: DockPanel['dock']) => setPanels((items) => items.map((panel) => panel.id === id ? { ...panel, dock } : panel));
  const resize = (id: string, widthDelta: number, heightDelta: number) => setPanels((items) => items.map((panel) => panel.id === id ? { ...panel, width: Math.max(180, panel.width + widthDelta), height: Math.max(100, panel.height + heightDelta) } : panel));
  return <div className="dock-layout">{panels.map((panel) => <section key={panel.id} className={`dock-panel dock-${panel.dock}`} style={{ width: panel.width, minHeight: panel.collapsed ? 42 : panel.height }}><header><strong>{panel.title}</strong><span>{panel.dock}</span></header>{!panel.collapsed && <div className="dock-panel-body">Workspace widget</div>}<footer><button onClick={() => move(panel.id, 'left')}>Left</button><button onClick={() => move(panel.id, 'center')}>Center</button><button onClick={() => move(panel.id, 'right')}>Right</button><button onClick={() => move(panel.id, 'bottom')}>Bottom</button><button onClick={() => resize(panel.id, 40, 0)}>W+</button><button onClick={() => resize(panel.id, 0, 40)}>H+</button><button onClick={() => setPanels((items) => items.map((item) => item.id === panel.id ? { ...item, collapsed: !item.collapsed } : item))}>{panel.collapsed ? 'Expand' : 'Collapse'}</button></footer></section>)}</div>;
}
