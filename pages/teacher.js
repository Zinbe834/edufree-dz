import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Teacher() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error || !data || data.role !== 'أستاذ') { router.push('/dashboard'); return }
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'Tahoma, sans-serif' }}>جارٍ التحميل...</p>

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#6b6252', marginBottom: '1rem', cursor: 'pointer' }}>
          ← الرجوع للوحة التحكم
        </button>
        <h1 style={{ color: '#1D2B3A', marginBottom: '0.3rem' }}>موادّي</h1>
        <p style={{ color: '#6b6252', marginBottom: '1.5rem' }}>اختر مادة لإضافة دروس أو اختبارات</p>

        {(!profile.subjects || profile.subjects.length === 0) && (
          <p style={{ color: '#8a8168', background: '#EFE6CE', padding: '0.7rem', borderRadius: 6 }}>
            لم تُحدَّد أي مادة لحسابك بعد.
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          {(profile.subjects || []).map(s => (
            <button key={s} onClick={() => router.push(`/teacher-subject?name=${encodeURIComponent(s)}&stage=${encodeURIComponent(profile.stage || 'ثانوي')}`)}
              style={{
                textAlign: 'right', padding: '1rem', borderRadius: 8, border: '1px solid #e5dcc2',
                background: '#fff', color: '#1D2B3A', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem'
              }}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
