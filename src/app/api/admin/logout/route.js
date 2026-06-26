import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(req) {
  const url = new URL('/admin/login', req.url)
  const response = NextResponse.redirect(url)
  response.cookies.delete(ADMIN_COOKIE_NAME)
  return response
}
