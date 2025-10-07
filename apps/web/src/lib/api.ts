import { toast } from 'sonner';
import { createFullApi } from './api/index';

export const api = createFullApi(
    process.env.NEXT_PUBLIC_API_URL || 'https://ajar-backend.mystore.social/api/v1',
    () => localStorage.getItem('token'),
    () => 'ar',
    (message: string, type: 'success' | 'error' | 'warning' | 'info') => toast[type](message),
    {
        onUnauthorized: () => {
            window.location.href = '/login';
        },
        defaultTimeout: 10000,
        credentials: 'same-origin',
    }
);