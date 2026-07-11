import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function SubjectPage() {
  const router = useRouter()
  const { name } = router.query
  const [profile, setProfile] = useState(null)
  const [lessons, setLessons] = useState([])
  const [tests, setTests] = useState([])
  const [messages, setMessages] = useState([])
  const [msgInput, setMsgInput] = useState('')
  const [quiz, setQuiz] = useState(null)
  const [answers, setAnswers] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!name) return
    load()
  }, [name])

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }
    const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (!prof) { router.push('/dashboard'); return }
    setProfile(prof)

    const { data: l } = await supabase.from('lessons').select('*').eq('stage', prof.stage).eq('subject', name).order('created_at')
    setLessons(l || [])

    const { data: t } = await supabase.from('tests').select('*').eq('stage', prof.stage).eq('subject', name).order('created_at')
    setTests(t || [])

    const { data: m } = await supabase.from('forum_messages').select('*, profiles(full_name, role)').eq('stage', prof.stage).eq('subject', name).order('created_at')
    setMessages(m || [])

    setLoading(false)
  }

  async function sendMessage() {
    if (!msgInput.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase.from('forum_messages').insert({
      sender_id: user.id, stage: profile.stage, subject: name, message: msgInput.trim()
    })
    if (!error) {
      setMsgInput('')
      load()
    }
  }

  async function startQuiz(test) {
    const { data: qs } = await supabase.from('test_questions').select('*').eq('test_id', test.id).order('order_index')
    setQuiz({ ...test, questions: qs || [] })
    setAnswers({})
  }

  async function submitQuiz() {
    let score = 0
    quiz.questions.forEach((q, i) => { if (answers[i] === q.correct_index) score++ })
    const pct = Math.round((score / quiz.questions.length) * 100)
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('results').insert({ student_id: user.id, test_id: quiz.id, score: pct })
    alert(`نتيجتك: ${pct}% (${score}/${quiz.questions.length})`)
    setQuiz(null)
  }

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'Tahoma, sans-serif' }}>جارٍ التحميل...</p>

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button onClick={() => router.push('/subjects')} style={{ background: 'none', border: 'none', color: '#6b6252', marginBottom: '1rem', cursor: 'pointer' }}>
          ← كل الموادّ
        </button>
        <h1 style={{ color: '#1D2B3A', marginBottom: '1.5rem' }}>{name}</h1>

        <h3 style={{ color: '#C98A2B' }}>📄 الدروس</h3>
        {lessons.length === 0 && <p style={{ color: '#8a8168', background: '#EFE6CE', padding: '0.7rem', borderRadius: 6, fontSize: '0.9rem' }}>لم يضف الأستاذ دروساً بعد.</p>}
        <div style={{ marginBottom: '1.5rem' }}>
          {lessons.map(l => (
            <div key={l.id} style={{ background: '#fff', border: '1px solid #e5dcc2', borderRadius: 8, padding: '1rem', marginBottom: '0.5rem' }}>
              <p style={{ fontWeight: 'bold', color: '#1D2B3A', margin: 0 }}>{l.title}</p>
              <p style={{ color: '#6b6252', fontSize: '0.9rem', marginTop: 4 }}>{l.content}</p>
            </div>
          ))}
        </div>

        <h3 style={{ color: '#C98A2B' }}>📝 الاختبارات</h3>
        {tests.length === 0 && <p style={{ color: '#8a8168', background: '#EFE6CE', padding: '0.7rem', borderRadius: 6, fontSize: '0.9rem' }}>لا توجد اختبارات منشورة.</p>}
        <div style={{ marginBottom: '1.5rem' }}>
          {tests.map(t => (
            <div key={t.id} style={{ background: '#fff', border: '1px solid #e5dcc2', borderRadius: 8, padding: '1rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: '#1D2B3A' }}>{t.title}</span>
              <button onClick={() => startQuiz(t)} style={{ background: '#A63D40', color: '#fff', border: 'none', borderRadius: 6, padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                ابدأ
              </button>
            </div>
          ))}
        </div>

        <h3 style={{ color: '#C98A2B' }}>💬 نقاش المادة</h3>
        <div style={{ background: '#fff', border: '1px solid #e5dcc2', borderRadius: 8, padding: '1rem', marginBottom: '0.5rem', maxHeight: 220, overflowY: 'auto' }}>
          {messages.length === 0 && <p style={{ color: '#a39c86', fontSize: '0.9rem' }}>لا توجد رسائل بعد.</p>}
          {messages.map(m => (
            <p key={m.id} style={{ fontSize: '0.9rem', marginBottom: 6 }}>
              <b style={{ color: m.profiles?.role === 'أستاذ' ? '#A63D40' : '#1F4E3D' }}>{m.profiles?.full_name} ({m.profiles?.role}):</b>{' '}
              <span style={{ color: '#4A4235' }}>{m.message}</span>
            </p>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input value={msgInput} onChange={e => setMsgInput(e.target.value)} placeholder="اكتب سؤالاً..."
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            style={{ flex: 1, padding: '0.6rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />
          <button onClick={sendMessage} style={{ background: '#1F4E3D', color: '#fff', border: 'none', borderRadius: 6, padding: '0 1rem', cursor: 'pointer' }}>
            إرسال
          </button>
        </div>
      </div>

      {quiz && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: 8, padding: '1.5rem', maxWidth: 480, width: '100%', maxHeight: '85vh', overflowY: 'auto' }}>
            <h3 style={{ color: '#1D2B3A' }}>{quiz.title}</h3>
            {quiz.questions.map((q, i) => (
              <div key={q.id} style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1D2B3A' }}>{i + 1}. {q.question_text}</p>
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers({ ...answers, [i]: oi })}
                    style={{
                      display: 'block', width: '100%', textAlign: 'right', padding: '0.5rem 0.8rem', marginBottom: 4,
                      borderRadius: 6, border: '1px solid #d8cfb4', cursor: 'pointer',
                      background: answers[i] === oi ? '#1F4E3D' : '#fff', color: answers[i] === oi ? '#fff' : '#4A4235'
                    }}>
                    {opt}
                  </button>
                ))}
              </div>
            ))}
            <button onClick={submitQuiz} style={{ width: '100%', padding: '0.8rem', background: '#A63D40', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold', cursor: 'pointer' }}>
              إرسال الإجابات
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
