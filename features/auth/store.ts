// features/auth/store.ts
import { create } from 'zustand';
import { authService } from '../../services/authService';
import { User } from '@/types/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  logout: () => void;
  initialize: () => void;
  forgotPassword: (email: string) => Promise<{ message: string }>;
  resendVerification: (email: string) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,
  loading: false,
  error: null,
  
  setUser: (user) => set({ user }),
  setToken: (token) => set({ token }),
  
  login: async (credentials: { email: string; password: string }) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.login(credentials);
      set({ 
        user: result.user, 
        token: result.token,
        loading: false 
      });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Login failed' 
      });
      throw error;
    }
  },
  
  logout: () => {
    set({ user: null, token: null });
    authService.logout();
  },
  
  initialize: () => {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      const storedUser = authService.getStoredUser();
      const storedToken = authService.getStoredToken();
      
      console.log('Auth Store Initializing:', {
        storedUser: !!storedUser,
        storedToken: !!storedToken,
        tokenLength: storedToken ? storedToken.length : 0
      });
      
      set({ 
        user: storedUser, 
        token: storedToken,
        isInitialized: true 
      });
    } else {
      set({ isInitialized: true });
    }
  },
  
  forgotPassword: async (email: string) => {
    set({ loading: true, error: null });
    try {
      const result = await authService.forgotPassword({ email });
      set({ loading: false });
      return result;
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to send password reset email' 
      });
      throw error;
    }
  },
  
  clearError: () => set({ error: null }),
  
  resendVerification: async (email: string) => {
    set({ loading: true, error: null });
    try {
      // For now, just simulate the resend functionality
      // In a real implementation, this would call the auth service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      set({ loading: false });
    } catch (error: any) {
      set({ 
        loading: false, 
        error: error.message || 'Failed to resend verification email' 
      });
      throw error;
    }
  },
}));