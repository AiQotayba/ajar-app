"use client"

import { useLocale } from 'next-intl';
import { useEffect } from 'react';
import { saveLocalePreference } from '@/lib/i18n/locale-cookie';

/**
 * Component to save current locale to cookie
 * This ensures the user's language preference is remembered
 */
export function LocaleSaver() {
  const locale = useLocale();

  useEffect(() => {
    // Save current locale to cookie
    saveLocalePreference(locale);
  }, [locale]);

  return null;
}

