import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function ResetPassword() {
  const router = useRouter()
  const [ready, setReady] = useState(false)
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل'); return }
    if (password !== confirm) { setError('كلمتا المرور غير متطابقتين'); return }
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) { setError('خطأ: ' + updateError.message); return }
    setMessage('تم تغيير كلمة المرور بنجاح! سيتم تحويلك لتسجيل الدخول...')
    setTimeout(() => router.push('/login'), 2000)
  }

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: '2rem', maxWidth: 380, width: '100%' }}>
        <h1 style={{ color: '#1D2B3A', marginBottom: '1.5rem' }}>كلمة مرور جديدة</h1>

        {!ready && !message && (
          <p style={{ color: '#6b6252', fontSize: '0.9rem' }}>جارٍ التحقق من الرابط... إذا لم يعمل، اطلب رابطاً جديداً من صفحة نسيت كلمة المرور.</p>
        )}

        {ready && !message && (
          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>كلمة المرور الجديدة</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />

            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>تأكيد كلمة المرور</label>
            <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
              style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />

            {error && <p style={{ color: '#A63D40', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '0.8rem', background: '#A63D40', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>
              {loading ? 'جارٍ الحفظ...' : 'تغيير كلمة المرور'}
            </button>
          </form>
        )}

        {message && <p style={{ color: '#1F4E3D' }}>{message}</p>}
      </div>
    </div>
  )
}
