/* V6.1.2: geometry shared by the real scene and the draft editor. No writes. */
'use strict';
window.OC612_STUDIO=(()=>{
 const CELL=1.82, legacyFront=new Set(['D-077','D-148','D-082','D-083']), legacySide=new Set(['D-074','D-093']), executive=new Set(['D-063','D-073']);
 const furniture=new Set(['coffee','water','printer','fridge','cabinet','sofa','plants','books']);
 const canAlign=c=>c?.type==='desk'||furniture.has(c?.type);
 const wallOrDoor=(p,x,y)=>['wall','door'].includes(p.cells[`${x},${y}`]?.type);
 const horizontal=(p,x,y)=>wallOrDoor(p,x-1,y)||wallOrDoor(p,x+1,y);
 const wall=(p,x,y)=>p.cells[`${x},${y}`]?.type==='wall';
 function legacyDesk(p,x,y,c){
  if(legacyFront.has(c?.id)&&c.rotation===0&&wall(p,x,y-1)&&horizontal(p,x,y-1))return [0,-1.74];
  if(legacySide.has(c?.id)&&[0,180].includes(c.rotation)&&wall(p,x-1,y)&&!horizontal(p,x-1,y))return [-1.60,0];
  if(executive.has(c?.id)&&c.rotation===270&&x===p.cols-1)return [-.15,0];
  return null;
 }
 // A wall cell's actual plane is 0.78 world units behind its center. The
 // furniture faces away from that plane, so its back has 0.04 clearance.
 function flush(p,x,y,c){
  if(!canAlign(c))return null;
  const a=-(c.rotation||0)*Math.PI/180,fx=Math.round(Math.sin(a)),fy=Math.round(Math.cos(a)),wx=x-fx,wy=y-fy;
  if(!wall(p,wx,wy)||horizontal(p,wx,wy)!==!!fy)return null;
  const wallX=(wx-x)*CELL+(fy?0:-.78),wallY=(wy-y)*CELL+(fy?-.78:0);
  const back=c.type==='desk'?(executive.has(c.id)?.89:.66):.54;
  const shift=wallX*fx+wallY*fy+.10+back+.04;
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
 return {CELL,furniture,canAlign,offset,flush,legacyDesk,wallRotation,edgeValid,edgePoint,edgeKeys,edgeAt,cleanEdges};
})();
