/* GAMA — Navigation centrale v3: mobile-first menu matching GAMA reference */
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

  // Order intentionally mirrors the requested reference layout.
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
    ['Matriz comercial','reports','chart','admin,commercial'],
    ['Importar Excel','excel-import','sheet','admin,commercial','reports'],
    ['Configuración','settings','gear','admin'],
    ['Copias de seguridad','backup','cloud','admin'],
    ['Usuarios','users','user','admin'],
    ['Códigos de barras','barcode','barcode','admin,commercial,magasinier'],
    ['Catálogo de productos','client-catalog','catalog','admin,commercial,client'],
    ['Solicitudes de clientes','customer-requests','request','admin,commercial']
  ];

  function role(){try{return JSON.parse(localStorage.getItem('gama_session_v1')||'null')?.role||''}catch(_){return ''}}
  function allowed(rules){const r=role();return rules==='*'||rules.split(',').includes(r)}

  function open(id){
    if(typeof window.showTab!=='function') return false;
    const target=id==='excel-import'?'reports':id;
    const ok=window.showTab(target,null);
    if(!ok) return false;
    if(target==='client-catalog') window.GamaOpenClientCatalog?.();
    if(target==='customer-requests') window.GamaOpenCustomerRequests?.();
    return true;
  }

  function style(){
    if(document.getElementById('gamaMenuStyle'))return;
    const s=document.createElement('style');s.id='gamaMenuStyle';
    s.textContent=`
      #mainmenu{background:#f7f9fa!important;min-height:calc(100vh - 1px);padding-bottom:24px!important}
      #mainmenu .gamaF2Heading{margin:28px 18px 6px!important;color:#173246!important;font-size:28px!important;line-height:1.12!important;font-weight:850!important;letter-spacing:-.5px!important}
      #mainmenu .gamaF2Subheading{margin:0 18px 24px!important;color:#7b8992!important;font-size:15px!important;line-height:1.35!important}
      #mainmenu .gamaF2Grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px;padding:0 18px 24px}
      #mainmenu .gamaF2Card{appearance:none;-webkit-appearance:none;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:190px;padding:22px 12px;margin:0;background:#fff;border:1px solid #e4ebee;border-radius:22px;box-shadow:0 4px 18px #18324a0d;color:#173246;cursor:pointer;transition:transform .15s,box-shadow .15s}
      #mainmenu .gamaF2Card:hover{transform:translateY(-2px);box-shadow:0 8px 24px #18324a16}
      #mainmenu .gamaF2Icon{display:flex;align-items:center;justify-content:center;width:82px;height:82px;border-radius:21px;background:#eaf6f7;color:#087c8b;margin-bottom:18px;flex:0 0 auto}
      #mainmenu .gamaF2Icon svg{width:43px;height:43px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      #mainmenu .gamaF2Title{font-size:17px;font-weight:850;line-height:1.22;text-align:center;color:#173246}
      @media(max-width:900px){#mainmenu .gamaF2Grid{grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:0 14px 22px}}
      @media(max-width:600px){
        #mainmenu .gamaF2Heading{margin:26px 18px 7px!important;font-size:29px!important}
        #mainmenu .gamaF2Subheading{margin:0 18px 26px!important;font-size:15px!important}
        #mainmenu .gamaF2Grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;padding:0 14px 28px}
        #mainmenu .gamaF2Card{min-height:246px;padding:18px 8px;border-radius:24px}
        #mainmenu .gamaF2Icon{width:94px;height:94px;border-radius:22px;margin-bottom:20px}
        #mainmenu .gamaF2Icon svg{width:50px;height:50px;stroke-width:1.7}
        #mainmenu .gamaF2Title{font-size:17px;line-height:1.25}
      }
    `;
    document.head.appendChild(s)
  }

  function card(item){
    const b=document.createElement('button');b.type='button';b.className='gamaF2Card';b.dataset.gamaModule=item[1];
    const icon=document.createElement('span');icon.className='gamaF2Icon';icon.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[item[2]]+'</svg>';
    const label=document.createElement('span');label.className='gamaF2Title';label.textContent=item[0];
    b.append(icon,label);b.onclick=()=>open(item[1]);return b
  }

  function render(){
    const host=document.getElementById('mainmenu');if(!host)return;style();const r=role();host.replaceChildren();
    const h=document.createElement('h2');h.className='gamaF2Heading';h.textContent='Menú principal';
    const p=document.createElement('p');p.className='gamaF2Subheading';p.textContent='Acceso rápido a las funciones de GAMA Stock Manager.';
    const grid=document.createElement('div');grid.className='gamaF2Grid';
    if(r)ITEMS.filter(x=>allowed(x[3])).forEach(x=>grid.appendChild(card(x)));
    host.append(h,p,grid);window.dispatchEvent(new CustomEvent('gama:menu-ready'))
  }
  function init(){if(window.GamaMenu)return;window.GamaMenu={render,open};render();window.addEventListener('gama:auth-ready',render);window.addEventListener('gama:auth-change',()=>setTimeout(render,0))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
