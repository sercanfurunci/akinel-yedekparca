import { create } from 'zustand';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5100';

export interface CartItem {
  productId: string;
  productName: string;
  brandName: string;
  slug: string;
  imageUrl?: string;
  price: number;
  currency: string;
  quantity: number;
  lineTotal: number;
}

interface BasketResponse {
  items: CartItem[];
  subTotal: number;
  totalItems: number;
}

interface CartStore {
  items: CartItem[];
  subTotal: number;
  totalItems: number;
  isLoading: boolean;
  isOpen: boolean;
  fetchCart: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
}

async function basketRequest(path: string, options?: RequestInit): Promise<BasketResponse> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  if (res.status === 204) return { items: [], subTotal: 0, totalItems: 0 };
  return res.json();
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  subTotal: 0,
  totalItems: 0,
  isLoading: false,
  isOpen: false,

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const data = await basketRequest('/api/basket');
      set({ items: data.items, subTotal: data.subTotal, totalItems: data.totalItems });
    } catch {
      // silent — don't crash if basket unavailable
    } finally {
      set({ isLoading: false });
    }
  },

  addItem: async (productId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const data = await basketRequest('/api/basket/items', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity }),
      });
      set({ items: data.items, subTotal: data.subTotal, totalItems: data.totalItems, isOpen: true });
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (productId, quantity) => {
    set({ isLoading: true });
    try {
      const data = await basketRequest(`/api/basket/items/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      });
      set({ items: data.items, subTotal: data.subTotal, totalItems: data.totalItems });
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (productId) => {
    set({ isLoading: true });
    try {
      const data = await basketRequest(`/api/basket/items/${productId}`, {
        method: 'DELETE',
      });
      set({ items: data.items, subTotal: data.subTotal, totalItems: data.totalItems });
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      const data = await basketRequest('/api/basket', { method: 'DELETE' });
      set({ items: data.items, subTotal: data.subTotal, totalItems: data.totalItems });
    } finally {
      set({ isLoading: false });
    }
  },

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
}));
