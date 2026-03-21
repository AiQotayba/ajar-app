import { toast } from 'sonner';
import { createFullApi } from './api/index';
import { getToken } from './auth';
import { logout } from './logout';

const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_URL || 'https://ajar-backend.mystore.social/api/v1';

/** When true, the client calls `/api/ssr?url=/path&...` and the Next route proxies to `apiBaseUrl`. */
const useSsrProxy = process.env.NEXT_PUBLIC_USE_API_SSR_PROXY === 'true';

export const api = createFullApi(
    apiBaseUrl,
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
        useSsrProxy,
        ssrProxyPath: '/api/ssr',
    }
);