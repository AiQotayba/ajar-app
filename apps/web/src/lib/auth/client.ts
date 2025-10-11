"use client"

import Cookies from 'js-cookie';

const TOKEN_KEY = 'ajar_token';
const USER_KEY = 'ajar_user';

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

// Cookie options
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  path: '/',
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production'
};

/**
 * Check if user is authenticated (client-side)
 */
export function isAuthenticated(): boolean {
  const token = getToken();
  return !!token;
}

/**
 * Get authentication token from cookies (client-side)
 */
export function getToken(): string | null {
  return Cookies.get(TOKEN_KEY) || null;
}

/**
 * Store authentication token in cookies (client-side)
 */
export function storeToken(token: string): void {
  Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
}

/**
 * Remove authentication token from cookies (client-side)
 */
export function removeToken(): void {
  Cookies.remove(TOKEN_KEY, { path: '/' });
  Cookies.remove(USER_KEY, { path: '/' });
}

/**
 * Store user data in cookies (client-side)
 */
export function storeUser(user: User): void {
  const userData = JSON.stringify(user);
  Cookies.set(USER_KEY, userData, COOKIE_OPTIONS);
}

/**
 * Get user data from cookies (client-side)
 */
export function getUser(): User | null {
  const userData = Cookies.get(USER_KEY);
  
  if (!userData) {
    return null;
  }

  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
}

/**
 * Clear all authentication data (client-side)
 */
export function clearAuth(): void {
  removeToken();
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
 * Handle authentication response and store data (client-side)
 */
export function handleAuthResponse(response: AuthResponse): void {
  if (response.success && response.access_token) {
    storeToken(response.access_token);
    storeUser(response.data);
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
