/* GAMA Products bounded-context facade.
 * Transitional boundary: business implementation remains in GamaLegacyCore
 * until each function is migrated here without changing the DOM contract.
 */
(function(){
  'use strict';
  const api = {
    product: (...a)=>window.GamaLegacyCore?.product?.(...a),
    create: (...a)=>window.GamaLegacyCore?.createProduct?.(...a),
    edit: (...a)=>window.GamaLegacyCore?.editProduct?.(...a),
    clearForm: (...a)=>window.GamaLegacyCore?.clearProductForm?.(...a),
    remove: (...a)=>window.GamaLegacyCore?.deleteProduct?.(...a),
    render: (...a)=>window.GamaLegacyCore?.renderProducts?.(...a)
  };
  window.GamaProducts = Object.freeze(api);
  window.GamaProductsReady = true;
})();
