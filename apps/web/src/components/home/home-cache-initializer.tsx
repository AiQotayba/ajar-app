"use client";

import { useEffect } from "react";
import { useHomeCache } from "@/hooks/use-home-cache";

/**
 * Ensures home cache (footer, categories, governorates, cities)
 * is always loaded as soon as the public layout is mounted.
 * هذا المكوّن لا يعرض أي شيء، فقط يضمن استدعاء الـ APIs عند الدخول للموقع.
 */
export function HomeCacheInitializer() {
  const { isExpiredOrEmpty, loading, refetch } = useHomeCache();

  useEffect(() => {
    if (isExpiredOrEmpty && !loading) {
      refetch();
    }
  }, [isExpiredOrEmpty, loading, refetch]);

  return null;
}

