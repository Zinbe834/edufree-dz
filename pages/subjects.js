import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabaseClient'

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

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'Tahoma, sans-serif' }}>جارٍ التحميل...</p>

  const subjectList = profile.stage === 'ثانوي'
    ? [...CURRICULUM['ثانوي'].common, ...(profile.branch ? CURRICULUM['ثانوي'].branchSubjects[profile.branch] : [])]
    : CURRICULUM[profile.stage].subjects

  return (
    <div dir="rtl" style={{ minHeight: '100vh', background: '#F3ECD9', fontFamily: 'Tahoma, sans-serif', padding: '2rem' }}>
      <div style={{ maxWidth: 700, margin: '0 auto' }}>
        <button onClick={() => router.push('/dashboard')} style={{ background: 'none', border: 'none', color: '#6b6252', marginBottom: '1rem', cursor: 'pointer' }}>
          ← الرجوع للوحة التحكم
        </button>
        <h1 style={{ color: '#1D2B3A', marginBottom: '0.3rem' }}>
          {profile.stage} — {profile.year} {profile.branch ? `— ${profile.branch}` : ''}
        </h1>
        <p style={{ color: '#6b6252', marginBottom: '1.5rem' }}>اختر مادة لعرض الدروس والاختبارات</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          {subjectList.map(s => (
            <button key={s} onClick={() => router.push(`/subject?name=${encodeURIComponent(s)}`)}
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
