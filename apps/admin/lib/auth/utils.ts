import { tokenManager } from "./token"

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return tokenManager.isAuthenticated()
}

/**
 * Get current user from cookies
 */
export function getCurrentUser() {
  return tokenManager.getUser()
}

/**
 * Get auth token
 */
export function getToken(): string | null {
  return tokenManager.getToken()
}

/**
 * Store OTP info in sessionStorage
 */
export function storeOtpInfo(data: {
  phone: string
  type: 'activate' | 'reset'
  expiresAt: string
}) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem('otp_info', JSON.stringify(data))
}

/**
 * Get OTP info from sessionStorage
 */
export function getOtpInfo() {
  if (typeof window === 'undefined') return null
  const data = sessionStorage.getItem('otp_info')
  return data ? JSON.parse(data) : null
}

/**
 * Clear OTP info
 */
export function clearOtpInfo() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('otp_info')
}

/**
 * Redirect to login
 */
export function redirectToLogin() {
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

/**
 * Redirect to dashboard
 */
export function redirectToDashboard() {
  if (typeof window !== 'undefined') {
    window.location.href = '/dashboard'
  }
}

