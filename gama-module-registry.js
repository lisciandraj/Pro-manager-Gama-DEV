/* GAMA DEV — registre stable des modules client + dédoublonnage du menu */
(()=>{
'use strict';
const MODULES=[
{id:'client-catalog',label:'Catálogo de clientes',description:'Produits disponibles pour les clients',roles:['client','cliente'],staffRoles:['admin','administrador','commercial','comercial']},
{id:'client-requests',label:'Solicitudes de clientes',description:'Demandes reçues et suivi',roles:['admin','administrador','commercial','comercial'],staffRoles:['admin','administrador','commercial','comercial']}
];
const role=()=>{try{const s=JSON.parse(localStorage.getItem('gama_session_v1')||'null');return String(s?.role||s?.user?.role||'').toLowerCase()}catch(e){return ''}};
const staff=()=>['admin','administrador','commercial','comercial'].includes(role());
window.GamaModuleRegistry={modules:MODULES,visible:()=>staff()?MODULES:MODULES.filter(m=>m.roles.includes(role())),install:()=>true};
function dedupeMenu(){const host=document.getElementById('mainmenu');if(!host)return;const grid=host.querySelector('.gamaF2Grid,.appGrid');if(!grid)return;const seen=new Set();[...grid.children].forEach(card=>{const key=String(card.dataset?.gamaMenuId||card.dataset?.gamaModule||card.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(!key)return;if(seen.has(key))card.remove();else seen.add(key)});}
function load(){if(!document.getElementById('gamaClientModulesLoader')){const s=document.createElement('script');s.id='gamaClientModulesLoader';s.src=location.origin+'/Pro-manager-Gama-DEV/gama-client-modules.js?v=20260830-3';s.onerror=()=>console.warn('[GAMA DEV] Module client indisponible');document.body.appendChild(s)}dedupeMenu();let n=0;const t=setInterval(()=>{dedupeMenu();if(++n>60)clearInterval(t)},250);if(!window.gamaDevMenuObserver){window.gamaDevMenuObserver=new MutationObserver(()=>dedupeMenu());window.gamaDevMenuObserver.observe(document.body,{childList:true,subtree:true})}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
