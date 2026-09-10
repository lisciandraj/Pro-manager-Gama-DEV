/* GAMA — Desktop sidebar navigation (progressive enhancement, ≥1100px).
 * Mobile/tablet keep the existing tile launcher untouched; on wide screens
 * we add a persistent nav so desktop users don't have to return to the tile
 * grid for every action, matching how commercial ERP/SaaS apps behave.
 * Reads the already role-filtered cards GamaMenu renders into #mainmenu, so
 * permissions never need to be duplicated here. */
(function(){
'use strict';
if(window.GamaSidebar)return;

const HOME_ICON='<path d="m3 11 9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z"/>';

function nav(){
  let el=document.querySelector('nav.gamaSidebar');
  if(!el){
    el=document.createElement('nav');
    el.className='gamaSidebar';
    el.setAttribute('aria-label','Navegación principal');
    document.body.appendChild(el);
  }
  return el;
}

function link(id,label,svg){
  const b=document.createElement('button');
  b.type='button';
  b.className='gamaSideLink';
  b.dataset.gamaSideTarget=id;
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+svg+'</svg><span>'+label+'</span>';
  b.onclick=()=>{
    if(id==='mainmenu'){window.showTab?.('mainmenu',null);return;}
    window.GamaMenu?.open(id);
  };
  return b;
}

function render(){
  const grid=document.querySelector('#mainmenu .gamaF2Grid');
  if(!grid)return;
  const cards=[...grid.querySelectorAll('.gamaF2Card')];
  if(!cards.length)return;
  const el=nav();
  el.replaceChildren();
  el.appendChild(link('mainmenu','Inicio',HOME_ICON));
  const categories=window.GamaMenu?.categories||[];
  const byCategory=new Map();
  cards.forEach(c=>{
    const cat=c.dataset.gamaCategory||'';
    if(!byCategory.has(cat))byCategory.set(cat,[]);
    byCategory.get(cat).push(c);
  });
  const order=categories.length?categories:[...byCategory.keys()];
  order.forEach(cat=>{
    const list=byCategory.get(cat);
    if(!list||!list.length)return;
    const heading=document.createElement('div');
    heading.className='gamaSideGroup';
    heading.textContent=cat;
    el.appendChild(heading);
    list.forEach(c=>{
      const id=c.dataset.gamaModule;
      const label=c.querySelector('.gamaF2Title')?.textContent||id;
      const svg=c.querySelector('.gamaF2Icon svg')?.innerHTML||'';
      el.appendChild(link(id,label,svg));
    });
  });
  document.body.classList.add('gamaHasSidebar');
  syncActive();
}

function currentSectionId(){
  const active=document.querySelector('section.active');
  return active?active.id:'';
}

function syncActive(){
  const el=document.querySelector('nav.gamaSidebar');
  if(!el)return;
  const current=currentSectionId();
  el.querySelectorAll('.gamaSideLink').forEach(b=>{
    b.classList.toggle('active',b.dataset.gamaSideTarget===current);
  });
}

function init(){
  window.GamaSidebar={render,syncActive};
  window.addEventListener('gama:menu-ready',render);
  window.addEventListener('gama:auth-change',()=>setTimeout(render,50));
  let timer=null;
  new MutationObserver(()=>{
    if(timer)return;
    timer=setTimeout(()=>{timer=null;syncActive()},80);
  }).observe(document.body,{subtree:true,attributes:true,attributeFilter:['class']});
  render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
