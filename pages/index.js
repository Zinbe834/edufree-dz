import { useRouter } from 'next/router'
import styles from '../styles/landing.module.css'

const STAGES = [
  { name: 'ابتدائي', years: '5 سنوات دراسية', color: '#C98A2B' },
  { name: 'متوسط', years: '4 سنوات دراسية', color: '#1F4E3D' },
  { name: 'ثانوي', years: '3 سنوات دراسية', color: '#A63D40' }
]

const FEATURES = [
  { icon: '📄', title: 'دروس وملخصات', text: 'محتوى مرتب حسب الطور والمادة' },
  { icon: '📝', title: 'اختبارات إلكترونية', text: 'تصحيح فوري ومتابعة النتائج' },
  { icon: '👥', title: 'أقسام افتراضية', text: 'تواصل مباشر بين الأستاذ والتلاميذ' }
]

export default function Home() {
  const router = useRouter()

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <div className={styles.logoBox}>📘</div>
          <span className={styles.logoText}>EduFree <span className={styles.logoAccent}>DZ</span></span>
        </div>

        <div className={styles.hero}>
          <div>
            <h1 className={styles.heroTitle}>كراستك الرقمية<br />لكل أطوار التعليم</h1>
            <p className={styles.heroText}>
              منصة مجانية تجمع دروس وتمارين واختبارات الأطوار الابتدائي والمتوسط والثانوي
              وفق البرامج الرسمية، مع مساحة للأساتذة لمرافقة تلاميذهم خطوة بخطوة.
            </p>
            <div className={styles.btnRow}>
              <button className={styles.btnPrimary} onClick={() => router.push('/signup')}>ابدأ الآن</button>
              <button className={styles.btnOutline} onClick={() => router.push('/login')}>تسجيل الدخول</button>
            </div>
          </div>

          <div className={styles.notebook}>
            <div className={styles.spiral}>
              {Array.from({ length: 9 }).map((_, i) => <div key={i} className={styles.spiralDot} />)}
            </div>
            <p className={styles.notebookLabel}>وزارة التربية الوطنية</p>
            <p className={styles.notebookTitle}>كراس التعلّم</p>
            <span className={styles.badge}>السنة الدراسية 2026</span>
          </div>
        </div>

        <h2 className={styles.sectionTitle}>الأطوار التعليمية</h2>
        <div className={styles.stageGrid}>
          {STAGES.map(s => (
            <div key={s.name} className={styles.stageCard} style={{ background: s.color }}>
              <p>{s.name}</p>
              <p>{s.years}</p>
            </div>
          ))}
        </div>

        <div className={styles.featureGrid}>
          {FEATURES.map(f => (
            <div key={f.title}>
              <div className={styles.featureIcon}>{f.icon}</div>
              <p className={styles.featureTitle}>{f.title}</p>
              <p className={styles.featureText}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
