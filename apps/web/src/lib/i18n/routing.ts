import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'ar'],

  // Used when no locale matches
  defaultLocale: 'ar',

  // The prefix used for routing
  // 'always' = always show locale in URL (/en/login, /ar/login)
  // 'as-needed' = hide default locale from URL (/login = ar, /en/login = en)
  localePrefix: 'always',
  
  // Locale detection from browser/cookies
  localeDetection: true,
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
