export type Subject = 'Advanced Math' | 'Basic Math' | 'Analytical Reasoning' | 'English'

export interface Profile {
  id: string
  full_name: string
  whatsapp_number: string
  email: string
  university: string
  is_premium: boolean
  created_at: string
  updated_at: string
}

export interface MockTest {
  id: string
  title: string
  test_number: number
  description: string
  is_active: boolean
  total_questions: number
  duration_minutes: number
  created_at: string
}

export interface Question {
  id: string
  test_id: string
  question_text: string
  option_a: string
  option_b: string
  option_c: string
  option_d: string
  correct_answer: 'A' | 'B' | 'C' | 'D'
  subject: Subject
  question_order: number
  created_at: string
}

export interface TestAttempt {
  id: string
  user_id: string
  test_id: string
  answers: Record<string, string | null>
  status: 'in_progress' | 'submitted' | 'force_submitted'
  mode: 'timer' | 'practice'
  time_remaining_seconds: number | null
  score_advanced_math: number
  score_basic_math: number
  score_analytical: number
  score_english: number
  total_score: number
  correct_count: number
  incorrect_count: number
  unattempted_count: number
  started_at: string
  submitted_at: string | null
  created_at: string
}

export interface LeaderboardEntry {
  full_name: string
  highest_score: number
  attempts_count: number
  rank: number
}

export interface SiteConfig {
  headline: string
  subtext: string
  price: string
  whatsapp_number: string
  tests_count: string
  mcqs_count: string
}

export interface QuizState {
  attemptId: string | null
  answers: Record<string, string | null>
  currentQuestionIndex: number
  timeRemainingSeconds: number
  mode: 'timer' | 'practice'
  isSubmitted: boolean
  lastSaved: number
}

export interface SectionScore {
  subject: Subject
  correct: number
  incorrect: number
  unattempted: number
  score: number
  total: number
}
