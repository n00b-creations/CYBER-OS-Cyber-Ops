import React from 'react';
export interface DependencyNode { id:string; name:string; dependencies:string[]; }
export function PluginDependencyGraph({nodes}:{nodes:DependencyNode[]}) {
 const byId=new Map(nodes.map(n=>[n.id,n]));
 return <section className="panel full-panel"><header><h3>Plugin Dependency Graph</h3><span>{nodes.length} plugins</span></header><div className="dependency-graph">{nodes.map((node,i)=><div className="dependency-node" key={node.id} style={{left:`${8+(i%4)*23}%`,top:`${10+Math.floor(i/4)*35}%`}}><strong>{node.name}</strong>{node.dependencies.map(dep=><small key={dep}>↳ {byId.get(dep)?.name ?? dep}</small>)}</div>)}</div></section>;
}