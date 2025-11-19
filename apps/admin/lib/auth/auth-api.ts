import { api } from "@/lib/api-client"
import { tokenManager } from "./token"

export interface LoginData {
  phone: string
  password: string
  role: string
  device_token?: string
}

export interface RegisterData {
  first_name: string
  last_name: string
  phone: string
  password: string
  password_confirmation: string
}

export interface ForgotPasswordData {
  phone: string
}

export interface VerifyOtpData {
  phone: string
  otp: string
}

export interface ResetPasswordData {
  phone: string
  password: string
  password_confirmation: string
}

export const authApi = {
  // Login
  login: async (data: LoginData) => {
    // Create request without Authorization header
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://ajar-backend.mystore.social/api/v1"}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Language": "ar",
        },
        body: JSON.stringify(data),
      }
    )

    const result = await response.json()

    // Store token and user if login successful
    if (result.success && result.access_token) {
      tokenManager.setToken(result.access_token)
      if (result.data) {
        tokenManager.setUser(result.data)
      }
    }

    return result
  },

  // Register (if needed for admin)
  register: async (data: RegisterData) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://ajar-backend.mystore.social/api/v1"}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Language": "ar",
        },
        body: JSON.stringify(data),
      }
    )
    return await response.json()
  },

  // Forgot Password - Send OTP
  forgotPassword: async (data: ForgotPasswordData) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://ajar-backend.mystore.social/api/v1"}/auth/forgot-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Language": "ar",
        },
        body: JSON.stringify(data),
      }
    )
    return await response.json()
  },

  // Verify OTP
  verifyOtp: async (data: VerifyOtpData) => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://ajar-backend.mystore.social/api/v1"}/auth/verify-otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Language": "ar",
        },
        body: JSON.stringify(data),
      }
    )

    const result = await response.json()

    // Store temporary token for password reset
    if (result.success && result?.access_token) {
      tokenManager.setTempToken(result.access_token, 30) // 30 minutes
    }

    return result
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordData) => {
    const tempToken = tokenManager.getTempToken()

    if (!tempToken) {
      throw new Error("No temporary token found. Please verify OTP first.")
    }

    // Use temp token for authorization
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "https://ajar-backend.mystore.social/api/v1"}/auth/reset-password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Accept-Language": "ar",
          "Authorization": `Bearer ${tempToken}`,
        },
        body: JSON.stringify(data),
      }
    )

    const result = await response.json()

    // If successful, login with new credentials
    if (result.success && result.access_token) {
      tokenManager.removeTempToken()
      tokenManager.setToken(result.access_token)
      if (result.data) {
        tokenManager.setUser(result.data)
      }
    }

    return result
  },

  // Logout
  logout: async () => {
    try {
      const token = tokenManager.getToken()
      if (token) {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "https://ajar-backend.mystore.social/api/v1"}/auth/logout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
              "Accept-Language": "ar",
              "Authorization": `Bearer ${token}`,
            },
          }
        )
      }
    } finally {
      tokenManager.clearAuth()
      // Redirect to login
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  },

  // Check auth status
  checkAuth: () => {
    return tokenManager.isAuthenticated()
  },

  // Get current user
  getCurrentUser: () => {
    return tokenManager.getUser()
  },
}

