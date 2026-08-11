import React, { useState } from 'react';
export interface CapabilityRequest { id:string; plugin:string; capability:string; reason:string; }
export function CapabilityApproval({requests}:{requests:CapabilityRequest[]}) {
 const [decisions,setDecisions]=useState<Record<string,'approved'|'denied'>>({});
 return <section className="panel full-panel"><header><h3>Capability Approval</h3><span>Explicit authorization required</span></header><div className="table">{requests.map(r=><div className="table-row" key={r.id}><strong>{r.plugin}</strong><span>{r.capability}</span><span>{r.reason}</span><span>{decisions[r.id] ?? 'Pending'}</span><button onClick={()=>setDecisions(d=>({...d,[r.id]:'approved'}))}>Approve</button><button onClick={()=>setDecisions(d=>({...d,[r.id]:'denied'}))}>Deny</button></div>)}</div></section>;
}