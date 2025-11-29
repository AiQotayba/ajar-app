"use client"

import { clearAuth, getToken, getUser, handleAuthResponse, isAuthenticated, storeToken, storeUser, updateUserData, type AuthResponse, type User } from '@/lib/auth/client'
import { logout } from '@/lib/logout'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useLocale } from 'next-intl'
import { useAppSelector, useAppDispatch } from '@/lib/redux/hooks'
import { setUser as setReduxUser, clearAuth as clearAuthAction, setToken as setReduxToken } from '@/lib/redux/slices/authSlice'

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
  // Old way: Local state management
  const [userState, setUserState] = useState<User | null>(null)
  const [tokenState, setTokenState] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const queryClient = useQueryClient()
  const locale = useLocale()
  const dispatch = useAppDispatch()
  
  // New way: Get auth state from Redux
  const { user: reduxUser, token: reduxToken, isAuthenticated: reduxIsAuthenticated } = useAppSelector((state) => state.auth)

  // Initialize auth state - sync both old and new ways
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentToken = getToken()
        const currentUser = getUser()

        // Old way: Update local state
        setTokenState(currentToken)
        setUserState(currentUser)

        // New way: Sync with Redux if not already synced
        if (currentToken && currentToken !== reduxToken) {
          dispatch(setReduxToken(currentToken))
        }
        if (currentUser && currentUser.id !== reduxUser?.id) {
          dispatch(setReduxUser(currentUser))
        }

        // Store in cookies (for middleware and server-side)
        if (currentUser) {
          storeUser(currentUser)
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  // Login function
  const login = useCallback((response: AuthResponse) => {
    try {
      // Handle auth response (stores in Redux and cookies)
      handleAuthResponse(response)
      
      // Old way: Update local state
      setTokenState(response.access_token)
      setUserState(response.data)
      
      // New way: Redux is already updated by handleAuthResponse, but ensure sync
      dispatch(setReduxToken(response.access_token))
      dispatch(setReduxUser(response.data))
      
      location.reload()
    } catch (error) {
      console.error('Login error:', error)
      try {
        // Clear both old and new ways
        setTokenState(null)
        setUserState(null)
        dispatch(clearAuthAction())
        clearAuth()
      } catch (e) {
        console.error('Error clearing auth:', e)
      }
    }
  }, [dispatch])

  // Logout function
  const logoutUser = useCallback(async () => {
    setIsLoading(true)
    try {
      await logout()
      
      // Old way: Clear local state
      setTokenState(null)
      setUserState(null)
      
      // New way: Clear Redux state
      try {
        dispatch(clearAuthAction())
      } catch (e) {
        console.error('Error dispatching clearAuth:', e)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [dispatch])

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await queryClient.getQueryData(['user-profile'])
      console.log(currentUser)
      if (currentUser) {
        const user = currentUser as User
        
        // Old way: Update local state
        setUserState(user)
        
        // New way: Update Redux state
        try {
          dispatch(setReduxUser(user))
          updateUserData(user as Partial<User>)
        } catch (e) {
          console.error('Error dispatching setUser:', e)
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error)
      try {
        // Clear both old and new ways
        setTokenState(null)
        setUserState(null)
        dispatch(clearAuthAction())
      } catch (e) {
        console.error('Error clearing auth:', e)
      }
    }
  }, [dispatch, queryClient])

  // Use Redux state as primary source, fallback to local state
  const user = reduxUser || userState
  const token = reduxToken || tokenState
  const isAuthenticated = reduxIsAuthenticated || (!!token && !!user)

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout: logoutUser,
    refreshUser,
  }
}
