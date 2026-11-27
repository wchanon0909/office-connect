/* Office Connect V5.4: deterministic visual motion, no RPC/database writes.
 * Grid-space coordinates; authoritative route, reservation, arrival and chat stay in OC50.
 */
'use strict';
window.OC54_MOTION=(()=>{
 const CELL=1.82, STEP=850, RADIUS=.15, CORNER=.20, LANE=.23;
 const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
 const smooth=n=>{n=clamp(n);return n*n*(3-2*n);};
 const lerp=(a,b,t)=>a+(b-a)*t;
 const point=k=>k.split(',').map(Number);
 const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 const angle=(x,y)=>Math.atan2(-x,-y);
 const angleDelta=(a,b)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
 const blendAngle=(a,b,t)=>a+angleDelta(a,b)*clamp(t);
 // Rectangles match the floor footprints of the current renderer. No geometry changes.
 function clearance(plan,deskOffset,plantOffset){
  const rects=[],doors=[],studio=window.OC612_STUDIO,stairs=studio.stairwell(plan);const add=(cx,cy,rot,lx,lz,w,d)=>{
   const co=Math.cos(rot),si=Math.sin(rot),x=cx+(co*lx+si*lz)/CELL,y=cy+(-si*lx+co*lz)/CELL;
   const hw=(Math.abs(co)*w+Math.abs(si)*d)/(2*CELL),hh=(Math.abs(si)*w+Math.abs(co)*d)/(2*CELL);
   rects.push({x1:x-hw,x2:x+hw,y1:y-hh,y2:y+hh});
  };
  for(const [key,c] of Object.entries(plan.cells)){
   let [x,y]=point(key);let rot=-(c.rotation||0)*Math.PI/180;
   if(c.type==='desk'){
    const [dx,dz]=deskOffset(plan,x,y,c);x+=dx/CELL;y+=dz/CELL;
    const exec=['D-063','D-073'].includes(c.id);
    add(x,y,rot,0,exec?-.23:-.21,exec?1.75:1.63,exec?1.32:.90);
    add(x,y,rot,0,exec?.60:.54,exec?.82:.68,exec?.77:.65);
   }else if(c.type==='plant'){
    const [dx,dz]=plantOffset(plan,x,y);add(x+dx/CELL,y+dz/CELL,0,0,0,.83,.83);
   }else if(['roundTable','longTable','stairs','void'].includes(c.type)){add(x,y,0,0,0,CELL,CELL);
   }else if(c.type==='doubleDoor'){const b=window.OC667_SHAPES.block(plan,key);if(b&&c.part===0){for(const q of window.OC667_SHAPES.doorPosts(b))add(q.x,q.y,-b.rotation*Math.PI/180,0,0,.13,.20);for(const k of b.keys){const [dx,dy]=point(k);doors.push({x:dx,y:dy});}}
   }else if(c.type==='meeting'){
    add(x,y,rot,0,0,1.5,.85);for(const z of [-.66,.66])add(x,y,rot,0,z,.48,.46);
   }else if(['coffee','water','printer','fridge','cabinet','sofa','plants','books','window'].includes(c.type)){const [dx,dz]=window.OC612_STUDIO?.offset(plan,x,y,c)||[0,0];add(x+dx/CELL,y+dz/CELL,rot,0,c.type==='water'?.035:0,c.type==='water'?.65:1.66,c.type==='water'?.65:c.type==='window'?.20:1.08);
   }else if(c.type==='wall'||c.type==='door'){
    if(stairs&&studio.reserved(plan,x,y,stairs)){add(x,y,0,0,0,CELL,CELL);continue;}
    const shape=studio.wallGeometry(plan,x,y,stairs);
    for(const r of shape.runs){rot=r.vertical?Math.PI/2:0;for(const piece of r.segments)add(x,y,rot,piece.x,-r.offset,piece.w,r.capDepth);}
    if(shape.door)doors.push({x,y});
   }
  }
  if(studio.edgeMode(plan))for(const k of Object.keys(plan.wallEdges)){const q=studio.wallEdgePoint(plan,k),r=studio.wallEdgeShape(plan,k),x=q.x/CELL+(plan.cols-1)/2,y=q.z/CELL+(plan.rows-1)/2;for(const piece of r.segments)add(x,y,r.vertical?Math.PI/2:0,piece.x,0,piece.w,r.capDepth);if(r.door)doors.push({x,y});}
  const buckets=new Map();for(const r of rects){for(let x=Math.floor(r.x1-RADIUS);x<=Math.ceil(r.x2+RADIUS);x++)for(let y=Math.floor(r.y1-RADIUS);y<=Math.ceil(r.y2+RADIUS);y++){const k=`${x},${y}`;if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(r);}}
  function free(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||x<-.5+RADIUS||y<-.5+RADIUS||x>plan.cols-.5-RADIUS||y>plan.rows-.5-RADIUS)return false;
   for(const r of buckets.get(`${Math.round(x)},${Math.round(y)}`)||[]){const dx=Math.max(r.x1-x,0,x-r.x2),dy=Math.max(r.y1-y,0,y-r.y2);if(dx*dx+dy*dy<RADIUS*RADIUS)return false;}return true;}
  function segment(a,b){const n=Math.max(1,Math.ceil(dist(a,b)/.035));for(let i=0;i<=n;i++){const t=i/n;if(!free(lerp(a.x,b.x,t),lerp(a.y,b.y,t)))return false;}return true;}
  return {free,segment,doorFactor:(x,y)=>doors.reduce((v,d)=>Math.min(v,smooth((Math.hypot(x-d.x,y-d.y)-.8)/.65)),1),rects};
 }
 // Round only a right angle inside a verified unobstructed corridor. It starts and
 // ends at exactly the same timestamps and points as the original grid route.
 function rounded(raw,record,t,field){
  if(!raw||!record||!raw.moving)return raw;
  const u=(t-record.started_ms)/STEP,last=record.route.length-1;
  if(u<0||u>=last){
   // Face the direction of the short final approach, then settle toward the reserved pose.
   if(u>=last&&Number.isFinite(record.pose_x)&&Number.isFinite(record.pose_y)&&Number.isFinite(record.pose_angle)){
    const a=point(record.route[last]),dx=record.pose_x-a[0],dy=record.pose_y-a[1];
    if(Math.hypot(dx,dy)>.025)return {...raw,angle:blendAngle(angle(dx,dy),record.pose_angle,smooth((u-last)*STEP/420))};
   }return raw;
  }
  const j=Math.round(u);if(j<=0||j>=last||Math.abs(u-j)>=CORNER)return raw;
  const a=point(record.route[j-1]),b=point(record.route[j]),c=point(record.route[j+1]);
  const ix=b[0]-a[0],iy=b[1]-a[1],ox=c[0]-b[0],oy=c[1]-b[1];
  if(Math.abs(ix)+Math.abs(iy)!==1||Math.abs(ox)+Math.abs(oy)!==1||ix*ox+iy*oy!==0)return raw;
  const p0={x:b[0]-ix*CORNER,y:b[1]-iy*CORNER},p2={x:b[0]+ox*CORNER,y:b[1]+oy*CORNER};
  const at=f=>({x:(1-f)**2*p0.x+2*f*(1-f)*b[0]+f*f*p2.x,y:(1-f)**2*p0.y+2*f*(1-f)*b[1]+f*f*p2.y});
  let prev=p0;for(let i=1;i<=8;i++){const next=at(i/8);if(!field.segment(prev,next))return raw;prev=next;}
  const f=clamp((u-j+CORNER)/(2*CORNER)),p=at(f);if(!field.segment(raw,p))return raw;
  return {...raw,...p,angle:angle(lerp(ix,ox,f),lerp(iy,oy,f)),rounded:true};
 }
 // All visual adjustments are bounded; no local route writes, delays or changes to
 // arrival. Reserved seats/huddle positions are never shifted. In tight passages
 // keep the original single-file route rather than stepping through furniture.
 function solve(entries,t,field,sample){
  const times=[-180,0,250,500];const prepared=entries.map(({id,motion,record})=>{
   const raw=record?sample(record,t):motion;const m=rounded(raw,record,t,field);return {id,record,m,pred:times.map(dt=>record?rounded(sample(record,t+dt),record,t+dt,field):m)};
  }).filter(v=>v.m);
  return prepared.map(a=>{
   const m=a.m,r=a.record;if(!m.moving||!r)return {id:a.id,motion:m};
   const u=(t-r.started_ms)/STEP,last=r.route.length-1;if(u<=0||u>=last)return {id:a.id,motion:m};
   const gate=smooth(u/.40)*smooth((last-u)/.40)*field.doorFactor(m.x,m.y);if(gate<.005||!field.free(m.x,m.y))return {id:a.id,motion:m};
   const dx=-Math.sin(m.angle),dy=-Math.cos(m.angle),nx=-dy,ny=dx;
   let weight=0,sign=1,closest=null;
   for(const b of prepared){if(b.id===a.id)continue;let min=Infinity;for(let i=0;i<times.length;i++)if(a.pred[i]&&b.pred[i])min=Math.min(min,dist(a.pred[i],b.pred[i]));
    if(min>=.88)continue;const dot=m.moving&&b.m.moving?Math.cos(angleDelta(m.angle,b.m.angle)):0;
    // Head-on walkers both keep right. For parked people or slow followers,
    // prefer the side away from the nearest obstacle/person.
    const ahead=(b.m.x-m.x)*dx+(b.m.y-m.y)*dy;if(dot>.75&&ahead<-.08)continue;
    const w=smooth((.88-min)/.59);if(w<=weight)continue;weight=w;closest=b;
    const cross=(b.m.x-m.x)*nx+(b.m.y-m.y)*ny;sign=dot<-.45?1:Math.abs(cross)<.035?1:cross>0?-1:1;
   }
   if(!closest||weight<.005)return {id:a.id,motion:m};
   const magnitude=LANE*gate*weight;let choice=null;
   candidate: for(const side of [sign,-sign])for(const factor of [1,.75,.5,.25]){
    const p={x:m.x+nx*magnitude*side*factor,y:m.y+ny*magnitude*side*factor};if(!field.segment(m,p))continue;
    // Don't steer closer to a parked person. Two head-on walkers are allowed
    // to choose complementary lanes even before their predicted paths meet.
    if(!closest.m.moving&&dist(p,closest.m)+.01<dist(m,closest.m))continue;
    choice=p;break candidate;
   } // preserve first valid preferred side rather than switching across the lane
   if(!choice)return {id:a.id,motion:m};return {id:a.id,motion:{...m,...choice,avoiding:true}};
  });
 }
 function gait(phase,weight=1){const f=phase*1.08,am=clamp(weight),s=Math.sin(f),r=Math.sin(f+Math.PI);return {hips:[s*.40*am,r*.40*am],knees:[-Math.max(0,s)*.63*am,-Math.max(0,r)*.63*am],arms:[-s*.31*am,-r*.31*am],elbows:[(.08+Math.max(0,-s)*.17)*am,(.08+Math.max(0,-r)*.17)*am],bob:Math.abs(s)*.035*am,roll:Math.cos(f)*.035*am,lean:.045*am};}
 // The avatar's face is -Z. Solve hand targets in the avatar-local frame, not camera space.
 function handPose(kind,side,phase,seated=false){
  const clap=kind==='clap',sign=side===0?-1:1;
  const gap=clap?.046+.085*(.5+.5*Math.cos(phase*1.8)):.035;
  const dx=sign*(gap-(seated?.171:.223)),dy=clap?.055:.10,dz=seated?-.235:-.22;
  const h=Math.hypot(dx,dz),theta=Math.atan2(h,-dy),yaw=Math.atan2(-dx,-dz);
  const reach=Math.min(.359,Math.hypot(h,dy)),elbow=seated?0:2*Math.acos(reach/.36);
  return {pitch:seated?theta-Math.atan2(.285,.115):theta-elbow/2,yaw,elbow};
 }
 const directions=[[0,1],[-1,0],[1,0],[0,-1]];
 function keyboardDirection(key,azimuth=0){const a=Math.round(azimuth/90)*Math.PI/2,up=[-Math.round(Math.sin(a)),-Math.round(Math.cos(a))],right=[Math.round(Math.cos(a)),-Math.round(Math.sin(a))];return key==='ArrowUp'?up:key==='ArrowDown'?up.map(x=>-x):key==='ArrowRight'?right:key==='ArrowLeft'?right.map(x=>-x):null;}
 function keyboardCell(plan,x,y,field){
  if(x<0||y<0||x>=plan.cols||y>=plan.rows)return 'outside';
  const c=plan.cells[`${x},${y}`],type=c?.type||'aisle';
  if(type==='doubleDoor')return 'door';if(type==='aisle'||type==='door')return type;
  const off=window.OC612_STUDIO?.offset(plan,x,y,c)||[0,0];
  if(type==='wall'&&x===6&&y===2&&plan.cols===10&&plan.rows===19&&plan.cells['6,0']?.type==='wall'&&plan.cells['6,1']?.type==='wall'&&plan.cells['6,3']?.type==='door'&&plan.cells['7,3']?.type==='wall')return 'aisle';
  if(type==='plant'&&plan.cols===10&&plan.rows===19&&y===4&&[3,6].includes(x)&&plan.cells['0,4']?.id==='D-077'&&plan.cells['8,4']?.id==='D-082')return 'aisle';
  if(['desk','coffee','water','printer','fridge','cabinet','sofa','plants','books'].includes(type)&&Math.abs(off[0])+Math.abs(off[1])>1.4&&field?.free(x,y))return 'aisle';
  return type;
 }
 function keyboardAnchor(plan,key,field){if(!key)return null;const q=[point(key)],seen=new Set([key]);for(let i=0;i<q.length;i++){const [x,y]=q[i];if(keyboardCell(plan,x,y,field)==='aisle'&&field?.free(x,y)&&directions.some(([dx,dy])=>keyboardCell(plan,x+dx,y+dy,field)==='aisle'))return `${x},${y}`;for(const [dx,dy] of directions){const nx=x+dx,ny=y+dy,k=`${nx},${ny}`,type=keyboardCell(plan,nx,ny,field);if(seen.has(k)||['outside','wall','door','roundTable','longTable','stairs','void'].includes(type))continue;seen.add(k);q.push([nx,ny]);}}return null;}
 function keyboardTarget(plan,source,key,azimuth,field){if(!source||!field)return null;const d=keyboardDirection(key,azimuth);if(!d)return null;const [x,y]=point(source),[dx,dy]=d;let nx=x+dx,ny=y+dy;const cell=(a,b)=>keyboardCell(plan,a,b,field);if(cell(nx,ny)==='door'){const horizontal=window.OC612_STUDIO.side(plan,nx,ny)==='N';if(horizontal?dx!==0:dy!==0)return null;nx+=dx;ny+=dy;if(cell(nx,ny)!=='aisle'||!field.free(nx,ny))return null;}else if(cell(nx,ny)!=='aisle'||!field.segment({x,y},{x:nx,y:ny}))return null;return `${nx},${ny}`;}
 return Object.freeze({clearance,rounded,solve,gait,blendAngle,smooth,handPose,keyboardDirection,keyboardCell,keyboardAnchor,keyboardTarget,STEP,CELL,RADIUS,LANE});
})();
