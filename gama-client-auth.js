/* GAMA DEV — client login bridge */
(function(){'use strict';
function start(){if(!window.GamaCloud||!window.GamaCloudReady)return setTimeout(start,150);window.GamaCloudReady.then(async C=>{
 const activate=async()=>{try{const sr=await C.getSession(),s=sr?.data?.session;if(!s)return false;const pr=await C.getProfile();if(pr?.data?.role!=='client'||pr.data.active===false)return false;localStorage.setItem('gama_session_v1',JSON.stringify({userId:s.user.id,role:'client',username:s.user.email||'',name:pr.data.full_name||s.user.email||'Client'}));document.getElementById('gamaCloudLogin')?.remove();document.getElementById('gamaLogin')?.remove();window.dispatchEvent(new CustomEvent('gama:client-authenticated'));return true}catch(e){return false}};
 document.addEventListener('click',async e=>{const b=e.target?.closest?.('#gamaCloudLoginBtn');if(!b)return;const email=document.getElementById('gamaCloudEmail')?.value.trim().toLowerCase(),pass=document.getElementById('gamaCloudPass')?.value||'',er=document.getElementById('gamaCloudErr');if(!email||!pass)return;try{const r=await C.signIn(email,pass);if(r.error)return;const ok=await activate();if(ok){location.reload();return}await C.signOut()}catch(x){if(er){er.textContent='Erreur de connexion.';er.style.display='block'}}},true);
 await activate();window.addEventListener('gama:auth-change',activate);
});}
start();})();