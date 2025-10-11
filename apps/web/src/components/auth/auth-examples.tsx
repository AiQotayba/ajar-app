// أمثلة على استخدام نظام المصادقة الجديد

// ===== مثال 1: مكون كلاينت محمي =====
"use client"

import { useAuth } from './auth-provider';
import { ProtectedRoute } from './client-auth';

export function ClientProtectedExample() {
  return (
    <ProtectedRoute fallback={<div>يجب تسجيل الدخول أولاً</div>}>
      <div>
        <h2>هذه صفحة محمية</h2>
        <UserProfile />
      </div>
    </ProtectedRoute>
  );
}

function UserProfile() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <h3>مرحباً {user?.full_name}</h3>
      <button onClick={logout}>تسجيل الخروج</button>
    </div>
  );
}

// ===== مثال 2: مكون سيرفر محمي =====
import { requireAuth } from '@/lib/auth/server-utils';
import { ServerAuth } from './server-auth';

export async function ServerProtectedExample() {
  // الطريقة الأولى: استخدام requireAuth
  const user = await requireAuth();
  
  return (
    <div>
      <h2>صفحة محمية (سيرفر)</h2>
      <p>مرحباً {user.full_name}</p>
    </div>
  );
}

// الطريقة الثانية: استخدام ServerAuth component
export async function ServerAuthExample() {
  return (
    <ServerAuth fallback={<div>غير مسجل</div>}>
      {({ user, isAuthenticated }) => (
        <div>
          {isAuthenticated ? (
            <div>
              <h2>مرحباً {user?.full_name}</h2>
              <p>رقم الهاتف: {user?.phone}</p>
            </div>
          ) : (
            <div>يجب تسجيل الدخول</div>
          )}
        </div>
      )}
    </ServerAuth>
  );
}

// ===== مثال 3: صفحة للأدمن فقط =====
import { requireAdmin } from '@/lib/auth/server-utils';
import { AdminOnly } from './server-auth';

// الطريقة الأولى: في Server Component
export async function AdminPage() {
  const admin = await requireAdmin();
  
  return (
    <div>
      <h1>لوحة الإدارة</h1>
      <p>مرحباً {admin.full_name}</p>
    </div>
  );
}

// الطريقة الثانية: استخدام مكون
export async function AdminPageWithComponent() {
  return (
    <AdminOnly fallback={<div>ليس لديك صلاحية للوصول</div>}>
      <div>
        <h1>لوحة الإدارة</h1>
        <AdminPanel />
      </div>
    </AdminOnly>
  );
}

// ===== مثال 4: صفحة للضيوف فقط =====
import { GuestOnly } from './client-auth';

export function GuestPage() {
  return (
    <GuestOnly fallback={<div>أنت مسجل بالفعل</div>}>
      <div>
        <h1>صفحة التسجيل</h1>
        <LoginForm />
        <RegisterForm />
      </div>
    </GuestOnly>
  );
}

// ===== مثال 5: استخدام دوال المصادقة مباشرة =====
"use client"

import {
    clearAuth,
    getToken,
    getUser,
    isAuthenticated
} from '@/lib/auth/client';

export function DirectAuthExample() {
  const handleCheckAuth = () => {
    if (isAuthenticated()) {
      const user = getUser();
      const token = getToken();
      console.log('User:', user);
      console.log('Token:', token);
    } else {
      console.log('غير مسجل');
    }
  };

  const handleLogout = () => {
    clearAuth();
    window.location.reload();
  };

  return (
    <div>
      <button onClick={handleCheckAuth}>فحص حالة المصادقة</button>
      <button onClick={handleLogout}>تسجيل الخروج</button>
    </div>
  );
}

// ===== مثال 6: استخدام دوال السيرفر =====
import {
    getServerAuthData,
    getServerToken,
    getServerUser,
    isServerAuthenticated
} from '@/lib/auth/server';

export async function ServerDirectExample() {
  // الطريقة الأولى: استخدام الدوال منفصلة
  const user = await getServerUser();
  const token = await getServerToken();
  const isAuth = await isServerAuthenticated();

  // الطريقة الثانية: استخدام getServerAuthData
  const authData = await getServerAuthData();
  
  return (
    <div>
      <h2>معلومات المصادقة (سيرفر)</h2>
      <p>مسجل: {isAuth ? 'نعم' : 'لا'}</p>
      {user && (
        <div>
          <p>الاسم: {user.full_name}</p>
          <p>الدور: {user.role}</p>
          <p>الحالة: {user.status}</p>
        </div>
      )}
    </div>
  );
}
