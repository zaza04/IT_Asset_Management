import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/devices', '/settings']

// Public routes that don't require authentication
const authRoutes = ['/sign-in', '/sign-up', '/forgot-password']

function isAuthenticated(request: NextRequest): boolean {
  // Check if session exists in cookies or localStorage
  // Since middleware runs on server, we check cookies
  const sessionCookie = request.cookies.get('auth_session')

  // For client-side localStorage check, we'll rely on AuthContext
  // Here we just check if user is trying to access protected routes
  return false // Will be handled by AuthContext on client-side
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if accessing a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))

  // For now, let client-side AuthContext handle redirects
  // Middleware will just handle basic redirects

  // Redirect /login to /sign-in
  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  // Redirect /register to /sign-up
  if (pathname === '/register') {
    return NextResponse.redirect(new URL('/sign-up', request.url))
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.svg (favicon file)
    '/((?!api|_next/static|_next/image|favicon.svg).*)',
  ],
}
