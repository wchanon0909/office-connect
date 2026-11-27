/* V6.1 Living Environment: scene registry, admin-placed furniture, Bangkok lighting, original ambient sound. */
'use strict';
window.OC61_WORLD=(()=>{
 const CELL=1.82;
 // New rooms can register their own layout and decoration in a later release.
 const scenes=Object.freeze({'main-office':Object.freeze({id:'main-office',title:'Main Office'})});
 const definitions=Object.freeze({
  coffee:{name:'เครื่องชงกาแฟ',action:'ไปชงกาแฟ'},water:{name:'ตู้น้ำ',action:'ไปดื่มน้ำ'},printer:{name:'เครื่องปริ้น',action:'ไปที่เครื่องปริ้น'},fridge:{name:'ตู้เย็นและขนม',action:'ไปหยิบขนม'},cabinet:{name:'ตู้เก็บเอกสาร',action:'ไปที่ตู้เอกสาร'},sofa:{name:'มุมโซฟา',action:'ไปยืนพักที่โซฟา'},plants:{name:'มุมต้นไม้',action:'ไปดูต้นไม้'},books:{name:'ชั้นหนังสือ',action:null},window:{name:'หน้าต่างกระจก',action:null}
 });
 function objects(p){if(!p?.cells)return [];return Object.entries(p.cells).filter(([,c])=>Object.hasOwn(definitions,c.type)).map(([key,c])=>{const [x,y]=key.split(',').map(Number),angle=-(c.rotation||0)*Math.PI/180;const front=[Math.round(Math.sin(angle)),Math.round(Math.cos(angle))],directions=[front,[front[1],-front[0]],[-front[1],front[0]],[-front[0],-front[1]]];const shift=window.OC612_STUDIO.offset(p,x,y,c);const target=Math.hypot(...shift)>1.4?key:directions.map(([dx,dy])=>[x+dx,y+dy]).filter(([xx,yy])=>xx>=0&&yy>=0&&xx<p.cols&&yy<p.rows).map(([xx,yy])=>`${xx},${yy}`).find(k=>(p.cells[k]?.type||'aisle')==='aisle')||null;return {...definitions[c.type],id:key,kind:c.type,key,target:!definitions[c.type].action?null:['water','coffee','printer','fridge'].includes(c.type)?key:target,x:(x-(p.cols-1)/2)*CELL+shift[0],z:(y-(p.rows-1)/2)*CELL+shift[1],angle};});}
 // Explicit drink visits use a shared slot and arrival timestamp. Free walking never starts a drink.
 function drinkState(o,m,r,t,reduced=false){
  if(!o||!['water','coffee'].includes(o.kind)||!m||!r||m.moving||m.returning||m.pose!=='stand'||m.gesture!=null||m.activity!=='walk'||r.returning||!Array.isArray(r.route)||!r.route.length||!r.slot?.startsWith(`drink:${o.key}:`)||!Number.isFinite(r.pose_angle)||!Number.isFinite(r.pose_x)||!Number.isFinite(r.pose_y))return null;
  if(Math.abs(Math.atan2(Math.sin(m.angle-o.angle),Math.cos(m.angle-o.angle)))>.06)return null;
  const ms=t-r.started_ms-(r.route.length-1)*850-420;
  if(ms<0||ms>=5200)return null;
  // shoulder X/Z, elbow X, cup tilt, head tilt, body lowering, forward lean
  const hold=[.287,-.175,.812,0,0,0,0],fill=[.621,-.335,.431,0,.04,.06,-.06],sip=[.636,-1.082,1.450,.34,.09,0,0];
  const frames=[[0,hold],[650,fill],[1500,fill],[2250,sip],[3550,sip],[4350,hold],[5200,hold]];
  let pose=sip;if(!reduced){let i=1;while(i<frames.length-1&&ms>frames[i][0])i++;const [a,A]=frames[i-1],[b,B]=frames[i];let f=Math.max(0,Math.min(1,(ms-a)/(b-a)));f=f*f*(3-2*f);pose=A.map((v,j)=>v+(B[j]-v)*f);}
  const [shoulder,side,elbow,tilt,head,drop,lean]=pose;
  // Same link lengths and Euler XYZ order as the standing avatar rig.
  const yy=-.18-.18*Math.cos(elbow),zz=-.18*Math.sin(elbow),y1=yy*Math.cos(side);
  const wrist=[.223-yy*Math.sin(side),1.08+Math.cos(shoulder)*y1-Math.sin(shoulder)*zz,Math.sin(shoulder)*y1+Math.cos(shoulder)*zz];
  return {shoulder,side,elbow,tilt,head,drop,lean,wrist,cup:[wrist[0],wrist[1]+.025,wrist[2]-.025],stage:ms<1500?'fill':ms<3550?'sip':'lower'};
 }
 // Shared visit slot is server-authoritative. Never animate merely passing an appliance.
 function applianceState(o,p,m,r,t,reduced=false){
  if(!o||!['printer','fridge'].includes(o.kind)||!r?.slot?.startsWith(`appliance:${o.key}:`)||!m||m.moving||m.returning||r.returning||m.activity!=='walk'||m.pose!=='stand'||m.gesture!=null||!Array.isArray(r.route)||!r.route.length||![r.pose_x,r.pose_y,r.pose_angle].every(Number.isFinite))return null;
  if(Math.abs(Math.atan2(Math.sin(m.angle-o.angle),Math.cos(m.angle-o.angle)))>.06)return null;
  const x=(m.x-(p.cols-1)/2)*CELL-o.x,z=(m.y-(p.rows-1)/2)*CELL-o.z,front=x*Math.sin(o.angle)+z*Math.cos(o.angle),side=x*Math.cos(o.angle)-z*Math.sin(o.angle),expectedSide=o.kind==='fridge'?-.32:0;
  if(!Number.isFinite(front)||front<.80||front>.90||Math.abs(side-expectedSide)>.08)return null;
  const ms=t-r.started_ms-(r.route.length-1)*850-420,duration=o.kind==='printer'?4200:4800;if(ms<0||ms>=duration)return null;
  const angle=o.angle,neutral=[0,0,0,0,0,0,0],reach=[.94,-.06,.52,.045,.025,-Math.min(.105,Math.max(.06,front-.75)),0],read=[.51,-.12,1.14,.19,0,0,.17],grab=[.72,-.12,.40,.12,.20,-.09,0],snack=[.66,-.68,1.30,.05,0,0,.10];
  const frames=o.kind==='printer'?[[0,neutral],[700,reach],[1400,reach],[2100,read],[3100,read],[4000,neutral],[4200,neutral]]:[[0,neutral],[720,reach],[1400,grab],[2200,grab],[2900,snack],[3700,snack],[4600,neutral],[4800,neutral]];
  let i=1;while(i<frames.length-1&&ms>frames[i][0])i++;const [a,A]=frames[i-1],[b,B]=frames[i];let f=Math.max(0,Math.min(1,(ms-a)/(b-a)));f=f*f*(3-2*f);let pose=reduced?(o.kind==='printer'?read:snack):A.map((v,j)=>v+(B[j]-v)*f);const [shoulder,sideAngle,elbow,head,drop,lean,paperTilt]=pose;
  const ease=v=>{v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);};
  return {kind:o.kind,angle,shoulder,side:sideAngle,elbow,head,drop,lean,paperTilt,holding:o.kind==='printer'?ms>=1400&&ms<4000:ms>=1900&&ms<4600,door:o.kind==='fridge'&&!reduced?ease((ms-400)/650)*(1-ease((ms-2100)/850)):0,sheet:o.kind==='printer'&&!reduced?ease((ms-400)/850)*(1-ease((ms-1400)/180)):0};
 }
 function applianceVisual(decor,key,state){const v=decor?.appliances?.get(key);if(!v)return;if(v.hinge)v.hinge.rotation.y=state?.door?-.55*state.door:0;if(v.sheet){v.sheet.position.z=.38+(state?.sheet||0)*.17;v.sheet.visible=!(state?.holding);}}
 function at(p,key){return objects(p).find(o=>o.key===key)||null;}
 function lighting(date=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date),h=Number(parts.find(x=>x.type==='hour').value)+Number(parts.find(x=>x.type==='minute').value)/60;
  if(h<6||h>=19)return {phase:'night',label:'กลางคืน',sky:0x17243e,hemi:1.65,sun:1.15,fill:1.15,sunColor:0xb0c6ff,glass:0x52729e,city:0x344564};
  if(h<8)return {phase:'morning',label:'ยามเช้า',sky:0x7c99b2,hemi:2.0,sun:2.7,fill:.85,sunColor:0xffd6a2,glass:0x9cc7dc,city:0x6c849c};
  if(h>=17)return {phase:'sunset',label:'ยามเย็น',sky:0x8e687b,hemi:1.85,sun:2.25,fill:1,sunColor:0xffbd8b,glass:0xd7adba,city:0x6a688c};
  return {phase:'day',label:'กลางวัน',sky:0x7398ba,hemi:2.1,sun:3.1,fill:.8,sunColor:0xffecd4,glass:0xa8d1e5,city:0x7894ab};
 }
 function decorate(p,H){const {T,root,box,round,ball,mat,pivot}=H;const out=[],allObjects=[],edgeObjects=[],appliances=new Map(),W=p.cols*CELL,D=p.rows*CELL;
  const cream=mat(0xe7e4dc), charcoal=mat(0x38434e), gray=mat(0x83919a), wood=mat(0xb79570), steel=mat(0xa6b5bc,.35,.4), blue=mat(0x74bddd), green=mat(0x6e9a67), soil=mat(0x6e5140), coral=mat(0xd79875), books=[mat(0x7d9fc0),mat(0xc19d65),mat(0x9a83b1),mat(0x789982)];
  const glass=new T.MeshStandardMaterial({color:0xa8d1e5,transparent:true,opacity:.32,roughness:.22,metalness:.1,depthWrite:false,side:T.DoubleSide});
  const cityMat=new T.MeshStandardMaterial({color:0x7894ab,roughness:1}), glow=new T.MeshStandardMaterial({color:0xf6dfad,emissive:0xffc477,emissiveIntensity:.1,roughness:.6});
  // No default placement. Windows and props exist only when placed in the saved layout.
  const vista=null;
  function pot(g,x,z,s=.8){round(g,soil,x,.18*s,z,.17*s,.36*s);for(let j=0;j<5;j++){const a=j*2.4;const leaf=ball(g,green,x+Math.cos(a)*.12*s,.48*s+(j%2)*.09*s,z+Math.sin(a)*.12*s,.13*s,.24*s,.085*s);leaf.rotation.z=Math.sin(a)*.5;}}
  for(const o of objects(p)){const g=pivot(root,o.x,0,o.z);g.rotation.y=o.angle;g.userData.oc61Prop=o.id;g.userData.oc61Key=o.key;g.userData.oc61Label=o.name;allObjects.push(g);if(o.action&&o.target)out.push(g);
   if(o.kind==='window'){box(g,cream,0,.25,0,1.65,.50,.17,false);box(g,glass,0,1.37,0,1.52,1.72,.035,false);for(const dx of [-.81,0,.81])box(g,charcoal,dx,1.37,0,.06,1.77,.10,false);for(const yy of [.52,2.22])box(g,charcoal,0,yy,0,1.68,.075,.12,false);continue;}
   if(o.kind==='coffee'){box(g,wood,0,.43,-.05,1.42,.82,.76);box(g,cream,0,.86,-.05,1.47,.075,.79);box(g,charcoal,-.25,1.13,-.13,.57,.48,.48);box(g,steel,-.25,1.20,.12,.52,.29,.04);box(g,charcoal,-.25,.98,.18,.47,.10,.29);box(g,blue,-.25,1.29,.145,.21,.07,.025);round(g,cream,-.25,1.00,.22,.075,.14);for(let i=0;i<3;i++)round(g,cream,.18+i*.14,.95,.12,.055,.13);}
   else if(o.kind==='water'){box(g,cream,0,.54,-.02,.58,1.05,.50);box(g,charcoal,0,.79,.24,.38,.34,.045);box(g,blue,-.11,.89,.28,.10,.10,.07);box(g,coral,.11,.89,.28,.10,.10,.07);box(g,steel,0,.60,.27,.34,.05,.14);round(g,blue,0,1.35,-.02,.24,.55);round(g,cream,0,1.09,-.02,.18,.10);}
   else if(o.kind==='printer'){box(g,wood,0,.35,0,1.33,.65,.76);box(g,cream,0,.88,-.02,1.03,.48,.64);box(g,charcoal,0,1.15,-.03,.97,.12,.58);box(g,steel,0,1.22,-.12,.81,.05,.35);box(g,charcoal,0,.85,.31,.67,.12,.04);const sheet=box(g,cream,0,.83,.38,.45,.018,.19);appliances.set(o.key,{sheet});box(g,blue,.37,1.20,.25,.16,.035,.10);}
   else if(o.kind==='fridge'){box(g,steel,-.32,.74,-.08,.64,1.43,.67);box(g,cream,-.32,1.13,.28,.59,.62,.06);const hinge=pivot(g,-.615,0,.28);box(hinge,cream,.295,.40,0,.59,.76,.06);box(hinge,charcoal,.51,.53,.055,.045,.22,.045);box(g,charcoal,-.53,1.05,.33,.045,.22,.045);appliances.set(o.key,{hinge});box(g,wood,.45,.42,0,.68,.8,.65);for(let i=0;i<3;i++)box(g,books[i],.21+i*.19,.9,.04,.13,.17,.14);}
   else if(o.kind==='cabinet'){box(g,cream,0,.80,-.07,1.27,1.55,.70);for(const x of [-.32,.32]){box(g,gray,x,.80,.30,.59,1.42,.055);box(g,charcoal,x+(x<0?.2:-.2),.83,.35,.06,.17,.04);}box(g,wood,0,1.59,-.07,1.31,.06,.74);}
   else if(o.kind==='sofa'){const fabric=mat(0x72918d);box(g,wood,0,.17,0,1.46,.18,.72);box(g,fabric,0,.34,.06,1.40,.26,.68);box(g,fabric,0,.67,-.26,1.45,.56,.21);for(const x of [-.65,.65])box(g,fabric,x,.52,.02,.19,.36,.68);for(const x of [-.33,.33])box(g,mat(0xa6b9ad),x,.50,.03,.55,.08,.49);box(g,coral,.35,.68,-.16,.24,.26,.12);}
   else if(o.kind==='plants'){pot(g,-.4,0,1.5);pot(g,.40,-.06,1.25);}
   else if(o.kind==='books'){box(g,wood,0,.77,-.23,1.32,1.50,.13);for(const x of [-.64,.64])box(g,wood,x,.77,-.04,.09,1.50,.45);for(let j=0;j<4;j++){const y=.10+j*.43;box(g,wood,0,y,-.04,1.35,.07,.45);if(j<3)for(let k=0;k<6;k++)box(g,books[(j+k)%4],-.50+k*.18,y+.18,-.05,.13,.23+((j+k)%2)*.07,.29);}}
  }
  // Perimeter windows are independent of floor cells, so desks/props may share a boundary cell.
  for(const key of Object.keys(p.edges||{})){const q=window.OC612_STUDIO.edgePoint(p,key);if(!q)continue;const g=pivot(root,q.x,0,q.z);g.rotation.y=q.angle;g.userData.studioEdge=key;edgeObjects.push(g);box(g,cream,0,.25,0,1.78,.50,.13,false);box(g,glass,0,1.37,0,1.68,1.72,.035,false);for(const dx of [-.86,0,.86])box(g,charcoal,dx,1.37,0,.06,1.77,.10,false);for(const yy of [.52,2.22])box(g,charcoal,0,yy,0,1.79,.075,.12,false);}
  return {pickables:out,allObjects,edgeObjects,vista,glass,cityMat,glow,appliances};
 }
 function applyLighting(T,scene,hemi,sun,fill,decor,date){const base=lighting(date),l=window.OC63_THEME?.lighting(base)||base;scene.background=new T.Color(l.sky);hemi.intensity=l.hemi;sun.intensity=l.sun;sun.color=new T.Color(l.sunColor);fill.intensity=l.fill;if(decor){decor.glass.color=new T.Color(l.glass);decor.cityMat.color=new T.Color(l.city);decor.glow.emissiveIntensity=l.phase==='night'?1.2:l.phase==='sunset'?.65:.08;}return l;}
 return {scenes,activeScene:'main-office',definitions,objects,at,drinkState,applianceState,applianceVisual,lighting,decorate,applyLighting};
})();
// Original procedural ambient motif, opt-in only. No recording or external audio dependency.
window.OC61_AMBIENT=(()=>{
 let ctx=null,master=null,timer=null,enabled=false,step=0;const notes=[48,55,60,64,50,57,62,65,45,52,57,60,43,50,55,59], seasonal={christmas:[48,60,67,64,50,62,69,65,53,65,72,69,55,62,67,71],newyear:[55,62,67,71,57,64,69,72,53,60,65,69,55,62,67,74],songkran:[48,55,60,62,64,67,64,62,50,57,62,64,67,69,67,64]};
 function tone(){if(!enabled||!ctx||document.hidden||ctx.state!=='running')return;const q=window.OC63_THEME?.selected();if(q?.music==='off'){stop();return;}const melody=q?.music==='festive'?(seasonal[q.theme]||notes):notes;const t=ctx.currentTime+.03,n=melody[step++%melody.length];for(const [offset,gain] of [[0,.09],[12,.022]]){const osc=ctx.createOscillator(),g=ctx.createGain();osc.type='sine';osc.frequency.value=440*2**((n+offset-69)/12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+2.1);osc.connect(g);g.connect(master);osc.start(t);osc.stop(t+2.15);}}
 async function toggle(){if(enabled){stop();return false;}if(window.OC63_THEME?.selected().music==='off')throw Error('Admin ปิดเพลงในธีมนี้');const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Browser นี้ไม่รองรับเสียง');if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=.27;master.connect(ctx.destination);}await ctx.resume();if(document.hidden){await ctx.suspend();return false;}enabled=true;tone();timer=setInterval(tone,1450);return true;}
 function stop(){enabled=false;clearInterval(timer);timer=null;ctx?.suspend().catch(()=>{});}document.addEventListener('visibilitychange',()=>{if(document.hidden&&enabled)stop();});return {toggle,stop,enabled:()=>enabled};
})();
