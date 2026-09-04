/* GAMA Module Loader — Excel + Compras + Ajustes V34 */
(function(){
  'use strict';
  const PURCHASES='gama-purchases-v14.js?v=20260827-5';
  const EXCEL='gama-excel-import.js?v=10';
  const EXCEL_FALLBACK='gama-excel-standalone.js?v=1';
  const SETTINGS='gama-settings-standalone.js?v=1';
  let started=false,excelLoading=null;
  function loadScript(src){return new Promise(function(resolve,reject){const base=src.split('?')[0],existing=document.querySelector('script[data-gama-module="'+base+'"],script[src*="'+base+'"]');if(existing){if(base.includes('gama-purchases-v14')&&window.gamaShowPurchases)return resolve();if(base.includes('gama-excel-import')&&window.GamaExcelImport)return resolve();if(base.includes('gama-settings-standalone')&&window.GamaEnsureSettings)return resolve();if(existing.dataset.gamaLoaded==='1')return resolve();existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}const s=document.createElement('script');s.src=src;s.dataset.gamaModule=base;s.onload=function(){s.dataset.gamaLoaded='1';resolve()};s.onerror=reject;document.head.appendChild(s)})}
  function openPurchases(){const run=function(){if(window.gamaShowPurchases){window.gamaShowPurchases();return true}return false};if(run())return;loadScript(PURCHASES).then(run).catch(function(e){console.error('[GAMA] Achats load error',e);alert('No se pudo cargar el módulo Compras. Recarga la página.')})}
  function getExcelContent(){return document.getElementById('gama-excel-import-section')}
  function localizeExcel(){const root=getExcelContent();if(!root)return;const map={
    '📊 Import Excel':'📊 Importar Excel',
    'Importez vos':'Importa tus',
    'directement depuis un fichier Excel.':'directamente desde un archivo Excel.',
    '1 · Sélection':'1 · Selección','2 · Prévisualisation':'2 · Vista previa','3 · Import':'3 · Importación','4 · Résultats':'4 · Resultados',
    'Que souhaitez-vous importer ?':'¿Qué deseas importar?',
    'Références, prix, stock':'Referencias, precios, stock','Contacts et coordonnées':'Contactos y datos','Contacts et conditions':'Contactos y condiciones',
    'Glissez-déposez votre fichier Excel ici':'Arrastra y suelta tu archivo Excel aquí',
    'ou cliquez pour sélectionner un fichier':'o haz clic para seleccionar un archivo',
    'Choisir un fichier':'Elegir archivo','Fichier chargé':'Archivo cargado','ligne(s)':'fila(s)',
    'Conseil :':'Consejo:','utilisez une feuille par type :':'usa una hoja por tipo:','Les colonnes sont reconnues en français ou en anglais.':'Las columnas se reconocen en francés, español o inglés.',
    'Feuille Excel':'Hoja de Excel','Colonnes obligatoires':'Columnas obligatorias','Détection automatique':'Detección automática',
    'Référence':'Referencia','Nom':'Nombre','catégorie':'categoría','prix':'precios','stock':'stock','email':'correo electrónico','téléphone':'teléfono','adresse':'dirección','TVA/RUC':'IVA/RUC','contact':'contacto',
    'Prévisualisation':'Vista previa','Lignes':'Filas','Colonnes':'Columnas','Obligatoires OK':'Obligatorios OK','Oui':'Sí','Non':'No','Importer':'Importar','Réinitialiser':'Restablecer',
    'Import impossible : colonnes obligatoires manquantes.':'No se puede importar: faltan columnas obligatorias.',
    'Colonnes obligatoires introuvables :':'No se encontraron las columnas obligatorias:',
    'nom fournisseur vide':'nombre del proveedor vacío','nom client vide':'nombre del cliente vacío',
    'Import terminé':'Importación finalizada','Import terminé avec avertissements':'Importación finalizada con advertencias',
    'Aucune ligne à importer.':'No hay filas para importar.','Erreur':'Error','ligne':'fila','Fournisseurs':'Proveedores','Produits':'Productos','Clients':'Clientes'
  };
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
  nodes.forEach(function(node){let t=node.nodeValue;Object.keys(map).forEach(function(k){if(t.includes(k))t=t.split(k).join(map[k])});if(t!==node.nodeValue)node.nodeValue=t});
  root.querySelectorAll('input,button,select').forEach(function(el){if(el.placeholder)el.placeholder=el.placeholder.replace('fichier','archivo').replace('nom','nombre');if(el.getAttribute('aria-label'))el.setAttribute('aria-label',el.getAttribute('aria-label').replace('Ouvrir','Abrir'))});
  }
  function renderExcel(){if(window.GamaExcelImport&&typeof window.GamaExcelImport.render==='function'){window.GamaExcelImport.render();const c=getExcelContent();localizeExcel();return c}return getExcelContent()}
  function ensureExcel(){if(window.GamaExcelImport){renderExcel();return Promise.resolve(getExcelContent())}if(excelLoading)return excelLoading;excelLoading=loadScript(EXCEL).then(function(){if(window.GamaExcelImport)return renderExcel();throw new Error('GamaExcelImport indisponible')}).catch(function(err){console.warn('[GAMA] Excel principal indisponible, utilisation du fallback',err);return loadScript(EXCEL_FALLBACK).then(function(){if(window.GamaExcelImport)return renderExcel();throw new Error('Module Excel indisponible')})});return excelLoading}
  function openExcelModule(){ensureExcel().then(function(){const sec=renderExcel();if(!sec)throw new Error('Module Import Excel indisponible');document.querySelectorAll('section').forEach(function(s){s.classList.remove('active');s.style.display='none';s.removeAttribute('hidden')});sec.classList.add('active');sec.style.display='block';sec.removeAttribute('hidden');localizeExcel();document.getElementById('mainmenu')?.setAttribute('hidden','');window.scrollTo({top:0,behavior:'smooth'})}).catch(function(e){console.error('[GAMA] Excel open error',e);alert('No se pudo cargar el módulo Importar Excel. Recarga la página.')})}
  function cleanDeliveryTiles(){document.querySelectorAll('#mainmenu .gamaF2Card,#mainmenu .appTile,[data-gama-tms-tile]').forEach(function(el){const t=(el.textContent||'').toLowerCase();if(t.includes('tms')||t.includes('entregas')||t.includes('livraisons'))el.remove()})}
  function excelVisualStyle(){if(document.getElementById('gamaExcelMenuVisualStyle'))return;const s=document.createElement('style');s.id='gamaExcelMenuVisualStyle';s.textContent='.gamaExcelMenuTitle{font-size:0!important}.gamaExcelMenuTitle::after{content:"Importar Excel";font-size:17px;line-height:1.25;font-weight:850}';document.head.appendChild(s)}
  function ensureExcelMenuCard(){const host=document.querySelector('#mainmenu .gamaF2Grid');if(!host)return;let role='';try{role=JSON.parse(localStorage.getItem('gama_session_v1')||'null')?.role||''}catch(_){}if(!['admin','commercial'].includes(role))return;excelVisualStyle();let b=host.querySelector('[data-gama-module="excel-import"]');if(!b){b=document.createElement('button');b.type='button';b.className='gamaF2Card';b.dataset.gamaModule='excel-import';b.setAttribute('aria-label','Abrir el módulo Importar Excel');b.innerHTML='<span class="gamaF2Icon"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l4 4v14H6z"/><path d="M15 3v5h5M9 12l6 6M15 12l-6 6"/></svg></span><span class="gamaF2Title gamaExcelMenuTitle">Excel</span>';b.onclick=openExcelModule;host.appendChild(b);return}b.classList.remove('gamaDisabledModule');b.removeAttribute('aria-hidden');b.removeAttribute('tabindex');const title=b.querySelector('.gamaF2Title');if(title){title.classList.add('gamaExcelMenuTitle');title.textContent='Excel'}b.onclick=openExcelModule}
  function boot(){if(started)return;started=true;window.GamaOpenExcelImport=openExcelModule;window.GamaOpenPurchases=openPurchases;ensureExcel().catch(function(e){console.warn('[GAMA] Excel preload',e)});loadScript(PURCHASES).catch(function(){});if(!window.GamaEnsureSettings)loadScript(SETTINGS).then(function(){window.GamaEnsureSettings?.()}).catch(function(){});let tries=0;const timer=setInterval(function(){cleanDeliveryTiles();ensureExcelMenuCard();localizeExcel();window.GamaEnsureSettings?.();if(++tries>40)clearInterval(timer)},250)}
  window.GamaOpenExcelImport=openExcelModule;window.GamaOpenPurchases=openPurchases;if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();