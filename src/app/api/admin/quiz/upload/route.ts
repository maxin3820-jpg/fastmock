import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/admin-auth'
import { createServiceClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

const VALID_SUBJECTS = ['Advanced Math', 'Basic Math', 'Analytical Reasoning', 'English']

interface QuestionRow {
  Question: string
  'Option A': string
  'Option B': string
  'Option C': string
  'Option D': string
  'Correct Answer': string
  Subject: string
}

export async function POST(req: NextRequest) {
  const isAdmin = await getAdminFromRequest(req)
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const testId = formData.get('testId') as string | null

  if (!file || !testId) {
    return NextResponse.json({ error: 'File and testId are required' }, { status: 400 })
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  const sheet = workbook.Sheets[sheetName]
  const rows: QuestionRow[] = XLSX.utils.sheet_to_json(sheet)

  if (!rows.length) {
    return NextResponse.json({ error: 'No data found in file' }, { status: 400 })
  }

  // Validate & prepare questions
  const questions: {
    test_id: string; question_text: string; option_a: string; option_b: string;
    option_c: string; option_d: string; correct_answer: string; subject: string; question_order: number
  }[] = []
  const errors: string[] = []

  rows.forEach((row, i) => {
    const rowNum = i + 2
    if (!row.Question?.toString().trim()) { errors.push(`Row ${rowNum}: Missing question`); return }
    if (!row['Option A']?.toString().trim()) { errors.push(`Row ${rowNum}: Missing Option A`); return }
    if (!row['Option B']?.toString().trim()) { errors.push(`Row ${rowNum}: Missing Option B`); return }
    if (!row['Option C']?.toString().trim()) { errors.push(`Row ${rowNum}: Missing Option C`); return }
    if (!row['Option D']?.toString().trim()) { errors.push(`Row ${rowNum}: Missing Option D`); return }

    const correct = row['Correct Answer']?.toString().trim().toUpperCase()
    if (!['A', 'B', 'C', 'D'].includes(correct)) { errors.push(`Row ${rowNum}: Invalid correct answer "${correct}" (must be A/B/C/D)`); return }

    const subject = row.Subject?.toString().trim()
    if (!VALID_SUBJECTS.includes(subject)) { errors.push(`Row ${rowNum}: Invalid subject "${subject}"`); return }

    questions.push({
      test_id: testId,
      question_text: row.Question.toString().trim(),
      option_a: row['Option A'].toString().trim(),
      option_b: row['Option B'].toString().trim(),
      option_c: row['Option C'].toString().trim(),
      option_d: row['Option D'].toString().trim(),
      correct_answer: correct,
      subject,
      question_order: i + 1,
    })
  })

  if (errors.length > 5) {
    return NextResponse.json({ error: `Multiple errors found: ${errors.slice(0, 5).join('; ')}... and ${errors.length - 5} more` }, { status: 400 })
  }
  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join('; ') }, { status: 400 })
  }

  const supabase = await createServiceClient()

  // Delete existing questions for this test and re-insert
  await supabase.from('questions').delete().eq('test_id', testId)
  const { error: insertErr } = await supabase.from('questions').insert(questions)

  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 })

  // Update total_questions count
  await supabase.from('mock_tests').update({ total_questions: questions.length }).eq('id', testId)

  return NextResponse.json({ message: `Successfully uploaded ${questions.length} questions!` })
}
