# 🚀 مرجع سريع: Firebase والإشعارات

## 📦 الملفات الرئيسية

| الملف | الوظيفة |
|------|---------|
| `lib/firebase.ts` | تهيئة Firebase الأساسية |
| `kit/firebase.ts` | كلاس Firebase المتقدم |
| `hooks/useFirebaseMessaging.ts` | Hook مخصص للإشعارات |
| `public/firebase-messaging-sw.js` | Service Worker للإشعارات في الخلفية |
| `app/api/fcm-token/route.ts` | API لحفظ/حذف FCM tokens |
| `components/notifications/foreground-notification-listener.tsx` | استماع للإشعارات في المقدمة |

---

## 🔑 المتغيرات المطلوبة

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...  # ⚠️ مهم جداً!
```

---

## 💻 استخدام سريع

### 1. طلب الإذن والحصول على Token

```typescript
import { useFirebaseMessaging } from '@/hooks/useFirebaseMessaging';

const { requestPermission, token, permission } = useFirebaseMessaging();

// طلب الإذن
const handleEnableNotifications = async () => {
    const token = await requestPermission();
    if (token) {
        console.log('Token:', token);
    }
};
```

### 2. الاستماع للإشعارات

```typescript
import { messaging } from '@/lib/firebase';
import { onMessage } from 'firebase/messaging';

useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
        console.log('Notification:', payload);
        toast.success(payload.notification?.title);
    });
    
    return () => unsubscribe();
}, []);
```

### 3. الحصول على Token مباشرة

```typescript
import { getFCMToken } from '@/lib/firebase';

const token = await getFCMToken();
```

---

## 🔔 سير العمل

```
1. تهيئة Firebase → 2. تسجيل Service Worker → 3. طلب الإذن 
→ 4. الحصول على Token → 5. إرسال Token للخادم → 6. استقبال الإشعارات
```

---

## 🎯 حالات الاستخدام

### في المقدمة (Foreground)
- `onMessage` يستقبل الإشعار
- Toast notification يظهر
- Redux store يتحدث

### في الخلفية (Background)
- Service Worker يستقبل الإشعار
- Native notification يظهر
- عند النقر: فتح التطبيق

---

## 🛠️ استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `messaging/failed-service-worker-registration` | إعادة تسجيل Service Worker |
| `Invalid VAPID key` | التحقق من `NEXT_PUBLIC_FIREBASE_VAPID_KEY` |
| الإشعارات لا تظهر | التحقق من تسجيل Service Worker |
| Token null | التحقق من الإذن (permission) |

---

## 📚 الملفات المرجعية

- [firebase-notifications-integration.md](./firebase-notifications-integration.md) - دليل شامل
- [firebase-workflow-diagram.md](./firebase-workflow-diagram.md) - مخططات سير العمل

---

## ✅ Checklist

- [ ] Firebase مشروع تم إنشاؤه
- [ ] VAPID Key تم الحصول عليه
- [ ] متغيرات البيئة تم إعدادها
- [ ] Service Worker يعمل
- [ ] API Endpoint يعمل
- [ ] الاختبار تم بنجاح

---

تم إنشاء هذا الملف بواسطة Auto AI Assistant 🚀

