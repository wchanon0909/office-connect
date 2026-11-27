/* V6.6.6 Floor Plan Tools. Pure draft operations; no network or renderer writes. */
'use strict';
(function(root){
 const clone=p=>JSON.parse(JSON.stringify(p)), key=(x,y)=>`${x},${y}`;
 const point=k=>typeof k==='string'&&/^\d+,\d+$/.test(k)?k.split(',').map(Number):null;
 const inside=(p,a)=>a&&a[0]>=0&&a[1]>=0&&a[0]<p.cols&&a[1]<p.rows;
 const owned=(c,protectedIds)=>c?.type==='desk'&&(!!c.name||protectedIds?.has(c.id));
 const batchable=new Set(['desk','wall','aisle','plant','door','meeting','coffee','water','printer','fridge','cabinet','sofa','plants','books','erase','room']);
 const isBatch=t=>batchable.has(t);
 function shapeFor(tool,mode){return tool==='room'?'room':mode!=='auto'?mode:['wall','desk'].includes(tool)?'line':['aisle','erase'].includes(tool)?'box':'single';}
 function targets(p,tool,a,b,{mode='auto',spacing=1,roomDoor=true}={}){
  const A=point(a),B=point(b);if(!isBatch(tool)||!inside(p,A)||!inside(p,B))return [];
  const [ax,ay]=A,[bx,by]=B,loX=Math.min(ax,bx),hiX=Math.max(ax,bx),loY=Math.min(ay,by),hiY=Math.max(ay,by),form=shapeFor(tool,mode),gap=tool==='desk'?Math.max(1,Math.min(3,Math.trunc(Number(spacing))||1)):1,out=[];
  const add=(x,y,t=tool)=>out.push({key:key(x,y),type:t});
  if(form==='single'){add(ax,ay);return out;}
  if(form==='line'){let horiz=Math.abs(bx-ax)>=Math.abs(by-ay),d=horiz?bx-ax:by-ay;for(let i=0;i<=Math.abs(d);i+=gap)add(ax+(horiz?Math.sign(d)*i:0),ay+(horiz?0:Math.sign(d)*i));return out;}
  if(form==='room'&&(hiX-loX<2||hiY-loY<2))return [];
  const entrance=roomDoor?(hiY<p.rows-1?key(Math.floor((loX+hiX)/2),hiY):loY>0?key(Math.floor((loX+hiX)/2),loY):hiX<p.cols-1?key(hiX,Math.floor((loY+hiY)/2)):loX>0?key(loX,Math.floor((loY+hiY)/2)):null):null;
  for(let y=loY;y<=hiY;y++)for(let x=loX;x<=hiX;x++){
   if(form==='room'){if(x!==loX&&x!==hiX&&y!==loY&&y!==hiY)continue;add(x,y,key(x,y)===entrance?'door':'wall');}
   else if(Math.abs(x-ax)%gap===0&&Math.abs(y-ay)%gap===0)add(x,y);
  }
  return out;
 }
 function verdict(c,t,rotation,opts={}){
  if(t==='erase')return !c?'same':owned(c,opts.protectedIds)?'blocked':'change';
  if(t==='wall'&&c?.type==='door')return 'same'; // preserve existing doorway
  if(t==='door'&&c?.type==='wall')return 'change';
  if(c?.type===t)return c.rotation===rotation?'same':'change';
  if(c&&c.type!=='aisle')return 'blocked';
  return 'change';
 }
 function inspect(p,tool,a,b,opts={}){let rotation=[0,90,180,270].includes(opts.rotation)?opts.rotation:0;let points=targets(p,tool,a,b,opts);let cells=points.map(o=>({...o,verdict:tool==='desk'&&points.length>1&&p.cells[o.key]?.type==='desk'?'same':verdict(p.cells[o.key],o.type,rotation,opts)}));let blocked=cells.filter(o=>o.verdict==='blocked').length,changed=cells.filter(o=>o.verdict==='change').length;return{cells,blocked,changed,invalid:tool==='room'&&!cells.length,atomicBlocked:tool==='room'&&blocked>0};}
 function apply(p,tool,a,b,opts={}){
  let result=inspect(p,tool,a,b,opts);if(result.invalid||result.atomicBlocked||!result.changed)return{...result,plan:p,applied:0};
  let next=clone(p),rotation=[0,90,180,270].includes(opts.rotation)?opts.rotation:0,last=null,ids=new Set(Object.values(next.cells).filter(c=>c.type==='desk').map(c=>c.id));
  for(let o of result.cells){if(o.verdict!=='change')continue;const c=next.cells[o.key];if(o.type==='erase')delete next.cells[o.key];else if(c?.type===o.type)c.rotation=rotation;else if(o.type==='desk'){
   let id;do{if(!Number.isSafeInteger(next.nextId)||next.nextId<1||next.nextId>=99999999)throw Error('Desk ID limit');id='D-'+String(next.nextId++).padStart(3,'0');}while(ids.has(id));ids.add(id);next.cells[o.key]={type:'desk',rotation,id,label:id,name:'',status:'offline'};
  }else next.cells[o.key]={type:o.type,rotation};last=o.key;}
  return{...result,plan:next,applied:result.changed,last};
 }
 function extend(p,side,count){
  if(!['N','E','S','W'].includes(side)||!Number.isInteger(count)||count<1||count>10)throw Error('Invalid expansion');
  const dx=side==='W'?count:0,dy=side==='N'?count:0,cols=p.cols+('EW'.includes(side)?count:0),rows=p.rows+('NS'.includes(side)?count:0);if(cols>80||rows>50)throw Error('Maximum grid size: 80 x 50');
  const next={...clone(p),cols,rows,cells:{},edges:{}},removed=[];
  for(const [k,c] of Object.entries(p.cells)){const [x,y]=point(k);next.cells[key(x+dx,y+dy)]=clone(c);}
  for(const [k,c] of Object.entries(p.edges||{})){const [s,i]=k.split(':');if(s===side){removed.push(k);continue;}next.edges[`${s}:${Number(i)+('NS'.includes(s)?dx:dy)}`]=clone(c);}
  return{plan:next,removed,dx,dy,added:cols*rows-p.cols*p.rows};
 }
 function missingOwned(p,ids){const present=new Set(Object.values(p.cells).filter(c=>c.type==='desk').map(c=>c.id));return [...ids].filter(id=>!present.has(id));}
 root.OC666_FLOOR=Object.freeze({targets,inspect,apply,extend,missingOwned,isBatch,shapeFor,owned});
})(typeof window!=='undefined'?window:globalThis);
