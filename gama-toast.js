/* GAMA — Toast notifications. Gives the app a non-blocking, commercial-grade
 * feedback pattern and routes window.alert() through it so every existing
 * alert('…') call across the app benefits automatically, with no call sites
 * to touch. Falls back to the native dialog if anything goes wrong. */
(function(){
'use strict';
if(window.gamaToast)return;
const nativeAlert=window.alert?window.alert.bind(window):null;

function host(){
  let h=document.getElementById('gamaToastHost');
  if(!h){h=document.createElement('div');h.id='gamaToastHost';h.setAttribute('aria-live','polite');h.setAttribute('role','status');document.body.appendChild(h);}
  return h;
}

function classify(message){
  const m=String(message||'').toLowerCase();
  if(/error|no se pudo|falló|fallo|inválid/.test(m))return'danger';
  if(/atención|advertencia|⚠/.test(m))return'warning';
  if(/correcta|éxito|creada|guardad|exportad|importad|actualizad|✅/.test(m))return'success';
  return'';
}

function gamaToast(message,opts){
  opts=opts||{};
  try{
    const type=opts.type||classify(message);
    const h=host();
    const el=document.createElement('div');
    el.className='gamaToast'+(type?' '+type:'');
    const text=document.createElement('b');text.textContent=String(message??'');
    const close=document.createElement('button');close.type='button';close.textContent='✕';close.setAttribute('aria-label','Cerrar');
    el.append(text,close);
    h.appendChild(el);
    let dismissed=false;
    function dismiss(){
      if(dismissed)return;dismissed=true;
      el.classList.add('gamaToastOut');
      setTimeout(()=>el.remove(),180);
    }
    close.onclick=dismiss;
    setTimeout(dismiss,opts.duration||4200);
    return dismiss;
  }catch(e){
    console.warn('[GAMA toast]',e);
    if(nativeAlert)nativeAlert(message);
  }
}

window.gamaToast=gamaToast;
window.alert=function(message){gamaToast(message)};
})();
