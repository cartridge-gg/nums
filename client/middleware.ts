import { geolocation } from '@vercel/functions';

// US states where skill-based real money gaming is illegal
const BLOCKED_STATES = [
  'AZ', // Arizona
  'AR', // Arkansas
  'CT', // Connecticut
  'DE', // Delaware
  'LA', // Louisiana
  'MT', // Montana
  'SC', // South Carolina
  'SD', // South Dakota
  'TN', // Tennessee
];

export default function middleware(request: Request) {
  const url = new URL(request.url);

  // Allow blocked page and static assets to pass through
  if (
    url.pathname === '/blocked.html' ||
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/favicon') ||
    url.pathname.startsWith('/ingest') ||
    url.pathname.startsWith('/api/')
  ) {
    return;
  }

  const { country, countryRegion } = geolocation(request);

  // Block US users in restricted states
  if (country === 'US' && countryRegion && BLOCKED_STATES.includes(countryRegion)) {
    return new Response(null, {
      status: 307,
      headers: {
        Location: '/blocked.html',
      },
    });
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|blocked.html|assets/).*)'],
};
