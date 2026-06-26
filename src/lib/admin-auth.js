import { SignJWT, jwtVerify } from 'jose'

// Hardcoded admin credentials — also read from env if set
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'maxin3820@gmail.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin12345'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'fastpreppro_admin_secret_key_2025_secure'
)

export const ADMIN_COOKIE_NAME = 'fpp_admin_token'

export async function verifyAdminCredentials(email, password) {
  // Trim whitespace to avoid copy-paste issues
  return email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() && password.trim() === ADMIN_PASSWORD.trim()
}

export async function createAdminToken() {
  return await new SignJWT({ role: 'admin', sub: ADMIN_EMAIL })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyAdminToken(token) {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.role === 'admin'
  } catch {
    return false
  }
}

export async function getAdminFromRequest(req) {
  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (!token) return false
  return verifyAdminToken(token)
}
