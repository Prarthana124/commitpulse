import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from './lib/rate-limit';
import { getClientIp } from './utils/getClientIp';

/**
 * Middleware to enforce rate limiting on specific API routes.
 *
 * Protected Routes:
 * - /api/streak
 * - /api/github
 * - /api/track-user
 * - /api/stats
 * - /api/og
 * - /api/notify
 * - /api/compare
 * - /api/wrapped
 * - /api/student
 *
 * Limit: 60 requests per minute per IP.
 */
export async function middleware(request: NextRequest) {
  // Secure client IP extraction
  const ip = getClientIp(request);

  // Apply rate limiting
  // 60 requests per 60,000ms (1 minute)
  const result = await rateLimit(ip, 60, 60000);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
        },
      }
    );
  }

  // Build the headers once.
  // Some API routes return their own Response/NextResponse objects, so we must ensure
  // the rate-limit headers survive and are present on the final response.
  const headers = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };

  // `NextResponse.next()` attaches headers to the outgoing response pipeline.
  // Ensure they are set on the returned response object.
  const response = NextResponse.next();
  Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));

  return response;
}

/**
 * Configure which routes should trigger this middleware.
 * Using a matcher is more efficient than checking pathnames inside the middleware.
 */
export const config = {
  matcher: [
    '/api/streak/:path*',
    '/api/github/:path*',
    '/api/track-user/:path*',
    '/api/stats/:path*',
    '/api/og/:path*',
    '/api/notify/:path*',
    '/api/compare/:path*',
    '/api/wrapped/:path*',
    '/api/student/:path*',
  ],
};
