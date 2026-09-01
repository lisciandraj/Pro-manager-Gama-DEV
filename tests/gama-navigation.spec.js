const { test, expect } = require('@playwright/test');

async function openApp(page) {
  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();
}

async function loginIfConfigured(page) {
  const email = process.env.GAMA_E2E_EMAIL;
  const password = process.env.GAMA_E2E_PASSWORD;
  test.skip(!email || !password, 'GAMA_E2E_EMAIL/GAMA_E2E_PASSWORD not configured');

  await page.locator('#gamaCloudEmail').fill(email);
  await page.locator('#gamaCloudPass').fill(password);
  await page.locator('#gamaCloudLoginBtn').click();
  await expect(page.locator('#gamaCloudLoginBtn')).toHaveCount(0, { timeout: 15_000 });
  await expect(page.locator('#mainmenu')).toBeVisible({ timeout: 15_000 });
}

test('application loads without uncaught page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await openApp(page);
  expect(errors, errors.join('\n')).toEqual([]);
});

test('authenticated navigation remains stable and has no duplicate client entries', async ({ page }) => {
  await openApp(page);
  await loginIfConfigured(page);

  const menu = page.locator('#mainmenu');
  await expect(menu).toBeVisible();

  const catalog = menu.locator('[data-gama-module="client-catalog"]');
  const requests = menu.locator('[data-gama-module="customer-requests"]');
  await expect(catalog).toHaveCount(1);
  await expect(requests).toHaveCount(1);

  await catalog.click();
  await expect(page.locator('#clientCatalogTab, [data-gama-client-catalog]').first()).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /Menú principal/i }).click();
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-gama-module="client-catalog"]')).toHaveCount(1);

  await requests.click();
  await expect(page.locator('#customerRequestsTab, [data-gama-customer-requests]').first()).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /Menú principal/i }).click();
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-gama-module="customer-requests"]')).toHaveCount(1);

  await catalog.click();
  await expect(page.locator('#clientCatalogTab, [data-gama-client-catalog]').first()).toBeVisible({ timeout: 10_000 });
  await page.getByRole('button', { name: /Menú principal/i }).click();
  await expect(menu).toBeVisible();
  await expect(menu.locator('[data-gama-module="client-catalog"]')).toHaveCount(1);
  await expect(menu.locator('[data-gama-module="customer-requests"]')).toHaveCount(1);
});
