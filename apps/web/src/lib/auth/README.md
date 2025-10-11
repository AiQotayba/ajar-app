# Authentication System

نظام المصادقة مقسم إلى مكونات منفصلة للسيرفر والكلاينت باستخدام js-cookie.

## الملفات

### Client-side (الكلاينت)
- `client.ts` - دوال المصادقة للكلاينت باستخدام js-cookie
- `index.ts` - تصدير دوال الكلاينت فقط

### Server-side (السيرفر)
- `server.ts` - دوال المصادقة للسيرفر باستخدام next/headers
- `server-utils.ts` - دوال مساعدة للسيرفر (requireAuth, requireAdmin, etc.)
- `server-index.ts` - تصدير دوال السيرفر فقط

## الاستخدام

### في مكونات الكلاينت

```tsx
"use client"

import { 
  isAuthenticated, 
  getToken, 
  getUser, 
  storeToken, 
  storeUser,
  clearAuth,
  handleAuthResponse 
} from '@/lib/auth/client';

// أو
import { 
  isAuthenticated, 
  getToken, 
  getUser 
} from '@/lib/auth'; // يستورد من client تلقائياً
```

### في مكونات السيرفر

```tsx
import { 
  getServerUser, 
  getServerToken, 
  isServerAuthenticated 
} from '@/lib/auth/server';

// أو
import { 
  requireAuth, 
  requireAdmin, 
  getServerAuthData 
} from '@/lib/auth/server-utils';
```

### مكونات الحماية

#### للكلاينت
```tsx
import { 
  ProtectedRoute, 
  AdminOnly, 
  UserOnly, 
  GuestOnly, 
  AuthGuard 
} from '@/components/auth/client-auth';

// استخدام
<ProtectedRoute>
  <YourComponent />
</ProtectedRoute>

<AdminOnly>
  <AdminPanel />
</AdminOnly>
```

#### للسيرفر
```tsx
import { 
  ServerAuth, 
  ProtectedServerRoute, 
  AdminOnly, 
  UserOnly 
} from '@/components/auth/server-auth';

// استخدام
<ServerAuth>
  {({ user, token, isAuthenticated }) => (
    <div>
      {isAuthenticated ? `مرحباً ${user?.full_name}` : 'غير مسجل'}
    </div>
  )}
</ServerAuth>
```

### دوال السيرفر المساعدة

```tsx
import { 
  requireAuth, 
  requireAdmin, 
  requireActiveUser,
  getServerAuthData 
} from '@/lib/auth/server-utils';

// في Server Component
export default async function ProfilePage() {
  const user = await requireAuth(); // يوجه للدخول إذا لم يكن مسجل
  
  return <div>مرحباً {user.full_name}</div>;
}

// أو
export default async function AdminPage() {
  const user = await requireAdmin(); // يوجه للصفحة الرئيسية إذا لم يكن أدمن
  
  return <div>لوحة الإدارة</div>;
}
```

## المميزات

- ✅ فصل كامل بين الكلاينت والسيرفر
- ✅ استخدام js-cookie للكلاينت
- ✅ استخدام next/headers للسيرفر
- ✅ مكونات حماية جاهزة
- ✅ دوال مساعدة للسيرفر
- ✅ TypeScript support كامل
- ✅ دعم RTL/LTR
- ✅ تكامل مع next-intl
