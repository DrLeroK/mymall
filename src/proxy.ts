import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/merchant') ||
    pathname.startsWith('/customer') ||
    pathname.startsWith('/pos');

  if (isProtectedPath) {
    const token =
      request.cookies.get('mymall_access_token')?.value ||
      request.headers.get('authorization')?.replace('Bearer ', '');

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/merchant/:path*',
    '/customer/:path*',
    '/pos/:path*',
  ],
};
