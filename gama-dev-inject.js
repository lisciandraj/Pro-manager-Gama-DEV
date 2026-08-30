(function(){
  'use strict';
  const TILES=[
    {id:'dev-client-catalog-tile',title:'Catalogue client',desc:'Produits disponibles à la vente',icon:'🛍️',tone:'orange'},
    {id:'dev-client-requests-tile',title:'Demandes clients',desc:'Demandes de commande reçues',icon:'📥',tone:'teal'}
  ];
  function addStyle(){
    if(document.getElementById('gamaDevNativeTileStyle')) return;
    const s=document.createElement('style'); s.id='gamaDevNativeTileStyle';
    s.textContent='.gamaDevNativeTile{position:relative!important;min-height:138px!important;background:#fff!important;border:1px solid #E2E8EC!important;border-radius:14px!important;padding:18px 12px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:7px!important;color:#18324A!important;box-shadow:0 3px 14px rgba(24,50,74,.07)!important;cursor:pointer!important}.gamaDevNativeIcon{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;font-size:32px}.gamaDevNativeTile.orange .gamaDevNativeIcon{background:#FFF0E7}.gamaDevNativeTile.teal .gamaDevNativeIcon{background:#E8F5F6}.gamaDevNativeBadge{position:absolute;right:10px;top:10px;padding:5px 9px;border-radius:999px;color:#fff;font-size:9px;font-weight:900}.gamaDevNativeTile.orange .gamaDevNativeBadge{background:#F47A2A}.gamaDevNativeTile.teal .gamaDevNativeBadge{background:#2E8790}.gamaDevNativeTitle{font-size:15px;font-weight:900;text-align:center}.gamaDevNativeDesc{font-size:10px;color:#71808A;text-align:center}@media(max-width:700px){.gamaDevNativeTile{min-height:125px!important;padding:12px 6px!important}.gamaDevNativeIcon{width:52px;height:52px;border-radius:15px;font-size:27px}.gamaDevNativeTitle{font-size:12px}.gamaDevNativeDesc{font-size:9px}}';
    document.head.appendChild(s);
  }
  function moduleNotice(title){
    let box=document.getElementById('gamaDevModuleNotice');
    if(!box){box=document.createElement('div');box.id='gamaDevModuleNotice';box.style.cssText='position:fixed;inset:0;z-index:100000;background:rgba(15,35,50,.45);display:flex;align-items:center;justify-content:center;padding:20px';box.innerHTML='<div style="max-width:460px;width:100%;background:#fff;border-radius:20px;padding:24px;box-shadow:0 15px 50px #0004"><div id="gamaDevNoticeTitle" style="font-size:20px;font-weight:900;color:#18324A;margin-bottom:8px"></div><div style="color:#71808A;font-size:13px">Module DEV sélectionné. Le raccordement fonctionnel du catalogue et des demandes sera effectué dans cette interface.</div><button type="button" style="margin-top:18px;background:#087C8B;color:#fff;border:0;border-radius:10px;padding:10px 16px;font-weight:800" onclick="document.getElementById(\'gamaDevModuleNotice\').remove()">Fermer</button></div>';document.body.appendChild(box)}
    box.style.display='flex'; document.getElementById('gamaDevNoticeTitle').textContent=title;
  }
  function build(t){
    const b=document.createElement('button'); b.type='button'; b.id=t.id; b.className='gamaDevNativeTile '+t.tone;
    b.innerHTML='<span class="gamaDevNativeIcon">'+t.icon+'</span><span class="gamaDevNativeBadge">NOUVEAU</span><span class="gamaDevNativeTitle">'+t.title+'</span><span class="gamaDevNativeDesc">'+t.desc+'</span>';
    b.addEventListener('click',function(){moduleNotice(t.title);});
    return b;
  }
  function install(){
    const grid=document.querySelector('.moreGrid');
    if(!grid) return false;
    addStyle();
    TILES.forEach(function(t){if(!document.getElementById(t.id)) grid.appendChild(build(t));});
    let status=document.getElementById('gamaDevNativeStatus');
    if(!status){status=document.createElement('div');status.id='gamaDevNativeStatus';status.style.cssText='position:fixed;right:10px;top:48px;z-index:99998;background:#E7F6F0;color:#138A69;border:1px solid #BFE5D5;border-radius:999px;padding:5px 9px;font:800 10px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';document.body.appendChild(status)}
    const ok=TILES.every(t=>document.getElementById(t.id)); status.textContent=ok?'✓ 2/2 tuiles DEV affichées':'⚠ Tuiles DEV en attente'; return ok;
  }
  function boot(){if(install())return;const obs=new MutationObserver(function(){if(install())obs.disconnect();});obs.observe(document.body,{subtree:true,childList:true});setTimeout(function(){obs.disconnect();},30000);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();