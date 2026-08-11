import React, { useState } from 'react';
import { workspaceProfiles } from '../../../workspaces/profiles';
import type { Alert, Asset, WorkspaceProfile } from '../../../packages/shared/src/domain';
import { OperationalWidgets, SelectionDrawer } from './components/OperationalWidgets';

export default function App() {
  const [profile, setProfile] = useState<WorkspaceProfile>('blue-team');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selection, setSelection] = useState<{ type: 'asset' | 'alert'; value: Asset | Alert } | null>(null);

  return (
    <main className={`cyber-os ${theme}`}>
      <header className="topbar">
        <button className="brand" onClick={() => setSidebarOpen((value) => !value)} aria-label="Toggle navigation">CYBER-OS</button>
        <div className="workspace-title">{workspaceProfiles.find((item) => item.id === profile)?.label} Workspace</div>
        <input className="global-search" placeholder="Search assets, alerts, tools, cases..." aria-label="Global search" />
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Theme</button>
        <button>AI Copilot</button>
        <button>Notifications</button>
      </header>
      <div className="shell">
        {sidebarOpen && <aside className="sidebar">
          <div className="section-label">WORKSPACES</div>
          {workspaceProfiles.map((item) => <button key={item.id} className={profile === item.id ? 'nav active' : 'nav'} onClick={() => { setProfile(item.id); setSelection(null); }}>{item.label}</button>)}
          <div className="section-label">OPERATIONS</div>
          {['Asset Inventory', 'Fleet', 'Network Topology', 'Timeline', 'Tool Registry', 'Workflow Builder'].map((item) => <button key={item} className="nav">{item}</button>)}
        </aside>}
        <section className="canvas">
          <div className="canvas-toolbar"><span>ALPHA 1 · Operational workspace</span><button>Add Widget</button><button>Save Layout</button><button>Reset Layout</button></div>
          <OperationalWidgets profile={profile} />
        </section>
        <SelectionDrawer selection={selection} onClose={() => setSelection(null)} />
      </div>
    </main>
  );
}
