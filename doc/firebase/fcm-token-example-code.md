# 💻 أمثلة كود: إرسال FCM Token عند تسجيل الدخول

## 📝 مثال 1: الكود الحالي (كما هو)

```typescript
// components/auth/login.tsx
"use client"

import { messaging } from "@/lib/firebase"
import { getToken, onMessage } from "firebase/messaging"
import { useEffect, useState } from "react"

export default function LoginComponent() {
  const [deviceToken, setDeviceToken] = useState<string | null>(null)
  
  // الحصول على Token عند تحميل المكون
  useEffect(() => {
    const getDeviceToken = async () => {
      const token = await requestNotificationPermission()
      setDeviceToken(token)
    }
    
    getDeviceToken()
  }, [])
  
  // طلب الإذن والحصول على Token
  const requestNotificationPermission = async (): Promise<string | null> => {
    try {
      if (!('Notification' in window)) return null;
      if (!('serviceWorker' in navigator)) return null;
      if (!('PushManager' in window)) return null;
      if (!messaging) return null;
      
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        })
        return token
      }
      
      return null
    } catch (error) {
      return null
    }
  }
  
  // إرسال مع device_token
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // التأكد من وجود Token
    let finalDeviceToken = deviceToken
    if (!deviceToken) {
      finalDeviceToken = await requestNotificationPermission()
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: cleanedPhone,
        password,
        role: "user",
        device_token: finalDeviceToken  // ✅ FCM Token
      })
    })
  }
}
```

---

## 🚀 مثال 2: كود محسّن باستخدام Hook

```typescript
// components/auth/login.tsx
"use client"

import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function LoginComponent() {
  const { token, requestPermission, isLoading: isTokenLoading } = useFirebaseMessaging()
  const [deviceToken, setDeviceToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // الحصول على Token تلقائياً
  useEffect(() => {
    const initializeToken = async () => {
      if (token) {
        setDeviceToken(token)
      } else {
        // محاولة الحصول على Token إذا لم يكن موجوداً
        const newToken = await requestPermission()
        if (newToken) {
          setDeviceToken(newToken)
        }
      }
    }
    
    initializeToken()
  }, [token, requestPermission])
  
  // إرسال FCM Token بعد تسجيل الدخول الناجح
  const sendFCMTokenToServer = async (accessToken: string) => {
    if (!deviceToken) return
    
    try {
      const response = await fetch('/api/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
          token: deviceToken,
          device_token: deviceToken  // للتوافق مع Backend
        })
      })
      
      if (!response.ok) {
        console.warn('Failed to save FCM token to server')
      }
    } catch (error) {
      console.error('Error sending FCM token:', error)
      // لا نريد إيقاف العملية إذا فشل حفظ Token
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsLoading(true)
    
    try {
      // التأكد من وجود Token
      let finalDeviceToken = deviceToken || token
      if (!finalDeviceToken) {
        // محاولة الحصول على Token مرة أخرى
        finalDeviceToken = await requestPermission()
      }
      
      // إرسال طلب تسجيل الدخول
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: cleanedPhone,
          password,
          role: "user",
          device_token: finalDeviceToken  // ✅ FCM Token
        })
      }).then(res => res.json())
      
      if (response.success) {
        // حفظ بيانات المستخدم
        dispatch(login({ 
          user: response.data, 
          token: response.access_token 
        }))
        
        // إرسال FCM Token إلى الخادم (بعد تسجيل الدخول)
        await sendFCMTokenToServer(response.access_token)
        
        // إعادة التوجيه
        router.push('/dashboard')
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {/* ... نموذج تسجيل الدخول ... */}
      <Button 
        type="submit" 
        disabled={isLoading || isTokenLoading}
      >
        {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </Button>
    </form>
  )
}
```

---

## 🔄 مثال 3: إرسال Token بعد تسجيل الدخول (منفصل)

```typescript
// utils/fcm-token-manager.ts
import { messaging } from '@/lib/firebase'
import { getToken } from 'firebase/messaging'

/**
 * إرسال FCM Token إلى الخادم بعد تسجيل الدخول
 */
export async function sendFCMTokenAfterLogin(
  accessToken: string,
  deviceToken?: string | null
): Promise<boolean> {
  try {
    // إذا لم يتم تمرير Token، حاول الحصول عليه
    let token = deviceToken
    
    if (!token && messaging) {
      try {
        const permission = Notification.permission
        
        if (permission === 'granted') {
          token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          })
        }
      } catch (error) {
        console.warn('Could not get FCM token:', error)
        return false
      }
    }
    
    if (!token) {
      console.warn('No FCM token available')
      return false
    }
    
    // إرسال Token إلى الخادم
    const response = await fetch('/api/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ 
        token,
        device_token: token  // للتوافق
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to save FCM token')
    }
    
    return true
  } catch (error) {
    console.error('Error sending FCM token after login:', error)
    return false
  }
}

/**
 * حذف FCM Token عند تسجيل الخروج
 */
export async function deleteFCMTokenOnLogout(
  accessToken: string,
  deviceToken?: string | null
): Promise<boolean> {
  try {
    if (!deviceToken) return false
    
    const response = await fetch('/api/fcm-token', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ token: deviceToken })
    })
    
    return response.ok
  } catch (error) {
    console.error('Error deleting FCM token:', error)
    return false
  }
}
```

**الاستخدام:**

```typescript
// في login.tsx
import { sendFCMTokenAfterLogin } from '@/utils/fcm-token-manager'

const handleSubmit = async (e: React.FormEvent) => {
  // ... تسجيل الدخول ...
  
  if (response.success) {
    dispatch(login({ user: response.data, token: response.access_token }))
    
    // إرسال FCM Token بعد تسجيل الدخول
    await sendFCMTokenAfterLogin(response.access_token, deviceToken)
    
    router.push('/dashboard')
  }
}
```

---

## 🎯 مثال 4: استخدام Redux Middleware

```typescript
// middleware/fcm-token-middleware.ts
import { Middleware } from '@reduxjs/toolkit'
import { sendFCMTokenAfterLogin, deleteFCMTokenOnLogout } from '@/utils/fcm-token-manager'

export const fcmTokenMiddleware: Middleware = (store) => (next) => (action) => {
  const result = next(action)
  
  // بعد تسجيل الدخول الناجح
  if (action.type === 'auth/login/fulfilled') {
    const { access_token, device_token } = action.payload
    
    // إرسال FCM Token
    if (access_token && device_token) {
      sendFCMTokenAfterLogin(access_token, device_token)
        .then(success => {
          if (success) {
            console.info('✅ FCM token sent to server')
          }
        })
    }
  }
  
  // عند تسجيل الخروج
  if (action.type === 'auth/logout') {
    const state = store.getState()
    const { access_token, device_token } = state.auth
    
    if (access_token && device_token) {
      deleteFCMTokenOnLogout(access_token, device_token)
    }
  }
  
  return result
}
```

**التسجيل في Redux Store:**

```typescript
// lib/redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import { fcmTokenMiddleware } from '@/middleware/fcm-token-middleware'

export const store = configureStore({
  reducer: {
    // ... reducers
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(fcmTokenMiddleware),
})
```

---

## 🔐 مثال 5: Backend API (Node.js/Express)

```typescript
// backend/routes/auth.js
const express = require('express')
const router = express.Router()

router.post('/login', async (req, res) => {
  try {
    const { phone, password, device_token } = req.body
    
    // التحقق من بيانات تسجيل الدخول
    const user = await User.findOne({ phone })
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        success: false,
        message: 'بيانات تسجيل الدخول غير صحيحة'
      })
    }
    
    // حفظ أو تحديث device_token
    if (device_token) {
      await DeviceToken.findOneAndUpdate(
        { user_id: user.id, device_token },
        {
          user_id: user.id,
          device_token,
          platform: 'web',
          user_agent: req.headers['user-agent'],
          updated_at: new Date()
        },
        { upsert: true, new: true }
      )
    }
    
    // إنشاء JWT token
    const access_token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    
    res.json({
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name
      },
      access_token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تسجيل الدخول'
    })
  }
})

module.exports = router
```

---

## 📊 مثال 6: Backend API (Laravel/PHP)

```php
// app/Http/Controllers/AuthController.php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\DeviceToken;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'phone' => 'required|string',
            'password' => 'required|string',
            'device_token' => 'nullable|string'
        ]);
        
        $user = User::where('phone', $request->phone)->first();
        
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'بيانات تسجيل الدخول غير صحيحة'
            ], 401);
        }
        
        // حفظ أو تحديث device_token
        if ($request->device_token) {
            DeviceToken::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'device_token' => $request->device_token
                ],
                [
                    'platform' => 'web',
                    'user_agent' => $request->header('User-Agent'),
                    'updated_at' => now()
                ]
            );
        }
        
        // إنشاء token
        $token = $user->createToken('auth-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'phone' => $user->phone,
                'name' => $user->name
            ],
            'access_token' => $token
        ]);
    }
}
```

---

## 🎨 مثال 7: React Component كامل

```typescript
// components/auth/login-enhanced.tsx
"use client"

import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging'
import { useAppDispatch } from '@/lib/redux/hooks'
import { login } from '@/lib/redux/slices/authSlice'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function EnhancedLoginComponent() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { token, requestPermission, isLoading: isTokenLoading } = useFirebaseMessaging()
  
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // إرسال FCM Token بعد تسجيل الدخول
  const sendFCMToken = async (accessToken: string) => {
    if (!token) return
    
    try {
      await fetch('/api/fcm-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ token })
      })
    } catch (error) {
      console.error('Failed to send FCM token:', error)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      // الحصول على Token إذا لم يكن موجوداً
      let finalToken = token
      if (!finalToken) {
        finalToken = await requestPermission()
      }
      
      // إرسال طلب تسجيل الدخول
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          password,
          role: 'user',
          device_token: finalToken  // ✅ FCM Token
        })
      }).then(res => res.json())
      
      if (response.success) {
        // حفظ بيانات المستخدم
        dispatch(login({
          user: response.data,
          token: response.access_token
        }))
        
        // إرسال FCM Token (بعد تسجيل الدخول)
        await sendFCMToken(response.access_token)
        
        toast.success('تم تسجيل الدخول بنجاح')
        router.push('/dashboard')
      } else {
        toast.error(response.message || 'فشل تسجيل الدخول')
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء تسجيل الدخول')
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="رقم الهاتف"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="كلمة المرور"
        required
      />
      
      <button
        type="submit"
        disabled={isLoading || isTokenLoading}
        className="w-full bg-primary-500 text-white py-2 rounded"
      >
        {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
      </button>
      
      {token && (
        <p className="text-xs text-gray-500">
          ✅ الإشعارات مفعلة
        </p>
      )}
    </form>
  )
}
```

---

## ✅ الخلاصة

### الطريقة الموصى بها:

1. **الحصول على Token عند تحميل الصفحة**
2. **إرسال Token مع بيانات تسجيل الدخول** (`device_token` في body)
3. **إعادة إرسال Token بعد تسجيل الدخول** (اختياري، للتأكد من التحديث)

### المزايا:

- ✅ Token يُرسل مع طلب تسجيل الدخول (أسرع)
- ✅ Token يُحدث بعد تسجيل الدخول (للتأكد)
- ✅ معالجة الأخطاء بشكل صحيح
- ✅ Token اختياري (لا يمنع تسجيل الدخول)

---

تم إنشاء هذا الملف بواسطة Auto AI Assistant 🚀

