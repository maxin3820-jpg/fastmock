import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/')
  const isAdminLogin = pathname === '/admin/login'

  if (isAdminRoute && !isAdminLogin) {
    const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    const isValid = await verifyAdminToken(token)
    if (!isValid) {
      const response = NextResponse.redirect(new URL('/admin/login', request.url))
      response.cookies.delete(ADMIN_COOKIE_NAME)
      return response
    }
    return NextResponse.next()
  }

  if (isAdminLogin || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if ((pathname.startsWith('/dashboard') || pathname.startsWith('/test')) && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if ((pathname === '/login' || pathname === '/register') && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/dashboard/:path*',
    '/test/:path*',
    '/login',
    '/register',
  ],
}
