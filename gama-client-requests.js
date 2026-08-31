/* GAMA DEV — compatibility bridge for access control -> cloud catalogue / customer requests */
(function(){'use strict';
let loading=false;
function load(src,done){const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>done&&done();s.onerror=()=>console.warn('[GAMA] Cannot load '+src);document.head.appendChild(s)}
function role(){try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')?.role||''}catch(e){return ''}}
function canManage(){return ['admin','commercial'].includes(role())}
function addMenuCard(grid,id,icon,title,action){
  if(document.getElementById(id))return;
  const card=document.createElement('button');
  card.type='button';card.id=id;card.className='gamaF2Card';
  card.innerHTML='<span class=gamaF2Icon>'+icon+'</span><span class=gamaF2Title>'+title+'</span>';
  card.onclick=action;grid.appendChild(card);
}
function openCatalog(){
  const b=document.getElementById('clientCatalogTab');
  if(b){b.click();return true}
  install();setTimeout(()=>document.getElementById('clientCatalogTab')?.click(),150);return true;
}
function installMenuShortcut(){
  const client=role()==='client',manage=canManage();
  if(!client&&!manage)return;
  const grid=document.querySelector('#mainmenu .gamaF2Grid');
  if(!grid)return;
  addMenuCard(grid,'gamaClientCatalogMenuCard','🛒','Catálogo de productos',openCatalog);
  if(manage)addMenuCard(grid,'gamaCustomerRequestsMenuCard','📋','Solicitudes de clientes',open);
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
function open(){const id=role()==='client'?'clientCatalogTab':'customerRequestsTab';const b=document.getElementById(id);if(b){b.click();return true}install();setTimeout(()=>document.getElementById(id)?.click(),150);return true}
window.GamaInstallClientRequests=install;
window.GamaOpenClientRequests=open;
function boot(){
  if(loading)return;loading=true;
  let pending=2,done=()=>{pending--;if(pending<=0){loading=false;install();setTimeout(install,300);setTimeout(install,1000)}};
  if(!document.querySelector('script[src*="gama-customer-requests.js"]'))load('gama-customer-requests.js?v=20260831-3',done);else done();
  if(!document.querySelector('script[src*="gama-client-catalog.js"]'))load('gama-client-catalog.js?v=20260831-5',done);else done();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
window.addEventListener('gama:client-authenticated',()=>setTimeout(install,150));
})();







