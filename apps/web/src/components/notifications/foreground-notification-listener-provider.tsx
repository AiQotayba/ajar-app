"use client";

import { getBrowserInfo } from "@/lib/browser-utils";
import { useEffect, useState } from "react";

export default function ForegroundNotificationListenerProvider() {
    const [Component, setComponent] = useState<React.ComponentType | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { isPWASupported } = getBrowserInfo();

    // if instagram webview 
    let userAgent: any = "";
    if (typeof window !== "undefined" && 'serviceWorker' in navigator) {
        userAgent = navigator.userAgent.toLowerCase();
    }

    useEffect(() => {
        // فحص الشروط قبل تحميل المكون
        if (!isPWASupported) return;

        if (userAgent.includes("instagram")) return;

        setIsLoading(true);
        setError(null);

        // Dynamic import للمكون
        import("./foreground-notification-listener")
            .then((module) => {
                setComponent(() => module.default);
                setIsLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setIsLoading(false);
            });
    }, [isPWASupported, userAgent]);

    // إرجاع المكون المحمل أو null
    if (isLoading) return null;
    if (error) return null;
    if (!Component) return null;
    else return <Component />;
}

