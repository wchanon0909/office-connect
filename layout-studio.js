/* V6.1.2: geometry shared by the real scene and the draft editor. No writes. */
'use strict';
window.OC612_STUDIO=(()=>{
 const CELL=1.82, legacyFront=new Set(['D-077','D-148','D-082','D-083']), legacySide=new Set(['D-074','D-093']), executive=new Set(['D-063','D-073']);
 const furniture=new Set(['coffee','water','printer','fridge','cabinet','sofa','plants','books']);
 const canAlign=c=>c?.type==='desk'||furniture.has(c?.type);
 // The saved plan still uses v1 wall cells (server-blocked). Geometry is
 // centred on grid edges, with explicit E/W orientation for 90/270 rotations.
 const WALL_OFFSET=CELL/2, WALL_DEPTH=.16, CAP_DEPTH=.20, DOOR_OPENING=.84;
 // A closed stairwell in this release is represented by a reserved 3x2
 // block of ordinary wall cells. This retains the server's blocked-cell
 // semantics without introducing an unverified database type. The alternating
 // rotations identify the block; editor line/room tools never create it.
 // If the marker is ambiguous or incomplete, render ordinary solid walls.
 const stairMarker=[[90,270,90],[270,90,270]];
 function stairwell(p){
  let found=null;
  for(const [k,c] of Object.entries(p.cells)){
   if(c.type!=='wall'||c.rotation!==90)continue;
   const [x,y]=k.split(',').map(Number),w=3,h=2;if(x+w>p.cols||y+h>p.rows)continue;
   const keys=[];let ok=true;for(let j=0;j<h&&ok;j++)for(let i=0;i<w;i++){const k2=`${x+i},${y+j}`,v=p.cells[k2];if(v?.type!=='wall'||v.rotation!==stairMarker[j][i]){ok=false;break;}keys.push(k2);}
   if(ok){if(found)return null;found={x,y,w,h,keys};}
  }
  return found;
 }
 const rawWall=(p,x,y)=>['wall','door'].includes(p.cells[`${x},${y}`]?.type);
 function reserved(p,x,y,stairs=stairwell(p)){return !!stairs&&x>=stairs.x&&x<stairs.x+stairs.w&&y>=stairs.y&&y<stairs.y+stairs.h;}
 const wallOrDoor=(p,x,y,stairs)=>rawWall(p,x,y)&&!reserved(p,x,y,stairs);
 function side(p,x,y,stairs=stairwell(p)){
  if(!wallOrDoor(p,x,y,stairs))return null;
  const r=p.cells[`${x},${y}`].rotation;
  if(r===90)return 'E';if(r===270)return 'W';
  if(wallOrDoor(p,x-1,y,stairs)||wallOrDoor(p,x+1,y,stairs))return 'N';
  if(wallOrDoor(p,x,y-1,stairs)||wallOrDoor(p,x,y+1,stairs))return 'W';
  return 'N';
 }
 const horizontal=(p,x,y)=>side(p,x,y)==='N';
 const wall=(p,x,y)=>p.cells[`${x},${y}`]?.type==='wall'&&!reserved(p,x,y);
 function wallGeometry(p,x,y,stairs=stairwell(p)){
  const primary=side(p,x,y,stairs);if(!primary)return null;
  const door=p.cells[`${x},${y}`].type==='door',vertical=primary!=='N';
  // Adjacent doors in the same run are glass; single doors remain wood.
  const glass=door&&(vertical?[[0,-1],[0,1]]:[[-1,0],[1,0]]).some(([dx,dy])=>p.cells[`${x+dx},${y+dy}`]?.type==='door'&&side(p,x+dx,y+dy,stairs)===primary);
  const segment=(a,b)=>({x:(a+b)/2,w:b-a});
  const run=(s,isDoor=false)=>({side:s,vertical:s!=='N',door:isDoor,glass:isDoor&&glass,offset:s==='E'?-WALL_OFFSET:WALL_OFFSET,depth:WALL_DEPTH,capDepth:CAP_DEPTH,opening:DOOR_OPENING,segments:isDoor?[segment(-CELL/2,-DOOR_OPENING/2),segment(DOOR_OPENING/2,CELL/2)]:[segment(-CELL/2,CELL/2)],cap:segment(-CELL/2,CELL/2)});
  const runs=[run(primary,door)];
  // At a corner, an extra edge belongs to the corner cell. It is not a
  // diagonal bridge or a wall drawn through a genuinely empty grid cell.
  const south=side(p,x,y+1,stairs);
  if(primary==='N'&&['E','W'].includes(south))runs.push(run(south));
  if(primary==='W'&&side(p,x+1,y,stairs)==='N')runs.push(run('N'));
  if(primary==='E'&&side(p,x-1,y,stairs)==='N')runs.push(run('N'));
  // Explicit E/W runs can turn across one cell at a grid vertex.
  if(vertical&&south&&south!=='N'&&south!==primary){
   const last=run('N');last.offset=-WALL_OFFSET;last.side='S';runs.push(last);
  }
  return {...runs[0],runs};
 }
 // Rectangular slab pieces around the visual-only stairwell. Grid-edge units.
 function slabRects(p,stairs=stairwell(p)){
  if(!stairs)return [{x:0,y:0,w:p.cols,h:p.rows}];const {x,y,w,h}=stairs;
  return [{x:0,y:0,w:p.cols,h:y},{x:0,y:y+h,w:p.cols,h:p.rows-y-h},{x:0,y,w:x,h},{x:x+w,y,w:p.cols-x-w,h}].filter(r=>r.w>0&&r.h>0);
 }
 function legacyDesk(p,x,y,c){
  if(edgeMode(p))return null;
  if(legacyFront.has(c?.id)&&c.rotation===0&&wall(p,x,y-1)&&horizontal(p,x,y-1))return [0,-1.74];
  if(legacySide.has(c?.id)&&[0,180].includes(c.rotation)&&wall(p,x-1,y)&&!horizontal(p,x-1,y))return [-1.60,0];
  if(executive.has(c?.id)&&c.rotation===270&&x===p.cols-1)return [-.15,0];
  return null;
 }
 // Match the actual plane, not an inferred cell centre. Keep the existing
 // logical furniture cell for server routes and use the established back envelope.
 function flush(p,x,y,c){
  if(!canAlign(c))return null;
  if(edgeMode(p))return edgeFlush(p,x,y,c);
  const a=-(c.rotation||0)*Math.PI/180,fx=Math.round(Math.sin(a)),fy=Math.round(Math.cos(a)),wx=x-fx,wy=y-fy;
  if(!wall(p,wx,wy))return null;const shape=wallGeometry(p,wx,wy),r=shape?.runs.find(q=>q.vertical===!!fx);if(!r)return null;
  const wallX=(wx-x)*CELL+(r.vertical?-r.offset:0),wallY=(wy-y)*CELL+(r.vertical?0:-r.offset);
  const back=c.type==='desk'?(executive.has(c.id)?.89:.66):({printer:.38,cabinet:.44,fridge:.415,water:.54,coffee:.54}[c.type]??.54);
  const shift=wallX*fx+wallY*fy+.135+back+.025;
  return [fx*shift,fy*shift];
 }
 function offset(p,x,y,c){
  if(c?.type==='desk'){const old=legacyDesk(p,x,y,c);if(old)return old;}
  if(canAlign(c)&&(c.align==='wall'||(c.align!=='center'&&furniture.has(c.type)&&p.cols===10&&p.rows===19&&y===4&&c.rotation===0)))return flush(p,x,y,c)||[0,0];
  return [0,0];
 }
 function wallRotation(p,x,y,c){if(!canAlign(c))return null;const rotations=[c.rotation,...[0,90,180,270].filter(r=>r!==c.rotation)];return rotations.find(r=>flush(p,x,y,{...c,rotation:r})!==null)??null;}
 function edgeValid(p,k){const m=/^([NSEW]):(0|[1-9][0-9]?)$/.exec(k);return !!m&&Number(m[2])<('NS'.includes(m[1])?p.cols:p.rows);}
 function edgePoint(p,k){if(!edgeValid(p,k))return null;const [side,n]=k.split(':'),i=+n,W=p.cols*CELL,D=p.rows*CELL;return {key:k,x:'NS'.includes(side)?(i-(p.cols-1)/2)*CELL:side==='W'?-W/2:W/2,z:'EW'.includes(side)?(i-(p.rows-1)/2)*CELL:side==='N'?-D/2:D/2,angle:'NS'.includes(side)?0:Math.PI/2};}
 function edgeKeys(p){return ['N','S','W','E'].flatMap(s=>Array.from({length:'NS'.includes(s)?p.cols:p.rows},(_,i)=>`${s}:${i}`));}
 function edgeAt(p,px,py,max=.42){const choices=[['N',Math.abs(py+.5),Math.round(px)],['S',Math.abs(py-(p.rows-.5)),Math.round(px)],['W',Math.abs(px+.5),Math.round(py)],['E',Math.abs(px-(p.cols-.5)),Math.round(py)]];return choices.filter(([s,d,i])=>d<=max&&edgeValid(p,`${s}:${i}`)).sort((a,b)=>a[1]-b[1]).map(([s,d,i])=>`${s}:${i}`)[0]||null;}
 function cleanEdges(p){if(p.edges===undefined)return {};if(!p.edges||typeof p.edges!=='object'||Array.isArray(p.edges))throw Error('Invalid edge fixtures');const out={};for(const [k,v] of Object.entries(p.edges)){if(!edgeValid(p,k)||v?.type!=='window')throw Error('Invalid window edge: '+k);out[k]={type:'window'};}return out;}
 // V6.6.6.3 draft-only edge architecture. H/V keys are grid vertices,
 // never occupied floor-cell keys. Undefined wallEdges means legacy mode.
 const edgeMode=p=>Object.hasOwn(p,'wallEdges');
 function wallEdgeValid(p,k){const m=/^([HV]):(0|[1-9][0-9]?),(0|[1-9][0-9]?)$/.exec(k);if(!m)return false;const x=+m[2],y=+m[3];return m[1]==='H'?x<p.cols&&y<=p.rows:x<=p.cols&&y<p.rows;}
 const doubleDoor=c=>c?.type==='glassDoubleStart'||c?.type==='glassDoubleEnd';
 function pairKey(k,delta){const [a,xy]=k.split(':'),[x,y]=xy.split(',').map(Number);return a==='H'?`H:${x+delta},${y}`:`V:${x},${y+delta}`;}
 function pairMate(p,k){const c=p.wallEdges?.[k];return doubleDoor(c)?pairKey(k,c.type==='glassDoubleStart'?1:-1):null;}
 function cleanWallEdges(p){if(!edgeMode(p))return undefined;const d=p.wallEdges;if(!d||typeof d!=='object'||Array.isArray(d))throw Error('Invalid wallEdges');const out={};for(const [k,v] of Object.entries(d)){if(!wallEdgeValid(p,k)||!['wall','door','glass','glassDoubleStart','glassDoubleEnd'].includes(v?.type))throw Error('Invalid wall edge: '+k);out[k]={type:v.type};}for(const [k,v] of Object.entries(out))if(doubleDoor(v)&&out[pairMate({wallEdges:out},k)]?.type!==(v.type==='glassDoubleStart'?'glassDoubleEnd':'glassDoubleStart'))throw Error('Incomplete double door: '+k);for(const [k,v] of Object.entries(out)){if(v.type!=='glassDoubleStart')continue;const [a,xy]=k.split(':'),[x,y]=xy.split(',').map(Number),cross=a==='H'?[`V:${x+1},${y-1}`,`V:${x+1},${y}`]:[`H:${x-1},${y+1}`,`H:${x},${y+1}`];if(cross.some(j=>out[j]))throw Error('Double door centre must be free of perpendicular walls: '+k);}return out;}
 // Round table occupies a 2x2 footprint; only the anchor creates a mesh.
 function roundBlock(p,k){const c=p.cells[k];if(c?.type!=='roundTable'||!Number.isInteger(c.part)||c.part<0||c.part>3)return null;const [xx,yy]=k.split(',').map(Number),x=xx-c.part%2,y=yy-Math.floor(c.part/2),keys=[`${x},${y}`,`${x+1},${y}`,`${x},${y+1}`,`${x+1},${y+1}`];if(x<0||y<0||x+2>p.cols||y+2>p.rows||!keys.every((v,i)=>p.cells[v]?.type==='roundTable'&&p.cells[v].part===i))return null;return {x,y,w:2,h:2,keys};}
 function innerEdges(b){const out=[];for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++){if(x>b.x)out.push(`V:${x},${y}`);if(y>b.y)out.push(`H:${x},${y}`);}return out;}
 function blockAt(p,k,stairs){const c=p.cells[k];if(c?.type==='roundTable')return roundBlock(p,k);if(c?.type!=='wall'||![90,270].includes(c.rotation))return null;const r=stairs===undefined?stairwell(p):stairs;return r?.keys.includes(k)?r:null;}
 function blockedInnerEdge(p,k){const [a,xy]=k.split(':'),[x,y]=xy.split(',').map(Number),b=blockAt(p,`${x},${y}`);return !!b&&innerEdges(b).includes(k);}
 function validateBlocks(p){const anchors=new Set();for(const [k,c] of Object.entries(p.cells)){if(c.type!=='roundTable')continue;const b=roundBlock(p,k);if(!edgeMode(p)||!b)throw Error('Incomplete round table: '+k);if(!anchors.has(b.keys[0])){anchors.add(b.keys[0]);if(innerEdges(b).some(k=>p.wallEdges[k]))throw Error('Wall crosses round table');}}const stairs=stairwell(p);if(edgeMode(p)&&stairs&&innerEdges(stairs).some(k=>p.wallEdges[k]))throw Error('Wall crosses stairwell');return p;}
 function edgeForCell(x,y,s){return s==='N'?`H:${x},${y}`:s==='S'?`H:${x},${y+1}`:s==='W'?`V:${x},${y}`:`V:${x+1},${y}`;}
 function wallEdgePoint(p,k){if(!wallEdgeValid(p,k))return null;const [axis,xy]=k.split(':'),[x,y]=xy.split(',').map(Number),vertical=axis==='V';return {x:(x+(vertical?0:.5)-p.cols/2)*CELL,z:(y+(vertical?.5:0)-p.rows/2)*CELL,vertical};}
 // Canonical owner for painting a segment once, even on the perimeter.
 function edgeOwner(p,k){if(!wallEdgeValid(p,k))return null;const [axis,xy]=k.split(':'),[x,y]=xy.split(',').map(Number);return axis==='H'?{key:`${x},${Math.min(y,p.rows-1)}`,side:y===p.rows?'S':'N'}:{key:`${Math.min(x,p.cols-1)},${y}`,side:x===p.cols?'E':'W'};}
 function wallEdgeShape(p,k){const c=p.wallEdges?.[k],q=wallEdgePoint(p,k);if(!c||!q)return null;const door=c.type!=='wall',pair=doubleDoor(c),segment=(a,b)=>({x:(a+b)/2,w:b-a}),outerLeft=pair&&(c.type==='glassDoubleStart')!==q.vertical,opening=pair?CELL-.14:DOOR_OPENING,center=pair?(outerLeft?.07:-.07):0,r={vertical:q.vertical,door,glass:c.type!=='wall'&&c.type!=='door',pair,center,outerLeft,offset:0,depth:WALL_DEPTH,capDepth:CAP_DEPTH,opening,segments:pair?[outerLeft?segment(-CELL/2,-CELL/2+.14):segment(CELL/2-.14,CELL/2)]:door?[segment(-CELL/2,-DOOR_OPENING/2),segment(DOOR_OPENING/2,CELL/2)]:[segment(-CELL/2,CELL/2)],cap:segment(-CELL/2,CELL/2)};return {...r,runs:[r]};}
 function convertWalls(p){if(edgeMode(p))return JSON.parse(JSON.stringify(p));const out=JSON.parse(JSON.stringify(p)),stairs=stairwell(p);out.wallEdges={};for(const [k,c] of Object.entries(p.cells)){if(!['wall','door'].includes(c.type))continue;const [x,y]=k.split(',').map(Number);if(reserved(p,x,y,stairs))continue;const shape=wallGeometry(p,x,y,stairs);for(const r of shape.runs){const ek=edgeForCell(x,y,r.side),type=r.door?(r.glass?'glass':'door'):'wall';if(!out.wallEdges[ek]||type!=='wall')out.wallEdges[ek]={type};}delete out.cells[k];}return out;}
 function edgeBetween(p,x,y,nx,ny){if(Math.abs(nx-x)+Math.abs(ny-y)!==1)return null;return p.wallEdges?.[edgeForCell(x,y,nx>x?'E':nx<x?'W':ny>y?'S':'N')]||null;}
 function edgeFlush(p,x,y,c){const a=-(c.rotation||0)*Math.PI/180,fx=Math.round(Math.sin(a)),fy=Math.round(Math.cos(a)),s=fx===1?'W':fx===-1?'E':fy===1?'N':'S';if(p.wallEdges?.[edgeForCell(x,y,s)]?.type!=='wall')return null;const back=c.type==='desk'?(executive.has(c.id)?.89:.66):({printer:.38,cabinet:.44,fridge:.415,water:.54,coffee:.54}[c.type]??.54),shift=-CELL/2+.135+back+.025;return [fx*shift,fy*shift];}
 return {CELL,furniture,canAlign,offset,flush,legacyDesk,wallRotation,wallGeometry,side,stairwell,reserved,slabRects,edgeValid,edgePoint,edgeKeys,edgeAt,cleanEdges,edgeMode,wallEdgeValid,cleanWallEdges,edgeForCell,wallEdgePoint,edgeOwner,wallEdgeShape,convertWalls,edgeBetween,doubleDoor,pairKey,pairMate,roundBlock,innerEdges,blockAt,blockedInnerEdge,validateBlocks};
})();
