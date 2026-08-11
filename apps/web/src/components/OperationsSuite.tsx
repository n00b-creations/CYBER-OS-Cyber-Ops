import React, { useMemo, useState } from 'react';
import { assets, events, tools, workflows } from '../../../packages/shared/src/mock-data';

export function AssetInventory() {
  const [query, setQuery] = useState('');
  const filtered = assets.filter((a) => `${a.name} ${a.kind} ${a.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  return <section className="panel full-panel"><header><h3>Asset Inventory</h3><span>{filtered.length} assets</span></header><input className="panel-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Filter assets..." /><div className="table">{filtered.map((a) => <div className="table-row" key={a.id}><strong>{a.name}</strong><span>{a.kind}</span><span className={`state ${a.status}`}>{a.status}</span><span>{a.tags.join(', ')}</span><button>Inspect</button></div>)}</div></section>;
}

export function AlertDrawer({ alert, onClose }: { alert: any; onClose: () => void }) {
  if (!alert) return null;
  return <aside className="drawer operational-drawer"><div className="drawer-header"><strong>Alert investigation</strong><button onClick={onClose}>Close</button></div><span className={`severity ${alert.severity}`}>{alert.severity}</span><h2>{alert.title}</h2><p>Status: {alert.status}</p><div className="drawer-card"><strong>Technique</strong><p>{alert.techniqueId ?? 'Unmapped'}</p><strong>Event</strong><p>{alert.eventId ?? 'None linked'}</p></div><button className="primary">Create / Open Case</button></aside>;
}

export function EventTimeline() {
  const [source, setSource] = useState('all');
  const sources = ['all', ...Array.from(new Set(events.map((e) => e.source)))];
  const filtered = events.filter((e) => source === 'all' || e.source === source);
  return <section className="panel full-panel"><header><h3>Timeline / Event Correlation</h3><select value={source} onChange={(e) => setSource(e.target.value)}>{sources.map((s) => <option key={s}>{s}</option>)}</select></header><div className="timeline">{filtered.map((e) => <div className="timeline-row" key={e.id}><span>{new Date(e.timestamp).toLocaleTimeString()}</span><i className={`severity-dot ${e.severity}`} /><div><strong>{e.summary}</strong><small>{e.source} · {e.type} · {e.assetId ?? 'unassigned'}</small></div></div>)}</div></section>;
}

export function AttackPath() {
  const nodes = useMemo(() => assets.map((a, i) => ({ ...a, x: 15 + i * 23, y: 35 + (i % 2) * 28 })), []);
  return <section className="panel full-panel"><header><h3>Interactive Attack-Path Visualization</h3><span>Visualization / validation mode</span></header><div className="large-graph">{nodes.map((n, i) => <React.Fragment key={n.id}><button className="graph-node asset" style={{ left: `${n.x}%`, top: `${n.y}%` }}>{n.name}</button>{i < nodes.length - 1 && <div className="graph-line" style={{ left: `${n.x + 7}%`, top: `${n.y + 2}%`, width: '16%' }} />}</React.Fragment>)}</div><div className="graph-legend"><span>Asset</span><span>Observed relationship</span><span>Validation state</span></div></section>;
}

export function ToolRegistry() {
  const [profile, setProfile] = useState('all');
  const profiles = ['all', 'red-team', 'blue-team', 'purple-team', 'dfir', 'devsecops'];
  const filtered = tools.filter((t) => profile === 'all' || t.workspaceProfiles.includes(profile as any));
  return <section className="panel full-panel"><header><h3>Tool Registry</h3><select value={profile} onChange={(e) => setProfile(e.target.value)}>{profiles.map((p) => <option key={p}>{p}</option>)}</select></header><div className="table">{filtered.map((t) => <div className="table-row" key={t.id}><strong>{t.name}</strong><span>{t.category}</span><span>{t.workspaceProfiles.join(', ')}</span><span>{t.installed ? 'Installed' : 'Available'}</span><button>{t.favorite ? '★' : '☆'}</button></div>)}</div></section>;
}

export function WorkflowBuilder() {
  const workflow = workflows[0];
  return <section className="panel full-panel"><header><h3>AI Workflow Builder</h3><span>Governed automation canvas</span></header><div className="workflow-canvas">{workflow.nodes.map((node, i) => <React.Fragment key={node.id}><div className={`workflow-node ${node.type}`}><small>{node.type}</small><strong>{node.label}</strong></div>{i < workflow.nodes.length - 1 && <div className="workflow-arrow">→</div>}</React.Fragment>)}</div><div className="workflow-actions"><button>Validate</button><button>Save Draft</button><button className="primary">Request Approval</button></div></section>;
}

export function FleetPanel() {
  return <section className="panel full-panel"><header><h3>Fleet Management</h3><span>{assets.length} managed assets</span></header><div className="metrics compact"><div className="metric"><span>Online</span><strong>{assets.filter((a) => a.status === 'online').length}</strong></div><div className="metric"><span>Degraded</span><strong>{assets.filter((a) => a.status === 'degraded').length}</strong></div><div className="metric"><span>Offline</span><strong>{assets.filter((a) => a.status === 'offline').length}</strong></div></div><div className="table">{assets.map((a) => <div className="table-row" key={a.id}><strong>{a.name}</strong><span>{a.kind}</span><span className={`state ${a.status}`}>{a.status}</span><button>Details</button></div>)}</div></section>;
}
