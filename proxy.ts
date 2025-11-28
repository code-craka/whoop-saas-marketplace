/**
 * Next.js Security Proxy (formerly Middleware)
 *
 * Implements:
 * - CSP headers for iframe security
 * - Rate limiting (100 req/min per IP)
 * - Auth guards for protected routes
 * - Security headers (X-Frame-Options, etc.)
 *
 * @see CLAUDE.md for security patterns
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '@/lib/auth';

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * In-memory rate limiter
 * NOTE: Upgrade to Redis for production multi-instance deployments
 */
const rateLimitMap = new Map<
  string,
  { count: number; resetTime: number }
>();

/**
 * Rate limit configuration
 */
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100; // 100 requests per window

/**
 * Check and update rate limit for an IP
 * @param ip - Client IP address
 * @returns true if rate limit exceeded, false otherwise
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const rateLimit = rateLimitMap.get(ip);

  if (rateLimit && now < rateLimit.resetTime) {
    if (rateLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
      return true; // Rate limit exceeded
    }
    rateLimit.count++;
  } else {
    // Reset or create new rate limit entry
    rateLimitMap.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
  }

  return false; // Within rate limit
}

// Cleanup old rate limit entries every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) {
        rateLimitMap.delete(ip);
      }
    }
  }, 5 * 60 * 1000);
}

// ============================================================================
// PROXY (formerly MIDDLEWARE)
// ============================================================================

/**
 * Next.js Proxy
 * Runs on every request before route handlers
 */
export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const path = request.nextUrl.pathname;

  // ============================================================================
  // 1. SECURITY HEADERS (ALL ROUTES)
  // ============================================================================

  // CSP: Allow iframe embedding only from Whop domains
  response.headers.set(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://*.whop.com https://whop.com"
  );

  // Prevent clickjacking: Allow framing from Whop only
  response.headers.set('X-Frame-Options', 'ALLOW-FROM https://whop.com');

  // Prevent MIME type sniffing
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // Referrer policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions policy: Restrict browser features
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=()'
  );

  // XSS Protection (legacy browsers)
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // ============================================================================
  // 2. RATE LIMITING (ALL ROUTES)
  // ============================================================================

  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown';

  if (checkRateLimit(ip)) {
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests',
        message: 'Please slow down and try again later',
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)),
        },
      }
    );
  }

  // ============================================================================
  // 3. AUTHENTICATION GUARDS (PROTECTED ROUTES)
  // ============================================================================

  // Protected routes that require authentication
  const isProtectedRoute =
    path.startsWith('/dashboard') ||
    path.startsWith('/experiences') ||
    (path.startsWith('/api') &&
      !path.startsWith('/api/auth') &&
      !path.startsWith('/api/webhooks') &&
      !path.startsWith('/api/onboarding'));

  if (isProtectedRoute) {
    // Get session token from cookies
    const sessionToken = request.cookies.get('session_token')?.value;

    if (!sessionToken) {
      // No token - redirect to login or return 401
      if (path.startsWith('/api')) {
        return new NextResponse(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Authentication required',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Redirect to login for page routes
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', path);
      return NextResponse.redirect(loginUrl);
    }

    // Verify session token
    try {
      await verifySessionToken(sessionToken);
    } catch (error) {
      console.error('[Proxy] Session verification failed:', error);

      // Invalid token - clear cookie and redirect/return 401
      const response = path.startsWith('/api')
        ? new NextResponse(
            JSON.stringify({
              error: 'Unauthorized',
              message: 'Invalid or expired session',
            }),
            {
              status: 401,
              headers: { 'Content-Type': 'application/json' },
            }
          )
        : NextResponse.redirect(new URL('/login', request.url));

      // Clear invalid session cookie
      response.cookies.delete('session_token');
      return response;
    }
  }

  // ============================================================================
  // 4. EXPERIENCE ROUTES (WHOP IFRAME SPECIAL HANDLING)
  // ============================================================================

  // Experience routes can also use Whop token authentication
  // This is handled in the page component, not middleware
  // Middleware just ensures basic auth or allows token param

  if (path.startsWith('/experiences/')) {
    // Allow through if has session OR will check token in page
    const hasToken = request.nextUrl.searchParams.has('token');
    const hasSession = request.cookies.has('session_token');

    if (!hasToken && !hasSession) {
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          message: 'Please provide a valid session or Whop token',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  return response;
}

// ============================================================================
// PROXY CONFIGURATION
// ============================================================================

/**
 * Configure which routes the proxy runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
