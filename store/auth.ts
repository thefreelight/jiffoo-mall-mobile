/**
 * Auth Store - Zustand store for authentication state management
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export type OAuthProvider = 'google' | 'apple' | 'facebook';

export interface AuthState {
  // State
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  biometricEnabled: boolean;
  rememberMe: boolean;

  // Actions
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithOAuth: (provider: OAuthProvider) => Promise<void>;
  loginWithBiometric: () => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthToken: () => Promise<void>;
  loadToken: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  enableBiometric: (enabled: boolean) => Promise<void>;
  syncUserData: () => Promise<void>;
  // Token accessors for API service
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<boolean>;
}

// Storage keys
const TOKEN_KEY = 'jiffoo_auth_token';
const REFRESH_TOKEN_KEY = 'jiffoo_refresh_token';
const USER_KEY = 'jiffoo_user';
const BIOMETRIC_KEY = 'jiffoo_biometric_enabled';
const REMEMBER_ME_KEY = 'jiffoo_remember_me';

// API base URL
const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Secure storage service wrapper
 */
export const secureStorage = {
  setToken: async (token: string) => {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  },

  getToken: async () => {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  },

  removeToken: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  },

  setRefreshToken: async (token: string) => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  getRefreshToken: async () => {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  removeRefreshToken: async () => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  },

  setUser: async (user: User) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
  },

  getUser: async (): Promise<User | null> => {
    const userJson = await SecureStore.getItemAsync(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  removeUser: async () => {
    await SecureStore.deleteItemAsync(USER_KEY);
  },

  setBiometricEnabled: async (enabled: boolean) => {
    await SecureStore.setItemAsync(BIOMETRIC_KEY, enabled ? 'true' : 'false');
  },

  getBiometricEnabled: async (): Promise<boolean> => {
    const value = await SecureStore.getItemAsync(BIOMETRIC_KEY);
    return value === 'true';
  },

  setRememberMe: async (enabled: boolean) => {
    await SecureStore.setItemAsync(REMEMBER_ME_KEY, enabled ? 'true' : 'false');
  },

  getRememberMe: async (): Promise<boolean> => {
    const value = await SecureStore.getItemAsync(REMEMBER_ME_KEY);
    return value === 'true';
  },

  clearAll: async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    // Keep biometric and remember me settings
  },
};

export const useAuthStore = create<AuthState>((set, get) => ({
  // Initial state
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
  biometricEnabled: false,
  rememberMe: false,

  /**
   * Email/password login
   * Requirements: 2.1, 2.6
   */
  login: async (email: string, password: string, rememberMe: boolean = false) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid credentials');
      }

      const data = await response.json();
      const { token, refreshToken, user } = data;

      // Store credentials securely
      await secureStorage.setToken(token);
      if (refreshToken) {
        await secureStorage.setRefreshToken(refreshToken);
      }
      await secureStorage.setUser(user);
      await secureStorage.setRememberMe(rememberMe);

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        rememberMe,
      });

      // Sync user data after login
      await get().syncUserData();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * OAuth login (Google, Apple, Facebook)
   * Requirements: 2.2
   */
  loginWithOAuth: async (provider: OAuthProvider) => {
    set({ isLoading: true });

    try {
      // OAuth flow would be implemented here using expo-auth-session
      // For now, this is a placeholder that would integrate with:
      // - Google: expo-auth-session with Google provider
      // - Apple: expo-apple-authentication
      // - Facebook: expo-auth-session with Facebook provider

      const response = await fetch(`${API_BASE}/auth/oauth/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // OAuth token would be passed here after native OAuth flow
      });

      if (!response.ok) {
        throw new Error(`OAuth login failed for ${provider}`);
      }

      const data = await response.json();
      const { token, refreshToken, user } = data;

      await secureStorage.setToken(token);
      if (refreshToken) {
        await secureStorage.setRefreshToken(refreshToken);
      }
      await secureStorage.setUser(user);

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });

      await get().syncUserData();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Biometric authentication (fingerprint, Face ID)
   * Requirements: 2.3
   */
  loginWithBiometric: async () => {
    const { biometricEnabled } = get();

    if (!biometricEnabled) {
      throw new Error('Biometric authentication is not enabled');
    }

    set({ isLoading: true });

    try {
      // Biometric authentication is handled by expo-local-authentication
      // This function assumes biometric auth has already been verified
      // and we just need to restore the session

      const token = await secureStorage.getToken();
      const user = await secureStorage.getUser();

      if (!token || !user) {
        throw new Error('No stored credentials found');
      }

      // Verify token is still valid
      const response = await fetch(`${API_BASE}/auth/verify`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        // Try to refresh token
        await get().refreshAuthToken();
      }

      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * User registration
   * Requirements: 2.1
   */
  register: async (name: string, email: string, password: string) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const data = await response.json();
      const { token, refreshToken, user } = data;

      await secureStorage.setToken(token);
      if (refreshToken) {
        await secureStorage.setRefreshToken(refreshToken);
      }
      await secureStorage.setUser(user);

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  /**
   * Logout and clear all stored credentials
   * Requirements: 2.1
   */
  logout: async () => {
    await secureStorage.clearAll();
    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
    });
  },

  /**
   * Refresh authentication token
   * Requirements: 2.4
   */
  refreshAuthToken: async () => {
    const refreshToken = await secureStorage.getRefreshToken();

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        // Refresh token expired, need to re-login
        await get().logout();
        throw new Error('Session expired, please login again');
      }

      const data = await response.json();
      const { token, refreshToken: newRefreshToken } = data;

      await secureStorage.setToken(token);
      if (newRefreshToken) {
        await secureStorage.setRefreshToken(newRefreshToken);
      }

      set({ token, refreshToken: newRefreshToken || refreshToken });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Load stored token on app startup
   * Requirements: 2.4, 2.6
   */
  loadToken: async () => {
    try {
      const [token, user, biometricEnabled, rememberMe] = await Promise.all([
        secureStorage.getToken(),
        secureStorage.getUser(),
        secureStorage.getBiometricEnabled(),
        secureStorage.getRememberMe(),
      ]);

      set({ biometricEnabled, rememberMe });

      if (token && user && rememberMe) {
        // Verify token is still valid
        try {
          const response = await fetch(`${API_BASE}/auth/verify`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });

          if (response.ok) {
            set({
              user,
              token,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          }
        } catch {
          // Token verification failed, try refresh
          try {
            await get().refreshAuthToken();
            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
            return;
          } catch {
            // Refresh failed, clear credentials
            await secureStorage.clearAll();
          }
        }
      }

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  /**
   * Request password reset
   * Requirements: 2.7
   */
  resetPassword: async (email: string) => {
    const response = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Password reset failed');
    }
  },

  /**
   * Enable/disable biometric authentication
   * Requirements: 2.3
   */
  enableBiometric: async (enabled: boolean) => {
    await secureStorage.setBiometricEnabled(enabled);
    set({ biometricEnabled: enabled });
  },

  /**
   * Sync user data after login (cart, wishlist)
   * Requirements: 2.5
   */
  syncUserData: async () => {
    const { token } = get();

    if (!token) return;

    try {
      // Sync cart
      const cartResponse = await fetch(`${API_BASE}/cart`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (cartResponse.ok) {
        const cartData = await cartResponse.json();
        // Cart store would handle this data
        // useCartStore.getState().setItems(cartData.items);
      }

      // Sync wishlist
      const wishlistResponse = await fetch(`${API_BASE}/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        // Wishlist store would handle this data
      }
    } catch (error) {
      console.error('Failed to sync user data:', error);
    }
  },

  /**
   * Get current access token
   */
  getAccessToken: () => {
    return get().token;
  },

  /**
   * Refresh access token and return success status
   */
  refreshAccessToken: async () => {
    try {
      await get().refreshAuthToken();
      return true;
    } catch {
      return false;
    }
  },
}));
