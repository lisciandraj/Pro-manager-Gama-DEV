/* GAMA DEV — compatibility bridge for access control -> cloud catalogue / customer requests */
(function(){'use strict';
let loading=false;
const ICONS={
  catalog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 5.5h2l1.7 9.2a1.8 1.8 0 0 0 1.8 1.5h7.8a1.8 1.8 0 0 0 1.7-1.3L20.2 9H7"/><path d="M9 20a1.2 1.2 0 1 0 0-2.4A1.2 1.2 0 0 0 9 20Zm8.2 0a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z"/><path d="M10 9.5v3m3-3v3m3-3v3"/></svg>',
  requests:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3.5" width="12" height="17" rx="1.8"/><path d="M9 3.5h6v2H9zM9 9h6M9 12.5h6M9 16h4"/></svg>'
};
function load(src,done){const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>done&&done();s.onerror=()=>console.warn('[GAMA] Cannot load '+src);document.head.appendChild(s)}
function role(){try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')?.role||''}catch(e){return ''}}
function canManage(){return ['admin','commercial'].includes(role())}
function getGrids(){return [...document.querySelectorAll('#mainmenu .gamaF2Grid,#mainmenu .appGrid,#mainmenu .gamaCleanGrid')].filter(Boolean)}
function addMenuCard(grid,id,icon,title,action){
  if(document.getElementById(id))return;
  const card=document.createElement('button');
  card.type='button';card.id=id;
  if(grid.classList.contains('gamaCleanGrid')){
    card.className='gamaCleanCard';
    card.innerHTML='<span class="gamaCleanIcon" aria-hidden="true">'+icon+'</span><span class="gamaCleanTitle"></span>';
    card.querySelector('.gamaCleanTitle').textContent=title;
  }else{
    card.className=grid.classList.contains('appGrid')?'appTile':'gamaF2Card';
    if(grid.classList.contains('appGrid')){
      card.innerHTML='<span class="appIcon teal">'+icon+'</span><b>'+title+'</b><small>Acceso directo</small>';
    }else{
      card.innerHTML='<span class="gamaF2Icon">'+icon+'</span><span class="gamaF2Title">'+title+'</span>';
    }
  }
  card.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();action(e)},{passive:false});
  grid.appendChild(card);
}
function openCatalog(){
  const b=document.getElementById('clientCatalogTab');
  if(b){b.click();return true}
  if(window.GamaInstallClientRequests)window.GamaInstallClientRequests();
  setTimeout(()=>document.getElementById('clientCatalogTab')?.click(),250);return true;
}
function installMenuShortcut(){
  const client=role()==='client',manage=canManage();
  if(!client&&!manage)return;
  getGrids().forEach(grid=>{
    if(client)addMenuCard(grid,'gamaClientCatalogMenuCard',ICONS.catalog,'Catálogo de productos',openCatalog);
    if(manage)addMenuCard(grid,'gamaCustomerRequestsMenuCard',ICONS.requests,'Solicitudes de clientes',open);
  });
}
function install(){
  if(role()==='client'){
    const b=document.getElementById('clientCatalogTab');
    if(b){b.classList.remove('aclHidden');b.style.display='';}
  }else if(canManage()){
    const b=document.getElementById('customerRequestsTab');
    if(b){b.classList.remove('aclHidden');b.style.display='';}
  }
  installMenuShortcut();
}
function open(){const id=role()==='client'?'clientCatalogTab':'customerRequestsTab';const b=document.getElementById(id);if(b){b.click();return true}install();setTimeout(()=>document.getElementById(id)?.click(),250);return true}
window.GamaInstallClientRequests=install;
window.GamaOpenClientRequests=open;
function boot(){
  if(loading)return;loading=true;
  let pending=2,done=()=>{pending--;if(pending<=0){loading=false;install();setTimeout(install,300);setTimeout(install,1000)}};
  if(!document.querySelector('script[src*="gama-customer-requests.js"]'))load('gama-customer-requests.js?v=20260831-4',done);else done();
  if(!document.querySelector('script[src*="gama-client-catalog.js"]'))load('gama-client-catalog.js?v=20260901-6',done);else done();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('gama:client-authenticated',()=>setTimeout(install,150));
new MutationObserver(()=>install()).observe(document.body,{subtree:true,childList:true});
})();
