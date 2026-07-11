import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

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
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 8, padding: '2rem', maxWidth: 380, width: '100%' }}>
        <h1 style={{ color: '#1D2B3A', marginBottom: '1.5rem' }}>تسجيل الدخول</h1>

        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>البريد الإلكتروني</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />

        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>كلمة المرور</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />

        {error && <p style={{ color: '#A63D40', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.8rem', background: '#1F4E3D', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>
          {loading ? 'جارٍ الدخول...' : 'دخول'}
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          ليس لديك حساب؟ <a href="/signup" style={{ color: '#A63D40', fontWeight: 'bold' }}>أنشئ حساباً</a>
        </p>
      </form>
    </div>
  )
}
