/* GAMA DEV bridge: keep the stable production access-control layer, then add DEV contextual Excel import. */
(function(){
'use strict';
var base='https://lisciandraj.github.io/Pro-manager-Gama/gama-access-control.js?v=20260831-stable';
function load(src,done){var s=document.createElement('script');s.src=src;s.async=false;s.onload=done;s.onerror=function(){console.warn('[GAMA DEV] Base access-control could not be loaded:',src);done()};document.head.appendChild(s)}
load(base,function(){
  var x=document.createElement('script');x.src='./gama-dev-context-excel.js?v=20260831-1';x.async=false;document.head.appendChild(x);
});
})();
