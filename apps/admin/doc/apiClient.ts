/**
 * useApi Library - Main entry point
 * A lightweight, framework-agnostic API layer with config injection
 *
 * @author Qotayba
 * @version 1.2.0
 * @license MIT
 */

/**
 * Core types for the useApi library
 * Framework-agnostic API layer with config injection
 */

/**
 * HTTP Methods supported by the library
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "warning" | "info"

/**
 * Standard API response format
 * All API responses follow this structure for consistency
 */
export interface ApiResponse<T = any> {
  /** Whether the request resulted in an error */
  isError: boolean
  data: T
  // any additional data
  [key: string]: any
}

/**
 * Request options for individual API calls
 */
export interface ApiOptions {
  /** Whether to include query parameters from config */
  query?: boolean
  /** Whether to show success/error messages */
  msgs?: boolean
  /** Custom fetch options */
  fetchOptions?: RequestInit
  /** Custom headers for this request */
  headers?: Record<string, string>
  /** Custom query parameters */
  params?: Record<string, string | number | boolean>
  /** Request timeout in milliseconds */
  timeout?: number
  /** Whether to show error toast on failure */
  showErrorToast?: boolean
  /** Whether to show success toast on success */
  showSuccessToast?: boolean
  /** Custom error message */
  errorMessage?: string
  /** Custom success message */
  successMessage?: string
}

/**
 * Main API configuration interface
 * This is the core configuration object passed to createApi
 * All functions are injected from the consuming application
 */
export interface ApiConfig {
  /** Base URL for all API requests */
  baseUrl: string
  /** Function to get authentication token */
  getToken?: () => string | null | undefined
  /** Function to get current language/locale */
  getLang?: () => string
  /** Function to get search parameters (for query string) */
  getSearchParams?: () => string | URLSearchParams | Record<string, any>
  /** Function to show toast notifications */
  showToast?: (message: string, type: ToastType) => void
  /** Function to handle unauthorized requests (401) */
  onUnauthorized?: () => void
  /** Function to handle errors globally */
  onError?: (error: Error, response?: Response) => void
  /** Function to handle successful responses globally */
  onSuccess?: (response: ApiResponse) => void
  /** Function to handle request start */
  onRequestStart?: () => void
  /** Function to handle request end */
  onRequestEnd?: () => void
  /** Default headers to include in all requests */
  defaultHeaders?: Record<string, string>
  /** Default request timeout */
  defaultTimeout?: number
  /** Whether to include credentials in requests */
  credentials?: RequestCredentials
  /** Custom fetch implementation */
  fetch?: typeof fetch
}

/**
 * API instance interface
 * The main API object returned by createApi
 */
export interface ApiInstance {
  /** GET request method */
  get: <T = any>(endpoint: string, options?: ApiOptions) => Promise<ApiResponse<T>>
  /** POST request method */
  post: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>
  /** PUT request method */
  put: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>
  /** DELETE request method */
  delete: <T = any>(endpoint: string, options?: ApiOptions) => Promise<ApiResponse<T>>
  /** PATCH request method */
  patch: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>
  /** Generic request method */
  request: <T = any>(method: HttpMethod, endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>
  /** Update configuration */
  updateConfig: (newConfig: Partial<ApiConfig>) => void
}

/**
 * Create API function type
 */
export type CreateApiFunction = (config: ApiConfig) => ApiInstance

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (options: ApiOptions) => ApiOptions | Promise<ApiOptions>

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = <T>(response: ApiResponse<T>) => ApiResponse<T> | Promise<ApiResponse<T>>

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: Error, response?: Response) => void | Promise<void>

/**
 * Extended API configuration with interceptors
 */
export interface ExtendedApiConfig extends ApiConfig {
  /** Request interceptors */
  requestInterceptors?: RequestInterceptor[]
  /** Response interceptors */
  responseInterceptors?: ResponseInterceptor[]
  /** Error interceptors */
  errorInterceptors?: ErrorInterceptor[]
}

/**
 * Create a configured API instance
 * Framework-agnostic - works with React, Next.js, Node.js, or any JavaScript environment
 *
 * @param config - Configuration object with injected functions
 * @returns Configured API instance
 *
 * @example
 * \`\`\`typescript
 * const api = createApi({
 *   baseUrl: 'https://api.example.com',
 *   getToken: () => localStorage.getItem('token'),
 *   showToast: (message, type) => toast[type](message),
 *   getLang: () => 'ar',
 * });
 *
 * // Use the API
 * const response = await api.get('/users');
 * \`\`\`
 */
export function createApi(config: ApiConfig): ApiInstance {
  // Validate required configuration
  if (!config.baseUrl) {
    throw new Error("baseUrl is required in API configuration")
  }

  // Create and return the API instance
  const api = new ApiCore(config)

  return {
    get: <T = any>(endpoint: string, options?: ApiOptions) => api.request<T>("GET", endpoint, undefined, options),

    post: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
      api.request<T>("POST", endpoint, data, options),

    put: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
      api.request<T>("PUT", endpoint, data, options),

    delete: <T = any>(endpoint: string, options?: ApiOptions) => api.request<T>("DELETE", endpoint, undefined, options),

    patch: <T = any>(endpoint: string, data?: any, options?: ApiOptions) =>
      api.request<T>("PATCH", endpoint, data, options),

    request: <T = any>(method: HttpMethod, endpoint: string, data?: any, options?: ApiOptions) =>
      api.request<T>(method, endpoint, data, options),

    updateConfig: (newConfig: Partial<ApiConfig>) => api.updateConfig(newConfig),
  }
}

/**
 * Create a pre-configured API instance for common use cases
 *
 * @param baseUrl - Base URL for the API
 * @param options - Optional configuration overrides
 * @returns Pre-configured API instance
 */
export function createSimpleApi(baseUrl: string, options: Partial<ApiConfig> = {}): ApiInstance {
  return createApi({
    baseUrl,
    defaultTimeout: 10000,
    credentials: "same-origin",
    ...options,
  })
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
  options: Partial<ApiConfig> = {},
): ApiInstance {
  return createApi({
    baseUrl,
    getToken,
    defaultTimeout: 10000,
    credentials: "same-origin",
    ...options,
  })
}

/**
 * Create an API instance with internationalization support
 *
 * @param baseUrl - Base URL for the API
 * @param getLang - Function to get current language
 * @param options - Optional configuration overrides
 * @returns API instance with i18n support
 */
export function createI18nApi(baseUrl: string, getLang: () => string, options: Partial<ApiConfig> = {}): ApiInstance {
  return createApi({
    baseUrl,
    getLang,
    defaultTimeout: 10000,
    credentials: "same-origin",
    ...options,
  })
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
  showToast: (message: string, type: "success" | "error" | "warning" | "info") => void,
  options: Partial<ApiConfig> = {},
): ApiInstance {
  return createApi({
    baseUrl,
    getToken,
    getLang,
    showToast,
    defaultTimeout: 10000,
    credentials: "same-origin",
    ...options,
  })
}

// Export the main API class for advanced usage
/**
 * ApiCore class - Framework-agnostic API layer implementation
 * Handles all HTTP requests with config injection for auth, i18n, and error handling
 */

/**
 * Core API class that handles all HTTP operations
 * Completely framework-agnostic - no React dependencies
 */
export class ApiCore implements ApiInstance {
  private config: ApiConfig
  private requestInterceptors: RequestInterceptor[] = []
  private responseInterceptors: ResponseInterceptor[] = []
  private errorInterceptors: ErrorInterceptor[] = []

  constructor(config: ApiConfig) {
    this.config = {
      defaultTimeout: 10000,
      credentials: "same-origin",
      ...config,
    }
  }

  /**
   * Update the API configuration
   */
  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Add a request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor)
  }

  /**
   * Add a response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor)
  }

  /**
   * Add an error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    this.errorInterceptors.push(interceptor)
  }

  /**
   * GET request method
   */
  async get<T = any>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, undefined, options)
  }

  /**
   * POST request method
   */
  async post<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, data, options)
  }

  /**
   * PUT request method
   */
  async put<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, data, options)
  }

  /**
   * DELETE request method
   */
  async delete<T = any>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint, undefined, options)
  }

  /**
   * PATCH request method
   */
  async patch<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, data, options)
  }

  /**
   * Generic request method that handles all HTTP operations
   */
  async request<T = any>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: ApiOptions,
  ): Promise<ApiResponse<T>> {
    try {
      // Call request start handler
      this.config.onRequestStart?.()

      // Merge configurations
      const requestOptions = this.mergeOptions(options)

      // Apply request interceptors
      const finalOptions = await this.applyRequestInterceptors(requestOptions)

      // Build the full URL
      const fullUrl = this.buildUrl(endpoint, finalOptions)

      // Prepare headers
      const headers = this.prepareHeaders(finalOptions)

      // Prepare request options
      const fetchOptions: RequestInit = {
        method,
        headers,
        ...(this.config.credentials && { credentials: this.config.credentials }),
        ...finalOptions.fetchOptions,
      }

      // Add body for non-GET requests
      if (data && method !== "GET") {
        if (data instanceof FormData) {
          fetchOptions.body = data
        } else {
          fetchOptions.body = JSON.stringify(data)
          headers["Content-Type"] = "application/json"
        }
      }

      // Add timeout
      const timeout = finalOptions.timeout || this.config.defaultTimeout || 10000
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      fetchOptions.signal = controller.signal

      // Make the request
      const fetchFn = this.config.fetch || fetch
      const response = await fetchFn(fullUrl, fetchOptions)
      clearTimeout(timeoutId)

      // Parse response
      const apiResponse = await this.parseResponse<T>(response)

      // Apply response interceptors
      const finalResponse = await this.applyResponseInterceptors(apiResponse)

      // Handle success
      this.handleSuccess(finalResponse, finalOptions)

      return finalResponse as ApiResponse<T>
    } catch (error) {
      // Handle error
      return this.handleError(error, options)
    } finally {
      // Call request end handler
      this.config.onRequestEnd?.()
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
    }
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(options: ApiOptions): Promise<ApiOptions> {
    let finalOptions = options

    for (const interceptor of this.requestInterceptors) {
      finalOptions = await interceptor(finalOptions)
    }

    return finalOptions
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(response: ApiResponse<T>): Promise<ApiResponse<T>> {
    let finalResponse = response

    for (const interceptor of this.responseInterceptors) {
      finalResponse = await interceptor(finalResponse)
    }

    return finalResponse
  }

  /**
   * Build the full URL with base URL and query parameters
   */
  private buildUrl(endpoint: string, options: ApiOptions): string {
    // Remove leading slash from endpoint if baseUrl ends with slash
    const cleanEndpoint = endpoint.startsWith("/") && this.config.baseUrl.endsWith("/") ? endpoint.slice(1) : endpoint

    let fullUrl = `${this.config.baseUrl}${cleanEndpoint}`

    // Add query parameters from config if requested
    if (options.query && this.config.getSearchParams) {
      const searchParams = this.config.getSearchParams()
      if (searchParams) {
        const queryString =
          typeof searchParams === "string" ? searchParams : new URLSearchParams(searchParams).toString()
        fullUrl += endpoint.includes("?") ? `&${queryString}` : `?${queryString}`
      }
    }

    // Add custom query parameters
    if (options.params && Object.keys(options.params).length > 0) {
      const searchParams = new URLSearchParams()
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value))
        }
      })

      const queryString = searchParams.toString()
      if (queryString) {
        fullUrl += fullUrl.includes("?") ? `&${queryString}` : `?${queryString}`
      }
    }

    return fullUrl
  }

  /**
   * Prepare headers for the request
   */
  private prepareHeaders(options: ApiOptions): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...this.config.defaultHeaders,
    }

    // Add language header if getLang function is provided
    if (this.config.getLang) {
      const lang = this.config.getLang()
      if (lang) {
        headers["Accept-Language"] = lang
      }
    }

    // Add authorization header if token is available
    if (this.config.getToken) {
      const token = this.config.getToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    // Add custom headers from options
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    return headers
  }

  /**
   * Parse the response from fetch
   */
  private async parseResponse<T>(response: Response): Promise<any> {
    const isError = !response.ok
    let data: any = await response.json()
    let message: string | undefined

    try {
      const contentType = response.headers.get("content-type")

      console.log(data)
      return {
        isError,
        ...data,
      }
    } catch (parseError) {
      message = "Failed to parse response"
      data = undefined
      return {
        isError,
        ...data,
      }
    }
  }

  /**
   * Handle successful response
   */
  private handleSuccess<T>(response: ApiResponse<T>, options: ApiOptions): void {
    // Call global success handler
    this.config.onSuccess?.(response)

    // Show success toast if enabled
    if (options.showSuccessToast && this.config.showToast && response.message) {
      this.config.showToast(response.message, "success")
    } else if (options.msgs && this.config.showToast && response.message) {
      this.config.showToast(response.message, "success")
    }
  }

  /**
   * Handle error response
   */
  private handleError(error: any, options?: ApiOptions): ApiResponse {
    const errorMessage = this.getErrorMessage(error)

    // Call error interceptors
    this.errorInterceptors.forEach((interceptor) => {
      try {
        interceptor(error)
      } catch (interceptorError) {
        console.error("Error in error interceptor:", interceptorError)
      }
    })

    // Call global error handler
    this.config.onError?.(error)

    // Handle unauthorized requests
    if (error.status === 401) {
      this.config.onUnauthorized?.()
    }

    // Show error toast if enabled
    if (options?.showErrorToast !== false && this.config.showToast) {
      const message = options?.errorMessage || errorMessage
      this.config.showToast(message, "error")
    } else if (options?.msgs && this.config.showToast) {
      this.config.showToast(errorMessage, "error")
    }

    return {
      isError: true,
      data: undefined,
      message: errorMessage,
      status: error.status || 500,
    }
  }

  /**
   * Get error message from error object
   */
  private getErrorMessage(error: any): string {
    if (error.name === "AbortError") {
      return "Request timeout"
    }

    if (error.message) {
      return error.message
    }

    if (typeof error === "string") {
      return error
    }

    return "An unexpected error occurred"
  }
}
