/* V6.7 shared pure logic. No network, DOM, polling or dependencies. */
'use strict';
window.OC670_CORE=(()=>{
 const loops={"dance": "เต้น", "workout": "ออกกำลังกาย", "stretch": "ยืดเส้น", "idle": "ผ่อนคลาย", "sway": "เต้นโยกตัว", "jog": "วิ่งอยู่กับที่", "jumping_jacks": "กระโดดตบ", "squat": "สควอต", "neck_roll": "ผ่อนคลายคอ", "breathe": "ฝึกหายใจ", "read": "อ่านหนังสือ", "type": "พิมพ์งาน", "phone": "คุยโทรศัพท์", "meditate": "สมาธิ"},standing=new Set(["dance", "workout", "stretch", "sway", "jog", "jumping_jacks", "squat", "meditate"]),ones={"salute": "วันทยหัตถ์", "thumbs": "เยี่ยมเลย", "nod": "พยักหน้า", "laugh": "หัวเราะ", "point": "ชี้ชวน", "bow": "โค้งทักทาย", "cheer_friend": "ส่งกำลังใจ", "thank_friend": "ขอบคุณ", "gift_friend": "ส่งของขวัญเสมือน", "received_cheer_friend": "ได้รับกำลังใจ", "received_thank_friend": "ได้รับคำขอบคุณ", "received_gift_friend": "ได้รับของขวัญ"};
 for(const a of window.OC100_CORE?.actions||[]){ones[a.kind]=a.label;ones['received_'+a.kind]='เพื่อนส่ง '+a.label;}
 const kinds=new Set(['speech',...Object.keys(ones).filter(k=>!k.startsWith('received_'))]);
 const safeDesk=k=>typeof k==='string'&&/^D-\d+$/i.test(k),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function personality(answers){if(!Array.isArray(answers)||answers.length!==16||!answers.every(a=>[-1,0,1].includes(a)))return null;return Array.from({length:4},(_,i)=>answers.slice(i*4,i*4+4).reduce((s,n)=>s+n,0)>=0?'ESTJ'[i]:'INFP'[i]).join('');}
 function event(e,now,desks){if(!e||!safeDesk(e.desk_id)||!desks.has(e.desk_id)||!kinds.has(e.kind)||!Number.isFinite(e.started_ms)||!Number.isFinite(e.expires_ms)||e.expires_ms-e.started_ms!==5000||e.started_ms>now+2000||e.expires_ms<=now)return null;if(e.slot!==(e.kind==='speech'?'speech':'action'))return null;if(e.kind==='speech'&&(typeof e.body!=='string'||Array.from(e.body).length>120||!e.body.trim()||/[\x00-\x1f\x7f]/.test(e.body)))return null;if(e.kind.endsWith('_friend')&&(!desks.has(e.target_desk)||e.target_desk===e.desk_id))return null;return {...e};}
 const active=(e,t)=>!!e&&e.started_ms<=t&&t<e.expires_ms;
 const labelVisible=(e,t)=>!!e&&e.started_ms<=t&&t<Math.min(e.expires_ms,e.started_ms+5000);
 function decor(rows){if(!Array.isArray(rows))return [];const found=new Set(),out=[];for(const r of rows){if(!Array.isArray(r)||r.length!==4||typeof r[0]!=='string'||!/^[a-z][a-z0-9_]{0,39}$/.test(r[0])||found.has(r[0])||!r.slice(1).every(Number.isFinite)||r[1]<0||r[1]>1||r[2]<0||r[2]>1||r[3]<0||r[3]>=360)continue;found.add(r[0]);out.push(r.slice());if(out.length===6)break;}return out;}
 // Board picks a wall beside the largest connected open-floor component. No cell is reserved.
 function board(p,studio){if(!p||!studio)return null;let edges=p.wallEdges;try{if(!studio.edgeMode(p))edges=studio.convertWalls(p).wallEdges;}catch{return null;}const stairs=studio.stairwell(p),walk=(x,y)=>x>=0&&x<p.cols&&y>=0&&y<p.rows&&(!p.cells[`${x},${y}`]||p.cells[`${x},${y}`].type==='aisle')&&!studio.reserved(p,x,y,stairs);const dirs=[[1,0],[-1,0],[0,1],[0,-1]],size=new Map(),seen=new Set();for(let y=0;y<p.rows;y++)for(let x=0;x<p.cols;x++){const start=`${x},${y}`;if(!walk(x,y)||seen.has(start))continue;const q=[[x,y]],keys=[start];seen.add(start);for(let i=0;i<q.length;i++)for(const [dx,dy] of dirs){const [a,b]=q[i],c=a+dx,d=b+dy,k=`${c},${d}`,edge=studio.edgeForCell(a,b,dx===1?'E':dx===-1?'W':dy===1?'S':'N');if(walk(c,d)&&!seen.has(k)&&!['wall','window'].includes(edges?.[edge]?.type)){seen.add(k);keys.push(k);q.push([c,d]);}}for(const k of keys)size.set(k,keys.length);}
  const candidates=[];for(const [key,e] of Object.entries(edges||{})){if(e.type!=='wall')continue;const [axis,xy]=key.split(':'),[x,y]=xy.split(',').map(Number),v=axis==='V';for(const side of [-1,1]){const a=x+(v&&side<0?-1:0),b=y+(!v&&side<0?-1:0),cell=`${a},${b}`;if(!walk(a,b))continue;const q=studio.wallEdgePoint(p,key);if(!q)continue;const angle=v?side*Math.PI/2:side>0?0:Math.PI;candidates.push({key,cell,x:q.x+(v?side*.103:0),z:q.z+(!v?side*.103:0),angle,size:size.get(cell)||0,rank:Math.abs(a-(p.cols-1)/2)+Math.abs(b-(p.rows-1)/2)});}}
  candidates.sort((a,b)=>b.size-a.size||a.rank-b.rank||a.key.localeCompare(b.key)||a.cell.localeCompare(b.cell));return candidates[0]||null;
 }
 // Smooth local-space joint targets. Every returned transform is bounded and resets between states.
 function pose(kind,elapsed,seated=false,reduced=false){const t=Math.max(0,elapsed)/1000,phase=reduced?0:t*Math.PI*2,f=Math.sin(phase),q=Math.cos(phase),slow=Math.sin(phase*.28),w=(1+Math.sin(phase*.65))/2,r={arms:[[0,0,0],[0,0,0]],elbows:[0,0],legs:[0,0],knees:[0,0],head:[0,0,0],body:[0,0,0],bob:0};
  const A=(i,x,y,z)=>r.arms[i]=[x,y,z],both=(x,z=0)=>{A(0,x,0,-z);A(1,x,0,z);};
  switch(kind){
   case 'sway': both(.85,.45);A(0,.85+.42*f,0,-.45);A(1,.85-.42*f,0,.45);r.body[2]=.13*f;r.head[1]=.13*q;r.legs=[.12*f,-.12*f];r.bob=.035*Math.abs(f);break;
   case 'jog':r.legs=[.37*f,-.37*f];r.knees=[-.42*Math.max(0,f),-.42*Math.max(0,-f)];A(0,-.43*f,0,-.08);A(1,.43*f,0,.08);r.elbows=[.8,.8];r.bob=.035+.055*Math.abs(f);r.body[0]=-.07;break;
   case 'jumping_jacks':{const v=(1-Math.cos(phase*.72))/2;both(.25+2.3*v,.28+.65*v);r.legs=[.12*v,.12*v];r.knees=[-.16*v,-.16*v];r.bob=.16*v;break;}
   case 'squat':both(.25+1.05*w,.10);r.legs=[.65*w,.65*w];r.knees=[-1.05*w,-1.05*w];r.bob=-.22*w;r.body[0]=-.25*w;break;
   case 'neck_roll':r.head=[.09*q,.26*slow,.12*f];break;
   case 'breathe':both(seated?.08:.14,.08*(1+slow));r.body[0]=.026*slow;r.head[0]=.025*q;r.bob=seated?0:.009*slow;break;
   case 'read':both(seated?.18:1.03,.15);r.elbows=[.65,.65];r.head[0]=-.18+.04*slow;break;
   case 'type':A(0,.045*f,0,0);A(1,.045*Math.sin(phase+2),0,0);r.head[0]=-.035;break;
   case 'phone':A(0,.06,0,0);A(1,seated?1.1:1.33,-.1,.10);r.elbows[1]=1.15;r.head[2]=.09;r.head[1]=.10*slow;break;
   case 'meditate':both(.22,.25);r.elbows=[.82,.82];r.head[0]=-.11;r.body[2]=.015*slow;break;
   case 'salute':A(1,seated?1.1:1.85,.15,.18);r.elbows[1]=1.2;r.head[0]=-.07;break;
   case 'thumbs':case 'cheer_friend':case 'thank_friend':case 'gift_friend':A(1,seated?.65:1.0,0,.2);r.elbows[1]=.85;r.head[0]=.07*f;break;
   case 'friend_wave_friend':A(1,1.45+.18*f,.1,.35+.2*q);r.elbows[1]=.85;r.head[1]=.10*f;break;
   case 'friend_salute_friend':A(1,1.85,.15,.18);r.elbows[1]=1.2;r.body[0]=-.12*w;break;
   case 'friend_heart_friend':both(1.7,.36);r.elbows=[1.15,1.15];r.head[2]=.1*slow;break;
   case 'friend_dance_friend':A(0,1.2+.7*f,0,-.4);A(1,1.2-.7*f,0,.4);r.body[2]=.16*f;r.legs=[.2*f,-.2*f];r.bob=seated?0:.06*Math.abs(f);break;
   case 'friend_star_friend':both(2.2,.55+.14*f);r.elbows=[.2,.2];r.head[0]=.12*q;r.bob=seated?0:.12*Math.abs(f);break;
   case 'nod':r.head[0]=.22*f;break;
   case 'laugh':both(.25,.12);r.elbows=[.6,.6];r.head[0]=.12*f;r.body[0]=.08*f;r.bob=seated?0:.022*Math.abs(f);break;
   case 'point':A(1,seated?.3:1.38,0,.06);r.elbows[1]=.05;r.head[1]=.12;break;
   case 'bow':r.head[0]=-.20*(.5+.5*f);r.body[0]=-.16*(.5+.5*f);break;
   default:return null;
  }if(reduced){r.bob=0;}return r;
 }
 return {loops,standing,ones,personality,event,active,labelVisible,decor,board,pose,safeDesk};
})();
