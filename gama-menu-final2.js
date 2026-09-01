/* GAMA — Navigation centrale v1 */
(function () {
  'use strict';
  if (window.GamaMenu) return;

  const ICONS = {
    chart:'<path d="M4 19V10m5 9V6m5 13v-8m5 8V3"/><path d="m4 9 5-4 5 3 6-6"/>',
    cube:'<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M15 14c3 0 5 1.5 6 4"/>',
    move:'<path d="M7 4v16M17 20V4M4 7l3-3 3 3M14 17l3 3 3-3"/>',
    invoice:'<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
    stock:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
    audit:'<path d="M12 3 20 6v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/>',
    truck:'<path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/>',
    cart:'<path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h7.4a2 2 0 0 0 1.9-1.4L20 8H6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    sheet:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>',
    gear:'<circle cx="12" cy="12" r="3"/><path d="M19 12h2M3 12h2M12 3v2M12 19v2M18 6l-2 2M8 16l-2 2M18 18l-2-2M8 8 6 6"/>',
    cloud:'<path d="M7 18h11a4 4 0 0 0 .5-8 6 6 0 0 0-11.6 1A3.5 3.5 0 0 0 7 18Z"/><path d="M12 12v6m0 0-2-2m2 2 2-2"/>',
    user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 21c0-4 3-6 7-6s7 2 7 6"/>',
    barcode:'<path d="M4 5v14M7 5v14M10 5v14M14 5v14M17 5v14M20 5v14"/>',
    catalog:'<path d="M3.5 5.5h2l1.7 9.2a1.8 1.8 0 0 0 1.8 1.5h7.8a1.8 1.8 0 0 0 1.7-1.3L20.2 9H7"/><circle cx="9" cy="19" r="1.2"/><circle cx="17" cy="19" r="1.2"/>',
    request:'<rect x="6" y="3.5" width="12" height="17" rx="1.8"/><path d="M9 3.5h6v2H9zM9 9h6M9 12.5h6M9 16h4"/>'
  };

  const ITEMS = [
    ['Panel de control','dashboard','chart','*'],
    ['Productos','products','cube','*'],
    ['Clientes','clients','users','admin,commercial'],
    ['Entradas / Salidas','movement','move','admin,commercial,magasinier'],
    ['Facturación','billing','invoice','admin,commercial'],
    ['Inventario','stock','stock','admin,commercial,magasinier'],
    ['Auditoría','audit','audit','admin'],
    ['Proveedores','suppliers','truck','admin,commercial'],
    ['Compras','gamaPurchasesV14','cart','admin,commercial'],
    ['Importar Excel','reports','sheet','admin,commercial'],
    ['Configuración','settings','gear','admin'],
    ['Copias de seguridad','backup','cloud','admin'],
    ['Usuarios','users','user','admin'],
    ['Códigos de barras','barcode','barcode','admin,commercial,magasinier'],
    ['Catálogo de productos','client-catalog','catalog','admin,commercial,client'],
    ['Solicitudes de clientes','customer-requests','request','admin,commercial']
  ];

  function role() {
    try { return JSON.parse(localStorage.getItem('gama_session_v1') || 'null')?.role || ''; }
    catch (_) { return ''; }
  }
  function allowed(itemRole) {
    const r = role();
    return itemRole === '*' || itemRole.split(',').includes(r);
  }
  function show(id) {
    if (typeof window.showTab !== 'function') return false;
    return window.showTab(id, null);
  }
  function lazy(name, src, open) {
    if (typeof window[name] === 'function') return window[name]();
    const id = 'gama-lazy-' + name;
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id; s.src = src; s.async = false;
      s.onload = () => typeof window[name] === 'function' && window[name]();
      s.onerror = () => console.error('[GAMA] Module unavailable:', src);
      document.head.appendChild(s);
    } else if (open) setTimeout(open, 50);
    return true;
  }
  function open(id) {
    if (id === 'client-catalog') return lazy('GamaOpenClientCatalog','gama-client-catalog.js?v=6',()=>window.GamaOpenClientCatalog?.());
    if (id === 'customer-requests') return lazy('GamaOpenCustomerRequests','gama-customer-requests.js?v=3',()=>window.GamaOpenCustomerRequests?.());
    return show(id);
  }
  function style() {
    if (document.getElementById('gamaMenuStyle')) return;
    const s = document.createElement('style'); s.id = 'gamaMenuStyle';
    s.textContent = `#mainmenu .gamaF2Grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;padding:12px 18px 24px}#mainmenu .gamaF2Card{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:150px;padding:18px 10px;margin:0;background:#fff;border:1px solid #e1e9ec;border-radius:18px;box-shadow:0 5px 18px #18324a12;color:#173246;cursor:pointer;transition:.15s}#mainmenu .gamaF2Card:hover{transform:translateY(-2px);box-shadow:0 8px 24px #18324a18}#mainmenu .gamaF2Icon{display:flex;align-items:center;justify-content:center;width:62px;height:62px;border-radius:18px;background:#e8f5f6;color:#087c8b;margin-bottom:12px}#mainmenu .gamaF2Icon svg{width:33px;height:33px;fill:none;stroke:currentColor;stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round}#mainmenu .gamaF2Title{font-size:15px;font-weight:800;line-height:1.2;text-align:center}@media(max-width:900px){#mainmenu .gamaF2Grid{grid-template-columns:repeat(3,minmax(0,1fr))}}@media(max-width:600px){#mainmenu .gamaF2Grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:10px}#mainmenu .gamaF2Card{min-height:140px;padding:14px 7px}}`;
    document.head.appendChild(s);
  }
  function card(item) {
    const b=document.createElement('button'); b.type='button'; b.className='gamaF2Card'; b.dataset.gamaModule=item[1];
    const icon=document.createElement('span'); icon.className='gamaF2Icon';
    icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[item[2]]+'</svg>';
    const label=document.createElement('span'); label.className='gamaF2Title'; label.textContent=item[0];
    b.append(icon,label); b.onclick=()=>open(item[1]); return b;
  }
  function render() {
    const host=document.getElementById('mainmenu'); if(!host)return;
    style();
    const r=role();
    host.replaceChildren();
    const h=document.createElement('h2'); h.textContent='Menú principal'; h.style.cssText='margin:22px 18px 8px;color:#173246;font-size:28px';
    const p=document.createElement('p'); p.textContent='Acceso rápido a las funciones de GAMA Stock Manager.'; p.style.cssText='margin:0 18px 14px;color:#7b8891;font-size:14px';
    const grid=document.createElement('div'); grid.className='gamaF2Grid';
    if(r) ITEMS.filter(x=>allowed(x[3])).forEach(x=>grid.appendChild(card(x)));
    host.append(h,p,grid);
    window.dispatchEvent(new CustomEvent('gama:menu-ready'));
  }
  function init(){
    if(window.GamaMenu) return;
    window.GamaMenu={render,open};
    render();
    window.addEventListener('gama:auth-ready',render);
    window.addEventListener('gama:auth-change',()=>setTimeout(render,0));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true}); else init();
})();