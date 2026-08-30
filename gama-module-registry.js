/* GAMA DEV — registre modulaire centralisé V5
   Le workflow client V5 gère désormais directement les tuiles et les droits.
   Ce registre reste compatible pour les modules externes sans créer de doublons. */
(()=>{
'use strict';
const MODULES=[
{id:'client-request',label:'Demande client',description:'Choisir des produits et envoyer une demande',roles:['client','cliente'],staffRoles:['admin','administrador','commercial'],script:'gama-client-workflow-v5.js'},
{id:'client-request-admin',label:'Solicitudes de clientes',description:'Demandes reçues et génération de factures',roles:['admin','administrador','commercial'],staffRoles:['admin','administrador','commercial'],script:'gama-client-workflow-v5.js'}
];
const session=()=>{try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')}catch(e){return null}};
const role=()=>String(session()?.role||'').toLowerCase();
const isStaff=()=>['admin','administrador','commercial'].includes(role());
const visible=()=>isStaff()?MODULES.filter(m=>m.staffRoles.includes(role())):MODULES.filter(m=>m.roles.includes(role()));
window.GamaModuleRegistry={
 modules:MODULES,
 visible,
 install:()=>true,
 register:m=>{if(m&&!MODULES.some(x=>x.id===m.id))MODULES.push(m)}
};
})();
