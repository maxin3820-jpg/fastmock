import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email, revoke } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('profiles')
    .update({ is_premium: !revoke })
    .eq('email', email.trim().toLowerCase())
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: 'User not found or update failed' }, { status: 404 })
  return NextResponse.json({ message: revoke ? `Access revoked for ${email}` : `Premium access granted to ${email}` })
}
