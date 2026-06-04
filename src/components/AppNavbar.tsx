'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'
import { useLang } from '@/lib/LangContext'
import { getTotalXP, getStreak } from '@/lib/progress'

interface Props {
  backHref?: string
  backLabel?: string
}

export default function AppNavbar({ backHref, backLabel }: Props) {
  const { t, lang, toggleLang } = useLang()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [xp, setXp] = useState(0)
  const [streak, setStreak] = useState(0)
  const [userName, setUserName] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    setXp(getTotalXP())
    setStreak(getStreak())
  }, [])

  useEffect(() => {
    if (!user) return
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data()
        if (data.totalXP !== undefined) setXp(data.totalXP)
        if (data.streak !== undefined) setStreak(data.streak)
        if (data.name) setUserName(data.name)
      }
    })
  }, [user])

  async function handleSignOut() {
    setShowDropdown(false)
    await signOut()
    router.push('/')
  }

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
      style={{ background: '#13131f', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link href={backHref} className="flex items-center gap-1.5 text-sm font-medium" style={{ color: '#aaaaaa' }}>
            {backLabel ?? t.backHome as string}
          </Link>
        ) : (
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
              style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>О</div>
            <span className="font-bold text-white hidden sm:block">{t.siteName}</span>
          </Link>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#f97316' }}>
          🔥 {streak}
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-lg"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#fbbf24' }}>
          ⭐ {xp}
        </span>
        <Link href="/progress" className="text-sm font-medium px-2.5 py-1 rounded-lg transition-colors"
          style={{ background: 'rgba(255,255,255,0.06)', color: '#aaaaaa' }}>
          📊 {t.progressNav}
        </Link>
        <button onClick={toggleLang} className="text-xs font-medium px-2 py-1 rounded-lg"
          style={{ background: 'rgba(127,119,221,0.15)', color: '#7F77DD' }}>
          {lang === 'mn' ? 'EN' : 'МН'}
        </button>

        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowDropdown(d => !d)}
              className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white"
              style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}
            >
              {(userName ?? user.phoneNumber ?? '?')[0]?.toUpperCase()}
            </button>
            {showDropdown && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                <div className="absolute right-0 top-10 z-50 rounded-xl overflow-hidden shadow-xl"
                  style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.1)', minWidth: 140 }}>
                  <button onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors"
                    style={{ color: '#f87171' }}>
                    🚪 Гарах
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link href="/login" className="text-sm font-bold px-3 py-1.5 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>
            Нэвтрэх
          </Link>
        )}
      </div>
    </header>
  )
}
