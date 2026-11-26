/* Living Office V5.1: shared walking, visits and meeting seat/standing poses. */
'use strict';
window.OC50=(()=>{
 const $=id=>document.getElementById(id),step=850;
 const palettes=Object.freeze({shirt:{teal:'#359b98',blue:'#577cc3',rose:'#cf728d',lavender:'#9475c8',amber:'#d2a04f',slate:'#566674'},skin:{light:'#f2cfb2',warm:'#d8a57d',tan:'#ad7855',deep:'#79513b'},hair:{black:'#343038',brown:'#594032',chestnut:'#965b37',silver:'#b8bdc8'},style:{short:'ผมสั้น',long:'ผมยาว',bun:'มัดผม'}});
 const defaults={shirt:'blue',skin:'warm',hair:'brown',style:'short'};
 function avatar(a){const out={};for(const k of Object.keys(defaults))out[k]=Object.hasOwn(palettes[k],a?.[k])?a[k]:defaults[k];return out;}
 let me=null,revision=null,installed=false,connected=false,walkMode=false,busy=false,clockOffset=0,records=new Map(),appearances={},draft=avatar(),generation=0,interaction=false,pendingVisit=null;
 const now=()=>Date.now()+clockOffset;
 const note=msg=>window.OC41?.notify(msg);
 const inOffice=()=>!window.officeCloudBridge?.isAdminMode()&&!window.officeAPI?.isEditing();
 const member=()=>installed&&connected&&!!me?.enabled;
 const canWalk=()=>member()&&!!me.desk_id&&['available','busy','dnd',...(interaction?['meeting']:[])].includes(me.personal_status);
 const point=k=>k.split(',').map(Number);
 function sample(m,time=now()){
  if(!m?.route?.length)return null;
  const last=m.route.length-1,elapsed=time-m.started_ms,travel=last*step,hasPose=Number.isFinite(m.pose_x)&&Number.isFinite(m.pose_y)&&Number.isFinite(m.pose_angle),end=travel+(hasPose?420:0),activity=m.activity||'walk';
  if(elapsed>=end&&(m.returning||(activity!=='meeting'&&elapsed>=end+600000)))return null;
  const first=point(m.route[0]);
  if(elapsed<0&&Number.isFinite(m.from_x)&&Number.isFinite(m.from_y)){
   const f=Math.min(1,Math.max(0,1+elapsed/420)),dx=first[0]-m.from_x,dy=first[1]-m.from_y;
   return {x:m.from_x+dx*f,y:m.from_y+dy*f,moving:true,angle:Math.atan2(-dx,-dy),phase:f*2*Math.PI,returning:m.returning,activity,pose:'stand'};
  }
  const progress=Math.max(0,elapsed/step),i=Math.min(last,Math.floor(progress)),a=point(m.route[i]),b=point(m.route[Math.min(last,i+1)]),f=Math.min(1,progress-i);
  if(elapsed>=travel&&hasPose){
   const g=Math.min(1,Math.max(0,(elapsed-travel)/420)),moving=g<1;
   const gesture=activity==='poke'&&!moving?Math.max(0,Math.min(1,(elapsed-end)/900)):0;
   return {x:a[0]+(m.pose_x-a[0])*g,y:a[1]+(m.pose_y-a[1])*g,moving,angle:m.pose_angle,phase:progress*2*Math.PI,returning:m.returning,activity,pose:moving?'stand':activity==='meeting'?(m.slot?.startsWith('seat:')?'seat':'lean'):'stand',gesture:activity==='poke'&&!moving&&gesture<1?gesture:null,slot:m.slot};
  }
  const moving=progress<last,prev=point(m.route[Math.max(0,last-1)]),dir=moving?[b[0]-a[0],b[1]-a[1]]:[a[0]-prev[0],a[1]-prev[1]];
  return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,moving,angle:Math.atan2(-dir[0],-dir[1]),phase:progress*2*Math.PI,returning:m.returning,activity,pose:'stand'};
 }
 function doorOpenKeys(p,time=now()){
  const keys=new Set();if(!interaction)return keys;
  for(const m of records.values())for(let i=0;i<m.route.length;i++)if(p.cells[m.route[i]]?.type==='door'&&time>=m.started_ms+(i-1)*step-350&&time<=m.started_ms+(i+1)*step+300)keys.add(m.route[i]);
  return keys;
 }
 function roomOK(p){return p?.cols>=7&&p.rows>=4&&p.cells['4,3']?.type==='door'&&[0,1,2,3,5].every(x=>p.cells[`${x},3`]?.type==='wall')&&[0,1,2].every(y=>p.cells[`6,${y}`]?.type==='wall');}
 function isRoomKey(k,p){if(!roomOK(p)||!k)return false;const [x,y]=point(k);return k==='4,3'||(x>=0&&x<=5&&y>=0&&y<=2&&['aisle','meeting'].includes(p.cells[k]?.type||'aisle'));}
 function motion(id,t=now()){return sample(records.get(id),t);}
 function update(data){
  const next=data?.me?.enabled?data.me:null;if(me?.user_id!==next?.user_id){generation++;walkMode=false;busy=false;pendingVisit=null;if($('avatarDialog').open)$('avatarDialog').close();}
  me=next?{...next,avatar:data.my_avatar}:null;installed=data?.living_version===1;interaction=data?.interaction_version===1;connected=!!data;const oldRevision=revision;revision=data?.revision;if(oldRevision!==null&&oldRevision!==revision)pendingVisit=null;
  if(installed&&Number.isFinite(data.server_ms))clockOffset=data.server_ms-Date.now();
  appearances=me&&installed&&data.avatars&&typeof data.avatars==='object'?data.avatars:{};
  records=new Map();if(me&&installed&&Array.isArray(data.motions))for(const m of data.motions){
   if(typeof m.desk_id!=='string'||!Array.isArray(m.route)||!m.route.length||m.route.length>200||!Number.isFinite(m.started_ms)||!m.route.every(k=>typeof k==='string'&&/^\d{1,2},\d{1,2}$/.test(k)))continue;records.set(m.desk_id,m);
  }
  if(!canWalk()){walkMode=false;pendingVisit=null;}if(pendingVisit&&records.get(me?.desk_id)?.activity!=='poke')pendingVisit=null;refreshUI();
 }
 function lost(){connected=false;walkMode=false;pendingVisit=null;records.clear();appearances={};if($('avatarDialog').open)$('avatarDialog').close();refreshUI();}
 function refreshUI(){
  if(!inOffice())walkMode=false;const visible=member()&&inOffice(),m=me?.desk_id?motion(me.desk_id):null,locked=busy||!!pendingVisit||!!m?.moving;
  $('livingDock').hidden=!visible;$('avatarBtn').disabled=busy;$('walkBtn').disabled=!canWalk()||locked;$('returnBtn').hidden=!m;$('returnBtn').disabled=locked;
  $('meetingBtn').hidden=!interaction||!roomOK(window.officeAPI?.getMap());$('meetingBtn').disabled=!canWalk()||locked||m?.activity==='meeting';
  $('walkBtn').setAttribute('aria-pressed',String(walkMode));$('walkBtn').querySelector('span').textContent=walkMode?'ยกเลิกเดิน':'เดินเล่น';
  $('livingHint').hidden=!visible||(!walkMode&&!m&&!pendingVisit);const hint=pendingVisit?(m?.moving?'กำลังเดินไปหา '+pendingVisit.nickname+'…':'กำลังสะกิด '+pendingVisit.nickname+'…'):m?.moving?(m.returning?'กำลังเดินกลับโต๊ะ…':m.activity==='meeting'?'กำลังไปห้องประชุม…':'กำลังเดินไปจุดหมาย…'):walkMode?'คลิกทางเดินหรือห้องประชุมเพื่อเลือกจุดหมาย':m?.pose==='seat'?'กำลังนั่งในห้องประชุม · กดกลับโต๊ะเพื่อออก':m?.pose==='lean'?'ที่นั่งเต็ม · กำลังยืนริมผนัง':m?'กำลังอยู่ในออฟฟิศ · กดกลับโต๊ะเมื่อต้องการ':'';if($('livingHint').textContent!==hint)$('livingHint').textContent=hint;
  $('viewport').classList.toggle('walk-mode',walkMode&&visible);$('avatarSave').disabled=busy||!member();
 }
 function isWalking(id){return !!motion(id);}
 function appearance(id){return avatar(appearances[id]);}
 function routeState(){return [...records.entries()].map(([id,m])=>({id,motion:sample(m)})).filter(x=>x.motion);}
 async function action(name,body){if(busy||!member())return false;const g=generation,u=me.user_id;busy=true;refreshUI();try{const result=await window.OC41.livingRPC(u,name,body);return g===generation?result:false;}catch(e){if(g===generation)note(translate(e.message));return false;}finally{if(g===generation){busy=false;refreshUI();}}}
 function translate(msg){if(/No walkable route|No walkable floor/.test(msg))return 'ไปจุดนี้ไม่ได้ เลือกทางเดินที่เชื่อมถึงกันนะ';if(/Meeting room is full/.test(msg))return 'ห้องประชุมเต็มแล้ว ทั้งที่นั่งและที่ยืน';if(/Recipient is not at their desk/.test(msg))return 'เพื่อนไม่อยู่ที่โต๊ะแล้ว ลองส่งข้อความแทนนะ';if(/Visit expired|cancelled/.test(msg))return 'การสะกิดถูกยกเลิกหรือหมดเวลา';if(/wait before poking/.test(msg))return 'รอสักครู่ก่อนสะกิดอีกครั้งนะ';if(/Already walking|wait a moment/.test(msg))return 'รอให้เดินถึงจุดหมายก่อนนะ';if(/Layout changed/.test(msg))return 'ผังเปลี่ยนแล้ว ลองเลือกจุดใหม่';if(/working status/.test(msg))return 'เลือกสถานะพร้อมคุยหรือกำลังทำงานก่อนเดิน';return 'ทำรายการไม่สำเร็จ: '+msg;}
 function toggleWalk(){if(!canWalk()||busy||pendingVisit)return;walkMode=!walkMode;if(walkMode)window.officeAPI?.select(null);refreshUI();}
 async function moveTo(k){return interaction?action('oc51_move',{p_target:k,p_revision:revision,p_kind:'walk',p_peer:null,p_nonce:null}):action('oc50_move',{p_target:k,p_revision:revision});}
 async function choose(k){if(!walkMode||!canWalk()||!inOffice()||busy||pendingVisit)return false;const p=window.officeAPI.getMap();if(!k||!/^\d+,\d+$/.test(k))return false;const [x,y]=point(k);if(x<0||y<0||x>=p.cols||y>=p.rows||(p.cells[k]&&p.cells[k].type!=='aisle'&&!(interaction&&isRoomKey(k,p)))){note('เลือกช่องพื้นว่าง ทางเดิน หรือห้องประชุมนะ');return false;}walkMode=false;const ok=await moveTo(k);refreshUI();return ok;}
 async function joinMeeting(){if(!interaction||!canWalk()||busy||pendingVisit||!inOffice())return;walkMode=false;window.officeAPI?.select(null);await moveTo('4,3');refreshUI();}
 async function returnDesk(){if(!canWalk()||busy||pendingVisit)return;walkMode=false;await moveTo(null);refreshUI();}
 async function visit(desk,peer,nickname){
  if(!interaction||!canWalk()||!inOffice()){note('เลือกโต๊ะประจำและสถานะที่พร้อมเดินก่อนนะ');return false;}
  if(busy||pendingVisit||motion(me.desk_id)?.moving){note('รอให้ตัวละครเดินถึงจุดหมายก่อนนะ');return false;}
  const gen=generation,nonce=crypto.randomUUID();walkMode=false;window.officeAPI?.select(null);
  const result=await action('oc51_move',{p_target:desk,p_revision:revision,p_kind:'poke',p_peer:peer,p_nonce:nonce});
  if(gen!==generation||!result||result.nonce!==nonce||!Number.isFinite(result.arrival_ms))return false;
  pendingVisit={nonce,nickname,arrival:result.arrival_ms+1050,attempts:0,gen};refreshUI();return true;
 }
 async function completeVisit(){
  const p=pendingVisit;if(!p||busy||!member()||!inOffice()||document.hidden||now()<p.arrival)return;
  if(p.gen!==generation||now()>p.arrival+120000){pendingVisit=null;refreshUI();return;}
  if(records.get(me.desk_id)?.activity!=='poke'){pendingVisit=null;refreshUI();return;}
  busy=true;refreshUI();try{
   const room=await window.OC41.livingRPC(me.user_id,'oc51_finish_poke',{p_nonce:p.nonce});
   if(p.gen===generation&&pendingVisit===p){pendingVisit=null;if(typeof room==='string'){note('สะกิด '+p.nickname+' แล้ว');window.OC43?.openVisitRoom(room);}}
  }catch(e){if(p.gen===generation&&pendingVisit===p){if(/Not arrived yet|timeout|timed out|network|fetch/i.test(e.message)&&p.attempts<3){p.attempts++;p.arrival=now()+1200;}else{pendingVisit=null;note(translate(e.message));}}}finally{if(p.gen===generation){busy=false;refreshUI();}}
 }
 const titles={shirt:'สีเสื้อ',skin:'สีผิว',hair:'สีผม',style:'ทรงผม'};
 const names={teal:'เขียวอมฟ้า',blue:'น้ำเงิน',rose:'ชมพู',lavender:'ม่วง',amber:'เหลือง',slate:'เทา',light:'สว่าง',warm:'อบอุ่น',tan:'แทน',deep:'เข้ม',black:'ดำ',brown:'น้ำตาล',chestnut:'น้ำตาลแดง',silver:'เงิน'};
 function preview(){const a=draft;$('avatarPreview').querySelectorAll('[data-part]').forEach(el=>{el.setAttribute('fill',palettes[el.dataset.part][a[el.dataset.part]]);});$('avatarLong').toggleAttribute('hidden',a.style!=='long');$('avatarBun').toggleAttribute('hidden',a.style!=='bun');$('avatarOptions').querySelectorAll('button[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(a[b.dataset.group]===b.dataset.preset)));}
 function openAvatar(){if(!member())return;draft=avatar(me?.desk_id?appearances[me.desk_id]||me.avatar:me.avatar);const root=$('avatarOptions');root.replaceChildren();for(const [k,values] of Object.entries(palettes)){const field=document.createElement('fieldset'),legend=document.createElement('legend'),line=document.createElement('div');legend.textContent=titles[k];line.className='avatar-options';field.append(legend,line);for(const [key,value] of Object.entries(values)){const b=document.createElement('button');b.type='button';b.dataset.group=k;b.dataset.preset=key;b.title=k==='style'?value:names[key];b.setAttribute('aria-label',b.title);if(k==='style')b.textContent=value;else{b.className='avatar-swatch';b.style.setProperty('--swatch',value);}b.onclick=()=>{draft[k]=key;preview();};line.append(b);}root.append(field);}preview();$('avatarDialog').showModal();}
 $('meetingBtn').onclick=joinMeeting;$('avatarBtn').onclick=openAvatar;$('walkBtn').onclick=toggleWalk;$('returnBtn').onclick=returnDesk;$('avatarCancel').onclick=()=>$('avatarDialog').close();$('avatarDefault').onclick=()=>{draft=avatar();preview();};$('avatarForm').onsubmit=async e=>{e.preventDefault();if(await action('oc50_set_avatar',{p_avatar:avatar(draft)})){if($('avatarDialog').open)$('avatarDialog').close();note('บันทึกตัวละครแล้ว');}};
 // Fallback visualization uses the same server route, but discrete grid markers.
 const lastFallback=new Map();function fallback(){const p=window.officeAPI?.getMap();if(!p||!inOffice()||window.office3D?.active()){document.querySelectorAll('.oc50-floor-avatar').forEach(n=>n.remove());lastFallback.clear();return;}
  const walking=routeState(),active=new Set(walking.map(x=>x.id));for(const [k,c] of Object.entries(p.cells)){if(c.type!=='desk')continue;const el=document.getElementById('c'+k);if(el)el.classList.toggle('oc50-desk-empty',active.has(c.id));}
  for(const [id,n] of lastFallback){if(!active.has(id)||!n.isConnected){n.remove();lastFallback.delete(id);}}
  for(const {id,motion:m} of walking){const key=Object.keys(p.cells).find(k=>p.cells[k].id===id),c=p.cells[key];if(!c||c.connection!=='online')continue;const floor=document.getElementById('c'+Math.round(m.x)+','+Math.round(m.y));if(!floor)continue;let token=lastFallback.get(id);if(!token){token=document.createElement('span');token.className='oc50-floor-avatar';token.dataset.deskKey=key;lastFallback.set(id,token);}token.title=c.name+(m.pose==='seat'?' · นั่งประชุม':m.pose==='lean'?' · ยืนริมผนัง':'');token.textContent=c.name.slice(0,2).toUpperCase();token.dataset.pose=m.pose||'stand';token.style.left=Math.max(16,Math.min(84,50+(m.x-Math.round(m.x))*100))+'%';token.style.top=Math.max(16,Math.min(84,50+(m.y-Math.round(m.y))*100))+'%';token.style.setProperty('--avatar-shirt',palettes.shirt[appearance(id).shirt]);if(token.parentNode!==floor)floor.append(token);}
 }
 setInterval(()=>{refreshUI();fallback();void completeVisit();},150);
 return {palettes,avatar,appearance,update,lost,refreshUI,isWalking,motion,routeState,now,sample,doorOpenKeys,isRoomKey,interactionReady:()=>interaction,visit,joinMeeting,walkMode:()=>walkMode&&canWalk()&&inOffice(),choose,openAvatar,returnDesk,meDesk:()=>me?.desk_id,member};
})();
