import React, { useMemo, useState } from 'react';
import { workspaceProfiles } from '../../../workspaces/profiles';
import type { Alert, Asset, WorkspaceProfile } from '../../../packages/shared/src/domain';
import { OperationalWidgets, SelectionDrawer } from './components/OperationalWidgets';
import { LayoutDesigner, type LayoutPanel } from './components/LayoutDesigner';
import { loadLayout, saveLayout, type SavedLayout } from './workspaceLayoutPersistence';

const DEFAULT_LAYOUTS: Record<WorkspaceProfile, LayoutPanel[]> = {
  'red-team': [
    { id: 'mission', title: 'Mission Control', x: 2, y: 2, width: 56, height: 42, dock: 'center' },
    { id: 'scope', title: 'Assessment Scope', x: 60, y: 2, width: 36, height: 42, dock: 'right' },
    { id: 'findings', title: 'Findings', x: 2, y: 48, width: 94, height: 42, dock: 'bottom' },
  ],
  'blue-team': [
    { id: 'alerts', title: 'Alert Stream', x: 2, y: 2, width: 54, height: 44, dock: 'left' },
    { id: 'endpoints', title: 'Endpoint Health', x: 58, y: 2, width: 38, height: 44, dock: 'right' },
    { id: 'network', title: 'Network Activity', x: 2, y: 50, width: 54, height: 40, dock: 'center' },
    { id: 'cases', title: 'Cases', x: 58, y: 50, width: 38, height: 40, dock: 'bottom' },
  ],
  'purple-team': [
    { id: 'matrix', title: 'Attack vs Detection Matrix', x: 2, y: 2, width: 62, height: 82, dock: 'center' },
    { id: 'gaps', title: 'Detection Gaps', x: 68, y: 2, width: 28, height: 82, dock: 'right' },
  ],
  dfir: [
    { id: 'timeline', title: 'Investigation Timeline', x: 2, y: 2, width: 62, height: 52, dock: 'center' },
    { id: 'cases', title: 'Case Queue', x: 68, y: 2, width: 28, height: 52, dock: 'right' },
    { id: 'assets', title: 'Affected Assets', x: 2, y: 60, width: 44, height: 30, dock: 'left' },
    { id: 'evidence', title: 'Evidence Locker', x: 52, y: 60, width: 44, height: 30, dock: 'bottom' },
  ],
  devsecops: [
    { id: 'pipeline', title: 'Pipeline Security', x: 2, y: 2, width: 62, height: 42, dock: 'center' },
    { id: 'findings', title: 'Findings & Dependencies', x: 68, y: 2, width: 28, height: 42, dock: 'right' },
    { id: 'workflow', title: 'Deployment Workflow', x: 2, y: 50, width: 94, height: 40, dock: 'bottom' },
  ],
  'threat-intel': [
    { id: 'indicators', title: 'Indicators', x: 2, y: 2, width: 44, height: 44, dock: 'left' },
    { id: 'correlation', title: 'Correlation Graph', x: 50, y: 2, width: 46, height: 44, dock: 'center' },
    { id: 'intel-cases', title: 'Intelligence Cases', x: 2, y: 52, width: 94, height: 38, dock: 'bottom' },
  ],
  noc: [
    { id: 'fleet', title: 'Fleet Health', x: 2, y: 2, width: 46, height: 42, dock: 'left' },
    { id: 'topology', title: 'Network Topology', x: 52, y: 2, width: 44, height: 42, dock: 'center' },
    { id: 'incidents', title: 'Infrastructure Incidents', x: 2, y: 50, width: 94, height: 40, dock: 'bottom' },
  ],
  executive: [
    { id: 'posture', title: 'Security Posture', x: 2, y: 2, width: 30, height: 40, dock: 'left' },
    { id: 'risk', title: 'Risk Trends', x: 36, y: 2, width: 30, height: 40, dock: 'center' },
    { id: 'incidents', title: 'Major Incidents', x: 70, y: 2, width: 26, height: 40, dock: 'right' },
    { id: 'summary', title: 'Operational Summary', x: 2, y: 48, width: 94, height: 42, dock: 'bottom' },
  ],
  'ai-ops': [
    { id: 'context', title: 'AI Context', x: 2, y: 2, width: 30, height: 42, dock: 'left' },
    { id: 'workflow', title: 'Workflow Builder', x: 36, y: 2, width: 60, height: 58, dock: 'center' },
    { id: 'audit', title: 'Approval & Audit', x: 2, y: 66, width: 94, height: 24, dock: 'bottom' },
  ],
};

function layoutFor(profile: WorkspaceProfile): LayoutPanel[] {
  const saved = loadLayout(profile, 'default');
  return saved?.panels.map((panel) => ({ ...panel })) ?? DEFAULT_LAYOUTS[profile].map((panel) => ({ ...panel }));
}

export default function App() {
  const [profile, setProfile] = useState<WorkspaceProfile>('blue-team');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [layoutMode, setLayoutMode] = useState(false);
  const [layout, setLayout] = useState<LayoutPanel[]>(() => layoutFor('blue-team'));
  const [selection, setSelection] = useState<{ type: 'asset' | 'alert'; value: Asset | Alert } | null>(null);

  const profileLabel = useMemo(() => workspaceProfiles.find((item) => item.id === profile)?.label ?? profile, [profile]);

  const switchProfile = (next: WorkspaceProfile) => {
    setProfile(next);
    setLayout(layoutFor(next));
    setSelection(null);
  };

  const saveCurrentLayout = (panels: LayoutPanel[] = layout) => {
    const saved: SavedLayout = {
      id: 'default',
      name: `${profileLabel} Default`,
      profile,
      version: 1,
      panels,
      savedAt: new Date().toISOString(),
    };
    saveLayout(saved);
    setLayout(panels.map((panel) => ({ ...panel })));
  };

  const resetLayout = () => setLayout(DEFAULT_LAYOUTS[profile].map((panel) => ({ ...panel })));

  return (
    <main className={`cyber-os ${theme}`}>
      <header className="topbar">
        <button className="brand" onClick={() => setSidebarOpen((value) => !value)} aria-label="Toggle navigation">CYBER-OS</button>
        <div className="workspace-title">{profileLabel} Workspace</div>
        <input className="global-search" placeholder="Search assets, alerts, tools, cases..." aria-label="Global search" />
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Theme</button>
        <button onClick={() => setLayoutMode((value) => !value)}>{layoutMode ? 'Workspace' : 'Layout Editor'}</button>
        <button>AI Copilot</button>
        <button>Notifications</button>
      </header>
      <div className="shell">
        {sidebarOpen && <aside className="sidebar">
          <div className="section-label">WORKSPACES</div>
          {workspaceProfiles.map((item) => <button key={item.id} className={profile === item.id ? 'nav active' : 'nav'} onClick={() => switchProfile(item.id)}>{item.label}</button>)}
          <div className="section-label">OPERATIONS</div>
          {['Asset Inventory', 'Fleet', 'Network Topology', 'Timeline', 'Tool Registry', 'Workflow Builder'].map((item) => <button key={item} className="nav">{item}</button>)}
        </aside>}
        <section className="canvas">
          <div className="canvas-toolbar">
            <span>ALPHA 1 · {layoutMode ? 'Layout Editor' : 'Operational workspace'}</span>
            {layoutMode ? <>
              <button onClick={() => saveCurrentLayout()}>Save Layout</button>
              <button onClick={resetLayout}>Reset Layout</button>
            </> : <>
              <button onClick={() => setLayoutMode(true)}>Arrange Panels</button>
              <button onClick={() => saveCurrentLayout()}>Save Layout</button>
            </>}
          </div>
          {layoutMode ? (
            <LayoutDesigner initial={layout} onChange={setLayout} onSave={saveCurrentLayout} onReset={resetLayout} />
          ) : (
            <OperationalWidgets profile={profile} />
          )}
        </section>
        <SelectionDrawer selection={selection} onClose={() => setSelection(null)} />
      </div>
    </main>
  );
}
