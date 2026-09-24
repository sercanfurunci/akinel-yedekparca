import { Page } from '@playwright/test';

export const ADMIN_EMAIL = 'admin@akinel.com';
export const ADMIN_PASSWORD = 'Admin123!';
export const BASE_URL = 'http://localhost:3000';
export const API_URL = 'http://localhost:5100';

export async function login(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10_000 });
}

export async function getAdminToken(): Promise<string> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = await res.json() as { accessToken: string };
  return data.accessToken;
}

// Full cascade delete of the test hierarchy
export async function apiCleanupTestHierarchy(testMakeName: string) {
  const token = await getAdminToken();
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const res = await fetch(`${API_URL}/api/admin/vehicles/makes?search=${encodeURIComponent(testMakeName)}&pageSize=10`, { headers: h });
  const data = await res.json() as { items: Array<{ id: string; name: string }> };

  for (const make of data.items) {
    if (make.name !== testMakeName) continue;

    const modelsRes = await fetch(`${API_URL}/api/admin/vehicles/makes/${make.id}/models`, { headers: h });
    const models = await modelsRes.json() as Array<{ id: string }>;

    for (const model of models) {
      const gensRes = await fetch(`${API_URL}/api/admin/vehicles/models/${model.id}/generations`, { headers: h });
      const gens = await gensRes.json() as Array<{ id: string }>;

      for (const gen of gens) {
        const engRes = await fetch(`${API_URL}/api/admin/vehicles/generations/${gen.id}/engines`, { headers: h });
        const engines = await engRes.json() as Array<{ id: string }>;
        for (const eng of engines) {
          await fetch(`${API_URL}/api/admin/vehicles/engines/${eng.id}`, { method: 'DELETE', headers: h });
        }
        await fetch(`${API_URL}/api/admin/vehicles/generations/${gen.id}`, { method: 'DELETE', headers: h });
      }
      await fetch(`${API_URL}/api/admin/vehicles/models/${model.id}`, { method: 'DELETE', headers: h });
    }
    await fetch(`${API_URL}/api/admin/vehicles/makes/${make.id}`, { method: 'DELETE', headers: h });
  }
}

// Click the Sil confirm button inside the ConfirmDelete dialog only
export async function confirmDelete(page: Page) {
  // Wait for the confirm dialog header
  await page.waitForSelector('text=Silme Onayı');
  // Click the destructive Sil button scoped to the dialog box (not a row nav button)
  await page.locator('.fixed.inset-0.z-50 .bg-white.rounded-xl button').filter({ hasText: /^Sil$/ }).click();
}

// Wait for the loading state to clear and then for rows to appear
export async function waitForTableRows(page: Page) {
  // Wait for "Yükleniyor..." to disappear
  await page.waitForFunction(() => !document.body.innerText.includes('Yükleniyor...'), { timeout: 8_000 });
}
