/* GAMA — stable settings section fallback */
(function(){
  'use strict';
  function mount(){
    let s=document.getElementById('settings');
    if(!s){s=document.createElement('section');s.id='settings';s.hidden=true;s.style.display='none';(document.querySelector('.wrap')||document.body).appendChild(s)}
    if(s.dataset.gamaSettingsRendered==='1')return s;
    s.innerHTML='<div class="card"><h2>⚙️ Configuración</h2><p>Configuración general de GAMA Stock Manager.</p><div style="display:grid;gap:10px;max-width:620px"><label>Nombre de la empresa<input id="gamaSettingCompany" type="text" placeholder="GAMA"></label><label>Moneda<select id="gamaSettingCurrency"><option>EUR</option><option>USD</option><option>GBP</option></select></label><button type="button" class="primary" id="gamaSettingSave">Guardar configuración</button><div id="gamaSettingMsg"></div></div></div>';
    const saved=JSON.parse(localStorage.getItem('gama_settings_v1')||'{}');const company=document.getElementById('gamaSettingCompany'),currency=document.getElementById('gamaSettingCurrency');if(company)company.value=saved.company||'';if(currency)currency.value=saved.currency||'EUR';document.getElementById('gamaSettingSave').onclick=()=>{localStorage.setItem('gama_settings_v1',JSON.stringify({company:company.value,currency:currency.value}));document.getElementById('gamaSettingMsg').textContent='✓ Configuración guardada.'};s.dataset.gamaSettingsRendered='1';return s;
  }
  window.GamaEnsureSettings=mount;mount();
})();
