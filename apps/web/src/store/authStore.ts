import posthog from 'posthog-js';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';
import { isPostHogConfigured } from '@/lib/analytics';

function identifyUser(user: User): void {
  if (typeof window === 'undefined' || !isPostHogConfigured || !user.id) return;

  posthog.identify(user.id, {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    role: user.role,
  });
}

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  _hasHydrated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      _hasHydrated: false,
      setAuth: (user, accessToken, refreshToken) => {
        const previousUser = get().user;
        if (isPostHogConfigured && previousUser?.id && previousUser.id !== user.id) {
          posthog.reset();
        }
        set({ user, accessToken, refreshToken });
        if (previousUser?.id !== user.id) {
          identifyUser(user);
        }
      },
      clearAuth: () => {
        if (isPostHogConfigured && get().user) {
          posthog.reset();
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'akinel-auth',
      // refreshToken is kept in memory only — not persisted to localStorage
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const token = state.accessToken;
          if (token && state.user) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
              if (payload.exp && Date.now() / 1000 > payload.exp) {
                // Token expired and no refreshToken in memory — force logout
                state.clearAuth();
                if (typeof window !== 'undefined') {
                  window.location.href = '/login?session=expired';
                }
              } else {
                identifyUser(state.user);
              }
            } catch {
              state.clearAuth();
            }
          }
          state.setHasHydrated(true);
        }
      },
    }
  )
);
