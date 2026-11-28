/* V5.1.1 - Local view preferences. No database writes. */
'use strict';
window.OC511_VIEW=(()=>{
 const KEY='office-connect:view-preferences:v1';
 const DEFAULT_ELEVATION=30, DEFAULT_AZIMUTH=45;
 const norm=a=>((a%360)+360)%360;
 // V5.3.4: enable once for existing installations as well as new users.
 const defaults={mode:'desk',bubbles:true};
 let prefs={...defaults};
 try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(raw){prefs.mode=raw.mode==='fixed'?'fixed':'desk';prefs.bubbles=raw.bubbleDefaultVersion===2?raw.bubbles!==false:true;}}catch{}
 const $=id=>document.getElementById(id);
 const mode=()=>prefs.mode,bubbles=()=>prefs.bubbles;
 const officeMode=()=>!window.officeAPI?.isEditing()&&!window.officeCloudBridge?.isAdminMode();
 function ownDesk(plan,id){return id?Object.values(plan?.cells||{}).find(c=>c.type==='desk'&&c.id===id)||null:null;}
 function heading(rotation,selectedMode=mode()){
  return norm(DEFAULT_AZIMUTH-(selectedMode==='desk'&&[0,90,180,270].includes(rotation)?rotation:0));
 }
 function currentDesk(plan){return window.OC50?.member()&&officeMode()?ownDesk(plan,window.OC50.meDesk()):null;}
 function seatKey(plan){const desk=currentDesk(plan);return desk?desk.id+':'+desk.rotation:'';}
 function azimuth(plan){return heading(currentDesk(plan)?.rotation,officeMode()?mode():'fixed');}
 // Use the previous desktop frustum as a visual size reference (55/15 at 150%).
 // Clamp for narrow/tall displays so the whole office still fits on first load.
 function bounds(plan,aspect,elev,az){const a=elev*Math.PI/180,b=az*Math.PI/180,W=plan.cols*1.82,D=plan.rows*1.82;
  return {width:Math.abs(Math.cos(b))*W+Math.abs(Math.sin(b))*D,height:(Math.abs(Math.sin(b))*W+Math.abs(Math.cos(b))*D)*Math.sin(a)+2.5};}
 function fitBase(plan,aspect,elev,az){const q=bounds(plan,aspect,elev,az);return Math.max(q.height/2,q.width/(2*aspect))*1.09;}
 function framing(plan,w,h,az){const aspect=Math.max(1,w)/Math.max(1,h),zoom=w<650?1.02:1.5;
  const base=Math.max(fitBase(plan,aspect,55,15),fitBase(plan,aspect,DEFAULT_ELEVATION,az)*zoom);
  const verticalRoom=base/zoom-bounds(plan,aspect,DEFAULT_ELEVATION,az).height/2;
  return {zoom,base,upwardShift:w>=650?Math.max(0,Math.min(base/zoom*.08,verticalRoom*.6)):0};}
 function seated(c,walking){return !!c?.name&&c.connection==='online'&&c.status==='online'&&!walking;}
 function save(){try{localStorage.setItem(KEY,JSON.stringify({...prefs,bubbleDefaultVersion:2}));}catch{}}
 function paint(){const follow=$('followDeskView'),fixed=$('fixedOfficeView'),toggle=$('statusBubbles');if(follow)follow.setAttribute('aria-pressed',String(mode()==='desk'));if(fixed)fixed.setAttribute('aria-pressed',String(mode()==='fixed'));if(toggle){toggle.setAttribute('aria-pressed',String(bubbles()));toggle.title=bubbles()?'ซ่อนสถานะเหนือหัว':'แสดงสถานะเหนือหัว';toggle.setAttribute('aria-label',toggle.title);toggle.querySelector('span').textContent=bubbles()?'สถานะ: เปิด':'สถานะ: ปิด';}}
 function setMode(next){if(!['desk','fixed'].includes(next))return;prefs.mode=next;save();paint();window.office3D?.resetView();}
 function toggleBubbles(){prefs.bubbles=!prefs.bubbles;save();paint();window.office3D?.updateBubbles();}
 function ready(ok){for(const id of ['followDeskView','fixedOfficeView','statusBubbles']){const b=$(id);if(b)b.disabled=!ok;}}
 function showAngle(a){const out=$('azimuthValue');if(out)out.textContent=norm(a)+'\u00b0';}
 $('followDeskView').onclick=()=>setMode('desk');$('fixedOfficeView').onclick=()=>setMode('fixed');$('statusBubbles').onclick=toggleBubbles;
 save();paint();ready(false);
 return {DEFAULT_ELEVATION,DEFAULT_AZIMUTH,mode,bubbles,ownDesk,heading,azimuth,seatKey,fitBase,framing,seated,setMode,toggleBubbles,ready,showAngle};
})();
