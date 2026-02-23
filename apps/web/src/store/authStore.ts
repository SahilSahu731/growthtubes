import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';
import { AxiosError } from 'axios';

interface User {
  id: string;
  email: string;
  isEmailVerified: boolean;
  profile?: {
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    role: string;
    plan: string;
  } | null;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  passwordErrors: string[];
  _hasHydrated: boolean;

  // Signup flow
  pendingEmail: string | null;
  requiresVerification: boolean;
  otpSent: boolean;
  resendCooldown: number;

  // Actions
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  resendOTP: (email: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getMe: () => Promise<void>;
  clearError: () => void;
  reset: () => void;
  setHasHydrated: (state: boolean) => void;
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message || 'Something went wrong. Please try again.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

const getPasswordErrors = (error: unknown): string[] => {
  if (error instanceof AxiosError) {
    return error.response?.data?.errors || [];
  }
  return [];
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      passwordErrors: [],
      pendingEmail: null,
      requiresVerification: false,
      otpSent: false,
      resendCooldown: 0,
      _hasHydrated: false,

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      signup: async (email: string, password: string, fullName?: string) => {
        set({ isLoading: true, error: null, passwordErrors: [] });
        try {
          await api.post('/auth/signup', { email, password, fullName });

          set({
            isLoading: false,
            pendingEmail: email,
            requiresVerification: true,
            otpSent: true,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error),
            passwordErrors: getPasswordErrors(error),
          });
          throw error;
        }
      },

      verifyOTP: async (email: string, otp: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data } = await api.post('/auth/verify-otp', { email, otp });

          // Store access token
          localStorage.setItem('accessToken', data.data.accessToken);

          set({
            isLoading: false,
            user: data.data.user,
            isAuthenticated: true,
            requiresVerification: false,
            pendingEmail: null,
            otpSent: false,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error),
          });
          throw error;
        }
      },

      resendOTP: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.post('/auth/resend-otp', { email });
          set({ isLoading: false, otpSent: true, resendCooldown: 60 });

          // Start cooldown timer
          const interval = setInterval(() => {
            const currentCooldown = get().resendCooldown;
            if (currentCooldown <= 1) {
              clearInterval(interval);
              set({ resendCooldown: 0 });
            } else {
              set({ resendCooldown: currentCooldown - 1 });
            }
          }, 1000);
        } catch (error) {
          set({
            isLoading: false,
            error: getErrorMessage(error),
          });
          throw error;
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null, passwordErrors: [] });
        try {
          const { data } = await api.post('/auth/login', { email, password });

          // Check if login requires verification
          if (data.data?.requiresVerification) {
            set({
              isLoading: false,
              pendingEmail: email,
              requiresVerification: true,
              otpSent: true,
            });
            return;
          }

          // Store access token
          localStorage.setItem('accessToken', data.data.accessToken);

          set({
            isLoading: false,
            user: data.data.user,
            isAuthenticated: true,
          });
        } catch (error) {
          // Check if verification required (403 with requiresVerification)
          if (error instanceof AxiosError && error.response?.status === 403 && error.response?.data?.data?.requiresVerification) {
            set({
              isLoading: false,
              pendingEmail: email,
              requiresVerification: true,
              otpSent: true,
              error: null,
            });
            return;
          }

          set({
            isLoading: false,
            error: getErrorMessage(error),
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch {
          // Logout even if API call fails
        } finally {
          localStorage.removeItem('accessToken');
          set({
            user: null,
            isAuthenticated: false,
            pendingEmail: null,
            requiresVerification: false,
            otpSent: false,
            error: null,
          });
        }
      },

      getMe: async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          // No token — clear any stale persisted auth state
          set({ user: null, isAuthenticated: false, isLoading: false });
          return;
        }

        set({ isLoading: true });
        try {
          const { data } = await api.get('/auth/me');
          set({
            isLoading: false,
            user: data.data.user,
            isAuthenticated: true,
          });
        } catch {
          localStorage.removeItem('accessToken');
          set({
            isLoading: false,
            user: null,
            isAuthenticated: false,
          });
        }
      },

      clearError: () => set({ error: null, passwordErrors: [] }),

      reset: () =>
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          passwordErrors: [],
          pendingEmail: null,
          requiresVerification: false,
          otpSent: false,
          resendCooldown: 0,
        }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist user data and auth status — NOT loading/error/transient state
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
