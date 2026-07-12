import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/app.module.css'

export default function Dashboard() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
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

  if (loading) return <div className={styles.page}><p>جارٍ التحميل...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.welcomeCard}>
          <h1 className={styles.title}>مرحباً {profile?.full_name} 👋</h1>
          <p className={styles.infoLine}>الدور: {profile?.role}</p>
          {profile?.role === 'تلميذ' && (
            <p className={styles.infoLine}>{profile?.stage} — {profile?.year} {profile?.branch ? `— ${profile.branch}` : ''}</p>
          )}
          {profile?.role === 'أستاذ' && (
            <p className={styles.infoLine}>المواد: {(profile?.subjects || []).join('، ')}</p>
          )}
          <p className={styles.verifiedNote}>✅ هذا الحساب حقيقي، محفوظ في قاعدة البيانات وليس تجريبياً.</p>

          <div className={styles.actionsRow}>
            {profile?.role === 'تلميذ' && (
              <button className={styles.btnGreen} onClick={() => router.push('/subjects')}>موادّي الدراسية</button>
            )}
            {profile?.role === 'أستاذ' && (
              <button className={styles.btnGreen} onClick={() => router.push('/teacher')}>موادّي</button>
            )}
            <button className={styles.btnDark} onClick={handleLogout}>تسجيل الخروج</button>
          </div>
        </div>
      </div>
    </div>
  )
}
