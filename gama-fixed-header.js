/* GAMA — Stable header/account placement */
(function(){
  'use strict';

  function getHeader(){
    return document.querySelector('header.gamaHeader');
  }

  function removeDuplicateSessionBar(){
    document.getElementById('gamaSessionBar')?.remove();
  }

  function ensureAccountSlot(){
    var header=getHeader();
    if(!header) return null;
    var slot=document.getElementById('gamaAccountSlot');
    if(!slot){
      slot=document.createElement('div');
      slot.id='gamaAccountSlot';
    }
    if(slot.parentElement!==header.parentElement || slot.previousElementSibling!==header){
      header.parentNode.insertBefore(slot,header.nextSibling);
    }
    return slot;
  }

  function moveAccount(){
    removeDuplicateSessionBar();
    var slot=ensureAccountSlot();
    if(!slot) return;
    var user=document.getElementById('gamaAccessUser')||document.getElementById('gamaACLUser');
    if(user && user.parentElement!==slot) slot.appendChild(user);
  }

  function findCloudButton(){
    var direct=document.getElementById('gamaCloudAdminBtn');
    if(direct) return direct;
    var nodes=document.querySelectorAll('button,a,[role="button"]');
    for(var i=0;i<nodes.length;i++){
      var el=nodes[i];
      var text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(/comptes\s+cloud|compte\s+cloud/.test(text)) return el;
    }
    return null;
  }

  function moveCloud(){
    var header=getHeader();
    if(!header) return;
    var cloud=findCloudButton();
    if(!cloud || cloud===header || cloud.contains(header) || header.contains(cloud)===false) return;
    cloud.id='gamaCloudAdminBtn';
    var actions=header.querySelector('.headActions');
    if(actions && cloud.parentElement!==actions) actions.appendChild(cloud);
  }

  function inject(){
    var old=document.getElementById('gamaFixedHeaderStyle');
    if(old) old.remove();
    var s=document.createElement('style');
    s.id='gamaFixedHeaderStyle';
    s.textContent=`
header.gamaHeader{position:relative!important;z-index:5000!important;isolation:isolate!important}
header.gamaHeader .headIcon.plus{display:none!important}
#gamaAccountSlot{position:relative!important;width:100%!important;box-sizing:border-box!important;z-index:4999!important;margin:0!important;padding:0 14px!important;display:flex!important;justify-content:flex-start!important;align-items:center!important;min-height:0!important}
#gamaAccountSlot #gamaAccessUser,#gamaAccountSlot #gamaACLUser{position:relative!important;left:auto!important;right:auto!important;top:auto!important;bottom:auto!important;transform:none!important;z-index:5000!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;width:auto!important;max-width:100%!important;min-width:0!important;margin:8px 0!important;padding:7px 10px 7px 13px!important;box-sizing:border-box!important;overflow:visible!important;white-space:nowrap!important;font-size:13px!important}
#gamaAccountSlot #gamaAccessUser button,#gamaAccountSlot #gamaACLUser button{position:relative!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;flex:0 0 auto!important;white-space:nowrap!important;margin-left:6px!important}
#gamaCloudAdminBtn{pointer-events:auto!important;touch-action:manipulation!important}
@media(max-width:700px){
#gamaAccountSlot{padding:0 8px!important}
#gamaAccountSlot #gamaAccessUser,#gamaAccountSlot #gamaACLUser{width:100%!important;max-width:none!important;margin:7px 0!important;height:43px!important;padding:6px 8px 6px 10px!important;font-size:11px!important;border-radius:999px!important;overflow:visible!important}
#gamaAccountSlot #gamaAccessUser button,#gamaAccountSlot #gamaACLUser button{min-height:31px!important;height:31px!important;padding:6px 9px!important;margin-left:5px!important;font-size:11px!important}
}
`;
    document.head.appendChild(s);
  }

  function run(){
    inject();
    moveAccount();
    moveCloud();
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true});
  else run();

  new MutationObserver(function(){
    moveAccount();
    moveCloud();
  }).observe(document.body,{subtree:true,childList:true});
  [100,300,700,1200,2500,5000].forEach(function(ms){setTimeout(run,ms)});
})();
