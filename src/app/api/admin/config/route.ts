import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const config: Record<string, string> = body.config

  if (!config || typeof config !== 'object') {
    return NextResponse.json({ error: 'Invalid config' }, { status: 400 })
  }

  const supabase = await createServiceClient()
  const upserts = Object.entries(config).map(([key, value]) => ({ key, value: String(value) }))
  const { error } = await supabase.from('site_config').upsert(upserts, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ message: 'Config updated successfully' })
}
