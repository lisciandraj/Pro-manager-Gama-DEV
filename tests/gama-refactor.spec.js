const { test, expect } = require('@playwright/test');

test('extracted legacy core bootstraps without page errors', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/index.html', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('body')).toBeVisible();

  await expect.poll(async () => page.evaluate(() => Boolean(window.GamaLegacyCoreReady)), {
    timeout: 10_000,
    message: 'GamaLegacyCore did not bootstrap'
  }).toBe(true);

  const core = await page.evaluate(() => Object.keys(window.GamaLegacyCore || {}).sort());
  expect(core).toEqual(expect.arrayContaining([
    'createProduct',
    'saveClient',
    'registerMovement',
    'generateInvoice',
    'renderAudit',
    'renderDashboard',
    'renderAll'
  ]));

  expect(errors, errors.join('\n')).toEqual([]);
});
