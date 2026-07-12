import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'
import styles from '../styles/app.module.css'

const CURRICULUM = {
  'ابتدائي': {
    subjects: ['اللغة العربية', 'الرياضيات', 'التربية الإسلامية', 'التربية المدنية',
      'التاريخ والجغرافيا', 'التربية العلمية والتكنولوجية', 'اللغة الفرنسية',
      'اللغة الإنجليزية', 'التربية الفنية', 'التربية البدنية والرياضية']
  },
  'متوسط': {
    subjects: ['اللغة العربية', 'الرياضيات', 'العلوم الطبيعية', 'العلوم الفيزيائية والتكنولوجيا',
      'التاريخ والجغرافيا', 'التربية الإسلامية', 'التربية المدنية', 'اللغة الفرنسية',
      'اللغة الإنجليزية', 'الإعلام الآلي', 'التربية الفنية', 'التربية البدنية والرياضية']
  },
  'ثانوي': {
    common: ['اللغة العربية', 'اللغة الفرنسية', 'اللغة الإنجليزية', 'التربية الإسلامية',
      'التاريخ والجغرافيا', 'الفلسفة', 'التربية البدنية والرياضية'],
    branchSubjects: {
      'العلوم التجريبية': ['الرياضيات', 'العلوم الطبيعية', 'العلوم الفيزيائية'],
      'الرياضيات': ['الرياضيات المتقدمة', 'العلوم الفيزيائية', 'العلوم الطبيعية'],
      'التقني رياضي': ['الرياضيات', 'العلوم الفيزيائية', 'الهندسة الكهربائية', 'الهندسة الميكانيكية', 'الهندسة المدنية', 'الهندسة الطرائقية'],
      'تسيير واقتصاد': ['الرياضيات', 'الاقتصاد والمناجمنت', 'المحاسبة'],
      'الآداب والفلسفة': ['الأدب العربي', 'الفلسفة', 'التاريخ والجغرافيا'],
      'اللغات الأجنبية': ['اللغة الفرنسية', 'اللغة الإنجليزية', 'اللغة الأجنبية الثالثة']
    }
  }
}

export default function Subjects() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (error || !data || data.role !== 'تلميذ') { router.push('/dashboard'); return }
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className={styles.page}><p>جارٍ التحميل...</p></div>

  const subjectList = profile.stage === 'ثانوي'
    ? [...CURRICULUM['ثانوي'].common, ...(profile.branch ? CURRICULUM['ثانوي'].branchSubjects[profile.branch] : [])]
    : CURRICULUM[profile.stage].subjects

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <button className={styles.backLink} onClick={() => router.push('/dashboard')}>← الرجوع للوحة التحكم</button>
        <h1 className={styles.sectionTitle}>{profile.stage} — {profile.year} {profile.branch ? `— ${profile.branch}` : ''}</h1>
        <p className={styles.subtitle}>اختر مادة لعرض الدروس والاختبارات</p>

        <div className={styles.grid}>
          {subjectList.map(s => (
            <button key={s} className={styles.subjectCard} onClick={() => router.push(`/subject?name=${encodeURIComponent(s)}`)}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
