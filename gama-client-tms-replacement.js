/* GAMA DEV — replace TMS tiles with client tiles */
(()=>{
'use strict';
const run=()=>{
  const grid=document.querySelector('#mainmenu .gamaF2Grid');
  if(!grid)return false;
  [...grid.querySelectorAll('.gamaF2Card')].filter(b=>{
    const id=b.dataset.gamaMenuId||'';
    const text=(b.textContent||'').trim();
    return id==='gamaTMS'||/Entregas\s*\/\s*TMS/i.test(text);
  }).forEach(b=>b.remove());
  const make=(id,title,desc,svg,fn)=>{
    let b=document.getElementById(id);
    if(b)return b;
    b=document.createElement('button');b.id=id;b.type='button';b.className='gamaF2Card';
    b.innerHTML='<span class="gamaF2Icon"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">'+svg+'</svg></span><span class="gamaF2Title">'+title+'</span>';
    b.title=desc;b.onclick=fn;return b;
  };
  const cat=make('gamaClientCatalogTile','Catalogue client','Produits disponibles à la vente','<path d="M6 8h12l1 13H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2"/>',()=>window.gamaClientOpen?window.gamaClientOpen('catalog'):window.gamaClientModules?.open?.('catalog'));
  const req=make('gamaClientRequestsTile','Demandes clients','Demandes de commande reçues','<path d="M4 5h16v14H4z"/><path d="m4 12 4 4h8l4-4M12 5v7m0 0-2-2m2 2 2-2"/>',()=>window.gamaClientOpen?window.gamaClientOpen('requests'):window.gamaClientModules?.open?.('requests'));
  const existing=[...grid.children];
  if(!grid.contains(cat))grid.appendChild(cat);
  if(!grid.contains(req))grid.appendChild(req);
  return true;
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{if(run())return;const o=new MutationObserver(()=>{if(run())o.disconnect()});o.observe(document.body,{childList:true,subtree:true});setTimeout(()=>o.disconnect(),30000)},{once:true});
else{if(run())return;const o=new MutationObserver(()=>{if(run())o.disconnect()});o.observe(document.body,{childList:true,subtree:true});setTimeout(()=>o.disconnect(),30000)}
})();
