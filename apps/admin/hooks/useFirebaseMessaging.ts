import { getBrowserInfo } from '@/lib/browser-utils';
import { messaging } from '@/lib/firebase';
import { deleteToken, getToken, onMessage } from 'firebase/messaging';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface BrowserSupport {
    isFCMSupported: boolean;
    isPushSupported: boolean;
    isSafari: boolean;
    isChrome: boolean;
    isFirefox: boolean;
    isEdge: boolean;
    isWebView: boolean;
    isMobile: boolean;
    isInstagramWebView: boolean;
    isFacebookWebView: boolean;
    isSnapchatWebView: boolean;
    isIOS: boolean;
    isAndroid: boolean;
    browserName: string;
    browserVersion: string;
    platform: string;
    supportMessage: string;
    canRequestPermission: boolean;
}

export const useFirebaseMessaging = () => {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // فحص دعم المتصفح
    const browserInfo = getBrowserInfo();

    // حماية: إذا كان Instagram WebView أو WebView عام، أوقف الميزات
    if (browserInfo.isInstagramWebView || browserInfo.isWebView) {
        return {
            permission: 'denied',
            token: null,
            isLoading: false,
            error: 'الإشعارات غير مدعومة في متصفح Instagram. يرجى فتح الموقع في متصفح خارجي.',
            browserSupport: browserInfo,
            requestPermission: async () => null,
            deleteFCMToken: async () => {},
            sendTestNotification: () => {},
        };
    }

    const checkBrowserSupport = (): BrowserSupport => {
        return {
            isFCMSupported: browserInfo.isFCMSupported,
            isPushSupported: browserInfo.isPushSupported,
            isSafari: browserInfo.isSafari,
            isChrome: browserInfo.isChrome,
            isFirefox: browserInfo.isFirefox,
            isEdge: browserInfo.isEdge,
            isWebView: browserInfo.isWebView,
            isMobile: browserInfo.isMobile,
            isInstagramWebView: browserInfo.isInstagramWebView,
            isFacebookWebView: browserInfo.isFacebookWebView,
            isSnapchatWebView: browserInfo.isSnapchatWebView,
            isIOS: browserInfo.isIOS,
            isAndroid: browserInfo.isAndroid,
            browserName: browserInfo.browserName,
            browserVersion: browserInfo.browserVersion,
            platform: browserInfo.platform,
            supportMessage: browserInfo.supportMessage,
            canRequestPermission: browserInfo.canRequestPermission
        };
    };

    const browserSupport = checkBrowserSupport();

    // طلب إذن الإشعارات
    const requestPermission = async (): Promise<string | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const support = checkBrowserSupport();

            // فحص إذا كان المتصفح مدعوم
            if (!support.canRequestPermission) {
                setError(support.supportMessage);
                return null;
            }

            // طلب الإذن
            const permissionResult = await Notification.requestPermission();
            setPermission(permissionResult);

            if (permissionResult === 'granted') {
                // الحصول على token
                const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
                if (!vapidKey) {
                    setError('VAPID key غير متوفر');
                    return null;
                }

                try {
                    const fcmToken = await getToken(messaging, { vapidKey });
                    setToken(fcmToken);
                    
                    // تم إلغاء إرسال token إلى الخادم
                    // await sendTokenToServer(fcmToken);
                    
                    toast.success('تم تفعيل الإشعارات بنجاح');
                    return fcmToken;
                } catch (tokenError) {
                    console.error('Error getting FCM token:', tokenError);
                    setError('فشل في الحصول على token الإشعارات');
                    return null;
                }
            } else {
                setError('تم رفض إذن الإشعارات');
                return null;
            }
        } catch (err) {
            console.error('Error requesting notification permission:', err);
            setError('حدث خطأ في طلب إذن الإشعارات');
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // حذف token
    const deleteFCMToken = async () => {
        try {
            await deleteToken(messaging);
            setToken(null);
            setPermission('default');
            toast.success('تم إلغاء تفعيل الإشعارات');
        } catch (err) {
            console.error('Error deleting FCM token:', err);
            setError('فشل في إلغاء تفعيل الإشعارات');
        }
    };

    // إرسال إشعار تجريبي
    const sendTestNotification = () => {
        if (typeof window === 'undefined' || !('Notification' in window)) return;
        
        if (permission === 'granted') {
            new Notification('إشعار تجريبي', {
                body: 'هذا إشعار تجريبي من لوحة تحكم أجار',
                icon: '/placeholder-logo.svg',
                badge: '/placeholder-logo.svg'
            });
            toast.success('تم إرسال إشعار تجريبي');
        } else {
            toast.error('يجب السماح بالإشعارات أولاً');
        }
    };

    // الاستماع للإشعارات في المقدمة
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const unsubscribe = onMessage(messaging, (payload) => {
            // عرض toast notification
            toast.success(payload.notification?.title || 'إشعار جديد', {
                description: payload.notification?.body,
                duration: 5000,
            });
        });

        return () => unsubscribe();
    }, []);

    // التحقق من حالة الإذن عند التحميل
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if ('Notification' in window) {
            setPermission(Notification.permission);
        }
    }, []);

    return {
        permission,
        token,
        isLoading,
        error,
        browserSupport,
        requestPermission,
        deleteFCMToken,
        sendTestNotification,
    };
};

