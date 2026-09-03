import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const FALLBACK_SUPABASE_URL = 'https://zgszhayubawamlteqory.supabase.co';
const FALLBACK_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpnc3poYXl1YmF3YW1sdGVxb3J5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgyNzA1OTAsImV4cCI6MjEwMzg0NjU5MH0.iaPJx859xRk88zGH7Kw5PSdga0ZRWRKDhjkYlIanRro';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_KEY;

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect /profil route
  if (!user && request.nextUrl.pathname.startsWith('/profil')) {
    return NextResponse.redirect(new URL('/connexion', request.url));
  }

  // Redirect logged-in users away from /connexion and /inscription to Home page (/)
  if (user && (request.nextUrl.pathname === '/connexion' || request.nextUrl.pathname === '/inscription')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/profil', '/connexion', '/inscription'],
};
