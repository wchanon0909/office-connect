/* V6.3.2: presentation only. Existing actions retain their handlers. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),button=$('mapToggle'),tools=$('mapTools'),view=$('cameraControls'),viewport=$('viewport');
 function setExpanded(open){tools.hidden=!open;button.setAttribute('aria-expanded',String(open));if(!open){view.hidden=true;$('viewSettings').setAttribute('aria-expanded','false');}}
 button.addEventListener('click',()=>setExpanded(tools.hidden));
 // Measure real dock sizes after responsive wrapping so profiles and chat never overlap their launch buttons.
 let pending=false;
 function measure(){pending=false;const v=viewport.getBoundingClientRect(),personal=$('personalCorner').getBoundingClientRect(),comms=$('communicationCorner').getBoundingClientRect();const admin=document.body.classList.contains('admin-mode');const root=document.documentElement.style;root.setProperty('--oc632-personal-space',Math.max(0,admin?0:v.bottom-personal.top)+'px');root.setProperty('--oc632-chat-top',Math.max(v.top+12,comms.height?comms.bottom+8:v.top+12)+'px');root.setProperty('--oc632-viewport-bottom',Math.max(0,innerHeight-v.bottom)+'px');
 // Use the existing HUD measurement pass: align with the bottom corners when there is room.
 const map=button.getBoundingClientRect(),mid=v.left+v.width/2,gap=8;
 const left=map.width?map.right:v.left,right=personal.width?personal.left:v.right;
 const room=Math.floor(2*Math.min(mid-left-gap,right-mid-gap));
 const inline=room>=280;
 root.setProperty('--oc100-chat-bottom',inline?'var(--oc632-gap)':(Math.max(0,personal.height?v.bottom-personal.top:0,map.height?v.bottom-map.top:0)+gap)+'px');
 root.setProperty('--oc100-chat-width',Math.max(0,Math.min(430,inline?room:v.width-16))+'px');
 }
 function schedule(){if(!pending){pending=true;requestAnimationFrame(measure);}}
 if(window.ResizeObserver){const observer=new ResizeObserver(schedule);for(const id of ['viewport','personalCorner','communicationCorner','mapToggle'])observer.observe($(id));}
 window.addEventListener('resize',schedule);document.addEventListener('fullscreenchange',schedule);new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class','data-oc100-auth']});
 setExpanded(false);schedule();
})();
