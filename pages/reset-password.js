import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/auth.module.css'

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
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title} style={{ marginBottom: '1.5rem' }}>كلمة مرور جديدة</h1>

        {!ready && !message && (
          <p className={styles.subtitle} style={{ margin: 0 }}>جارٍ التحقق من الرابط... إذا لم يعمل، اطلب رابطاً جديداً من صفحة نسيت كلمة المرور.</p>
        )}

        {ready && !message && (
          <form onSubmit={handleSubmit}>
            <label className={styles.label}>كلمة المرور الجديدة</label>
            <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} />

            <label className={styles.label}>تأكيد كلمة المرور</label>
            <input className={styles.input} type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" disabled={loading} className={styles.submitBtn}>
              {loading ? 'جارٍ الحفظ...' : 'تغيير كلمة المرور'}
            </button>
          </form>
        )}

        {message && <p className={styles.success}>{message}</p>}
      </div>
    </div>
  )
}
