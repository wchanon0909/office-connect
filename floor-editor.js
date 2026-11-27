/* V6.6.6 Floor Plan Tools. Pure draft operations; no network or renderer writes. */
'use strict';
(function(root){
 const clone=p=>JSON.parse(JSON.stringify(p)), key=(x,y)=>`${x},${y}`;
 const point=k=>typeof k==='string'&&/^\d+,\d+$/.test(k)?k.split(',').map(Number):null;
 const inside=(p,a)=>a&&a[0]>=0&&a[1]>=0&&a[0]<p.cols&&a[1]<p.rows;
 const owned=(c,protectedIds)=>c?.type==='desk'&&(!!c.name||protectedIds?.has(c.id));
 const batchable=new Set(['desk','wall','aisle','plant','door','meeting','coffee','water','printer','fridge','cabinet','sofa','plants','books','erase','room','stairs','roundTable','longTable','doubleDoor','cutFloor','restoreFloor']);
 const isBatch=t=>batchable.has(t);
 function shapeFor(tool,mode){return tool==='room'?'room':mode!=='auto'?mode:['wall','desk'].includes(tool)?'line':['aisle','erase','cutFloor','restoreFloor'].includes(tool)?'box':'single';}
 function targets(p,tool,a,b,{mode='auto',spacing=1,roomDoor=true,rotation=0}={}){
  const A=point(a),B=point(b);if(root.OC667_SHAPES.kinds.has(tool)){if(!inside(p,A))return [];const [x,y]=A,[w,h]=root.OC667_SHAPES.dims(tool,rotation);if(x+w>p.cols||y+h>p.rows)return [];return Array.from({length:w*h},(_,i)=>({key:key(x+i%w,y+Math.floor(i/w)),type:tool,part:i,rotation:tool==='roundTable'?0:rotation}));}if(!isBatch(tool)||!inside(p,A)||!inside(p,B))return [];
  const [ax,ay]=A,[bx,by]=B,loX=Math.min(ax,bx),hiX=Math.max(ax,bx),loY=Math.min(ay,by),hiY=Math.max(ay,by),form=shapeFor(tool,mode),gap=tool==='desk'?Math.max(1,Math.min(3,Math.trunc(Number(spacing))||1)):1,out=[];
  const add=(x,y,t=tool,r)=>out.push({key:key(x,y),type:t,...(r===undefined?{}:{rotation:r})});
  if(form==='single'){add(ax,ay);return out;}
  if(form==='line'){let horiz=Math.abs(bx-ax)>=Math.abs(by-ay),d=horiz?bx-ax:by-ay;for(let i=0;i<=Math.abs(d);i+=gap)add(ax+(horiz?Math.sign(d)*i:0),ay+(horiz?0:Math.sign(d)*i),tool,['wall','door'].includes(tool)&&d!==0?(horiz?0:rotation===90?90:270):undefined);return out;}
  if(form==='room'&&(hiX-loX<2||hiY-loY<2))return [];
  const entrance=roomDoor?(hiY<p.rows-1?key(Math.floor((loX+hiX)/2),hiY):loY>0?key(Math.floor((loX+hiX)/2),loY):hiX<p.cols-1?key(hiX,Math.floor((loY+hiY)/2)):loX>0?key(loX,Math.floor((loY+hiY)/2)):null):null;
  for(let y=loY;y<=hiY;y++)for(let x=loX;x<=hiX;x++){
   if(form==='room'){if(x!==loX&&x!==hiX&&y!==loY&&y!==hiY)continue;add(x,y,key(x,y)===entrance?'door':'wall',y===loY||y===hiY?0:x===loX?270:90);}
   else if(Math.abs(x-ax)%gap===0&&Math.abs(y-ay)%gap===0)add(x,y);
  }
  return out;
 }
 function verdict(c,t,rotation,opts={}){
  if(t==='cutFloor')return c?.type==='void'?'same':c&&c.type!=='aisle'?'blocked':'change';
  if(t==='restoreFloor')return c?.type==='void'?'change':'same';
  if(t==='erase')return !c||c.type==='void'?'same':owned(c,opts.protectedIds)?'blocked':'change';
  if(c?.type==='void')return 'blocked';
  if(t==='wall'&&c?.type==='door')return 'same'; // preserve existing doorway
  if(t==='door'&&c?.type==='wall')return 'change';
  if(c?.type===t)return c.rotation===rotation?'same':'change';
  if(c&&c.type!=='aisle')return 'blocked';
  return 'change';
 }
 function inspect(p,tool,a,b,opts={}){const S=root.OC612_STUDIO;if(S.edgeMode(p)&&['wall','door','doubleDoor','room','window'].includes(tool))return {cells:[],blocked:0,changed:0,invalid:true,internal:false,atomicBlocked:true};let rotation=[0,90,180,270].includes(opts.rotation)?opts.rotation:0;let points=targets(p,tool,a,b,opts);const stairs=S.stairwell(p),blockTool=root.OC667_SHAPES.kinds.has(tool);if(tool==='erase'){const seen=new Set(points.map(o=>o.key));for(const o of [...points]){const block=S.blockAt(p,o.key,stairs);if(block)for(const k of block.keys)if(!seen.has(k)){seen.add(k);points.push({key:k,type:'erase'});}}}let cells=points.map(o=>{const old=p.cells[o.key],r=o.rotation??rotation;return {...o,rotation:r,verdict:blockTool?(S.blockAt(p,o.key,stairs)||old&&old.type!=='aisle'&&!(tool==='doubleDoor'&&['wall','door'].includes(old.type))?'blocked':'change'):S.blockAt(p,o.key,stairs)&&tool!=='erase'?'blocked':tool==='desk'&&points.length>1&&old?.type==='desk'?'same':verdict(old,o.type,r,opts)};});let blocked=cells.filter(o=>o.verdict==='blocked').length,changed=cells.filter(o=>o.verdict==='change').length,invalid=(tool==='room'||blockTool)&&!cells.length;const internal=blockTool&&cells.length&&S.edgeMode(p)&&S.innerEdges({x:point(a)[0],y:point(a)[1],w:root.OC667_SHAPES.dims(tool,rotation)[0],h:root.OC667_SHAPES.dims(tool,rotation)[1]}).some(k=>p.wallEdges[k]);return{cells,blocked,changed,invalid,internal,atomicBlocked:(tool==='room'||blockTool)&&(blocked>0||!!internal)};}
 function apply(p,tool,a,b,opts={}){
  let result=inspect(p,tool,a,b,opts);if(result.invalid||result.atomicBlocked||!result.changed)return{...result,plan:p,applied:0};
  if(tool==='cutFloor'&&p.cols*p.rows-Object.values(p.cells).filter(c=>c.type==='void').length-result.changed<1)return{...result,invalid:true,plan:p,applied:0};
  let next=clone(p),rotation=[0,90,180,270].includes(opts.rotation)?opts.rotation:0,last=null,ids=new Set(Object.values(next.cells).filter(c=>c.type==='desk').map(c=>c.id));
  for(let o of result.cells){if(o.verdict!=='change')continue;const c=next.cells[o.key];if(o.type==='erase')delete next.cells[o.key];else if(o.type==='restoreFloor')delete next.cells[o.key];else if(o.type==='cutFloor')next.cells[o.key]={type:'void',rotation:0};else if(root.OC667_SHAPES.kinds.has(o.type))next.cells[o.key]={type:o.type,rotation:o.type==='roundTable'?0:o.rotation,part:o.part};else if(c?.type===o.type)c.rotation=o.rotation;else if(o.type==='desk'){
   let id;do{if(!Number.isSafeInteger(next.nextId)||next.nextId<1||next.nextId>=99999999)throw Error('Desk ID limit');id='D-'+String(next.nextId++).padStart(3,'0');}while(ids.has(id));ids.add(id);next.cells[o.key]={type:'desk',rotation,id,label:id,name:'',status:'offline'};
  }else next.cells[o.key]={type:o.type,rotation: o.type==='door'&&c?.type==='wall'?c.rotation:o.rotation};last=o.key;}
  if(tool==='cutFloor')for(const k of Object.keys(next.edges||{})){const [side,n]=k.split(':'),i=+n,key=side==='N'?`${i},0`:side==='S'?`${i},${p.rows-1}`:side==='W'?`0,${i}`:`${p.cols-1},${i}`;if(next.cells[key]?.type==='void')delete next.edges[k];}
  if(tool==='cutFloor'&&root.OC612_STUDIO.edgeMode(next))trimWallEdges(next);return{...result,plan:next,applied:result.changed,last};
 }
 function extend(p,side,count){
  if(!['N','E','S','W'].includes(side)||!Number.isInteger(count)||count<1||count>10)throw Error('Invalid expansion');
  const dx=side==='W'?count:0,dy=side==='N'?count:0,cols=p.cols+('EW'.includes(side)?count:0),rows=p.rows+('NS'.includes(side)?count:0);if(cols>80||rows>50)throw Error('Maximum grid size: 80 x 50');
  const next={...clone(p),cols,rows,cells:{},edges:{}},removed=[];
  for(const [k,c] of Object.entries(p.cells)){const [x,y]=point(k);next.cells[key(x+dx,y+dy)]=clone(c);}
  for(const [k,c] of Object.entries(p.edges||{})){const [s,i]=k.split(':');if(s===side){removed.push(k);continue;}next.edges[`${s}:${Number(i)+('NS'.includes(s)?dx:dy)}`]=clone(c);}
  if(root.OC612_STUDIO.edgeMode(p)){next.wallEdges={};for(const [k,c] of Object.entries(p.wallEdges)){const [a,xy]=k.split(':'),[x,y]=point(xy);next.wallEdges[`${a}:${x+dx},${y+dy}`]=clone(c);}}
  return{plan:next,removed,dx,dy,added:cols*rows-p.cols*p.rows};
 }
 function missingOwned(p,ids){const present=new Set(Object.values(p.cells).filter(c=>c.type==='desk').map(c=>c.id));return [...ids].filter(id=>!present.has(id));}
 // Edge editing is deliberately separate from cell editing. Rectangles use
 // exact grid vertices; doors are explicit segments, not inferred orientations.
 function edgeLine(p,a,b){const S=root.OC612_STUDIO;if(!S.wallEdgeValid(p,a)||!S.wallEdgeValid(p,b))return [];const [axis,xy]=a.split(':'),[x,y]=point(xy),[bx,by]=point(b.split(':')[1]);const start=axis==='H'?x:y,end=axis==='H'?bx:by,out=[];for(let i=Math.min(start,end);i<=Math.max(start,end);i++){const k=axis==='H'?`H:${i},${y}`:`V:${x},${i}`;if(S.wallEdgeValid(p,k))out.push(k);}return out;}
 function roomEdges(p,a,b,door=true){const A=point(a),B=point(b);if(!inside(p,A)||!inside(p,B))return [];const x1=Math.min(A[0],B[0]),x2=Math.max(A[0],B[0])+1,y1=Math.min(A[1],B[1]),y2=Math.max(A[1],B[1])+1;if(x2-x1<2||y2-y1<2)return [];const out=[];for(let x=x1;x<x2;x++)for(const y of [y1,y2])out.push({key:`H:${x},${y}`,type:'wall'});for(let y=y1;y<y2;y++)for(const x of [x1,x2])out.push({key:`V:${x},${y}`,type:'wall'});if(door){const k=y2<p.rows?`H:${Math.floor((x1+x2-1)/2)},${y2}`:y1>0?`H:${Math.floor((x1+x2-1)/2)},${y1}`:x2<p.cols?`V:${x2},${Math.floor((y1+y2-1)/2)}`:x1>0?`V:${x1},${Math.floor((y1+y2-1)/2)}`:null;if(k)out.find(o=>o.key===k).type='door';}return out;}
 function doubleDoorItems(p,k){const S=root.OC612_STUDIO;if(!S.wallEdgeValid(p,k)||!S.wallEdgeValid(p,S.pairKey(k,1)))return [];return [{key:k,type:'glassDoubleStart'},{key:S.pairKey(k,1),type:'glassDoubleEnd'}];}
 function applyEdges(p,items){const S=root.OC612_STUDIO;if(!S.edgeMode(p))throw Error('Convert to edge draft first');const next=clone(p);for(const {key,type} of items){if(!S.wallEdgeValid(p,key)||!['wall','door','glass','window','erase','glassDoubleStart','glassDoubleEnd'].includes(type))throw Error('Invalid edge operation');if(type!=='erase'&&!S.edgeHasFloor(p,key))throw Error('No floor beside edge: '+key);if(type!=='erase'&&S.blockedInnerEdge(p,key))throw Error('Wall cannot cross a furniture block');const old=next.wallEdges[key];if(type==='wall'&&old&&old.type!=='wall')continue;if(old?.type===type)continue;const mate=S.pairMate(next,key);if(mate){delete next.wallEdges[mate];delete next.wallEdges[key];}if(type==='erase')delete next.wallEdges[key];else next.wallEdges[key]={type};}S.cleanWallEdges(next);S.validateBlocks(next);const keys=new Set([...Object.keys(p.wallEdges),...Object.keys(next.wallEdges)]),changed=[...keys].filter(k=>p.wallEdges[k]?.type!==next.wallEdges[k]?.type).length;return {plan:next,changed};}
 function moveBlock(p,from,to){const hall=root.OC671_CORE?.hallAt(p,from);if(hall){const target=point(to);if(!inside(p,target))return null;const n=clone(p);for(const k of hall.keys)delete n.cells[k];try{return root.OC671_CORE.placeHall(n,...target);}catch{return null;}}const S=root.OC612_STUDIO,b=root.OC667_SHAPES.block(p,from),target=point(to);if(!b||!inside(p,target))return null;const next=clone(p);for(const k of b.keys)delete next.cells[k];const q=apply(next,b.type,to,to,{rotation:b.rotation});return q.applied===b.keys.length?q.plan:null;}
 function rotateBlock(p,k){if(root.OC671_CORE?.hallAt(p,k))return null;const b=root.OC667_SHAPES.block(p,k);if(!b||b.type==='roundTable')return null;const next=clone(p);b.keys.forEach(key=>delete next.cells[key]);const q=apply(next,b.type,b.anchor,b.anchor,{rotation:(b.rotation+90)%360});return q.applied===b.keys.length?q.plan:null;}
 function trimBlocks(p,cols,rows){const S=root.OC612_STUDIO,outside=new Set(Object.keys(p.cells).filter(k=>{const [x,y]=point(k);return x>=cols||y>=rows;}));for(const k of [...outside]){const b=S.blockAt(p,k);if(b)b.keys.forEach(k=>outside.add(k));}return [...outside];}
 function trimWallEdges(p){const S=root.OC612_STUDIO;for(const k of Object.keys(p.wallEdges||{}))if(!S.edgeHasFloor(p,k)){const mate=S.pairMate(p,k);delete p.wallEdges[k];if(mate)delete p.wallEdges[mate];}}
 root.OC666_FLOOR=Object.freeze({targets,inspect,apply,extend,missingOwned,isBatch,shapeFor,owned,edgeLine,roomEdges,applyEdges,doubleDoorItems,moveBlock,rotateBlock,trimBlocks,trimWallEdges});
})(typeof window!=='undefined'?window:globalThis);
