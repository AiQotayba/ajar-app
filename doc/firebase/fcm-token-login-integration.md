# 🔐 دليل: إرسال FCM Token عند تسجيل الدخول

## 📋 نظرة عامة

يتم إرسال FCM Token (device_token) إلى الخادم عند تسجيل الدخول أو التسجيل لربط الجهاز بالمستخدم وإرسال الإشعارات المستهدفة.

---

## 🔄 سير العمل الحالي

### 1. في صفحة تسجيل الدخول (`components/auth/login.tsx`)

```typescript
// الخطوة 1: الحصول على FCM Token عند تحميل المكون
useEffect(() => {
  const getDeviceToken = async () => {
    const token = await requestNotificationPermission()
    setDeviceToken(token)
  }
  
  getDeviceToken()
}, [])

// الخطوة 2: إرسال Token مع بيانات تسجيل الدخول
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // التأكد من وجود Token (أو محاولة الحصول عليه مرة أخرى)
  let finalDeviceToken = deviceToken
  if (!deviceToken) {
    finalDeviceToken = await requestNotificationPermission()
  }
  
  // إرسال طلب تسجيل الدخول مع device_token
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": locale,
    },
    body: JSON.stringify({
      phone: cleanedPhone,
      password,
      role: "user",
      device_token: finalDeviceToken  // ✅ FCM Token هنا
    })
  })
}
```

### 2. في صفحة التسجيل (`app/[locale]/(auth)/register/page.tsx`)

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  // الحصول على Token إذا لم يكن موجوداً
  let finalDeviceToken = deviceToken
  if (!deviceToken) {
    finalDeviceToken = await requestNotificationPermission()
  }
  
  // إرسال بيانات التسجيل مع device_token
  const submitData = {
    ...formData,
    phone: cleanedPhone,
    device_token: finalDeviceToken  // ✅ FCM Token هنا
  }
  
  const response = await api.post("/auth/register", submitData)
}
```

---

## 🎯 الوظيفة `requestNotificationPermission`

هذه الوظيفة تقوم بـ:

1. **فحص دعم المتصفح**
2. **طلب إذن الإشعارات**
3. **الحصول على FCM Token**

```typescript
const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // فحص دعم الإشعارات
    if (!('Notification' in window)) return null;
    if (!('serviceWorker' in navigator)) return null;
    if (!('PushManager' in window)) return null;
    if (!messaging) return null;
    
    // طلب الإذن
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      try {
        // الحصول على FCM Token
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        })
        return token
      } catch (tokenError: any) {
        // معالجة الأخطاء
        if (tokenError.code === 'messaging/failed-service-worker-registration') {
          // محاولة إعادة التسجيل
          // ...
        }
        return null
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}
```

---

## 📡 استقبال Token في الخادم

### Backend API Endpoint: `/auth/login`

يجب أن يستقبل الخادم `device_token` ويحفظه:

```typescript
// مثال على Backend (Node.js/Express)
app.post('/auth/login', async (req, res) => {
  const { phone, password, device_token } = req.body;
  
  // التحقق من بيانات تسجيل الدخول
  const user = await authenticateUser(phone, password);
  
  if (user) {
    // حفظ أو تحديث device_token للمستخدم
    if (device_token) {
      await saveDeviceToken(user.id, device_token, {
        platform: 'web',
        userAgent: req.headers['user-agent'],
        createdAt: new Date()
      });
    }
    
    // إرجاع بيانات المستخدم و Token
    res.json({
      success: true,
      data: user,
      access_token: generateJWT(user)
    });
  }
});
```

---

## 🔄 تحديث Token بعد تسجيل الدخول

بعد نجاح تسجيل الدخول، يمكن تحديث Token عبر API منفصل:

```typescript
// بعد تسجيل الدخول الناجح
if (response.success) {
  dispatch(login({ user: response.data, token: response.access_token }))
  
  // تحديث FCM Token مع token المصادقة
  if (deviceToken) {
    await fetch('/api/fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${response.access_token}`
      },
      body: JSON.stringify({ 
        token: deviceToken,
        device_token: deviceToken  // للتوافق
      })
    })
  }
}
```

---

## 🎨 تحسين مقترح: استخدام Hook مخصص

يمكن تحسين الكود باستخدام `useFirebaseMessaging` Hook:

```typescript
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';

export default function LoginComponent() {
  const { token, requestPermission } = useFirebaseMessaging();
  const [deviceToken, setDeviceToken] = useState<string | null>(null);
  
  useEffect(() => {
    // الحصول على Token تلقائياً
    const getToken = async () => {
      if (!token) {
        const newToken = await requestPermission();
        if (newToken) {
          setDeviceToken(newToken);
        }
      } else {
        setDeviceToken(token);
      }
    };
    
    getToken();
  }, [token, requestPermission]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التأكد من وجود Token
    let finalDeviceToken = deviceToken || token;
    if (!finalDeviceToken) {
      finalDeviceToken = await requestPermission();
    }
    
    // إرسال مع device_token
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: cleanedPhone,
        password,
        role: "user",
        device_token: finalDeviceToken
      })
    });
  };
}
```

---

## 🔐 الأمان

### أفضل الممارسات:

1. **عدم إرسال Token بدون مصادقة**: بعد تسجيل الدخول، استخدم JWT token
2. **التحقق من Token**: تأكد من صحة FCM Token قبل حفظه
3. **ربط Token بالمستخدم**: احفظ Token مع `user_id` في قاعدة البيانات
4. **تحديث Token**: Firebase قد يحدث Token، يجب إعادة إرساله

---

## 📊 قاعدة البيانات المقترحة

```sql
CREATE TABLE device_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  device_token TEXT NOT NULL UNIQUE,
  platform VARCHAR(50) DEFAULT 'web',
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_device_tokens_user_id ON device_tokens(user_id);
CREATE INDEX idx_device_tokens_token ON device_tokens(device_token);
```

---

## 🔄 سير العمل الكامل

```
┌─────────────────────────────────────────────────────────────┐
│  1. المستخدم يفتح صفحة تسجيل الدخول                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  2. useEffect يطلب إذن الإشعارات                            │
│     - requestNotificationPermission()                        │
│     - Notification.requestPermission()                      │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  3. الحصول على FCM Token                                    │
│     - getToken(messaging, { vapidKey })                     │
│     - حفظ في state (deviceToken)                            │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  4. المستخدم يدخل بيانات تسجيل الدخول                      │
│     - phone, password                                        │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  5. عند Submit:                                             │
│     - التأكد من وجود deviceToken                            │
│     - إذا لم يكن موجوداً، طلب الإذن مرة أخرى                │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  6. إرسال طلب POST /auth/login                              │
│     {                                                       │
│       phone: "...",                                         │
│       password: "...",                                      │
│       role: "user",                                        │
│       device_token: "fcm_token_here"  ✅                     │
│     }                                                       │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  7. الخادم:                                                 │
│     - التحقق من بيانات تسجيل الدخول                         │
│     - حفظ device_token مع user_id                           │
│     - إرجاع access_token                                    │
└─────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────┐
│  8. Client:                                                 │
│     - حفظ access_token في Redux                             │
│     - (اختياري) تحديث FCM Token عبر /api/fcm-token         │
│     - إعادة التوجيه إلى Dashboard                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 استكشاف الأخطاء

### المشكلة 1: `device_token` هو `null`

**السبب**: لم يتم منح الإذن أو فشل الحصول على Token

**الحل**:
```typescript
// التحقق قبل الإرسال
if (!finalDeviceToken) {
  console.warn('FCM Token not available, proceeding without it');
  // يمكن المتابعة بدون Token أو طلب الإذن مرة أخرى
}
```

### المشكلة 2: Token لا يُحفظ في الخادم

**السبب**: Backend لا يستقبل `device_token` بشكل صحيح

**الحل**: التحقق من:
- Backend يستقبل `device_token` في body
- قاعدة البيانات جاهزة لحفظ Tokens
- لا توجد أخطاء في Backend logs

### المشكلة 3: Token يتغير بعد تسجيل الدخول

**السبب**: Firebase قد يحدث Token

**الحل**: إعادة إرسال Token بعد تسجيل الدخول:
```typescript
// بعد تسجيل الدخول الناجح
if (response.success && deviceToken) {
  await fetch('/api/fcm-token', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${response.access_token}`
    },
    body: JSON.stringify({ token: deviceToken })
  });
}
```

---

## ✅ Checklist

- [ ] FCM Token يتم الحصول عليه عند تحميل صفحة تسجيل الدخول
- [ ] `device_token` يُرسل مع بيانات تسجيل الدخول
- [ ] Backend يستقبل ويحفظ `device_token`
- [ ] Token مربوط بـ `user_id` في قاعدة البيانات
- [ ] Token يتم تحديثه بعد تسجيل الدخول (اختياري)
- [ ] معالجة الحالات التي لا يتوفر فيها Token
- [ ] اختبار على متصفحات مختلفة

---

## 📝 ملاحظات مهمة

1. **Token اختياري**: يمكن تسجيل الدخول بدون Token (إذا رفض المستخدم الإذن)
2. **تحديث Token**: يجب إعادة إرسال Token إذا تغير
3. **حذف Token**: عند تسجيل الخروج، يجب حذف Token من قاعدة البيانات
4. **أمان**: لا تعرض Token في logs أو console في الإنتاج

---

## 🔗 ملفات ذات صلة

- `components/auth/login.tsx` - صفحة تسجيل الدخول
- `app/[locale]/(auth)/register/page.tsx` - صفحة التسجيل
- `hooks/useFirebaseMessaging.ts` - Hook مخصص للإشعارات
- `lib/firebase.ts` - تهيئة Firebase
- `app/api/fcm-token/route.ts` - API لحفظ/حذف Tokens

---

تم إنشاء هذا الملف بواسطة Auto AI Assistant 🚀

