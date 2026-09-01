const { test, expect } = require('@playwright/test');

test('refactored runtime and bounded contexts bootstrap without page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();

  await expect.poll(async () => page.evaluate(() => Boolean(window.GamaLegacyRuntimeReady)), {
    timeout: 10_000,
    message: 'Gama legacy runtime did not bootstrap'
  }).toBe(true);

  await expect.poll(async () => page.evaluate(() => Boolean(window.GamaLegacyCoreReady)), {
    timeout: 10_000,
    message: 'GamaLegacyCore did not bootstrap'
  }).toBe(true);

  const state = await page.evaluate(() => ({
    core: Object.keys(window.GamaLegacyCore || {}).sort(),
    contexts: {
      products: Boolean(window.GamaProductsReady),
      clients: Boolean(window.GamaClientsReady),
      inventory: Boolean(window.GamaInventoryReady),
      billing: Boolean(window.GamaBillingReady),
      audit: Boolean(window.GamaAuditReady),
      dashboard: Boolean(window.GamaDashboardReady)
    },
    inlineLegacyKey: Array.from(document.scripts).some(s => (s.textContent || '').includes("const KEY='stock_manager_v6_ecuador'"))
  }));

  expect(state.core).toEqual(expect.arrayContaining([
    'createProduct',
    'saveClient',
    'registerMovement',
    'generateInvoice',
    'renderAudit',
    'renderDashboard',
    'renderAll'
  ]));
  expect(state.contexts).toEqual({
    products: true,
    clients: true,
    inventory: true,
    billing: true,
    audit: true,
    dashboard: true
  });
  expect(state.inlineLegacyKey).toBe(false);
  expect(errors, errors.join('\n')).toEqual([]);
});
