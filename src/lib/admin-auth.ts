import { NextRequest } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'maxin3820@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345'
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback_dev_secret_change_in_production_32chars'
)
const COOKIE_NAME = 'admin_token'

export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export async function createAdminToken(): Promise<string> {
  return await new SignJWT({ role: 'admin', email: ADMIN_EMAIL })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function getAdminFromRequest(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}

export { COOKIE_NAME as ADMIN_COOKIE_NAME }
