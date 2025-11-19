# 🔥 دليل شامل: تكامل Firebase والإشعارات في SawaStay

## 📋 نظرة عامة

تم تكامل Firebase Cloud Messaging (FCM) في التطبيق لإرسال واستقبال الإشعارات الفورية للمستخدمين. هذا الدليل يشرح بالتفصيل كيفية عمل النظام.

---

## 🏗️ البنية المعمارية

### 1. الملفات الأساسية

```
SawaStay/
├── lib/
│   ├── firebase.ts                    # تهيئة Firebase الأساسية
│   └── notifications.ts              # أنواع الإشعارات
├── kit/
│   └── firebase.ts                    # كلاس Firebase المتقدم
├── hooks/
│   └── useFirebaseMessaging.ts        # Hook مخصص للإشعارات
├── components/
│   └── notifications/
│       ├── notification-bell.tsx     # زر الإشعارات
│       ├── foreground-notification-listener.tsx
│       └── foreground-notification-listener-provider.tsx
├── public/
│   └── firebase-messaging-sw.js       # Service Worker للإشعارات
└── app/
    └── api/
        └── fcm-token/
            └── route.ts               # API لحفظ/حذف FCM tokens
```

---

## 🔧 1. تهيئة Firebase

### ملف `lib/firebase.ts`

هذا الملف يحتوي على التهيئة الأساسية لـ Firebase:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);

// تهيئة Analytics (فقط في المتصفح)
let analytics: any = null;
if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
}

// تهيئة Messaging (فقط في المتصفح)
let messaging: any = null;
if (typeof window !== 'undefined') {
    messaging = getMessaging(app);
}
```

**المتغيرات المطلوبة في `.env.local`:**

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_vapid_key  # مهم جداً للإشعارات
```

---

## 🎯 2. الحصول على FCM Token

### أ) في `lib/firebase.ts`

```typescript
export const getFCMToken = async (): Promise<string | null> => {
    try {
        if (!messaging) return null;
        
        if (!VAPID_KEY) {
            console.warn('VAPID key not configured');
            return null;
        }
        
        // طلب الإذن أولاً
        const permission = await requestNotificationPermission();
        
        if (permission === 'granted') {
            const token = await getToken(messaging, { vapidKey: VAPID_KEY });
            return token;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
};
```

### ب) في `hooks/useFirebaseMessaging.ts`

هذا Hook يوفر واجهة سهلة للتعامل مع Firebase Messaging:

```typescript
export const useFirebaseMessaging = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [token, setToken] = useState<string | null>(null);
    const dispatch = useAppDispatch();
    
    // طلب الإذن والحصول على Token
    const requestPermission = async (): Promise<string | null> => {
        const permissionResult = await Notification.requestPermission();
        setPermission(permissionResult);
        
        if (permissionResult === 'granted') {
            const fcmToken = await getToken(messaging, { vapidKey });
            setToken(fcmToken);
            
            // إرسال Token إلى الخادم
            await sendTokenToServer(fcmToken);
            
            return fcmToken;
        }
        
        return null;
    };
    
    // الاستماع للإشعارات في المقدمة
    useEffect(() => {
        const unsubscribe = onMessage(messaging, (payload) => {
            // تحديث Redux store
            dispatch(fetchNotifications({}));
            
            // عرض Toast
            toast.success(payload.notification?.title || 'إشعار جديد', {
                description: payload.notification?.body,
            });
        });
        
        return () => unsubscribe();
    }, [dispatch]);
    
    return {
        permission,
        token,
        requestPermission,
        deleteFCMToken,
        sendTestNotification,
    };
};
```

---

## 🔔 3. Service Worker للإشعارات

### ملف `public/firebase-messaging-sw.js`

هذا الملف يدير الإشعارات عندما يكون التطبيق في الخلفية:

```javascript
// تهيئة Firebase في Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// معالجة الإشعارات في الخلفية
messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'إشعار جديد';
    const notificationOptions = {
        body: payload.notification?.body || 'لديك إشعار جديد',
        icon: '/brand/logo-app.png',
        badge: '/brand/logo-app.png',
        data: payload.data || {},
        tag: 'sawa-stay-notification',
        requireInteraction: true,
        actions: [
            { action: 'open', title: 'فتح', icon: '/brand/logo-app.png' },
            { action: 'close', title: 'إغلاق' }
        ]
    };
    
    return self.registration.showNotification(notificationTitle, notificationOptions);
});

// معالجة النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'close') return;
    
    // فتح التطبيق أو النافذة
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then((clientList) => {
            for (let client of clientList) {
                if (client.url.includes('/dashboard') && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/dashboard');
            }
        })
    );
});
```

---

## 🎨 4. مكونات الواجهة

### أ) `ForegroundNotificationListenerProvider`

يتم تضمينه في `app/[locale]/layout.tsx`:

```typescript
<ForegroundNotificationListenerProvider />
```

هذا المكون:
- يفحص دعم المتصفح
- يحمل `ForegroundNotificationListener` ديناميكياً
- يتجاهل Instagram WebView

### ب) `ForegroundNotificationListener`

يستمع للإشعارات في المقدمة ويعرضها:

```typescript
export default function ForegroundNotificationListener() {
    const dispatch = useAppDispatch();
    const { permission } = useFirebaseMessaging();
    
    useEffect(() => {
        // الاستماع للرسائل من Service Worker
        const handleMessage = (event: MessageEvent) => {
            if (event.data?.type === "NEW_NOTIFICATION") {
                showNotification(event.data.payload);
            }
        };
        
        navigator.serviceWorker?.addEventListener("message", handleMessage);
        return () => {
            navigator.serviceWorker?.removeEventListener("message", handleMessage);
        };
    }, [permission]);
    
    function showNotification(payload: any) {
        // Toast UI
        toast.success(payload.notification?.title || "إشعار جديد", {
            description: payload.notification?.body,
        });
        
        // Native Notification API
        if (permission === "granted") {
            new Notification(payload.notification?.title || "إشعار جديد", {
                body: payload.notification?.body,
                icon: "/brand/logo.1x1.svg",
            });
        }
        
        // تحديث قائمة الإشعارات
        dispatch(fetchNotifications({}));
    }
    
    return null;
}
```

### ج) `NotificationBell`

مكون زر الإشعارات في الهيدر:

```typescript
export function NotificationBell() {
    const unreadCount = useAppSelector(selectUnreadCount);
    const notifications = useAppSelector(selectNotifications);
    
    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="ghost" size="icon">
                    <Bell />
                    {unreadCount > 0 && (
                        <span className="badge">{unreadCount}</span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                {notifications.map(notification => (
                    <NotificationItem 
                        key={notification.id} 
                        notification={notification} 
                    />
                ))}
            </PopoverContent>
        </Popover>
    );
}
```

---

## 🔌 5. API Endpoint

### ملف `app/api/fcm-token/route.ts`

```typescript
// حفظ Token
export async function POST(request: NextRequest) {
    const { token } = await request.json();
    
    // حفظ في قاعدة البيانات
    // await db.fcmTokens.create({ token, userId, platform });
    
    return NextResponse.json({ success: true });
}

// حذف Token
export async function DELETE(request: NextRequest) {
    const { token } = await request.json();
    
    // حذف من قاعدة البيانات
    // await db.fcmTokens.delete({ token });
    
    return NextResponse.json({ success: true });
}
```

---

## 🚀 6. سير العمل (Workflow)

### عند تحميل التطبيق:

1. **تهيئة Firebase** (`lib/firebase.ts`)
   - يتم تهيئة Firebase App
   - يتم تهيئة Messaging (فقط في المتصفح)

2. **تسجيل Service Worker** (`ForegroundNotificationListenerProvider`)
   - يفحص دعم المتصفح
   - يسجل `/firebase-messaging-sw.js`

3. **طلب الإذن** (عند الحاجة)
   - في صفحة تسجيل الدخول (`components/auth/login.tsx`)
   - أو عند استخدام `useFirebaseMessaging().requestPermission()`

4. **الحصول على FCM Token**
   - يتم الحصول على Token من Firebase
   - يتم إرساله إلى الخادم عبر `/api/fcm-token`

### عند استقبال إشعار:

#### في المقدمة (Foreground):
- `onMessage` في `useFirebaseMessaging` يستقبل الإشعار
- يتم عرض Toast notification
- يتم تحديث Redux store
- يتم تحديث عداد الإشعارات

#### في الخلفية (Background):
- Service Worker (`firebase-messaging-sw.js`) يستقبل الإشعار
- يتم عرض Native Notification
- عند النقر، يتم فتح التطبيق

---

## 📱 7. استخدام في صفحات تسجيل الدخول

### في `components/auth/login.tsx`:

```typescript
import { messaging } from "@/lib/firebase";
import { getToken, onMessage } from "firebase/messaging";

useEffect(() => {
    const getDeviceToken = async () => {
        const permission = await Notification.requestPermission();
        
        if (permission === 'granted' && messaging) {
            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });
            
            setDeviceToken(token);
            
            // إرسال Token إلى الخادم
            if (token) {
                await fetch('/api/fcm-token', {
                    method: 'POST',
                    body: JSON.stringify({ token }),
                });
            }
        }
    };
    
    getDeviceToken();
    
    // الاستماع للإشعارات
    if (messaging) {
        const unsubscribe = onMessage(messaging, (payload) => {
            toast.info(payload.notification?.title, {
                description: payload.notification?.body,
            });
        });
        
        return () => unsubscribe();
    }
}, []);
```

---

## 🛡️ 8. فحص دعم المتصفح

### في `lib/browser-utils.ts`:

```typescript
export function getBrowserInfo() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    return {
        isFCMSupported: 'serviceWorker' in navigator && 'PushManager' in window,
        isPushSupported: 'Notification' in window,
        isSafari: /safari/.test(userAgent) && !/chrome/.test(userAgent),
        isChrome: /chrome/.test(userAgent),
        isInstagramWebView: /instagram/.test(userAgent),
        // ... المزيد
    };
}
```

**ملاحظات مهمة:**
- Instagram WebView لا يدعم Service Workers
- Safari على iOS يحتاج إعدادات خاصة
- يجب فحص الدعم قبل طلب الإذن

---

## ⚙️ 9. إعدادات Next.js

### في `next.config.mjs`:

```javascript
async headers() {
    return [
        {
            source: '/firebase-messaging-sw.js',
            headers: [
                {
                    key: 'Service-Worker-Allowed',
                    value: '/',
                },
                {
                    key: 'Content-Type',
                    value: 'application/javascript',
                },
            ],
        },
    ];
}
```

---

## 🔐 10. الأمان

### أفضل الممارسات:

1. **VAPID Key**: يجب أن يكون في متغيرات البيئة فقط
2. **HTTPS**: Service Workers تعمل فقط على HTTPS (أو localhost)
3. **Token Storage**: لا تخزن Tokens في localStorage بدون تشفير
4. **Permission**: اطلب الإذن فقط عند الحاجة

---

## 🐛 11. استكشاف الأخطاء

### مشاكل شائعة:

#### 1. "messaging/failed-service-worker-registration"
```typescript
// الحل: إعادة تسجيل Service Worker
await navigator.serviceWorker.register('/firebase-messaging-sw.js');
```

#### 2. "Invalid VAPID key"
```typescript
// تأكد من أن VAPID_KEY صحيح في .env.local
NEXT_PUBLIC_FIREBASE_VAPID_KEY=your_actual_vapid_key
```

#### 3. الإشعارات لا تظهر في الخلفية
```typescript
// تأكد من أن Service Worker مسجل بشكل صحيح
// تأكد من أن firebase-messaging-sw.js موجود في /public
```

---

## 📚 12. المراجع

- [Firebase Cloud Messaging Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Next.js Service Workers](https://nextjs.org/docs/app/building-your-application/optimizing/service-workers)
- [Web Push Notifications](https://web.dev/push-notifications-overview/)

---

## ✅ الخلاصة

تم تكامل Firebase والإشعارات بشكل كامل في التطبيق مع:

1. ✅ تهيئة Firebase في `lib/firebase.ts`
2. ✅ Service Worker للإشعارات في الخلفية
3. ✅ Hook مخصص `useFirebaseMessaging` للتعامل مع الإشعارات
4. ✅ مكونات UI لعرض الإشعارات
5. ✅ API endpoint لحفظ/حذف FCM tokens
6. ✅ فحص دعم المتصفح
7. ✅ معالجة الأخطاء

النظام جاهز للاستخدام! 🎉

