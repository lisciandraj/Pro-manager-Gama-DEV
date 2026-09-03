/* GAMA — Supabase Auth central */
(function(){
  'use strict';
  if(window.GamaCloudAuth) return;

  const ROLE_MAP={administrador:'admin',comercial:'commercial',almacenero:'magasinier',cliente:'client'};
  const LABEL={administrador:'Administrador',comercial:'Comercial',almacenero:'Almacenero',cliente:'Cliente'};
  let started=false;

  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function compat(session,profile){
    if(!session?.user||!profile||profile.active===false||!ROLE_MAP[profile.role])return false;
    localStorage.setItem('gama_session_v1',JSON.stringify({userId:session.user.id,role:ROLE_MAP[profile.role],username:session.user.email||'',name:profile.full_name||session.user.email||''}));
    return true;
  }
  function style(){
    if(document.getElementById('gamaCloudAuthStyle'))return;
    const s=document.createElement('style');s.id='gamaCloudAuthStyle';
    s.textContent=`#gamaCloudLogin{position:fixed;inset:0;z-index:100000;background:#f5f7fa;display:grid;place-items:center;padding:20px}#gamaCloudLogin .box{width:min(430px,100%);background:#fff;border:1px solid #e2e8ec;border-radius:22px;padding:28px;box-shadow:0 15px 45px #18324a18}#gamaCloudLogin h1{margin:0 0 5px;color:#18324a;font-size:25px}#gamaCloudLogin p{color:#71808a;font-size:13px;margin:5px 0 18px}#gamaCloudLogin label{display:block;font-weight:700;margin:8px 0 4px}#gamaCloudLogin input{width:100%;padding:12px;border:1px solid #d4e0e4;border-radius:9px;font-size:16px;box-sizing:border-box}#gamaCloudLogin button{width:100%;padding:12px;border:0;border-radius:9px;background:#087c8b;color:#fff;font-weight:800;margin-top:12px;cursor:pointer}#gamaCloudLogin button:disabled{opacity:.65;cursor:wait}.gamaCloudErr{margin-top:10px;background:#fff0ec;color:#c94f45;padding:10px;border-radius:8px;font-size:12px}.gamaCloudOk{margin-top:10px;background:#e7f6f0;color:#138a69;padding:10px;border-radius:8px;font-size:12px}
#gamaSessionBar{box-sizing:border-box;width:min(1120px,calc(100% - 32px));margin:14px auto 0;padding:13px 16px;display:flex;align-items:center;justify-content:space-between;gap:14px;background:linear-gradient(135deg,#f7fafb,#eef5f6);border:1px solid #dfe8ea;border-radius:14px;box-shadow:0 3px 14px #1732460b;color:#18324a;position:relative;z-index:40}
#gamaSessionBar .gamaSessionIdentity{display:flex;align-items:center;gap:11px;min-width:0}
#gamaSessionBar .gamaSessionAvatar{width:42px;height:42px;flex:0 0 42px;border-radius:50%;display:grid;place-items:center;background:#087c8b;color:#fff;font-size:23px;box-shadow:inset 0 0 0 4px #ffffffaa}
#gamaSessionBar .gamaSessionText{min-width:0;line-height:1.25}
#gamaSessionBar .gamaSessionLine{font-size:14px;color:#71808a;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#gamaSessionBar .gamaSessionLine strong{color:#087c8b;font-weight:850}
#gamaSessionBar .gamaSessionRole{font-size:12px;color:#18324a;margin-top:3px;font-weight:750}
#gamaSessionBar .gamaSessionRole b{color:#087c8b}
#gamaSessionBar .gamaSessionLogout{appearance:none;border:1px solid #cbd8dc;background:#fff;color:#e66f20;border-radius:9px;padding:10px 14px;min-height:42px;font:inherit;font-size:13px;font-weight:850;cursor:pointer;white-space:nowrap;touch-action:manipulation}
#gamaSessionBar .gamaSessionLogout:hover{background:#fff7f2;border-color:#f1a16c}
#gamaSessionBar .gamaSessionLogout:disabled{opacity:.6;cursor:wait}
@media(max-width:700px){#gamaSessionBar{width:calc(100% - 24px);margin-top:10px;padding:11px 12px;gap:9px}#gamaSessionBar .gamaSessionAvatar{width:38px;height:38px;flex-basis:38px;font-size:21px}#gamaSessionBar .gamaSessionLine{font-size:13px}#gamaSessionBar .gamaSessionRole{font-size:11px}#gamaSessionBar .gamaSessionLogout{padding:9px 10px;font-size:12px}}
`;
    document.head.appendChild(s);
  }
  function removeLogin(){document.getElementById('gamaCloudLogin')?.remove()}
  function showLogin(message=''){
    style();
    removeSessionBar();
    if(document.getElementById('gamaCloudLogin')){if(message)showMessage(message);return}
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
    if(code==='user_banned')return 'Esta cuenta está désactivée.';
    return error?.message||'Impossible de se connecter. Réessayez.';
  }
  function sessionData(){
    try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')||null}catch(_){return null}
  }
  function removeSessionBar(){document.getElementById('gamaSessionBar')?.remove()}
  function renderSessionBar(){
    style();
    const data=sessionData();
    if(!data){removeSessionBar();return}
    const header=document.querySelector('.gamaHeader');
    if(!header)return;
    let bar=document.getElementById('gamaSessionBar');
    if(!bar){
      bar=document.createElement('div');
      bar.id='gamaSessionBar';
      header.insertAdjacentElement('afterend',bar);
    }
    const roleKey=Object.keys(ROLE_MAP).find(k=>ROLE_MAP[k]===data.role)||data.role;
    const role=LABEL[roleKey]||data.role||'Usuario';
    const name=data.name||data.username||'Usuario GAMA';
    const email=data.username||'';
    bar.innerHTML='<div class="gamaSessionIdentity"><div class="gamaSessionAvatar" aria-hidden="true">♙</div><div class="gamaSessionText"><div class="gamaSessionLine">Conectado como: <strong>'+esc(name)+'</strong>'+(email&&email!==name?' <span style="font-size:11px;color:#8b979d">('+esc(email)+')</span>':'')+'</div><div class="gamaSessionRole">🛡 Rol: <b>'+esc(role)+'</b></div></div></div><button type="button" class="gamaSessionLogout" id="gamaSessionLogout">↪ Cerrar sesión</button>';
    bar.querySelector('#gamaSessionLogout').onclick=async()=>{
      const btn=bar.querySelector('#gamaSessionLogout');
      if(btn.disabled)return;
      btn.disabled=true;btn.textContent='Cerrando…';
      try{if(window.GamaCloud?.signOut)await window.GamaCloud.signOut();else localStorage.removeItem('gama_session_v1');}
      catch(e){console.error('[GAMA Auth signOut]',e);btn.disabled=false;btn.textContent='↪ Cerrar sesión'}
    };
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
      renderSessionBar();
      window.dispatchEvent(new CustomEvent('gama:auth-ready'));
      window.dispatchEvent(new CustomEvent('gama:client-authenticated'));
      window.GamaMenu?.render();
    }catch(e){
      console.error('[GAMA Auth]',e);showMessage(errorText(e));btn.disabled=false;btn.textContent='Iniciar sesión';
    }
  }
  async function ensure(){
    try{
      const result=await window.GamaCloud.getSession(),session=result?.data?.session;
      if(!session){localStorage.removeItem('gama_session_v1');showLogin();return false}
      const profile=await window.GamaCloud.getProfile();
      if(profile.error)throw profile.error;
      if(!compat(session,profile.data)){await window.GamaCloud.signOut();showLogin('Cuenta no autorizada o desactivada.');return false}
      removeLogin();
      renderSessionBar();
      window.dispatchEvent(new CustomEvent('gama:auth-ready'));
      return true;
    }catch(e){console.error('[GAMA Auth ensure]',e);showLogin('No se pudo verificar la sesión. Recarga la aplicación e inténtalo de nuevo.');return false}
  }
  function adminButton(){
    if(document.getElementById('gamaCloudAdminBtn')||sessionData()?.role!=='admin')return;
    const b=document.createElement('button');b.id='gamaCloudAdminBtn';b.type='button';b.textContent='⚙ Cuentas cloud';b.style='position:fixed;right:14px;top:118px;z-index:70;padding:8px 12px;background:#087C8B;color:#fff;border:0;border-radius:9px;font-weight:800';b.onclick=adminPanel;document.body.appendChild(b);
  }
  async function adminPanel(){
    if(document.getElementById('gamaCloudAdmin'))return;
    const rows=await window.GamaCloud.list('profiles',{order:'created_at',ascending:true});
    const d=document.createElement('div');d.id='gamaCloudAdmin';d.style='position:fixed;inset:0;z-index:99998;background:#18324a66;display:grid;place-items:center;padding:20px';
    d.innerHTML='<div style="width:min(760px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:22px"><button id="gamaCloudClose" class="secondary">Cerrar</button><h2>👥 Usuarios cloud</h2><p class="muted">Fuente única: Supabase / profiles.</p><div id="gamaCloudUsersTable"></div></div>';
    document.body.appendChild(d);d.querySelector('#gamaCloudClose').onclick=()=>d.remove();
    const roleLabel=r=>LABEL[r]||r||'—';
    d.querySelector('#gamaCloudUsersTable').innerHTML='<table><thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th></tr></thead><tbody>'+(rows.data||[]).map(x=>'<tr><td>'+esc(x.full_name||'—')+'</td><td>'+esc(x.email||'—')+'</td><td>'+esc(roleLabel(x.role))+'</td><td>'+esc(x.active===false?'Desactivado':'Activo')+'</td></tr>').join('')+'</tbody></table>';
  }
  function init(){
    if(started)return;started=true;window.GamaCloudAuth={ensure,login,renderSessionBar};
    window.addEventListener('gama:auth-change',async e=>{
      if(e.detail?.event==='SIGNED_OUT'){localStorage.removeItem('gama_session_v1');removeSessionBar();document.getElementById('gamaCloudAdminBtn')?.remove();showLogin();return}
      if(e.detail?.session){await ensure();adminButton()}
    });
    ensure().then(ok=>{if(ok)adminButton()});
  }
  function wait(){if(window.GamaCloud) init();else setTimeout(wait,100)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait,{once:true});else wait();
})();
