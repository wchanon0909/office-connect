/* Living Office V5.0: bounded avatar presets and server-timed walking routes. */
'use strict';
window.OC50=(()=>{
 const $=id=>document.getElementById(id),step=850;
 const palettes=Object.freeze({shirt:{teal:'#359b98',blue:'#577cc3',rose:'#cf728d',lavender:'#9475c8',amber:'#d2a04f',slate:'#566674'},skin:{light:'#f2cfb2',warm:'#d8a57d',tan:'#ad7855',deep:'#79513b'},hair:{black:'#343038',brown:'#594032',chestnut:'#965b37',silver:'#b8bdc8'},style:{short:'ผมสั้น',long:'ผมยาว',bun:'มัดผม'}});
 const defaults={shirt:'blue',skin:'warm',hair:'brown',style:'short'};
 function avatar(a){const out={};for(const k of Object.keys(defaults))out[k]=Object.hasOwn(palettes[k],a?.[k])?a[k]:defaults[k];return out;}
 let me=null,revision=null,installed=false,connected=false,walkMode=false,busy=false,clockOffset=0,records=new Map(),appearances={},draft=avatar(),generation=0;
 const now=()=>Date.now()+clockOffset;
 const note=msg=>window.OC41?.notify(msg);
 const inOffice=()=>!window.officeCloudBridge?.isAdminMode()&&!window.officeAPI?.isEditing();
 const member=()=>installed&&connected&&!!me?.enabled;
 const canWalk=()=>member()&&!!me.desk_id&&['available','busy','dnd'].includes(me.personal_status);
 const point=k=>k.split(',').map(Number);
 function sample(m,time=now()){
  if(!m?.route?.length)return null;
  const last=m.route.length-1,progress=Math.max(0,(time-m.started_ms)/step);
  if(progress>=last&&(m.returning||progress>=last+600000/step))return null;
  const i=Math.min(last,Math.floor(progress)),a=point(m.route[i]),b=point(m.route[Math.min(last,i+1)]),f=Math.min(1,progress-i);
  const moving=progress<last;
  const prev=point(m.route[Math.max(0,last-1)]),dir=moving?[b[0]-a[0],b[1]-a[1]]:[a[0]-prev[0],a[1]-prev[1]];
  return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,moving,angle:Math.atan2(-dir[0],-dir[1]),phase:progress*2*Math.PI,returning:m.returning};
 }
 function motion(id,t=now()){return sample(records.get(id),t);}
 function update(data){
  const next=data?.me?.enabled?data.me:null;if(me?.user_id!==next?.user_id){generation++;walkMode=false;busy=false;if($('avatarDialog').open)$('avatarDialog').close();}
  me=next?{...next,avatar:data.my_avatar}:null;installed=data?.living_version===1;connected=!!data;revision=data?.revision;
  if(installed&&Number.isFinite(data.server_ms))clockOffset=data.server_ms-Date.now();
  appearances=me&&installed&&data.avatars&&typeof data.avatars==='object'?data.avatars:{};
  records=new Map();if(me&&installed&&Array.isArray(data.motions))for(const m of data.motions){
   if(typeof m.desk_id!=='string'||!Array.isArray(m.route)||!m.route.length||m.route.length>200||!Number.isFinite(m.started_ms)||!m.route.every(k=>typeof k==='string'&&/^\d{1,2},\d{1,2}$/.test(k)))continue;records.set(m.desk_id,m);
  }
  if(!canWalk())walkMode=false;refreshUI();
 }
 function lost(){connected=false;walkMode=false;records.clear();appearances={};if($('avatarDialog').open)$('avatarDialog').close();refreshUI();}
 function refreshUI(){
  if(!inOffice())walkMode=false;const visible=member()&&inOffice(),m=me?.desk_id?motion(me.desk_id):null;
  $('livingDock').hidden=!visible;$('avatarBtn').disabled=busy;$('walkBtn').disabled=!canWalk()||busy||!!m?.moving;$('returnBtn').hidden=!m;$('returnBtn').disabled=busy||!!m?.moving;
  $('walkBtn').setAttribute('aria-pressed',String(walkMode));$('walkBtn').querySelector('span').textContent=walkMode?'ยกเลิกเดิน':'เดินเล่น';
  $('livingHint').hidden=!visible||(!walkMode&&!m);const hint=m?.moving?(m.returning?'กำลังเดินกลับโต๊ะ…':'กำลังเดินไปจุดหมาย…'):walkMode?'คลิกพื้นที่ว่างหรือทางเดินเพื่อเลือกจุดหมาย':m?'กำลังอยู่ในออฟฟิศ · กดกลับโต๊ะเมื่อต้องการ':'';if($('livingHint').textContent!==hint)$('livingHint').textContent=hint;
  $('viewport').classList.toggle('walk-mode',walkMode&&visible);$('avatarSave').disabled=busy||!member();
 }
 function isWalking(id){return !!motion(id);}
 function appearance(id){return avatar(appearances[id]);}
 function routeState(){return [...records.entries()].map(([id,m])=>({id,motion:sample(m)})).filter(x=>x.motion);}
 async function action(name,body){if(busy||!member())return false;const g=generation,u=me.user_id;busy=true;refreshUI();try{await window.OC41.livingRPC(u,name,body);return g===generation;}catch(e){if(g===generation)note(translate(e.message));return false;}finally{if(g===generation){busy=false;refreshUI();}}}
 function translate(msg){if(/No walkable route|No walkable floor/.test(msg))return 'ไปจุดนี้ไม่ได้ เลือกทางเดินที่เชื่อมถึงกัน (ประตูยังปิดอยู่)';if(/Already walking|wait a moment/.test(msg))return 'รอให้เดินถึงจุดหมายก่อนนะ';if(/Layout changed/.test(msg))return 'ผังเปลี่ยนแล้ว ลองเลือกจุดใหม่';if(/working status/.test(msg))return 'เลือกสถานะพร้อมคุยหรือกำลังทำงานก่อนเดิน';return 'ทำรายการไม่สำเร็จ: '+msg;}
 function toggleWalk(){if(!canWalk())return;walkMode=!walkMode;if(walkMode)window.officeAPI?.select(null);refreshUI();}
 async function choose(k){if(!walkMode||!canWalk()||!inOffice()||busy)return false;const p=window.officeAPI.getMap();if(!k||!/^\d+,\d+$/.test(k))return false;const [x,y]=point(k);if(x<0||y<0||x>=p.cols||y>=p.rows||(p.cells[k]&&p.cells[k].type!=='aisle')){note('เลือกช่องพื้นว่างหรือทางเดินนะ');return false;}walkMode=false;const ok=await action('oc50_move',{p_target:k,p_revision:revision});refreshUI();return ok;}
 async function returnDesk(){if(!canWalk()||busy)return;walkMode=false;await action('oc50_move',{p_target:null,p_revision:revision});refreshUI();}
 const titles={shirt:'สีเสื้อ',skin:'สีผิว',hair:'สีผม',style:'ทรงผม'};
 const names={teal:'เขียวอมฟ้า',blue:'น้ำเงิน',rose:'ชมพู',lavender:'ม่วง',amber:'เหลือง',slate:'เทา',light:'สว่าง',warm:'อบอุ่น',tan:'แทน',deep:'เข้ม',black:'ดำ',brown:'น้ำตาล',chestnut:'น้ำตาลแดง',silver:'เงิน'};
 function preview(){const a=draft;$('avatarPreview').querySelectorAll('[data-part]').forEach(el=>{el.setAttribute('fill',palettes[el.dataset.part][a[el.dataset.part]]);});$('avatarLong').toggleAttribute('hidden',a.style!=='long');$('avatarBun').toggleAttribute('hidden',a.style!=='bun');$('avatarOptions').querySelectorAll('button[data-preset]').forEach(b=>b.setAttribute('aria-pressed',String(a[b.dataset.group]===b.dataset.preset)));}
 function openAvatar(){if(!member())return;draft=avatar(me?.desk_id?appearances[me.desk_id]||me.avatar:me.avatar);const root=$('avatarOptions');root.replaceChildren();for(const [k,values] of Object.entries(palettes)){const field=document.createElement('fieldset'),legend=document.createElement('legend'),line=document.createElement('div');legend.textContent=titles[k];line.className='avatar-options';field.append(legend,line);for(const [key,value] of Object.entries(values)){const b=document.createElement('button');b.type='button';b.dataset.group=k;b.dataset.preset=key;b.title=k==='style'?value:names[key];b.setAttribute('aria-label',b.title);if(k==='style')b.textContent=value;else{b.className='avatar-swatch';b.style.setProperty('--swatch',value);}b.onclick=()=>{draft[k]=key;preview();};line.append(b);}root.append(field);}preview();$('avatarDialog').showModal();}
 $('avatarBtn').onclick=openAvatar;$('walkBtn').onclick=toggleWalk;$('returnBtn').onclick=returnDesk;$('avatarCancel').onclick=()=>$('avatarDialog').close();$('avatarDefault').onclick=()=>{draft=avatar();preview();};$('avatarForm').onsubmit=async e=>{e.preventDefault();if(await action('oc50_set_avatar',{p_avatar:avatar(draft)})){if($('avatarDialog').open)$('avatarDialog').close();note('บันทึกตัวละครแล้ว');}};
 // Fallback visualization uses the same server route, but discrete grid markers.
 const lastFallback=new Map();function fallback(){const p=window.officeAPI?.getMap();if(!p||!inOffice()||window.office3D?.active()){document.querySelectorAll('.oc50-floor-avatar').forEach(n=>n.remove());lastFallback.clear();return;}
  const walking=routeState(),active=new Set(walking.map(x=>x.id));for(const [k,c] of Object.entries(p.cells)){if(c.type!=='desk')continue;const el=document.getElementById('c'+k);if(el)el.classList.toggle('oc50-desk-empty',active.has(c.id));}
  for(const [id,n] of lastFallback){if(!active.has(id)||!n.isConnected){n.remove();lastFallback.delete(id);}}
  for(const {id,motion:m} of walking){const key=Object.keys(p.cells).find(k=>p.cells[k].id===id),c=p.cells[key];if(!c||c.connection!=='online')continue;const floor=document.getElementById('c'+Math.round(m.x)+','+Math.round(m.y));if(!floor)continue;let token=lastFallback.get(id);if(!token){token=document.createElement('span');token.className='oc50-floor-avatar';token.dataset.deskKey=key;lastFallback.set(id,token);}token.title=c.name;token.textContent=c.name.slice(0,2).toUpperCase();token.style.setProperty('--avatar-shirt',palettes.shirt[appearance(id).shirt]);if(token.parentNode!==floor)floor.append(token);}
 }
 setInterval(()=>{refreshUI();fallback();},250);
 return {palettes,avatar,appearance,update,lost,refreshUI,isWalking,motion,routeState,now,sample,walkMode:()=>walkMode&&canWalk()&&inOffice(),choose,openAvatar,returnDesk,meDesk:()=>me?.desk_id,member};
})();
