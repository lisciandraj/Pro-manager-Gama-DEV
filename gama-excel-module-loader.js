/* GAMA Module Loader — Excel + Achats + Settings V31 */
(function(){
  'use strict';
  const PURCHASES='gama-purchases-v14.js?v=20260827-5';
  const EXCEL='gama-excel-import.js?v=9';
  const EXCEL_FALLBACK='gama-excel-standalone.js?v=1';
  const SETTINGS='gama-settings-standalone.js?v=1';
  let started=false, excelLoading=null;

  function loadScript(src){
    return new Promise(function(resolve,reject){
      const base=src.split('?')[0];
      const existing=document.querySelector('script[data-gama-module="'+base+'"],script[src*="'+base+'"]');
      if(existing){
        if(base.includes('gama-purchases-v14')&&window.gamaShowPurchases)return resolve();
        if(base.includes('gama-excel-import')&&window.GamaExcelImport)return resolve();
        if(base.includes('gama-settings-standalone')&&window.GamaEnsureSettings)return resolve();
        if(existing.dataset.gamaLoaded==='1')return resolve();
        existing.addEventListener('load',resolve,{once:true});
        existing.addEventListener('error',reject,{once:true});
        return;
      }
      const s=document.createElement('script');
      s.src=src;s.dataset.gamaModule=base;
      s.onload=function(){s.dataset.gamaLoaded='1';resolve()};
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  function openPurchases(){
    const run=function(){if(window.gamaShowPurchases){window.gamaShowPurchases();return true}return false};
    if(run())return;
    loadScript(PURCHASES).then(run).catch(function(e){console.error('[GAMA] Achats load error',e);alert('Le module Achats n’a pas pu être chargé. Rechargez la page.')});
  }

  function getExcelContent(){return document.getElementById('excelImport')}

  function renderExcel(){
    if(window.GamaExcelImport&&typeof window.GamaExcelImport.render==='function'){
      window.GamaExcelImport.render();
      return getExcelContent();
    }
    return getExcelContent();
  }

  function ensureExcel(){
    if(window.GamaExcelImport){renderExcel();return Promise.resolve(getExcelContent())}
    if(excelLoading)return excelLoading;
    excelLoading=loadScript(EXCEL).then(function(){
      if(window.GamaExcelImport)return renderExcel();
      throw new Error('GamaExcelImport indisponible');
    }).catch(function(err){
      console.warn('[GAMA] Excel principal indisponible, utilisation du fallback',err);
      return loadScript(EXCEL_FALLBACK).then(function(){
        if(window.GamaExcelImport)return renderExcel();
        throw new Error('Module Excel indisponible');
      });
    });
    return excelLoading;
  }

  function openExcelModule(){
    ensureExcel().then(function(){
      const content=renderExcel();
      if(!content){throw new Error('Module Import Excel indisponible')}
      let sec=document.getElementById('gama-excel-import-section');
      if(!sec){
        sec=document.createElement('section');
        sec.id='gama-excel-import-section';
        (document.querySelector('.wrap')||document.body).appendChild(sec);
      }
      if(content.parentElement!==sec)sec.appendChild(content);
      document.querySelectorAll('section').forEach(function(s){
        s.classList.remove('active');
        s.style.display='none';
        s.removeAttribute('hidden');
      });
      sec.classList.add('active');
      sec.style.display='block';
      sec.removeAttribute('hidden');
      document.getElementById('mainmenu')?.setAttribute('hidden','');
      window.scrollTo({top:0,behavior:'smooth'});
    }).catch(function(e){
      console.error('[GAMA] Excel open error',e);
      alert('Le module Import Excel n’a pas pu être chargé. Rechargez la page.');
    });
  }

  function cleanDeliveryTiles(){
    document.querySelectorAll('#mainmenu .gamaF2Card,#mainmenu .appTile,[data-gama-tms-tile]').forEach(function(el){
      const t=(el.textContent||'').toLowerCase();
      if(t.includes('tms')||t.includes('entregas')||t.includes('livraisons'))el.remove();
    });
  }

  function excelVisualStyle(){
    if(document.getElementById('gamaExcelMenuVisualStyle'))return;
    const s=document.createElement('style');s.id='gamaExcelMenuVisualStyle';
    s.textContent='.gamaExcelMenuTitle{font-size:0!important}.gamaExcelMenuTitle::after{content:"Importar Excel";font-size:17px;line-height:1.25;font-weight:850}';
    document.head.appendChild(s);
  }

  function ensureExcelMenuCard(){
    const host=document.querySelector('#mainmenu .gamaF2Grid');
    if(!host)return;
    let role='';
    try{role=JSON.parse(localStorage.getItem('gama_session_v1')||'null')?.role||''}catch(_){ }
    if(!['admin','commercial'].includes(role))return;
    excelVisualStyle();
    let b=host.querySelector('[data-gama-module="excel-import"]');
    if(!b){
      b=document.createElement('button');b.type='button';b.className='gamaF2Card';b.dataset.gamaModule='excel-import';
      b.setAttribute('aria-label','Ouvrir le module Importar Excel');
      b.innerHTML='<span class="gamaF2Icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 12l6 6M15 12l-6 6"/></svg></span><span class="gamaF2Title gamaExcelMenuTitle">Excel</span>';
      b.onclick=openExcelModule;host.appendChild(b);return;
    }
    b.classList.remove('gamaDisabledModule');b.removeAttribute('aria-hidden');b.removeAttribute('tabindex');
    const title=b.querySelector('.gamaF2Title');if(title){title.classList.add('gamaExcelMenuTitle');title.textContent='Excel'}
    b.onclick=openExcelModule;
  }

  function boot(){
    if(started)return;started=true;
    window.GamaOpenExcelImport=openExcelModule;
    window.GamaOpenPurchases=openPurchases;
    ensureExcel().catch(function(e){console.warn('[GAMA] Excel preload',e)});
    loadScript(PURCHASES).catch(function(){});
    if(!window.GamaEnsureSettings)loadScript(SETTINGS).then(function(){window.GamaEnsureSettings?.()}).catch(function(){});
    let tries=0;
    const timer=setInterval(function(){
      cleanDeliveryTiles();ensureExcelMenuCard();window.GamaEnsureSettings?.();
      if(++tries>40)clearInterval(timer);
    },250);
  }

  window.GamaOpenExcelImport=openExcelModule;
  window.GamaOpenPurchases=openPurchases;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
