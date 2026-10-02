const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';

export interface FeatureFlags {
  vinSearch: boolean;
  stockNotifications: boolean;
  analytics: boolean;
  maintenanceMode: boolean;
}

// Safe defaults — all non-destructive features enabled, maintenanceMode off
const SAFE_DEFAULTS: FeatureFlags = {
  vinSearch: true,
  stockNotifications: true,
  analytics: true,
  maintenanceMode: false,
};

let cachedFlags: FeatureFlags | null = null;

/**
 * Fetches feature flags from the API.
 * Returns safe defaults if the request fails — the app should never be blocked by a missing flag.
 * Result is cached in memory for the lifetime of the page.
 */
export async function getFeatureFlags(): Promise<FeatureFlags> {
  if (cachedFlags) return cachedFlags;
  try {
    const res = await fetch(`${API_BASE}/api/features`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return SAFE_DEFAULTS;
    const data = await res.json();
    const flags: FeatureFlags = { ...SAFE_DEFAULTS, ...data };
    cachedFlags = flags;
    return flags;
  } catch {
    return SAFE_DEFAULTS;
  }
}

export function isEnabled(flags: FeatureFlags, feature: keyof FeatureFlags): boolean {
  return flags[feature] ?? SAFE_DEFAULTS[feature];
}

/*
 * KILL-SWITCH BEHAVIOUR:
 *
 * Feature       | If disabled
 * ─────────────────────────────────────────────────────────────────────
 * VinSearch     | Backend returns 503. Frontend: hide VIN search UI.
 * StockNotifs   | Hide "Stok bildir" button on product pages.
 * Analytics     | PostHog initialisation is skipped.
 * MaintenanceMd | Show /maintenance page; hide all shop content.
 *
 * To toggle a flag WITHOUT a redeploy:
 *   1. Update Features section in appsettings.json (or env var Features__VinSearch=false)
 *   2. Restart the API service in Railway
 *   3. Frontend caches flags for 60s — change visible within ~1 minute
 */
