import { toast } from 'sonner';
import { api } from './api';
import { clearAuth } from './auth/client';

/**
 * Logout user and clear authentication data
 */
export async function logout(): Promise<void> {
  try {
    // Call logout API endpoint
    await api.post('/auth/logout');
  } catch (error) {
    // Even if API call fails, we should clear local auth data
    console.error('Logout API error:', error);
  } finally {
    // Always clear local authentication data
    clearAuth();
    
    // Show success message
    toast.success('تم تسجيل الخروج بنجاح');
    
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
}

/**
 * Logout user with confirmation dialog
 */
export async function logoutWithConfirmation(): Promise<void> {
  if (typeof window === 'undefined') return;
  
  const confirmed = window.confirm('هل أنت متأكد من تسجيل الخروج؟');
  
  if (confirmed) {
    await logout();
  }
}
