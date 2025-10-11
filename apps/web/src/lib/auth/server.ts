import { cookies } from 'next/headers';

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

/**
 * Get authentication token from cookies (server-side)
 */
export async function getServerToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(TOKEN_KEY)?.value || null;
  } catch {
    return null;
  }
}

/**
 * Get user data from cookies (server-side)
 */
export async function getServerUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const userData = cookieStore.get(USER_KEY)?.value;
    
    if (!userData) {
      return null;
    }
    
    return JSON.parse(decodeURIComponent(userData));
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated (server-side)
 */
export async function isServerAuthenticated(): Promise<boolean> {
  const token = await getServerToken();
  return !!token;
}

/**
 * Get authentication headers for API requests (server-side)
 */
export async function getServerAuthHeaders(): Promise<Record<string, string>> {
  const token = await getServerToken();
  
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Check if user has specific role (server-side)
 */
export async function hasServerRole(role: string): Promise<boolean> {
  const user = await getServerUser();
  return user?.role === role;
}

/**
 * Check if user has specific status (server-side)
 */
export async function hasServerStatus(status: string): Promise<boolean> {
  const user = await getServerUser();
  return user?.status === status;
}

/**
 * Get user's full name (server-side)
 */
export async function getServerUserDisplayName(): Promise<string> {
  const user = await getServerUser();
  return user?.full_name || 'المستخدم';
}

/**
 * Check if user is verified (server-side)
 */
export async function isServerUserVerified(): Promise<boolean> {
  const user = await getServerUser();
  return user?.phone_verified || false;
}

/**
 * Get user ID (server-side)
 */
export async function getServerUserId(): Promise<number | null> {
  const user = await getServerUser();
  return user?.id || null;
}

/**
 * Get user phone number (server-side)
 */
export async function getServerUserPhone(): Promise<string | null> {
  const user = await getServerUser();
  return user?.phone || null;
}

/**
 * Check if user is admin (server-side)
 */
export async function isServerAdmin(): Promise<boolean> {
  return await hasServerRole('admin');
}

/**
 * Check if user is regular user (server-side)
 */
export async function isServerUser(): Promise<boolean> {
  return await hasServerStatus('active');
}
