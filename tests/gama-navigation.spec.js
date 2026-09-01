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

test('authenticated main menu exposes unique modules', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const modules = ['dashboard','products','clients','movement','billing','stock','audit','suppliers','gamaPurchasesV14','reports','settings','backup','users','barcode','client-catalog','customer-requests'];
  for (const moduleId of modules) {
    await expect(page.locator(`#mainmenu [data-gama-module="${moduleId}"]`)).toHaveCount(1);
  }
});

test('core modules open and return to menu', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  const coreModules = [
    ['products','#products'],['clients','#clients'],['movement','#movement'],['billing','#billing'],
    ['stock','#stock'],['suppliers','#suppliers'],['reports','#reports'],['settings','#settings'],
    ['backup','#backup'],['users','#users'],['barcode','#barcode']
  ];
  for (const [moduleId, section] of coreModules) {
    await openModule(page, moduleId);
    await expect(page.locator(section)).toHaveClass(/active/);
    await returnToMenu(page);
    await expect(page.locator(`#mainmenu [data-gama-module="${moduleId}"]`)).toHaveCount(1);
  }
});

test('product and client modules expose their data-entry interfaces', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);

  await openModule(page, 'products');
  await expect(page.locator('#products')).toHaveClass(/active/);
  expect(await page.locator('#products button').count()).toBeGreaterThan(0);
  expect(await page.locator('#products input, #products select, #products textarea').count()).toBeGreaterThan(0);
  await returnToMenu(page);

  await openModule(page, 'clients');
  await expect(page.locator('#clients')).toHaveClass(/active/);
  await expect(page.locator('#cName')).toBeVisible();
  await expect(page.locator('#cId')).toBeVisible();
  await expect(page.getByRole('button', { name: /Guardar cliente/i })).toBeVisible();
  await returnToMenu(page);
});

test('movement and billing modules expose transaction controls', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);

  await openModule(page, 'movement');
  await expect(page.locator('#movement')).toHaveClass(/active/);
  expect(await page.locator('#movement input, #movement select, #movement button').count()).toBeGreaterThan(0);
  await returnToMenu(page);

  await openModule(page, 'billing');
  await expect(page.locator('#billing')).toHaveClass(/active/);
  expect(await page.locator('#billing input, #billing select, #billing button').count()).toBeGreaterThan(0);
  await returnToMenu(page);
});

test('client catalog exposes search, cart and submit controls', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  await openModule(page, 'client-catalog');
  await expect(page.locator('#client-catalog')).toHaveClass(/active/);
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
  await expect(page.locator('#customer-requests')).toHaveClass(/active/);
  await expect(page.locator('#crSearch')).toBeVisible();
  await expect(page.locator('#crCount')).toBeVisible();
  await expect(page.locator('#crRows')).toBeVisible();
  await page.locator('#crSearch').fill('solicitud-e2e-inexistente');
  await expect(page.locator('#crRows')).toContainText(/No hay solicitudes de clientes|Impossible de charger les solicitudes/i);
  await returnToMenu(page);
});

test('client catalog can be opened repeatedly without duplicates', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  for (let i = 0; i < 3; i += 1) {
    await openModule(page, 'client-catalog');
    await expect(page.locator('#client-catalog')).toHaveClass(/active/);
    await expect(page.locator('#client-catalog')).toHaveCount(1);
    await returnToMenu(page);
    await expect(page.locator('#mainmenu [data-gama-module="client-catalog"]`)).toHaveCount(1);
  }
});

test('customer requests can be opened repeatedly without duplicates', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  for (let i = 0; i < 3; i += 1) {
    await openModule(page, 'customer-requests');
    await expect(page.locator('#customer-requests')).toHaveClass(/active/);
    await expect(page.locator('#customer-requests')).toHaveCount(1);
    await returnToMenu(page);
    await expect(page.locator('#mainmenu [data-gama-module="customer-requests"]`)).toHaveCount(1);
  }
});

test('catalog and customer requests remain unique after alternating navigation', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  for (const moduleId of ['client-catalog','customer-requests','client-catalog','customer-requests','client-catalog']) {
    await openModule(page, moduleId);
    await expect(page.locator(`#${moduleId}`)).toHaveClass(/active/);
    await returnToMenu(page);
  }
  await expect(page.locator('#mainmenu [data-gama-module="client-catalog"]`)).toHaveCount(1);
  await expect(page.locator('#mainmenu [data-gama-module="customer-requests"]`)).toHaveCount(1);
});
