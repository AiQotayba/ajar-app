import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "./lib/i18n/routing";
// export const authRoutes = [
//   "/login",
//   "/register",
//   "/forgot-password",
//   "/verify-code",
//   "/reset-password",
//   "/verify-code",
//   "/request-delete-account",
//   "/delete-account",
//   "/privacy",
//   "/terms",
// ];
export const protectedRoutes = [
  "/dashboard",
  "/appointments",
  "/services",
  "/working-hours",
  "/ads",
  "/clients",
  "/reviews",
  "/settings",
  // "/privacy",
  // "/terms",
];

const intlMiddleware = createMiddleware(routing);

export const middleware = async (req: NextRequest) => {
  // const tokenAll = await api.getToken();
  // const token = tokenAll?.state?.isAuthenticated
  const token = ""
  // استثناء طلب ملف الـ Service Worker
  if (req.nextUrl.pathname === '/firebase-messaging-sw.js') return NextResponse.next();

  // if (token && authRoutes.includes(req.nextUrl.pathname.slice(3))) {
  //   return NextResponse.redirect(
  //     new URL(`/`, req.nextUrl.origin).toString()
  //   );
  // }
  // if (!token && protectedRoutes.includes(req.nextUrl.pathname.slice(3))) {
  //   return NextResponse.redirect(new URL(`/`, req.nextUrl.origin).toString());
  // }
  // }

  // Run next-intl middleware logic
  const response = intlMiddleware(req);

  // Return the modified response
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
