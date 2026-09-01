/* GAMA Audit bounded-context facade. */
(function(){
  'use strict';
  const api = {
    render: (...a)=>window.GamaLegacyCore?.renderAudit?.(...a),
    correction: (...a)=>window.GamaLegacyCore?.createCorrection?.(...a),
    auditMovement: (...a)=>window.GamaLegacyCore?.auditMovement?.(...a)
  };
  window.GamaAudit = Object.freeze(api);
  window.GamaAuditReady = true;
})();
