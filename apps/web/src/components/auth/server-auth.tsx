import {
    getServerToken,
    getServerUser,
    isServerAuthenticated,
    type User
} from '@/lib/auth/server';
import { ReactNode } from 'react';

interface ServerAuthProps {
  children: (authData: {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
  }) => ReactNode;
  fallback?: ReactNode;
}

export async function ServerAuth({ children, fallback }: ServerAuthProps) {
  try {
    const [user, token, isAuthenticated] = await Promise.all([
      getServerUser(),
      getServerToken(),
      isServerAuthenticated()
    ]);

    return (
      <>
        {children({ user, token, isAuthenticated })}
      </>
    );
  } catch (error) {
    console.error('Server auth error:', error);
    return fallback || null;
  }
}

interface ProtectedServerRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
  requiredRole?: string;
  requiredStatus?: string;
}

export async function ProtectedServerRoute({ 
  children, 
  fallback,
  requiredRole,
  requiredStatus 
}: ProtectedServerRouteProps) {
  try {
    const isAuthenticated = await isServerAuthenticated();
    
    if (!isAuthenticated) {
      return fallback || null;
    }

    if (requiredRole || requiredStatus) {
      const user = await getServerUser();
      
      if (requiredRole && user?.role !== requiredRole) {
        return fallback || null;
      }
      
      if (requiredStatus && user?.status !== requiredStatus) {
        return fallback || null;
      }
    }

    return <>{children}</>;
  } catch (error) {
    console.error('Protected route error:', error);
    return fallback || null;
  }
}

interface AdminOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export async function AdminOnly({ children, fallback }: AdminOnlyProps) {
  try {
    const { hasServerRole } = await import('@/lib/auth/server');
    const isAdmin = await hasServerRole('admin');
    
    return isAdmin ? <>{children}</> : (fallback || null);
  } catch (error) {
    console.error('Admin check error:', error);
    return fallback || null;
  }
}

interface UserOnlyProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export async function UserOnly({ children, fallback }: UserOnlyProps) {
  try {
    const { hasServerStatus } = await import('@/lib/auth/server');
    const isActiveUser = await hasServerStatus('active');
    
    return isActiveUser ? <>{children}</> : (fallback || null);
  } catch (error) {
    console.error('User check error:', error);
    return fallback || null;
  }
}
