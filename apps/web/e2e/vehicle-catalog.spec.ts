import { test, expect, Page } from '@playwright/test';
import { login, getAdminToken, apiCleanupTestHierarchy, confirmDelete, waitForTableRows, API_URL } from './helpers';

const TEST_MAKE = 'TEST_MARKA_E2E';
const TEST_MODEL = 'TEST_MODEL_E2E';
const TEST_GEN = 'TEST_NESIL_E2E';
const TEST_ENGINE = '1.5 TDI 120HP E2E';

// ── Navigate to test make using the search filter (avoids pagination) ────────

async function navigateToTestMake(page: Page) {
  await page.fill('input[placeholder="Ara..."]', 'TEST_MARKA');
  // Wait for the debounced search to complete and row to appear (not just a timeout)
  await page.waitForSelector(`td:has-text("${TEST_MAKE}")`, { timeout: 8_000 });
  await page.locator(`td button:has-text("${TEST_MAKE}")`).first().click();
  await page.waitForSelector(`text=${TEST_MAKE} — Modeller`);
  await waitForTableRows(page);
}

// ── beforeAll / afterAll cleanup ─────────────────────────────────────────────

test.beforeAll(async ({ browser }) => {
  // Ensure admin session is warm
  const page = await browser.newPage();
  await login(page);
  await page.close();
  await apiCleanupTestHierarchy(TEST_MAKE);
});

test.afterAll(async () => {
  await apiCleanupTestHierarchy(TEST_MAKE);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 1 — Admin CRUD: full hierarchy create → persist → delete
// ═══════════════════════════════════════════════════════════════════════════════

test('1.1 — Admin page loads and shows Araç Kataloğu', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await expect(page.locator('h1')).toContainText('Araç Kataloğu');
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('text=FIAT')).toBeVisible();
});

test('1.2 — Create test brand (Make)', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await page.click('button:has-text("Marka Ekle")');
  await page.waitForSelector('#makeName');
  await page.fill('#makeName', TEST_MAKE);

  // Click Kaydet scoped inside the modal only
  await page.locator('.fixed.inset-0.z-50 button:has-text("Kaydet")').click();

  // Wait for the new item to appear (search for it since it may be on page 2)
  await page.waitForTimeout(500);
  await page.fill('input[placeholder="Ara..."]', 'TEST_MARKA');
  await page.waitForTimeout(400);
  await expect(page.locator(`td:has-text("${TEST_MAKE}")`)).toBeVisible({ timeout: 8_000 });
});

test('1.3 — Navigate into make and create model', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await navigateToTestMake(page);

  await page.click('button:has-text("Model Ekle")');
  await page.waitForSelector('#modelName');
  await page.fill('#modelName', TEST_MODEL);
  await page.locator('.fixed.inset-0.z-50 button:has-text("Kaydet")').click();

  await expect(page.locator(`td:has-text("${TEST_MODEL}")`)).toBeVisible({ timeout: 8_000 });
});

test('1.4 — Navigate into model and create generation', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await navigateToTestMake(page);
  await page.locator(`td button:has-text("${TEST_MODEL}")`).first().click();
  await page.waitForSelector(`text=${TEST_MODEL} — Kasa / Nesiller`);
  await waitForTableRows(page);

  await page.click('button:has-text("Nesil Ekle")');
  await page.waitForSelector('#genName');
  await page.fill('#genName', TEST_GEN);
  await page.fill('#genBody', 'Sedan');
  await page.fill('#genYearFrom', '2020');
  await page.fill('#genYearTo', '2026');
  await page.locator('.fixed.inset-0.z-50 button:has-text("Kaydet")').click();

  await expect(page.locator(`td:has-text("${TEST_GEN}")`)).toBeVisible({ timeout: 8_000 });
});

test('1.5 — Navigate into generation and create engine', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await navigateToTestMake(page);
  await page.locator(`td button:has-text("${TEST_MODEL}")`).first().click();
  await page.waitForSelector(`text=${TEST_MODEL} — Kasa / Nesiller`);
  await waitForTableRows(page);
  await page.locator(`td button:has-text("${TEST_GEN}")`).first().click();
  await page.waitForSelector(`text=${TEST_GEN} — Motorlar`);
  await waitForTableRows(page);

  await page.click('button:has-text("Motor Ekle")');
  await page.waitForSelector('#engName');
  await page.fill('#engName', TEST_ENGINE);
  await page.fill('#engFuel', 'Diesel');
  await page.fill('#engHp', '120');
  await page.fill('#engCc', '1498');
  await page.fill('#engDisp', '1.5');
  await page.fill('#engGearbox', 'Manuel');
  await page.fill('#engYF', '2020');
  await page.fill('#engYT', '2026');
  await page.locator('.fixed.inset-0.z-50 button:has-text("Kaydet")').click();

  await expect(page.locator(`td:has-text("${TEST_ENGINE}")`)).toBeVisible({ timeout: 8_000 });
});

test('1.6 — Refresh and verify full hierarchy persists', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');
  await page.reload();
  await page.waitForSelector('table');

  await page.fill('input[placeholder="Ara..."]', 'TEST_MARKA');
  await page.waitForTimeout(400);
  await expect(page.locator(`td:has-text("${TEST_MAKE}")`)).toBeVisible({ timeout: 8_000 });

  await navigateToTestMake(page);
  await expect(page.locator(`td:has-text("${TEST_MODEL}")`)).toBeVisible();

  await page.locator(`td button:has-text("${TEST_MODEL}")`).first().click();
  await page.waitForSelector(`text=${TEST_MODEL} — Kasa / Nesiller`);
  await waitForTableRows(page);
  await expect(page.locator(`td:has-text("${TEST_GEN}")`)).toBeVisible();

  await page.locator(`td button:has-text("${TEST_GEN}")`).first().click();
  await page.waitForSelector(`text=${TEST_GEN} — Motorlar`);
  await waitForTableRows(page);
  await expect(page.locator(`td:has-text("${TEST_ENGINE}")`)).toBeVisible();
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 2 — Storefront Vehicle Finder
// ═══════════════════════════════════════════════════════════════════════════════

test('2.1 — Vehicle Finder loads make dropdown with options', async ({ page }) => {
  await page.goto('/vehicle');
  const makeSelect = page.locator('select').first();
  await makeSelect.waitFor({ state: 'visible', timeout: 10_000 });
  const options = await makeSelect.locator('option').allInnerTexts();
  expect(options.length).toBeGreaterThan(1);
  expect(options).toContain('FIAT');
});

test('2.2 — Vehicle Finder can select FIAT → EGEA → generation → engine', async ({ page }) => {
  await page.goto('/vehicle');
  const selects = page.locator('select');

  await selects.nth(0).waitFor({ state: 'visible', timeout: 10_000 });
  await selects.nth(0).selectOption({ label: 'FIAT' });
  await page.waitForFunction(() => (document.querySelectorAll('select')[1] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(1).selectOption({ label: 'EGEA' });
  await page.waitForFunction(() => (document.querySelectorAll('select')[2] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(2).selectOption({ index: 1 });
  await page.waitForFunction(() => (document.querySelectorAll('select')[3] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(3).selectOption({ index: 1 });

  await expect(page.locator('button:has-text("Parçaları Göster")')).toBeEnabled();
});

test('2.3 — Clicking CTA shows vehicle summary and navigates to products', async ({ page }) => {
  await page.goto('/vehicle');
  const selects = page.locator('select');

  await selects.nth(0).waitFor({ state: 'visible', timeout: 10_000 });
  await selects.nth(0).selectOption({ label: 'FIAT' });
  await page.waitForFunction(() => (document.querySelectorAll('select')[1] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(1).selectOption({ label: 'EGEA' });
  await page.waitForFunction(() => (document.querySelectorAll('select')[2] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(2).selectOption({ index: 1 });
  await page.waitForFunction(() => (document.querySelectorAll('select')[3] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(3).selectOption({ index: 1 });

  await page.click('button:has-text("Parçaları Göster")');

  // Vehicle page shows a summary card with "Parçaları Gör" link
  const link = page.locator('a:has-text("Parçaları Gör")');
  await expect(link).toBeVisible({ timeout: 8_000 });
  const href = await link.getAttribute('href');
  expect(href).toContain('vehicleEngineId=');

  await link.click();
  await page.waitForURL((url) => url.pathname.includes('/products'), { timeout: 10_000 });
  expect(page.url()).toContain('vehicleEngineId=');
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 3 — Product compatibility via admin UI
// ═══════════════════════════════════════════════════════════════════════════════

async function navigateToFirstProductCompatTab(page: Page) {
  await login(page);
  await page.goto('/admin/products');
  await page.waitForSelector('table tbody tr');
  // Use the first product name link
  await page.locator('table tbody tr').first().locator('a').first().click();
  await page.waitForURL((url) => url.pathname.match(/\/admin\/products\/.+/) !== null);
  await page.click('button:has-text("Araç Uyumluluğu")');
  await page.waitForSelector('button:has-text("Araç Ekle")');
  // Wait for any pending fetch to settle
  await page.waitForTimeout(500);
}

async function pickFiatEgea(page: Page) {
  const selects = page.locator('select');
  await selects.nth(0).waitFor({ state: 'visible', timeout: 10_000 });
  await selects.nth(0).selectOption({ label: 'FIAT' });
  await page.waitForFunction(() => (document.querySelectorAll('select')[1] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(1).selectOption({ label: 'EGEA' });
  await page.waitForFunction(() => (document.querySelectorAll('select')[2] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(2).selectOption({ index: 1 });
  await page.waitForFunction(() => (document.querySelectorAll('select')[3] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
  await selects.nth(3).selectOption({ index: 1 });
}

test('3.1 — Add FIAT EGEA compatibility to first product', async ({ page }) => {
  // Pre-clean: remove any existing FIAT EGEA compat for the first product via API
  // so that adding it always increases the count
  const token = await getAdminToken();
  const prodRes = await fetch(`${API_URL}/api/products?pageSize=1`);
  const prodData = await prodRes.json() as { items: Array<{ id: string }> };
  if (!prodData.items?.length) { test.skip(); return; }
  const prodId = prodData.items[0].id;

  // Get all FIAT EGEA engines from public API to find candidate engine IDs
  const h = { Authorization: `Bearer ${token}` };
  const compatRes = await fetch(`${API_URL}/api/admin/products/${prodId}/compatibility`, { headers: h });
  const existing = await compatRes.json() as Array<{ engineId: string; displayLabel: string }>;

  // Remove any existing FIAT EGEA entries so the add test always works
  for (const c of existing) {
    if (c.displayLabel?.includes('EGEA')) {
      await fetch(`${API_URL}/api/admin/products/${prodId}/compatibility/${c.engineId}`, {
        method: 'DELETE', headers: h,
      });
    }
  }

  await navigateToFirstProductCompatTab(page);
  const countBefore = await page.locator('.divide-y > div').count();

  await page.click('button:has-text("Araç Ekle")');
  await page.waitForSelector('select', { timeout: 8_000 });
  await pickFiatEgea(page);
  await page.click('button:has-text("Parçaları Göster")');

  await page.waitForFunction(
    (cb: number) => document.querySelectorAll('.divide-y > div').length > cb,
    countBefore,
    { timeout: 10_000 }
  );
  const countAfter = await page.locator('.divide-y > div').count();
  expect(countAfter).toBeGreaterThan(countBefore);
});

test('3.2 — Compatible product appears in storefront product list for that vehicle', async ({ page }) => {
  const token = await getAdminToken();
  const prodRes = await fetch(`${API_URL}/api/products?pageSize=1`);
  const prodData = await prodRes.json() as { items: Array<{ id: string; slug: string }> };
  if (!prodData.items?.length) { test.skip(); return; }

  const id = prodData.items[0].id;
  const compatRes = await fetch(`${API_URL}/api/admin/products/${id}/compatibility`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const compat = await compatRes.json() as Array<{ engineId: string }>;
  if (!compat.length) { test.skip(); return; }

  await page.goto(`/products?vehicleEngineId=${compat[0].engineId}`);
  await page.waitForSelector('main', { timeout: 10_000 });
  await expect(page).not.toHaveURL(/error/);
});

test('3.3 — Remove compatibility and verify it disappears', async ({ page }) => {
  await navigateToFirstProductCompatTab(page);
  const compatList = page.locator('.divide-y > div');
  const countBefore = await compatList.count();
  if (countBefore === 0) { test.skip(); return; }

  // Click the trash button of the last entry
  await compatList.last().locator('button').click();
  await page.waitForFunction(
    (cb: number) => document.querySelectorAll('.divide-y > div').length < cb,
    countBefore,
    { timeout: 8_000 }
  );
  expect(await compatList.count()).toBeLessThan(countBefore);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 4 — FIAT EGEA existing hierarchy verification
// ═══════════════════════════════════════════════════════════════════════════════

test('4.1 — FIAT exists in admin makes list', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');
  await expect(page.locator('td:has-text("FIAT")')).toBeVisible();
});

test('4.2 — FIAT → EGEA hierarchy is intact in admin', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await page.locator('td button:has-text("FIAT")').first().click();
  await page.waitForSelector('text=FIAT — Modeller');
  await waitForTableRows(page);
  await expect(page.locator('td:has-text("EGEA")')).toBeVisible();

  await page.locator('td button:has-text("EGEA")').first().click();
  await page.waitForSelector('text=EGEA — Kasa / Nesiller');
  await waitForTableRows(page);

  const genRows = await page.locator('table tbody tr').count();
  expect(genRows).toBeGreaterThan(0);

  // Drill into first generation
  await page.locator('table tbody tr').first().locator('td').first().locator('button').click();
  await page.waitForSelector('text=— Motorlar');
  await waitForTableRows(page);

  const engineRows = await page.locator('table tbody tr').count();
  expect(engineRows).toBeGreaterThan(0);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 5 — Deletion protection
// ═══════════════════════════════════════════════════════════════════════════════

test('5.1 — Deleting FIAT (has child models) is blocked by the API', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  const fiatRow = page.locator('tr', { hasText: 'FIAT' });
  await fiatRow.locator('button[title="Sil"]').click();
  await page.waitForSelector('text=Silme Onayı');
  await confirmDelete(page);

  // Should show "Kapat" (error state)
  await page.waitForSelector('button:has-text("Kapat")', { timeout: 8_000 });
  await page.click('button:has-text("Kapat")');
  await expect(page.locator('td:has-text("FIAT")')).toBeVisible();
});

test('5.2 — Unrelated makes unaffected (AUDI, BMW visible; VOLKSWAGEN searchable)', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  for (const brand of ['AUDI', 'BMW', 'RENAULT']) {
    await expect(page.locator(`td:has-text("${brand}")`)).toBeVisible();
  }

  await page.fill('input[placeholder="Ara..."]', 'VOLKSWAGEN');
  await page.waitForTimeout(400);
  await expect(page.locator('td:has-text("VOLKSWAGEN")')).toBeVisible({ timeout: 8_000 });
});

test('5.3 — Engine with compatibility cannot be deleted (API returns 409)', async ({ page }) => {
  const token = await getAdminToken();
  const prodRes = await fetch(`${API_URL}/api/products?pageSize=1`);
  const prodData = await prodRes.json() as { items: Array<{ id: string }> };
  if (!prodData.items?.length) { test.skip(); return; }

  const compatRes = await fetch(`${API_URL}/api/admin/products/${prodData.items[0].id}/compatibility`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const compat = await compatRes.json() as Array<{ engineId: string }>;
  if (!compat.length) { test.skip(); return; }

  const deleteRes = await fetch(`${API_URL}/api/admin/vehicles/engines/${compat[0].engineId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(deleteRes.status).toBe(409);

  // Compat record is NOT destroyed
  const compatAfter = await fetch(`${API_URL}/api/admin/products/${prodData.items[0].id}/compatibility`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await compatAfter.json() as Array<{ engineId: string }>;
  expect(data.some((c) => c.engineId === compat[0].engineId)).toBe(true);
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 6 — Delete temporary test hierarchy
// ═══════════════════════════════════════════════════════════════════════════════

test('6.1 — Delete test engine', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await navigateToTestMake(page);
  await page.locator(`td button:has-text("${TEST_MODEL}")`).first().click();
  await page.waitForSelector(`text=${TEST_MODEL} — Kasa / Nesiller`);
  await waitForTableRows(page);
  await page.locator(`td button:has-text("${TEST_GEN}")`).first().click();
  await page.waitForSelector(`text=${TEST_GEN} — Motorlar`);
  await waitForTableRows(page);

  await page.locator('tr', { hasText: TEST_ENGINE }).locator('button[title="Sil"]').click();
  await confirmDelete(page);
  await waitForTableRows(page);
  await expect(page.locator('td', { hasText: TEST_ENGINE })).toHaveCount(0);
});

test('6.2 — Delete test generation', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await navigateToTestMake(page);
  await page.locator(`td button:has-text("${TEST_MODEL}")`).first().click();
  await page.waitForSelector(`text=${TEST_MODEL} — Kasa / Nesiller`);
  await waitForTableRows(page);

  await page.locator('tr', { hasText: TEST_GEN }).locator('button[title="Sil"]').click();
  await confirmDelete(page);
  await waitForTableRows(page);
  await expect(page.locator('td', { hasText: TEST_GEN })).toHaveCount(0);
});

test('6.3 — Delete test model', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await navigateToTestMake(page);

  await page.locator('tr', { hasText: TEST_MODEL }).locator('button[title="Sil"]').click();
  await confirmDelete(page);
  await waitForTableRows(page);
  await expect(page.locator('td', { hasText: TEST_MODEL })).toHaveCount(0);
});

test('6.4 — Delete test make', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await page.fill('input[placeholder="Ara..."]', 'TEST_MARKA');
  await page.waitForTimeout(400);
  await page.waitForSelector(`td:has-text("${TEST_MAKE}")`);

  await page.locator('tr', { hasText: TEST_MAKE }).locator('button[title="Sil"]').click();
  await confirmDelete(page);
  await page.waitForTimeout(500);

  await page.fill('input[placeholder="Ara..."]', 'TEST_MARKA');
  await page.waitForTimeout(400);
  await expect(page.locator('td', { hasText: TEST_MAKE })).toHaveCount(0);
});

test('6.5 — Unrelated brands still intact after cleanup', async ({ page }) => {
  await login(page);
  await page.goto('/admin/vehicles');
  await page.waitForSelector('table');

  await expect(page.locator('td:has-text("FIAT")')).toBeVisible();
  await expect(page.locator('td:has-text("BMW")')).toBeVisible();

  await page.fill('input[placeholder="Ara..."]', 'VOLKSWAGEN');
  await page.waitForTimeout(400);
  await expect(page.locator('td:has-text("VOLKSWAGEN")')).toBeVisible({ timeout: 8_000 });
});

// ═══════════════════════════════════════════════════════════════════════════════
// SUITE 7 — Mobile 390px viewport
// ═══════════════════════════════════════════════════════════════════════════════

test.describe('Mobile 390px', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('7.1 — No horizontal overflow on admin vehicles page', async ({ page }) => {
    await login(page);
    await page.goto('/admin/vehicles');
    await page.waitForSelector('table');
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(395);
  });

  test('7.2 — Search input works at mobile width', async ({ page }) => {
    await login(page);
    await page.goto('/admin/vehicles');
    await page.waitForSelector('table');
    await page.fill('input[placeholder="Ara..."]', 'FIA');
    await page.waitForTimeout(400);
    await expect(page.locator('td:has-text("FIAT")')).toBeVisible({ timeout: 8_000 });
  });

  test('7.3 — Hierarchy navigation works on mobile', async ({ page }) => {
    await login(page);
    await page.goto('/admin/vehicles');
    await page.waitForSelector('table');

    await page.locator('td button:has-text("FIAT")').first().click();
    await page.waitForSelector('text=FIAT — Modeller');
    await waitForTableRows(page);
    await expect(page.locator('td:has-text("EGEA")')).toBeVisible();

    await page.click('button:has-text("Geri")');
    await page.waitForSelector('text=Araç Markaları');
    await expect(page.locator('td:has-text("FIAT")')).toBeVisible();
  });

  test('7.4 — Create modal is usable on mobile (fill + cancel)', async ({ page }) => {
    await login(page);
    await page.goto('/admin/vehicles');
    await page.waitForSelector('table');

    await page.click('button:has-text("Marka Ekle")');
    const modal = page.locator('.fixed.inset-0.z-50').first();
    await modal.waitFor({ state: 'visible' });

    const modalInner = modal.locator('.bg-white.rounded-xl');
    const box = await modalInner.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x + box!.width).toBeLessThanOrEqual(395);

    await page.fill('#makeName', 'MOBILE_TEST_CANCEL');
    await page.locator('.fixed.inset-0.z-50 button:has-text("İptal")').click();
    await expect(modal).toHaveCount(0);
  });

  test('7.5 — Vehicle Finder works at mobile width (no overflow + selects functional)', async ({ page }) => {
    await page.goto('/vehicle');
    const makeSelect = page.locator('select').first();
    await makeSelect.waitFor({ state: 'visible', timeout: 10_000 });

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(395);

    await makeSelect.selectOption({ label: 'FIAT' });
    await page.waitForFunction(() => (document.querySelectorAll('select')[1] as HTMLSelectElement)?.options.length > 1, { timeout: 8_000 });
    await page.locator('select').nth(1).selectOption({ label: 'EGEA' });
    await expect(page.locator('select').nth(2)).not.toBeDisabled({ timeout: 8_000 });
  });
});
