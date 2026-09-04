import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const sessionCookie = request.cookies.get('parlons_en_user_session');

  // Protect /profil route
  if (!sessionCookie && request.nextUrl.pathname.startsWith('/profil')) {
    return NextResponse.redirect(new URL('/connexion', request.url));
  }

  // Redirect logged-in users away from /connexion and /inscription to Home page (/)
  if (sessionCookie && (request.nextUrl.pathname === '/connexion' || request.nextUrl.pathname === '/inscription')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/profil', '/connexion', '/inscription'],
};
