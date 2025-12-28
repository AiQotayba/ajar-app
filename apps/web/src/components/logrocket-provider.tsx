'use client';

import { useEffect } from 'react';
import '@/lib/logrocket';

/**
 * LogRocket Provider Component
 * 
 * This component initializes LogRocket on the client side.
 * It should be placed in the root layout.
 */
export function LogRocketProvider() {
  useEffect(() => {
    // LogRocket is initialized in the imported module
    // This effect ensures it runs on mount
    if (process.env.NEXT_PUBLIC_LOGROCKET_APP_ID) {
      console.info('🔍 LogRocket is active');
    }
  }, []);

  return null;
}

