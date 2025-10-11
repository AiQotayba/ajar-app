"use client"

import Cookies from 'js-cookie';

const LOCALE_COOKIE_NAME = 'NEXT_LOCALE';

/**
 * Save user's preferred locale to cookie
 */
export function saveLocalePreference(locale: string): void {
  Cookies.set(LOCALE_COOKIE_NAME, locale, {
    expires: 365, // 1 year
    path: '/',
    sameSite: 'lax',
  });
}

/**
 * Get user's preferred locale from cookie
 */
export function getLocalePreference(): string | null {
  return Cookies.get(LOCALE_COOKIE_NAME) || null;
}

/**
 * Remove locale preference
 */
export function removeLocalePreference(): void {
  Cookies.remove(LOCALE_COOKIE_NAME, { path: '/' });
}

