/**
 * Next.js Middleware
 * Handles route protection and authentication checks
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware function to handle route protection
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
  ];

  // Protected routes that require authentication
  const protectedRoutes = [
    '/student',
    '/recruiter',
    '/admin',
  ];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.includes(pathname);

  // For now, we'll let all routes through since we handle auth in components
  // In a production app, you'd want to check authentication tokens here
  if (isProtectedRoute) {
    // TODO: Add server-side authentication check
    // For now, we rely on client-side auth checks in components
    return NextResponse.next();
  }

  return NextResponse.next();
}

/**
 * Configure which routes the middleware should run on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
