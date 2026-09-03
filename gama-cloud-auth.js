/* GAMA — Supabase Auth central */
(function(){
  'use strict';
  if(window.GamaCloudAuth) return;

  const ROLE_MAP={administrador:'admin',comercial:'commercial',almacenero:'magasinier',cliente:'client'};
  const LABEL={administrador:'Administrador',comercial:'Comercial',almacenero:'Almacenero',cliente:'Cliente'};
  let started=false;

  function compat(session,profile){
    if(!session?.user||!profile||profile.active===false||!ROLE_MAP[profile.role])return false;
    localStorage.setItem('gama_session_v1',JSON.stringify({userId:session.user.id,role:ROLE_MAP[profile.role],username:session.user.email||'',name:profile.full_name||session.user.email||''}));
    return true;
  }
  function style(){
    if(document.getElementById('gamaCloudAuthStyle'))return;
    const s=document.createElement('style');s.id='gamaCloudAuthStyle';
    s.textContent=`#gamaCloudLogin{position:fixed;inset:0;z-index:100000;background:#f5f7fa;display:grid;place-items:center;padding:20px}#gamaCloudLogin .box{width:min(430px,100%);background:#fff;border:1px solid #e2e8ec;border-radius:22px;padding:28px;box-shadow:0 15px 45px #18324a18}#gamaCloudLogin h1{margin:0 0 5px;color:#18324a;font-size:25px}#gamaCloudLogin p{color:#71808a;font-size:13px;margin:5px 0 18px}#gamaCloudLogin label{display:block;font-weight:700;margin:8px 0 4px}#gamaCloudLogin input{width:100%;padding:12px;border:1px solid #d4e0e4;border-radius:9px;font-size:16px;box-sizing:border-box}#gamaCloudLogin button{width:100%;padding:12px;border:0;border-radius:9px;background:#087c8b;color:#fff;font-weight:800;margin-top:12px;cursor:pointer}#gamaCloudLogin button:disabled{opacity:.65;cursor:wait}.gamaCloudErr{margin-top:10px;background:#fff0ec;color:#c94f45;padding:10px;border-radius:8px;font-size:12px}.gamaCloudOk{margin-top:10px;background:#e7f6f0;color:#138a69;padding:10px;border-radius:8px;font-size:12px}.gamaCreateBox{margin:14px 0;padding:14px;border:1px solid #e2e8ec;border-radius:12px;background:#f8fafb}.gamaCreateGrid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.gamaCreateGrid label{font-size:11px;color:#50616c}.gamaCreateGrid input,.gamaCreateGrid select{width:100%;box-sizing:border-box;padding:9px;border:1px solid #d4e0e4;border-radius:8px;background:#fff}.gamaCreateActions{display:flex;justify-content:flex-end;gap:8px;margin-top:9px}.gamaCreateActions button{width:auto;margin-top:0}.gamaCreateStatus{font-size:12px;margin-top:8px}@media(max-width:600px){.gamaCreateGrid{grid-template-columns:1fr}.gamaCreateActions{flex-direction:column}.gamaCreateActions button{width:100%}}`;
    document.head.appendChild(s);
  }
  function removeLogin(){document.getElementById('gamaCloudLogin')?.remove()}
  function showLogin(message=''){
    style();
    if(document.getElementById('gamaCloudLogin')){if(message)showMessage(message);return;}
    const d=document.createElement('div');d.id='gamaCloudLogin';
    d.innerHTML='<div class="box"><div style="font-size:20px;font-weight:900;color:#087C8B;margin-bottom:18px">GAMA <span style="color:#F47A2A">Stock Manager</span></div><h1>Iniciar sesión</h1><p>Accede con tu cuenta profesional GAMA.</p><label for="gamaCloudEmail">Correo electrónico</label><input id="gamaCloudEmail" type="email" autocomplete="username" placeholder="correo@ejemplo.com"><label for="gamaCloudPass">Contraseña</label><input id="gamaCloudPass" type="password" autocomplete="current-password" placeholder="Contraseña"><button id="gamaCloudLoginBtn" type="button">Iniciar sesión</button><div id="gamaCloudErr" style="display:none"></div></div>';
    document.body.appendChild(d);
    const go=login;
    d.querySelector('#gamaCloudLoginBtn').onclick=go;
    d.querySelector('#gamaCloudPass').onkeydown=e=>{if(e.key==='Enter')go()};
    if(message)showMessage(message);
  }
  function showMessage(message,ok=false){const el=document.getElementById('gamaCloudErr');if(!el)return;el.className=ok?'gamaCloudOk':'gamaCloudErr';el.textContent=message;el.style.display='block'}
  function errorText(error){
    const code=error?.code||'';
    if(code==='invalid_credentials')return 'Correo o contraseña incorrectos.';
    if(code==='email_not_confirmed')return 'La cuenta debe confirmar su correo electrónico.';
    if(code==='user_banned')return 'Esta cuenta está desactivée.';
    return error?.message||'Impossible de se connecter. Réessayez.';
  }
  async function login(){
    const email=document.getElementById('gamaCloudEmail')?.value.trim().toLowerCase(),pass=document.getElementById('gamaCloudPass')?.value;
    const btn=document.getElementById('gamaCloudLoginBtn');
    if(!email||!pass){showMessage('Correo electrónico y contraseña son obligatorios.');return}
    if(!window.GamaCloud){showMessage('El servicio cloud todavía no está disponible.');return}
    btn.disabled=true;btn.textContent='Connexion…';
    try{
      const result=await window.GamaCloud.signIn(email,pass);
      if(result.error)throw result.error;
      const session=result.data?.session;
      if(!session)throw Error('La sesión no fue creada.');
      const profile=await window.GamaCloud.getProfile();
      if(profile.error)throw profile.error;
      if(!profile.data)throw Error('No existe un perfil GAMA para esta cuenta.');
      if(profile.data.active===false){await window.GamaCloud.signOut();throw Error('La cuenta está desactivada.');}
      if(!compat(session,profile.data)){await window.GamaCloud.signOut();throw Error('El perfil GAMA no tiene un rol válido.');}
      removeLogin();
      window.dispatchEvent(new CustomEvent('gama:auth-ready'));
      window.dispatchEvent(new CustomEvent('gama:client-authenticated'));
      window.GamaMenu?.render();
    }catch(e){
      console.error('[GAMA Auth]',e);showMessage(errorText(e));btn.disabled=false;btn.textContent='Iniciar sesión';
    }
  }
  async function ensure(){
    if(window.__GAMA_E2E__){removeLogin();return true}
    try{
      const result=await window.GamaCloud.getSession(),session=result?.data?.session;
      if(!session){localStorage.removeItem('gama_session_v1');showLogin();return false}
      const profile=await window.GamaCloud.getProfile();
      if(profile.error)throw profile.error;
      if(!compat(session,profile.data)){await window.GamaCloud.signOut();showLogin('Cuenta no autorizada o desactivada.');return false}
      removeLogin();
      window.dispatchEvent(new CustomEvent('gama:auth-ready'));
      return true;
    }catch(e){console.error('[GAMA Auth ensure]',e);showLogin('No se pudo verificar la sesión. Recarga la aplicación e inténtalo de nuevo.');return false}
  }
  function adminButton(){
    if(document.getElementById('gamaCloudAdminBtn')||sessionData()?.role!=='admin')return;
    const b=document.createElement('button');b.id='gamaCloudAdminBtn';b.type='button';b.textContent='⚙ Cuentas cloud';b.style='position:fixed;right:14px;top:118px;z-index:70;padding:8px 12px;background:#087C8B;color:#fff;border:0;border-radius:9px;font-weight:800';b.onclick=adminPanel;document.body.appendChild(b);
  }
  function sessionData(){try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')||null}catch(_){return null}}
  async function createCloudAccount(form){
    const status=form.querySelector('[data-create-status]');
    const button=form.querySelector('[data-create-submit]');
    const full_name=form.querySelector('[name="full_name"]').value.trim();
    const email=form.querySelector('[name="email"]').value.trim().toLowerCase();
    const password=form.querySelector('[name="password"]').value;
    const role=form.querySelector('[name="role"]').value;
    if(!full_name||!email||password.length<8||!role){status.textContent='Completa todos los campos. La contraseña debe tener al menos 8 caracteres.';status.style.color='#c94f45';return false}
    const sr=await window.GamaCloud.getSession();
    const token=sr?.data?.session?.access_token;
    if(!token)throw Error('Sesión administrador no disponible.');
    button.disabled=true;button.textContent='Creando…';status.textContent='';
    try{
      const response=await fetch(window.GamaCloud.url+'/functions/v1/gama-admin-users',{method:'POST',headers:{Authorization:'Bearer '+token,apikey:window.GamaCloud.publishableKey||'sb_publishable_4l0vZw61u5EbLkzmrqrf6Q_phOL1Be9','Content-Type':'application/json'},body:JSON.stringify({full_name,email,password,role})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(data.message||data.error||'No se pudo crear la cuenta.');
      status.textContent='Cuenta creada correctamente: '+data.full_name+' · '+LABEL[data.role];status.style.color='#138a69';
      form.querySelector('[name="full_name"]').value='';form.querySelector('[name="email"]').value='';form.querySelector('[name="password"]').value='';form.querySelector('[name="role"]').value='cliente';
      await refreshAdminTable();
      return true;
    }finally{button.disabled=false;button.textContent='Crear cuenta'}
  }
  async function refreshAdminTable(){
    const host=document.getElementById('gamaCloudUsersTable');if(!host||!window.GamaCloud)return;
    const rows=await window.GamaCloud.list('profiles',{order:'created_at',ascending:true});
    if(rows.error){host.innerHTML='<div class="gamaCloudErr">No se pudieron leer los perfiles: '+String(rows.error.message||rows.error)+'</div>';return}
    const roleLabel=r=>LABEL[r]||r||'—';
    host.innerHTML='<table><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr></thead><tbody>'+(rows.data||[]).map(x=>'<tr><td>'+String(x.full_name||'—')+'</td><td>'+String(x.email||'—')+'</td><td>'+String(roleLabel(x.role))+'</td><td>'+String(x.active===false?'Desactivado':'Activo')+'</td></tr>').join('')+'</tbody></table>';
  }
  async function adminPanel(){
    if(document.getElementById('gamaCloudAdmin'))return;
    const d=document.createElement('div');d.id='gamaCloudAdmin';d.style='position:fixed;inset:0;z-index:99998;background:#18324a66;display:grid;place-items:center;padding:20px';
    d.innerHTML='<div style="width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:22px"><button id="gamaCloudClose" class="secondary">Cerrar</button><h2>👥 Usuarios cloud</h2><p class="muted">Fuente única: Supabase / profiles.</p><div class="gamaCreateBox"><h3 style="margin:0 0 8px">Crear una cuenta</h3><div class="gamaCreateGrid"><label>Nombre completo<input name="full_name" autocomplete="name" placeholder="Nombre y apellido"></label><label>Email<input name="email" type="email" autocomplete="email" placeholder="cliente@ejemplo.com"></label><label>Contraseña<input name="password" type="password" autocomplete="new-password" minlength="8" placeholder="Mínimo 8 caracteres"></label><label>Rol<select name="role"><option value="cliente">Cliente — acceso al catálogo y pedidos</option><option value="comercial">Comercial</option><option value="almacenero">Almacenero</option><option value="administrador">Administrador</option></select></label></div><div class="gamaCreateActions"><button id="gamaCreateSubmit" data-create-submit class="primary" type="button">Crear cuenta</button></div><div class="gamaCreateStatus" data-create-status aria-live="polite"></div></div><div id="gamaCloudUsersTable"></div></div>';
    document.body.appendChild(d);
    d.querySelector('#gamaCloudClose').onclick=()=>d.remove();
    d.querySelector('#gamaCreateSubmit').onclick=()=>createCloudAccount(d).catch(e=>{console.error('[GAMA Cloud account]',e);const s=d.querySelector('[data-create-status]');s.textContent='Error: '+(e.message||e);s.style.color='#c94f45';d.querySelector('#gamaCreateSubmit').disabled=false;d.querySelector('#gamaCreateSubmit').textContent='Crear cuenta'});
    await refreshAdminTable();
  }
  function init(){
    if(started)return;started=true;window.GamaCloudAuth={ensure,login,createCloudAccount,openAdminPanel:adminPanel};
    window.addEventListener('gama:auth-ready',()=>adminButton());
    window.addEventListener('gama:auth-change',async e=>{
      if(e.detail?.event==='SIGNED_OUT'){localStorage.removeItem('gama_session_v1');document.getElementById('gamaCloudAdminBtn')?.remove();showLogin();return}
      if(e.detail?.session){await ensure();adminButton()}
    });
    ensure().then(ok=>{if(ok)adminButton()});
  }
  function wait(){if(window.GamaCloud)init();else setTimeout(wait,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait,{once:true});else wait();
})();
