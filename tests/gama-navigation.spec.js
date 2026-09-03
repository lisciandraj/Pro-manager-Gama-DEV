const { test, expect } = require('@playwright/test');

async function openApp(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
}

async function loginIfConfigured(page) {
  const email = process.env.GAMA_E2E_EMAIL;
  const password = process.env.GAMA_E2E_PASSWORD;
  if (!email || !password) return false;
  const login = page.locator('#gamaCloudLoginBtn');
  if (await login.count()) {
    await page.locator('#gamaCloudEmail').fill(email);
    await page.locator('#gamaCloudPass').fill(password);
    await login.click();
    await expect(login).toHaveCount(0, { timeout: 15_000 });
  }
  await expect(page.locator('#mainmenu')).toBeVisible({ timeout: 15_000 });
  return true;
}

async function requireAuth(page) {
  test.skip(!(await loginIfConfigured(page)), 'GAMA_E2E_EMAIL/GAMA_E2E_PASSWORD not configured');
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

test('authenticated user bar is fixed at the bottom with logout action', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const bar = page.locator('#gamaAccessUser');
  await expect(bar).toBeVisible();
  await expect(bar).toContainText(/Administrador|Comercial|Almacenero|Cliente/i);
  await expect(bar.locator('#gamaAccessLogout')).toBeVisible();
  await expect(bar.locator('#gamaAccessLogout')).toBeEnabled();
  const box = await bar.boundingBox();
  expect(box).toBeTruthy();
  expect(box.y + box.height).toBeGreaterThanOrEqual((await page.evaluate(() => window.innerHeight)) - 30);
  await expect(page.locator('#gamaSessionBar')).toHaveCount(0);
});

test('logout removes the bottom user bar and returns to cloud login', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const logout = page.locator('#gamaAccessLogout');
  await expect(logout).toBeVisible();
  await logout.click();
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
