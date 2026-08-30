/* GAMA DEV V10.1 — registre des modules clients */
(()=>{
'use strict';
const MODULES=[
{id:'client-catalog',label:'Catálogo de clientes',description:'Produits disponibles pour les clients',roles:['client','cliente'],staffRoles:['admin','administrador','commercial','comercial']},
{id:'client-requests',label:'Solicitudes de clientes',description:'Demandes reçues et suivi',roles:['admin','administrador','commercial','comercial'],staffRoles:['admin','administrador','commercial','comercial']}
];
const role=()=>{try{const s=JSON.parse(localStorage.getItem('gama_session_v1')||'null');return String(s?.role||s?.user?.role||'').toLowerCase()}catch{return ''}};
const staff=()=>['admin','administrador','commercial','comercial'].includes(role());
window.GamaModuleRegistry={modules:MODULES,visible:()=>staff()?MODULES:MODULES.filter(m=>m.roles.includes(role())),install:()=>true};
function load(){if(document.getElementById('gamaDevTilesLoader'))document.getElementById('gamaDevTilesLoader').remove();const s=document.createElement('script');s.id='gamaDevTilesLoader';s.src=location.origin+'/Pro-manager-Gama-DEV/gama-dev-tiles.js?v=20260831-0020';s.onload=()=>console.info('[GAMA DEV] V10.1 client tiles loaded');s.onerror=()=>console.warn('[GAMA DEV] V10.1 client tiles unavailable');document.body.appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();