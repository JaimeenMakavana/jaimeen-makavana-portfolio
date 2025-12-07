import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Check if the user is trying to access the admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // 2. Retrieve the session cookie
  const session = request.cookies.get('admin_session');

  // 3. Logic: If trying to access admin AND no session exists -> Redirect to Login
  if (isAdminRoute && !session) {
    const loginUrl = new URL('/login', request.url);
    // Add the original URL as a query param to redirect back after login
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Logic: If user is ALREADY on login page but HAS a session -> Redirect to Admin
  if (request.nextUrl.pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

// Configuration: Run this middleware only on admin and login paths
export const config = {
  matcher: ['/admin/:path*', '/login'],
};

