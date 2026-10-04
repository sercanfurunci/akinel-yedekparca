import { useAuthStore } from '@/store/authStore';
import type { AuthResponse } from '@/lib/types';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';

let isRefreshing = false;

async function tryRefresh(): Promise<string | null> {
  if (isRefreshing) return null;
  isRefreshing = true;
  try {
    const { refreshToken } = useAuthStore.getState();
    if (!refreshToken) return null;

    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      handleSessionExpired();
      return null;
    }

    const data = await res.json() as AuthResponse;
    useAuthStore.getState().setAuth(data.user, data.accessToken, data.refreshToken);
    return data.accessToken;
  } finally {
    isRefreshing = false;
  }
}

function handleSessionExpired(): void {
  useAuthStore.getState().clearAuth();
  if (typeof window !== 'undefined') {
    window.location.href = '/login?session=expired';
  }
}

async function uploadFile<T>(path: string, formData: FormData): Promise<T> {
  // Always read the freshest token from the store at call time — never use a stale closure.
  const token = useAuthStore.getState().accessToken;
  if (!token) throw new Error('Oturumunuz sona erdi.');

  const doFetch = (t: string) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      // Do NOT set Content-Type — browser must set multipart/form-data with the boundary.
      headers: { Authorization: `Bearer ${t}` },
      body: formData,
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    const newToken = await tryRefresh();
    if (!newToken) throw new Error('Oturumunuz sona erdi.');
    res = await doFetch(newToken);
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `API error: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// Inflight dedup map for anonymous GET requests — if the same URL is already
// in-flight, share the promise. Clears automatically when the request settles.
// Does NOT cache results; only prevents simultaneous duplicate network calls.
const _inflight = new Map<string, Promise<unknown>>();

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

  const isAnonymousGet = !options?.method || options.method === 'GET';
  const isUnauthenticated = !headers['Authorization'];

  if (isAnonymousGet && isUnauthenticated) {
    const key = path;
    const existing = _inflight.get(key);
    if (existing) return existing as Promise<T>;
    const promise = fetch(`${API_BASE}${path}`, { headers, ...restOptions })
      .then(async (res) => {
        _inflight.delete(key);
        if (res.status === 401) {
          const body = await res.json().catch(() => null) as { message?: string } | null;
          throw new Error(body?.message ?? `API error: ${res.status}`);
        }
        if (!res.ok) {
          const body = await res.json().catch(() => null) as { message?: string } | null;
          throw new Error(body?.message ?? `API error: ${res.status} ${res.statusText}`);
        }
        if (res.status === 204) return undefined;
        return res.json();
      })
      .catch((e) => { _inflight.delete(key); throw e; });
    _inflight.set(key, promise);
    return promise as Promise<T>;
  }

  const res = await fetch(`${API_BASE}${path}`, { headers, ...restOptions });

  if (res.status === 401) {
    const authHeader = headers['Authorization'];
    if (authHeader) {
      const newToken = await tryRefresh();
      if (newToken) {
        const retryRes = await fetch(`${API_BASE}${path}`, {
          ...restOptions,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        });
        if (!retryRes.ok) {
          const body = await retryRes.json().catch(() => null) as { message?: string } | null;
          throw new Error(body?.message ?? `API error: ${retryRes.status} ${retryRes.statusText}`);
        }
        if (retryRes.status === 204) return undefined as unknown as T;
        return retryRes.json();
      }
    } else {
      const body = await res.json().catch(() => null) as { message?: string } | null;
      throw new Error(body?.message ?? `API error: ${res.status} ${res.statusText}`);
    }
    throw new Error('Oturumunuz sona erdi.');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => null) as { message?: string } | null;
    throw new Error(body?.message ?? `API error: ${res.status} ${res.statusText}`);
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}

// Generic session-scoped cache + inflight dedup for stable, read-only endpoints.
// Prevents duplicate network requests when the same endpoint is called by multiple
// components on mount (e.g. Zustand hydration triggering extra renders).
function makeSessionCache<T>(fetcher: () => Promise<T>): { get: () => Promise<T>; invalidate: () => void } {
  let cache: T | null = null;
  let inflight: Promise<T> | null = null;
  return {
    get(): Promise<T> {
      if (cache !== null) return Promise.resolve(cache);
      if (inflight) return inflight;
      inflight = fetcher()
        .then((d) => { cache = d; inflight = null; return d; })
        .catch((e) => { inflight = null; throw e; });
      return inflight;
    },
    invalidate() { cache = null; inflight = null; },
  };
}

const _brandCache    = makeSessionCache<unknown>(() => request('/api/brands'));
const _categoryCache = makeSessionCache<unknown>(() => request('/api/categories'));
const _heroCache     = makeSessionCache<unknown>(() => request('/api/hero/slides'));
const _makesCache    = makeSessionCache<unknown>(() => request('/api/vehicles/makes'));
const _bizCache      = makeSessionCache<unknown>(() => request('/api/business/settings'));

export const api = {
  products: {
    list: (params?: Record<string, string>) =>
      request(`/api/products${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (slug: string) => request(`/api/products/${slug}`),
    search: (params: Record<string, string>) =>
      request(`/api/products/search?${new URLSearchParams(params)}`),
    related: (slug: string, engineId?: string) => {
      const qs = engineId ? `?engineId=${encodeURIComponent(engineId)}` : '';
      return request(`/api/products/${encodeURIComponent(slug)}/related${qs}`);
    },
    notifyStock: (productId: string, email: string) =>
      request(`/api/products/${productId}/notify-stock`, {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
  },
  categories: {
    list: () => _categoryCache.get(),
  },
  search: {
    suggest: (q: string) =>
      request(`/api/search/suggest?q=${encodeURIComponent(q)}`),
  },
  vehicles: {
    makes: () => _makesCache.get(),
    models: (makeId: string) => request(`/api/vehicles/makes/${makeId}/models`),
    generations: (modelId: string) => request(`/api/vehicles/models/${modelId}/generations`),
    engines: (generationId: string) => request(`/api/vehicles/generations/${generationId}/engines`),
    context: (engineId: string) => request(`/api/vehicles/context/${engineId}`),
    products: (engineId: string, page = 1) => request(`/api/vehicles/${engineId}/products?page=${page}`),
    decodeVin: (vin: string) => request('/api/vehicles/vin-decode', { method: 'POST', body: JSON.stringify({ vin }) }),
    search: (q: string) => request(`/api/vehicles/search?q=${encodeURIComponent(q)}`),
  },
  auth: {
    login: (data: { email: string; password: string }) =>
      request('/api/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    register: (data: unknown) =>
      request('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    refresh: (refreshToken: string) =>
      request('/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken }) }),
  },
  garage: {
    list: (token: string) =>
      request('/api/garage', { headers: { Authorization: `Bearer ${token}` } }),
    add: (data: { vehicleEngineId: string; nickname?: string; licensePlate?: string; year?: number }, token: string) =>
      request('/api/garage', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
    remove: (id: string, token: string) =>
      request(`/api/garage/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    setDefault: (id: string, token: string) =>
      request(`/api/garage/${id}/default`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }),
  },
  brands: {
    list: () => _brandCache.get(),
  },
  hero: {
    slides: () => _heroCache.get(),
  },
  business: {
    settings: () => _bizCache.get(),
    updateSettings: (data: unknown, token: string) => {
      _bizCache.invalidate();
      return request('/api/business/settings', { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } });
    },
  },
  orders: {
    checkout: (data: unknown) =>
      request('/api/orders/checkout', { method: 'POST', body: JSON.stringify(data), credentials: 'include' as RequestCredentials }),
    list: (token: string) =>
      request('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
    get: (id: string, token: string) =>
      request(`/api/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
  },
  admin: {
    orders: {
      list: (page: number, pageSize: number, token: string) =>
        request(`/api/admin/orders?page=${page}&pageSize=${pageSize}`, { headers: { Authorization: `Bearer ${token}` } }),
      get: (id: string, token: string) =>
        request(`/api/admin/orders/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      updateStatus: (id: string, status: number, token: string) =>
        request(`/api/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }), headers: { Authorization: `Bearer ${token}` } }),
    },
    products: {
      list: (params: Record<string, string>, token: string) =>
        request(`/api/admin/products${params ? '?' + new URLSearchParams(params) : ''}`, { headers: { Authorization: `Bearer ${token}` } }),
      getById: (id: string, token: string) =>
        request(`/api/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
      create: (data: unknown, token: string) =>
        request('/api/admin/products', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      update: (id: string, data: unknown, token: string) =>
        request(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      delete: (id: string, token: string) =>
        request(`/api/admin/products/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
      getOem: (id: string, token: string) =>
        request(`/api/admin/products/${id}/oem`, { headers: { Authorization: `Bearer ${token}` } }),
      addOem: (id: string, data: { number: string; manufacturer?: string }, token: string) =>
        request(`/api/admin/products/${id}/oem`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      removeOem: (id: string, oemId: string, token: string) =>
        request(`/api/admin/products/${id}/oem/${oemId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
      getCompatibility: (id: string, token: string) =>
        request(`/api/admin/products/${id}/compatibility`, { headers: { Authorization: `Bearer ${token}` } }),
      addCompatibility: (id: string, data: { vehicleEngineId: string; notes?: string }, token: string) =>
        request(`/api/admin/products/${id}/compatibility`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      removeCompatibility: (id: string, engineId: string, token: string) =>
        request(`/api/admin/products/${id}/compatibility/${engineId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
      getImages: (id: string, token: string) =>
        request(`/api/admin/products/${id}/images`, { headers: { Authorization: `Bearer ${token}` } }),
      uploadImage: async (id: string, file: File, _token?: string) => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadFile(`/api/admin/products/${id}/images`, formData);
      },
      setPrimaryImage: (id: string, imageId: string, token: string) =>
        request(`/api/admin/products/${id}/images/${imageId}/primary`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` } }),
      deleteImage: (id: string, imageId: string, token: string) =>
        request(`/api/admin/products/${id}/images/${imageId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    },
    stock: {
      update: (productId: string, quantity: number, token: string) =>
        request(`/api/admin/stock/${productId}`, { method: 'PUT', body: JSON.stringify({ quantity }), headers: { Authorization: `Bearer ${token}` } }),
    },
    brands: {
      list: (token: string) =>
        request('/api/admin/brands', { headers: { Authorization: `Bearer ${token}` } }),
      create: (data: unknown, token: string) => { _brandCache.invalidate(); return request('/api/admin/brands', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }); },
      update: (id: string, data: unknown, token: string) => { _brandCache.invalidate(); return request(`/api/admin/brands/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }); },
      delete: (id: string, token: string) => { _brandCache.invalidate(); return request(`/api/admin/brands/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); },
    },
    categories: {
      list: (token: string) =>
        request('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
      create: (data: unknown, token: string) => { _categoryCache.invalidate(); return request('/api/admin/categories', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }); },
      update: (id: string, data: unknown, token: string) => { _categoryCache.invalidate(); return request(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }); },
      delete: (id: string, token: string) => { _categoryCache.invalidate(); return request(`/api/admin/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); },
      uploadImage: (id: string, file: File, token: string) => {
        _categoryCache.invalidate();
        const form = new FormData();
        form.append('file', file);
        return request(`/api/admin/categories/${id}/image`, { method: 'POST', body: form, headers: { Authorization: `Bearer ${token}` } });
      },
    },
    hero: {
      list: (token: string) =>
        request('/api/admin/hero/slides', { headers: { Authorization: `Bearer ${token}` } }),
      create: (data: { title?: string; subtitle?: string; ctaText?: string; ctaUrl?: string; displayOrder?: number; isActive?: boolean }, token: string) => { _heroCache.invalidate(); return request('/api/admin/hero/slides', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }); },
      update: (id: string, data: { title?: string; subtitle?: string; ctaText?: string; ctaUrl?: string; displayOrder?: number; isActive?: boolean }, token: string) => { _heroCache.invalidate(); return request(`/api/admin/hero/slides/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }); },
      uploadImage: async (id: string, file: File, _token?: string) => {
        _heroCache.invalidate();
        const formData = new FormData();
        formData.append('file', file);
        return uploadFile(`/api/admin/hero/slides/${id}/image`, formData);
      },
      toggle: (id: string, token: string) => { _heroCache.invalidate(); return request(`/api/admin/hero/slides/${id}/toggle`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }); },
      delete: (id: string, token: string) => { _heroCache.invalidate(); return request(`/api/admin/hero/slides/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }); },
    },
    analytics: {
      get: (period: string, token: string) =>
        request(`/api/admin/analytics?period=${encodeURIComponent(period)}`, { headers: { Authorization: `Bearer ${token}` } }),
    },
    import: {
      previewProducts: async (file: File, allowOverwriteWithEmpty = false) => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadFile<unknown>(`/api/admin/import/products/preview?allowOverwriteWithEmpty=${allowOverwriteWithEmpty}`, formData);
      },
      commitProducts: (previewToken: string, token: string) =>
        request('/api/admin/import/products/commit', { method: 'POST', body: JSON.stringify({ previewToken }), headers: { Authorization: `Bearer ${token}` } }),
      previewStockPrice: async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return uploadFile<unknown>('/api/admin/import/stock-price/preview', formData);
      },
      commitStockPrice: (previewToken: string, token: string) =>
        request('/api/admin/import/stock-price/commit', { method: 'POST', body: JSON.stringify({ previewToken }), headers: { Authorization: `Bearer ${token}` } }),
      history: (token: string) =>
        request('/api/admin/import/history', { headers: { Authorization: `Bearer ${token}` } }),
    },
    vehicles: {
      getMakes: (token: string, params?: { search?: string; page?: number; pageSize?: number }) => {
        const qs = params ? '?' + new URLSearchParams(
          Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
        ) : '';
        return request(`/api/admin/vehicles/makes${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      },
      createMake: (data: { name: string }, token: string) =>
        request('/api/admin/vehicles/makes', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      updateMake: (id: string, data: { name: string }, token: string) =>
        request(`/api/admin/vehicles/makes/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      deleteMake: (id: string, token: string) =>
        request(`/api/admin/vehicles/makes/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

      getModels: (makeId: string, token: string, search?: string) => {
        const qs = search ? `?search=${encodeURIComponent(search)}` : '';
        return request(`/api/admin/vehicles/makes/${makeId}/models${qs}`, { headers: { Authorization: `Bearer ${token}` } });
      },
      createModel: (makeId: string, data: { name: string }, token: string) =>
        request(`/api/admin/vehicles/makes/${makeId}/models`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      updateModel: (id: string, data: { name: string }, token: string) =>
        request(`/api/admin/vehicles/models/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      deleteModel: (id: string, token: string) =>
        request(`/api/admin/vehicles/models/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

      getGenerations: (modelId: string, token: string) =>
        request(`/api/admin/vehicles/models/${modelId}/generations`, { headers: { Authorization: `Bearer ${token}` } }),
      createGeneration: (modelId: string, data: unknown, token: string) =>
        request(`/api/admin/vehicles/models/${modelId}/generations`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      updateGeneration: (id: string, data: unknown, token: string) =>
        request(`/api/admin/vehicles/generations/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      deleteGeneration: (id: string, token: string) =>
        request(`/api/admin/vehicles/generations/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

      getEngines: (generationId: string, token: string) =>
        request(`/api/admin/vehicles/generations/${generationId}/engines`, { headers: { Authorization: `Bearer ${token}` } }),
      createEngine: (generationId: string, data: unknown, token: string) =>
        request(`/api/admin/vehicles/generations/${generationId}/engines`, { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      updateEngine: (id: string, data: unknown, token: string) =>
        request(`/api/admin/vehicles/engines/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      deleteEngine: (id: string, token: string) =>
        request(`/api/admin/vehicles/engines/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),

      search: (q: string, token: string) =>
        request(`/api/admin/vehicles/search?q=${encodeURIComponent(q)}`, { headers: { Authorization: `Bearer ${token}` } }),
    },
  },
};
