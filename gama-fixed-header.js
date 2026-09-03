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
      header.gamaHeader{position:relative!important;top:auto!important;z-index:5000!important;isolation:isolate!important;box-sizing:border-box!important;background:#fff!important}
      header.gamaHeader .headIcon.plus{display:none!important}
      #gamaAccountSlot{position:relative!important;width:100%!important;box-sizing:border-box!important;z-index:4999!important;margin:0!important;padding:0 14px!important;display:flex!important;align-items:center!important}
      #gamaAccountSlot #gamaAccessUser,#gamaAccountSlot #gamaACLUser{position:relative!important;inset:auto!important;transform:none!important;z-index:5000!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;width:100%!important;max-width:none!important;min-width:0!important;height:52px!important;margin:10px 0 12px!important;padding:7px 13px!important;box-sizing:border-box!important;overflow:hidden!important;white-space:nowrap!important;border:1px solid #dfe7eb!important;border-radius:18px!important;background:#fff!important;box-shadow:0 3px 12px #18324a0c!important;font-size:15px!important;gap:10px!important}
      #gamaAccountSlot #gamaAccessUser b,#gamaAccountSlot #gamaACLUser b{font-size:15px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      #gamaAccountSlot #gamaAccessUser button,#gamaAccountSlot #gamaACLUser button{position:relative!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important;flex:0 0 auto!important;white-space:nowrap!important;margin-left:auto!important;min-height:36px!important;padding:7px 14px!important;border-radius:999px!important}
      header.gamaHeader .headActions{position:relative!important;display:flex!important;align-items:center!important}
      header.gamaHeader #gamaCloudAdminBtn{position:relative!important;right:auto!important;top:auto!important;transform:none!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;min-height:44px!important;height:44px!important;padding:8px 13px!important;border-radius:13px!important;background:#087c8b!important;color:#fff!important;font-size:13px!important;font-weight:800!important;white-space:nowrap!important;box-shadow:none!important;pointer-events:auto!important;touch-action:manipulation!important;cursor:pointer!important}
      header.gamaHeader .headActions .headIcon{display:none!important}
      @media(min-width:701px){
        header.gamaHeader{min-height:106px!important;height:106px!important;padding:14px 18px!important}
        header.gamaHeader .brandMobile img{width:58px!important;height:58px!important}
        #gamaAccountSlot{padding:0 18px!important}
        #gamaAccountSlot #gamaAccessUser,#gamaAccountSlot #gamaACLUser{height:54px!important;margin:10px 0 14px!important}
      }
      @media(max-width:700px){
        header.gamaHeader{min-height:112px!important;height:112px!important;padding:14px 12px!important;align-items:center!important}
        header.gamaHeader .headerLeft{width:100%!important;min-width:0!important}
        header.gamaHeader .brandMobile{gap:8px!important;min-width:0!important}
        header.gamaHeader .brandMobile img{width:50px!important;height:50px!important;flex:0 0 50px!important}
        header.gamaHeader .brandMobile h1{font-size:16px!important;white-space:nowrap!important}
        header.gamaHeader .brandMobile small{font-size:10px!important;white-space:nowrap!important}
        header.gamaHeader .headActions{position:absolute!important;right:12px!important;top:14px!important;z-index:6000!important}
        header.gamaHeader .headActions .headIcon{display:none!important}
        header.gamaHeader #gamaCloudAdminBtn{display:inline-flex!important;max-width:44vw!important;min-height:44px!important;height:44px!important;padding:8px 11px!important;font-size:12px!important;overflow:hidden!important;text-overflow:ellipsis!important}
        #gamaAccountSlot{padding:0 12px!important}
        #gamaAccountSlot #gamaAccessUser,#gamaAccountSlot #gamaACLUser{height:58px!important;margin:12px 0 14px!important;padding:7px 12px!important;border-radius:17px!important;font-size:14px!important;gap:9px!important}
        #gamaAccountSlot #gamaAccessUser b,#gamaAccountSlot #gamaACLUser b{font-size:15px!important}
        #gamaAccountSlot #gamaAccessUser button,#gamaAccountSlot #gamaACLUser button{min-height:38px!important;height:38px!important;padding:7px 14px!important;font-size:13px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function run(){inject();moveAccount();moveCloud();}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run,{once:true}); else run();
  new MutationObserver(function(){moveAccount();moveCloud();}).observe(document.body,{subtree:true,childList:true});
  [100,300,700,1200,2500,5000].forEach(function(ms){setTimeout(run,ms)});
})();
