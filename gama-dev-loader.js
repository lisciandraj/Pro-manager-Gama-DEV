(async function(){
'use strict';
const PROD='https://lisciandraj.github.io/Pro-manager-Gama/';
const RAW='https://raw.githubusercontent.com/lisciandraj/Pro-manager-Gama/main/index.html?dev=20260830-19';
const BUILD='2026-08-30-19';
function fail(e){document.body.innerHTML='<div style="font-family:Arial;padding:30px;color:#9b3e35"><h2>Erreur GAMA DEV</h2><p>'+String(e&&e.message||e)+'</p></div>';}
async function runScripts(scripts){
 for(const old of scripts){
  const s=document.createElement('script');
  for(const a of old.attributes){if(a.name!=='src')s.setAttribute(a.name,a.value)}
  if(old.src){await new Promise((ok,bad)=>{s.src=old.src;s.onload=ok;s.onerror=()=>bad(new Error('Script inaccessible: '+old.src));document.body.appendChild(s);});}
  else{s.textContent=old.textContent;document.body.appendChild(s);}
 }
}
try{
 const res=await fetch(RAW,{cache:'no-store'});if(!res.ok)throw new Error('Impossible de charger GAMA de référence ('+res.status+')');
 const source=await res.text();
 const parsed=new DOMParser().parseFromString(source,'text/html');
 if(!parsed.body)throw new Error('HTML GAMA invalide');
 const base=parsed.createElement('base');base.href=PROD;parsed.head.prepend(base);
 const style=parsed.createElement('style');style.id='gamaDevTilesStyle';style.textContent=`
.gamaDevTile{position:relative!important;background:#fff!important;border:1px solid #E2E8EC!important;border-radius:14px!important;min-height:138px!important;padding:14px 10px 12px!important;display:flex!important;flex-direction:column!important;align-items:center!important;justify-content:center!important;gap:7px!important;color:#173246!important;box-shadow:0 3px 13px #1732460b!important;cursor:pointer!important;text-align:left}.gamaDevTileIcon{width:58px;height:58px;border-radius:15px;display:grid;place-items:center;font-size:32px}.gamaDevTileIcon.orange{background:#FFF0E7}.gamaDevTileIcon.teal{background:#E8F5F6}.gamaDevBadge{position:absolute;right:9px;top:9px;padding:4px 8px;border-radius:999px;background:#F47A2A;color:#fff;font-size:9px;font-weight:900}.gamaDevTile.teal .gamaDevBadge{background:#087C8B}.gamaDevTile b{font-size:14px;line-height:1.15;text-align:center}.gamaDevTile small{font-size:10px;color:#71808A;text-align:center;line-height:1.2}@media(max-width:700px){.gamaDevTile{min-height:118px!important;padding:10px 5px!important}.gamaDevTileIcon{width:47px;height:47px;font-size:26px}.gamaDevTile b{font-size:12px}.gamaDevTile small{font-size:9px}}
`;
parsed.head.appendChild(style);
const banner=parsed.createElement('div');banner.id='gamaDevBanner';banner.textContent='🧪 ENVIRONNEMENT DE DÉVELOPPEMENT · GAMA DEV · BUILD '+BUILD;banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:999999;background:#B45309;color:#fff;text-align:center;padding:8px;font:900 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';parsed.body.prepend(banner);
const grid=parsed.querySelector('.moreGrid');
if(!grid)throw new Error('Le dashboard GAMA ne contient pas .moreGrid');
const make=(id,icon,title,desc,tone)=>{const b=parsed.createElement('button');b.type='button';b.id=id;b.className='gamaDevTile '+tone;b.innerHTML='<span class="gamaDevTileIcon '+tone+'">'+icon+'</span><span class="gamaDevBadge">NOUVEAU</span><b>'+title+'</b><small>'+desc+'</small>';return b};
// Put the two new modules at the end of the existing module grid, without removing any native tile.
grid.appendChild(make('dev-client-catalog-tile','🛍️','Catalogue client','Produits disponibles à la vente','orange'));
grid.appendChild(make('dev-client-requests-tile','📥','Demandes clients','Demandes de commande reçues','teal'));
const sections=parsed.createElement('div');sections.id='gamaDevSections';sections.innerHTML='<section id="gama-dev-client-catalog"><div class="card"><h2>🛍️ Catalogue client</h2><p class="muted">Catalogue des produits disponibles à la vente.</p><div id="gamaDevCatalogList"></div></div></section><section id="gama-dev-client-requests"><div class="card"><h2>📥 Demandes clients</h2><p class="muted">Demandes de commande reçues.</p><div id="gamaDevRequestsList"></div></div></section>';
parsed.body.appendChild(sections);
// Prevent the new sections from affecting the initial dashboard; the tiles remain visible.
const sectionStyle=parsed.createElement('style');sectionStyle.textContent='#gamaDevSections{display:none!important}';parsed.head.appendChild(sectionStyle);
// Extract scripts before replacing the live document so inline </script> cannot corrupt the loader.
const scripts=[...parsed.querySelectorAll('script')];scripts.forEach(s=>s.remove());
const html=parsed.documentElement;
document.replaceChild(document.importNode(html,true),document.documentElement);
await runScripts(scripts);
const check=document.createElement('div');check.id='gamaDevCheck';check.textContent=(document.getElementById('dev-client-catalog-tile')&&document.getElementById('dev-client-requests-tile'))?'✓ 2/2 tuiles DEV affichées':'⚠ Tuiles DEV manquantes';check.style.cssText='position:fixed;right:10px;top:45px;z-index:999998;background:#E7F6F0;color:#138A69;border:1px solid #BFE5D5;border-radius:999px;padding:5px 9px;font:800 10px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif';document.body.appendChild(check);
}catch(e){fail(e)}
})();