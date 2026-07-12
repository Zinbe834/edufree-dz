import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/auth.module.css'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (signInError) {
      setError('خطأ في تسجيل الدخول: ' + signInError.message)
      return
    }
    router.push('/dashboard')
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <button className={styles.backLink} onClick={() => router.push('/')}>← رجوع</button>
        <h1 className={styles.title} style={{ marginBottom: '1.5rem' }}>تسجيل الدخول</h1>

        <form onSubmit={handleSubmit}>
          <label className={styles.label}>البريد الإلكتروني</label>
          <input className={styles.input} type="email" value={email} onChange={e => setEmail(e.target.value)} />

          <label className={styles.label}>كلمة المرور</label>
          <input className={styles.input} type="password" value={password} onChange={e => setPassword(e.target.value)} />

          {error && <p className={styles.error}>{error}</p>}

          <p className={styles.forgotLink}><a href="/forgot-password">نسيت كلمة المرور؟</a></p>

          <button type="submit" disabled={loading} className={styles.submitBtnGreen}>
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>

        <p className={styles.footerText}>
          ليس لديك حساب؟ <a className={styles.footerLinkRed} href="/signup">أنشئ حساباً</a>
        </p>
      </div>
    </div>
  )
}
