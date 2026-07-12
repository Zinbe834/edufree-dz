import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/app.module.css'

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

  if (loading) return <div className={styles.page}><p>جارٍ التحميل...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backLink} onClick={() => router.push('/teacher')}>← كل موادّي</button>
        <h1 className={styles.sectionTitle}>{name}</h1>

        <label className={styles.itemTitle} style={{ display: 'block', margin: '1rem 0 0.4rem' }}>الطور المستهدف بهذا المحتوى</label>
        <select className={styles.selectInput} value={stage} onChange={e => setStage(e.target.value)}>
          <option value="ابتدائي">ابتدائي</option>
          <option value="متوسط">متوسط</option>
          <option value="ثانوي">ثانوي</option>
        </select>

        <h3 className={styles.subHeading}>➕ إضافة درس</h3>
        <div className={styles.formCard}>
          <input className={styles.textInput} value={lessonForm.title} onChange={e => setLessonForm({ ...lessonForm, title: e.target.value })} placeholder="عنوان الدرس" />
          <textarea className={styles.textInput} value={lessonForm.content} onChange={e => setLessonForm({ ...lessonForm, content: e.target.value })} placeholder="محتوى الدرس" rows={3} />
          <button className={styles.btnGreen} onClick={addLesson}>نشر الدرس</button>
          <div style={{ marginTop: '1rem' }}>
            {lessons.map(l => <p key={l.id} className={styles.itemDesc} style={{ margin: '0.2rem 0' }}>• {l.title}</p>)}
          </div>
        </div>

        <h3 className={styles.subHeading}>📝 إنشاء اختبار</h3>
        <div className={styles.formCard}>
          <input className={styles.textInput} value={testTitle} onChange={e => setTestTitle(e.target.value)} placeholder="عنوان الاختبار" />

          {questions.map((q, i) => <p key={i} className={styles.itemDesc} style={{ margin: '0.2rem 0' }}>✓ سؤال {i + 1}: {q.text}</p>)}

          <div style={{ borderTop: '1px solid #e5dcc2', paddingTop: 10, marginTop: 10 }}>
            <input className={styles.textInput} value={qDraft.text} onChange={e => setQDraft({ ...qDraft, text: e.target.value })} placeholder="نص السؤال" />
            {qDraft.options.map((o, oi) => (
              <div key={oi} className={styles.optionRow}>
                <input type="radio" checked={qDraft.correct === oi} onChange={() => setQDraft({ ...qDraft, correct: oi })} />
                <input className={styles.textInput} style={{ marginBottom: 0 }} value={o} onChange={e => {
                  const opts = [...qDraft.options]; opts[oi] = e.target.value
                  setQDraft({ ...qDraft, options: opts })
                }} placeholder={`الخيار ${oi + 1}`} />
              </div>
            ))}
            <div className={styles.smallBtnRow}>
              <button className={styles.btnGhost} onClick={() => setQDraft({ ...qDraft, options: [...qDraft.options, ''] })}>+ خيار</button>
              <button className={styles.btnGold} onClick={addQuestionToDraft}>إضافة السؤال</button>
            </div>
          </div>

          <button className={styles.btnSmallRed} style={{ marginTop: 12 }} onClick={publishTest}>نشر الاختبار</button>

          <div style={{ marginTop: '1rem' }}>
            {tests.map(t => <p key={t.id} className={styles.itemDesc} style={{ margin: '0.2rem 0' }}>• {t.title}</p>)}
          </div>
        </div>
      </div>
    </div>
  )
}
