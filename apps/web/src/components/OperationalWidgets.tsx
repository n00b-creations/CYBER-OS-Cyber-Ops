import React, { useMemo, useState } from 'react';
import type { Alert, Asset, CaseRecord, SecurityEvent, WorkspaceProfile } from '../../../packages/shared/src/domain';
import { assets, alerts, cases, events } from '../../../packages/shared/src/mock-data';

interface Props { profile: WorkspaceProfile; }

function Metric({ label, value, tone = 'normal' }: { label: string; value: string | number; tone?: string }) {
  return <div className={`metric ${tone}`}><span>{label}</span><strong>{value}</strong></div>;
}

function AlertList({ onSelect }: { onSelect: (alert: Alert) => void }) {
  return <div className="list">{alerts.map((alert) => <button className="list-row" key={alert.id} onClick={() => onSelect(alert)}><span className={`severity ${alert.severity}`}>{alert.severity}</span><span>{alert.title}</span><small>{alert.status}</small></button>)}</div>;
}

function AssetList({ onSelect }: { onSelect: (asset: Asset) => void }) {
  return <div className="list">{assets.map((asset) => <button className="list-row" key={asset.id} onClick={() => onSelect(asset)}><span className={`status-dot ${asset.status}`} /><span>{asset.name}</span><small>{asset.kind}</small></button>)}</div>;
}

function Timeline({ selectedAsset }: { selectedAsset?: Asset }) {
  const filtered = selectedAsset ? events.filter((event) => event.assetId === selectedAsset.id) : events;
  return <div className="timeline">{filtered.map((event) => <div className="timeline-row" key={event.id}><span>{new Date(event.timestamp).toLocaleTimeString()}</span><i className={`severity-dot ${event.severity}`} /><div><strong>{event.summary}</strong><small>{event.source} · {event.type}</small></div></div>)}</div>;
}

function RedWorkspace({ onSelectAsset }: { onSelectAsset: (asset: Asset) => void }) {
  const nodes = useMemo(() => [
    ['WEB-APP-01', 'asset'], ['assessment-scope', 'scope'], ['service-boundary', 'service'], ['finding-01', 'finding'], ['validation', 'control'],
  ], []);
  return <>
    <div className="metrics"><Metric label="Scoped Assets" value={3} /><Metric label="Objectives" value={5} /><Metric label="Findings" value={2} tone="warning" /><Metric label="Validation" value="72%" /></div>
    <section className="ops-grid red-grid">
      <article className="panel span-2"><header><h3>Attack Path</h3><span>Authorized lab visualization</span></header><div className="graph">{nodes.map(([label, type], index) => <button key={label} className={`graph-node ${type}`} style={{ left: `${12 + index * 20}%`, top: `${35 + (index % 2) * 28}%` }} onClick={() => { const asset = assets.find((item) => item.name === label); if (asset) onSelectAsset(asset); }}>{label}</button>)}<div className="graph-line one" /><div className="graph-line two" /><div className="graph-line three" /></div></article>
      <article className="panel"><header><h3>Mission</h3><span>ALPHA-01</span></header><div className="mission"><strong>Assessment readiness</strong><div className="progress"><i style={{ width: '78%' }} /></div><small>Scope validated · evidence collection enabled</small></div><AssetList onSelect={onSelectAsset} /></article>
      <article className="panel"><header><h3>Findings</h3></header><div className="list"><button className="list-row"><span className="severity high">HIGH</span><span>Service exposure</span><small>Open</small></button><button className="list-row"><span className="severity medium">MED</span><span>Control gap</span><small>Review</small></button></div></article>
    </section>
  </>;
}

function BlueWorkspace({ onSelectAlert, onSelectAsset }: { onSelectAlert: (alert: Alert) => void; onSelectAsset: (asset: Asset) => void }) {
  return <>
    <div className="metrics"><Metric label="Security Score" value="87%" /><Metric label="Critical" value={0} /><Metric label="High" value={1} tone="danger" /><Metric label="Open Cases" value={cases.length} /></div>
    <section className="ops-grid blue-grid">
      <article className="panel span-2"><header><h3>Alert Stream</h3><span>Live mock telemetry</span></header><AlertList onSelect={onSelectAlert} /></article>
      <article className="panel"><header><h3>Endpoint Health</h3></header><AssetList onSelect={onSelectAsset} /></article>
      <article className="panel span-2"><header><h3>Network Activity</h3><span>Last 30 minutes</span></header><div className="network-chart"><div style={{ height: '45%' }} /><div style={{ height: '70%' }} /><div style={{ height: '38%' }} /><div style={{ height: '82%' }} /><div style={{ height: '58%' }} /><div style={{ height: '90%' }} /><div style={{ height: '62%' }} /><div style={{ height: '74%' }} /></div></article>
      <article className="panel"><header><h3>Cases</h3></header><div className="list">{cases.map((item) => <button className="list-row" key={item.id}><span className={`severity ${item.severity}`}>{item.severity}</span><span>{item.title}</span><small>{item.status}</small></button>)}</div></article>
    </section>
  </>;
}

function PurpleWorkspace() {
  const rows = [
    ['T1110', 'Brute Force', 'Detected', 'validated'],
    ['T1046', 'Network Discovery', 'Partial', 'gap'],
    ['T1059', 'Command and Scripting', 'Detected', 'validated'],
    ['T1071', 'Application Protocol', 'Gap', 'gap'],
  ];
  return <>
    <div className="metrics"><Metric label="ATT&CK Coverage" value="81%" /><Metric label="Validated" value={9} /><Metric label="Gaps" value={3} tone="warning" /><Metric label="Retests" value={2} /></div>
    <section className="ops-grid"><article className="panel span-2"><header><h3>Attack vs Detection Matrix</h3><span>Control validation</span></header><div className="matrix">{rows.map(([id, name, result, state]) => <div className="matrix-row" key={id}><code>{id}</code><span>{name}</span><strong className={state}>{result}</strong><button>Details</button></div>)}</div></article><article className="panel"><header><h3>Detection Gaps</h3></header><div className="gap-card"><strong>Network Discovery</strong><span>Telemetry exists but correlation is incomplete.</span><button>Queue Retest</button></div><div className="gap-card"><strong>Application Protocol</strong><span>Expected control has no validated detection.</span><button>Assign</button></div></article></section>
  </>;
}

function DfirWorkspace({ onSelectAsset }: { onSelectAsset: (asset: Asset) => void }) {
  return <><div className="metrics"><Metric label="Active Cases" value={cases.length} /><Metric label="Evidence Items" value={1} /><Metric label="Affected Hosts" value={2} /><Metric label="Custody Valid" value="100%" /></div><section className="ops-grid"><article className="panel span-2"><header><h3>Investigation Timeline</h3><span>Correlated events</span></header><Timeline /></article><article className="panel"><header><h3>Case Queue</h3></header><div className="list">{cases.map((item: CaseRecord) => <button className="list-row" key={item.id}><span className={`severity ${item.severity}`}>{item.severity}</span><span>{item.title}</span><small>{item.status}</small></button>)}</div></article><article className="panel"><header><h3>Affected Assets</h3></header><AssetList onSelect={onSelectAsset} /></article><article className="panel"><header><h3>Evidence Locker</h3></header><div className="evidence"><div><strong>evidence-001</strong><small>Collected artifact · SHA-256 verified</small></div><div><strong>Chain of custody</strong><small>2 custody events · valid</small></div></div></article></section></>;
}

export function OperationalWidgets({ profile }: Props) {
  const [selection, setSelection] = useState<{ type: 'asset' | 'alert'; value: Asset | Alert } | null>(null);
  if (profile === 'red-team') return <RedWorkspace onSelectAsset={(asset) => setSelection({ type: 'asset', value: asset })} />;
  if (profile === 'purple-team') return <PurpleWorkspace />;
  if (profile === 'dfir') return <DfirWorkspace onSelectAsset={(asset) => setSelection({ type: 'asset', value: asset })} />;
  return <BlueWorkspace onSelectAlert={(alert) => setSelection({ type: 'alert', value: alert })} onSelectAsset={(asset) => setSelection({ type: 'asset', value: asset })} />;
}

export function SelectionDrawer({ selection, onClose }: { selection: { type: 'asset' | 'alert'; value: Asset | Alert } | null; onClose: () => void }) {
  if (!selection) return null;
  const value = selection.value;
  return <aside className="drawer operational-drawer"><div className="drawer-header"><strong>{selection.type} details</strong><button onClick={onClose}>Close</button></div><div className="drawer-hero"><span className="eyebrow">{selection.type}</span><h2>{'name' in value ? value.name : value.title}</h2><span>{'kind' in value ? value.kind : value.status}</span></div><div className="drawer-card"><strong>Context</strong><pre>{JSON.stringify(value, null, 2)}</pre></div><button className="primary">Open Investigation</button></aside>;
}
