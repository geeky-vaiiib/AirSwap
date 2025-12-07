/**
 * Next.js Middleware for Global Security and Rate Limiting
 * Implements advanced DDoS protection, request filtering, and security policies
 */

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting store with sliding window
interface RateLimitEntry {
  count: number;
  windowStart: number;
  lastRequest: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly WINDOW_SIZE = 60 * 1000; // 1 minute
  private readonly MAX_REQUESTS = 100; // 100 requests per minute
  private readonly BURST_LIMIT = 200; // Allow burst up to 200 requests
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // Clean up every 5 minutes

  constructor() {
    if (typeof globalThis !== 'undefined') {
      // Start cleanup interval in non-test environments
      setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
    }
  }

  private getClientIdentifier(request: NextRequest): string {
    // Get real IP from Vercel or Cloudflare headers
    const vercelIp = request.headers.get('x-forwarded-for');
    const cloudflareIp = request.headers.get('cf-connecting-ip');
    const realIp = request.headers.get('x-real-ip');

    let ip: string;
    if (typeof vercelIp === 'string') {
      ip = vercelIp.split(',')[0].trim();
    } else if (typeof cloudflareIp === 'string') {
      ip = cloudflareIp;
    } else if (typeof realIp === 'string') {
      ip = realIp;
    } else {
      ip = request.ip || 'unknown';
    }

    return ip;
  }

  private getEndpointType(pathname: string): 'auth' | 'api' | 'static' | 'default' {
    if (pathname.includes('/auth') || pathname.includes('/signin') || pathname.includes('/signup')) {
      return 'auth';
    }
    if (pathname.startsWith('/api/')) {
      return 'api';
    }
    if (pathname.includes('.') && !pathname.includes('/_next/')) {
      return 'static';
    }
    return 'default';
  }

  private cleanup(): void {
    const now = Date.now();
    const windowSize = this.WINDOW_SIZE;

    for (const [key, entry] of this.store.entries()) {
      if (now - entry.windowStart > windowSize * 2) {
        this.store.delete(key);
      }
    }
  }

  check(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const clientId = this.getClientIdentifier(request);
    const endpointType = this.getEndpointType(request.nextUrl.pathname);
    const now = Date.now();

    // Different limits for different endpoint types
    const limits = {
      auth: { window: 60 * 1000, max: 5 }, // 5 auth attempts per minute
      api: { window: 60 * 1000, max: 60 }, // 60 API calls per minute
      static: { window: 60 * 1000, max: 200 }, // 200 static files per minute
      default: { window: 60 * 1000, max: 100 }, // 100 page requests per minute
    };

    const limit = limits[endpointType];
    const key = `${clientId}:${endpointType}`;

    let entry = this.store.get(key);

    if (!entry || now - entry.windowStart >= limit.window) {
      entry = {
        count: 0,
        windowStart: now,
        lastRequest: now,
      };
      this.store.set(key, entry);
    }

    // Sliding window rate limiting
    const timeSinceStart = now - entry.windowStart;
    const requestsInWindow = (entry.count * limit.window) / timeSinceStart;

    // Allow burst requests but cap at burst limit
    const allowed = requestsInWindow < limit.max || entry.count < this.BURST_LIMIT;

    if (allowed) {
      entry.count++;
      entry.lastRequest = now;

      // Slide window if we've exceeded the base limit
      if (entry.count >= limit.max && timeSinceStart >= limit.window) {
        entry.windowStart = now;
        entry.count = 1;
      }
    }

    const remaining = Math.max(0, limit.max - Math.floor(requestsInWindow));
    const resetTime = entry.windowStart + limit.window;

    return { allowed, remaining, resetTime };
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

// Blocked paths that should never be accessible
const BLOCKED_PATHS = [
  /\.env$/,
  /wp-admin/,
  /wp-login/,
  /administrator/,
  /admin\.php/,
  /\.git/,
  /\.env\./,
  /phpmyadmin/,
  /_debug/,
];

// Suspicious patterns that might indicate attacks
const SUSPICIOUS_PATTERNS = [
  /\.\.\//, // Path traversal
  /<script/i, // XSS attempts
  /javascript:/i,
  /data:/i,
  /vbscript:/i,
];

// User agents that are commonly malicious
const BLOCKED_USER_AGENTS = [
  /bot/i, // Generally block bots for API routes
  /crawler/i,
  /spider/i,
  /scanner/i,
  /exploit/i,
  /attack/i,
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for Next.js internal routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // Skip static files
  ) {
    // But apply rate limiting to API routes
    if (pathname.startsWith('/api/')) {
      const rateLimitResult = rateLimiter.check(request);

      if (!rateLimitResult.allowed) {
        return new NextResponse(JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
          retryAfter: Math.ceil(rateLimitResult.resetTime / 1000),
        }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
          },
        });
      }
    }

    return NextResponse.next();
  }

  // Block suspicious paths
  if (BLOCKED_PATHS.some(pattern => pattern.test(pathname))) {
    return new NextResponse(null, { status: 404 });
  }

  // Check for suspicious patterns in the URL
  const urlString = request.url;
  if (SUSPICIOUS_PATTERNS.some(pattern => pattern.test(urlString))) {
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Request blocked due to security policy.',
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Check user agent for malicious patterns (only for API routes in middleware)
  const userAgent = request.headers.get('user-agent');
  if (userAgent && BLOCKED_USER_AGENTS.some(pattern => pattern.test(userAgent))) {
    // Log suspicious activity for monitoring
    console.warn(`Blocked suspicious user agent: ${userAgent} from ${request.ip}`);
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Request blocked due to security policy.',
    }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Apply rate limiting for all routes
  const rateLimitResult = rateLimiter.check(request);

  if (!rateLimitResult.allowed) {
    return new NextResponse(JSON.stringify({
      success: false,
      error: 'Rate limit exceeded. Please try again later.',
      retryAfter: Math.ceil(rateLimitResult.resetTime / 1000),
    }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        'X-RateLimit-Reset': Math.ceil(rateLimitResult.resetTime / 1000).toString(),
      },
    });
  }

  // Add rate limit headers to response
  const response = NextResponse.next();

  response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
  response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime / 1000).toString());

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (middleware handles API rate limiting differently)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
