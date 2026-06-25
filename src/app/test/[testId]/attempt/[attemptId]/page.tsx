import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import QuizEngine from './QuizEngine'

export default async function AttemptPage({ params }: { params: Promise<{ testId: string; attemptId: string }> }) {
  const { testId, attemptId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: attempt } = await supabase.from('test_attempts').select('*').eq('id', attemptId).eq('user_id', user.id).single()
  if (!attempt) redirect('/dashboard')
  if (attempt.status !== 'in_progress') redirect(`/test/${testId}/results?attempt=${attemptId}`)

  const { data: questions } = await supabase
    .from('questions')
    .select('*')
    .eq('test_id', testId)
    .order('question_order', { ascending: true })

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-cyber">
        <div className="card text-center p-8">
          <p className="text-white text-lg font-bold mb-2">No Questions Yet</p>
          <p className="text-gray-400 text-sm">The admin hasn't uploaded questions for this test yet. Check back soon!</p>
        </div>
      </div>
    )
  }

  return <QuizEngine attempt={attempt} questions={questions} testId={testId} />
}
