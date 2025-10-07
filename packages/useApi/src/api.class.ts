/**
 * ApiCore class - Framework-agnostic API layer implementation
 * Handles all HTTP requests with config injection for auth, i18n, and error handling
 */

import type {
    ApiConfig,
    ApiInstance,
    ApiOptions,
    ApiResponse,
    ErrorInterceptor,
    HttpMethod,
    RequestInterceptor,
    ResponseInterceptor
} from './types';

/**
 * Core API class that handles all HTTP operations
 * Completely framework-agnostic - no React dependencies
 */
export class ApiCore implements ApiInstance {
    private config: ApiConfig;
    private requestInterceptors: RequestInterceptor[] = [];
    private responseInterceptors: ResponseInterceptor[] = [];
    private errorInterceptors: ErrorInterceptor[] = [];

    constructor(config: ApiConfig) {
        this.config = {
            defaultTimeout: 10000,
            credentials: 'same-origin',
            ...config,
        };
    }

    /**
     * Update the API configuration
     */
    updateConfig(newConfig: Partial<ApiConfig>): void {
        this.config = { ...this.config, ...newConfig };
    }

    /**
     * Add a request interceptor
     */
    addRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor);
    }

    /**
     * Add a response interceptor
     */
    addResponseInterceptor(interceptor: ResponseInterceptor): void {
        this.responseInterceptors.push(interceptor);
    }

    /**
     * Add an error interceptor
     */
    addErrorInterceptor(interceptor: ErrorInterceptor): void {
        this.errorInterceptors.push(interceptor);
    }

    /**
     * GET request method
     */
    async get<T = any>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
        return this.request<T>('GET', endpoint, undefined, options);
    }

    /**
     * POST request method
     */
    async post<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
        return this.request<T>('POST', endpoint, data, options);
    }

    /**
     * PUT request method
     */
    async put<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
        return this.request<T>('PUT', endpoint, data, options);
    }

    /**
     * DELETE request method
     */
    async delete<T = any>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
        return this.request<T>('DELETE', endpoint, undefined, options);
    }

    /**
     * PATCH request method
     */
    async patch<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
        return this.request<T>('PATCH', endpoint, data, options);
    }

    /**
     * Generic request method that handles all HTTP operations
     */
    async request<T = any>(
        method: HttpMethod,
        endpoint: string,
        data?: any,
        options?: ApiOptions
    ): Promise<ApiResponse<T>> {
        try {
            // Call request start handler
            this.config.onRequestStart?.();

            // Merge configurations
            const requestOptions = this.mergeOptions(options);

            // Apply request interceptors
            const finalOptions = await this.applyRequestInterceptors(requestOptions);

            // Build the full URL
            const fullUrl = this.buildUrl(endpoint, finalOptions);

            // Prepare headers
            const headers = this.prepareHeaders(finalOptions);

            // Prepare request options
            const fetchOptions: RequestInit = {
                method,
                headers,
                ...(this.config.credentials && { credentials: this.config.credentials }),
                ...finalOptions.fetchOptions,
            };

            // Add body for non-GET requests
            if (data && method !== 'GET') {
                if (data instanceof FormData) {
                    fetchOptions.body = data;
                } else {
                    fetchOptions.body = JSON.stringify(data);
                    headers['Content-Type'] = 'application/json';
                }
            }

            // Add timeout
            const timeout = finalOptions.timeout || this.config.defaultTimeout || 10000;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);
            fetchOptions.signal = controller.signal;

            // Make the request
            const fetchFn = this.config.fetch || fetch;
            const response = await fetchFn(fullUrl, fetchOptions);
            clearTimeout(timeoutId);

            // Parse response
            const apiResponse = await this.parseResponse<T>(response);

            // Apply response interceptors
            const finalResponse = await this.applyResponseInterceptors(apiResponse);

            // Handle success
            this.handleSuccess(finalResponse, finalOptions);

            return finalResponse;

        } catch (error) {
            // Handle error
            return this.handleError(error, options);
        } finally {
            // Call request end handler
            this.config.onRequestEnd?.();
        }
    }

    /**
     * Merge default options with request-specific options
     */
    private mergeOptions(options?: ApiOptions): ApiOptions {
        return {
            showErrorToast: true,
            showSuccessToast: false,
            msgs: false,
            query: false,
            ...options,
        };
    }

    /**
     * Apply request interceptors
     */
    private async applyRequestInterceptors(options: ApiOptions): Promise<ApiOptions> {
        let finalOptions = options;

        for (const interceptor of this.requestInterceptors) {
            finalOptions = await interceptor(finalOptions);
        }

        return finalOptions;
    }

    /**
     * Apply response interceptors
     */
    private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
        let finalResponse = response;

        for (const interceptor of this.responseInterceptors) {
            finalResponse = await interceptor(finalResponse);
        }

        return finalResponse;
    }

    /**
     * Build the full URL with base URL and query parameters
     */
    private buildUrl(endpoint: string, options: ApiOptions): string {
        // Remove leading slash from endpoint if baseUrl ends with slash
        const cleanEndpoint = endpoint.startsWith('/') && this.config.baseUrl.endsWith('/')
            ? endpoint.slice(1)
            : endpoint;

        let fullUrl = `${this.config.baseUrl}${cleanEndpoint}`;

        // Add query parameters from config if requested
        if (options.query && this.config.getSearchParams) {
            const searchParams = this.config.getSearchParams();
            if (searchParams) {
                const queryString = typeof searchParams === 'string' 
                    ? searchParams 
                    : new URLSearchParams(searchParams).toString();
                fullUrl += endpoint.includes('?') ? `&${queryString}` : `?${queryString}`;
            }
        }

        // Add custom query parameters
        if (options.params && Object.keys(options.params).length > 0) {
            const searchParams = new URLSearchParams();
            Object.entries(options.params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    searchParams.append(key, String(value));
                }
            });

            const queryString = searchParams.toString();
            if (queryString) {
                fullUrl += fullUrl.includes('?') ? `&${queryString}` : `?${queryString}`;
            }
        }

        return fullUrl;
    }

    /**
     * Prepare headers for the request
     */
    private prepareHeaders(options: ApiOptions): Record<string, string> {
        const headers: Record<string, string> = {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...this.config.defaultHeaders,
        };

        // Add language header if getLang function is provided
        if (this.config.getLang) {
            const lang = this.config.getLang();
            if (lang) {
                headers['Accept-Language'] = lang;
            }
        }

        // Add authorization header if token is available
        if (this.config.getToken) {
            const token = this.config.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        // Add custom headers from options
        if (options.headers) {
            Object.assign(headers, options.headers);
        }

        return headers;
    }

    /**
     * Parse the response from fetch
     */
    private async parseResponse<T>(response: Response): Promise<ApiResponse<T>> {
        const isError = !response.ok;
        let data: T | undefined;
        let message: string | undefined;

        try {
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                const jsonData = await response.json();

                // Handle different response formats
                if (jsonData.data !== undefined) {
                    data = jsonData.data;
                    message = jsonData.message;
                } else if (jsonData.message) {
                    message = jsonData.message;
                    data = jsonData;
                } else {
                    data = jsonData;
                }
            } else {
                const textData = await response.text();
                message = textData || response.statusText;
                data = textData as unknown as T;
            }
        } catch (parseError) {
            message = 'Failed to parse response';
            data = undefined;
        }

        return {
            isError,
            data,
            message,
            status: response.status,
        };
    }

    /**
     * Handle successful response
     */
    private handleSuccess<T>(response: ApiResponse<T>, options: ApiOptions): void {
        // Call global success handler
        this.config.onSuccess?.(response);

        // Show success toast if enabled
        if (options.showSuccessToast && this.config.showToast && response.message) {
            this.config.showToast(response.message, 'success');
        } else if (options.msgs && this.config.showToast && response.message) {
            this.config.showToast(response.message, 'success');
        }
    }

    /**
     * Handle error response
     */
    private handleError(error: any, options?: ApiOptions): ApiResponse {
        const errorMessage = this.getErrorMessage(error);

        // Call error interceptors
        this.errorInterceptors.forEach(interceptor => {
            try {
                interceptor(error);
            } catch (interceptorError) {
                console.error('Error in error interceptor:', interceptorError);
            }
        });

        // Call global error handler
        this.config.onError?.(error);

        // Handle unauthorized requests
        if (error.status === 401) {
            this.config.onUnauthorized?.();
        }

        // Show error toast if enabled
        if (options?.showErrorToast !== false && this.config.showToast) {
            const message = options?.errorMessage || errorMessage;
            this.config.showToast(message, 'error');
        } else if (options?.msgs && this.config.showToast) {
            this.config.showToast(errorMessage, 'error');
        }

        return {
            isError: true,
            data: undefined,
            message: errorMessage,
            status: error.status || 500,
        };
    }

    /**
     * Get error message from error object
     */
    private getErrorMessage(error: any): string {
        if (error.name === 'AbortError') {
            return 'Request timeout';
        }

        if (error.message) {
            return error.message;
        }

        if (typeof error === 'string') {
            return error;
        }

        return 'An unexpected error occurred';
    }
}
