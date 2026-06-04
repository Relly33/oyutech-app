'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'

declare global {
  interface Window {
    confirmationResult: import('firebase/auth').ConfirmationResult
  }
}

function VerifyContent() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const params = useSearchParams()
  const phone = params?.get('phone') ?? ''

  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  useEffect(() => {
    if (!loading && user) {
      const uid = user.uid
      getDoc(doc(db, 'users', uid)).then(snap => {
        router.replace(snap.exists() ? '/home' : '/onboard')
      }).catch(() => router.replace('/onboard'))
    }
  }, [user, loading, router])

  const code = digits.join('')
  const allFilled = digits.every(d => d !== '')

  function handleDigit(i: number, val: string) {
    const d = val.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[i] = d
    setDigits(next)
    if (d && i < 5) inputRefs.current[i + 1]?.focus()
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      const next = [...digits]
      next[i - 1] = ''
      setDigits(next)
      inputRefs.current[i - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const next = Array(6).fill('')
    pasted.split('').forEach((c, i) => { next[i] = c })
    setDigits(next)
    const lastFilled = Math.min(pasted.length, 5)
    inputRefs.current[lastFilled]?.focus()
  }

  async function handleVerify() {
    if (!allFilled || verifying) return
    setError('')
    setVerifying(true)
    try {
      const confirmationResult = (window as any).confirmationResult
      if (!confirmationResult) {
        setError('Сессий дууссан байна. Дахин нэвтэрнэ үү.')
        router.push('/login')
        return
      }
      const result = await confirmationResult.confirm(code)
      const uid = result.user.uid
      const snap = await getDoc(doc(db, 'users', uid))
      router.push(snap.exists() ? '/home' : '/onboard')
    } catch (error: any) {
      if (error.code === 'auth/invalid-verification-code') {
        setError('Код буруу байна. Дахин оролдоно уу.')
      } else if (error.code === 'auth/code-expired') {
        setError('Код хугацаа дууссан. Дахин SMS авна уу.')
        router.push('/login')
      } else {
        setError('Алдаа гарлаа. Дахин оролдоно уу.')
      }
      setVerifying(false)
    }
  }

  function handleResend() {
    router.push('/login')
  }

  if (loading) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0f0f1a' }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="text-5xl mb-3">📱</div>
          <h1 className="text-xl font-black text-white">SMS код оруулах</h1>
          {phone && (
            <p className="text-sm mt-1" style={{ color: '#aaaaaa' }}>
              +976 {phone}-д илгээсэн
            </p>
          )}
        </div>

        <div className="rounded-3xl p-7" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          {/* Digit inputs */}
          <div className="flex gap-2 justify-center mb-6">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="tel"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-11 h-14 text-center text-xl font-black rounded-xl outline-none transition-all"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: d ? '2px solid #7F77DD' : '2px solid rgba(255,255,255,0.12)',
                  color: '#ffffff',
                }}
              />
            ))}
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-xl text-xs text-center"
              style={{ background: 'rgba(216,90,48,0.15)', color: '#f87171', border: '1px solid rgba(216,90,48,0.3)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleVerify}
            disabled={!allFilled || verifying}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-base mb-4 transition-all"
            style={allFilled && !verifying
              ? { background: 'linear-gradient(135deg,#534AB7,#7F77DD)', boxShadow: '0 0 24px rgba(127,119,221,0.4)', cursor: 'pointer' }
              : { background: 'rgba(255,255,255,0.07)', color: '#555555', cursor: 'not-allowed' }
            }
          >
            {verifying ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Баталгаажуулж байна...
              </span>
            ) : 'Баталгаажуулах ✓'}
          </button>

          <div className="text-center">
            {canResend ? (
              <button onClick={handleResend} className="text-sm font-medium" style={{ color: '#7F77DD' }}>
                Код ирсэнгүй? Дахин илгээх
              </button>
            ) : (
              <span className="text-sm" style={{ color: '#555555' }}>
                Дахин илгээх ({countdown}с)
              </span>
            )}
          </div>
        </div>

        <div className="text-center mt-5">
          <Link href="/login" className="text-sm font-medium" style={{ color: '#aaaaaa' }}>← Буцах</Link>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ background: '#0f0f1a', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#7F77DD', fontSize: 14 }}>Уншиж байна...</div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
