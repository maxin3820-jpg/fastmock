import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminCredentials, createAdminToken, ADMIN_COOKIE_NAME } from '@/lib/admin-auth'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { email, password } = body

  const valid = await verifyAdminCredentials(email, password)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const token = await createAdminToken()
  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24h
    path: '/',
  })
  return response
}
