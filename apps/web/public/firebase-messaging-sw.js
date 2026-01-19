// Firebase Cloud Messaging Service Worker
// هذا الملف يدير الإشعارات في الخلفية

// Import Firebase scripts
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase configuration
// Note: In production, these should come from environment variables
// For now, we'll use a placeholder that will be replaced at build time
const firebaseConfig = {
    apiKey: "AIzaSyAQGqnhbXLxad5pcCARxtc5ay3SiGedM14",
    authDomain: "ajar-b6b42.firebaseapp.com",
    projectId: "ajar-b6b42",
    storageBucket: "ajar-b6b42.firebasestorage.app",
    messagingSenderId: "326287341093",
    appId: "1:326287341093:web:3464427f1c366d5b43b1cc",
    measurementId: "G-7M8T28REV5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Service Worker installation
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);

    const notificationTitle = payload.notification?.title || 'إشعار جديد';
    const notificationOptions = {
        body: payload.notification?.body || 'لديك إشعار جديد',
        icon: '/images/logo.png',
        badge: '/images/logo.png',
        data: payload.data || {},
        tag: 'ajar-notification',
        requireInteraction: true,
        // actions: [
        //     {
        //         action: 'open',
        //         title: 'فتح',
        //         icon: '/images/logo.png'
        //     },
        //     {
        //         action: 'close',
        //         title: 'إغلاق'
        //     }
        // ]
    };

    // return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    // Handle the click event - open the app
    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        }).then((clientList) => {
            // Check if the app is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url.includes('/') && 'focus' in client) {
                    return client.focus();
                }
            }

            // If not open, open a new window
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('[firebase-messaging-sw.js] Notification closed');
});

// Handle message from main thread
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

