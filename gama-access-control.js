/* GAMA — Access control v3: one source of truth + safe dynamic modules */
(function(){
  'use strict';
  if(window.GamaAccessControl)return;
  const ROLE_LABEL={admin:'Administrador',commercial:'Comercial',magasinier:'Almacenero',client:'Cliente'};
  const PERMISSIONS={admin:'*',commercial:new Set(['dashboard','products','clients','movement','billing','stock','suppliers','gamaPurchasesV14','reports','barcode','client-catalog','customer-requests']),magasinier:new Set(['dashboard','products','movement','stock','barcode']),client:new Set(['client-catalog'])};
  const session=()=>{try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')}catch(_){return null}};
  const can=id=>{const s=session(),p=PERMISSIONS[s?.role];return !!s&&(p==='*'||p?.has(id));};
  const esc=v=>String(v??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  function style(){
    if(document.getElementById('gamaAccessStyle'))return;
    const s=document.createElement('style');s.id='gamaAccessStyle';
    s.textContent=`
      .gamaAccessUser{position:relative;background:#fff;border:1px solid #e2e8ec;border-radius:999px;padding:7px 10px 7px 13px;font-size:13px;box-shadow:0 6px 22px #18324a20;display:flex;align-items:center;gap:7px;max-width:100%;box-sizing:border-box;white-space:nowrap}
      .gamaAccessUser b{color:#18324a;font-weight:850;overflow:hidden;text-overflow:ellipsis}
      .gamaAccessRole{font-weight:850;color:#087c8b}
      .gamaAccessUser button{border:0;border-radius:999px;background:#eef3f4;color:#18324a;padding:7px 11px;font-weight:800;cursor:pointer;flex:0 0 auto;touch-action:manipulation}
      .gamaAccessUser button:hover{background:#e5eef0}
      .gamaAccessUser button:disabled{opacity:.65;cursor:wait}
    `;document.head.appendChild(s);
  }
  function userBar(){
    style();
    let el=document.getElementById('gamaAccessUser'),s=session();
    if(!s){el?.remove();return;}
    if(!el){el=document.createElement('div');el.id='gamaAccessUser';el.className='gamaAccessUser';
      const slot=document.getElementById('gamaAccountSlot');
      (slot||document.body).appendChild(el);
    }
    el.innerHTML='👤 <b>'+esc(s.name||s.username||'Utilisateur')+'</b><span>·</span><span class="gamaAccessRole">'+esc(ROLE_LABEL[s.role]||s.role)+'</span><button type="button" id="gamaAccessLogout">Salir</button>';
    el.querySelector('#gamaAccessLogout').onclick=async()=>{const b=el.querySelector('button');b.disabled=true;b.textContent='…';try{await window.GamaCloud?.signOut()}catch(e){console.warn('[GAMA] signOut',e)}localStorage.removeItem('gama_session_v1');sessionStorage.removeItem('gama_session_v1');location.reload();};
  }
  function protectShowTab(){
    const current=window.showTab;
    if(typeof current!=='function'||current.__gamaAccess)return;
    const wrapped=function(id,el){
      if(id==='mainmenu')return current.apply(this,arguments);
      if(!can(id)){console.warn('[GAMA] Access denied:',id);return false;}
      if(id==='client-catalog'){
        current.apply(this,arguments);
        window.GamaOpenClientCatalog?.();
        return true;
      }
      if(id==='customer-requests'){
        current.apply(this,arguments);
        window.GamaOpenCustomerRequests?.();
        return true;
      }
      if(id==='excel-import'){
        window.GamaOpenExcelImport?.();
        return true;
      }
      return current.apply(this,arguments);
    };
    wrapped.__gamaAccess=true;window.showTab=wrapped;
  }
  function sync(){userBar();window.GamaMenu?.render();if(session()?.role==='client')document.querySelectorAll('.tabs .tab').forEach(b=>{if(b.id!=='clientCatalogTab')b.style.display='none';});}
  function init(){window.GamaAccessControl={can,session,sync};style();protectShowTab();sync();window.addEventListener('gama:auth-ready',sync);window.addEventListener('gama:auth-change',()=>setTimeout(sync,0));window.addEventListener('gama:menu-ready',protectShowTab);window.addEventListener('gama:data-ready',()=>{protectShowTab();sync();});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
