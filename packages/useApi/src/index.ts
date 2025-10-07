/**
 * useApi Library - Main entry point
 * A lightweight, framework-agnostic API layer with config injection
 * 
 * @author Qutaiba
 * @version 1.0.0
 * @license MIT
 */

import { ApiCore } from './api.class';
import type { ApiConfig, ApiInstance, ApiOptions, HttpMethod } from './types';

/**
 * Create a configured API instance
 * Framework-agnostic - works with React, Next.js, Node.js, or any JavaScript environment
 * 
 * @param config - Configuration object with injected functions
 * @returns Configured API instance
 * 
 * @example
 * ```typescript
 * const api = createApi({
 *   baseUrl: 'https://api.example.com',
 *   getToken: () => localStorage.getItem('token'),
 *   showToast: (message, type) => toast[type](message),
 *   getLang: () => 'ar',
 * });
 * 
 * // Use the API
 * const response = await api.get('/users');
 * ```
 */
export function createApi(config: ApiConfig): ApiInstance {
    // Validate required configuration
    if (!config.baseUrl) {
        throw new Error('baseUrl is required in API configuration');
    }

    // Create and return the API instance
    const api = new ApiCore(config);

    return {
        get: <T = any>(endpoint: string, options?: ApiOptions) =>
            api.request<T>('GET', endpoint, undefined, options),

        post: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
            api.request<T>('POST', endpoint, data, options),

        put: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
            api.request<T>('PUT', endpoint, data, options),

        delete: <T = any>(endpoint: string, options?: ApiOptions) =>
            api.request<T>('DELETE', endpoint, undefined, options),

        patch: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
            api.request<T>('PATCH', endpoint, data, options),

        request: <T = any>(method: HttpMethod, endpoint: string, data?: any, options?: ApiOptions) =>
            api.request<T>(method, endpoint, data, options),

        updateConfig: (newConfig: Partial<ApiConfig>) => api.updateConfig(newConfig),
    };
}

/**
 * Create a pre-configured API instance for common use cases
 * 
 * @param baseUrl - Base URL for the API
 * @param options - Optional configuration overrides
 * @returns Pre-configured API instance
 */
export function createSimpleApi(
    baseUrl: string,
    options: Partial<ApiConfig> = {}
): ApiInstance {
    return createApi({
        baseUrl,
        defaultTimeout: 10000,
        credentials: 'same-origin',
        ...options,
    });
}

/**
 * Create an API instance with authentication support
 * 
 * @param baseUrl - Base URL for the API
 * @param getToken - Function to retrieve authentication token
 * @param options - Optional configuration overrides
 * @returns API instance with authentication support
 */
export function createAuthenticatedApi(
    baseUrl: string,
    getToken: () => string | null | undefined,
    options: Partial<ApiConfig> = {}
): ApiInstance {
    return createApi({
        baseUrl,
        getToken,
        defaultTimeout: 10000,
        credentials: 'same-origin',
        ...options,
    });
}

/**
 * Create an API instance with internationalization support
 * 
 * @param baseUrl - Base URL for the API
 * @param getLang - Function to get current language
 * @param options - Optional configuration overrides
 * @returns API instance with i18n support
 */
export function createI18nApi(
    baseUrl: string,
    getLang: () => string,
    options: Partial<ApiConfig> = {}
): ApiInstance {
    return createApi({
        baseUrl,
        getLang,
        defaultTimeout: 10000,
        credentials: 'same-origin',
        ...options,
    });
}

/**
 * Create a fully configured API instance with all features
 * 
 * @param baseUrl - Base URL for the API
 * @param getToken - Function to retrieve authentication token
 * @param getLang - Function to get current language
 * @param showToast - Function to show toast notifications
 * @param options - Optional configuration overrides
 * @returns Fully configured API instance
 */
export function createFullApi(
    baseUrl: string,
    getToken: () => string | null | undefined,
    getLang: () => string,
    showToast: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void,
    options: Partial<ApiConfig> = {}
): ApiInstance {
    return createApi({
        baseUrl,
        getToken,
        getLang,
        showToast,
        defaultTimeout: 10000,
        credentials: 'same-origin',
        ...options,
    });
}

// Export all types
export type {
    ApiConfig,
    ApiInstance,
    ApiOptions,
    ApiResponse,
    CreateApiFunction,
    ErrorInterceptor,
    ExtendedApiConfig,
    HttpMethod,
    RequestInterceptor,
    ResponseInterceptor,
    ToastType
} from './types';

// Export the main API class for advanced usage
export { ApiCore } from './api.class';

