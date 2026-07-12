import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/app.module.css'

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
    if (!error) { setMsgInput(''); load() }
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

  if (loading) return <div className={styles.page}><p>جارٍ التحميل...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backLink} onClick={() => router.push('/subjects')}>← كل الموادّ</button>
        <h1 className={styles.sectionTitle}>{name}</h1>

        <h3 className={styles.subHeading}>📄 الدروس</h3>
        {lessons.length === 0 && <p className={styles.emptyNote}>لم يضف الأستاذ دروساً بعد.</p>}
        {lessons.map(l => (
          <div key={l.id} className={styles.itemCard}>
            <p className={styles.itemTitle}>{l.title}</p>
            <p className={styles.itemDesc}>{l.content}</p>
          </div>
        ))}

        <h3 className={styles.subHeading}>📝 الاختبارات</h3>
        {tests.length === 0 && <p className={styles.emptyNote}>لا توجد اختبارات منشورة.</p>}
        {tests.map(t => (
          <div key={t.id} className={styles.itemCardRow}>
            <span className={styles.itemTitle}>{t.title}</span>
            <button className={styles.btnSmallRed} onClick={() => startQuiz(t)}>ابدأ</button>
          </div>
        ))}

        <h3 className={styles.subHeading}>💬 نقاش المادة</h3>
        <div className={styles.chatBox}>
          {messages.length === 0 && <p className={styles.emptyNote} style={{ margin: 0 }}>لا توجد رسائل بعد.</p>}
          {messages.map(m => (
            <p key={m.id} className={styles.chatLine}>
              <span className={m.profiles?.role === 'أستاذ' ? styles.chatAuthorTeacher : styles.chatAuthorStudent}>
                {m.profiles?.full_name} ({m.profiles?.role}):
              </span>{' '}
              <span className={styles.chatText}>{m.message}</span>
            </p>
          ))}
        </div>
        <div className={styles.chatInputRow}>
          <input className={styles.input} value={msgInput} onChange={e => setMsgInput(e.target.value)}
            placeholder="اكتب سؤالاً..." onKeyDown={e => e.key === 'Enter' && sendMessage()} />
          <button className={styles.sendBtn} onClick={sendMessage}>إرسال</button>
        </div>
      </div>

      {quiz && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.sectionTitle} style={{ fontSize: '1.2rem' }}>{quiz.title}</h3>
            {quiz.questions.map((q, i) => (
              <div key={q.id} style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#1D2B3A' }}>{i + 1}. {q.question_text}</p>
                {q.options.map((opt, oi) => (
                  <button key={oi} onClick={() => setAnswers({ ...answers, [i]: oi })}
                    className={answers[i] === oi ? styles.optionBtnActive : styles.optionBtn}>
                    {opt}
                  </button>
                ))}
              </div>
            ))}
            <button className={styles.btnSmallRed} style={{ width: '100%', padding: '0.8rem' }} onClick={submitQuiz}>
              إرسال الإجابات
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
