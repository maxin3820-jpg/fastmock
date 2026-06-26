import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TestStartClient from './TestStartClient'

export default async function TestStartPage({ params }) {
  const { testId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_premium').eq('id', user.id).single()
  if (!profile?.is_premium) redirect('/dashboard')

  const { data: test } = await supabase.from('mock_tests').select('*').eq('id', testId).single()
  if (!test) redirect('/dashboard')

  return <TestStartClient test={test} userId={user.id} />
}
