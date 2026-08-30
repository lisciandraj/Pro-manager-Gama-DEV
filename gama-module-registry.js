/* GAMA DEV — registre V8: injection réelle du workflow client */
(()=>{
'use strict';
const MODULES=[
{id:'client-request',label:'Demande client',description:'Catalogue et envoi des demandes',roles:['client','cliente'],staffRoles:['admin','administrador','commercial','comercial']},
{id:'client-request-admin',label:'Solicitudes de clientes',description:'Demandes reçues et facturation',roles:['admin','administrador','commercial','comercial'],staffRoles:['admin','administrador','commercial','comercial']}
];
const role=()=>{try{const s=JSON.parse(localStorage.getItem('gama_session_v1')||'null');return String(s?.role||s?.user?.role||'').toLowerCase()}catch(e){return ''}};
const staff=()=>{const r=role();if(['admin','administrador','commercial','comercial'].includes(r))return true;const t=(document.body?.innerText||'').toLowerCase();return t.includes('administrador')||t.includes('administrateur')||t.includes('commercial')};
window.GamaModuleRegistry={modules:MODULES,visible:()=>staff()?MODULES:MODULES.filter(m=>m.roles.includes(role())),install:()=>true};
function inject(){
 if(document.getElementById('gamaClientWorkflowV7'))return true;
 const s=document.createElement('script');s.id='gamaClientWorkflowV7';s.src=location.origin+'/Pro-manager-Gama-DEV/gama-client-workflow-v6.js?v=8-'+Date.now();
 s.onerror=()=>{const n=document.getElementById('gamaV8Error');if(n)n.textContent='Le module client DEV n’a pas pu être chargé.'};
 document.body.appendChild(s);return true;
}
function fallback(){
 const main=document.getElementById('mainmenu');if(!main||document.getElementById('gamaV8ModuleGrid'))return;
 const box=document.createElement('div');box.id='gamaV8ModuleGrid';box.style.cssText='display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:18px 0 24px;padding:0 12px';
 const make=(id,title,desc,icon,fn)=>{const b=document.createElement('button');b.type='button';b.id=id;b.style.cssText='position:relative;min-height:150px;border:1px solid #E2E8EC;border-radius:18px;background:#fff;color:#173246;box-shadow:0 3px 14px #18324a12;font-weight:800;font-size:16px;padding:18px 10px;cursor:pointer';b.innerHTML='<div style="font-size:34px;margin-bottom:9px">'+icon+'</div><div>'+title+'</div><small style="display:block;color:#71808A;font-size:11px;margin-top:7px">'+desc+'</small><span style="position:absolute;right:9px;top:9px;background:#087C8B;color:#fff;border-radius:999px;padding:4px 8px;font-size:9px">NUEVO</span>';b.onclick=fn;box.appendChild(b)};
 make('gamaV8ClientTile','Demande client','Choisir des produits et envoyer une demande','🛍️',()=>window.gamaOpenClientRequest?window.gamaOpenClientRequest():alert('Le module est en cours de chargement.'));
 if(staff())make('gamaV8RequestsTile','Solicitudes de clientes','Valider les demandes et générer une facture','📥',()=>window.gamaOpenClientRequests?window.gamaOpenClientRequests():alert('Le module est en cours de chargement.'));
 main.appendChild(box);
}
function start(){fallback();inject();setTimeout(fallback,500);setTimeout(fallback,1500);setTimeout(fallback,3000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
