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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const { headers: extraHeaders, ...restOptions } = options ?? {};
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extraHeaders as Record<string, string>),
  };

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

export const api = {
  products: {
    list: (params?: Record<string, string>) =>
      request(`/api/products${params ? '?' + new URLSearchParams(params) : ''}`),
    get: (slug: string) => request(`/api/products/${slug}`),
    search: (params: Record<string, string>) =>
      request(`/api/products/search?${new URLSearchParams(params)}`),
  },
  categories: {
    list: () => request('/api/categories'),
  },
  vehicles: {
    makes: () => request('/api/vehicles/makes'),
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
    list: () => request('/api/brands'),
  },
  business: {
    settings: () => request('/api/business/settings'),
    updateSettings: (data: unknown, token: string) =>
      request('/api/business/settings', { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
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
      uploadImage: async (id: string, file: File, token: string) => {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/api/admin/products/${id}/images`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
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
      create: (data: unknown, token: string) =>
        request('/api/admin/brands', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      update: (id: string, data: unknown, token: string) =>
        request(`/api/admin/brands/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      delete: (id: string, token: string) =>
        request(`/api/admin/brands/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
    },
    categories: {
      list: (token: string) =>
        request('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } }),
      create: (data: unknown, token: string) =>
        request('/api/admin/categories', { method: 'POST', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      update: (id: string, data: unknown, token: string) =>
        request(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data), headers: { Authorization: `Bearer ${token}` } }),
      delete: (id: string, token: string) =>
        request(`/api/admin/categories/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
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
