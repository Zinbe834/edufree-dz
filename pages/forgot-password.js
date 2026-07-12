import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/auth.module.css'

export default function ForgotPassword() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
    })
    setLoading(false)
    if (resetError) {
      setError('خطأ: ' + resetError.message)
      return
    }
    setMessage('إذا كان هذا البريد مسجلاً لدينا، ستصلك رسالة تحتوي رابط إعادة التعيين خلال دقائق.')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.backLink} onClick={() => router.push('/login')}>← رجوع لتسجيل الدخول</button>
        <h1 className={styles.title}>نسيت كلمة المرور؟</h1>
        <p className={styles.subtitle}>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>البريد الإلكتروني</label>
          <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} required />

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <button type="submit" disabled={loading} className={styles.submitBtnGreen}>
            {loading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
          </button>
        </form>

        <p className={styles.footerText}>
          <a className={styles.footerLinkRed} href="/login">الرجوع لتسجيل الدخول</a>
        </p>
      </div>
    </div>
  )
}
