/* GAMA Clients bounded-context facade. */
(function(){
  'use strict';
  const api = {
    save: (...a)=>window.GamaLegacyCore?.saveClient?.(...a),
    edit: (...a)=>window.GamaLegacyCore?.editClient?.(...a),
    clearForm: (...a)=>window.GamaLegacyCore?.clearClientForm?.(...a),
    remove: (...a)=>window.GamaLegacyCore?.deleteClient?.(...a),
    render: (...a)=>window.GamaLegacyCore?.renderClients?.(...a),
    populateInvoiceSelect: (...a)=>window.GamaLegacyCore?.populateClientSelect?.(...a),
    selectForInvoice: (...a)=>window.GamaLegacyCore?.selectClientForInvoice?.(...a)
  };
  window.GamaClients = Object.freeze(api);
  window.GamaClientsReady = true;
})();
