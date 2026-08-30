(async function(){
  'use strict';
  const PROD='https://lisciandraj.github.io/Pro-manager-Gama/';
  const RAW='https://raw.githubusercontent.com/lisciandraj/Pro-manager-Gama/main/index.html?dev=20260830-18';
  try {
    const res=await fetch(RAW,{cache:'no-store'});
    if(!res.ok) throw new Error('Impossible de charger GAMA de référence ('+res.status+')');
    let html=await res.text();
    html=html.replace(/<head>/i,'<head><base href="'+PROD+'">');
    html=html.replace(/<body([^>]*)>/i,'<body$1><div style="position:fixed;top:0;left:0;right:0;z-index:999999;background:#B45309;color:#fff;text-align:center;padding:8px;font:900 11px -apple-system,BlinkMacSystemFont,Segoe UI,sans-serif">🧪 ENVIRONNEMENT DE DÉVELOPPEMENT · GAMA DEV · BUILD 2026-08-30-18</div>');
    html=html.replace(/<\/body>/i,'<script src="https://lisciandraj.github.io/Pro-manager-Gama-DEV/gama-dev-inject.js?v=20260830-18"></script></body>');
    document.open();
    document.write(html);
    document.close();
  } catch(e) {
    document.open();
    document.write('<!doctype html><html><body style="font-family:Arial;padding:30px;color:#9b3e35"><h2>Erreur GAMA DEV</h2><p>'+String(e&&e.message||e)+'</p></body></html>');
    document.close();
  }
})();