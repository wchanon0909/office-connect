/* V6.4 desk decorator studio: cute pseudo-3D chibi scene + expanded shop. */
'use strict';
window.OC64_DESK=(()=>{
 const CATALOG=[
  {id:'desk_lamp',name:'โคมไฟตั้งโต๊ะ',price:18,emoji:'💡',category:'office',desc:'โคมไฟน่ารักสำหรับมุมทำงาน'},
  {id:'mini_plant',name:'ต้นไม้จิ๋ว',price:12,emoji:'🪴',category:'cute',desc:'เพิ่มความสดชื่นบนโต๊ะ'},
  {id:'pen_cup',name:'แก้วใส่ปากกา',price:10,emoji:'🖊️',category:'office',desc:'เครื่องเขียนพร้อมใช้งาน'},
  {id:'file_tray',name:'ถาดเอกสาร',price:14,emoji:'📂',category:'office',desc:'ช่วยให้โต๊ะดูเป็นระเบียบ'},
  {id:'calendar',name:'ปฏิทินตั้งโต๊ะ',price:10,emoji:'🗓️',category:'office',desc:'แต่งโต๊ะให้ดูทำงานจริง'},
  {id:'cat_mug',name:'แก้วแมวน้อย',price:9,emoji:'☕',category:'cute',desc:'พร็อพจิบกาแฟน่ารักๆ'},
  {id:'cute_clock',name:'นาฬิกาตั้งโต๊ะ',price:16,emoji:'⏰',category:'cute',desc:'นาฬิกาจิบิสีพาสเทล'},
  {id:'pastel_books',name:'กองหนังสือพาสเทล',price:15,emoji:'📚',category:'office',desc:'วางที่ชั้นหรือโต๊ะก็ได้'},
  {id:'memo_board',name:'บอร์ดโน้ตจิ๋ว',price:20,emoji:'📝',category:'office',desc:'บอร์ดติดโน้ตโทนน่ารัก'},
  {id:'desk_fan',name:'พัดลมมินิ',price:20,emoji:'🌀',category:'office',desc:'พร็อพสายทำงานชิลๆ'},
  {id:'tissue_box',name:'กล่องทิชชูคิวท์',price:11,emoji:'🧻',category:'cute',desc:'ช่วยเติมความอบอุ่นให้โต๊ะ'},
  {id:'stapler_pastel',name:'เครื่องเย็บกระดาษพาสเทล',price:13,emoji:'📎',category:'office',desc:'อุปกรณ์สำนักงานไซส์จิ๋ว'},
  {id:'laptop_stand',name:'แท่นวางโน้ตบุ๊ก',price:22,emoji:'💻',category:'office',desc:'เพิ่มความเป็น working desk'},
  {id:'teddy',name:'ตุ๊กตาหมีจิ๋ว',price:25,emoji:'🧸',category:'cute',desc:'ของตกแต่งชิ้นโปรดของชาวจิบิ'},
  {id:'mini_drawer',name:'ลิ้นชักจิ๋ว',price:24,emoji:'🗃️',category:'office',desc:'ช่วยให้มุมโต๊ะดูมีมิติ'},
  {id:'plush_cloud',name:'ตุ๊กตาเมฆนุ่ม',price:26,emoji:'☁️',category:'cute',desc:'ชั้นวางจะดูหวานขึ้นทันที'},
  {id:'sticker_set',name:'สติ๊กเกอร์เดคอเรท',price:8,emoji:'⭐',category:'cute',desc:'แต่งโต๊ะแบบคิ้วท์ๆ'},
  {id:'neon_sign',name:'ป้ายไฟ mini',price:30,emoji:'✨',category:'cute',desc:'พร็อพเรืองแสงเบาๆ'},
 ];
 const CATALOG_MAP=new Map(CATALOG.map(x=>[x.id,x]));
 const ITEM_ART={"desk_lamp":"<path d=\"M31 56h24l7 7H22Z\" fill=\"#7b8faa\"/><path d=\"M42 56V27l12-9\" stroke=\"#657b9c\" stroke-width=\"6\" stroke-linecap=\"round\"/><path d=\"M43 22 56 6 72 20 61 37Z\" fill=\"#f4ba74\"/><ellipse cx=\"60\" cy=\"29\" rx=\"10\" ry=\"5\" fill=\"#fff4c4\"/>","mini_plant":"<path d=\"M22 40h36l-5 25H28Z\" fill=\"#cf9279\"/><ellipse cx=\"40\" cy=\"40\" rx=\"18\" ry=\"6\" fill=\"#8e6657\"/><path d=\"M40 40Q25 10 16 13Q12 35 40 40M40 40Q56 5 67 12Q72 32 40 40M40 38Q34 5 43 3Q53 20 40 38\" fill=\"#78aa89\"/>","pen_cup":"<path d=\"M25 30l4 34h24l5-34\" fill=\"#9cb6e0\"/><ellipse cx=\"41\" cy=\"30\" rx=\"17\" ry=\"5\" fill=\"#5b739f\"/><path d=\"m33 31-8-25m15 24 3-28m7 29 14-23\" stroke=\"#ef9b9a\" stroke-width=\"6\" stroke-linecap=\"round\"/><path d=\"m39 19 3-15\" stroke=\"#e0bb68\" stroke-width=\"5\"/>","file_tray":"<path d=\"m13 37 37-11 22 13-38 13Z\" fill=\"#e8eaf3\"/><path d=\"M13 37v17l21 13V52Z\" fill=\"#8296bb\"/><path d=\"m34 52 38-13v16L34 67Z\" fill=\"#a8bbda\"/><path d=\"m19 31 36-10 12 12-35 12Z\" fill=\"#fff5dc\"/><path d=\"m32 36 27-8\" stroke=\"#b1c0d8\" stroke-width=\"2\"/>","calendar":"<path d=\"M20 63 29 17 63 17 72 63Z\" fill=\"#be9d8a\"/><rect x=\"15\" y=\"14\" width=\"47\" height=\"46\" rx=\"5\" fill=\"#fff9ed\"/><path d=\"M15 25h47V16q0-5-5-5H20q-5 0-5 5Z\" fill=\"#ec9ab1\"/><path d=\"M25 8v10m26-10v10\" stroke=\"#7883a2\" stroke-width=\"4\"/><path d=\"M24 34h29M24 42h29M24 50h29M33 30v24M43 30v24\" stroke=\"#bdc9de\" stroke-width=\"2\"/>","cat_mug":"<path d=\"M58 35q22-4 17 13-5 9-17 7\" fill=\"none\" stroke=\"#dcacb9\" stroke-width=\"7\"/><path d=\"M20 29v23q2 14 21 14t20-14V29Z\" fill=\"#efb9cc\"/><path d=\"m20 28 3-13 13 10 12-1 11-10 2 15\" fill=\"#efb9cc\"/><ellipse cx=\"41\" cy=\"29\" rx=\"20\" ry=\"6\" fill=\"#956e65\"/><circle cx=\"32\" cy=\"45\" r=\"2.8\" fill=\"#644955\"/><circle cx=\"49\" cy=\"45\" r=\"2.8\" fill=\"#644955\"/><path d=\"m38 51 3 2 3-2\" stroke=\"#8e516b\" stroke-width=\"2\" fill=\"none\"/>","cute_clock":"<path d=\"m26 55-6 11m34-11 7 11\" stroke=\"#b69bbd\" stroke-width=\"6\"/><circle cx=\"40\" cy=\"36\" r=\"28\" fill=\"#bbaad9\"/><circle cx=\"40\" cy=\"35\" r=\"22\" fill=\"#fff7e6\"/><path d=\"M40 19v17l12 7\" stroke=\"#776e93\" stroke-width=\"4\" stroke-linecap=\"round\"/><circle cx=\"40\" cy=\"35\" r=\"3\" fill=\"#e6a8bd\"/><path d=\"m15 14 9-9 8 5m17 0 9-5 8 9\" stroke=\"#e7b5c8\" stroke-width=\"6\"/>","pastel_books":"<path d=\"m14 52 41-10 19 11-40 12-20-5Z\" fill=\"#9eb9dc\"/><path d=\"m14 42 41-10 19 11-40 12-20-5Z\" fill=\"#edc48d\"/><path d=\"m14 31 41-10 19 11-40 12-20-5Z\" fill=\"#e5a8bb\"/><path d=\"m34 44 40-12v6L34 50Z\" fill=\"#fff4e3\"/><path d=\"m34 55 40-12v5L34 60Z\" fill=\"#fff4e3\"/>","memo_board":"<rect x=\"10\" y=\"10\" width=\"60\" height=\"51\" rx=\"5\" fill=\"#c6a683\"/><rect x=\"15\" y=\"15\" width=\"50\" height=\"41\" rx=\"2\" fill=\"#ead1aa\"/><rect x=\"21\" y=\"21\" width=\"18\" height=\"19\" rx=\"2\" fill=\"#f5d990\" transform=\"rotate(-7 21 21)\"/><rect x=\"43\" y=\"26\" width=\"17\" height=\"21\" rx=\"2\" fill=\"#b0cfdb\" transform=\"rotate(8 43 26)\"/><circle cx=\"30\" cy=\"22\" r=\"2\" fill=\"#ab6d80\"/><circle cx=\"50\" cy=\"28\" r=\"2\" fill=\"#ab6d80\"/>","desk_fan":"<ellipse cx=\"40\" cy=\"62\" rx=\"22\" ry=\"5\" fill=\"#96aac4\"/><path d=\"M40 58V39\" stroke=\"#849bbd\" stroke-width=\"8\"/><circle cx=\"40\" cy=\"27\" r=\"24\" fill=\"#b4c7e3\"/><circle cx=\"40\" cy=\"27\" r=\"19\" fill=\"#e5f0fa\"/><path d=\"M40 27q-22-21-20-4t20 4q-3 29 10 15t-10-15q25-10 13-18T40 27\" fill=\"#91accf\"/><circle cx=\"40\" cy=\"27\" r=\"5\" fill=\"#6f87ad\"/>","tissue_box":"<path d=\"m11 36 45-13 17 13-44 14Z\" fill=\"#ffd5d9\"/><path d=\"M11 36v22l18 10V50Z\" fill=\"#c58da4\"/><path d=\"m29 50 44-14v22L29 68Z\" fill=\"#e6abc1\"/><path d=\"M29 37q8-4 25-5l-5-18-10 5-8-11-3 18Z\" fill=\"#fffaf0\"/>","stapler_pastel":"<path d=\"m10 51 52-13 10 8-52 15Z\" fill=\"#a29fc1\"/><path d=\"m10 51 10 10 52-15v6L20 67 10 57Z\" fill=\"#7a7b9f\"/><path d=\"m11 40 43-17q13-3 18 6v9L20 53Z\" fill=\"#dfb0cc\"/><path d=\"M20 53v-5l52-17\" fill=\"none\" stroke=\"#f6d9e5\" stroke-width=\"4\"/>","laptop_stand":"<path d=\"m14 47 35-13 25 13-37 15Z\" fill=\"#b4c3d8\"/><path d=\"m37 62 37-15v6L37 68 14 54v-7Z\" fill=\"#8194b6\"/><path d=\"M18 16 60 9l11 31-43 10Z\" fill=\"#7888a9\"/><path d=\"m23 20 34-6 8 22-34 8Z\" fill=\"#c5dfed\"/><path d=\"m28 50 43-10-10 9-35 11Z\" fill=\"#c3cce0\"/>","teddy":"<circle cx=\"24\" cy=\"16\" r=\"12\" fill=\"#c98f6b\"/><circle cx=\"57\" cy=\"16\" r=\"12\" fill=\"#c98f6b\"/><ellipse cx=\"40\" cy=\"49\" rx=\"22\" ry=\"20\" fill=\"#c99072\"/><ellipse cx=\"40\" cy=\"29\" rx=\"25\" ry=\"23\" fill=\"#dfb18b\"/><ellipse cx=\"40\" cy=\"37\" rx=\"11\" ry=\"9\" fill=\"#f2d0ae\"/><circle cx=\"31\" cy=\"28\" r=\"3\" fill=\"#5e4a43\"/><circle cx=\"49\" cy=\"28\" r=\"3\" fill=\"#5e4a43\"/><ellipse cx=\"40\" cy=\"34\" rx=\"4\" ry=\"3\" fill=\"#765449\"/><ellipse cx=\"22\" cy=\"57\" rx=\"11\" ry=\"9\" fill=\"#dca989\"/><ellipse cx=\"58\" cy=\"57\" rx=\"11\" ry=\"9\" fill=\"#dca989\"/>","mini_drawer":"<path d=\"m12 20 42-10 16 10-41 12Z\" fill=\"#f5e2ce\"/><path d=\"M12 20v37l17 11V32Z\" fill=\"#bba68f\"/><path d=\"m29 32 41-12v38L29 68Z\" fill=\"#d7c4b0\"/><path d=\"m33 38 33-9v13l-33 9Zm0 17 33-9v9l-33 10Z\" fill=\"#f6e7d6\"/><path d=\"m45 42 8-2m-8 17 8-2\" stroke=\"#a899a1\" stroke-width=\"3\"/>","plush_cloud":"<path d=\"M17 54Q3 42 19 31 20 10 39 16 55 7 63 27 79 34 72 48 70 61 17 54Z\" fill=\"#e8eafa\" stroke=\"#b7bedb\" stroke-width=\"2\"/><circle cx=\"32\" cy=\"39\" r=\"3\" fill=\"#706e94\"/><circle cx=\"52\" cy=\"39\" r=\"3\" fill=\"#706e94\"/><path d=\"M38 45q4 4 8 0\" fill=\"none\" stroke=\"#aa779a\" stroke-width=\"2\"/>","sticker_set":"<rect x=\"19\" y=\"12\" width=\"44\" height=\"53\" rx=\"5\" fill=\"#fff9e8\" transform=\"rotate(-8 40 40)\"/><path d=\"m31 19 3 8 8 1-6 5 2 8-7-5-7 5 2-8-6-5 8-1Z\" fill=\"#efc36f\"/><path d=\"M47 39q-9-7-13 0t13 14q19-12 9-16-5-3-9 2Z\" fill=\"#eab2c6\"/>","neon_sign":"<rect x=\"10\" y=\"13\" width=\"60\" height=\"43\" rx=\"12\" fill=\"#8c87b8\"/><path d=\"M40 45Q17 30 27 22q8-5 13 4 5-9 13-4 10 8-13 23Z\" fill=\"none\" stroke=\"#ffc6e5\" stroke-width=\"5\" stroke-linejoin=\"round\"/><path d=\"M40 56v8m-15 0h30\" stroke=\"#7b769f\" stroke-width=\"4\"/>"}; function itemArt(meta){return ITEM_ART[meta.id]?'<svg viewBox="0 0 80 72" aria-hidden="true" focusable="false"><ellipse cx="42" cy="66" rx="29" ry="4" fill="#796c7c" opacity=".17"/>'+ITEM_ART[meta.id]+'</svg>':esc(meta.emoji);}
 const SLOT_LABEL={1:'โต๊ะซ้าย',2:'โต๊ะกลาง',3:'โต๊ะขวา',4:'ชั้นบนซ้าย',5:'ชั้นบนกลาง',6:'ชั้นบนขวา'};
 const ROTATIONS=[0,90,180,270];
 const $=id=>document.getElementById(id);const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let generation=0, state=null, mode='mine', deskId='', ownerName='', loading=false, acting=false, selectedItem='', selectedSlot=1, selectedRotation=0, mounted=false, wrapped=false;
 function me(){return window.OC41?.currentUser?.()||null;}
 function notify(msg){window.OC41?.notify?.(msg);} 
 function descError(e){const t=String(e?.message||e); if(e?.code==='PGRST202'||e?.http===404||/Could not find the function|Invalid desk method/i.test(t)) return 'ระบบตกแต่งโต๊ะยังไม่พร้อม กรุณาติดตั้ง SQL 27 (V6.5) ก่อน'; if(/Not enough coins/i.test(t))return 'Coin ไม่พอสำหรับซื้อชิ้นนี้'; if(/Item not owned/i.test(t))return 'คุณยังไม่ได้ซื้อไอเทมนี้'; if(/Desk owner unavailable/i.test(t))return 'เจ้าของโต๊ะยังไม่พร้อมให้เข้าชม'; return 'ทำรายการไม่สำเร็จ: '+t; }
 function build(){
  if(mounted) return;
  const html=`<dialog id="deskStudioDialog" class="feature-dialog cloud-dialog oc64-dialog" aria-labelledby="deskStudioTitle">
   <div class="dialog-heading oc64-head"><div><small>DESK DECOR STUDIO</small><h2 id="deskStudioTitle">มุมโต๊ะจิบิ 2.5D</h2><p class="muted" id="deskStudioSubtitle">แต่งโต๊ะด้วยของน่ารักและอุปกรณ์สำนักงาน</p></div><div class="oc64-wallet"><span>Coin</span><strong id="deskStudioCoins">—</strong></div></div>
   <div class="oc64-toolbar"><div class="oc64-tabs" role="tablist" aria-label="Desk Studio tabs"><button type="button" data-tab="scene" aria-pressed="true">Scene</button><button type="button" data-tab="inventory">Inventory</button><button type="button" data-tab="shop">Shop</button><button type="button" data-tab="ledger">Ledger</button></div><div class="oc64-tools"><label>หมุน<select id="deskStudioRotation"><option value="0">0°</option><option value="90">90°</option><option value="180">180°</option><option value="270">270°</option></select></label><button type="button" id="deskStudioRefresh">รีเฟรช</button></div></div>
   <div id="deskStudioError" class="cloud-error" role="alert"></div>
   <div class="oc64-layout">
    <section class="oc64-scene-wrap"><div class="oc64-scene-card"><div class="oc64-scene-meta"><strong id="deskStudioOwner">โต๊ะของฉัน</strong><span id="deskStudioStats">—</span></div>
      <div class="oc64-room">
        <div class="oc64-wall"></div><div class="oc64-shelf"><div class="oc64-slot oc64-slot-4" data-slot="4"></div><div class="oc64-slot oc64-slot-5" data-slot="5"></div><div class="oc64-slot oc64-slot-6" data-slot="6"></div></div>
        <div class="oc64-floor"></div><div class="oc64-chair"></div><div class="oc64-desk"></div>
        <div class="oc64-slot oc64-slot-1" data-slot="1"></div><div class="oc64-slot oc64-slot-2" data-slot="2"></div><div class="oc64-slot oc64-slot-3" data-slot="3"></div>
        <div class="oc64-chibi"><div class="oc64-chibi-head"></div><div class="oc64-chibi-body"></div></div>
      </div>
      <div class="oc64-scene-help" id="deskStudioHelp">เลือกไอเทมจาก Inventory แล้วคลิก slot ในฉากเพื่อวาง</div>
    </div></section>
    <section class="oc64-side"><div id="deskStudioPanel"></div></section>
   </div>
   <div class="dialog-actions"><button type="button" id="deskStudioClose">ปิด</button></div>
  </dialog>`;
  document.body.insertAdjacentHTML('beforeend',html);
  $('deskStudioClose').onclick=()=>{if(!acting&&!loading)$('deskStudioDialog').close();};
  $('deskStudioRefresh').onclick=()=>mode==='mine'?void refreshMine(true):void refreshVisit(deskId,ownerName,true);
  $('deskStudioRotation').onchange=e=>{selectedRotation=Number(e.target.value)||0; render();};
  $('deskStudioDialog').addEventListener('cancel',e=>{if(acting||loading)e.preventDefault();});
  $('deskStudioDialog').addEventListener('close',()=>{$('deskStudioError').textContent=''; selectedItem='';});
  $('deskStudioPanel').addEventListener('click',handlePanelClick);
  document.querySelector('.oc64-room').addEventListener('click',e=>{const slot=e.target.closest('.oc64-slot'); if(slot) handleSlot(Number(slot.dataset.slot));});
  document.querySelectorAll('#deskStudioDialog [data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('#deskStudioDialog [data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===b))); $('deskStudioDialog').dataset.tab=b.dataset.tab; render();});
  mounted=true;
 }
 function addProfileButton(body){if(!me()||!body)return;const panel=document.createElement('div');panel.className='profile-box oc64-profile-panel';const title=document.createElement('strong');title.textContent='มุมโต๊ะจิบิ';const b=document.createElement('button');b.type='button';b.className='primary';b.textContent='เปิด Desk Decor Studio';b.onclick=()=>openMine();panel.append(title,b);body.append(panel);}
 function addDeskButton(c,card,mine){if(!me()||!c||c.visualOnly||!c.name)return;const b=document.createElement('button');b.type='button';b.textContent=mine?'ตกแต่งโต๊ะของฉัน':'ชมมุมโต๊ะ';b.onclick=()=>mine?openMine():openVisit(c.id,c.name);card.append(b);}
 function lost(){generation++;state=null;loading=false;acting=false;selectedItem='';if($('deskStudioDialog')?.open)$('deskStudioDialog').close();}
 function panelMsg(msg,cls='oc64-empty'){ const p=document.createElement('p'); p.className=cls; p.textContent=msg; return p; }
 function catalogList(){
  const server=new Map((state?.catalog||[]).map(x=>[x.item_id,Number(x.price)||0]));
  const merged=[];
  for(const item of CATALOG){
   const has=server.has(item.id); merged.push({...item, price:has?server.get(item.id):item.price, available:has});
  }
  for(const x of (state?.catalog||[])) if(!CATALOG_MAP.has(x.item_id)) merged.push({id:x.item_id,name:x.item_id,price:Number(x.price)||0,emoji:'📦',category:'misc',desc:'รายการจากฐานข้อมูล',available:true});
  return merged;
 }
 function ownedSet(){ return new Set(Array.isArray(state?.owned)?state.owned:[]); }
 function decorAt(slot){ return (Array.isArray(state?.decor)?state.decor:[]).find(x=>Number(x.slot)===Number(slot))||null; }
 function itemMeta(id){ return CATALOG_MAP.get(id)||{id,name:id,emoji:'📦',category:'misc',desc:'ไอเทมจากฐานข้อมูล'}; }
 function slotLabel(slot){ return SLOT_LABEL[slot]||('slot '+slot); }
 async function rpc(name,args={}){ const u=me(); if(!u) throw Error('Sign in required'); return window.OC41.deskRPC(u,name,args); }
 async function refreshMine(force=false){build();if(loading||acting||!me())return;const g=++generation;loading=true;mode='mine';state=null;deskId=window.OC50?.meDesk?.()||'';ownerName='โต๊ะของฉัน';$('deskStudioError').textContent='';if(!$('deskStudioDialog').open)$('deskStudioDialog').showModal();render();try{const d=await rpc('oc65_shop',{});if(g===generation)state=d;}catch(e){if(g===generation)$('deskStudioError').textContent=descError(e);}finally{if(g===generation){loading=false;render();}}}
 async function refreshVisit(desk,name,force=false){build();if(loading||acting||!me())return;const g=++generation;loading=true;mode='visit';state=null;deskId=desk;ownerName=name||'เพื่อนร่วมงาน';$('deskStudioError').textContent='';if(!$('deskStudioDialog').open)$('deskStudioDialog').showModal();render();try{const d=await rpc('oc64_visit',{p_desk:desk});if(g===generation)state=d;}catch(e){if(g===generation)$('deskStudioError').textContent=descError(e);}finally{if(g===generation){loading=false;render();}}}
 async function act(fn){if(acting||loading||mode!=='mine'||!state)return false;const g=generation;acting=true;$('deskStudioError').textContent='';render();try{await fn();return g===generation;}catch(e){if(g===generation)$('deskStudioError').textContent=descError(e);return false;}finally{if(g===generation){acting=false;render();}}}
 async function buy(itemId){ const ok=await act(()=>rpc('oc64_buy',{p_item:itemId})); if(ok){ notify('ซื้อไอเทมแล้ว'); await refreshMine(true);} }
 async function place(itemId,slot,rotation){ const ok=await act(()=>rpc('oc64_place',{p_item:itemId,p_slot:slot,p_rotation:rotation})); if(ok){ if(slot===0) notify('เก็บไอเทมกลับคลังแล้ว'); else {notify('จัดวางไอเทมเรียบร้อย');selectedItem='';} await refreshMine(true);} }
 function renderSceneSlots(){
  document.querySelectorAll('.oc64-room .oc64-slot').forEach(node=>{ const slot=Number(node.dataset.slot);node.classList.toggle('selected',slot===selectedSlot&&mode==='mine'); const placed=decorAt(slot); node.classList.toggle('filled',!!placed); node.innerHTML=''; node.title=slotLabel(slot)+(placed?' · '+(itemMeta(placed.item_id).name||placed.item_id):''); if(placed){ const meta=itemMeta(placed.item_id); const item=document.createElement('div'); item.className='oc64-item item-'+meta.category; item.style.transform='translateX(-50%)';item.dataset.rotation=String(ROTATIONS.includes(Number(placed.rotation))?Number(placed.rotation):0); item.innerHTML=`<span class="oc64-item-emoji">${itemArt(meta)}</span><small>${esc(meta.name)}</small>`; node.append(item); }
   else{ const ghost=document.createElement('span'); ghost.className='oc64-slot-ghost'; ghost.textContent='+'; node.append(ghost); }
  });
 }
 function renderPanel(){
  const panel=$('deskStudioPanel'); panel.replaceChildren();
  const tab=($('deskStudioDialog').dataset.tab)||'scene';
  if(loading){ panel.append(panelMsg('กำลังโหลดข้อมูล...')); return; }
  if(!state){ panel.append(panelMsg('ยังไม่มีข้อมูลโต๊ะ')); return; }
  if(tab==='scene'){
   const box=document.createElement('div'); box.className='oc64-panel-box';
   const current=selectedItem?itemMeta(selectedItem).name:'ยังไม่ได้เลือกไอเทม';
   box.innerHTML=`<h3>Scene control</h3><p class="oc64-hint">ไอเทมที่เลือก: <strong>${esc(current)}</strong></p><p class="oc64-hint">slot ที่เลือก: <strong>${slotLabel(selectedSlot)}</strong></p>`;
   if(mode==='mine'){
    const guide=document.createElement('div'); guide.className='oc64-guide'; guide.innerHTML='<ol><li>ไปที่แท็บ Inventory</li><li>กด “เลือกวาง” บนไอเทมที่ต้องการ</li><li>กลับมาคลิก slot ในฉาก</li><li>กดหมุนได้จากเมนูด้านบน</li></ol>';
    box.append(guide);
    const placed=decorAt(selectedSlot);
    if(placed){ const meta=itemMeta(placed.item_id); const tools=document.createElement('div'); tools.className='oc64-inline-actions'; const rot=document.createElement('button'); rot.type='button'; rot.textContent='หมุน +90°'; rot.onclick=()=>place(placed.item_id,selectedSlot,((Number(placed.rotation)||0)+90)%360); const remove=document.createElement('button'); remove.type='button'; remove.textContent='เก็บกลับคลัง'; remove.onclick=()=>place(placed.item_id,0,0); tools.append(rot,remove); box.append(panelMsg('ตอนนี้ที่ '+slotLabel(selectedSlot)+' มี '+meta.name,'oc64-hint'),tools); }
   } else box.append(panelMsg('โหมดเข้าชม: ดูการจัดโต๊ะของเพื่อนได้อย่างเดียว','oc64-hint'));
   panel.append(box);
   return;
  }
  if(tab==='inventory'){
   const own=[...ownedSet()];
   const wrap=document.createElement('div'); wrap.className='oc64-list';
   wrap.append(panelMsg(mode==='mine'?'คลังไอเทมของคุณ':'เจ้าของโต๊ะรายนี้ไม่ได้เปิดคลังไอเทม','oc64-hint'));
   if(mode!=='mine'){ panel.append(wrap); return; }
   if(!own.length){ wrap.append(panelMsg('ยังไม่มีไอเทม ลองซื้อจาก Shop ก่อน')); panel.append(wrap); return; }
   own.forEach(id=>{ const meta=itemMeta(id), card=document.createElement('article'); card.className='oc64-item-card'; const placed=(state.decor||[]).find(x=>x.item_id===id); card.innerHTML=`<div class="oc64-item-main"><span class="oc64-badge">${itemArt(meta)}</span><div><strong>${esc(meta.name)}</strong><p>${esc(meta.desc||'')}</p><small>${placed?'กำลังวางอยู่ที่ '+slotLabel(placed.slot):'อยู่ในคลัง'}</small></div></div>`; const actions=document.createElement('div'); actions.className='oc64-inline-actions'; const select=document.createElement('button'); select.type='button'; select.textContent='เลือกวาง'; select.onclick=()=>{ selectedItem=id; $('deskStudioDialog').dataset.tab='scene'; document.querySelectorAll('#deskStudioDialog [data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab==='scene'))); render();}; actions.append(select); if(placed){ const move=document.createElement('button'); move.type='button'; move.textContent='เก็บกลับคลัง'; move.onclick=()=>place(id,0,0); actions.append(move); } card.append(actions); wrap.append(card); }); panel.append(wrap); return;
  }
  if(tab==='shop'){
   const wrap=document.createElement('div'); wrap.className='oc64-list';
   const owned=ownedSet();
   wrap.append(panelMsg(mode==='mine'?'ร้านค้า · อุปกรณ์สำนักงาน + ของน่ารัก':'โหมดเข้าชมไม่สามารถซื้อของได้','oc64-hint'));
   catalogList().forEach(item=>{ const card=document.createElement('article'); card.className='oc64-item-card'; const status=owned.has(item.id)?'ซื้อแล้ว':(!item.available?'รออัปเดต SQL catalog':'ยังไม่ซื้อ'); card.innerHTML=`<div class="oc64-item-main"><span class="oc64-badge">${itemArt(item)}</span><div><strong>${esc(item.name)}</strong><p>${esc(item.desc)}</p><small>${status}</small></div><div class="oc64-price">${item.price} coin</div></div>`; const actions=document.createElement('div'); actions.className='oc64-inline-actions'; const buyBtn=document.createElement('button'); buyBtn.type='button'; buyBtn.textContent=owned.has(item.id)?'มีแล้ว':(item.available?'ซื้อ':'ต้องติดตั้ง SQL'); buyBtn.disabled=mode!=='mine'||owned.has(item.id)||!item.available||acting; if(item.available&&!owned.has(item.id)) buyBtn.onclick=()=>buy(item.id); actions.append(buyBtn); card.append(actions); wrap.append(card); }); panel.append(wrap); return;
  }
  if(tab==='ledger'){
   const box=document.createElement('div'); box.className='oc64-list';
   if(mode!=='mine'){ box.append(panelMsg('โหมดเข้าชมไม่แสดงรายการธุรกรรม')); panel.append(box); return; }
   box.append(panelMsg('ประวัติ Coin จาก Quest และการซื้อสินค้า · ดูความคืบหน้าที่ Quest Center','oc64-hint'));
   const list=Array.isArray(state.ledger)?state.ledger:[]; if(!list.length) box.append(panelMsg('ยังไม่มีประวัติ coin')); else list.forEach(row=>{ const card=document.createElement('article'); card.className='oc64-item-card'; const date=row.created_at?new Date(row.created_at):null; card.innerHTML=`<div class="oc64-item-main"><span class="oc64-badge">${Number(row.delta)>=0?'🪙':'🧾'}</span><div><strong>${esc(row.reference)}</strong><p>${Number(row.delta)>=0?'+':''}${Number(row.delta)||0} coin</p><small>${date&&!Number.isNaN(date.valueOf())?date.toLocaleString('th-TH',{dateStyle:'medium',timeStyle:'short'}):''}</small></div></div>`; box.append(card); });
   panel.append(box); return;
  }
 }
 function render(){
  build();
  $('deskStudioCoins').textContent=state&&mode==='mine'?String(Number(state.coins)||0):'—';
  $('deskStudioOwner').textContent=mode==='mine'?'โต๊ะของฉัน':('โต๊ะของ '+(state?.nickname||ownerName||'เพื่อนร่วมงาน'));
  $('deskStudioClose').disabled=acting||loading;$('deskStudioRefresh').disabled=acting||loading;const stats=mode==='mine' ? `ของสะสม ${Array.isArray(state?.owned)?state.owned.length:0} ชิ้น · จัดวาง ${(state?.decor||[]).length||0}/6 slot` : `เข้าชมโต๊ะ ${state?.desk_id||deskId||''}`;
  $('deskStudioStats').textContent=loading?'กำลังอัปเดต...':stats;
  $('deskStudioSubtitle').textContent=mode==='mine'?'แต่งโต๊ะด้วยของน่ารักและอุปกรณ์สำนักงาน':'เข้าชมมุมโต๊ะของเพื่อน';
  $('deskStudioHelp').textContent=mode==='mine' ? (selectedItem?`กำลังถือไอเทม: ${itemMeta(selectedItem).name} · คลิก slot ที่ต้องการวาง`:'เลือกไอเทมจาก Inventory แล้วคลิก slot เพื่อวาง') : 'โหมดเข้าชม: ดูฉากกึ่ง 3 มิติและของตกแต่งของเพื่อน';
  $('deskStudioRotation').value=String(selectedRotation);
  document.querySelectorAll('#deskStudioDialog [data-tab]').forEach(b=>{ if(mode!=='mine' && ['inventory','shop','ledger'].includes(b.dataset.tab)){ b.disabled=false; } });
  renderSceneSlots(); renderPanel();
 }
 function handleSlot(slot){ selectedSlot=slot; if(mode!=='mine'||acting||loading){render();return;} if(selectedItem){ void place(selectedItem,slot,selectedRotation); } else render(); }
 function handlePanelClick(e){ const btn=e.target.closest('button'); if(!btn) return; }
 function openMine(){build();if(loading||acting)return;selectedItem=''; selectedSlot=1; selectedRotation=0; $('deskStudioDialog')?.setAttribute('data-tab','scene'); document.querySelectorAll('#deskStudioDialog [data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab==='scene'))); void refreshMine(true); }
 function openVisit(desk,name){build();if(loading||acting)return;selectedItem=''; selectedSlot=1; selectedRotation=0; $('deskStudioDialog')?.setAttribute('data-tab','scene'); document.querySelectorAll('#deskStudioDialog [data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x.dataset.tab==='scene'))); void refreshVisit(desk,name,true); }
 function init(){build();render();}
 document.addEventListener('DOMContentLoaded',init); setTimeout(init,120);
 return {openMine,openVisit,refreshMine,refreshVisit,addDeskButton,addProfileButton,lost};
})();
