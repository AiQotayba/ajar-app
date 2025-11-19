/**
 * Utility functions for browser detection and feature support
 */

export interface BrowserInfo {
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
    isPWASupported: boolean;
}

export function getBrowserInfo(): BrowserInfo {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        return {
            isFCMSupported: false,
            isPushSupported: false,
            isSafari: false,
            isChrome: false,
            isFirefox: false,
            isEdge: false,
            isWebView: false,
            isMobile: false,
            isInstagramWebView: false,
            isFacebookWebView: false,
            isSnapchatWebView: false,
            isIOS: false,
            isAndroid: false,
            browserName: 'unknown',
            browserVersion: '0',
            platform: 'unknown',
            supportMessage: 'Browser detection not available',
            canRequestPermission: false,
            isPWASupported: false,
        };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();

    // Detect browser
    const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent);
    const isChrome = /chrome/.test(userAgent) && !/edg/.test(userAgent);
    const isFirefox = /firefox/.test(userAgent);
    const isEdge = /edg/.test(userAgent);

    // Detect platform
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isMobile = isIOS || isAndroid || /mobile/.test(userAgent);

    // Detect WebView
    const isWebView = /wv/.test(userAgent) ||
        (isAndroid && !/chrome/.test(userAgent)) ||
        (isIOS && !/safari/.test(userAgent) && !/chrome/.test(userAgent));

    const isInstagramWebView = /instagram/.test(userAgent);
    const isFacebookWebView = /fban|fbav/.test(userAgent);
    const isSnapchatWebView = /snapchat/.test(userAgent);

    // Browser name and version
    let browserName = 'unknown';
    let browserVersion = '0';

    if (isChrome) {
        browserName = 'chrome';
        const match = userAgent.match(/chrome\/(\d+)/);
        browserVersion = match ? match[1] : '0';
    } else if (isSafari) {
        browserName = 'safari';
        const match = userAgent.match(/version\/(\d+)/);
        browserVersion = match ? match[1] : '0';
    } else if (isFirefox) {
        browserName = 'firefox';
        const match = userAgent.match(/firefox\/(\d+)/);
        browserVersion = match ? match[1] : '0';
    } else if (isEdge) {
        browserName = 'edge';
        const match = userAgent.match(/edg\/(\d+)/);
        browserVersion = match ? match[1] : '0';
    }

    // Check FCM support
    const isFCMSupported = (() => {
        // FCM requires serviceWorker, PushManager, and not mobile
        if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
            return false;
        }
        if (typeof window === 'undefined' || !('PushManager' in window)) {
            return false;
        }
        // Instagram WebView doesn't support FCM
        if (isInstagramWebView || isWebView) {
            return false;
        }
        return true;
    })();

    // Check Push API support
    const isPushSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;

    // PWA support
    const isPWASupported = 'serviceWorker' in navigator && 'PushManager' in window && !isInstagramWebView && !isWebView;

    // Can request permission
    const canRequestPermission = isPushSupported && !isInstagramWebView && !isWebView;

    // Support message
    let supportMessage = '';
    if (!isPushSupported) {
        supportMessage = 'المتصفح لا يدعم الإشعارات';
    } else if (isInstagramWebView) {
        supportMessage = 'الإشعارات غير مدعومة في متصفح Instagram. يرجى فتح الموقع في متصفح خارجي.';
    } else if (isWebView) {
        supportMessage = 'الإشعارات غير مدعومة في هذا المتصفح';
    } else if (!isFCMSupported) {
        supportMessage = 'الإشعارات متاحة ولكن قد لا تعمل بشكل كامل';
    } else {
        supportMessage = 'الإشعارات مدعومة بالكامل';
    }

    return {
        isFCMSupported,
        isPushSupported,
        isSafari,
        isChrome,
        isFirefox,
        isEdge,
        isWebView,
        isMobile,
        isInstagramWebView,
        isFacebookWebView,
        isSnapchatWebView,
        isIOS,
        isAndroid,
        browserName,
        browserVersion,
        platform,
        supportMessage,
        canRequestPermission,
        isPWASupported,
    };
}

