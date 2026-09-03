import { useMemo, useState } from 'react';

type Lead = { id: string; name: string; company: string; value: number; score: number; stage: string };
type Activity = { title: string; detail: string; age: string; tone: 'cyan' | 'orange' };

const leads: Lead[] = [
  { id: 'L-1001', name: 'Enterprise CRM Package', company: 'TechFlow Inc.', value: 25000, score: 92, stage: 'Proposal' },
  { id: 'L-1002', name: 'Marketing Automation', company: 'GrowthLabs', value: 15000, score: 87, stage: 'Negotiation' },
  { id: 'L-1003', name: 'Lead Gen System', company: 'SalesBoost Co.', value: 12500, score: 78, stage: 'Proposal' },
  { id: 'L-1004', name: 'AI Chatbot Solution', company: 'InnovateCorp', value: 8750, score: 71, stage: 'Qualification' },
  { id: 'L-1005', name: 'Email Marketing Suite', company: 'DigitalEdge LLC', value: 6250, score: 64, stage: 'Discovery' },
];

const activities: Activity[] = [
  { title: 'High Value Opportunity Detected', detail: '$25,000 potential deal · TechFlow Inc.', age: '2m ago', tone: 'orange' },
  { title: 'Campaign ROAS Spike', detail: 'Google Ads Campaign #12 · 327% ROAS', age: '8m ago', tone: 'orange' },
  { title: 'New Lead Assignment', detail: '23 new leads assigned to your queue', age: '15m ago', tone: 'cyan' },
];
const sources = [['Google Ads', 42], ['LinkedIn', 24], ['Email Campaigns', 15], ['Referrals', 10], ['Other', 9]] as const;
const formatMoney = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

function Glyph({ children }: { children: string }) { return <span className="glyph" aria-hidden>{children}</span>; }
function Panel({ title, children, tone = '', wide = false }: { title: string; children: React.ReactNode; tone?: string; wide?: boolean }) {
  return <article className={`panel ${tone} ${wide ? 'wide' : ''}`}><header><span>{title}</span><button>•••</button></header>{children}</article>;
}
function Agent({ name }: { name: string }) { return <div className="agent"><span className="agent-icon">◎</span><strong>{name}</strong><span className="active">● ACTIVE</span></div>; }
function Metric({ title, value, label, kind }: { title: string; value: string; label: string; kind: 'bars' | 'funnel' | 'trend' | 'agents' }) {
  return <article className="panel metric-card"><header><span>{title}</span><button>•••</button></header><div className="metric-value">{value}</div><small>{label}</small>
    {kind === 'bars' && <div className="telemetry-bars">{[42,58,35,72,49,81,55,68,44,76].map((h, i) => <i key={i} style={{ height: `${h}%` }}/>)}</div>}
    {kind === 'funnel' && <div className="funnel"><i/><i/><i/><i/></div>}
    {kind === 'trend' && <div className="trend-line">{[30,55,35,62,48,76,58,92].map((h, i) => <i key={i} style={{ height: `${h}%` }}/>)}</div>}
    {kind === 'agents' && <div className="agent-mini">● ACTIVE <span>AVG RESPONSE 1.2s</span></div>}
  </article>;
}

export default function App() {
  const [query, setQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [mode, setMode] = useState<'command' | 'pipeline'>('command');
  const filtered = useMemo(() => leads.filter((lead) => `${lead.name} ${lead.company} ${lead.stage}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const pipelineValue = leads.reduce((sum, lead) => sum + lead.value, 0);

  return <div className="jarvis-shell">
    <aside className="sidebar">
      <div className="brand-block"><div className="brand-mark">J</div><div><strong>JARVIS-SEC</strong><span>MASTER HUB</span></div></div>
      <div className="sidebar-subtitle">DAD &amp; SON LEADS DIVISION</div>
      <nav>{['COMMAND CENTER','DASHBOARD','LEAD PIPELINE','OPPORTUNITIES','CAMPAIGNS','AUTOMATION','AI AGENTS','TARGET PROSPECTS','ANALYTICS','INTEGRATIONS','TEAM OPERATIONS','SETTINGS','SYSTEM LOGS'].map((item, index) => <button key={item} className={`nav-item ${index === 0 && mode === 'command' ? 'active' : ''}`} onClick={() => setMode(item === 'LEAD PIPELINE' ? 'pipeline' : 'command')}><Glyph>{['⌘','▦','◈','◇','↗','⚙','◎','◉','▥','⌁','♙','⚙','≡'][index]}</Glyph>{item}</button>)}</nav>
      <div className="integrity"><div className="section-kicker">SYSTEM INTEGRITY</div><strong>100%</strong><div className="spark">{[30,62,45,90,58,78,70].map((h,i)=><i key={i} style={{height:`${h}%`}}/>)}</div></div>
      <div className="secure"><span>◉</span><div><strong>SECURE CONNECTION</strong><small>AES-256 ENCRYPTED</small></div></div>
    </aside>
    <main className="main">
      <header className="topbar"><div><div className="eyebrow">OPERATIONAL STATUS</div><div className="status-row"><span>7D 14H 32M <small>UPTIME</small></span><span>482 <small>ACTIVE TARGETS</small></span><span className="orange">{formatMoney(pipelineValue * 5.15)} <small>PIPELINE VALUE</small></span><span className="green">24.7% <small>CONVERSION RATE</small></span><span>18 <small>CAMPAIGNS</small></span><span className="green">ONLINE <small>TEAM STATUS</small></span></div></div><div className="top-actions"><input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search leads, companies, opportunities..." aria-label="Global search"/><button onClick={()=>setCopilotOpen(!copilotOpen)}>AI COPILOT</button><button onClick={()=>setNotificationsOpen(!notificationsOpen)}>ALERTS <b>3</b></button></div></header>
      <section className="content"><div className="page-heading"><div><span className="eyebrow">JARVIS-SEC / {mode === 'command' ? 'COMMAND CENTER' : 'LEAD PIPELINE'}</span><h1>{mode === 'command' ? 'Master Operations Hub' : 'Lead Pipeline'}</h1></div><div className="heading-actions"><button>ARRANGE</button><button>SAVE LAYOUT</button></div></div>
        <div className="metrics-grid"><Metric title="LIVE TELEMETRY" value="32%" label="CPU LOAD · 61% MEMORY" kind="bars"/><Metric title="CONVERSION FUNNEL" value="8,742" label="PROSPECTED · 2,314 CONTACTED" kind="funnel"/><Metric title="PIPELINE VALUE" value={formatMoney(pipelineValue * 5.15)} label="+12.4% VS LAST 30 DAYS" kind="trend"/><Metric title="AI AGENT STATUS" value="5" label="ACTIVE AGENTS" kind="agents"/></div>
        <div className="dashboard-grid"><Panel title="LIVE ALERTS" tone="orange"><div className="activity-list">{activities.map(a=><button key={a.title} className="activity" onClick={()=>setSelected(leads[0])}><span className={`activity-icon ${a.tone}`}>◉</span><div><strong>{a.title}</strong><small>{a.detail}</small></div><time>{a.age}</time></button>)}</div><button className="panel-link">VIEW ALL ALERTS →</button></Panel><Panel title="LEAD SOURCES"><div className="donut"><div className="donut-hole"/></div><div className="source-list">{sources.map(([name,pct])=><div key={name}><span>{name}</span><strong>{pct}%</strong></div>)}</div></Panel><Panel title="QUICK ACTIONS" tone="orange"><div className="quick-actions"><button className="primary">＋ NEW CAMPAIGN</button><button>⌕ FIND PROSPECTS</button><button>✉ SEND EMAIL BLAST</button><button>▥ VIEW REPORTS</button></div><button className="panel-link orange-link">CUSTOM AUTOMATION →</button></Panel></div>
        <div className="lower-grid"><Panel title="SALES PIPELINE" wide><div className="table-wrap"><table><thead><tr><th>DEAL NAME</th><th>COMPANY</th><th>VALUE</th><th>STAGE</th><th>SCORE</th><th>OWNER</th><th>ACTION</th></tr></thead><tbody>{filtered.map(lead=><tr key={lead.id} onClick={()=>setSelected(lead)}><td>{lead.name}</td><td>{lead.company}</td><td>{formatMoney(lead.value)}</td><td><span className="stage">{lead.stage}</span></td><td><span className={`score score-${lead.score > 85 ? 'high' : lead.score > 70 ? 'mid' : 'low'}`}>{lead.score}</span></td><td>Dad</td><td><button className="more">•••</button></td></tr>)}</tbody></table></div></Panel><Panel title="AI AGENTS">{['LEAD HUNTER AI','EMAIL WIZARD AI','QUALIFIER AI','CLOSER AI','DATA MINER AI'].map(name=><Agent key={name} name={name}/>)}</Panel></div>
        <footer className="footer-status"><span>ALL SYSTEMS OPERATIONAL</span><span>DATA SYNC · 14:32:01</span><span>SECURITY · MAXIMUM</span><span>BACKUP · REAL-TIME ACTIVE</span><span>API · 12/12 CONNECTED</span><span>v2.1.0</span></footer>
      </section>
      {selected && <div className="modal-backdrop" onClick={()=>setSelected(null)}><section className="lead-modal" onClick={e=>e.stopPropagation()}><button className="close" onClick={()=>setSelected(null)}>×</button><span className="eyebrow">LEAD INTELLIGENCE</span><h2>{selected.name}</h2><p>{selected.company}</p><div className="modal-stats"><strong>{formatMoney(selected.value)}</strong><span>Score {selected.score}</span><span>{selected.stage}</span></div><div className="provenance"><b>AI SUMMARY</b><p>Priority prospect identified from the command-center dataset. Production enrichment will attach source, timestamp and confidence to each generated field.</p></div><button className="primary">OPEN OPPORTUNITY</button></section></div>}
      {copilotOpen && <aside className="copilot"><div className="eyebrow">JARVIS COPILOT</div><h2>How can I help?</h2><p>Ask about leads, pipeline, campaigns or operational metrics.</p><div className="copilot-suggestion">“Show my highest-scoring opportunities.”</div><div className="copilot-suggestion">“Find stale deals needing follow-up.”</div><button onClick={()=>setCopilotOpen(false)}>CLOSE</button></aside>}
      {notificationsOpen && <aside className="notifications"><div className="eyebrow">NOTIFICATIONS</div><h2>3 active signals</h2>{activities.map(a=><div className="notification" key={a.title}><strong>{a.title}</strong><small>{a.detail}</small></div>)}</aside>}
    </main>
  </div>;
}
