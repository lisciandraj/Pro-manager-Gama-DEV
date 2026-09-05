/* GAMA — Usuarios cloud */
(function(){
  'use strict';
  if(window.GamaCloudUsers)return;
  const ROLE={administrador:'Administrador',admin:'Administrador',comercial:'Comercial',commercial:'Comercial',almacenero:'Almacenero',magasinier:'Almacenero'};
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let ready=false,channel=null;
  function session(){try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')}catch(_){return null}}
  function style(){
    if(document.getElementById('cuStyle'))return;
    const s=document.createElement('style');s.id='cuStyle';s.textContent='.cloudUsersV18{border-radius:16px}.cuHead,.cuBar,.cuFoot{display:flex;justify-content:space-between;align-items:center;gap:12px}.cuKicker{font-size:10px;font-weight:900;letter-spacing:1.3px;color:#087C8B}.cuHead h2{margin:4px 0;font-size:26px;color:#18324A}.cuHead p{margin:3px 0;color:#71808A;font-size:12px}.cuOnline{padding:8px 11px;border-radius:999px;background:#E7F6F0;color:#138A69;font-size:11px;font-weight:800}.cuInfo{margin:14px 0;padding:11px 13px;border-left:4px solid #087C8B;background:#F0F8F9;border-radius:8px;font-size:12px;color:#50616C}.cuStatus{margin:10px 0;color:#71808A;font-size:12px}.cuTable{overflow:auto;border:1px solid #E4EBEE;border-radius:12px}.cuTable table{width:100%;min-width:780px;border-collapse:collapse;display:table}.cuTable th,.cuTable td{padding:11px 12px;text-align:left;border-bottom:1px solid #EDF1F2;font-size:12px;white-space:nowrap}.cuTable th{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#71808A;background:#F8FAFB}.cuBadge{display:inline-block;padding:5px 8px;border-radius:999px;background:#E8F5F6;color:#087C8B;font-weight:800}.cuActive{color:#138A69;font-weight:800}.cuInactive{color:#C94F45;font-weight:800}.cuId{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;color:#7B8992}.cuFoot{margin-top:9px;color:#71808A;font-size:11px}@media(max-width:700px){.cuHead,.cuBar,.cuFoot{align-items:flex-start;flex-direction:column}}';document.head.appendChild(s);
  }
  function ensure(){
    if(session()?.role!=='admin')return null;
    style();let s=document.getElementById('users');
    if(!s){s=document.createElement('section');s.id='users';(document.querySelector('.wrap')||document.body).appendChild(s)}
    if(s.querySelector('.cloudUsersV18'))return s;
    s.innerHTML='<div class="card cloudUsersV18"><div class="cuHead"><div><div class="cuKicker">GAMA CLOUD</div><h2>👥 Usuarios y accesos</h2><p>Usuarios centralizados en Supabase.</p></div><div class="cuOnline">● Cloud conectado</div></div><div class="cuInfo"><b>Fuente única de datos:</b> Supabase / profiles.</div><div class="cuBar"><h3>Usuarios cloud</h3><button class="secondary" id="cuRefresh" type="button">↻ Actualizar</button></div><div id="cuStatus" class="cuStatus">Cargando…</div><div class="cuTable"><table><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Creado</th><th>ID</th></tr></thead><tbody id="cuRows"></tbody></table></div><div class="cuFoot"><span id="cuCount">0 usuarios</span><span>Actualización en tiempo real</span></div></div>';
    s.querySelector('#cuRefresh').onclick=load;return s;
  }
  async function load(){
    const s=ensure();if(!s||!window.GamaCloud)return;
    const status=s.querySelector('#cuStatus'),body=s.querySelector('#cuRows');
    try{status.textContent='Sincronizando…';const r=await window.GamaCloud.list('profiles',{order:'created_at',ascending:false});if(r.error)throw r.error;const rows=r.data||[];body.innerHTML=rows.length?rows.map(x=>`<tr><td><b>${esc(x.full_name||'Sin nombre')}</b></td><td>${esc(x.email||'—')}</td><td><span class="cuBadge">${esc(ROLE[x.role]||x.role||'Usuario')}</span></td><td class="${x.active===false?'cuInactive':'cuActive'}">${x.active===false?'● Desactivado':'● Activo'}</td><td>${x.created_at?new Date(x.created_at).toLocaleString('es-EC'):'—'}</td><td class="cuId">${esc(x.id)}</td></tr>`).join(''):'<tr><td colspan="6">No hay usuarios.</td></tr>';s.querySelector('#cuCount').textContent=rows.length+' usuario'+(rows.length>1?'s':'');status.textContent='Última sincronización: '+new Date().toLocaleTimeString('es-EC')}catch(e){console.error('[GAMA Cloud Users]',e);status.textContent='Error en la nube: '+(e.message||e);body.innerHTML='<tr><td colspan="6" class="cuInactive">No se pudo leer profiles. Verifica las políticas RLS.</td></tr>'}
  }
  function init(){
    if(ready)return;ready=true;window.GamaCloudUsers={ensure,load};
    window.addEventListener('gama:auth-ready',()=>setTimeout(load,100));
    window.addEventListener('gama:auth-change',e=>{if(e.detail?.session)setTimeout(load,100);else document.getElementById('users')?.remove()});
    if(session()?.role==='admin')setTimeout(load,100);
  }
  function wait(){if(window.GamaCloud) init();else setTimeout(wait,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait,{once:true});else wait();
})();