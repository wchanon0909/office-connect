/* V6.6.7: saved floor cutouts and atomic furniture footprints. */
'use strict';
window.OC667_SHAPES=(()=>{
 const S=window.OC612_STUDIO,cell=1.82;
 const kinds=new Set(['roundTable','longTable','stairs','doubleDoor']);
 const names={roundTable:'โต๊ะกลม 2 × 2',longTable:'โต๊ะยาว 2 × 1',stairs:'โถงบันไดลง (ปิดใช้งาน)',doubleDoor:'ประตูกระจกบานคู่',void:'พื้นที่ตัดออก'};
 const dims=(type,rotation=0)=>{const [w,h]=type==='roundTable'?[2,2]:type==='stairs'?[3,2]:[2,1];return rotation%180?[h,w]:[w,h];};
 function block(p,k){const c=p.cells[k];if(!kinds.has(c?.type)||!Number.isInteger(c.part))return null;const [w,h]=dims(c.type,c.rotation),[px,py]=k.split(',').map(Number),x=px-c.part%w,y=py-Math.floor(c.part/w);if(c.part<0||c.part>=w*h||x<0||y<0||x+w>p.cols||y+h>p.rows)return null;const keys=Array.from({length:w*h},(_,i)=>`${x+i%w},${y+Math.floor(i/w)}`);if(!keys.every((key,i)=>p.cells[key]?.type===c.type&&p.cells[key].part===i&&p.cells[key].rotation===c.rotation))return null;return{x,y,w,h,keys,type:c.type,rotation:c.rotation,anchor:keys[0]};}
 function blocks(p){return Object.entries(p.cells).filter(([,c])=>kinds.has(c.type)&&c.part===0).map(([k])=>block(p,k)).filter(Boolean);}
 const oldStairwell=S.stairwell,oldBlock=S.blockAt,oldValidate=S.validateBlocks,oldSide=S.side;
 function stairs(p){return [...blocks(p).filter(b=>b.type==='stairs'),...[oldStairwell(p)].filter(Boolean)];}
 const hasFloor=(p,x,y)=>x>=0&&y>=0&&x<p.cols&&y<p.rows&&p.cells[`${x},${y}`]?.type!=='void';
 function slabRects(p){const rows=[],active=new Map();for(let y=0;y<p.rows;y++){const used=new Set();for(let x=0;x<p.cols;){if(!hasFloor(p,x,y)||S.reserved(p,x,y)){x++;continue;}const start=x;while(x<p.cols&&hasFloor(p,x,y)&&!S.reserved(p,x,y))x++;const key=`${start}:${x-start}`,previous=active.get(key);if(previous&&previous.y+previous.h===y)previous.h++;else{const r={x:start,y,w:x-start,h:1};rows.push(r);active.set(key,r);}used.add(key);}for(const key of active.keys())if(!used.has(key))active.delete(key);}return rows;}
 function boundary(p){const out=[];for(let y=0;y<p.rows;y++)for(let x=0;x<p.cols;x++)if(hasFloor(p,x,y)){for(const [side,dx,dy] of [['N',0,-1],['S',0,1],['W',-1,0],['E',1,0]])if(!hasFloor(p,x+dx,y+dy))out.push({x,y,side});}return out;}
 function doorLine(b){const r=b.rotation,vertical=r%180!==0;return {x:vertical?b.x+(r===90?.5:-.5):b.x+.5,y:vertical?b.y+.5:b.y+(r===180?.5:-.5),vertical,length:2*cell};}
 function doorPosts(b){const q=doorLine(b),half=1-.065/cell;return[-1,1].map(sign=>({x:q.x+(q.vertical?0:sign*half),y:q.y+(q.vertical?sign*half:0)}));}
 function validate(p){let floor=0;for(let y=0;y<p.rows;y++)for(let x=0;x<p.cols;x++)if(hasFloor(p,x,y))floor++;if(!floor)throw Error('ต้องเหลือพื้นที่พื้นอย่างน้อย 1 ช่อง');for(const [k,c] of Object.entries(p.cells)){if(c.type==='void'&&c.rotation!==0)throw Error('Invalid floor cutout');if(kinds.has(c.type)&&!block(p,k))throw Error('Incomplete object footprint: '+k);}if(S.edgeMode(p)){if(Object.values(p.cells).some(c=>['wall','door','window','doubleDoor'].includes(c.type))||Object.keys(p.edges||{}).length)throw Error('Edge layout must store all architecture on grid lines');for(const b of blocks(p))if(S.innerEdges(b).some(k=>p.wallEdges[k]))throw Error('Wall crosses furniture footprint');}return p;}
 S.blockAt=(p,k,legacy)=>block(p,k)||oldBlock(p,k,legacy);
 S.roundBlock=(p,k)=>p.cells[k]?.type==='roundTable'?block(p,k):null;
 S.reserved=(p,x,y,legacy)=>p.cells[`${x},${y}`]?.type==='stairs'||!!(legacy===undefined?oldStairwell(p):legacy)?.keys.includes(`${x},${y}`);
 S.slabRects=slabRects;
 S.validateBlocks=p=>{validate(p);if(S.edgeMode(p))oldValidate(p);return p;};
 S.side=(p,x,y,legacy)=>p.cells[`${x},${y}`]?.type==='doubleDoor'?(p.cells[`${x},${y}`].rotation%180?'W':'N'):oldSide(p,x,y,legacy);
 return Object.freeze({kinds,names,dims,block,blocks,stairs,hasFloor,slabRects,boundary,doorLine,doorPosts,validate,hasShapes:p=>Object.values(p.cells).some(c=>kinds.has(c.type)||c.type==='void')});
})();
