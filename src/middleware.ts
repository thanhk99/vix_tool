import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const BASE_DOMAIN = (process.env.NEXT_PUBLIC_BASE_DOMAIN || 'vix.local').toLowerCase();

// Danh sách các phòng ban có route riêng
const VALID_SUBDOMAINS = ['bgd', 'nv'];

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  // Tách bỏ port (:3000, :80, :443, etc.) khỏi hostname một cách an toàn
  const hostname = host.split(':')[0].toLowerCase();

  // Kiểm tra xem có phải là main portal hay không (vix.local, www.vix.local, dhcd.vix.local, localhost, IP)
  const isMainDomain =
    hostname === BASE_DOMAIN ||
    hostname === `www.${BASE_DOMAIN}` ||
    hostname === `dhcd.${BASE_DOMAIN}` ||
    hostname === 'dhcd.vix.local' ||
    hostname === 'localhost' ||
    hostname.startsWith('127.0.0.1') ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.');

  const url = request.nextUrl.clone();

  if (isMainDomain) {
    return NextResponse.next();
  }

  // Trích xuất subdomain nếu truy cập dạng [subdomain].vix.local
  if (hostname.endsWith(`.${BASE_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${BASE_DOMAIN}`, '');
    if (VALID_SUBDOMAINS.includes(subdomain)) {
      url.pathname = `/${subdomain}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
