/* GAMA Excel importer — mobile responsive layout fix */
(function(){
  'use strict';
  function install(){
    if(document.getElementById('gamaExcelMobileFix')) return;
    const s=document.createElement('style');
    s.id='gamaExcelMobileFix';
    s.textContent=`
#gama-excel-import-section{box-sizing:border-box;max-width:100%;overflow-x:hidden}
#gama-excel-import-section *{box-sizing:border-box;min-width:0}
#gama-excel-import-section>.card{width:100%;max-width:100%;overflow:hidden}
#gama-excel-import-section .gxiHead{max-width:100%;flex-wrap:wrap}
#gama-excel-import-section .gxiSteps{width:100%;max-width:100%}
#gama-excel-import-section .gxiStep{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:normal;word-break:normal}
#gama-excel-import-section .gxiGrid{width:100%;max-width:100%}
#gama-excel-import-section .gxiCard{width:100%;max-width:100%;overflow:hidden}
#gama-excel-import-section .gxiTypes{width:100%;max-width:100%}
#gama-excel-import-section .gxiType{width:100%;max-width:100%;white-space:normal}
#gama-excel-import-section .gxiDrop{width:100%;max-width:100%;overflow:hidden}
#gama-excel-import-section .gxiInfo{overflow-wrap:anywhere}
#gama-excel-import-section select{width:100%;max-width:100%}
@media(max-width:800px){
  #gama-excel-import-section{padding:12px!important;width:100%!important}
  #gama-excel-import-section>.card{padding:12px!important}
  #gama-excel-import-section .gxiHead h2{font-size:24px!important}
  #gama-excel-import-section .gxiSteps{display:grid!important;grid-template-columns:1fr 1fr!important;gap:6px!important}
  #gama-excel-import-section .gxiStep{width:auto!important;font-size:11px!important;padding:9px 7px!important}
  #gama-excel-import-section .gxiGrid{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:10px!important}
  #gama-excel-import-section .gxiTypes{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:8px!important}
  #gama-excel-import-section .gxiCard{padding:12px!important}
  #gama-excel-import-section .gxiDrop{padding:20px 10px!important}
  #gama-excel-import-section .gxiActions{width:100%;display:flex!important}
  #gama-excel-import-section .gxiActions button{max-width:100%;white-space:normal}
}
`;
    document.head.appendChild(s);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',install,{once:true}); else install();
  new MutationObserver(install).observe(document.documentElement,{childList:true,subtree:true});
})();