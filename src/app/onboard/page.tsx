'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'

const GOALS = [
  '📝 ЭЕШ-д бэлтгэх',
  '📚 Ангийн хичээлд туслах',
  '🧠 Математик сонирхол',
  '🏆 Олимпиад бэлтгэл',
]

function Dots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-full transition-all duration-300"
          style={{
            width: i === step ? 24 : 8,
            height: 8,
            background: i === step ? '#7F77DD' : 'rgba(255,255,255,0.15)',
          }} />
      ))}
    </div>
  )
}

export default function OnboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [grade, setGrade] = useState<'11' | '12' | ''>('')
  const [goal, setGoal] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  async function handleFinish() {
    if (!user || saving) return
    setSaving(true)
    const today = new Date().toISOString().slice(0, 10)
    await setDoc(doc(db, 'users', user.uid), {
      name,
      grade,
      goal,
      totalXP: 0,
      streak: 0,
      lastSeen: today,
      createdAt: serverTimestamp(),
    })
    router.push('/home')
  }

  if (loading || !user) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0f0f1a' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg"
            style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>О</div>
        </div>

        <Dots step={step} />

        <div className="rounded-3xl p-7" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Step 1: Name */}
          {step === 0 && (
            <div>
              <h2 className="text-xl font-black text-white text-center mb-2">Нэрээ оруулна уу</h2>
              <p className="text-sm text-center mb-6" style={{ color: '#aaaaaa' }}>Танилцая!</p>
              <input
                type="text"
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Таны нэр"
                className="w-full px-4 py-3 rounded-xl text-white outline-none mb-6"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: name.length >= 2 ? '1.5px solid #7F77DD' : '1.5px solid rgba(255,255,255,0.1)',
                }}
              />
              <button
                onClick={() => setStep(1)}
                disabled={name.length < 2}
                className="w-full py-3.5 rounded-2xl text-white font-bold transition-all"
                style={name.length >= 2
                  ? { background: 'linear-gradient(135deg,#534AB7,#7F77DD)', boxShadow: '0 0 24px rgba(127,119,221,0.4)', cursor: 'pointer' }
                  : { background: 'rgba(255,255,255,0.07)', color: '#555555', cursor: 'not-allowed' }
                }
              >
                Дараах →
              </button>
            </div>
          )}

          {/* Step 2: Grade */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-black text-white text-center mb-2">Хэдэн ангид сурдаг вэ?</h2>
              <p className="text-sm text-center mb-6" style={{ color: '#aaaaaa' }}>Ангиа сонгоно уу</p>
              <div className="flex gap-3 mb-6">
                {(['11', '12'] as const).map(g => (
                  <button key={g} onClick={() => setGrade(g)}
                    className="flex-1 py-5 rounded-2xl text-lg font-black transition-all"
                    style={grade === g
                      ? { background: 'rgba(127,119,221,0.2)', border: '2px solid #7F77DD', color: '#ffffff' }
                      : { background: 'rgba(255,255,255,0.05)', border: '2px solid rgba(255,255,255,0.1)', color: '#aaaaaa' }
                    }
                  >
                    {g}-р анги
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(0)}
                  className="flex-none px-4 py-3 rounded-2xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#aaaaaa' }}>
                  ←
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!grade}
                  className="flex-1 py-3 rounded-2xl text-white font-bold transition-all"
                  style={grade
                    ? { background: 'linear-gradient(135deg,#534AB7,#7F77DD)', boxShadow: '0 0 24px rgba(127,119,221,0.4)', cursor: 'pointer' }
                    : { background: 'rgba(255,255,255,0.07)', color: '#555555', cursor: 'not-allowed' }
                  }
                >
                  Дараах →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Goal */}
          {step === 2 && (
            <div>
              <h2 className="text-xl font-black text-white text-center mb-2">Зорилгоо сонгоно уу</h2>
              <p className="text-sm text-center mb-6" style={{ color: '#aaaaaa' }}>Яагаад сурах гэж байна вэ?</p>
              <div className="space-y-2.5 mb-6">
                {GOALS.map(g => (
                  <button key={g} onClick={() => setGoal(g)}
                    className="w-full px-4 py-3.5 rounded-xl text-left text-sm font-medium transition-all"
                    style={goal === g
                      ? { background: 'rgba(127,119,221,0.2)', border: '1.5px solid #7F77DD', color: '#ffffff' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)', color: '#aaaaaa' }
                    }
                  >
                    {g}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep(1)}
                  className="flex-none px-4 py-3 rounded-2xl text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#aaaaaa' }}>
                  ←
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!goal || saving}
                  className="flex-1 py-3 rounded-2xl text-white font-bold transition-all"
                  style={goal && !saving
                    ? { background: 'linear-gradient(135deg,#534AB7,#7F77DD)', boxShadow: '0 0 24px rgba(127,119,221,0.4)', cursor: 'pointer' }
                    : { background: 'rgba(255,255,255,0.07)', color: '#555555', cursor: 'not-allowed' }
                  }
                >
                  {saving ? 'Хадгалж байна...' : 'Эхлэх 🚀'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
