/* GAMA Module Loader — contextual Excel import */
(function(){
  'use strict';
  const PURCHASES='gama-purchases-v14.js?v=20260827-5';
  const EXCEL='gama-excel-import.js?v=4';
  const DELIVERY='gama-delivery-module.js?v=1';
  let started=false;
  const $=s=>document.querySelector(s);
  function loadScript(src){return new Promise(function(resolve,reject){const base=src.split('?')[0];const existing=document.querySelector('script[data-gama-module="'+base+'"],script[src*="'+base+'"]');if(existing){if(base.includes('gama-purchases-v14')&&window.gamaShowPurchases)return resolve();if(base.includes('gama-excel-import')&&window.GamaExcelImport)return resolve();if(base.includes('gama-delivery-module')&&window.GamaOpenDelivery)return resolve();if(existing.dataset.gamaLoaded==='1')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return;}const s=document.createElement('script');s.src=src;s.dataset.gamaModule=base;s.onload=function(){s.dataset.gamaLoaded='1';resolve()};s.onerror=reject;document.head.appendChild(s);});}
  function openPurchases(){const run=function(){if(window.gamaShowPurchases){window.gamaShowPurchases();return true}return false};if(run())return;loadScript(PURCHASES).then(run).catch(function(e){console.error('[GAMA] Achats',e);alert('Le module Achats n’a pas pu être chargé.')});}
  function openDelivery(){const run=function(){if(window.GamaOpenDelivery){window.GamaOpenDelivery();return true}return false};if(run())return;loadScript(DELIVERY).then(run).catch(function(e){console.error('[GAMA] Livraison',e);alert('Le module Livraison n’a pas pu être chargé.')});}
  function revealPurchaseCards(){document.querySelectorAll('[data-gama-purchases-v16]').forEach(function(card){card.classList.remove('aclHidden');card.removeAttribute('hidden');card.style.display='flex'});document.querySelectorAll('[data-gama-purchases-v16-tab]').forEach(function(tab){tab.classList.remove('aclHidden');tab.removeAttribute('hidden')})}
  function installPurchases(){
    const oldHost=document.querySelector('#mainmenu .appGrid'),newHost=document.querySelector('#mainmenu .gamaF2Grid');
    if(oldHost&&!oldHost.querySelector('[data-gama-purchases-v16]')){const c=document.createElement('button');c.type='button';c.className='appTile';c.dataset.gamaPurchasesV16='1';c.setAttribute('aria-label','Ouvrir le module Achats');c.innerHTML='<span class="appIcon orange">🛒</span><b>Achats</b><small>Commandes fournisseurs</small>';c.onclick=openPurchases;oldHost.insertBefore(c,oldHost.firstElementChild||null)}
    if(newHost&&!newHost.querySelector('[data-gama-purchases-v16]')){const c=document.createElement('button');c.type='button';c.className='gamaF2Card';c.dataset.gamaPurchasesV16='1';c.setAttribute('aria-label','Ouvrir le module Achats');c.innerHTML='<span class="gamaF2Icon" style="background:#fff0e5!important;color:#f47a2a!important">🛒</span><span class="gamaF2Title">Achats</span>';c.onclick=openPurchases;newHost.insertBefore(c,newHost.firstElementChild||null)}
    const tabs=document.querySelector('.tabs');if(tabs&&!tabs.querySelector('[data-gama-purchases-v16-tab]')){const t=document.createElement('button');t.type='button';t.className='tab';t.dataset.gamaPurchasesV16Tab='1';t.innerHTML='🛒<span>Achats</span>';t.onclick=openPurchases;tabs.appendChild(t)}revealPurchaseCards();
  }
  function mountExcel(){if(!window.GamaExcelImport)return;try{window.GamaExcelImport.render()}catch(e){console.warn('[GAMA] Excel render',e)}}
  function openExcel(){mountExcel();document.querySelectorAll('section').forEach(function(s){s.classList.remove('active');s.style.display='none'});const sec=document.getElementById('excelImport');if(sec){sec.style.display='block';sec.classList.add('active')}document.getElementById('mainmenu')?.setAttribute('hidden','');window.scrollTo({top:0,behavior:'smooth'})}
  function chooseExcelType(type){setTimeout(function(){const b=document.querySelector('[data-gxi-type="'+type+'"]');if(b)b.click()},80)}
  function openContextExcel(type){openExcel();chooseExcelType(type)}
  function sectionFor(type){
    const wanted={products:['productos','productos'],clients:['clientes'],suppliers:['proveedores','fournisseurs']}[type]||[];
    const sections=[...document.querySelectorAll('section')];
    return sections.find(s=>{const id=(s.id||'').toLowerCase();const text=(s.querySelector('h1,h2,h3,h4')?.textContent||'').toLowerCase();return wanted.some(w=>id.includes(w)||text.includes(w))})||null;
  }
  function installContextImport(type,label){
    const s=sectionFor(type);if(!s||s.querySelector('[data-gama-context-excel="'+type+'"]'))return;
    const box=document.createElement('div');box.dataset.gamaContextExcel=type;box.style.cssText='display:flex;align-items:center;justify-content:space-between;gap:10px;margin:0 0 12px;padding:11px 13px;border:1px solid #e2e8ec;border-radius:12px;background:#fff7f1';
    box.innerHTML='<div><b>Importar '+label+' desde Excel</b><small style="display:block;color:#71808a;margin-top:3px">Carga masiva desde .xlsx / .xls</small></div><button type="button" style="background:#087c8b;color:#fff;padding:9px 12px">📊 Importar</button>';
    box.querySelector('button').onclick=function(){openContextExcel(type)};
    s.insertBefore(box,s.firstElementChild||null);
  }
  function removeStandaloneExcelTile(){document.querySelectorAll('[data-gama-excel-import-tile],#gama-excel-import-tile').forEach(function(e){e.remove()});document.querySelectorAll('#mainmenu .appGrid button,#mainmenu .gamaF2Grid button').forEach(function(b){if(/importar excel/i.test(b.textContent||''))b.remove()})}
  function installContextImports(){installContextImport('products','Productos');installContextImport('clients','Clientes');installContextImport('suppliers','Proveedores');removeStandaloneExcelTile()}
  async function boot(){if(started)return;started=true;try{await loadScript(EXCEL)}catch(e){console.warn('[GAMA] Excel',e)}try{await loadScript(PURCHASES)}catch(e){console.warn('[GAMA] Achats',e)}try{await loadScript(DELIVERY)}catch(e){console.warn('[GAMA] Livraison',e)}mountExcel();installPurchases();installContextImports();if(window.GamaDeliveryRender)window.GamaDeliveryRender();let tries=0;const timer=setInterval(function(){mountExcel();installPurchases();installContextImports();if(window.GamaDeliveryRender)window.GamaDeliveryRender();if(++tries>60)clearInterval(timer)},250);new MutationObserver(function(){installPurchases();installContextImports()}).observe(document.body,{subtree:true,childList:true})}
  window.GamaOpenExcelImport=openExcel;window.GamaOpenPurchases=openPurchases;window.GamaOpenDelivery=openDelivery;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
