/* GAMA DEV — compatibility bridge for access control -> cloud catalogue / customer requests */
(function(){'use strict';
let loading=false;
function load(src,done){const s=document.createElement('script');s.src=src;s.async=false;s.onload=()=>done&&done();s.onerror=()=>console.warn('[GAMA] Cannot load '+src);document.head.appendChild(s)}
function role(){try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')?.role||''}catch(e){return ''}}
function install(){
  if(role()==='client'){
    const b=document.getElementById('clientCatalogTab');
    if(b){b.classList.remove('aclHidden');b.style.display='';}
  }else{
    const b=document.getElementById('customerRequestsTab');
    if(b){b.classList.remove('aclHidden');b.style.display='';}
  }
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

