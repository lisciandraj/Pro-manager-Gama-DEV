/* GAMA legacy runtime bootstrap.
 * Owns the minimal global state that legacy business handlers still consume.
 * This is intentionally isolated so index.html contains no business runtime.
 */
(function(){
  'use strict';
  if (typeof window.$ !== 'function') {
    window.$ = id => document.getElementById(id);
  }
  if (!window.db || typeof window.db !== 'object') {
    const key = 'stock_manager_v6_ecuador';
    let data;
    try { data = JSON.parse(localStorage.getItem(key) || '{}'); } catch (_) { data = {}; }
    window.db = data && typeof data === 'object' ? data : {};
  }
  window.db.products = Array.isArray(window.db.products) ? window.db.products : [];
  window.db.moves = Array.isArray(window.db.moves) ? window.db.moves : [];
  window.db.invoices = Array.isArray(window.db.invoices) ? window.db.invoices : [];
  window.db.clients = Array.isArray(window.db.clients) ? window.db.clients : [];
  if (!Array.isArray(window.invoiceItems)) window.invoiceItems = [];
  window.GamaLegacyRuntimeReady = true;
})();

// Classic-script globals are deliberately used during this migration so the
// legacy core can be split incrementally without changing existing handlers.
var db = window.db;
var invoiceItems = window.invoiceItems;
var $ = window.$;
