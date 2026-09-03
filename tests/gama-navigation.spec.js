const { test, expect } = require('@playwright/test');

async function openApp(page) {
  await page.addInitScript(() => { window.__GAMA_E2E__ = true; });
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
}

async function requireAuth(page) {
  await page.evaluate(() => {
    localStorage.setItem('gama_session_v1', JSON.stringify({
      userId: 'e2e-user', role: 'admin', username: 'e2e@gama.local', name: 'E2E Administrator'
    }));
    window.GamaAccessControl?.sync();
    window.dispatchEvent(new CustomEvent('gama:auth-ready'));
  });
  await expect(page.locator('#gamaAccessUser')).toBeVisible({ timeout: 10_000 });
}

async function openModule(page, moduleId) {
  const card = page.locator(`#mainmenu [data-gama-module="${moduleId}"]`);
  await expect(card).toHaveCount(1);
  await card.click();
}

async function returnToMenu(page) {
  await page.getByRole('button', { name: /Menú principal/i }).first().click();
  await expect(page.locator('#mainmenu')).toBeVisible();
  await expect(page.locator('#mainmenu')).not.toHaveAttribute('hidden');
}

test('application loads without uncaught page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openApp(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('authenticated session exposes a valid GAMA role', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const session = await page.evaluate(() => JSON.parse(localStorage.getItem('gama_session_v1') || 'null'));
  expect(session).toBeTruthy();
  expect(['admin', 'commercial', 'magasinier', 'client']).toContain(session.role);
});

test('mobile GAMA layout matches the reference header and account placement', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openApp(page);
  await requireAuth(page);

  const header = page.locator('header.gamaHeader');
  const slot = page.locator('#gamaAccountSlot');
  const bar = page.locator('#gamaAccessUser');
  const cloud = page.locator('#gamaCloudAdminBtn');

  await expect(header).toBeVisible();
  await expect(slot).toHaveCount(1);
  await expect(bar).toBeVisible();
  await expect(slot.locator('#gamaAccessUser')).toHaveCount(1);
  await expect(bar).toContainText(/Administrador|Comercial|Almacenero|Cliente/i);
  await expect(bar.locator('#gamaAccessLogout')).toBeVisible();
  await expect(bar.locator('#gamaAccessLogout')).toBeEnabled();
  await expect(page.locator('#gamaSessionBar')).toHaveCount(0);
  await expect(cloud).toBeVisible();
  await expect(header.locator('#gamaCloudAdminBtn')).toHaveCount(1);

  const headerBox = await header.boundingBox();
  const barBox = await bar.boundingBox();
  expect(headerBox).toBeTruthy();
  expect(barBox).toBeTruthy();
  expect(barBox.y).toBeGreaterThanOrEqual(headerBox.y + headerBox.height - 1);
  expect(barBox.y).toBeLessThanOrEqual(headerBox.y + headerBox.height + 30);

  const cards = page.locator('#mainmenu .gamaF2Card');
  await expect(cards).toHaveCount(17);
  const expected = [
    'Panel de control','Productos','Clientes','Entradas / Salidas','Facturación',
    'Inventario','Auditoría','Proveedores','Compras','Matriz comercial',
    'Importar Excel','Configuración','Copias de seguridad','Usuarios',
    'Códigos de barras','Catálogo de productos','Solicitudes de clientes'
  ];
  await expect(cards.evaluateAll(nodes => nodes.map(n => n.textContent.trim()))).resolves.toEqual(expected);

  const first = await cards.nth(0).boundingBox();
  const second = await cards.nth(1).boundingBox();
  const third = await cards.nth(2).boundingBox();
  expect(first).toBeTruthy();
  expect(second).toBeTruthy();
  expect(third).toBeTruthy();
  expect(Math.abs(first.y - second.y)).toBeLessThan(3);
  expect(third.y).toBeGreaterThan(first.y + first.height - 3);
  expect(first.width).toBeGreaterThan(150);
  expect(first.height).toBeGreaterThanOrEqual(230);
  expect(first.width / first.height).toBeLessThan(1.8);
});

test('admin can open cloud accounts and create a client account', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  await page.locator('#gamaCloudAdminBtn').click();
  await expect(page.locator('#gamaCloudAdmin')).toBeVisible();
  await expect(page.locator('#gamaCloudAdmin')).toContainText('Crear una cuenta');
  await expect(page.locator('#gamaCloudAdmin [name="role"] option[value="cliente"]')).toHaveCount(1);
  await expect(page.locator('#gamaCloudAdmin [name="role"]')).toHaveValue('cliente');

  await page.evaluate(() => {
    const cloud = window.GamaCloud;
    cloud.getSession = async () => ({data:{session:{access_token:'e2e-token'}}});
    cloud.list = async () => ({data:[],error:null});
  });
  let requestBody = null;
  await page.route('**/functions/v1/gama-admin-users', async route => {
    requestBody = JSON.parse(route.request().postData() || '{}');
    await route.fulfill({status:201,contentType:'application/json',body:JSON.stringify({id:'e2e-client',email:requestBody.email,full_name:requestBody.full_name,role:requestBody.role})});
  });

  await page.locator('#gamaCloudAdmin [name="full_name"]').fill('Cliente E2E');
  await page.locator('#gamaCloudAdmin [name="email"]').fill('cliente-e2e@example.com');
  await page.locator('#gamaCloudAdmin [name="password"]').fill('E2Esecure123!');
  await page.locator('#gamaCloudAdmin [name="role"]').selectOption('cliente');
  await page.locator('#gamaCreateSubmit').click();

  await expect(page.locator('[data-create-status]')).toContainText('Cuenta creada correctamente');
  expect(requestBody).toEqual({full_name:'Cliente E2E',email:'cliente-e2e@example.com',password:'E2Esecure123!',role:'cliente'});
});

test('logout removes the header user bar and returns to cloud login', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const logout = page.locator('#gamaAccessLogout');
  await expect(logout).toBeVisible();
  await logout.click({force:true});
  await expect(page.locator('#gamaAccessUser')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.locator('#gamaCloudLogin')).toBeVisible({ timeout: 15_000 });
  const session = await page.evaluate(() => localStorage.getItem('gama_session_v1'));
  expect(session).toBeNull();
});

test('authenticated main menu exposes unique modules', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const modules = ['dashboard','products','clients','movement','billing','stock','audit','suppliers','gamaPurchasesV14','reports','settings','backup','users','barcode','client-catalog','customer-requests'];
  for (const moduleId of modules) await expect(page.locator(`#mainmenu [data-gama-module="${moduleId}"]`)).toHaveCount(1);
});

test('all modules follow the same open -> close -> reopen lifecycle', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const modules = [
    ['dashboard','#dashboard'],['products','#products'],['clients','#clients'],['movement','#movement'],['billing','#billing'],
    ['stock','#stock'],['audit','#audit'],['suppliers','#suppliers'],['gamaPurchasesV14','#gamaPurchasesV14'],['reports','#reports'],
    ['settings','#settings'],['backup','#backup'],['users','#users'],['barcode','#barcode'],['client-catalog','#client-catalog'],['customer-requests','#customer-requests']
  ];

  for (const [moduleId, section] of modules) {
    for (let pass = 0; pass < 2; pass += 1) {
      await openModule(page, moduleId);
      await expect(page.locator(section)).toHaveCount(1);
      await expect(page.locator(section)).toHaveClass(/active/);
      await expect(page.locator(section)).not.toHaveAttribute('hidden');
      await expect(page.locator(section)).toBeVisible();
      await expect(page.locator('#mainmenu')).toHaveAttribute('hidden', '');
      await returnToMenu(page);
    }
  }
});

test('navigation never leaves multiple active sections', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const modules = ['products','clients','movement','billing','stock','audit','suppliers','reports','settings','backup','users','barcode','client-catalog','customer-requests'];
  for (const moduleId of modules) {
    await openModule(page, moduleId);
    await expect(page.locator('section.active')).toHaveCount(1);
    await returnToMenu(page);
    await expect(page.locator('section.active')).toHaveCount(1);
  }
});

test('client catalog exposes search, cart and submit controls', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  await openModule(page, 'client-catalog');
  await expect(page.locator('#client-catalog')).toBeVisible();
  await expect(page.locator('#ccSearch')).toBeVisible();
  await expect(page.locator('#ccCartRows')).toBeVisible();
  await expect(page.locator('#ccNotes')).toBeVisible();
  await expect(page.locator('#ccSend')).toBeVisible();
  await expect(page.locator('#ccTotal')).toBeVisible();
  await page.locator('#ccSearch').fill('producto-e2e-inexistente');
  await expect(page.locator('#ccProducts')).toContainText(/Aucun produit trouvé/i);
  await page.locator('#ccSend').click();
  await expect(page.locator('#ccMsg')).toContainText(/Añada al menos un producto/i);
  await returnToMenu(page);
});

test('customer request module exposes search and request detail workflow', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  await openModule(page, 'customer-requests');
  await expect(page.locator('#customer-requests')).toBeVisible();
  await expect(page.locator('#crSearch')).toBeVisible();
  await expect(page.locator('#crCount')).toBeVisible();
  await expect(page.locator('#crRows')).toBeVisible();
  await page.locator('#crSearch').fill('solicitud-e2e-inexistente');
  await expect(page.locator('#crRows')).toContainText(/No hay solicitudes de clientes|Impossible de charger les solicitudes/i);
  await returnToMenu(page);
});
