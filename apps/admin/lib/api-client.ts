import Cookies from "js-cookie"
/**
 * API Client for Ajar Admin Panel
 * Based on the useApi library with Next.js integration
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH"
export type ToastType = "success" | "error" | "warning" | "info"

export interface ApiResponse<T = any> {
  isError: boolean
  data: T
  message?: string
  status?: number
  [key: string]: any
}

export interface ApiOptions {
  query?: boolean
  msgs?: boolean
  fetchOptions?: RequestInit
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean>
  timeout?: number
  showErrorToast?: boolean
  showSuccessToast?: boolean
  errorMessage?: string
  successMessage?: string
}

export interface ApiConfig {
  baseUrl: string
  getToken?: () => string | null | undefined
  getLang?: () => string
  getSearchParams?: () => string | URLSearchParams | Record<string, any>
  showToast?: (message: string, type: ToastType) => void
  onUnauthorized?: () => void
  onError?: (error: Error, response?: Response) => void
  onSuccess?: (response: ApiResponse) => void
  onRequestStart?: () => void
  onRequestEnd?: () => void
  defaultHeaders?: Record<string, string>
  defaultTimeout?: number
  credentials?: RequestCredentials
  fetch?: typeof fetch
}

export interface ApiInstance {
  get: <T = any>(endpoint: string, options?: ApiOptions) => Promise<ApiResponse<T>>
  post: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>
  put: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>
  delete: <T = any>(endpoint: string, options?: ApiOptions) => Promise<ApiResponse<T>>
  patch: <T = any>(endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>
  request: <T = any>(method: HttpMethod, endpoint: string, data?: any, options?: ApiOptions) => Promise<ApiResponse<T>>
  updateConfig: (newConfig: Partial<ApiConfig>) => void
}

class ApiCore implements ApiInstance {
  private config: ApiConfig

  constructor(config: ApiConfig) {
    this.config = {
      defaultTimeout: 10000,
      credentials: "same-origin",
      ...config,
    }
  }

  updateConfig(newConfig: Partial<ApiConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  async get<T = any>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("GET", endpoint, undefined, options)
  }

  async post<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, data, options)
  }

  async put<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, data, options)
  }

  async delete<T = any>(endpoint: string, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint, undefined, options)
  }

  async patch<T = any>(endpoint: string, data?: any, options?: ApiOptions): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, data, options)
  }

  async request<T = any>(
    method: HttpMethod,
    endpoint: string,
    data?: any,
    options?: ApiOptions,
  ): Promise<ApiResponse<T>> {
    try {
      this.config.onRequestStart?.()

      const requestOptions = this.mergeOptions(options)
      const fullUrl = this.buildUrl(endpoint, requestOptions)
      const headers = this.prepareHeaders(requestOptions)

      const fetchOptions: RequestInit = {
        method,
        headers,
        ...(this.config.credentials && { credentials: this.config.credentials }),
        ...requestOptions.fetchOptions,
      }

      if (data && method !== "GET") {
        if (data instanceof FormData) {
          fetchOptions.body = data
          delete headers["Content-Type"]
        } else {
          fetchOptions.body = JSON.stringify(data)
          headers["Content-Type"] = "application/json"
        }
      }

      const timeout = requestOptions.timeout || this.config.defaultTimeout || 10000
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)
      fetchOptions.signal = controller.signal

      const fetchFn = this.config.fetch || fetch
      const response = await fetchFn(fullUrl, fetchOptions)
      clearTimeout(timeoutId)

      const apiResponse = await this.parseResponse<T>(response)
      this.handleSuccess(apiResponse, requestOptions)

      return apiResponse as ApiResponse<T>
    } catch (error) {
      return this.handleError(error, options)
    } finally {
      this.config.onRequestEnd?.()
    }
  }

  private mergeOptions(options?: ApiOptions): ApiOptions {
    return {
      showErrorToast: true,
      showSuccessToast: false,
      msgs: false,
      query: false,
      ...options,
    }
  }

  private buildUrl(endpoint: string, options: ApiOptions): string {
    const cleanEndpoint = endpoint.startsWith("/") && this.config.baseUrl.endsWith("/") ? endpoint.slice(1) : endpoint

    let fullUrl = `${this.config.baseUrl}${cleanEndpoint}`

    if (options.query && this.config.getSearchParams) {
      const searchParams = this.config.getSearchParams()
      if (searchParams) {
        const queryString =
          typeof searchParams === "string" ? searchParams : new URLSearchParams(searchParams).toString()
        fullUrl += endpoint.includes("?") ? `&${queryString}` : `?${queryString}`
      }
    }

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

  private prepareHeaders(options: ApiOptions): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...this.config.defaultHeaders,
    }

    if (this.config.getLang) {
      const lang = this.config.getLang()
      if (lang) {
        headers["Accept-Language"] = lang
      }
    }

    if (this.config.getToken) {
      const token = this.config.getToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    return headers
  }

  private async parseResponse<T>(response: Response): Promise<any> {
    const isError = !response.ok
    let data: any

    try {
      data = await response.json()
      return {
        isError,
        ...data,
        status: response.status,
      }
    } catch (parseError) {
      return {
        isError,
        data: undefined,
        message: "Failed to parse response",
        status: response.status,
      }
    }
  }

  private handleSuccess<T>(response: ApiResponse<T>, options: ApiOptions): void {
    this.config.onSuccess?.(response)

    if (options.showSuccessToast && this.config.showToast && response.message) {
      this.config.showToast(response.message, "success")
    } else if (options.msgs && this.config.showToast && response.message) {
      this.config.showToast(response.message, "success")
    }
  }

  private handleError(error: any, options?: ApiOptions): ApiResponse {
    const errorMessage = this.getErrorMessage(error)

    this.config.onError?.(error)

    if (error.status === 401) {
      this.config.onUnauthorized?.()
    }

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

export function createApi(config: ApiConfig): ApiInstance {
  if (!config.baseUrl) {
    throw new Error("baseUrl is required in API configuration")
  }

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

// Create the default API instance
export const api = createApi({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "https://ajar-backend.mystore.social/api/v1",
  getLang: () => "ar",
  getToken: () => {
    console.log("getToken");

    // Get token from cookies (managed by tokenManager) 
    console.log(Cookies.get("ajar_admin_token"))
    return Cookies.get("ajar_admin_token") || null
    return null
  },
  onUnauthorized: () => {
    if (typeof window !== "undefined") {
      // Clear auth data
      const Cookies = require("js-cookie").default
      Cookies.remove("ajar_admin_token")
      Cookies.remove("ajar_admin_user")
      // Redirect to login
      window.location.href = "/login"
    }
  },
  defaultTimeout: 10000,
  credentials: "same-origin",
})

export const apiClient = api
