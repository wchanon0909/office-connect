/* V5.2 social actions. Speech is explicitly office-wide and separate from private chat. */
'use strict';
window.OC52_SOCIAL=(()=>{
 const $=id=>document.getElementById(id),dialog=$('socialDialog');
 const labels={wave:'โบกมือ',wai:'ไหว้',cheer:'เย้!',clap:'ปรบมือ'};
 const glyphs={wave:'M5 12 3 9m6 0L7 4m6 4V3m4 6 2-4m-1 9 3-3M5 12l5 8h7l3-6-4-5-3 3-3-3Z',wai:'m4 19 4-7 4-8v12l-3 5m11-2-4-7-4-8v12l3 5M8 22h8',cheer:'m4 4 5 9-2 8m13-17-5 9 2 8M9 13h6M12 2v3',clap:'m3 8 5 5 4-6 3 2-4 8 4 4m6-13-5 5m-2-8 1-3m4 5 3-1'};
 let user=null,installed=false,events=new Map(),busy=false,gen=0,meetingRevision=null;
 const now=()=>window.OC50?.now()||Date.now();
 const member=()=>!!user&&installed&&window.OC50?.member();
 const inOffice=()=>!window.officeAPI?.isEditing()&&!window.officeCloudBridge?.isAdminMode();
 function own(){return Object.values(window.officeAPI?.getMap()?.cells||{}).find(c=>c.type==='desk'&&c.id===window.OC50?.meDesk());}
 function pose(){const c=own(),m=c&&window.OC50.motion(c.id);return {c,m,visible:!!c&&c.connection==='online'&&(m?!m.moving&&!m.returning&&m.gesture==null:c.status==='online'&&c.personalStatus!=='break')};}
 function canEmit(){return member()&&inOffice()&&pose().visible;}
 function meetingHere(){const {m}=pose();return member()&&inOffice()&&m?.activity==='meeting'&&!m.moving&&!m.returning&&['seat','lean'].includes(m.pose);}
 function event(id,t=now()){const e=events.get(id);return member()&&e&&e.started_ms<=t+1000&&t<e.expires_ms?e:null;}
 function clear(){events.clear();$('socialSpeech').value='';$('socialLength').textContent='0/80';$('socialError').textContent='';if(dialog.open)dialog.close();}
 function update(d){const next=d?.me?.enabled&&d.me.desk_id&&d.view_member!==false?d.me.user_id:null;if(next!==user){gen++;busy=false;clear();}user=next;installed=d?.social_version===1;meetingRevision=d?.revision;events=new Map();if(user&&installed&&Array.isArray(d.social_events))for(const e of d.social_events){if(typeof e.desk_id!=='string'||(!Object.hasOwn(labels,e.kind)&&e.kind!=='speech')||!Number.isFinite(e.started_ms)||!Number.isFinite(e.expires_ms)||e.expires_ms-e.started_ms>20000)continue;if(e.kind==='speech'&&(typeof e.body!=='string'||Array.from(e.body).length>80))continue;events.set(e.desk_id,e);}refresh();}
 function lost(){gen++;busy=false;user=null;installed=false;meetingRevision=null;clear();refresh();}
 function refresh(){const visible=member()&&inOffice();$('socialBtn').hidden=!visible;if(dialog.open){const allowed=canEmit(),here=meetingHere();for(const b of $('socialEmotes').querySelectorAll('button'))b.disabled=busy||!allowed;$('socialSend').disabled=busy||!allowed||!$('socialSpeech').value.trim();$('socialMeeting').hidden=!here;$('meetingGroupBtn').disabled=busy||!here;if(!visible&&!busy)dialog.close();}}
 function open(){if(!member()||!inOffice())return;$('socialError').textContent=canEmit()?'':'หยุดเดิน หรือกลับมานั่งที่โต๊ะก่อนทักทายนะ';refresh();if(!dialog.open)dialog.showModal();refresh();}
 async function send(kind){if(busy||!canEmit())return;const body=kind==='speech'?$('socialSpeech').value.trim().replace(/[\r\n\t]+/g,' '):'';if(kind==='speech'&&(!body||Array.from(body).length>80))return;const g=gen,u=user;busy=true;$('socialError').textContent='';refresh();try{await window.OC41.livingRPC(u,'oc52_emit',{p_kind:kind,p_body:body});if(g!==gen)return;if(kind==='speech'){$('socialSpeech').value='';$('socialLength').textContent='0/80';}if(dialog.open)dialog.close();}catch(e){if(g===gen)$('socialError').textContent=/wait before|too quickly/i.test(e.message)?'เว้นอย่างน้อย 4 วินาทีก่อนทักทายอีกครั้งนะ':/visible avatar|arrived/i.test(e.message)?'หยุดเดินหรือกลับโต๊ะก่อนนะ':'ทำรายการไม่สำเร็จ: '+e.message;}finally{if(g===gen){busy=false;refresh();}}}
 $('socialBtn').onclick=open;$('socialClose').onclick=()=>{if(!busy)dialog.close();};dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});$('socialSpeech').oninput=()=>{$('socialLength').textContent=$('socialSpeech').value.length+'/80';refresh();};$('socialForm').onsubmit=e=>{e.preventDefault();void send('speech');};for(const b of $('socialEmotes').querySelectorAll('button'))b.onclick=()=>void send(b.dataset.emote);
 $('meetingGroupBtn').onclick=()=>{if(!meetingHere()||busy)return;dialog.close();window.OC43?.meetingGroup();};
 // A bounded fallback for browsers without WebGL. Speech is never interpreted as HTML.
 function fallback(){if(window.office3D?.active()||!member()||!inOffice()){document.querySelectorAll('.oc52-floor-speech').forEach(x=>x.remove());return;}const p=window.officeAPI?.getMap();if(!p)return;const seen=new Set();for(const [k,c] of Object.entries(p.cells)){if(c.type!=='desk'||c.connection!=='online')continue;const e=event(c.id),m=window.OC50.motion(c.id);if(!e||(m?m.moving||m.returning:c.status!=='online'))continue;const node=m?Array.from(document.querySelectorAll('.oc50-floor-avatar')).find(x=>x.dataset.deskKey===k):document.getElementById('c'+k);if(!node)continue;let b=node.querySelector(':scope > .oc52-floor-speech');if(!b){b=document.createElement('span');b.className='oc52-floor-speech';node.append(b);}b.textContent=e.kind==='speech'?e.body:labels[e.kind];seen.add(b);}document.querySelectorAll('.oc52-floor-speech').forEach(x=>{if(!seen.has(x))x.remove();});}
 setInterval(()=>{refresh();fallback();},300);
 return {update,lost,event,labels,glyphs,meetingHere,canEmit,now};
})();
