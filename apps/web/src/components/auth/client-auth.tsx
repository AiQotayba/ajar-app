"use client"

import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { useAuth } from './auth-provider';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
  requiredRole?: string;
  requiredStatus?: string;
}

export function ProtectedRoute({ 
  children, 
  fallback,
  redirectTo = '/login',
  requiredRole,
  requiredStatus 
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return fallback || null;
  }

  if (requiredStatus && user?.status !== requiredStatus) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AdminOnly({ children, fallback, redirectTo = '/' }: AdminOnlyProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  if (user?.role !== 'admin') {
    return fallback || null;
  }

  return <>{children}</>;
}

interface UserOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function UserOnly({ children, fallback, redirectTo = '/' }: UserOnlyProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user?.status !== 'active') {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  if (user?.status !== 'active') {
    return fallback || null;
  }

  return <>{children}</>;
}

interface GuestOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function GuestOnly({ children, fallback, redirectTo = '/' }: GuestOnlyProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  if (isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">جاري التحميل...</div>;
  }

  if (!isAuthenticated) {
    return fallback || null;
  }

  return <>{children}</>;
}
