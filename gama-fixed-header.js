/* GAMA — Header + account layout matching the mobile reference */
(function(){
  'use strict';

  function getHeader(){return document.querySelector('header.gamaHeader');}

  function removeDuplicateSessionBar(){document.getElementById('gamaSessionBar')?.remove();}

  function ensureAccountSlot(){
    var header=getHeader();
    if(!header) return null;
    var slot=document.getElementById('gamaAccountSlot');
    if(!slot){slot=document.createElement('div');slot.id='gamaAccountSlot';}
    if(slot.parentElement!==header.parentElement || slot.previousElementSibling!==header){header.parentNode.insertBefore(slot,header.nextSibling);}
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
      var el=nodes[i],text=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(/comptas\s+cloud|cuentas\s+cloud|compte\s+cloud/.test(text)) return el;
    }
    return null;
  }

  function moveCloud(){
    var header=getHeader();
    if(!header) return;
    var cloud=findCloudButton();
    if(!cloud || cloud===header) return;
    var actions=header.querySelector('.headActions');
    if(!actions) return;
    cloud.id='gamaCloudAdminBtn';
    if(cloud.parentElement!==actions) actions.appendChild(cloud);
  }

  function inject(){
    document.getElementById('gamaFixedHeaderStyle')?.remove();
    var s=document.createElement('style');s.id='gamaFixedHeaderStyle';
    s.textContent=`
      header.gamaHeader{position:sticky!important;top:0!important;z-index:5000!important;isolation:isolate!important;box-sizing:border-box!important;background:#fff!important;box-shadow:0 1px 0 #e2e8ec!important}
      header.gamaHeader .headIcon.plus{display:none!important}
      #gamaAccountSlot{position:sticky!important;top:112px!important;width:100%!important;box-sizing:border-box!important;z-index:4999!important;margin:0!important;padding:0 14px!important;display:flex!important;align-items:center!important;background:#fff!important;box-shadow:0 1px 0 #e2e8ec!important}
      #gamaAccountSlot #gamaAccessUser,#gamaAccountSlot #gamaACLUser{position:relative!important;inset:auto!important;transform:none!important;z-index:5000!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;width:100%!important;max-width:none!important;min-width:0!important;height:52px!important;margin:10px 0 12px!important;padding:7px 13px!important;box-sizing:border-box!important;overflow:hidden!important;white-space:nowrap!important;border:1px solid #dfe7eb!important;border-radius:14px!important;background:#f7f9fa!important;box-shadow:none!important;font-size:15px!important;gap:10px!important}
      #gamaAccountSlot #gamaAccessUser b,#gamaAccountSlot #gamaACLUser b{font-size:15px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      #gamaAccountSlot #gamaAccessUser button,#gamaAccountSlot #gamaACLUser button{position:relative!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;flex:0 0 auto!important;white-space:nowrap!important;margin-left:auto!important;min-height:36px!important;padding:7px 14px!important;border-radius:999px!important;transition:background-color .12s ease!important}
      header.gamaHeader .headActions{position:relative!important;display:flex!important;align-items:center!important}
      header.gamaHeader #gamaCloudAdminBtn{position:relative!important;right:auto!important;top:auto!important;transform:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:40px!important;height:40px!important;padding:8px 14px!important;border-radius:10px!important;background:#fff!important;color:#173246!important;border:1px solid #e2e8ec!important;font-size:13px!important;font-weight:750!important;white-space:nowrap!important;box-shadow:none!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;transition:border-color .12s ease,background-color .12s ease!important}
      header.gamaHeader #gamaCloudAdminBtn:hover{background:#eaf6f7!important;border-color:#d8eef0!important}
      header.gamaHeader .headActions .headIcon{display:none!important}
      @media(min-width:701px){
        header.gamaHeader{min-height:88px!important;height:88px!important;padding:12px 20px!important}
        header.gamaHeader .brandMobile img{width:40px!important;height:40px!important}
        #gamaAccountSlot{top:88px!important;padding:0 20px!important}
        #gamaAccountSlot #gamaAccessUser,#gamaAccountSlot #gamaACLUser{height:50px!important;margin:9px 0 12px!important}
      }
      @media(max-width:700px){
        header.gamaHeader{min-height:96px!important;height:96px!important;padding:12px 12px!important;align-items:center!important}
        header.gamaHeader .headerLeft{width:100%!important;min-width:0!important}
        header.gamaHeader .brandMobile{gap:8px!important;min-width:0!important}
        header.gamaHeader .brandMobile img{width:38px!important;height:38px!important;flex:0 0 38px!important}
        header.gamaHeader .brandMobile h1{font-size:16px!important;white-space:nowrap!important}
        header.gamaHeader .brandMobile small{font-size:10px!important;white-space:nowrap!important}
        header.gamaHeader .headActions{position:absolute!important;right:12px!important;top:14px!important;z-index:6000!important}
        header.gamaHeader .headActions .headIcon{display:none!important}
        header.gamaHeader #gamaCloudAdminBtn{display:inline-flex!important;max-width:44vw!important;min-height:40px!important;height:40px!important;padding:8px 11px!important;font-size:12px!important;overflow:hidden!important;text-overflow:ellipsis!important}
        #gamaAccountSlot{top:96px!important;padding:0 12px!important}
        #gamaAccountSlot #gamaAccessUser,#gamaAccountSlot #gamaACLUser{height:56px!important;margin:10px 0 12px!important;padding:7px 12px!important;border-radius:13px!important;font-size:14px!important;gap:9px!important}
        #gamaAccountSlot #gamaAccessUser b,#gamaAccountSlot #gamaACLUser b{font-size:15px!important}
        #gamaAccountSlot #gamaAccessUser button,#gamaAccountSlot #gamaACLUser button{min-height:38px!important;height:38px!important;padding:7px 14px!important;font-size:13px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function measure(){
    var header=getHeader();
    if(!header) return;
    var slot=document.getElementById('gamaAccountSlot');
    var h=header.getBoundingClientRect().height;
    if(slot && slot.offsetParent!==null) h+=slot.getBoundingClientRect().height;
    if(h>0) document.documentElement.style.setProperty('--gama-header-h',Math.round(h)+'px');
  }

  function run(){inject();moveAccount();moveCloud();measure();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  new MutationObserver(function(){moveAccount();moveCloud();measure();}).observe(document.body,{subtree:true,childList:true});
  window.addEventListener('resize',measure);
  [100,300,700,1200,2500,5000].forEach(function(ms){setTimeout(run,ms)});
})();
