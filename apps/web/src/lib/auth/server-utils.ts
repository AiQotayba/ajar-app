import { redirect } from 'next/navigation';
import {
    getServerToken,
    getServerUser,
    hasServerRole,
    hasServerStatus,
    isServerAuthenticated
} from './server';

/**
 * Redirect to login if not authenticated (server-side)
 */
export async function requireAuth(redirectTo: string = '/login') {
  const isAuthenticated = await isServerAuthenticated();
  
  if (!isAuthenticated) {
    redirect(redirectTo);
  }
  
  return await getServerUser();
}

/**
 * Redirect to home if already authenticated (server-side)
 */
export async function requireGuest(redirectTo: string = '/') {
  const isAuthenticated = await isServerAuthenticated();
  
  if (isAuthenticated) {
    redirect(redirectTo);
  }
}

/**
 * Require specific role (server-side)
 */
export async function requireRole(role: string, redirectTo: string = '/') {
  const hasRole = await hasServerRole(role);
  
  if (!hasRole) {
    redirect(redirectTo);
  }
  
  return await getServerUser();
}

/**
 * Require specific status (server-side)
 */
export async function requireStatus(status: string, redirectTo: string = '/') {
  const hasStatus = await hasServerStatus(status);
  
  if (!hasStatus) {
    redirect(redirectTo);
  }
  
  return await getServerUser();
}

/**
 * Require admin role (server-side)
 */
export async function requireAdmin(redirectTo: string = '/') {
  return await requireRole('admin', redirectTo);
}

/**
 * Require active user (server-side)
 */
export async function requireActiveUser(redirectTo: string = '/') {
  return await requireStatus('active', redirectTo);
}

/**
 * Get auth data for server components
 */
export async function getServerAuthData() {
  const [user, token, isAuthenticated] = await Promise.all([
    getServerUser(),
    getServerToken(),
    isServerAuthenticated()
  ]);

  return {
    user,
    token,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    isActive: user?.status === 'active',
  };
}
