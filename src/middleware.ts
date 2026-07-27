import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE_DOMAIN = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'company.local';
const PORT = process.env.NODE_ENV === 'development' ? ':3000' : '';

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const hostname = host.replace(PORT, '');

  const subdomain = hostname.replace(`.${BASE_DOMAIN}`, '');
  const isMainDomain = hostname === BASE_DOMAIN || hostname === `www.${BASE_DOMAIN}`;

  const url = request.nextUrl.clone();

  if (isMainDomain) {
    return NextResponse.next();
  }

  if (subdomain && subdomain !== 'www' && subdomain !== hostname) {
    url.pathname = `/${subdomain}${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
