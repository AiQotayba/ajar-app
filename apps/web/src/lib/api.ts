import { toast } from 'sonner';
import { createFullApi } from './api/index';
import { getToken } from './auth';
import { logout } from './logout';

export const api = createFullApi(
    process.env.NEXT_PUBLIC_API_URL || 'https://ajar-backend.mystore.social/api/v1',
    () => getToken(),
    () => 'ar',
    (message: string, type: 'success' | 'error' | 'warning' | 'info') => toast[type](message),
    {
        onUnauthorized: async () => {
            // Call logout to clear local auth data and redirect
            await logout();
        },
        defaultTimeout: 20000,
        credentials: 'same-origin',
    }
);