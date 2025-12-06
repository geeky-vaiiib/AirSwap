/**
 * Next.js Middleware for Route Protection
 * Handles authentication and role-based access control
 *
 * Uses JWT-based authentication stored in cookies
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes and their required roles
const protectedRoutes = {
  '/dashboard/contributor': 'contributor',
  '/dashboard/company': 'company',
  '/dashboard/verifier': 'verifier',
} as const;

// Protected API routes that require specific roles
const protectedApiRoutes = {
  '/api/claims': ['contributor', 'company', 'verifier'],
  '/api/credits/issue': ['verifier'],
  '/api/marketplace': ['contributor', 'company', 'verifier'],
  '/api/evidence': ['contributor', 'verifier'],
} as const;

// Public routes that don't require authentication
const publicRoutes = ['/', '/login', '/signup', '/map'];

// API routes that are public (no auth required)
const publicApiRoutes = ['/api/auth/login', '/api/auth/signup', '/api/auth/logout'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

  // In demo mode, allow all routes but add demo headers
  if (isDemoMode) {
    const response = NextResponse.next();
    // Check for demo role/user headers
    const demoRole = request.headers.get('x-demo-role');
    const demoUser = request.headers.get('x-demo-user');
    if (demoRole) {
      response.headers.set('x-demo-role', demoRole);
    }
    if (demoUser) {
      response.headers.set('x-demo-user', demoUser);
    }
    return response;
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow public API routes
  if (publicApiRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get session from cookies (JWT stored in session)
  const sessionCookie = request.cookies.get('airswap-session');

  // Parse session data
  let session: { userId: string; email: string; role: string; full_name: string; access_token: string } | null = null;
  try {
    session = sessionCookie ? JSON.parse(sessionCookie.value) : null;
  } catch (error) {
    console.error('Error parsing session cookie:', error);
    session = null;
  }

  // Handle protected dashboard routes
  for (const [route, requiredRole] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      if (!session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
      }

      // If user has wrong role, redirect to their correct dashboard
      if (session.role !== requiredRole) {
        const correctDashboard = new URL(`/dashboard/${session.role}`, request.url);
        return NextResponse.redirect(correctDashboard);
      }
    }
  }

  // Handle any other dashboard route (catch-all)
  if (pathname.startsWith('/dashboard')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For API routes, we don't redirect but the API handlers will check auth
  // This allows for proper error responses instead of redirects

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

