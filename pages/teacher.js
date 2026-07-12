import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/app.module.css'

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

  if (loading) return <div className={styles.page}><p>جارٍ التحميل...</p></div>

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backLink} onClick={() => router.push('/dashboard')}>← الرجوع للوحة التحكم</button>
        <h1 className={styles.sectionTitle}>موادّي</h1>
        <p className={styles.subtitle}>اختر مادة لإضافة دروس أو اختبارات</p>

        {(!profile.subjects || profile.subjects.length === 0) && (
          <p className={styles.emptyNote}>لم تُحدَّد أي مادة لحسابك بعد.</p>
        )}

        <div className={styles.grid}>
          {(profile.subjects || []).map(s => (
            <button key={s} className={styles.subjectCard} onClick={() => router.push(`/teacher-subject?name=${encodeURIComponent(s)}`)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
