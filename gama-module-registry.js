/* GAMA DEV — registre stable des modules client */
(()=>{
'use strict';
const MODULES=[
{id:'client-catalog',label:'Catálogo de clientes',description:'Produits disponibles pour les clients',roles:['client','cliente'],staffRoles:['admin','administrador','commercial','comercial']},
{id:'client-requests',label:'Solicitudes de clientes',description:'Demandes reçues et suivi',roles:['admin','administrador','commercial','comercial'],staffRoles:['admin','administrador','commercial','comercial']}
];
const role=()=>{try{const s=JSON.parse(localStorage.getItem('gama_session_v1')||'null');return String(s?.role||s?.user?.role||'').toLowerCase()}catch(e){return ''}};
const staff=()=>['admin','administrador','commercial','comercial'].includes(role());
window.GamaModuleRegistry={modules:MODULES,visible:()=>staff()?MODULES:MODULES.filter(m=>m.roles.includes(role())),install:()=>true};
function load(){if(document.getElementById('gamaClientModulesLoader'))return;const s=document.createElement('script');s.id='gamaClientModulesLoader';s.src=location.origin+'/Pro-manager-Gama-DEV/gama-client-modules.js?v=20260830-2';s.onerror=()=>console.warn('[GAMA DEV] Module client indisponible');document.body.appendChild(s)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
