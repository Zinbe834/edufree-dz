import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/auth.module.css'

const STAGES = {
  'ابتدائي': { years: ['السنة 1', 'السنة 2', 'السنة 3', 'السنة 4', 'السنة 5'] },
  'متوسط': { years: ['السنة 1', 'السنة 2', 'السنة 3', 'السنة 4'] },
  'ثانوي': { years: ['السنة 1', 'السنة 2', 'السنة 3'], branches: ['العلوم التجريبية', 'الرياضيات', 'التقني رياضي', 'تسيير واقتصاد', 'الآداب والفلسفة', 'اللغات الأجنبية'] }
}

export default function Signup() {
  const router = useRouter()
  const [role, setRole] = useState('تلميذ')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [stage, setStage] = useState('ابتدائي')
  const [year, setYear] = useState('السنة 1')
  const [branch, setBranch] = useState('العلوم التجريبية')
  const [subjectsText, setSubjectsText] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      setError('تأكد من إدخال الاسم، البريد، وكلمة مرور لا تقل عن 6 أحرف')
      return
    }
    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          role,
          stage: role === 'تلميذ' ? stage : null,
          year: role === 'تلميذ' ? year : null,
          branch: role === 'تلميذ' && stage === 'ثانوي' && year !== 'السنة 1' ? branch : null,
          subjects: role === 'أستاذ' ? subjectsText.split(',').map(s => s.trim()).filter(Boolean) : null
        }
      }
    })
    if (signUpError) {
      setError('خطأ في إنشاء الحساب: ' + signUpError.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setError('تم إنشاء الحساب! إذا طُلب منك تأكيد البريد، افتح رسالة التأكيد ثم سجّل الدخول من صفحة /login')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.backLink} onClick={() => router.push('/')}>← رجوع</button>

        <div className={styles.headerRow}>
          <div className={styles.seal}>
            <div className={styles.sealRing} />
            <div className={styles.sealInner}>{role === 'تلميذ' ? 'تلميذ' : 'أستاذ'}</div>
          </div>
          <h1 className={styles.title}>إنشاء حساب {role}</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.roleRow}>
            {['تلميذ', 'أستاذ'].map(r => (
              <button type="button" key={r} onClick={() => setRole(r)}
                className={role === r ? styles.roleBtnActive : styles.roleBtn}>{r}</button>
            ))}
          </div>

          <label className={styles.label}>الاسم الكامل</label>
          <input className={styles.input} value={fullName} onChange={e => setFullName(e.target.value)} />

          <label className={styles.label}>البريد الإلكتروني</label>
          <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} />

          <label className={styles.label}>كلمة المرور (6 أحرف على الأقل)</label>
          <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} />

          {role === 'تلميذ' && (
            <>
              <label className={styles.label}>الطور</label>
              <select className={styles.input} value={stage} onChange={e => { setStage(e.target.value); setYear(STAGES[e.target.value].years[0]) }}>
                {Object.keys(STAGES).map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              <label className={styles.label}>السنة</label>
              <select className={styles.input} value={year} onChange={e => setYear(e.target.value)}>
                {STAGES[stage].years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {stage === 'ثانوي' && year !== 'السنة 1' && (
                <>
                  <label className={styles.label}>الشعبة</label>
                  <select className={styles.input} value={branch} onChange={e => setBranch(e.target.value)}>
                    {STAGES['ثانوي'].branches.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </>
              )}
            </>
          )}

          {role === 'أستاذ' && (
            <>
              <label className={styles.label}>المواد التي تدرّسها (افصل بينها بفاصلة)</label>
              <input className={styles.input} value={subjectsText} onChange={e => setSubjectsText(e.target.value)} placeholder="مثال: الرياضيات, الفيزياء" />
              <p className={styles.note}>🛡️ يُفعَّل حساب الأستاذ رسمياً بعد التحقق من الإدارة</p>
            </>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className={styles.footerText}>
          لديك حساب؟ <a className={styles.footerLink} href="/login">سجّل الدخول</a>
        </p>
      </div>
    </div>
  )
}
