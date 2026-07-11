import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function TeacherSubject() {
  const router = useRouter()
  const { name } = router.query
  const [profile, setProfile] = useState(null)
  const [stage, setStage] = useState('ثانوي')
  const [lessons, setLessons] = useState([])
  const [tests, setTests] = useState([])
  const [lessonForm, setLessonForm] = useState({ title: '', content: '' })
  const [testTitle, setTestTitle] = useState('')
  const [questions, setQuestions] = useState([])
  const [qDraft, setQDraft] = useState({ text: '', options: ['', ''], correct: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error || !data || data.role !== 'أستاذ') { router.push('/dashboard'); return }
      setProfile(data)
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    if (!name || !profile) return
    loadContent()
  }, [name, stage, profile])

  async function loadContent() {
    const { data: l } = await supabase.from('lessons').select('*').eq('stage', stage).eq('subject', name).order('created_at')
    setLessons(l || [])
    const { data: t } = await supabase.from('tests').select('*').eq('stage', stage).eq('subject', name).order('created_at')
    setTests(t || [])
  }

  async function addLesson() {
    if (!lessonForm.title.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('lessons').insert({
      teacher_id: user.id, stage, subject: name, title: lessonForm.title, content: lessonForm.content
    })
    if (error) { alert('خطأ: ' + error.message); return }
    setLessonForm({ title: '', content: '' })
    loadContent()
  }

  function addQuestionToDraft() {
    if (!qDraft.text.trim() || qDraft.options.some(o => !o.trim())) return
    setQuestions([...questions, qDraft])
    setQDraft({ text: '', options: ['', ''], correct: 0 })
  }

  async function publishTest() {
    if (!testTitle.trim() || questions.length === 0) return
    const { data: { user } } = await supabase.auth.getUser()
    const { data: test, error } = await supabase.from('tests').insert({
      teacher_id: user.id, stage, subject: name, title: testTitle
    }).select().single()
    if (error) { alert('خطأ: ' + error.message); return }

    const rows = questions.map((q, i) => ({
      test_id: test.id, question_text: q.text, options: q.options, correct_index: q.correct, order_index: i
    }))
    const { error: qError } = await supabase.from('test_questions').insert(rows)
    if (qError) { alert('خطأ في حفظ الأسئلة: ' + qError.message); return }

    setTestTitle('')
    setQuestions([])
    loadContent()
  }

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'Tahoma, sans-serif' }}>جارٍ التحميل...</p>

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button onClick={() => router.push('/teacher')} style={{ background: 'none', border: 'none', color: '#6b6252', marginBottom: '1rem', cursor: 'pointer' }}>
          ← كل موادّي
        </button>
        <h1 style={{ color: '#1D2B3A', marginBottom: '0.5rem' }}>{name}</h1>

        <label style={{ fontWeight: 'bold', display: 'block', marginBottom: 4 }}>الطور المستهدف بهذا المحتوى</label>
        <select value={stage} onChange={e => setStage(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid #d8cfb4', marginBottom: '1.5rem' }}>
          <option value="ابتدائي">ابتدائي</option>
          <option value="متوسط">متوسط</option>
          <option value="ثانوي">ثانوي</option>
        </select>

        <h3 style={{ color: '#C98A2B' }}>➕ إضافة درس</h3>
        <div style={{ background: '#fff', border: '1px solid #e5dcc2', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
          <input value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })}
            placeholder="عنوان الدرس" style={{ width: '100%', padding: '0.6rem', border: '1px solid #d8cfb4', borderRadius: 6, marginBottom: 8 }} />
          <textarea value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })}
            placeholder="محتوى الدرس" rows={3} style={{ width: '100%', padding: '0.6rem', border: '1px solid #d8cfb4', borderRadius: 6, marginBottom: 8 }} />
          <button onClick={addLesson} style={{ background: '#1F4E3D', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>
            نشر الدرس
          </button>
          <div style={{ marginTop: '1rem' }}>
            {lessons.map(l => <p key={l.id} style={{ fontSize: '0.9rem', color: '#1D2B3A' }}>• {l.title}</p>)}
          </div>
        </div>

        <h3 style={{ color: '#C98A2B' }}>📝 إنشاء اختبار</h3>
        <div style={{ background: '#fff', border: '1px solid #e5dcc2', borderRadius: 8, padding: '1rem', marginBottom: '1.5rem' }}>
          <input value={testTitle} onChange={e => setTestTitle(e.target.value)} placeholder="عنوان الاختبار"
            style={{ width: '100%', padding: '0.6rem', border: '1px solid #d8cfb4', borderRadius: 6, marginBottom: 8 }} />

          {questions.map((q, i) => <p key={i} style={{ fontSize: '0.85rem', color: '#6b6252' }}>✓ سؤال {i + 1}: {q.text}</p>)}

          <div style={{ borderTop: '1px solid #e5dcc2', paddingTop: 10, marginTop: 10 }}>
            <input value={qDraft.text} onChange={e => setQDraft({ ...qDraft, text: e.target.value })}
              placeholder="نص السؤال" style={{ width: '100%', padding: '0.6rem', border: '1px solid #d8cfb4', borderRadius: 6, marginBottom: 8 }} />
            {qDraft.options.map((o, oi) => (
              <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <input type="radio" checked={qDraft.correct === oi} onChange={() => setQDraft({ ...qDraft, correct: oi })} />
                <input value={o} onChange={e => {
                  const opts = [...qDraft.options]; opts[oi] = e.target.value
                  setQDraft({ ...qDraft, options: opts })
                }} placeholder={`الخيار ${oi + 1}`} style={{ flex: 1, padding: '0.5rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <button onClick={() => setQDraft({ ...qDraft, options: [...qDraft.options, ''] })}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: '1px solid #d8cfb4', borderRadius: 6, background: '#fff', cursor: 'pointer' }}>
                + خيار
              </button>
              <button onClick={addQuestionToDraft}
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', border: 'none', borderRadius: 6, background: '#C98A2B', color: '#fff', cursor: 'pointer' }}>
                إضافة السؤال
              </button>
            </div>
          </div>

          <button onClick={publishTest} style={{ marginTop: 12, background: '#A63D40', color: '#fff', border: 'none', borderRadius: 6, padding: '0.6rem 1.2rem', cursor: 'pointer', fontWeight: 'bold' }}>
            نشر الاختبار
          </button>

          <div style={{ marginTop: '1rem' }}>
            {tests.map(t => <p key={t.id} style={{ fontSize: '0.9rem', color: '#1D2B3A' }}>• {t.title}</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}
