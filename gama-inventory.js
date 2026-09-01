/* GAMA Inventory bounded-context facade. */
(function(){
  'use strict';
  const api = {
    openMovement: (...a)=>window.GamaLegacyCore?.openMovement?.(...a),
    auditMovement: (...a)=>window.GamaLegacyCore?.auditMovement?.(...a),
    registerMovement: (...a)=>window.GamaLegacyCore?.registerMovement?.(...a),
    searchProduct: (...a)=>window.GamaLegacyCore?.searchProduct?.(...a)
  };
  window.GamaInventory = Object.freeze(api);
  window.GamaInventoryReady = true;
})();
