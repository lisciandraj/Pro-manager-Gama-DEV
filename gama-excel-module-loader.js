/* GAMA Module Loader — Excel + Achats + Livraison V18 */
(function(){
  'use strict';
  const PURCHASES='gama-purchases-v14.js?v=20260827-5';
  const EXCEL='gama-excel-import.js?v=5';
  const DELIVERY='gama-delivery-module.js?v=1';
  let started=false;

  function loadScript(src){
    return new Promise(function(resolve,reject){
      const base=src.split('?')[0];
      const existing=document.querySelector('script[data-gama-module="'+base+'"],script[src*="'+base+'"]');
      if(existing){
        if(base.includes('gama-purchases-v14')&&window.gamaShowPurchases)return resolve();
        if(base.includes('gama-excel-import')&&window.GamaExcelImport)return resolve();
        if(base.includes('gama-delivery-module')&&window.GamaOpenDelivery)return resolve();
        if(existing.dataset.gamaLoaded==='1')return resolve();
        existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return;
      }
      const s=document.createElement('script');s.src=src;s.dataset.gamaModule=base;
      s.onload=function(){s.dataset.gamaLoaded='1';resolve()};s.onerror=reject;document.head.appendChild(s);
    });
  }

  function openPurchases(){
    const run=function(){if(window.gamaShowPurchases){window.gamaShowPurchases();return true}return false};
    if(run())return;loadScript(PURCHASES).then(run).catch(function(e){console.error('[GAMA] Achats load error',e);alert('Le module Achats n’a pas pu être chargé. Rechargez la page.')});
  }
  function openDelivery(){
    const run=function(){if(window.GamaOpenDelivery){window.GamaOpenDelivery();return true}return false};
    if(run())return;loadScript(DELIVERY).then(run).catch(function(e){console.error('[GAMA] Livraison load error',e);alert('Le module Livraison n’a pas pu être chargé. Rechargez la page.')});
  }
  function revealPurchaseCards(){
    document.querySelectorAll('[data-gama-purchases-v16]').forEach(function(card){card.classList.remove('aclHidden');card.removeAttribute('hidden');card.style.display='flex'});
    document.querySelectorAll('[data-gama-purchases-v16-tab]').forEach(function(tab){tab.classList.remove('aclHidden');tab.removeAttribute('hidden')});
  }
  function installPurchases(){
    const oldHost=document.querySelector('#mainmenu .appGrid'),newHost=document.querySelector('#mainmenu .gamaF2Grid');
    if(oldHost){let card=oldHost.querySelector('[data-gama-purchases-v16]');if(!card){card=document.createElement('button');card.type='button';card.className='appTile';card.dataset.gamaPurchasesV16='1';card.setAttribute('aria-label','Ouvrir le module Achats');card.innerHTML='<span class="appIcon orange">🛒</span><b>Achats</b><small>Commandes fournisseurs</small>';card.onclick=openPurchases;oldHost.insertBefore(card,oldHost.firstElementChild||null)}}
    if(newHost){let card=newHost.querySelector('[data-gama-purchases-v16]');if(!card){card=document.createElement('button');card.type='button';card.className='gamaF2Card';card.dataset.gamaPurchasesV16='1';card.setAttribute('aria-label','Ouvrir le module Achats');card.innerHTML='<span class="gamaF2Icon" style="background:#fff0e5!important;color:#f47a2a!important">🛒</span><span class="gamaF2Title">Achats</span>';card.onclick=openPurchases;newHost.insertBefore(card,newHost.firstElementChild||null)}}
    const tabs=document.querySelector('.tabs');if(tabs&&!tabs.querySelector('[data-gama-purchases-v16-tab]')){const tab=document.createElement('button');tab.type='button';tab.className='tab';tab.dataset.gamaPurchasesV16Tab='1';tab.innerHTML='🛒<span>Achats</span>';tab.onclick=openPurchases;tabs.appendChild(tab)}
    revealPurchaseCards();return !!(oldHost||newHost);
  }

  function ensureExcelStyle(){
    if(document.getElementById('gamaExcelLoaderStyle'))return;
    const s=document.createElement('style');s.id='gamaExcelLoaderStyle';
    s.textContent='[data-gama-excel-import-tile].gamaDisabledModule{display:flex!important;visibility:visible!important;opacity:1!important} [data-gama-excel-import-tile]{cursor:pointer}';
    document.head.appendChild(s);
  }
  function excelHost(){return document.querySelector('#mainmenu .gamaF2Grid')||document.querySelector('#mainmenu .appGrid')}
  function installExcelTile(){
    ensureExcelStyle();
    const host=excelHost();if(!host)return false;
    let card=host.querySelector('[data-gama-excel-import-tile]');
    if(!card){
      card=document.createElement('button');card.type='button';card.dataset.gamaExcelImportTile='1';
      card.className=host.matches('.gamaF2Grid')?'gamaF2Card':'appTile';
      card.setAttribute('aria-label','Importar Excel');
      if(host.matches('.gamaF2Grid'))card.innerHTML='<span class="gamaF2Icon" style="background:#fff0e5!important;color:#f47a2a!important">📊</span><span class="gamaF2Title">Importar Excel</span>';
      else card.innerHTML='<span class="appIcon orange">📊</span><b>Importar Excel</b><small>Productos, clientes y proveedores</small>';
      card.onclick=openExcel;
      host.appendChild(card);
    }
    card.classList.remove('aclHidden');card.removeAttribute('hidden');card.removeAttribute('aria-hidden');card.style.display='flex';
    return true;
  }

  function mountExcel(){
    if(!window.GamaExcelImport)return false;
    try{window.GamaExcelImport.render();return true}catch(e){console.warn('[GAMA] Excel render',e);return false}
  }
  function openExcel(){
    mountExcel();
    document.querySelectorAll('section').forEach(function(s){s.classList.remove('active');s.style.display='none'});
    const sec=document.getElementById('excelImport');
    if(sec){sec.style.display='block';sec.classList.add('active')}
    document.getElementById('mainmenu')?.setAttribute('hidden','');
    window.scrollTo({top:0,behavior:'smooth'});
  }

  async function boot(){
    if(started)return;started=true;
    try{await loadScript(EXCEL)}catch(e){console.warn('[GAMA] Excel load',e)}
    try{await loadScript(PURCHASES)}catch(e){console.warn('[GAMA] Achats preload',e)}
    try{await loadScript(DELIVERY)}catch(e){console.warn('[GAMA] Livraison preload',e)}
    mountExcel();installPurchases();installExcelTile();if(window.GamaDeliveryRender)window.GamaDeliveryRender();
    let tries=0;const timer=setInterval(function(){mountExcel();installPurchases();installExcelTile();if(window.GamaDeliveryRender)window.GamaDeliveryRender();if(++tries>40)clearInterval(timer)},250);
    new MutationObserver(function(){installPurchases();installExcelTile()}).observe(document.body,{subtree:true,childList:true});
  }
  window.GamaOpenExcelImport=openExcel;window.GamaOpenPurchases=openPurchases;window.GamaOpenDelivery=openDelivery;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
