import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPassword() {
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
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <form onSubmit={handleSubmit} style={{ background: '#fff', borderRadius: 8, padding: '2rem', maxWidth: 380, width: '100%' }}>
        <h1 style={{ color: '#1D2B3A', marginBottom: '0.5rem' }}>نسيت كلمة المرور؟</h1>
        <p style={{ color: '#6b6252', fontSize: '0.9rem', marginBottom: '1.5rem' }}>أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين.</p>

        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: 4 }}>البريد الإلكتروني</label>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
          style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', border: '1px solid #d8cfb4', borderRadius: 6 }} />

        {error && <p style={{ color: '#A63D40', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</p>}
        {message && <p style={{ color: '#1F4E3D', marginBottom: '1rem', fontSize: '0.9rem' }}>{message}</p>}

        <button type="submit" disabled={loading}
          style={{ width: '100%', padding: '0.8rem', background: '#1F4E3D', color: '#fff', border: 'none', borderRadius: 6, fontWeight: 'bold' }}>
          {loading ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}
        </button>

        <p style={{ marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
          <a href="/login" style={{ color: '#A63D40', fontWeight: 'bold' }}>الرجوع لتسجيل الدخول</a>
        </p>
      </form>
    </div>
  )
}
