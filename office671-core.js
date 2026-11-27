/* V6.7.1: layout-derived room/utility destinations and switchback stair grouping.
   No network or background timers. Database remains authoritative for movement. */
'use strict';
window.OC671_CORE=(()=>{
 const S=window.OC612_STUDIO,F=window.OC667_SHAPES,CELL=1.82,dirs=[[1,0],[-1,0],[0,1],[0,-1]],key=(x,y)=>`${x},${y}`,point=k=>k.split(',').map(Number),clone=p=>JSON.parse(JSON.stringify(p));
 const inside=(p,x,y)=>x>=0&&y>=0&&x<p.cols&&y<p.rows;
 const floor=(p,x,y)=>inside(p,x,y)&&(!p.cells[key(x,y)]||p.cells[key(x,y)].type==='aisle')&&!S.reserved(p,x,y);
 const wall=t=>['wall','window'].includes(t),door=t=>['door','glass','glassDoubleStart','glassDoubleEnd'].includes(t);
 function layoutRooms(p){if(!p?.cells)return {};let q;try{q=S.edgeMode(p)?p:S.convertWalls(p);}catch{return {};}
  const seen=new Set(),rooms=[];for(let y=0;y<q.rows;y++)for(let x=0;x<q.cols;x++){const start=key(x,y);if(seen.has(start)||q.cells[start]?.type==='void'||S.reserved(q,x,y))continue;const cells=[start];seen.add(start);let doors=0;
   for(let i=0;i<cells.length;i++){const [a,b]=point(cells[i]);for(const [dx,dy] of dirs){const c=a+dx,d=b+dy,k=key(c,d),e=S.edgeBetween(q,a,b,c,d)?.type;if(door(e))doors++;if(e||!inside(q,c,d)||seen.has(k)||q.cells[k]?.type==='void'||S.reserved(q,c,d))continue;seen.add(k);cells.push(k);}}
   const count=t=>cells.filter(k=>q.cells[k]?.type===t).length,open=cells.filter(k=>floor(p,...point(k)));rooms.push({cells,open,doors,meeting:count('meeting')+count('roundTable')+count('longTable'),fridge:count('fridge'),exec:cells.some(k=>['D-063','D-073'].includes(q.cells[k]?.id)),desk:count('desk')});}
  // Largest connected open area is the office/corridor, never a named room.
  rooms.sort((a,b)=>b.cells.length-a.cells.length);const enclosed=rooms.slice(1).filter(r=>r.doors&&r.open.length),kitchen=enclosed.find(r=>r.fridge),meeting=enclosed.filter(r=>r.meeting&&!r.fridge).sort((a,b)=>b.meeting-a.meeting||b.cells.length-a.cells.length),executive=enclosed.find(r=>r.exec&&!r.meeting&&!r.fridge)||enclosed.find(r=>r.desk&&!r.meeting&&!r.fridge);
  return {executive,large:meeting[0],small:meeting[1],kitchen};
 }
 function distances(p,source,field){const result=new Map();if(!p||!source||!field)return result;const add=(k,d)=>{if(result.has(k))return;result.set(k,d);q.push(k);},q=[];
  const [sx,sy]=typeof source==='string'?point(source):[source.x,source.y];if(![sx,sy].every(Number.isFinite))return result;
  for(let y=Math.max(0,Math.floor(sy)-1);y<=Math.min(p.rows-1,Math.ceil(sy)+1);y++)for(let x=Math.max(0,Math.floor(sx)-1);x<=Math.min(p.cols-1,Math.ceil(sx)+1);x++){const k=key(x,y),d=Math.hypot(x-sx,y-sy);if(d<=1.1&&floor(p,x,y)&&field.free(x,y)&&(d<.001||field.segment({x:sx,y:sy},{x,y})))add(k,0);}
  for(let i=0;i<q.length;i++){const k=q[i],[x,y]=point(k);for(const [dx,dy] of dirs){const a=x+dx,b=y+dy,n=key(a,b);if(result.has(n)||!floor(p,a,b)||wall(S.edgeBetween(p,x,y,a,b)?.type)||!field.segment({x,y},{x:a,y:b}))continue;add(n,result.get(k)+1);}}
  return result;
 }
 function roomTarget(room,dist,field){if(!room)return null;const [cx,cy]=room.cells.map(point).reduce((v,a)=>[v[0]+a[0]/room.cells.length,v[1]+a[1]/room.cells.length],[0,0]);return room.open.filter(k=>dist.has(k)&&field.free(...point(k))).sort((a,b)=>{const A=point(a),B=point(b);return Math.hypot(A[0]-cx,A[1]-cy)-Math.hypot(B[0]-cx,B[1]-cy)||dist.get(a)-dist.get(b)||a.localeCompare(b);})[0]||null;}
 function nearest(p,objects,kind,dist,field,source){const ranked=[];for(const o of objects.filter(o=>o.kind===kind&&o.action&&o.target)){let best=Infinity;const cx=o.x/CELL+(p.cols-1)/2,cy=o.z/CELL+(p.rows-1)/2;const ds=kind==='water'?[.69,.78,.89]:kind==='coffee'?[.86,.95,1.06]:['printer','fridge'].includes(kind)?[.84]:[];
   if(ds.length){const side=kind==='fridge'?-.32:0;for(const d of ds){const x=cx+(Math.sin(o.angle)*d+Math.cos(o.angle)*side)/CELL,y=cy+(Math.cos(o.angle)*d-Math.sin(o.angle)*side)/CELL;for(let b=Math.floor(y)-1;b<=Math.ceil(y)+1;b++)for(let a=Math.floor(x)-1;a<=Math.ceil(x)+1;a++){const k=key(a,b),delta=Math.hypot(a-x,b-y);if(delta>1.1||!dist.has(k)||!field.segment({x:a,y:b},{x,y}))continue;best=Math.min(best,dist.get(k)+delta);}}}else if(dist.has(o.target))best=dist.get(o.target);
   if(Number.isFinite(best))ranked.push({o,best,d:Math.hypot(cx-source.x,cy-source.y)});}
  ranked.sort((a,b)=>a.best-b.best||a.d-b.d||a.o.key.localeCompare(b.o.key));return ranked[0]?.o||null;
 }
 function poster(p){if(!p?.cells)return null;let q;try{q=S.edgeMode(p)?p:S.convertWalls(p);}catch{return null;}const water=Object.entries(q.cells).filter(([,v])=>v.type==='water').sort((a,b)=>point(a[0])[1]-point(b[0])[1]||point(a[0])[0]-point(b[0])[0])[0];if(!water)return null;const [wx,wy]=point(water[0]),out=[];
  for(const [k,v] of Object.entries(q.wallEdges)){if(v.type!=='wall')continue;const [axis,xy]=k.split(':'),[x,y]=point(xy),vert=axis==='V',wpt=S.wallEdgePoint(q,k);for(const side of [-1,1]){const a=x+(vert&&side<0?-1:0),b=y+(!vert&&side<0?-1:0);if(!floor(p,a,b)||!wpt)continue;const dx=x-wx,dy=y-wy;if(dx<0||dx>3||Math.abs(dy)>2)continue;const dist=Math.hypot(dx,dy);if(dist>3.3)continue;const rank=(dx===0?5:0)+dist+(vert?1:0)+(!vert&&side<0?3:0)+(b<wy-1?3:0);out.push({key:k,cell:key(a,b),x:wpt.x+(vert?side*.103:0),z:wpt.z+(!vert?side*.103:0),angle:vert?side*Math.PI/2:side>0?0:Math.PI,side,rank});}}
  out.sort((a,b)=>a.rank-b.rank||a.key.localeCompare(b.key));return out[0]||null;
 }
 // Two standard 2x3 stair blocks (90/270) are a single 4x3 switchback hall.
 function halls(p){const blocks=F.stairs(p),out=[],used=new Set();for(const a of blocks){if(a.type!=='stairs'||a.rotation!==90||a.w!==2||a.h!==3)continue;const b=blocks.find(b=>b.type==='stairs'&&b.rotation===270&&b.x===a.x+2&&b.y===a.y&&b.w===2&&b.h===3);if(!b)continue;const hall={x:a.x,y:a.y,w:4,h:3,keys:[...a.keys,...b.keys],anchor:a.anchor,type:'stairs',rotation:90,switchback:true};if(S.innerEdges(hall).some(k=>p.wallEdges?.[k]))continue;out.push(hall);used.add(a.anchor);used.add(b.anchor);}return [...out,...blocks.filter(b=>!used.has(b.anchor))];}
 const hallAt=(p,k)=>halls(p).find(b=>b.switchback&&b.keys.includes(k))||null;
 function placeHall(p,x,y){if(!S.edgeMode(p))throw Error('กรุณาแปลงผนังเป็นเส้น Grid ก่อน');const existing=hallAt(p,key(x,y));if(existing?.x===x&&existing.y===y)return p;if(!inside(p,x,y)||!inside(p,x+3,y+2))throw Error('พื้นที่ไม่พอสำหรับโถงบันได 4 × 3 ช่อง');const b={x,y,w:4,h:3};if(S.innerEdges(b).some(k=>p.wallEdges[k]))throw Error('มีผนังพาดผ่านด้านในโถงบันได');const n=clone(p);for(let j=0;j<3;j++)for(let i=0;i<4;i++){const k=key(x+i,y+j);if(!floor(p,x+i,y+j))throw Error('ช่องที่ติด Object หรือไม่มีพื้น: '+k);n.cells[k]={type:'stairs',rotation:i<2?90:270,part:j*2+i%2};}S.validateBlocks(n);return n;}
 function markedHall(p){if(!S.edgeMode(p))throw Error('กรุณาแปลงผนังเป็นเส้น Grid ก่อน');const printers=Object.entries(p.cells).filter(([k,v])=>v.type==='printer').map(([k])=>point(k));const matches=[];for(const [px,y] of printers){if(px<6)continue;const x=px-6;if([0,1,2,3].every(i=>wall(p.wallEdges[keyH(x+i,y)]?.type)&&wall(p.wallEdges[keyH(x+i,y+3)]?.type))&&door(p.wallEdges[keyH(x+4,y-1)]?.type)&&door(p.wallEdges[keyH(x+5,y-1)]?.type))matches.push([x,y]);}if(matches.length!==1)throw Error('ไม่พบตำแหน่งที่มาร์กไว้อย่างชัดเจน · เลือกช่องซ้ายบนแล้วใช้ วางโถงจากช่องที่เลือก');return placeHall(p,...matches[0]);}
 const keyH=(x,y)=>`H:${x},${y}`;
 const old=S.blockAt;S.blockAt=(p,k,legacy)=>p.cells[k]?.type==='stairs'?(hallAt(p,k)||old(p,k,legacy)):old(p,k,legacy);
 return {floor,layoutRooms,distances,roomTarget,nearest,poster,halls,hallAt,placeHall,markedHall};
})();
