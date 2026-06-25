-- ============================================================
-- FAST MOCK TEST - SUPABASE SCHEMA
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  email TEXT NOT NULL,
  university TEXT NOT NULL,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public profiles readable for leaderboard"
  ON public.profiles FOR SELECT
  USING (true);

-- Service role can do everything (for admin operations)
CREATE POLICY "Service role full access"
  ON public.profiles FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- MOCK TESTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.mock_tests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  test_number INTEGER NOT NULL CHECK (test_number BETWEEN 1 AND 3),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  total_questions INTEGER DEFAULT 0,
  duration_minutes INTEGER DEFAULT 120,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.mock_tests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tests"
  ON public.mock_tests FOR SELECT
  USING (is_active = true);

CREATE POLICY "Service role full access on tests"
  ON public.mock_tests FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default 3 mock tests
INSERT INTO public.mock_tests (title, test_number, description, duration_minutes) VALUES
  ('FAST Mock Test 1', 1, 'Full-length mock test mapped to exact FAST entry test pattern', 120),
  ('FAST Mock Test 2', 2, 'Full-length mock test with advanced mathematics focus', 120),
  ('FAST Mock Test 3', 3, 'Comprehensive practice test covering all FAST exam sections', 120)
ON CONFLICT DO NOTHING;

-- ============================================================
-- QUESTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK (correct_answer IN ('A','B','C','D')),
  subject TEXT NOT NULL CHECK (subject IN ('Advanced Math','Basic Math','Analytical Reasoning','English')),
  question_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Premium users can view questions"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_premium = true
    )
  );

CREATE POLICY "Service role full access on questions"
  ON public.questions FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TEST ATTEMPTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  test_id UUID REFERENCES public.mock_tests(id) ON DELETE CASCADE NOT NULL,
  answers JSONB DEFAULT '{}',
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','force_submitted')),
  mode TEXT DEFAULT 'timer' CHECK (mode IN ('timer','practice')),
  time_remaining_seconds INTEGER,
  score_advanced_math NUMERIC(10,4) DEFAULT 0,
  score_basic_math NUMERIC(10,4) DEFAULT 0,
  score_analytical NUMERIC(10,4) DEFAULT 0,
  score_english NUMERIC(10,4) DEFAULT 0,
  total_score NUMERIC(10,4) DEFAULT 0,
  correct_count INTEGER DEFAULT 0,
  incorrect_count INTEGER DEFAULT 0,
  unattempted_count INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON public.test_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attempts"
  ON public.test_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
  ON public.test_attempts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on attempts"
  ON public.test_attempts FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- LEADERBOARD VIEW (best score per user per test)
-- ============================================================
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.full_name,
  MAX(ta.total_score) AS highest_score,
  COUNT(ta.id) AS attempts_count,
  ROW_NUMBER() OVER (ORDER BY MAX(ta.total_score) DESC) AS rank
FROM public.profiles p
INNER JOIN public.test_attempts ta ON ta.user_id = p.id
WHERE ta.status IN ('submitted', 'force_submitted')
  AND p.is_premium = true
GROUP BY p.id, p.full_name
ORDER BY highest_score DESC;

-- ============================================================
-- SITE CONFIG TABLE (Admin editable content)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.site_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site config"
  ON public.site_config FOR SELECT
  USING (true);

CREATE POLICY "Service role full access on config"
  ON public.site_config FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insert default site configuration
INSERT INTO public.site_config (key, value) VALUES
  ('headline', 'Crack FAST Entry Test. Guaranteed.'),
  ('subtext', 'Pakistan''s most accurate FAST University mock tests — 300+ premium MCQs, exact negative marking, unlimited retakes.'),
  ('price', 'PKR 300'),
  ('whatsapp_number', '923036326202'),
  ('tests_count', '3'),
  ('mcqs_count', '300+')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- FUNCTION: Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, whatsapp_number, email, university)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'whatsapp_number', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'university', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- FUNCTION: Update updated_at timestamp
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER site_config_updated_at
  BEFORE UPDATE ON public.site_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_whatsapp ON public.profiles(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_profiles_is_premium ON public.profiles(is_premium);
CREATE INDEX IF NOT EXISTS idx_questions_test_id ON public.questions(test_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject ON public.questions(subject);
CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON public.test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_test_id ON public.test_attempts(test_id);
CREATE INDEX IF NOT EXISTS idx_attempts_status ON public.test_attempts(status);
