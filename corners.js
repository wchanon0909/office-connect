/* V6.3.2: presentation only. Existing actions retain their handlers. */
'use strict';
(()=>{
 const $=id=>document.getElementById(id),button=$('mapToggle'),tools=$('mapTools'),view=$('cameraControls'),viewport=$('viewport');
 function setExpanded(open){tools.hidden=!open;button.setAttribute('aria-expanded',String(open));if(!open){view.hidden=true;$('viewSettings').setAttribute('aria-expanded','false');}}
 button.addEventListener('click',()=>setExpanded(tools.hidden));
 // Measure real dock sizes after responsive wrapping so profiles and chat never overlap their launch buttons.
 let pending=false;
 function measure(){pending=false;const v=viewport.getBoundingClientRect(),personal=$('personalCorner').getBoundingClientRect(),comms=$('communicationCorner').getBoundingClientRect();const admin=document.body.classList.contains('admin-mode');const root=document.documentElement.style;root.setProperty('--oc632-personal-space',Math.max(0,admin?0:v.bottom-personal.top)+'px');root.setProperty('--oc632-chat-top',Math.max(v.top+12,comms.height?comms.bottom+8:v.top+12)+'px');root.setProperty('--oc632-viewport-bottom',Math.max(0,innerHeight-v.bottom)+'px');}
 function schedule(){if(!pending){pending=true;requestAnimationFrame(measure);}}
 if(window.ResizeObserver){const observer=new ResizeObserver(schedule);for(const id of ['viewport','personalCorner','communicationCorner'])observer.observe($(id));}
 window.addEventListener('resize',schedule);document.addEventListener('fullscreenchange',schedule);new MutationObserver(schedule).observe(document.body,{attributes:true,attributeFilter:['class']});
 setExpanded(false);schedule();
})();
