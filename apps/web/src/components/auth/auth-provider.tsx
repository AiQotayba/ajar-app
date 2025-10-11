"use client"

import {
  clearAuth,
  getToken,
  getUser,
  handleAuthResponse,
  isAuthenticated,
  type AuthResponse,
  type User
} from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (response: AuthResponse) => void;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize auth state
  useEffect(() => {
    const initAuth = () => {
      try {
        const currentToken = getToken();
        const currentUser = getUser();
        
        setToken(currentToken);
        setUser(currentUser);
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Login function
  const login = (response: AuthResponse) => {
    try {
      handleAuthResponse(response);
      setToken(response.access_token);
      setUser(response.data);
    } catch (error) {
      console.error('Login error:', error);
      clearAuth();
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      // Call logout API endpoint
      const { api } = await import('@/lib/api');
      await api.post('/auth/logout');
    } catch (error) {
      // Even if API call fails, we should clear local auth data
      console.error('Logout API error:', error);
    } finally {
      // Always clear local authentication data
      clearAuth();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      
      // Redirect to login page
      router.push('/login');
    }
  };

  // Refresh user data
  const refreshUser = () => {
    try {
      const currentUser = getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Refresh user error:', error);
      clearAuth();
      setUser(null);
      setToken(null);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: isAuthenticated(),
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
