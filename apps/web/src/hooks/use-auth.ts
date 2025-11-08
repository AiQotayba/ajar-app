"use client"

import { clearAuth, getToken, getUser, handleAuthResponse, isAuthenticated, type AuthResponse, type User } from '@/lib/auth/client'
import { logout } from '@/lib/logout'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
export interface UseAuthReturn {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (response: AuthResponse) => void
  logout: () => Promise<void>
  refreshUser: () => void
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const queryClient = useQueryClient()
  const locale = useLocale()
  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentToken = getToken()
        const currentUser = getUser()
        
        setToken(currentToken)
        setUser(currentUser)
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  // Login function
  const login = useCallback((response: AuthResponse) => {
    try {
      handleAuthResponse(response)
      setToken(response.access_token)
      setUser(response.data)
      location.reload()
    } catch (error) {
      console.error('Login error:', error)
      clearAuth()
    }
  }, [])

  // Logout function
  const logoutUser = useCallback(async () => {
    setIsLoading(true)
    try {
      await logout()
      setToken(null)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await queryClient.getQueryData(['user-profile'])
      setUser(currentUser as User)
    } catch (error) {
      console.error('Refresh user error:', error)
      clearAuth()
      setUser(null)
      setToken(null)
    }
  }, [])

  return {
    user,
    token,
    isAuthenticated: isAuthenticated(),
    isLoading,
    login,
    logout: logoutUser,
    refreshUser,
  }
}
