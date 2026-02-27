import { createServerClient } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function middleware(request) {
  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  // Protege /admin e sub-rotas
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};