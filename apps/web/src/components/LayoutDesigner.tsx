import React, { useRef, useState } from 'react';

export interface LayoutPanel {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  dock: 'left' | 'right' | 'center' | 'bottom';
  collapsed?: boolean;
}

interface Props {
  initial: LayoutPanel[];
  onChange?: (panels: LayoutPanel[]) => void;
  onSave?: (panels: LayoutPanel[]) => void;
  onReset?: () => void;
}

type Interaction = { id: string; mode: 'drag' | 'resize'; startX: number; startY: number; start: LayoutPanel };

const GRID = 2;
const MIN_WIDTH = 14;
const MIN_HEIGHT = 12;
const MAX_X = 86;
const MAX_Y = 88;

const snap = (value: number) => Math.round(value / GRID) * GRID;

export function LayoutDesigner({ initial, onChange, onSave, onReset }: Props) {
  const [panels, setPanels] = useState<LayoutPanel[]>(initial);
  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [dockTarget, setDockTarget] = useState<LayoutPanel['dock'] | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setPanels(initial);
  }, [initial]);

  const commit = (next: LayoutPanel[]) => {
    setPanels(next);
    onChange?.(next);
  };

  const begin = (event: React.PointerEvent, panel: LayoutPanel, mode: Interaction['mode']) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setInteraction({ id: panel.id, mode, startX: event.clientX, startY: event.clientY, start: { ...panel } });
  };

  const update = (event: React.PointerEvent) => {
    if (!interaction || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dx = ((event.clientX - interaction.startX) / rect.width) * 100;
    const dy = ((event.clientY - interaction.startY) / rect.height) * 100;
    const start = interaction.start;

    const next = panels.map((panel) => {
      if (panel.id !== interaction.id) return panel;
      if (interaction.mode === 'drag') {
        return {
          ...panel,
          x: Math.min(MAX_X, Math.max(0, snap(start.x + dx))),
          y: Math.min(MAX_Y, Math.max(0, snap(start.y + dy))),
        };
      }
      return {
        ...panel,
        width: Math.min(86, Math.max(MIN_WIDTH, snap(start.width + dx))),
        height: Math.min(76, Math.max(MIN_HEIGHT, snap(start.height + dy))),
      };
    });
    commit(next);
  };

  const end = () => {
    if (!interaction) return;
    setInteraction(null);
    setDockTarget(null);
  };

  const dock = (id: string, target: LayoutPanel['dock']) => {
    commit(panels.map((panel) => panel.id === id ? { ...panel, dock: target } : panel));
    setDockTarget(null);
  };

  const toggleCollapse = (id: string) => {
    commit(panels.map((panel) => panel.id === id ? { ...panel, collapsed: !panel.collapsed } : panel));
  };

  return (
    <section className="layout-editor-shell">
      <div className="layout-editor-toolbar">
        <div>
          <strong>Workspace Layout Designer</strong>
          <span>Drag headers · resize handles · snap-to-grid · dock zones</span>
        </div>
        <div className="layout-editor-actions">
          <button onClick={() => onSave?.(panels)}>Save Layout</button>
          <button onClick={() => onReset?.()}>Reset</button>
        </div>
      </div>

      <div
        ref={canvasRef}
        className="layout-designer"
        onPointerMove={update}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className={`dock-zone dock-top ${dockTarget === 'center' ? 'active' : ''}`} onPointerEnter={() => setDockTarget('center')} />
        <div className="dock-zone dock-left" onPointerEnter={() => setDockTarget('left')} />
        <div className="dock-zone dock-right" onPointerEnter={() => setDockTarget('right')} />
        <div className="dock-zone dock-bottom" onPointerEnter={() => setDockTarget('bottom')} />

        {panels.map((panel) => (
          <article
            className={`layout-panel ${panel.collapsed ? 'collapsed' : ''}`}
            key={panel.id}
            style={{ left: `${panel.x}%`, top: `${panel.y}%`, width: `${panel.width}%`, height: panel.collapsed ? '44px' : `${panel.height}%` }}
          >
            <header
              onPointerDown={(event) => begin(event, panel, 'drag')}
              title="Drag to move panel"
            >
              <strong>{panel.title}</strong>
              <span>{panel.dock}</span>
            </header>
            {!panel.collapsed && <div className="layout-content">Dockable workspace panel · {panel.width}% × {panel.height}%</div>}
            <footer>
              <button onClick={() => toggleCollapse(panel.id)}>{panel.collapsed ? 'Expand' : 'Collapse'}</button>
              <button onClick={() => dock(panel.id, 'left')}>Dock L</button>
              <button onClick={() => dock(panel.id, 'center')}>Dock C</button>
              <button onClick={() => dock(panel.id, 'right')}>Dock R</button>
            </footer>
            {!panel.collapsed && (
              <button
                className="resize-handle"
                aria-label={`Resize ${panel.title}`}
                onPointerDown={(event) => begin(event, panel, 'resize')}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
