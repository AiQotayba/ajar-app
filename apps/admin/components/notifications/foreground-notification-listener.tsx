"use client";

import { useFirebaseMessaging } from "@/hooks/useFirebaseMessaging";
import { useEffect } from "react";
import { toast } from "sonner";

/**
 * هذا المكون يستمع لأي إشعار وارد في foreground
 * ويعرض Toast notification
 */
export default function ForegroundNotificationListener() {
    const { permission } = useFirebaseMessaging();

    useEffect(() => {
        // استقبال الرسائل من service worker أو FCM مباشرة
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === "NEW_NOTIFICATION") {
                const payload = event.data.payload;
                showNotification(payload);
            }
        };

        if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
            navigator.serviceWorker?.addEventListener("message", handleMessage);
            return () => {
                navigator.serviceWorker?.removeEventListener("message", handleMessage);
            };
        }
    }, [permission]);

    function showNotification(payload: any) {
        // Toast UI
        toast.success(payload.notification?.title || "إشعار جديد", {
            description: payload.notification?.body,
            duration: 5000,
        });

        // Native Notification API
        if (permission === "granted") {
            new Notification(payload.notification?.title || "إشعار جديد", {
                body: payload.notification?.body,
                icon: "/placeholder-logo.svg",
                badge: "/placeholder-logo.svg",
            });
        }
    }

    return null; // لا يعرض أي UI
}

