import { test, expect } from '@playwright/test';

const LEGAL_PAGES = [
  { path: '/belgeler/gizlilik-politikasi', title: 'Gizlilik Politikası' },
  { path: '/belgeler/kvkk-aydinlatma-metni', title: 'KVKK Aydınlatma Metni' },
  { path: '/belgeler/kullanim-kosullari', title: 'Kullanım Koşulları' },
  { path: '/belgeler/mesafeli-satis-sozlesmesi', title: 'Mesafeli Satış Sözleşmesi' },
  { path: '/belgeler/on-bilgilendirme-formu', title: 'Ön Bilgilendirme Formu' },
];

// ── 1. Each legal page loads without authentication ───────────────────────

for (const { path, title } of LEGAL_PAGES) {
  test(`1.x ${title} loads without auth`, async ({ page }) => {
    // Ensure no auth
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('akinel-auth'));

    const res = await page.goto(path);
    expect(res?.status()).toBe(200);

    await expect(page.locator('h1')).toContainText(title, { timeout: 8_000 });
  });
}

// ── 2. /belgeler/kvkk redirects to kvkk-aydinlatma-metni ─────────────────

test('2.1 /belgeler/kvkk redirects to /belgeler/kvkk-aydinlatma-metni', async ({ page }) => {
  await page.goto('/belgeler/kvkk');
  await expect(page).toHaveURL(/kvkk-aydinlatma-metni/, { timeout: 8_000 });
});

// ── 3. Footer contains all legal links ───────────────────────────────────

test('3.1 footer contains links to all legal pages', async ({ page }) => {
  await page.goto('/');

  const footer = page.locator('footer');

  await expect(footer.locator('a[href="/belgeler/gizlilik-politikasi"]')).toBeVisible();
  await expect(footer.locator('a[href="/belgeler/kvkk-aydinlatma-metni"]')).toBeVisible();
  await expect(footer.locator('a[href="/belgeler/kullanim-kosullari"]')).toBeVisible();
  await expect(footer.locator('a[href="/belgeler/mesafeli-satis-sozlesmesi"]')).toBeVisible();
  await expect(footer.locator('a[href="/belgeler/on-bilgilendirme-formu"]')).toBeVisible();
});

test('3.2 footer legal links are not stubbed # hrefs', async ({ page }) => {
  await page.goto('/');

  const footer = page.locator('footer');
  const stubLinks = footer.locator('a[href="#"]');
  const count = await stubLinks.count();
  expect(count).toBe(0);
});

// ── 4. Legal page content sanity checks ──────────────────────────────────

test('4.1 Gizlilik Politikası contains expected sections', async ({ page }) => {
  await page.goto('/belgeler/gizlilik-politikasi');
  const body = await page.locator('body').innerText();
  expect(body).toContain('Veri Sorumlusu');
  expect(body).toContain('Haklarınız');
  expect(body).toContain('KVKK');
});

test('4.2 KVKK Aydınlatma Metni contains table with data categories', async ({ page }) => {
  await page.goto('/belgeler/kvkk-aydinlatma-metni');
  await expect(page.locator('table')).toBeVisible();
  const body = await page.locator('body').innerText();
  expect(body).toContain('Kimlik');
  expect(body).toContain('Hukuki Dayanak');
});

test('4.3 Mesafeli Satış Sözleşmesi mentions 14-day cayma hakkı', async ({ page }) => {
  await page.goto('/belgeler/mesafeli-satis-sozlesmesi');
  const body = await page.locator('body').innerText();
  expect(body).toContain('14');
  expect(body).toContain('cayma');
});

test('4.4 Ön Bilgilendirme Formu contains satıcı bilgileri and cayma hakkı', async ({ page }) => {
  await page.goto('/belgeler/on-bilgilendirme-formu');
  const body = await page.locator('body').innerText();
  expect(body).toContain('Satıcı Bilgileri');
  expect(body).toContain('Cayma Hakkı');
});

// ── 5. Mobile 390px ───────────────────────────────────────────────────────

test('5.1 legal pages render without horizontal overflow on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });

  for (const { path } of LEGAL_PAGES) {
    await page.goto(path);
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(390 + 5); // 5px tolerance
  }
});

test('5.2 footer legal links visible on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  // Footer is at bottom — scroll to it
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(300);

  const footer = page.locator('footer');
  await expect(footer.locator('a[href="/belgeler/gizlilik-politikasi"]')).toBeVisible();
});
