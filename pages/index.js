import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function Home() {
  const [status, setStatus] = useState('جارٍ التحقق من الاتصال...')

  useEffect(() => {
    async function checkConnection() {
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        setStatus('⚠️ لم يتم ضبط مفاتيح Supabase بعد في إعدادات Netlify.')
        return
      }
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      if (error) {
        setStatus('❌ خطأ في الاتصال: ' + error.message)
      } else {
        setStatus('✅ الاتصال بقاعدة البيانات ناجح! عدد الحسابات حالياً: ' + count)
      }
    }
    checkConnection()
  }, [])

  return (
    <div dir="rtl" style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', background: '#F3ECD9',
      fontFamily: 'Tahoma, sans-serif', padding: '2rem', textAlign: 'center'
    }}>
      <h1 style={{ color: '#1D2B3A', fontSize: '2rem', marginBottom: '1rem' }}>EduFree DZ 🎓</h1>
      <p style={{ color: '#4A4235' }}>{status}</p>
    </div>
  )
}
