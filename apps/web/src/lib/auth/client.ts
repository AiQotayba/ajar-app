"use client"

import { store } from '@/lib/redux/store';
import { setAuth, setUser, setToken, clearAuth as clearAuthAction, updateUser } from '@/lib/redux/slices/authSlice';
import Cookies from 'js-cookie';

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  email: string;
  role: string;
  status: string;
  phone_verified: boolean;
  avatar: string;
  avatar_url: string;
  language: string | null;
  wallet_balance: number;
  notifications_unread_count: number;
  listings_count: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  key: string;
  data: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const state = store.getState();
    return !!state.auth.token && state.auth.isAuthenticated;
  } catch {
    return false;
  }
}

/**
 * Get authentication token from Redux store (client-side)
 */
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const state = store.getState();
    console.log(state);
    
    return state.auth.token;
  } catch {
    return null;
  }
}

/**
 * Store authentication token in Redux store and cookies (client-side)
 */
export function storeToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    // Store in Redux (for client-side)
    store.dispatch(setToken(token));
    // Store in cookies (for middleware and server-side)
    Cookies.set('ajar_token', token, {
      expires: 7, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  } catch (error) {
    console.error('Error storing token:', error);
  }
}

/**
 * Remove authentication token from Redux store and cookies (client-side)
 */
export function removeToken(): void {
  if (typeof window === 'undefined') return;
  try {
    // Remove from Redux
    store.dispatch(clearAuthAction());
    // Remove from cookies
    Cookies.remove('ajar_token', { path: '/' });
    Cookies.remove('ajar_user', { path: '/' });
  } catch (error) {
    console.error('Error removing token:', error);
  }
}

/**
 * Store user data in Redux store and cookies (client-side)
 */
export function storeUser(user: User): void {
  if (typeof window === 'undefined') return;
  try {
    // Store in Redux (for client-side)
    store.dispatch(setUser(user));
    // Store in cookies (for server-side)
    const userData = JSON.stringify(user);
    Cookies.set('ajar_user', userData, {
      expires: 7, // 7 days
      path: '/',
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });
  } catch (error) {
    console.error('Error storing user:', error);
  }
}

/**
 * Get user data from Redux store (client-side)
 */
export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const state = store.getState();
    return state.auth.user;
  } catch {
    return null;
  }
}

/**
 * Clear all authentication data from Redux and cookies (client-side)
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  try {
    // Clear from Redux
    store.dispatch(clearAuthAction());
    // Clear from cookies
    Cookies.remove('ajar_token', { path: '/' });
    Cookies.remove('ajar_user', { path: '/' });
  } catch (error) {
    console.error('Error clearing auth:', error);
  }
}

/**
 * Get authentication headers for API requests (client-side)
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Handle authentication response and store data in Redux and cookies (client-side)
 */
export function handleAuthResponse(response: AuthResponse): void {
  if (typeof window === 'undefined') return;
  if (response.success && response.access_token) {
    try {
      console.log(response);
      
      // Store in Redux (for client-side)
      store.dispatch(setAuth(response));
      // Store in cookies (for middleware and server-side)
      Cookies.set('ajar_token', response.access_token, {
        expires: 7, // 7 days
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      const userData = JSON.stringify(response.data);
      Cookies.set('ajar_user', userData, {
        expires: 7, // 7 days
        path: '/',
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
    } catch (error) {
      console.error('Error handling auth response:', error);
    }
  }
}

/**
 * Check if user has specific role (client-side)
 */
export function hasRole(role: string): boolean {
  const user = getUser();
  return user?.role === role;
}

/**
 * Check if user has specific status (client-side)
 */
export function hasStatus(status: string): boolean {
  const user = getUser();
  return user?.status === status;
}

/**
 * Get user's full name (client-side)
 */
export function getUserDisplayName(): string {
  const user = getUser();
  return user?.full_name || 'المستخدم';
}

/**
 * Check if user is verified (client-side)
 */
export function isUserVerified(): boolean {
  const user = getUser();
  return user?.phone_verified || false;
}

/**
 * Update user data in Redux store (client-side)
 */
export function updateUserData(userData: Partial<User>): void {
  if (typeof window === 'undefined') return;
  try {
    store.dispatch(updateUser(userData));
  } catch (error) {
    console.error('Error updating user data:', error);
  }
}
