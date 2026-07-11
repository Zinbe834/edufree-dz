import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (!error) setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'Tahoma, sans-serif' }}>جارٍ التحميل...</p>

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: 500, margin: '0 auto', background: '#fff', borderRadius: 8, padding: '2rem' }}>
        <h1 style={{ color: '#1D2B3A' }}>مرحباً {profile?.full_name} 👋</h1>
        <p style={{ color: '#4A4235' }}>الدور: {profile?.role}</p>
        {profile?.role === 'تلميذ' && (
          <p style={{ color: '#4A4235' }}>{profile?.stage} — {profile?.year} {profile?.branch ? `— ${profile.branch}` : ''}</p>
        )}
        {profile?.role === 'أستاذ' && (
          <p style={{ color: '#4A4235' }}>المواد: {(profile?.subjects || []).join('، ')}</p>
        )}
        <p style={{ marginTop: '1rem', color: '#A63D40', fontSize: '0.9rem' }}>
          ✅ هذا الحساب حقيقي، محفوظ في قاعدة البيانات وليس تجريبياً.
        </p>
        {profile?.role === 'تلميذ' && (
          <button onClick={() => router.push('/subjects')}
            style={{ marginTop: '1.5rem', marginLeft: 8, padding: '0.6rem 1.2rem', background: '#1F4E3D', color: '#fff', border: 'none', borderRadius: 6 }}>
            موادّي الدراسية
          </button>
        )}
        {profile?.role === 'أستاذ' && (
          <button onClick={() => router.push('/teacher')}
            style={{ marginTop: '1.5rem', marginLeft: 8, padding: '0.6rem 1.2rem', background: '#1F4E3D', color: '#fff', border: 'none', borderRadius: 6 }}>
            موادّي
          </button>
        )}
        <button onClick={handleLogout}
          style={{ marginTop: '1.5rem', padding: '0.6rem 1.2rem', background: '#1D2B3A', color: '#fff', border: 'none', borderRadius: 6 }}>
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
