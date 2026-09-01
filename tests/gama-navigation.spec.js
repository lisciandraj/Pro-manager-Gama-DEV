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

test('client catalog can be opened repeatedly without duplicates', async ({ page }) => {
  await openApp(page);
  await requireAuth(page);
  for (let i = 0; i < 3; i += 1) {
    await openModule(page, 'client-catalog');
    await expect(page.locator('#client-catalog')).toHaveClass(/active/);
    await expect(page.locator('#client-catalog')).toHaveCount(1);
    await returnToMenu(page);
    await expect(page.locator('#mainmenu [data-gama-module="client-catalog"]')).toHaveCount(1);
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
    await expect(page.locator('#mainmenu [data-gama-module="customer-requests"]')).toHaveCount(1);
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
  await expect(page.locator('#mainmenu [data-gama-module="client-catalog"]')).toHaveCount(1);
  await expect(page.locator('#mainmenu [data-gama-module="customer-requests"]')).toHaveCount(1);
});
