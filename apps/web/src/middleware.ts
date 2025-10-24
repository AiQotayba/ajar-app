import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "./lib/i18n/routing";

// Auth routes that should redirect to home if user is authenticated
export const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-otp",
  "/reset-password",
];

// Protected routes that require authentication
export const protectedRoutes = [
  "/profile",
  "/favorites",
  "/my-listings",
  "/notifications",
  "/settings",
];

const intlMiddleware = createMiddleware(routing);

// Function to detect user's preferred locale
function getPreferredLocale(req: NextRequest): string {
  // 1. Check if locale is in cookie
  const localeCookie = req.cookies.get('NEXT_LOCALE')?.value;
  if (localeCookie && routing.locales.includes(localeCookie as any)) {
    return localeCookie;
  }

  // 2. Check Accept-Language header from browser
  const acceptLanguage = req.headers.get('accept-language');
  if (acceptLanguage) {
    const browserLocale = acceptLanguage.split(',')[0].split('-')[0];
    if (browserLocale === 'en' || browserLocale === 'ar') {
      return browserLocale;
    }
  }

  // 3. Return default locale
  return routing.defaultLocale;
}

export const middleware = async (req: NextRequest) => {
  // استثناء طلب ملف الـ Service Worker والخطوط
  if (req.nextUrl.pathname === '/firebase-messaging-sw.js' || 
      req.nextUrl.pathname === '/manifest.json' ||
      req.nextUrl.pathname.startsWith('/fonts/')) {
    return NextResponse.next();
  }

  // Check if user is on root path
  if (req.nextUrl.pathname === '/') {
    const preferredLocale = getPreferredLocale(req);
    return NextResponse.redirect(new URL(`/${preferredLocale}`, req.url));
  }

  // Run next-intl middleware logic FIRST to handle locale
  const response = intlMiddleware(req);
  
  // Get token from cookies
  const token = req.cookies.get('ajar_token')?.value;
  const isAuthenticated = !!token;

  // Extract pathname without locale
  const pathname = req.nextUrl.pathname;
  const pathnameWithoutLocale = pathname.replace(/^\/(en|ar)/, '') || '/';

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && authRoutes.includes(pathnameWithoutLocale)) {
    const locale = pathname.match(/^\/(en|ar)/)?.[1] || 'ar';
    return NextResponse.redirect(new URL(`/${locale}`, req.nextUrl.origin));
  }

  // Redirect unauthenticated users to login for protected routes
  if (!isAuthenticated && protectedRoutes.includes(pathnameWithoutLocale)) {
    const locale = pathname.match(/^\/(en|ar)/)?.[1] || 'ar';
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl.origin));
  }

  // Return the response
  return response;
};
export const config = {
  // Match only internationalized pathnames

  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/(en|ar)/(.*)",
    "/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)",
  ],
};
