/**
 * Core types for the useApi library
 * Framework-agnostic API layer with config injection
 */

/**
 * HTTP Methods supported by the library
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Toast notification types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Standard API response format
 * All API responses follow this structure for consistency
 */
export interface ApiResponse<T = any> {
    /** Whether the request resulted in an error */
    isError: boolean;
    /** The actual data payload */
    data?: T | undefined;
    /** Error or success message */
    message?: string | undefined;
    /** HTTP status code */
    status: number;
    /** Additional metadata */
    meta?: Record<string, any>;
}

/**
 * Request options for individual API calls
 */
export interface ApiOptions {
    /** Whether to include query parameters from config */
    query?: boolean;
    /** Whether to show success/error messages */
    msgs?: boolean;
    /** Custom fetch options */
    fetchOptions?: RequestInit;
    /** Custom headers for this request */
    headers?: Record<string, string>;
    /** Custom query parameters */
    params?: Record<string, string | number | boolean>;
    /** Request timeout in milliseconds */
    timeout?: number;
    /** Whether to show error toast on failure */
    showErrorToast?: boolean;
    /** Whether to show success toast on success */
    showSuccessToast?: boolean;
    /** Custom error message */
    errorMessage?: string;
    /** Custom success message */
    successMessage?: string;
}

/**
 * Main API configuration interface
 * This is the core configuration object passed to createApi
 * All functions are injected from the consuming application
 */
export interface ApiConfig {
    /** Base URL for all API requests */
    baseUrl: string;
    /** Function to get authentication token */
    getToken?: () => string | null | undefined;
    /** Function to get current language/locale */
    getLang?: () => string;
    /** Function to get search parameters (for query string) */
    getSearchParams?: () => string | URLSearchParams | Record<string, any>;
    /** Function to show toast notifications */
    showToast?: (message: string, type: ToastType) => void;
    /** Function to handle unauthorized requests (401) */
    onUnauthorized?: () => void;
    /** Function to handle errors globally */
    onError?: (error: Error, response?: Response) => void;
    /** Function to handle successful responses globally */
    onSuccess?: (response: ApiResponse) => void;
    /** Function to handle request start */
    onRequestStart?: () => void;
    /** Function to handle request end */
    onRequestEnd?: () => void;
    /** Default headers to include in all requests */
    defaultHeaders?: Record<string, string>;
    /** Default request timeout */
    defaultTimeout?: number;
    /** Whether to include credentials in requests */
    credentials?: RequestCredentials;
    /** Custom fetch implementation */
    fetch?: typeof fetch;
}

/**
 * API instance interface
 * The main API object returned by createApi
 */
export interface ApiInstance {
    /** GET request method */
    get: <T = any>(endpoint: string, options?: ApiOptions) => Promise<ApiResponse<T>>;
    /** POST request method */
    post: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>;
    /** PUT request method */
    put: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>;
    /** DELETE request method */
    delete: <T = any>(endpoint: string, options?: ApiOptions) => Promise<ApiResponse<T>>;
    /** PATCH request method */
    patch: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>;
    /** Generic request method */
    request: <T = any>(method: HttpMethod, endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>;
    /** Update configuration */
    updateConfig: (newConfig: Partial<ApiConfig>) => void;
}

/**
 * Create API function type
 */
export type CreateApiFunction = (config: ApiConfig) => ApiInstance;

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (options: ApiOptions) => ApiOptions | Promise<ApiOptions>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: Error, response?: Response) => void | Promise<void>;

/**
 * Extended API configuration with interceptors
 */
export interface ExtendedApiConfig extends ApiConfig {
    /** Request interceptors */
    requestInterceptors?: RequestInterceptor[];
    /** Response interceptors */
    responseInterceptors?: ResponseInterceptor[];
    /** Error interceptors */
    errorInterceptors?: ErrorInterceptor[];
}
