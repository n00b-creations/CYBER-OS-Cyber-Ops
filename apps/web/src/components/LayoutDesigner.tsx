import React, { useState } from 'react';
export interface LayoutPanel { id:string; title:string; x:number; y:number; width:number; height:number; dock:'left'|'right'|'center'|'bottom'; collapsed?:boolean; }
export function LayoutDesigner({initial}:{initial:LayoutPanel[]}) {
 const [panels,setPanels]=useState(initial);
 const move=(id:string,dx:number,dy:number)=>setPanels(p=>p.map(x=>x.id===id?{...x,x:Math.max(0,x.x+dx),y:Math.max(0,x.y+dy)}:x));
 const resize=(id:string,dw:number,dh:number)=>setPanels(p=>p.map(x=>x.id===id?{...x,width:Math.max(2,x.width+dw),height:Math.max(2,x.height+dh)}:x));
 return <div className="layout-designer">{panels.map(p=><article className="layout-panel" key={p.id} style={{left:`${p.x*8}%`,top:`${p.y*7}%`,width:`${p.width*8}%`,height:`${p.height*7}%`}}><header><strong>{p.title}</strong><span>{p.dock}</span></header><div className="layout-content">{p.collapsed?'Panel collapsed':'Dockable workspace panel'}</div><footer><button onClick={()=>move(p.id,-1,0)}>←</button><button onClick={()=>move(p.id,1,0)}>→</button><button onClick={()=>resize(p.id,1,0)}>W+</button><button onClick={()=>resize(p.id,0,1)}>H+</button><button onClick={()=>setPanels(items=>items.map(x=>x.id===p.id?{...x,collapsed:!x.collapsed}:x))}>{p.collapsed?'Expand':'Collapse'}</button></footer></article>)}</div>;
}