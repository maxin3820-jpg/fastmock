import { SignJWT, jwtVerify } from 'jose'

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'maxin3820@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin12345'
const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET || 'fallback_dev_secret_change_in_production_32chars'
)

export const ADMIN_COOKIE_NAME = 'admin_token'

export async function verifyAdminCredentials(email, password) {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD
}

export async function createAdminToken() {
  return await new SignJWT({ role: 'admin', email: ADMIN_EMAIL })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyAdminToken(token) {
  try {
    await jwtVerify(token, JWT_SECRET)
    return true
  } catch {
    return false
  }
}

export async function getAdminFromRequest(req) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}
