'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import { getModuleProgress } from '@/lib/progress'

interface UserProfile {
  name: string
  totalXP: number
  streak: number
}

const MODULES = [
  { id: 'fn', emoji: '📐', title: 'Функц ба График', color: '#7F77DD', totalLessons: 4 },
  { id: 'trig', emoji: '〜', title: 'Тригонометр', color: '#D85A30', totalLessons: 4 },
  { id: 'calc', emoji: '∂', title: 'Уламжлал', color: '#1D9E75', totalLessons: 4 },
  { id: 'int', emoji: '∫', title: 'Интеграл', color: '#BA7517', totalLessons: 4 },
]

function DailyChallenge() {
  const [secs, setSecs] = useState(() => {
    const now = new Date()
    const midnight = new Date(now)
    midnight.setHours(24, 0, 0, 0)
    return Math.floor((midnight.getTime() - now.getTime()) / 1000)
  })

  useEffect(() => {
    const t = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  const h = Math.floor(secs / 3600)
  const m = Math.floor((secs % 3600) / 60)
  const s = secs % 60
  const fmt = `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`

  return (
    <div className="rounded-2xl p-5 mb-6 flex items-center justify-between gap-4"
      style={{ background: 'linear-gradient(135deg,rgba(83,74,183,0.35),rgba(127,119,221,0.15))', border: '1px solid rgba(127,119,221,0.3)' }}>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">⚡</span>
          <span className="font-bold text-white text-sm">Өдрийн даалгавар</span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>+50 XP</span>
        </div>
        <p className="text-sm" style={{ color: '#aaaaaa' }}>Нэг хичээлийг дуусгаж +50 XP цуглуул</p>
        <p className="text-xs mt-1 font-mono" style={{ color: '#555555' }}>⏱ {fmt}</p>
      </div>
      <Link href="/courses" className="flex-none text-sm font-bold px-4 py-2 rounded-xl text-white"
        style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>
        Эхлэх
      </Link>
    </div>
  )
}

function StatCard({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <div className="flex-1 rounded-2xl p-4 flex flex-col gap-1"
      style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)' }}>
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-bold" style={{ color }}>{value}</span>
      <span className="text-xs" style={{ color: '#aaaaaa' }}>{label}</span>
    </div>
  )
}

export default function HomePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [doneCount, setDoneCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) setProfile(snap.data() as UserProfile)
    })
    const fnProg = getModuleProgress('fn-3')
    setDoneCount(fnProg.quizDone ? 1 : 0)
  }, [user])

  async function handleSignOut() {
    await signOut()
    router.push('/')
  }

  if (loading || !user) return null

  const name = profile?.name ?? '...'
  const xp = profile?.totalXP ?? 0
  const streak = profile?.streak ?? 0

  return (
    <div className="min-h-screen" style={{ background: '#0f0f1a' }}>
      {/* Navbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
        style={{ background: '#13131f', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>О</div>
          <span className="font-bold text-white hidden sm:block">Ойутех</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#f97316' }}>🔥 {streak}</span>
          <span className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.06)', color: '#fbbf24' }}>⭐ {xp}</span>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(d => !d)}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>
              {name[0]?.toUpperCase() ?? '?'}
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-10 z-50 rounded-xl overflow-hidden shadow-xl"
                  style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', minWidth: 140 }}>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors hover:bg-white/5"
                    style={{ color: '#f87171' }}>
                    🚪 Гарах
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pb-16 pt-6">
        {/* Greeting */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Сайн уу, {name}! 👋</h1>
          <p className="mt-1" style={{ color: '#aaaaaa' }}>Өнөөдөр юу сурах вэ?</p>
        </div>

        {/* Daily challenge */}
        <DailyChallenge />

        {/* Stat cards */}
        <div className="flex gap-3 mb-6">
          <StatCard icon="⭐" value={xp} label="Нийт XP" color="#fbbf24" />
          <StatCard icon="🔥" value={streak} label="Дараалсан өдөр" color="#f97316" />
          <StatCard icon="✅" value={doneCount} label="Дууссан хичээл" color="#1D9E75" />
        </div>

        {/* Module cards */}
        <div className="space-y-3">
          {MODULES.map((mod) => {
            const prog = getModuleProgress(mod.id)
            const done = prog.quizDone ? 1 : 0
            const pct = Math.round((done / mod.totalLessons) * 100)
            const btnLabel = done >= mod.totalLessons ? 'Давтах' : done > 0 ? 'Үргэлжлүүлэх →' : 'Эхлэх →'
            return (
              <div key={mod.id} className="rounded-2xl p-5"
                style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl font-bold flex-none"
                      style={{ background: `${mod.color}22` }}>{mod.emoji}</div>
                    <div>
                      <h3 className="font-bold text-white text-base leading-tight">{mod.title}</h3>
                      <p className="text-xs mt-0.5" style={{ color: '#aaaaaa' }}>{done}/{mod.totalLessons} хичээл</p>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full mb-4 overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: mod.color }} />
                </div>
                <Link href="/courses" className="inline-flex items-center gap-1.5 text-sm font-bold px-4 py-2 rounded-xl text-white"
                  style={{ background: `linear-gradient(135deg,${mod.color}cc,${mod.color})` }}>
                  {btnLabel}
                </Link>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
