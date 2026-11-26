/* V6.1 Living Environment: scene registry, admin-placed furniture, Bangkok lighting, original ambient sound. */
'use strict';
window.OC61_WORLD=(()=>{
 const CELL=1.82;
 // New rooms can register their own layout and decoration in a later release.
 const scenes=Object.freeze({'main-office':Object.freeze({id:'main-office',title:'Main Office'})});
 const definitions=Object.freeze({
  coffee:{name:'เครื่องชงกาแฟ',action:'ไปชงกาแฟ'},water:{name:'ตู้น้ำ',action:'ไปดื่มน้ำ'},printer:{name:'เครื่องปริ้น',action:'ไปที่เครื่องปริ้น'},fridge:{name:'ตู้เย็นและขนม',action:'ไปหยิบขนม'},cabinet:{name:'ตู้เก็บเอกสาร',action:'ไปที่ตู้เอกสาร'},sofa:{name:'มุมโซฟา',action:'ไปยืนพักที่โซฟา'},plants:{name:'มุมต้นไม้',action:'ไปดูต้นไม้'},books:{name:'ชั้นหนังสือ',action:'ไปที่ชั้นหนังสือ'},window:{name:'หน้าต่างกระจก',action:null}
 });
 function objects(p){if(!p?.cells)return [];return Object.entries(p.cells).filter(([,c])=>Object.hasOwn(definitions,c.type)).map(([key,c])=>{const [x,y]=key.split(',').map(Number),angle=-(c.rotation||0)*Math.PI/180;const front=[Math.round(Math.sin(angle)),Math.round(Math.cos(angle))],directions=[front,[front[1],-front[0]],[-front[1],front[0]],[-front[0],-front[1]]];const target=directions.map(([dx,dy])=>[x+dx,y+dy]).filter(([xx,yy])=>xx>=0&&yy>=0&&xx<p.cols&&yy<p.rows).map(([xx,yy])=>`${xx},${yy}`).find(k=>(p.cells[k]?.type||'aisle')==='aisle')||null;return {...definitions[c.type],id:key,kind:c.type,key,target:c.type==='window'?null:target,x:(x-(p.cols-1)/2)*CELL,z:(y-(p.rows-1)/2)*CELL,angle};});}
 function at(p,key){return objects(p).find(o=>o.key===key)||null;}
 function lighting(date=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Bangkok',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date),h=Number(parts.find(x=>x.type==='hour').value)+Number(parts.find(x=>x.type==='minute').value)/60;
  if(h<6||h>=19)return {phase:'night',label:'กลางคืน',sky:0x17243e,hemi:1.65,sun:1.15,fill:1.15,sunColor:0xb0c6ff,glass:0x52729e,city:0x344564};
  if(h<8)return {phase:'morning',label:'ยามเช้า',sky:0x7c99b2,hemi:2.0,sun:2.7,fill:.85,sunColor:0xffd6a2,glass:0x9cc7dc,city:0x6c849c};
  if(h>=17)return {phase:'sunset',label:'ยามเย็น',sky:0x8e687b,hemi:1.85,sun:2.25,fill:1,sunColor:0xffbd8b,glass:0xd7adba,city:0x6a688c};
  return {phase:'day',label:'กลางวัน',sky:0x7398ba,hemi:2.1,sun:3.1,fill:.8,sunColor:0xffecd4,glass:0xa8d1e5,city:0x7894ab};
 }
 function decorate(p,H){const {T,root,box,round,ball,mat,pivot}=H;const out=[],W=p.cols*CELL,D=p.rows*CELL;
  const cream=mat(0xe7e4dc), charcoal=mat(0x38434e), gray=mat(0x83919a), wood=mat(0xb79570), steel=mat(0xa6b5bc,.35,.4), blue=mat(0x74bddd), green=mat(0x6e9a67), soil=mat(0x6e5140), coral=mat(0xd79875), books=[mat(0x7d9fc0),mat(0xc19d65),mat(0x9a83b1),mat(0x789982)];
  const glass=new T.MeshStandardMaterial({color:0xa8d1e5,transparent:true,opacity:.32,roughness:.22,metalness:.1,depthWrite:false,side:T.DoubleSide});
  const cityMat=new T.MeshStandardMaterial({color:0x7894ab,roughness:1}), glow=new T.MeshStandardMaterial({color:0xf6dfad,emissive:0xffc477,emissiveIntensity:.1,roughness:.6});
  // No default placement. Windows and props exist only when placed in the saved layout.
  const vista=null;
  function pot(g,x,z,s=.8){round(g,soil,x,.18*s,z,.17*s,.36*s);for(let j=0;j<5;j++){const a=j*2.4;const leaf=ball(g,green,x+Math.cos(a)*.12*s,.48*s+(j%2)*.09*s,z+Math.sin(a)*.12*s,.13*s,.24*s,.085*s);leaf.rotation.z=Math.sin(a)*.5;}}
  for(const o of objects(p)){const g=pivot(root,o.x,0,o.z);g.rotation.y=o.angle;g.userData.oc61Prop=o.id;g.userData.oc61Key=o.key;g.userData.oc61Label=o.name;if(o.action&&o.target)out.push(g);
   if(o.kind==='window'){box(g,cream,0,.25,0,1.65,.50,.17,false);box(g,glass,0,1.37,0,1.52,1.72,.035,false);for(const dx of [-.81,0,.81])box(g,charcoal,dx,1.37,0,.06,1.77,.10,false);for(const yy of [.52,2.22])box(g,charcoal,0,yy,0,1.68,.075,.12,false);continue;}
   if(o.kind==='coffee'){box(g,wood,0,.43,-.05,1.42,.82,.76);box(g,cream,0,.86,-.05,1.47,.075,.79);box(g,charcoal,-.25,1.13,-.13,.57,.48,.48);box(g,steel,-.25,1.20,.12,.52,.29,.04);box(g,charcoal,-.25,.98,.18,.47,.10,.29);box(g,blue,-.25,1.29,.145,.21,.07,.025);round(g,cream,-.25,1.00,.22,.075,.14);for(let i=0;i<3;i++)round(g,cream,.18+i*.14,.95,.12,.055,.13);}
   else if(o.kind==='water'){box(g,cream,0,.54,-.02,.58,1.05,.50);box(g,charcoal,0,.79,.24,.38,.34,.045);box(g,blue,-.11,.89,.28,.10,.10,.07);box(g,coral,.11,.89,.28,.10,.10,.07);box(g,steel,0,.60,.27,.34,.05,.14);round(g,blue,0,1.35,-.02,.24,.55);round(g,cream,0,1.09,-.02,.18,.10);}
   else if(o.kind==='printer'){box(g,wood,0,.35,0,1.33,.65,.76);box(g,cream,0,.88,-.02,1.03,.48,.64);box(g,charcoal,0,1.15,-.03,.97,.12,.58);box(g,steel,0,1.22,-.12,.81,.05,.35);box(g,charcoal,0,.85,.31,.67,.12,.04);box(g,cream,0,.83,.38,.45,.018,.19);box(g,blue,.37,1.20,.25,.16,.035,.10);}
   else if(o.kind==='fridge'){box(g,steel,-.32,.74,-.08,.64,1.43,.67);box(g,cream,-.32,1.13,.28,.59,.62,.06);box(g,cream,-.32,.40,.28,.59,.76,.06);for(const y of [.53,1.05])box(g,charcoal,-.53,y,.33,.045,.22,.045);box(g,wood,.45,.42,0,.68,.8,.65);for(let i=0;i<3;i++)box(g,books[i],.21+i*.19,.9,.04,.13,.17,.14);}
   else if(o.kind==='cabinet'){box(g,cream,0,.80,-.07,1.27,1.55,.70);for(const x of [-.32,.32]){box(g,gray,x,.80,.30,.59,1.42,.055);box(g,charcoal,x+(x<0?.2:-.2),.83,.35,.06,.17,.04);}box(g,wood,0,1.59,-.07,1.31,.06,.74);}
   else if(o.kind==='sofa'){const fabric=mat(0x72918d);box(g,wood,0,.17,0,1.46,.18,.72);box(g,fabric,0,.34,.06,1.40,.26,.68);box(g,fabric,0,.67,-.26,1.45,.56,.21);for(const x of [-.65,.65])box(g,fabric,x,.52,.02,.19,.36,.68);for(const x of [-.33,.33])box(g,mat(0xa6b9ad),x,.50,.03,.55,.08,.49);box(g,coral,.35,.68,-.16,.24,.26,.12);}
   else if(o.kind==='plants'){pot(g,-.4,0,1.5);pot(g,.40,-.06,1.25);}
   else if(o.kind==='books'){box(g,wood,0,.77,-.23,1.32,1.50,.13);for(const x of [-.64,.64])box(g,wood,x,.77,-.04,.09,1.50,.45);for(let j=0;j<4;j++){const y=.10+j*.43;box(g,wood,0,y,-.04,1.35,.07,.45);if(j<3)for(let k=0;k<6;k++)box(g,books[(j+k)%4],-.50+k*.18,y+.18,-.05,.13,.23+((j+k)%2)*.07,.29);}}
  }
  return {pickables:out,vista,glass,cityMat,glow};
 }
 function applyLighting(T,scene,hemi,sun,fill,decor,date){const l=lighting(date);scene.background=new T.Color(l.sky);hemi.intensity=l.hemi;sun.intensity=l.sun;sun.color=new T.Color(l.sunColor);fill.intensity=l.fill;if(decor){decor.glass.color=new T.Color(l.glass);decor.cityMat.color=new T.Color(l.city);decor.glow.emissiveIntensity=l.phase==='night'?1.2:l.phase==='sunset'?.65:.08;}return l;}
 return {scenes,activeScene:'main-office',definitions,objects,at,lighting,decorate,applyLighting};
})();
// Original procedural ambient motif, opt-in only. No recording or external audio dependency.
window.OC61_AMBIENT=(()=>{
 let ctx=null,master=null,timer=null,enabled=false,step=0;const notes=[48,55,60,64,50,57,62,65,45,52,57,60,43,50,55,59];
 function tone(){if(!enabled||!ctx||document.hidden||ctx.state!=='running')return;const t=ctx.currentTime+.03,n=notes[step++%notes.length];for(const [offset,gain] of [[0,.09],[12,.022]]){const osc=ctx.createOscillator(),g=ctx.createGain();osc.type='sine';osc.frequency.value=440*2**((n+offset-69)/12);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.18);g.gain.exponentialRampToValueAtTime(.0001,t+2.1);osc.connect(g);g.connect(master);osc.start(t);osc.stop(t+2.15);}}
 async function toggle(){if(enabled){stop();return false;}const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error('Browser นี้ไม่รองรับเสียง');if(!ctx){ctx=new Audio();master=ctx.createGain();master.gain.value=.27;master.connect(ctx.destination);}await ctx.resume();if(document.hidden){await ctx.suspend();return false;}enabled=true;tone();timer=setInterval(tone,1450);return true;}
 function stop(){enabled=false;clearInterval(timer);timer=null;ctx?.suspend().catch(()=>{});}document.addEventListener('visibilitychange',()=>{if(document.hidden&&enabled)stop();});return {toggle,stop,enabled:()=>enabled};
})();
