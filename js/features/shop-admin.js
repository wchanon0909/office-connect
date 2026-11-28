/* V6.6.4: The original shop owner can enable or disable shop access for members. */
'use strict';
window.OC664_SHOP=(()=>{
 const $=id=>document.getElementById(id), panel=$('memberShopAdmin'), toggle=$('memberShopToggle'), refresh=$('memberShopRefresh'), status=$('memberShopStatus'), error=$('memberShopError');
 let uid=null,generation=0,setting=null,busy=false,wasVisible=false;
 const user=()=>window.OC41?.currentUser?.()||null;
 const visible=()=>!!user()&&window.OC41?.isAdmin?.()===true&&document.body.classList.contains('admin-mode');
 function paint(){if(!panel)return;panel.hidden=!visible();toggle.disabled=busy||setting?.can_manage!==true;refresh.disabled=busy;toggle.setAttribute('aria-pressed',String(setting?.members_enabled===true));toggle.textContent=setting?.members_enabled===true?'ปิด Shop สำหรับ Member':'เปิด Shop สำหรับ Member';status.textContent=busy?'กำลังตรวจสอบ / บันทึก…':setting?.can_manage===true?(setting.members_enabled?'Member: เปิดร้านค้าแล้ว':'Member: ปิดร้านค้าอยู่'):setting?.can_manage===false?'เฉพาะ Admin เจ้าของ Shop เท่านั้นที่เปลี่ยนการตั้งค่านี้ได้':'ยังไม่ได้โหลดการตั้งค่า';}
 function reset(next){generation++;uid=next;busy=false;setting=null;error.textContent='';}
 function validate(d){if(!d||typeof d.can_manage!=='boolean'||typeof d.members_enabled!=='boolean')throw Error('Invalid shop setting response');return d;}
 async function load(){if(!visible()||busy)return;const u=user();if(u!==uid)reset(u);const g=generation;busy=true;error.textContent='';paint();try{const d=await window.OC41.deskRPC(u,'oc664_shop_settings',{});if(g===generation&&user()===u)setting=validate(d);}catch(e){if(g===generation){setting=null;error.textContent=e?.code==='PGRST202'||e?.http===404?'กรุณาติดตั้ง SQL 30 (V6.6.4) ก่อน':'โหลดการตั้งค่าไม่สำเร็จ: '+e.message;}}finally{if(g===generation){busy=false;paint();}}}
 async function change(){if(!visible()||busy||setting?.can_manage!==true||user()!==uid)return;const g=generation,u=uid,next=!setting.members_enabled;busy=true;error.textContent='';paint();try{const d=await window.OC41.deskRPC(u,'oc664_set_shop',{p_enabled:next});if(g===generation&&user()===u){setting=validate(d);window.OC41.notify(setting.members_enabled?'เปิด Shop สำหรับ Member แล้ว':'ปิด Shop สำหรับ Member แล้ว');}}catch(e){if(g===generation){setting=null;error.textContent='บันทึกไม่สำเร็จ: '+e.message;}}finally{if(g===generation){busy=false;paint();}}}
 function sync(){if(!panel)return;const next=user(),show=visible();if(next!==uid){reset(next);wasVisible=false;}if(!show){if(wasVisible)reset(next);wasVisible=false;paint();return;}const entered=!wasVisible;wasVisible=true;paint();if(entered)void load();}
 function lost(){if(!panel)return;reset(null);wasVisible=false;panel.hidden=true;}
 if(panel){toggle.onclick=()=>void change();refresh.onclick=()=>void load();new MutationObserver(sync).observe(document.body,{attributes:true,attributeFilter:['class']});sync();}
 return {sync,lost};
})();
