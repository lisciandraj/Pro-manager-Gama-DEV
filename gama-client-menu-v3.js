/* GAMA DEV V3 — dashboard module cards */
(function(){'use strict';
const s=()=>{try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')}catch(e){return null}};
const r=()=>String(s()?.role||'').toLowerCase();
const staff=()=>['admin','administrador','commercial'].includes(r());
const client=()=>['client','cliente'].includes(r());
function add(){const grid=document.querySelector('.moreGrid');if(!grid)return false;const id=staff()?'gama-tile-requests':client()?'gama-tile-catalog':null;if(!id||document.getElementById(id))return true;const b=document.createElement('button');b.id=id;b.type='button';b.innerHTML=staff()?'<span style="font-size:34px">📥</span><b>Demandas clients</b><small>Gérer les demandes de commande</small>':'<span style="font-size:34px">🛒</span><b>Catalogue client</b><small>Produits et demandes de commande</small>';b.style.cssText='display:flex;flex-direction:column;align-items:flex-start;justify-content:center;gap:4px;min-height:150px';b.onclick=()=>{const target=staff()?'gcmv2-requests':'gcmv2-catalog';const sec=document.getElementById(target);document.querySelectorAll("section").forEach(x=>x.classList.remove("active"));if(sec)sec.classList.add("active");document.querySelectorAll(".tabs .tab").forEach(x=>x.classList.remove("active"));const nav=document.getElementById('gcmv2-'+target);if(nav)nav.classList.add('active');window.scrollTo(0,0)};grid.appendChild(b);return true}
function run(){if(add())return;const o=new MutationObserver(()=>{if(add())o.disconnect()});o.observe(document.body,{childList:true,subtree:true});setTimeout(()=>o.disconnect(),15000)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
})();