import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = '/tmp/final-qa-screenshots';
const LEGACY_DIR = '/tmp/playwright-screenshots';

for (const dir of [SCREENSHOT_DIR, LEGACY_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

const VIEWPORTS = [
  { name: '320px',   width: 320,  height: 800  },
  { name: '375px',   width: 375,  height: 812  },
  { name: '390px',   width: 390,  height: 844  },
  { name: '430px',   width: 430,  height: 932  },
  { name: '768px',   width: 768,  height: 1024 },
  { name: '1280px',  width: 1280, height: 800  },
  { name: '1440px',  width: 1440, height: 900  },
];

const MOBILE_VIEWPORTS  = VIEWPORTS.filter(v => v.width <= 430);
const DESKTOP_VIEWPORTS = VIEWPORTS.filter(v => v.width >= 1280);

// ── Helpers ──────────────────────────────────────────────────────────────────

interface OverflowResult {
  hasOverflow: boolean;
  offendingElements: Array<{ tag: string; className: string; right: number }>;
  scrollWidth: number;
  clientWidth: number;
}

async function checkHorizontalOverflow(page: Page): Promise<OverflowResult> {
  return await page.evaluate(() => {
    const scrollWidth = document.documentElement.scrollWidth;
    const clientWidth = document.documentElement.clientWidth;
    const hasOverflow = scrollWidth > clientWidth;

    const offendingElements = Array.from(document.querySelectorAll('*'))
      .filter(el => {
        const rect = el.getBoundingClientRect();
        return rect.right > clientWidth + 5;
      })
      .map(el => ({
        tag: el.tagName,
        className: (el.className || '').toString().slice(0, 80),
        right: Math.round(el.getBoundingClientRect().right),
      }))
      .slice(0, 10);

    return { hasOverflow, offendingElements, scrollWidth, clientWidth };
  });
}

async function screenshot(page: Page, name: string) {
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  // Also write to legacy dir for backward compat
  try {
    fs.copyFileSync(filePath, path.join(LEGACY_DIR, `${name}.png`));
  } catch { /* ignore */ }
  console.log(`  📸 ${filePath}`);
}

function attachConsoleCapture(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}`));
  return errors;
}

async function assertNoOverflow(page: Page, label: string) {
  const overflow = await checkHorizontalOverflow(page);
  if (overflow.hasOverflow) {
    console.log(`[OVERFLOW] ${label}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
    overflow.offendingElements.forEach(el =>
      console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
    );
  }
  expect(
    overflow.hasOverflow,
    `Horizontal overflow on ${label}: scrollW=${overflow.scrollWidth} clientW=${overflow.clientWidth}`
  ).toBe(false);
}

// ── Product slug resolution ──────────────────────────────────────────────────

let PRODUCT_SLUG = 'test-product';

test.beforeAll(async ({ browser }) => {
  const page = await browser.newPage();
  try {
    const res = await page.goto('http://localhost:5100/api/products?pageSize=1&inStockOnly=false', {
      waitUntil: 'networkidle', timeout: 10000,
    });
    if (res?.ok()) {
      const data = await res.json();
      const slug = data?.items?.[0]?.slug;
      if (slug) PRODUCT_SLUG = slug;
    }
  } catch { /* ignore */ }
  finally { await page.close(); }
  console.log(`Using product slug: ${PRODUCT_SLUG}`);
});

// ═══════════════════════════════════════════════════════════════════════════
// 1. HOMEPAGE — overflow + visual
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Homepage', () => {
  for (const vp of VIEWPORTS) {
    test(`/ — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      await screenshot(page, `homepage-${vp.name}`);
      await assertNoOverflow(page, `homepage @${vp.name}`);

      // Hero h1 must be visible
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      // Mobile: hamburger present with adequate touch target
      if (vp.width < 768) {
        const hamburger = page.locator('[aria-label="Menüyü aç"]');
        await expect(hamburger).toBeVisible();
        const box = await hamburger.boundingBox();
        expect(box?.width ?? 0, `Hamburger width @${vp.name}`).toBeGreaterThanOrEqual(38);
        expect(box?.height ?? 0, `Hamburger height @${vp.name}`).toBeGreaterThanOrEqual(38);
      }

      // Desktop: nav bar visible
      if (vp.width >= 1280) {
        const nav = page.locator('nav[aria-label="Ana menü"]');
        await expect(nav).toBeVisible();
      }

      if (errors.length > 0) {
        console.log(`[CONSOLE ERRORS] homepage @${vp.name}:`, errors.slice(0, 5));
      }
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 2. HOMEPAGE INTERACTIONS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Homepage interactions', () => {
  test('logo click navigates to / from another page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);

    const logo = page.locator('a[aria-label*="Ana sayfa"]').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await page.waitForURL('/', { timeout: 5000 });
    expect(page.url()).toMatch(/\/$|\/$/);
  });

  test('desktop nav links navigate and show active state', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);

    // Click Ürünler
    const productsLink = page.locator('nav[aria-label="Ana menü"] a[href="/products"]');
    await expect(productsLink).toBeVisible();
    await productsLink.click();
    await page.waitForURL('/products', { timeout: 5000 });
    expect(page.url()).toContain('/products');

    // Active indicator (aria-current="page")
    const activeLink = page.locator('nav[aria-label="Ana menü"] a[aria-current="page"]');
    await expect(activeLink).toBeVisible();

    if (errors.length > 0) console.log('[CONSOLE ERRORS] nav click:', errors.slice(0, 3));
  });

  test('mobile hamburger: opens, shows all items, item click closes drawer', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const errors = attachConsoleCapture(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);

    const hamburger = page.locator('[aria-label="Menüyü aç"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    await page.waitForTimeout(500);

    // Drawer visible
    const mobileNav = page.locator('nav[aria-label="Mobil menü"]');
    await expect(mobileNav).toBeVisible();

    await screenshot(page, 'mobile-nav-open-375px');

    // All nav items present
    for (const label of ['Ana Sayfa', 'Ürünler', 'Markalar', 'Aracımı Seç', 'OEM Ara', 'Garajım', 'Hakkımızda', 'İletişim']) {
      const item = mobileNav.locator(`a:has-text("${label}")`);
      await expect(item, `Mobile nav: "${label}" missing`).toBeVisible();
    }

    // Click a link — drawer should close and navigation happens
    const productsItem = mobileNav.locator('a[href="/products"]');
    await productsItem.click();
    await page.waitForURL('/products', { timeout: 5000 });

    // Drawer should be closed
    await expect(mobileNav).not.toBeVisible();

    if (errors.length > 0) console.log('[CONSOLE ERRORS] mobile nav:', errors.slice(0, 3));
  });

  test('search box: type and Enter navigates to /search', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(500);

    const searchInput = page.locator('#global-search-input').first();
    await expect(searchInput).toBeVisible();
    await searchInput.click();
    await searchInput.fill('fren balatası');
    await searchInput.press('Enter');

    await page.waitForURL(/\/search/, { timeout: 5000 });
    expect(page.url()).toContain('/search');
    expect(page.url()).toContain('fren');

    if (errors.length > 0) console.log('[CONSOLE ERRORS] search:', errors.slice(0, 3));
  });

  test('cart icon opens CartDrawer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(800);

    const cartBtn = page.locator('button[aria-label*="Sepet"]').first();
    await expect(cartBtn).toBeVisible();
    await cartBtn.click();
    await page.waitForTimeout(500);

    const dialog = page.locator('[role="dialog"]').first();
    await expect(dialog).toBeVisible({ timeout: 3000 });
    await screenshot(page, 'cart-drawer-open-1280px');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 3. PRODUCTS LISTING
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Products', () => {
  for (const vp of VIEWPORTS) {
    test(`/products — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      await screenshot(page, `products-${vp.name}`);
      await assertNoOverflow(page, `/products @${vp.name}`);

      // H1 visible
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      // Mobile: filter button present
      if (vp.width < 1024) {
        const filterBtn = page.locator('button', { hasText: 'Filtrele' }).first();
        await expect(filterBtn).toBeVisible();
        const box = await filterBtn.boundingBox();
        expect(box?.height ?? 0, `Filter btn height @${vp.name}`).toBeGreaterThanOrEqual(28);
      }

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /products @${vp.name}:`, errors.slice(0, 3));
    });
  }

  test('sort select updates URL at desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);
    await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    // Desktop sort select (hidden on mobile, shown on lg+)
    const sortSelect = page.locator('.hidden.lg\\:flex select').first();
    await expect(sortSelect).toBeVisible();
    await sortSelect.selectOption('price-asc');
    await page.waitForTimeout(800);

    expect(page.url()).toContain('sort=price-asc');
    if (errors.length > 0) console.log('[CONSOLE ERRORS] sort select:', errors.slice(0, 3));
  });

  test('mobile filter drawer opens and closes on 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const filterBtn = page.locator('button', { hasText: 'Filtrele' }).first();
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();
    await page.waitForTimeout(500);

    const sheet = page.locator('[role="dialog"]').first();
    await expect(sheet).toBeVisible({ timeout: 3000 });
    await screenshot(page, 'products-filter-drawer-375px');

    // Close via Escape
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    await expect(sheet).not.toBeVisible();
  });

  test('product card click navigates to detail page', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);
    await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2500);

    const firstCard = page.locator('a[href^="/products/"]').first();
    await expect(firstCard).toBeVisible();
    const href = await firstCard.getAttribute('href');
    await firstCard.click();

    await page.waitForURL(/\/products\/.+/, { timeout: 8000 });
    expect(page.url()).toContain('/products/');
    console.log(`  Product card clicked → ${href}`);

    if (errors.length > 0) console.log('[CONSOLE ERRORS] product card click:', errors.slice(0, 3));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 4. PRODUCT DETAIL
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Product Detail', () => {
  for (const vp of VIEWPORTS) {
    test(`/products/[slug] — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto(`/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      await screenshot(page, `product-detail-${vp.name}`);
      await assertNoOverflow(page, `/products/${PRODUCT_SLUG} @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] product detail @${vp.name}:`, errors.slice(0, 3));
    });
  }

  test('all 4 tabs switch correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);
    await page.goto(`/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    for (const label of ['Ürün Bilgileri', 'OEM Numaraları', 'Uyumlu Araçlar', 'Stok Bilgisi']) {
      const tab = page.locator(`button[role="tab"]:has-text("${label}")`);
      await expect(tab, `Tab "${label}" not found`).toBeVisible();
      await tab.click();
      await page.waitForTimeout(300);

      const selected = await tab.getAttribute('aria-selected');
      expect(selected, `Tab "${label}" aria-selected after click`).toBe('true');
    }

    if (errors.length > 0) console.log('[CONSOLE ERRORS] product tabs:', errors.slice(0, 3));
  });

  test('quantity +/- buttons increment and decrement', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);
    await page.goto(`/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    const plusBtn = page.locator('button[aria-label="Adedi artır"]').first();
    const minusBtn = page.locator('button[aria-label="Adedi azalt"]').first();
    const qtySpan = page.locator('[aria-label^="Adet:"]').first();

    const plusVisible = await plusBtn.isVisible();
    if (!plusVisible) {
      console.log('  Skipping qty test — product out of stock (no quantity controls)');
      return;
    }

    let qtyText = await qtySpan.textContent();
    expect(qtyText?.trim()).toBe('1');

    await plusBtn.click();
    await page.waitForTimeout(200);
    qtyText = await qtySpan.textContent();
    expect(parseInt(qtyText?.trim() ?? '0')).toBeGreaterThan(1);

    await minusBtn.click();
    await page.waitForTimeout(200);
    qtyText = await qtySpan.textContent();
    expect(qtyText?.trim()).toBe('1');

    const minusDisabled = await minusBtn.getAttribute('disabled');
    expect(minusDisabled).not.toBeNull();

    if (errors.length > 0) console.log('[CONSOLE ERRORS] qty buttons:', errors.slice(0, 3));
  });

  test('Sepete Ekle button click does not throw JS error', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);
    await page.goto(`/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    const addBtn = page.locator('button:has-text("Sepete Ekle")').first();
    const btnVisible = await addBtn.isVisible();
    if (!btnVisible) {
      console.log('  Skipping add-to-cart — button not visible (product out of stock)');
      return;
    }

    await addBtn.click();
    await page.waitForTimeout(1500);

    const jsErrors = errors.filter(e => e.startsWith('PAGE_ERROR:'));
    expect(jsErrors.length, `JS errors after Sepete Ekle: ${jsErrors.join(', ')}`).toBe(0);
  });

  test('mobile 375px — tabs scroll without overflow', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(`/products/${PRODUCT_SLUG}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
    await screenshot(page, 'product-detail-tabs-375px');
    await assertNoOverflow(page, 'product detail tabs @375px');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 5. VEHICLE SELECTOR
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Vehicle', () => {
  for (const vp of VIEWPORTS) {
    test(`/vehicle — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/vehicle', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      await screenshot(page, `vehicle-${vp.name}`);
      await assertNoOverflow(page, `/vehicle @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /vehicle @${vp.name}:`, errors.slice(0, 3));
    });
  }

  test('mobile 375px — vehicle dropdowns stack vertically (not side-by-side)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/vehicle', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    const selects = page.locator('select[id^="vehicle-step-"]');
    const count = await selects.count();
    expect(count).toBe(4);

    const boxes = await Promise.all(
      Array.from({ length: count }, (_, i) => selects.nth(i).boundingBox())
    );

    // At 375px all selects should be "wide" (not squeezed into 4 columns of ~80px)
    // The actual width depends on padding, but should be at least 200px
    for (let i = 0; i < boxes.length; i++) {
      const box = boxes[i];
      if (box) {
        expect(box.width, `Select ${i} should be single-column (>200px) at 375px, not 4-column`).toBeGreaterThan(200);
      }
    }

    // Verify they are stacked (all have same or very close x position)
    const nonNullBoxes = boxes.filter((b): b is NonNullable<typeof b> => b !== null);
    if (nonNullBoxes.length >= 2) {
      const firstX = Math.round(nonNullBoxes[0].x);
      for (let i = 1; i < nonNullBoxes.length; i++) {
        const diff = Math.abs(Math.round(nonNullBoxes[i].x) - firstX);
        expect(diff, `Select ${i} x-position should match select 0 (stacked vertically)`).toBeLessThanOrEqual(5);
      }
    }
  });

  test('full vehicle selection flow → navigates to /products?vehicleEngineId=...', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);

    await page.goto('/vehicle', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2000);

    const makeSelect = page.locator('#vehicle-step-0');
    await expect(makeSelect).toBeVisible();

    const makeOptionCount = await makeSelect.locator('option').count();
    if (makeOptionCount < 2) {
      console.log('  Skipping vehicle flow — no makes in database');
      return;
    }

    const firstMakeValue = await makeSelect.locator('option').nth(1).getAttribute('value');
    if (!firstMakeValue) return;
    await makeSelect.selectOption(firstMakeValue);
    await page.waitForTimeout(1500);

    const modelSelect = page.locator('#vehicle-step-1');
    const modelOptionCount = await modelSelect.locator('option').count();
    if (modelOptionCount < 2) {
      console.log('  Skipping vehicle flow — no models for selected make');
      return;
    }
    const firstModelValue = await modelSelect.locator('option').nth(1).getAttribute('value');
    if (!firstModelValue) return;
    await modelSelect.selectOption(firstModelValue);
    await page.waitForTimeout(1500);

    const genSelect = page.locator('#vehicle-step-2');
    const genOptionCount = await genSelect.locator('option').count();
    if (genOptionCount < 2) {
      console.log('  Skipping vehicle flow — no generations');
      return;
    }
    const firstGenValue = await genSelect.locator('option').nth(1).getAttribute('value');
    if (!firstGenValue) return;
    await genSelect.selectOption(firstGenValue);
    await page.waitForTimeout(1500);

    const engineSelect = page.locator('#vehicle-step-3');
    const engineOptionCount = await engineSelect.locator('option').count();
    if (engineOptionCount < 2) {
      console.log('  Skipping vehicle flow — no engines');
      return;
    }
    const firstEngineValue = await engineSelect.locator('option').nth(1).getAttribute('value');
    if (!firstEngineValue) return;
    await engineSelect.selectOption(firstEngineValue);
    await page.waitForTimeout(500);

    // On /vehicle page, VehicleFinder has onVehicleSelected callback, so
    // "Parçaları Göster" calls handleVehicleSelected which shows summary card.
    // We then click "Parçaları Gör" from that card to navigate to products.
    const searchBtn = page.locator('button[aria-label*="Uyumlu parçaları"]');
    await expect(searchBtn).toBeEnabled({ timeout: 3000 });
    await searchBtn.click();
    await page.waitForTimeout(1500); // wait for VehicleContext API call

    // Summary card with "Parçaları Gör" appears after selection
    const parcalariGorLink = page.locator('a:has-text("Parçaları Gör")').first();
    await expect(parcalariGorLink, '"Parçaları Gör" link should appear in summary').toBeVisible({ timeout: 5000 });
    await parcalariGorLink.click();

    await page.waitForURL(/\/products/, { timeout: 8000 });
    expect(page.url()).toContain('vehicleEngineId');
    console.log(`  Vehicle flow → ${page.url()}`);

    if (errors.length > 0) console.log('[CONSOLE ERRORS] vehicle flow:', errors.slice(0, 3));
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 6. SEARCH PAGE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Search', () => {
  for (const vp of VIEWPORTS) {
    test(`/search — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `search-${vp.name}`);
      await assertNoOverflow(page, `/search @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /search @${vp.name}:`, errors.slice(0, 3));
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 7. GARAGE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Garage', () => {
  for (const vp of VIEWPORTS) {
    test(`/garage — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/garage', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `garage-${vp.name}`);
      await assertNoOverflow(page, `/garage @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /garage @${vp.name}:`, errors.slice(0, 3));
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 8. AUTH PAGES
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Auth pages', () => {
  for (const vp of [...MOBILE_VIEWPORTS, ...DESKTOP_VIEWPORTS.slice(0, 1)]) {
    test(`/login — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `login-${vp.name}`);
      await assertNoOverflow(page, `/login @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /login @${vp.name}:`, errors.slice(0, 3));
    });

    test(`/register — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/register', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `register-${vp.name}`);
      await assertNoOverflow(page, `/register @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /register @${vp.name}:`, errors.slice(0, 3));
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 9. ABOUT & CONTACT
// ═══════════════════════════════════════════════════════════════════════════

test.describe('About & Contact', () => {
  for (const vp of [...MOBILE_VIEWPORTS, ...DESKTOP_VIEWPORTS.slice(0, 1)]) {
    test(`/about — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `about-${vp.name}`);
      await assertNoOverflow(page, `/about @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /about @${vp.name}:`, errors.slice(0, 3));
    });

    test(`/contact — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      await page.goto('/contact', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `contact-${vp.name}`);
      await assertNoOverflow(page, `/contact @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /contact @${vp.name}:`, errors.slice(0, 3));
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 10. MOBILE NAV DRAWER DETAILED TESTS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Mobile nav drawer', () => {
  test('opens and is scrollable on 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const hamburger = page.locator('[aria-label="Menüyü aç"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    await page.waitForTimeout(500);

    const nav = page.locator('nav[aria-label="Mobil menü"]');
    await expect(nav).toBeVisible();

    await screenshot(page, 'mobile-nav-open-320px');
    await assertNoOverflow(page, 'mobile nav @320px');
  });

  for (const vp of MOBILE_VIEWPORTS) {
    test(`mobile nav opens/closes at ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(800);

      const hamburger = page.locator('[aria-label="Menüyü aç"]');
      await expect(hamburger).toBeVisible();
      await hamburger.click();
      await page.waitForTimeout(500);

      const nav = page.locator('nav[aria-label="Mobil menü"]');
      await expect(nav).toBeVisible();
      await assertNoOverflow(page, `mobile nav @${vp.name}`);

      // Press Escape to close
      await page.keyboard.press('Escape');
      await page.waitForTimeout(400);
      await expect(nav).not.toBeVisible();
    });
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// 11. FOOTER
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Footer', () => {
  test('footer legal link navigates (gizlilik)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors = attachConsoleCapture(page);
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const privacyLink = page.locator('footer a[href*="gizlilik"]').first();
    await expect(privacyLink).toBeVisible({ timeout: 5000 });
    await privacyLink.click();
    await page.waitForTimeout(800);

    expect(page.url()).toContain('gizlilik');

    if (errors.length > 0) console.log('[CONSOLE ERRORS] footer link:', errors.slice(0, 3));
  });

  test('footer columns stack properly on 375px', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    await screenshot(page, 'footer-375px');
    await assertNoOverflow(page, 'footer @375px');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 12. TOUCH TARGET AUDIT
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Touch targets', () => {
  test('homepage 375px — critical icons have adequate touch targets', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    // Report all small targets
    const smallTargets = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('a, button, [role="button"]'))
        .map(el => {
          const r = el.getBoundingClientRect();
          return {
            tag: el.tagName,
            text: el.textContent?.trim().slice(0, 30) ?? '',
            w: Math.round(r.width),
            h: Math.round(r.height),
            label: el.getAttribute('aria-label')?.slice(0, 30) ?? '',
          };
        })
        .filter(el => el.w > 0 && el.h > 0 && (el.w < 44 || el.h < 44));
    });

    if (smallTargets.length > 0) {
      console.log(`[TOUCH TARGETS] ${smallTargets.length} elements < 44px on homepage @375px:`);
      smallTargets.slice(0, 15).forEach(t =>
        console.log(`  <${t.tag}> "${t.text || t.label}" ${t.w}×${t.h}`)
      );
    } else {
      console.log('[TOUCH TARGETS] All interactive elements ≥ 44×44px ✓');
    }

    // Critical nav icons must be at least 38×38 (h-10 w-10 = 40px)
    const hamburger = page.locator('[aria-label="Menüyü aç"]');
    const hBox = await hamburger.boundingBox();
    expect(hBox?.width ?? 0, 'Hamburger width').toBeGreaterThanOrEqual(38);
    expect(hBox?.height ?? 0, 'Hamburger height').toBeGreaterThanOrEqual(38);

    const cartBtn = page.locator('button[aria-label*="Sepet"]').first();
    const cBox = await cartBtn.boundingBox();
    expect(cBox?.width ?? 0, 'Cart button width').toBeGreaterThanOrEqual(38);
    expect(cBox?.height ?? 0, 'Cart button height').toBeGreaterThanOrEqual(38);
  });

  test('products 375px — add-to-cart button is adequately wide', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2500);

    const addToCartBtn = page.locator('button:has-text("Sepete Ekle"), button:has-text("Stokta Yok")').first();
    const btnVisible = await addToCartBtn.isVisible();
    if (btnVisible) {
      const box = await addToCartBtn.boundingBox();
      expect(box?.width ?? 0, 'Add-to-cart button width on mobile').toBeGreaterThan(100);
      expect(box?.height ?? 0, 'Add-to-cart button height').toBeGreaterThanOrEqual(32);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 13. CURSOR AUDIT
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Cursor and clickability', () => {
  test('desktop 1280px — nav links have cursor-pointer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const linksMissingCursor = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, nav button'));
      return links
        .filter(el => window.getComputedStyle(el).cursor !== 'pointer')
        .map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().slice(0, 30) ?? '',
          cursor: window.getComputedStyle(el).cursor,
        }));
    });

    if (linksMissingCursor.length > 0) {
      console.log('[CURSOR] Nav elements missing cursor-pointer:');
      linksMissingCursor.forEach(el => console.log(`  <${el.tag}> "${el.text}" cursor=${el.cursor}`));
    }

    expect(linksMissingCursor.length, 'Nav links missing cursor-pointer').toBe(0);
  });

  test('desktop 1280px — enabled buttons have cursor-pointer', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1200);

    const btnsMissingCursor = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button'))
        .filter(el => window.getComputedStyle(el).cursor !== 'pointer' && !el.disabled)
        .map(el => ({
          text: el.textContent?.trim().slice(0, 30) ?? '',
          label: el.getAttribute('aria-label')?.slice(0, 30) ?? '',
          cursor: window.getComputedStyle(el).cursor,
        }));
    });

    if (btnsMissingCursor.length > 0) {
      console.log('[CURSOR] Enabled buttons missing cursor-pointer:');
      btnsMissingCursor.forEach(b => console.log(`  "${b.text || b.label}" cursor=${b.cursor}`));
    }

    expect(btnsMissingCursor.length, 'Enabled buttons missing cursor-pointer').toBe(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 14. DESKTOP LAYOUT CHECKS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Desktop layout', () => {
  test('products 1280px — product grid shows multiple columns', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(2500);

    const cards = page.locator('a[href^="/products/"]');
    const cardCount = await cards.count();
    if (cardCount < 3) {
      console.log('  Skipping column check — fewer than 3 products');
      return;
    }

    const box0 = await cards.nth(0).boundingBox();
    const box1 = await cards.nth(1).boundingBox();
    const box2 = await cards.nth(2).boundingBox();

    if (box0 && box1 && box2) {
      const isMultiCol = Math.round(box0.x) !== Math.round(box1.x) || Math.round(box1.x) !== Math.round(box2.x);
      expect(isMultiCol, `Product grid should be multi-column at 1280px`).toBe(true);
    }
  });

  test('homepage 1440px — no overflow + screenshot', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);

    await screenshot(page, 'homepage-1440px');
    await assertNoOverflow(page, 'homepage @1440px');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// 15. BRANDS PAGE
// ═══════════════════════════════════════════════════════════════════════════

test.describe('Brands page', () => {
  for (const vp of [...MOBILE_VIEWPORTS.slice(0, 2), ...DESKTOP_VIEWPORTS.slice(0, 1)]) {
    test(`/brands — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      const errors = attachConsoleCapture(page);

      const response = await page.goto('/brands', { timeout: 15000 });
      await page.waitForTimeout(1000);

      if (response && response.status() === 404) {
        console.log(`  /brands returns 404 @${vp.name} — page does not exist, skipping`);
        return;
      }

      await screenshot(page, `brands-${vp.name}`);
      await assertNoOverflow(page, `/brands @${vp.name}`);

      if (errors.length > 0) console.log(`[CONSOLE ERRORS] /brands @${vp.name}:`, errors.slice(0, 3));
    });
  }
});
