'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/lib/AuthContext'

declare global {
  interface Window {
    confirmationResult: import('firebase/auth').ConfirmationResult
    recaptchaVerifier: RecaptchaVerifier
  }
}

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const recaptchaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!loading && user) router.replace('/home')
  }, [user, loading, router])

  const valid = /^\d{8}$/.test(phone)

  async function handleSend() {
    if (!valid || sending) return
    setError('')
    setSending(true)
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { size: 'invisible' })
      }
      const result = await signInWithPhoneNumber(auth, '+976' + phone, window.recaptchaVerifier)
      window.confirmationResult = result
      router.push('/verify?phone=' + encodeURIComponent(phone))
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Алдаа гарлаа'
      setError(msg)
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear()
        window.recaptchaVerifier = undefined as unknown as RecaptchaVerifier
      }
    } finally {
      setSending(false)
    }
  }

  if (loading || user) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: '#0f0f1a' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-2xl mb-3"
            style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)', boxShadow: '0 0 32px rgba(127,119,221,0.4)' }}>
            О
          </div>
          <span className="text-xl font-black text-white">Ойутех</span>
        </div>

        {/* Card */}
        <div className="rounded-3xl p-7" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.08)' }}>
          <h1 className="text-xl font-black text-white text-center mb-1">Нэвтрэх / Бүртгүүлэх</h1>
          <p className="text-sm text-center mb-7" style={{ color: '#aaaaaa' }}>Утасны дугаараа оруулна уу</p>

          <label className="block text-xs font-semibold mb-2" style={{ color: '#aaaaaa' }}>Утасны дугаар</label>
          <div className="flex gap-2 mb-5">
            <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl flex-none text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.1)' }}>
              🇲🇳 +976
            </div>
            <input
              type="tel"
              inputMode="numeric"
              maxLength={8}
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="XXXXXXXX"
              autoFocus
              className="flex-1 px-4 py-3 rounded-xl text-white text-sm outline-none transition-all"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: valid ? '1.5px solid #7F77DD' : '1.5px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(216,90,48,0.15)', color: '#f87171', border: '1px solid rgba(216,90,48,0.3)' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={!valid || sending}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-base transition-all"
            style={valid && !sending
              ? { background: 'linear-gradient(135deg,#534AB7,#7F77DD)', boxShadow: '0 0 24px rgba(127,119,221,0.4)', cursor: 'pointer' }
              : { background: 'rgba(255,255,255,0.07)', color: '#555555', cursor: 'not-allowed' }
            }
          >
            {sending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Илгээж байна...
              </span>
            ) : 'SMS код илгээх →'}
          </button>

          <p className="text-center text-xs mt-5" style={{ color: '#555555' }}>
            Үргэлжлүүлснээр та манай{' '}
            <a href="#" className="underline" style={{ color: '#7F77DD' }}>үйлчилгээний нөхцөл</a>
            -ийг зөвшөөрч байна.
          </p>
        </div>

        <div className="text-center mt-5">
          <Link href="/" className="text-sm font-medium" style={{ color: '#aaaaaa' }}>← Буцах</Link>
        </div>
      </div>

      <div id="recaptcha-container" ref={recaptchaRef} />
    </div>
  )
}
