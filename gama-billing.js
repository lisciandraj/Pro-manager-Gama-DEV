/* GAMA Billing bounded-context facade. */
(function(){
  'use strict';
  const api = {
    addItem: (...a)=>window.GamaLegacyCore?.addInvoiceItem?.(...a),
    renderItems: (...a)=>window.GamaLegacyCore?.renderInvoiceItems?.(...a),
    removeItem: (...a)=>window.GamaLegacyCore?.removeInvoiceItem?.(...a),
    generate: (...a)=>window.GamaLegacyCore?.generateInvoice?.(...a),
    print: (...a)=>window.GamaLegacyCore?.printInvoice?.(...a)
  };
  window.GamaBilling = Object.freeze(api);
  window.GamaBillingReady = true;
})();
