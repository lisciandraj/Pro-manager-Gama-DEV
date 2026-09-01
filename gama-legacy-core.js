/*
 * GAMA Stock Manager V10 — extracted legacy business core
 *
 * Transitional module: keeps the existing DOM contract and global handlers
 * while removing business logic from index.html in a controlled step.
 * Next cleanup stages can split this file by bounded context.
 */
(function () {
  'use strict';

  if (typeof db === 'undefined' || typeof $ !== 'function') {
    console.warn('[GAMA legacy core] database runtime not ready');
    return;
  }

  function product(barcode) {
    return db.products.find(p => p.barcode === barcode);
  }

  function uid(prefix = 'MOV') {
    return prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase();
  }

  function save() {
    localStorage.setItem('stock_manager_v6_ecuador', JSON.stringify(db));
    renderAll();
  }

  function showTab(id, btn) {
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    const target = $(id);
    if (target) target.classList.add('active');
    const back = $('globalBack');
    if (back) back.style.display = id === 'mainmenu' ? 'none' : 'grid';
    renderAll();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function openMovement(type) {
    showTab('movement', null);
    $('moveType').value = type;
    $('moveBarcode').focus();
  }

  async function compressPhoto(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const max = 700;
          const scale = Math.min(1, max / image.width, max / image.height);
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(image.width * scale);
          canvas.height = Math.round(image.height * scale);
          canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        image.onerror = reject;
        image.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function createProduct() {
    const editing = $('editingBarcode').value;
    const barcode = $('pBarcode').value.trim();
    const name = $('pName').value.trim();
    if (!barcode || !name) return alert('El código de barras y el nombre son obligatorios.');
    if (!editing && product(barcode)) return alert('Este código de barras ya existe.');

    const old = editing ? product(editing) : null;
    let photo = old?.photo || '';
    if ($('pPhoto').files[0]) photo = await compressPhoto($('pPhoto').files[0]);

    const data = {
      barcode,
      name,
      ref: $('pRef').value.trim(),
      cat: $('pCat').value.trim(),
      loc: $('pLoc').value.trim(),
      min: Number($('pMin').value) || 0,
      price: Number($('pPrice').value) || 0,
      iva: Number($('pIva').value),
      photo
    };

    if (old) {
      Object.assign(old, data);
      alert('Producto actualizado correctamente.');
    } else {
      db.products.push({ ...data, stock: 0 });
      alert('Producto creado correctamente.');
    }
    clearProductForm();
    save();
  }

  function editProduct(barcode) {
    const p = product(barcode);
    if (!p) return;
    $('editingBarcode').value = p.barcode;
    $('pBarcode').value = p.barcode;
    $('pName').value = p.name;
    $('pRef').value = p.ref || '';
    $('pCat').value = p.cat || '';
    $('pLoc').value = p.loc || '';
    $('pMin').value = p.min || 0;
    $('pPrice').value = p.price || 0;
    $('pIva').value = p.iva ?? 15;
    if (p.photo) {
      $('pPreview').src = p.photo;
      $('pPreview').style.display = 'block';
    }
    showTab('products', null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearProductForm() {
    $('editingBarcode').value = '';
    ['pBarcode', 'pName', 'pRef', 'pCat', 'pLoc'].forEach(id => $(id).value = '');
    $('pMin').value = 0;
    $('pPrice').value = 0;
    $('pIva').value = 15;
    $('pPhoto').value = '';
    $('pPreview').src = '';
    $('pPreview').style.display = 'none';
  }

  function deleteProduct(barcode) {
    const p = product(barcode);
    if (!p) return;
    if (p.stock !== 0) return alert('No se puede eliminar un producto con stock. Primero deja el stock en 0.');
    if (!confirm(`¿Eliminar "${p.name}" de la lista de productos?`)) return;
    db.products = db.products.filter(x => x.barcode !== barcode);
    save();
    alert('Producto eliminado.');
  }

  function renderProducts(filter = '') {
    const q = filter.toLowerCase();
    const rows = db.products.filter(p => (p.name + ' ' + p.barcode + ' ' + p.ref + ' ' + p.cat).toLowerCase().includes(q));
    $('productsTable').innerHTML = '<table><tr><th>Foto</th><th>Código</th><th>Producto</th><th>Stock</th><th>Precio USD</th><th>IVA</th><th>Ubicación</th><th>Acciones</th></tr>' +
      rows.map(p => `<tr><td>${p.photo ? `<img class="product-img" src="${p.photo}">` : '📦'}</td><td>${p.barcode}</td><td>${p.name}</td><td class="${p.stock <= p.min ? 'low' : ''}">${p.stock}</td><td><b>$${Number(p.price || 0).toFixed(2)}</b></td><td>${Number(p.iva || 0)}%</td><td>${p.loc || '-'}</td><td><button class="secondary" onclick="editProduct('${p.barcode}')">✏️ Editar</button> <button class="danger" onclick="deleteProduct('${p.barcode}')">🗑️ Eliminar</button></td></tr>`).join('') + '</table>';
  }

  function saveClient() {
    const name = $('cName').value.trim();
    const id = $('cId').value.trim();
    if (!name || !id) return alert('El nombre y la identificación son obligatorios.');
    const editing = $('editingClientId').value;
    if (!editing && db.clients.some(c => c.id === id)) return alert('Ya existe un cliente con esta identificación.');

    const data = {
      name,
      id,
      idType: $('cIdType').value,
      address: $('cAddress').value.trim(),
      phone: $('cPhone').value.trim(),
      email: $('cEmail').value.trim(),
      city: $('cCity').value.trim(),
      province: $('cProvince').value.trim(),
      notes: $('cNotes').value.trim()
    };

    const client = editing ? db.clients.find(x => x.id === editing) : null;
    if (client) {
      Object.assign(client, data);
      alert('Cliente actualizado.');
    } else {
      db.clients.push(data);
      alert('Cliente guardado.');
    }
    clearClientForm();
    save();
  }

  function editClient(id) {
    const c = db.clients.find(x => x.id === id);
    if (!c) return;
    $('editingClientId').value = c.id;
    $('cName').value = c.name;
    $('cId').value = c.id;
    $('cIdType').value = c.idType || 'RUC';
    $('cAddress').value = c.address || '';
    $('cPhone').value = c.phone || '';
    $('cEmail').value = c.email || '';
    $('cCity').value = c.city || '';
    $('cProvince').value = c.province || '';
    $('cNotes').value = c.notes || '';
    showTab('clients', null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function clearClientForm() {
    ['cName', 'cId', 'cAddress', 'cPhone', 'cEmail', 'cCity', 'cProvince', 'cNotes', 'editingClientId'].forEach(id => $(id).value = '');
    $('cIdType').value = 'RUC';
  }

  function deleteClient(id) {
    if (!confirm('¿Eliminar este cliente?')) return;
    db.clients = db.clients.filter(c => c.id !== id);
    save();
  }

  function renderClients(filter = '') {
    const q = (filter || '').toLowerCase();
    const rows = db.clients.filter(c => (c.name + ' ' + c.id + ' ' + c.city + ' ' + c.province + ' ' + c.email).toLowerCase().includes(q));
    $('clientsTable').innerHTML = '<table><tr><th>Cliente</th><th>Identificación</th><th>Dirección</th><th>Ciudad</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr>' +
      rows.map(c => `<tr><td><b>${c.name}</b></td><td>${c.idType || ''} ${c.id}</td><td>${c.address || '-'}</td><td>${c.city || '-'}</td><td>${c.phone || '-'}</td><td>${c.email || '-'}</td><td><button class="secondary" onclick="editClient('${c.id}')">✏️ Editar</button> <button class="danger" onclick="deleteClient('${c.id}')">🗑️</button></td></tr>`).join('') + '</table>';
  }

  function populateClientSelect() {
    const current = $('clientSelect').value;
    $('clientSelect').innerHTML = '<option value="">Selecciona un cliente...</option>' + db.clients.map(c => `<option value="${c.id}">${c.name} — ${c.id}</option>`).join('');
    if (current && db.clients.some(c => c.id === current)) $('clientSelect').value = current;
  }

  function selectClientForInvoice() {
    const c = db.clients.find(x => x.id === $('clientSelect').value);
    $('clientId').value = c ? c.id : '';
    $('clientName').value = c ? c.name : '';
    $('clientAddress').value = c ? c.address || '' : '';
    $('clientEmail').value = c ? c.email || '' : '';
  }

  function auditMovement({ p, type, qty, user, reason, comment, source = 'IN/OUT', reference = '' }) {
    const before = p.stock;
    const after = type === 'IN' ? before + qty : before - qty;
    const id = uid();
    db.moves.unshift({ id, date: new Date().toISOString(), type, barcode: p.barcode, name: p.name, qty, user: user || 'Admin', reason, comment: comment || '', source, reference, stockBefore: before, stockAfter: after });
    p.stock = after;
    return id;
  }

  function registerMovement() {
    const p = product($('moveBarcode').value.trim());
    const qty = Number($('moveQty').value);
    if (!p) return alert('Producto no encontrado.');
    if (qty < 1) return alert('Cantidad inválida.');
    if ($('moveType').value === 'OUT' && p.stock < qty) return alert(`Stock insuficiente. Disponible: ${p.stock}`);
    auditMovement({ p, type: $('moveType').value, qty, user: $('moveUser').value, reason: $('moveReason').value, comment: $('moveComment').value, source: 'IN/OUT' });
    $('moveInfo').textContent = `${p.name} — stock actual: ${p.stock}`;
    save();
    alert('Movimiento registrado en el Audit Trail.');
  }

  function searchProduct() {
    const p = product($('homeBarcode').value.trim());
    $('homeResult').innerHTML = p ? `<p><b>${p.name}</b><br>Stock: ${p.stock}<br>Precio: $${Number(p.price || 0).toFixed(2)}<br>${p.photo ? `<img class="product-img" src="${p.photo}">` : ''}</p>` : '<p class="low">Producto no encontrado.</p>';
  }

  function addInvoiceItem() {
    const p = product($('invoiceBarcode').value.trim());
    const q = Number($('invoiceQty').value);
    if (!p) return alert('Producto no encontrado.');
    if (q < 1) return alert('Cantidad inválida.');
    const already = invoiceItems.reduce((a, x) => a + x.q * (x.p.barcode === p.barcode), 0);
    if (p.stock < already + q) return alert(`Stock insuficiente. Disponible: ${p.stock}`);
    invoiceItems.push({ p, q });
    $('invoiceBarcode').value = '';
    $('invoiceProductInfo').textContent = '';
    renderInvoiceItems();
  }

  function renderInvoiceItems() {
    $('invoiceItems').innerHTML = '<table><tr><th>Foto</th><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th><th></th></tr>' +
      invoiceItems.map((x, i) => `<tr><td>${x.p.photo ? `<img class="product-img" src="${x.p.photo}">` : '📦'}</td><td>${x.p.name}</td><td>${x.q}</td><td>$${Number(x.p.price || 0).toFixed(2)}</td><td>$${(x.q * Number(x.p.price || 0)).toFixed(2)}</td><td><button class="danger" onclick="removeInvoiceItem(${i})">×</button></td></tr>`).join('') + '</table>';
  }

  function removeInvoiceItem(i) {
    invoiceItems.splice(i, 1);
    renderInvoiceItems();
  }

  function generateInvoice() {
    if (!$('sellerRuc').value || !$('sellerName').value) return alert('Completa el RUC y la razón social.');
    if (!$('clientId').value || !$('clientName').value) return alert('Completa los datos del cliente.');
    if (!invoiceItems.length) return alert('Añade al menos un producto.');

    const sub = invoiceItems.reduce((a, x) => a + x.q * Number(x.p.price || 0), 0);
    const rate = 15;
    const tax = sub * rate / 100;
    const total = sub + tax;
    const number = ($('sellerEst').value || '001') + '-' + ($('sellerPoint').value || '001') + '-' + String(db.invoices.length + 1).padStart(9, '0');
    const ref = uid('FAC');
    const inv = { id: ref, number, date: new Date().toISOString(), clientId: $('clientId').value, client: $('clientName').value, items: invoiceItems.map(x => ({ name: x.p.name, barcode: x.p.barcode, qty: x.q, price: Number(x.p.price || 0) })), sub, tax, total, rate, pay: $('payment').value };

    for (const x of invoiceItems) if (x.p.stock < x.q) return alert(`Stock insuficiente para ${x.p.name}`);
    for (const x of invoiceItems) auditMovement({ p: x.p, type: 'OUT', qty: x.q, user: 'Admin', reason: 'Venta', comment: 'Salida generada por factura ' + number, source: 'Facturación', reference: number });
    db.invoices.unshift(inv);
    $('invoicePreview').innerHTML = invoiceHTML(inv);
    invoiceItems = [];
    renderInvoiceItems();
    save();
    alert('Factura generada y salidas de stock registradas en el Audit Trail.');
  }

  function invoiceHTML(i) {
    return `<div class="invoice-preview"><h2>FACTURA</h2><b>${$('sellerName').value}</b><br>RUC: ${$('sellerRuc').value}<br>No. ${i.number}<br>Fecha: ${new Date(i.date).toLocaleDateString('es-EC')}<hr><b>Cliente:</b> ${i.client}<br>Identificación: ${i.clientId}<br>${$('clientAddress').value || ''}<br>${$('clientEmail').value || ''}<table><tr><th>Producto</th><th>Cant.</th><th>Precio</th><th>Subtotal</th></tr>${i.items.map(x => `<tr><td>${x.name}</td><td>${x.qty}</td><td>$${x.price.toFixed(2)}</td><td>$${(x.qty * x.price).toFixed(2)}</td></tr>`).join('')}</table><div class="totals"><div><span>Subtotal</span><span>$${i.sub.toFixed(2)}</span></div><div><span>IVA ${i.rate}%</span><span>$${i.tax.toFixed(2)}</span></div><div class="grand"><span>TOTAL</span><span>$${i.total.toFixed(2)}</span></div></div><p>Forma de pago: ${i.pay}</p></div>`;
  }

  function printInvoice() {
    if (!$('invoicePreview').innerHTML) return alert('Genera primero la factura.');
    window.print();
  }

  function renderAudit() {
    const q = ($('auditSearch').value || '').toLowerCase();
    const type = $('auditType').value;
    const rows = db.moves.filter(m => (!type || m.type === type) && (!q || [m.id, m.barcode, m.name, m.user, m.reason, m.comment, m.source, m.reference].join(' ').toLowerCase().includes(q)));
    $('auditTable').innerHTML = '<table><tr><th>ID</th><th>Fecha/hora</th><th>Tipo</th><th>Producto</th><th>Código</th><th>Cant.</th><th>Antes</th><th>Después</th><th>Usuario</th><th>Motivo</th><th>Origen</th><th>Referencia</th><th>Comentario</th></tr>' +
      rows.map(m => `<tr><td class="audit">${m.id}</td><td>${new Date(m.date).toLocaleString('es-EC')}</td><td class="${m.type === 'IN' ? 'in' : 'out'}">${m.type}</td><td>${m.name}</td><td>${m.barcode}</td><td>${m.qty}</td><td>${m.stockBefore}</td><td>${m.stockAfter}</td><td>${m.user}</td><td>${m.reason}</td><td><span class="badge">${m.source}</span></td><td>${m.reference || '-'}</td><td>${m.comment || '-'}</td></tr>`).join('') + '</table>';
  }

  function createCorrection() {
    const barcode = prompt('Código de barras del producto a corregir:');
    if (!barcode) return;
    const p = product(barcode);
    if (!p) return alert('Producto no encontrado.');
    const target = Number(prompt(`Stock actual: ${p.stock}. ¿Cuál debe ser el stock correcto?`));
    if (!Number.isFinite(target) || target < 0) return alert('Valor inválido.');
    const delta = target - p.stock;
    if (delta === 0) return alert('No hay diferencia de stock.');
    const type = delta > 0 ? 'IN' : 'OUT';
    const comment = prompt('Motivo obligatorio de la corrección:') || '';
    if (!comment) return alert('La corrección requiere un comentario.');
    if (type === 'OUT' && p.stock < Math.abs(delta)) return alert('Stock insuficiente.');
    auditMovement({ p, type, qty: Math.abs(delta), user: 'Admin', reason: 'Corrección de inventario', comment, source: 'Corrección auditada' });
    save();
    alert('Corrección registrada como nuevo evento. El movimiento anterior no fue modificado.');
  }

  function renderDonut(id, legendId, data) {
    const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      $(id).style.background = '#dfe8eb';
      $(legendId).innerHTML = '<div class="muted">Sin datos</div>';
      return;
    }
    const total = entries.reduce((a, x) => a + x[1], 0);
    const colors = ['#F47A2A', '#087C8B', '#5FA6B2', '#9BC8D0', '#D8E6E9'];
    let current = 0;
    const stops = entries.map((x, i) => {
      const start = current;
      current += x[1] / total * 100;
      return `${colors[i % colors.length]} ${start}% ${current}%`;
    }).join(',');
    $(id).style.background = `conic-gradient(${stops})`;
    $(legendId).innerHTML = entries.slice(0, 5).map(x => `<div><span>${x[0]}</span><b>${Math.round(x[1] / total * 100)}%</b></div>`).join('');
  }

  function dashMoney(n) {
    return '$' + Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function dashMonths(year) {
    const values = Array(12).fill(0);
    db.invoices.forEach(i => {
      const d = new Date(i.date);
      if (d.getFullYear() === year) values[d.getMonth()] += Number(i.total || 0);
    });
    return values;
  }

  function renderDashboard() {
    if (!$('dashYear')) return;
    const years = [new Date().getFullYear(), ...db.invoices.map(i => new Date(i.date).getFullYear())].filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => b - a);
    let currentYear = Number($('dashYear').value) || new Date().getFullYear();
    $('dashYear').innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');
    if (!years.includes(currentYear)) currentYear = years[0];
    $('dashYear').value = currentYear;

    const month = $('dashMonth').value;
    const invoices = db.invoices.filter(i => {
      const d = new Date(i.date);
      return d.getFullYear() === currentYear && (month === 'all' || d.getMonth() === Number(month));
    });
    const sales = invoices.reduce((a, i) => a + Number(i.total || 0), 0);
    const average = invoices.length ? sales / invoices.length : 0;
    const months = dashMonths(currentYear);
    const yearTotal = months.reduce((a, b) => a + b, 0);

    $('dashSales').textContent = dashMoney(sales);
    $('dashInvoices').textContent = invoices.length;
    $('dashAvg').textContent = dashMoney(average);
    $('dashLow').textContent = db.products.filter(p => Number(p.stock || 0) <= Number(p.min || 0)).length;
    $('dashYearTotal').textContent = dashMoney(yearTotal);
    $('dashYearLabel').textContent = String(currentYear);
    $('sumSales').textContent = dashMoney(yearTotal);
    $('sumInvoices').textContent = db.invoices.filter(i => new Date(i.date).getFullYear() === currentYear).length;
    $('sumMonthly').textContent = dashMoney(yearTotal / 12);
    $('sumProducts').textContent = db.products.length;
    $('sumClients').textContent = db.clients.length;

    const max = Math.max(...months, 1);
    const points = months.map((v, i) => [30 + i * 60, 220 - (v / max) * 175]);
    const path = points.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
    $('chartLine').setAttribute('d', path);
    $('chartArea').setAttribute('d', path + ' L690 225 L30 225 Z');
    $('chartGrid').innerHTML = [50, 100, 150, 200].map(y => `<line class="chartGridLine" x1="30" y1="${y}" x2="690" y2="${y}"/>`).join('');
    $('chartDots').innerHTML = points.map((p, i) => `<circle class="chartDot ${month == i ? 'selected' : ''}" cx="${p[0]}" cy="${p[1]}" r="5"><title>${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i]}: ${dashMoney(months[i])}</title></circle>`).join('');
    $('chartLabels').innerHTML = points.map((p, i) => `<text class="chartLabel" x="${p[0]}" y="248" text-anchor="middle">${['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i]}</text>`).join('');

    const products = {};
    invoices.forEach(inv => (inv.items || []).forEach(x => {
      const key = x.barcode || x.name;
      if (!products[key]) products[key] = { name: x.name, qty: 0, sales: 0 };
      products[key].qty += Number(x.qty || 0);
      products[key].sales += Number(x.qty || 0) * Number(x.price || 0);
    }));
    const top = Object.values(products).sort((a, b) => b.sales - a.sales).slice(0, 5);
    $('dashTop').innerHTML = top.length ? top.map((x, i) => `<div class="dashTopRow"><span class="rank">${i + 1}</span><span>${x.name}<br><small>${x.qty} unidades</small></span><b>${dashMoney(x.sales)}</b></div>`).join('') : '<div class="muted">No hay ventas en este periodo.</div>';

    const categories = {};
    const payments = {};
    invoices.forEach(inv => {
      (inv.items || []).forEach(x => {
        const p = product(x.barcode);
        const key = p?.cat || 'Otros';
        categories[key] = (categories[key] || 0) + Number(x.qty || 0) * Number(x.price || 0);
      });
      const payment = inv.pay || 'Otros';
      payments[payment] = (payments[payment] || 0) + Number(inv.total || 0);
    });
    renderDonut('categoryDonut', 'categoryLegend', categories);
    renderDonut('paymentDonut', 'paymentLegend', payments);
    $('dashMoves').innerHTML = db.moves.slice(0, 6).map(m => `<div class="dashMove"><span class="moveIcon ${m.type === 'IN' ? 'moveIn' : 'moveOut'}">${m.type === 'IN' ? '＋' : '↗'}</span><span><b>${m.name}</b><small>${new Date(m.date).toLocaleString('es-EC')} · ${m.reason || m.source || ''}</small></span><b>${m.type === 'IN' ? '+' : '−'}${m.qty}</b></div>`).join('') || '<div class="muted">Sin movimientos.</div>';
  }

  function renderAll() {
    renderDashboard();
    renderProducts($('productSearch')?.value || '');
    renderClients($('clientSearch')?.value || '');
    populateClientSelect();
    $('stockTable').innerHTML = '<table><tr><th>Foto</th><th>Producto</th><th>Código</th><th>Stock</th><th>Precio</th><th>Estado</th></tr>' + db.products.map(p => `<tr><td>${p.photo ? `<img class="product-img" src="${p.photo}">` : '📦'}</td><td>${p.name}</td><td>${p.barcode}</td><td>${p.stock}</td><td>$${Number(p.price || 0).toFixed(2)}</td><td class="${p.stock <= p.min ? 'low' : 'ok'}">${p.stock <= p.min ? '⚠️ Stock bajo' : '✅ OK'}</td></tr>`).join('') + '</table>';
    renderAudit();
  }

  window.GamaLegacyCore = Object.freeze({
    product,
    uid,
    save,
    showTab,
    openMovement,
    createProduct,
    editProduct,
    clearProductForm,
    deleteProduct,
    renderProducts,
    saveClient,
    editClient,
    clearClientForm,
    deleteClient,
    renderClients,
    populateClientSelect,
    selectClientForInvoice,
    auditMovement,
    registerMovement,
    searchProduct,
    addInvoiceItem,
    renderInvoiceItems,
    removeInvoiceItem,
    generateInvoice,
    invoiceHTML,
    printInvoice,
    renderAudit,
    createCorrection,
    renderDashboard,
    renderAll
  });

  Object.assign(window, window.GamaLegacyCore);
  window.GamaLegacyCoreReady = true;
})();
