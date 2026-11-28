/* Office Connect V6.0: private desk notes and admin announcement board. */
'use strict';
window.OC60=(()=>{
 const $=id=>document.getElementById(id), dialog=$('workspaceDialog');
 const tabs={board:['workspaceBoardTab','workspaceBoard'],inbox:['workspaceInboxTab','workspaceInbox'],sent:['workspaceSentTab','workspaceSent'],compose:['workspaceComposeTab','workspaceCompose']};
 let user=null,admin=false,gen=0,tab='board',data=null,connected=false,busy=false,loading=false,last=0,selection=null,postToken=null,noteToken=null,refreshTimer=null,signalPending=false;
 const list=x=>Array.isArray(x)?x:[];
 function el(tag,txt,cls){const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cls)n.className=cls;return n;}
 function btn(label,fn){const n=el('button',label);n.type='button';n.onclick=fn;n.disabled=busy||!connected;return n;}
 function error(t=''){$('workspaceError').textContent=t;}
 function displayError(e){const m=String(e?.message||e);return /PGRST202|schema cache|could not find the function/i.test(m)||e?.http===404?'ยังไม่ได้ติดตั้ง SQL 18 แบบ Install หรือ schema cache ยังไม่อัปเดต':/Admin required|permission denied/i.test(m)?'รายการนี้ต้องใช้สิทธิ์ผู้ดูแล':/Recipient unavailable/i.test(m)?'ไม่พบผู้รับหรือบัญชีไม่ได้ใช้งาน':/wait before sending/i.test(m)?'ส่งข้อความถี่เกินไป ลองอีกครั้งในภายหลัง':/Sign in required|Session changed/i.test(m)?'กรุณาเข้าสู่ระบบใหม่':'ทำรายการไม่สำเร็จ: '+m;}
 function clock(t){const d=new Date(t);return Number.isFinite(d.valueOf())?d.toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'}):'';}
 function count(v){return Math.max(0,Number(v)||0);}
 function badge(){const n=count(data?.unread),b=$('workspaceBadge');b.hidden=!user||!n;b.textContent=n>99?'99+':String(n);$('workspaceInboxCount').textContent=n?b.textContent:'';}
 function controls(){const disabled=busy||loading||!connected||!data;$('workspacePostSend').disabled=disabled||!admin||!data?.admin;$('workspaceNoteSend').disabled=disabled||!$('workspaceRecipient').value;$('workspaceRefresh').disabled=busy||loading||!connected;$('workspaceBoardForm').hidden=!(admin&&data?.admin);$('workspaceHub').hidden=!user;badge();}
 function showTab(name){tab=name;for(const [key,[b,s]] of Object.entries(tabs)){$(b).setAttribute('aria-pressed',String(key===name));$(s).hidden=key!==name;}controls();}
 function empty(root,txt){root.append(el('p',txt,'oc60-empty'));}
 function meta(root,name,time){root.append(el('small',name+' · '+clock(time),'oc60-meta'));}
 function render(){controls();if(!dialog.open||!data)return;
  const board=$('workspaceBoardList'),inbox=$('workspaceInboxList'),sent=$('workspaceSentList');board.replaceChildren();inbox.replaceChildren();sent.replaceChildren();
  for(const a of list(data.announcements)){const item=el('article',undefined,'oc60-item'),h=el('div',undefined,'oc60-item-head');h.append(el('strong',a.title));if(admin&&data.admin)h.append(btn('ลบ',()=>{if(confirm('ลบประกาศนี้สำหรับทุกคน?'))void mutate('oc60_remove_announcement',{p_id:a.id},'ลบประกาศแล้ว');}));item.append(h);meta(item,a.author_name,a.created_at);item.append(el('p',a.body,'oc60-body'));board.append(item);}
  if(!board.children.length)empty(board,'ยังไม่มีประกาศ');
  for(const n of list(data.inbox)){const item=el('article',undefined,'oc60-item'+(!n.read_at?' oc60-unread':''));meta(item,'จาก '+n.sender_name,n.created_at);item.append(el('p',n.body,'oc60-body'));const actions=el('div',undefined,'oc60-item-actions');if(!n.read_at)actions.append(btn('อ่านแล้ว',()=>void mutate('oc60_read_note',{p_id:n.id,p_archive:false},'บันทึกว่าอ่านแล้ว')));else actions.append(el('small','อ่านแล้ว','oc60-meta'));actions.append(btn('เก็บออกจากกล่อง',()=>void mutate('oc60_read_note',{p_id:n.id,p_archive:true},'เก็บข้อความแล้ว')));item.append(actions);inbox.append(item);}
  if(!inbox.children.length)empty(inbox,'ยังไม่มีข้อความฝากถึงคุณ');
  for(const n of list(data.sent)){const item=el('article',undefined,'oc60-item');meta(item,'ถึง '+n.recipient_name,n.created_at);item.append(el('p',n.body,'oc60-body'),el('small',n.read_at?'อ่านแล้ว · '+clock(n.read_at):'ยังไม่ได้อ่าน','oc60-meta'));sent.append(item);}
  if(!sent.children.length)empty(sent,'ยังไม่มีข้อความที่ส่ง');
  const select=$('workspaceRecipient'),old=select.value;const contacts=list(data.contacts);select.replaceChildren(new Option('เลือกเพื่อนร่วมงาน',''));for(const c of contacts)select.append(new Option(c.nickname+' · '+c.desk_id,c.id));
  if(selection!==null&&!loading){const c=contacts.find(x=>x.desk_id===selection);select.value=c?.id||'';if(!c)error('ไม่พบเจ้าของโต๊ะนี้แล้ว กรุณาเลือกผู้รับ');selection=null;}else if(contacts.some(c=>c.id===old))select.value=old;
  controls();
 }
 async function rpc(name,args={},g=gen,backgroundRead=false){const u=user;if(!u)throw Error('Sign in required');const result=await window.OC41.workspaceRPC(u,name,args,backgroundRead);if(g!==gen||u!==user)throw Error('Session changed');return result;}
 async function refresh(force=false,backgroundRead=false){if(!user||!connected||busy||loading||(!force&&Date.now()-last<20000))return;signalPending=false;const g=gen;loading=true;last=Date.now();controls();if(dialog.open&&!data)$('workspaceInfo').textContent='กำลังโหลด…';try{const d=await rpc('oc60_workspace',{},g,backgroundRead);if(d?.version!==1)throw Error('Workspace version mismatch');data=d;loading=false;error();if(dialog.open)$('workspaceInfo').textContent='อัปเดต '+new Date().toLocaleTimeString('th-TH');render();}catch(e){if(g===gen){data=null;if(dialog.open){error(displayError(e));$('workspaceInfo').textContent='';for(const id of ['workspaceBoardList','workspaceInboxList','workspaceSentList'])$(id).replaceChildren();}controls();}}finally{if(g===gen){loading=false;controls();if(signalPending)signalRefresh();}}}
 function clear(){clearTimeout(refreshTimer);refreshTimer=null;signalPending=false;data=null;last=0;busy=false;loading=false;selection=null;postToken=null;noteToken=null;for(const id of ['workspaceBoardList','workspaceInboxList','workspaceSentList'])$(id).replaceChildren();$('workspaceBoardForm').reset();$('workspaceNoteForm').reset();$('workspaceRecipient').replaceChildren(new Option('เลือกเพื่อนร่วมงาน',''));$('workspaceInfo').textContent='';error();if(dialog.open)dialog.close();controls();}
 function accountChanged(next,isAdmin=false){next=next||null;if(next!==user){gen++;user=next;admin=!!isAdmin;connected=!!next;clear();if(next)void refresh(true,true);return;}const reconnect=!connected&&!!next;admin=!!isAdmin;connected=!!next;controls();if(reconnect)void refresh(true,true);else if(next&&!window.OC41?.notificationReady?.())void refresh(false,true);}
 function signalRefresh(){if(!user||!connected)return;signalPending=true;if(loading||busy||document.hidden||refreshTimer!==null)return;refreshTimer=setTimeout(()=>{refreshTimer=null;void refresh(true,true);},250);}
 function transportChanged(){signalRefresh();}
 function connectionLost(){connected=false;controls();if(dialog.open)error('การเชื่อมต่อขัดข้อง · ระบบจะตรวจข้อมูลอีกครั้งเมื่อเชื่อมต่อได้');}
 function open(name='board',desk=null){if(!user){window.OC41?.openMyDesk();return;}if(!connected){window.OC41?.notify('กำลังเชื่อมต่อออฟฟิศ ลองอีกครั้ง');return;}if(desk!==null){selection=desk;$('workspaceRecipient').value='';}error();showTab(name);if(!dialog.open)dialog.showModal();if(desk!==null){void refresh(true);render();}else{render();void refresh(true);}}
 async function mutate(name,args,success,onSuccess){if(busy||loading||!user||!connected)return;const g=gen;busy=true;controls();error();try{await rpc(name,args,g);if(g!==gen)return;if(onSuccess)onSuccess();window.OC41?.notify(success);}catch(e){if(g===gen)error(displayError(e));return;}finally{if(g===gen){busy=false;controls();if(signalPending)signalRefresh();}}if(g===gen){last=0;await refresh(true);}}
 function idFor(old,body){const key=JSON.stringify(body);return old?.key===key?old:{key,id:crypto.randomUUID()};}
 $('workspaceHub').onclick=()=>open(count(data?.unread)?'inbox':'board');$('workspaceClose').onclick=()=>dialog.close();$('workspaceRefresh').onclick=()=>refresh(true);$('workspaceRecipient').onchange=controls;
 for(const [name,[b]] of Object.entries(tabs))$(b).onclick=()=>{showTab(name);render();};
 $('workspaceBoardForm').onsubmit=e=>{e.preventDefault();const title=$('workspacePostTitle').value.trim(),body=$('workspacePostBody').value.trim();if(!admin||!data?.admin||!title||!body)return;postToken=idFor(postToken,[title,body]);void mutate('oc60_post_announcement',{p_id:postToken.id,p_title:title,p_body:body},'เผยแพร่ประกาศแล้ว',()=>{$('workspaceBoardForm').reset();postToken=null;});};
 $('workspaceNoteForm').onsubmit=e=>{e.preventDefault();const recipient=$('workspaceRecipient').value,body=$('workspaceNoteBody').value.trim();if(!recipient||!body||!data)return;noteToken=idFor(noteToken,[recipient,body]);void mutate('oc60_send_note',{p_id:noteToken.id,p_recipient:recipient,p_body:body},'ฝากข้อความแล้ว',()=>{$('workspaceNoteForm').reset();noteToken=null;showTab('sent');});};
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)void refresh(true);});window.addEventListener('online',()=>{if(user&&connected)void refresh(true);});
 setInterval(()=>{if(user&&connected&&!document.hidden&&window.OC41?.notificationReady?.()&&Date.now()-last>=(dialog.open?20000:60000))void refresh(true,true);},5000);
 return {accountChanged,connectionLost,signalRefresh,transportChanged,open,openDesk:id=>open('compose',id)};
})();
