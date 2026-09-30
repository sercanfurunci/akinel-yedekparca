import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = '/tmp/playwright-screenshots';

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const VIEWPORTS = [
  { name: '320px',   width: 320,  height: 800  },
  { name: '375px',   width: 375,  height: 812  },
  { name: '390px',   width: 390,  height: 844  },
  { name: '430px',   width: 430,  height: 932  },
  { name: '768px',   width: 768,  height: 1024 },
  { name: '1280px',  width: 1280, height: 800  },
  { name: '1440px',  width: 1440, height: 900  },
  { name: '1920px',  width: 1920, height: 1080 },
];

const MOBILE_VIEWPORTS = VIEWPORTS.filter(v => v.width <= 430);
const TABLET_VIEWPORTS = VIEWPORTS.filter(v => v.width === 768);
const DESKTOP_VIEWPORTS = VIEWPORTS.filter(v => v.width >= 1280);

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
  console.log(`  📸 Screenshot: ${filePath}`);
}

async function auditPage(page: Page, url: string, vpName: string, vpWidth: number) {
  const issues: string[] = [];

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1500);
  } catch (e) {
    issues.push(`Navigation failed: ${e}`);
    return issues;
  }

  // Check horizontal overflow
  const overflow = await checkHorizontalOverflow(page);
  if (overflow.hasOverflow) {
    issues.push(`OVERFLOW: scrollWidth=${overflow.scrollWidth} > clientWidth=${overflow.clientWidth}`);
    overflow.offendingElements.forEach(el => {
      issues.push(`  Offending: <${el.tag}> class="${el.className}" right=${el.right}`);
    });
  }

  // Check console errors
  // (console errors are captured separately via page.on('console'))

  return issues;
}

// ── Homepage tests ─────────────────────────────────────────────────────────

test.describe('Homepage', () => {
  for (const vp of VIEWPORTS) {
    test(`/ — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      await screenshot(page, `homepage-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] homepage @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }

      expect(overflow.hasOverflow, `Horizontal overflow on homepage @${vp.name}: scrollW=${overflow.scrollWidth} clientW=${overflow.clientWidth}`).toBe(false);

      // Hero text visible
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      // On mobile, hamburger should be visible
      if (vp.width < 768) {
        const hamburger = page.locator('[aria-label="Menüyü aç"]');
        await expect(hamburger).toBeVisible();
        const box = await hamburger.boundingBox();
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
      }

      if (consoleErrors.length > 0) {
        console.log(`[CONSOLE ERRORS] homepage @${vp.name}:`, consoleErrors.slice(0, 5));
      }
    });
  }
});

// ── Products listing ───────────────────────────────────────────────────────

test.describe('Products', () => {
  for (const vp of VIEWPORTS) {
    test(`/products — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      await page.goto('/products', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);

      await screenshot(page, `products-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /products @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }

      expect(overflow.hasOverflow, `Overflow on /products @${vp.name}`).toBe(false);

      // On mobile widths, filter button should be visible (not sidebar)
      if (vp.width < 1024) {
        const filterBtn = page.locator('button', { hasText: 'Filtrele' }).first();
        await expect(filterBtn).toBeVisible();
        const box = await filterBtn.boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(32);
      }

      // Product grid should render (2 cols on small, more on larger)
      const gridItems = page.locator('[class*="grid"] > *').first();
      // Just check page has content
      const h1 = page.locator('h1').first();
      await expect(h1).toBeVisible();

      if (consoleErrors.length > 0) {
        console.log(`[CONSOLE ERRORS] /products @${vp.name}:`, consoleErrors.slice(0, 3));
      }
    });
  }
});

// ── Product detail ─────────────────────────────────────────────────────────

test.describe('Product Detail', () => {
  let productSlug = 'test-product';

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    try {
      const response = await page.goto('http://localhost:5100/api/products?pageSize=1&inStockOnly=false', {
        waitUntil: 'networkidle',
        timeout: 10000,
      });
      if (response?.ok()) {
        const data = await response.json();
        const slug = data?.items?.[0]?.slug;
        if (slug) productSlug = slug;
      }
    } catch {
      // API might not be running — use a fallback
      try {
        const r2 = await page.goto('http://localhost:3000/api/products?pageSize=1', { timeout: 5000 });
        if (r2?.ok()) {
          const d = await r2.json();
          if (d?.items?.[0]?.slug) productSlug = d.items[0].slug;
        }
      } catch { /* ignore */ }
    } finally {
      await page.close();
    }
    console.log(`Using product slug: ${productSlug}`);
  });

  for (const vp of VIEWPORTS) {
    test(`/products/[slug] — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto(`/products/${productSlug}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      await screenshot(page, `product-detail-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /products/${productSlug} @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }

      expect(overflow.hasOverflow, `Overflow on /products/${productSlug} @${vp.name}`).toBe(false);
    });
  }
});

// ── Vehicle selector ───────────────────────────────────────────────────────

test.describe('Vehicle', () => {
  for (const vp of VIEWPORTS) {
    test(`/vehicle — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/vehicle', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1500);

      await screenshot(page, `vehicle-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /vehicle @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }

      expect(overflow.hasOverflow, `Overflow on /vehicle @${vp.name}`).toBe(false);
    });
  }
});

// ── Search ─────────────────────────────────────────────────────────────────

test.describe('Search', () => {
  for (const vp of VIEWPORTS) {
    test(`/search — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/search', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `search-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /search @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }

      expect(overflow.hasOverflow, `Overflow on /search @${vp.name}`).toBe(false);
    });
  }
});

// ── Garage ─────────────────────────────────────────────────────────────────

test.describe('Garage', () => {
  for (const vp of VIEWPORTS) {
    test(`/garage — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/garage', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `garage-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /garage @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }

      expect(overflow.hasOverflow, `Overflow on /garage @${vp.name}`).toBe(false);
    });
  }
});

// ── Auth pages ─────────────────────────────────────────────────────────────

test.describe('Auth pages', () => {
  for (const vp of [...MOBILE_VIEWPORTS, ...DESKTOP_VIEWPORTS.slice(0, 1)]) {
    test(`/login — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `login-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /login @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }

      expect(overflow.hasOverflow, `Overflow on /login @${vp.name}`).toBe(false);
    });

    test(`/register — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/register', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `register-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /register @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }

      expect(overflow.hasOverflow, `Overflow on /register @${vp.name}`).toBe(false);
    });
  }
});

// ── About & Contact ────────────────────────────────────────────────────────

test.describe('About & Contact', () => {
  for (const vp of [...MOBILE_VIEWPORTS, ...DESKTOP_VIEWPORTS.slice(0, 1)]) {
    test(`/about — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/about', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `about-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /about @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }
      expect(overflow.hasOverflow, `Overflow on /about @${vp.name}`).toBe(false);
    });

    test(`/contact — ${vp.name}`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.goto('/contact', { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(1000);

      await screenshot(page, `contact-${vp.name}`);

      const overflow = await checkHorizontalOverflow(page);
      if (overflow.hasOverflow) {
        console.log(`[OVERFLOW] /contact @${vp.name}: scrollWidth=${overflow.scrollWidth} clientWidth=${overflow.clientWidth}`);
        overflow.offendingElements.forEach(el =>
          console.log(`  ↳ <${el.tag}> class="${el.className}" right=${el.right}`)
        );
      }
      expect(overflow.hasOverflow, `Overflow on /contact @${vp.name}`).toBe(false);
    });
  }
});

// ── Mobile nav ─────────────────────────────────────────────────────────────

test.describe('Mobile nav drawer', () => {
  test('opens and is scrollable on 320px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(1000);

    const hamburger = page.locator('[aria-label="Menüyü aç"]');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    await page.waitForTimeout(500);

    // Drawer should be open
    const nav = page.locator('[aria-label="Mobil menü"]');
    await expect(nav).toBeVisible();

    await screenshot(page, 'mobile-nav-open-320px');

    // Check nav drawer doesn't overflow
    const overflow = await checkHorizontalOverflow(page);
    expect(overflow.hasOverflow, `Mobile nav overflow @320px`).toBe(false);
  });
});
