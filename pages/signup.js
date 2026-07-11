import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

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

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password })
    if (signUpError) {
      setError('خطأ في إنشاء الحساب: ' + signUpError.message)
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError('تم إرسال رابط تأكيد إلى بريدك الإلكتروني. افتحه ثم سجّل الدخول.')
      setLoading(false)
      return
    }

    const profile = {
      id: userId,
      full_name: fullName.trim(),
      role,
      stage: role === 'تلميذ' ? stage : null,
      year: role === 'تلميذ' ? year : null,
      branch: role === 'تلميذ' && stage === 'ثانوي' && year !== 'السنة 1' ? branch : null,
      subjects: role === 'أستاذ' ? subjectsText.split(',').map(s => s.trim()).filter(Boolean) : null
    }

    const { error: profileError } = await supabase.from('profiles').insert(profile)
    if (profileError) {
      setError('تم إنشاء الحساب لكن حدث خطأ في حفظ الملف الشخصي: ' + profileError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem', display: 'flex', justifyContent: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 8, padding: '2rem', maxWidth: 420, width: '100%', height: 'fit-content' }}>
        <h1 style={{ color: '#1D2B3A', marginBottom: '1.5rem' }}>إنشاء حساب</h1>

        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
          {['تلميذ', 'أستاذ'].map(r => (
            <button type="button" key={r} onClick={() => setRole(r)}
              style={{
                flex: 1, padding: '0.6rem', borderRadius: 6, border: '1px solid #1F4E3D',
                background: role === r ? '#1F4E3D' : '#fff', color: role === r ? '#fff' : '#1F4E3D', fontWeight: 'bold'
              }}>{r}</button>
          ))}
        </div>

        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>الاسم الكامل</label>
        <input value={fullName} onChange={e => setFullName(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />

        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>البريد الإلكتروني</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />

        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>كلمة المرور (6 أحرف على الأقل)</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />

        {role === 'تلميذ' && (
          <>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>الطور</label>
            <select value={stage} onChange={e => { setStage(e.target.value); setYear(STAGES[e.target.value].years[0]) }}
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }}>
              {Object.keys(STAGES).map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>السنة</label>
            <select value={year} onChange={e => setYear(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }}>
              {STAGES[stage].years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            {stage === 'ثانوي' && year !== 'السنة 1' && (
              <>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>الشعبة</label>
                <select value={branch} onChange={e => setBranch(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }}>
                  {STAGES['ثانوي'].branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </>
            )}
          </>
        )}

        {role === 'أستاذ' && (
          <>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>المواد التي تدرّسها (افصل بينها بفاصلة)</label>
            <input value={subjectsText} onChange={e => setSubjectsText(e.target.value)} placeholder="مثال: الرياضيات, الفيزياء"
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />
          </>
        )}

        {error && <p style={{ color: '#A63D40', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.8rem', background: '#A63D40', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>
          {loading ? 'جارٍ الإنشاء...' : 'إنشاء الحساب'}
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          لديك حساب؟ <a href="/login" style={{ color: '#1F4E3D', fontWeight: 'bold' }}>سجّل الدخول</a>
        </p>
      </form>
    </div>
  )
}
