/* GAMA Dashboard bounded-context facade. */
(function(){
  'use strict';
  const api = {
    render: (...a)=>window.GamaLegacyCore?.renderDashboard?.(...a),
    renderDonut: (...a)=>window.GamaLegacyCore?.renderDonut?.(...a),
    months: (...a)=>window.GamaLegacyCore?.dashMonths?.(...a),
    money: (...a)=>window.GamaLegacyCore?.dashMoney?.(...a)
  };
  window.GamaDashboard = Object.freeze(api);
  window.GamaDashboardReady = true;
})();
