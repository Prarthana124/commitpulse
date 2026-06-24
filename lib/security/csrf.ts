export function validateCSRF(request: Request): Response | null {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'https://commitpulse.vercel.app';

  const isValid =
    (origin && origin.startsWith(allowedOrigin)) || (referer && referer.startsWith(allowedOrigin));

  if (!isValid) {
    return new Response(JSON.stringify({ error: 'CSRF validation failed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return null;
}
