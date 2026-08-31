/* GAMA V11 - Spanish access role labels + TMS + client modules */
(function(){
'use strict';
const MAP={'Magasinier':'Almacenero','Commercial':'Comercial'};
function translate(root=document.body){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nodes=[];let n;while(n=walker.nextNode())nodes.push(n);
 nodes.forEach(x=>{let v=x.nodeValue;Object.keys(MAP).forEach(k=>{v=v.split(k).join(MAP[k])});if(v!==x.nodeValue)x.nodeValue=v});
}
function loadScript(id,src,done){
 if(document.getElementById(id)){done&&done();return;}
 const s=document.createElement('script');s.id=id;s.src=src;s.async=false;
 s.onload=()=>done&&done();s.onerror=()=>console.warn('[GAMA] No se pudo cargar '+src);
 document.body.appendChild(s);
}
function loadTMS(){
 if(document.getElementById('gamaTMSModuleLoader'))return;
 const s=document.createElement('script');s.id='gamaTMSModuleLoader';s.src='gama-tms-module.js?v=20260828-1';s.onload=()=>addTMSCard();s.onerror=()=>console.warn('[GAMA TMS] No se pudo cargar el módulo TMS');document.body.appendChild(s);
}
function addTMSCard(){
 const host=document.getElementById('mainmenu');const grid=host?.querySelector('.gamaF2Grid');
 if(!grid||!window.gamaTMS?.open)return false;
 if(grid.querySelector('[data-gama-tms-card]'))return true;
 const b=document.createElement('button');b.type='button';b.className='gamaF2Card';b.setAttribute('data-gama-tms-card','1');
 b.innerHTML='<span class="gamaF2Icon" style="background:#e8f5f6;color:#087c8b"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg></span><span class="gamaF2Title">Entregas / TMS</span>';
 b.onclick=()=>window.gamaTMS.open('planning');grid.appendChild(b);return true;
}
function cardByTitle(title){
 const grid=document.querySelector('#mainmenu .gamaF2Grid');if(!grid)return null;
 return [...grid.querySelectorAll('button')].find(b=>b.textContent.replace(/\s+/g,' ').trim().toLowerCase().includes(title.toLowerCase()))||null;
}
function openTabWhenReady(tabId){
 const b=document.getElementById(tabId);if(b){b.click();return true}return false;
}
function wireClientTiles(){
 const catalog=cardByTitle('Catálogo de productos');
 if(catalog&&!catalog.dataset.gamaClientWire){catalog.dataset.gamaClientWire='1';catalog.onclick=()=>{loadScript('gamaClientCatalogLoader','gama-client-catalog.js?v=20260901-1',()=>setTimeout(()=>openTabWhenReady('clientCatalogTab'),100));};}
 const requests=cardByTitle('Solicitudes de clientes');
 if(requests&&!requests.dataset.gamaClientWire){requests.dataset.gamaClientWire='1';requests.onclick=()=>{loadScript('gamaCustomerRequestsLoader','gama-customer-requests.js?v=20260901-1',()=>setTimeout(()=>openTabWhenReady('customerRequestsTab'),100));};}
}
function boot(){
 translate();loadTMS();addTMSCard();wireClientTiles();
 const observer=new MutationObserver(()=>{translate();addTMSCard();wireClientTiles()});
 observer.observe(document.body,{subtree:true,childList:true,characterData:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();