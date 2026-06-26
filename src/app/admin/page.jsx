import { createServiceClient } from '@/lib/supabase/server'
import AdminDashboardClient from './AdminDashboardClient'

export default async function AdminPage() {
  const supabase = await createServiceClient()
  const [{ count: totalUsers }, { count: premiumUsers }, { data: configData }] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_premium', true),
    supabase.from('site_config').select('key,value'),
  ])
  const config = {}
  configData?.forEach(r => { config[r.key] = r.value })
  return <AdminDashboardClient stats={{ total: totalUsers ?? 0, premium: premiumUsers ?? 0 }} initialConfig={config} />
}
