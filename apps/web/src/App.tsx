import React, { useMemo, useState } from 'react';
import { workspaceProfiles } from '../../../workspaces/profiles';
import type { WorkspaceProfile } from '../../../packages/shared/src/domain';

const profileWidgets: Record<WorkspaceProfile, string[]> = Object.fromEntries(
  workspaceProfiles.map((profile) => [profile.id, profile.defaultWidgets]),
) as Record<WorkspaceProfile, string[]>;

const profileLabels: Record<WorkspaceProfile, string> = Object.fromEntries(
  workspaceProfiles.map((profile) => [profile.id, profile.label]),
) as Record<WorkspaceProfile, string>;

export default function App() {
  const [profile, setProfile] = useState<WorkspaceProfile>('blue-team');
  const [selectedPanel, setSelectedPanel] = useState<string | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const widgets = useMemo(() => profileWidgets[profile], [profile]);

  return (
    <main className={`cyber-os ${theme}`}>
      <header className="topbar">
        <button className="brand" onClick={() => setSidebarOpen((value) => !value)} aria-label="Toggle navigation">CYBER-OS</button>
        <div className="workspace-title">{profileLabels[profile]} Workspace</div>
        <input className="global-search" placeholder="Search assets, alerts, tools, cases..." aria-label="Global search" />
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>Theme</button>
        <button>AI Copilot</button>
        <button>Notifications</button>
      </header>

      <div className="shell">
        {sidebarOpen && (
          <aside className="sidebar">
            <div className="section-label">WORKSPACES</div>
            {workspaceProfiles.map((item) => (
              <button key={item.id} className={profile === item.id ? 'nav active' : 'nav'} onClick={() => { setProfile(item.id); setSelectedPanel(null); }}>
                {item.label}
              </button>
            ))}
            <div className="section-label">OPERATIONS</div>
            <button className="nav">Asset Inventory</button>
            <button className="nav">Fleet</button>
            <button className="nav">Network Topology</button>
            <button className="nav">Timeline</button>
            <button className="nav">Tool Registry</button>
            <button className="nav">Workflow Builder</button>
          </aside>
        )}

        <section className="canvas">
          <div className="canvas-toolbar">
            <span>{widgets.length} widgets</span>
            <button>Add Widget</button>
            <button>Save Layout</button>
            <button>Reset Layout</button>
          </div>

          <div className="widget-grid">
            {widgets.map((widget) => (
              <button key={widget} className="widget" onClick={() => setSelectedPanel(widget)}>
                <span className="widget-title">{widget.replaceAll('-', ' ').toUpperCase()}</span>
                <span className="widget-body">Interactive operational panel</span>
              </button>
            ))}
          </div>
        </section>

        {selectedPanel && (
          <aside className="drawer">
            <div className="drawer-header">
              <strong>{selectedPanel.replaceAll('-', ' ')}</strong>
              <button onClick={() => setSelectedPanel(null)}>Close</button>
            </div>
            <p>Contextual details for the selected operational panel.</p>
            <div className="drawer-card">Mock operational data is connected through the Alpha 1 shared domain contracts.</div>
            <button className="primary">Open Investigation</button>
          </aside>
        )}
      </div>
    </main>
  );
}
