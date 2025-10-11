import { NextRequest, NextResponse } from "next/server"

// Auth routes that should redirect to dashboard if user is authenticated
export const authRoutes = [
    "/login",
    "/forgot-password",
    "/verify-otp",
    "/reset-password",
]

// Public routes that don't require authentication
export const publicRoutes = [
    ...authRoutes,
]

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl

    // Get token from cookies
    const token = request.cookies.get("ajar_admin_token")?.value
    const isAuthenticated = !!token

    // Check if current path is auth route
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

    // Check if current path is public route
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

    // Redirect authenticated users away from auth pages to dashboard
    if (isAuthenticated && isAuthRoute) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Redirect unauthenticated users to login (except for public routes)
    if (!isAuthenticated && !isPublicRoute) {
        // Store the original URL to redirect back after login
        const redirectUrl = new URL("/login", request.url)
        redirectUrl.searchParams.set("redirect", pathname)
        return NextResponse.redirect(redirectUrl)
    }

    // Allow the request to proceed
    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|icons|images|.*\\..*|_next).*)",
    ],
}

