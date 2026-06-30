'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/AuthContext'
import MathFloatLayer from '@/components/MathFloatLayer'

function useCounter(target: number, duration = 1800) {
  const [value, setValue] = useState(0)
  const started = useRef(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now: number) => {
          const pct = Math.min((now - start) / duration, 1)
          setValue(Math.floor(pct * target))
          if (pct < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration])
  return { value, ref }
}

function AnimatedCounter({ target, suffix, label }: { target: number; suffix: string; label: string }) {
  const { value, ref } = useCounter(target)
  return (
    <div ref={ref} className="text-center">
      <div className="text-3xl font-black text-white">
        {value.toLocaleString()}{suffix}
      </div>
      <div className="text-sm mt-1" style={{ color: '#aaaaaa' }}>{label}</div>
    </div>
  )
}

function HeroGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [a, setA] = useState(1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const W = canvas.width, H = canvas.height
    const cx = W / 2, cy = H / 2
    const scale = 30

    ctx.clearRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.05)'
    ctx.lineWidth = 1
    for (let x = 0; x <= W; x += scale) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke() }
    for (let y = 0; y <= H; y += scale) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke() }

    // Axes
    ctx.strokeStyle = 'rgba(255,255,255,0.2)'
    ctx.lineWidth = 1.5
    ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()

    // Parabola
    const grad = ctx.createLinearGradient(0, 0, W, 0)
    grad.addColorStop(0, '#7F77DD')
    grad.addColorStop(1, '#1D9E75')
    ctx.strokeStyle = grad
    ctx.lineWidth = 2.5
    ctx.shadowBlur = 12
    ctx.shadowColor = '#7F77DD88'
    ctx.beginPath()
    let first = true
    for (let px = 0; px <= W; px++) {
      const x = (px - cx) / scale
      const y = a * x * x
      const py = cy - y * scale
      if (first) { ctx.moveTo(px, py); first = false } else ctx.lineTo(px, py)
    }
    ctx.stroke()
    ctx.shadowBlur = 0
  }, [a])

  return (
    <div className="rounded-2xl overflow-hidden p-4" style={{ background: '#13131f', border: '1px solid rgba(127,119,221,0.3)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold" style={{ color: '#7F77DD' }}>y = ax²</span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(29,158,117,0.2)', color: '#1D9E75' }}>Бодит цаг</span>
      </div>
      <canvas ref={canvasRef} width={260} height={160} className="rounded-xl w-full" style={{ background: '#0f0f1a' }} />
      <div className="mt-3 space-y-1">
        <div className="flex justify-between text-xs" style={{ color: '#aaaaaa' }}>
          <span>a = {a.toFixed(1)}</span>
        </div>
        <input
          type="range" min={-3} max={3} step={0.1} value={a}
          onChange={e => setA(parseFloat(e.target.value))}
          className="w-full" style={{ accentColor: '#7F77DD' }}
        />
      </div>
      <div className="mt-3 rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <p className="text-xs font-semibold text-white mb-1">Асуулт:</p>
        <p className="text-xs" style={{ color: '#aaaaaa' }}>a = 2 үед парабол хэрхэн өөрчлөгдөх вэ?</p>
        <div className="flex gap-2 mt-2">
          {['Нарийсна', 'Өргөсөнө'].map((opt, i) => (
            <button key={opt} className="flex-1 text-xs py-1.5 rounded-lg font-medium"
              style={{ background: i === 0 ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.05)', color: i === 0 ? '#1D9E75' : '#aaaaaa', border: i === 0 ? '1px solid #1D9E75' : '1px solid transparent' }}>
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

const FEATURES = [
  { icon: '📊', title: 'Интерактив График', sub: 'Математикийг нүдээрээ хар.', desc: 'Параметрүүдийг өөрчилж, график хэрхэн өөрчлөгдөхийг бодит цагт ажигла. Томъёог цээжлэх биш — учрыг нь ойлго.', color: '#7F77DD' },
  { icon: '🧪', title: 'Виртуал Туршилт', sub: 'Шинжлэх ухааныг өөрөө турш.', desc: 'Физик, хими, биологийн үзэгдлүүдийг аюулгүй орчинд туршиж, үр дүнг шууд ажигла.', color: '#1D9E75' },
  { icon: '🎯', title: 'Удирдамжтай Даалгавар', sub: 'Алхам бүрт тусламжтай.', desc: 'Гацсан үед зөвлөгөө авч, бодлогыг жижиг алхмуудаар шийдэн ойлголтоо бататга.', color: '#D85A30' },
  { icon: '📈', title: 'Явц ба Эзэмшил', sub: 'Ахиц дэвшлээ хараарай.', desc: 'Ямар сэдэв дээр хүчтэй, хаана сайжруулах шаардлагатайгаа шууд мэд.', color: '#BA7517' },
  { icon: '🏆', title: 'Амжилтын Тэмдэг', sub: 'Суралцахыг илүү сонирхолтой болгоно.', desc: 'Даалгавар биелүүлж XP цуглуулан, шинэ түвшин болон онцгой амжилтуудыг нээгээрэй.', color: '#fbbf24' },
  { icon: '🤖', title: 'AI Монгол Туслах', sub: '24/7 бэлэн багш.', desc: 'Асуултаа Монгол хэлээр асууж, алдаагаа ойлгомжтой тайлбарлуулж, суралцахдаа итгэлтэй болоорой.', color: '#7F77DD' },
]

const STEPS = [
  { icon: '📱', title: 'Бүртгүүлэх', desc: 'Утасны дугаараар 30 секундэд' },
  { icon: '🎓', title: 'Анги сонгох', desc: '11 эсвэл 12-р анги' },
  { icon: '📚', title: 'Сурах', desc: 'Интерактив хичээлүүд' },
  { icon: '🏆', title: 'Ахих', desc: 'XP цуглуулж, дараалал хадгалах' },
]

const TESTIMONIALS = [
  { quote: 'ЭЕШ-д бэлтгэж байхдаа Ойутехийг хэрэглэж эхэллээ. Интеграл гэдэг ойлголт надад маш хэцүү байсан ч график дээр нүдээрээ харахад ойлгосон.', name: 'Номин-Эрдэнэ', grade: '12-р анги УБ', avatar: '👩' },
  { quote: 'AI тутор монгол хэлээр тайлбарлах нь гайхалтай. Асуулт асуухаас ичдэг байсан намайг дасгасан.', name: 'Баатар', grade: '11-р анги Дархан', avatar: '👨' },
  { quote: 'Дуолинго шиг streak байдаг учраас өдөр бүр орж сурах болсон. 30 хоногийн дараалал хадгалж байна!', name: 'Сарнай', grade: '12-р анги Эрдэнэт', avatar: '👩' },
]

export default function LandingPage() {
  const { user, loading } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) return null

  return (
    <div style={{ background: '#0f0f1a', color: '#ffffff', minHeight: '100vh' }}>
      <style>{`
        @keyframes gradientShift {
          0%,100% { background-position: 0% 50% }
          50% { background-position: 100% 50% }
        }
        .grad-text {
          background: linear-gradient(90deg, #7F77DD, #1D9E75, #7F77DD);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 3s ease infinite;
        }
        .fade-up { animation: fadeUp 0.6s ease both; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
        .float { animation: float 3s ease-in-out infinite; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* Navbar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16 transition-all duration-300"
        style={scrolled
          ? { background: 'rgba(15,15,26,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.1)' }
          : { background: 'transparent' }
        }
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>О</div>
          <span className="font-bold text-white">Ойутех</span>
        </div>
        <div className="flex items-center gap-3">
          {!user && (
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-xl transition-colors"
              style={{ color: '#aaaaaa' }}>Нэвтрэх</Link>
          )}
          <Link href={user ? '/home' : '/courses'} className="text-sm font-bold px-4 py-2 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>
            {user ? 'Үргэлжлүүлэх →' : 'Үнэгүй эхлэх →'}
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-20" style={{ position: 'relative', overflow: 'hidden' }}>
        <MathFloatLayer />
        <div className="flex flex-col lg:flex-row items-center gap-12" style={{ position: 'relative', zIndex: 1 }}>
        {/* Left */}
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.3)', color: '#7F77DD' }}>
            🇲🇳 Монголын #1 математикийн платформ
          </div>
          <h1 className="text-4xl lg:text-5xl font-black leading-tight mb-4 text-white">
            Математикийг <span className="grad-text">цээжилж биш</span>{' '}
            ойлгож сур
          </h1>
          <p className="text-lg leading-relaxed mb-8" style={{ color: '#aaaaaa' }}>
            11–12-р ангийн математикийг интерактив хичээл, бодит туршилт, AI туслахтайгаар сур.
          </p>

          <div className="space-y-3 mb-8">
            {[
              { icon: '📐', text: 'График хөдөлгө — функцийг бодит цагт ойлго' },
              { icon: '💬', text: 'Асуултад хариул — AI монгол хэлээр тайлбарлана' },
              { icon: '⭐', text: 'Оноо цуглуул — XP, дараалал, амжилтын тэмдэг' },
              { icon: '🧠', text: 'Үзэл баримтлалыг жинхэнэ утгаар нь ойлго' },
            ].map(({ icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-none"
                  style={{ background: 'rgba(127,119,221,0.15)' }}>{icon}</div>
                <span className="text-sm" style={{ color: '#cccccc' }}>{text}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mb-10">
            <Link href={user ? '/home' : '/courses'} className="text-base font-bold px-6 py-3 rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)', boxShadow: '0 0 32px rgba(127,119,221,0.4)' }}>
              {user ? 'Үргэлжлүүлэх →' : 'Үнэгүй эхлэх →'}
            </Link>
            {!user && (
              <Link href="/courses" className="text-base font-bold px-6 py-3 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff' }}>
                Демо үзэх
              </Link>
            )}
          </div>

          {/* Counters */}
          <div className="flex gap-8">
            <AnimatedCounter target={700000} suffix="+" label="сурагч" />
            <AnimatedCounter target={27} suffix="" label="хичээл" />
            <AnimatedCounter target={100} suffix="%" label="үнэгүй" />
          </div>
        </div>

        {/* Right: floating mock lesson card */}
        <div className="flex-1 max-w-sm w-full relative">
          <div className="float">
            <HeroGraph />
          </div>
          {/* Floating badges */}
          <div className="absolute -top-3 -left-4 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
            style={{ background: '#13131f', border: '1px solid rgba(249,115,22,0.4)', color: '#f97316' }}>
            🔥 7 дараалал
          </div>
          <div className="absolute -bottom-3 -right-2 px-3 py-1.5 rounded-full text-sm font-bold shadow-lg"
            style={{ background: '#13131f', border: '1px solid rgba(251,191,36,0.4)', color: '#fbbf24' }}>
            ⭐ +20 XP
          </div>
        </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-black text-white mb-3">Сурах биш, нээж ойлго.</h2>
          <p className="text-base max-w-2xl mx-auto" style={{ color: '#aaaaaa' }}>
            Хичээл бүр интерактив туршлага, визуал ойлголт, бодит асуудал шийдэх арга дээр суурилсан.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon, title, sub, desc, color }) => (
            <div key={title} className="rounded-2xl p-6"
              style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-4"
                style={{ background: `${color}22` }}>{icon}</div>
              <h3 className="font-bold text-white text-base mb-1">{title}</h3>
              <p className="text-xs font-semibold mb-2" style={{ color }}>{sub}</p>
              <p className="text-sm leading-relaxed" style={{ color: '#aaaaaa' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">4 алхамд эхлэх</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ icon, title, desc }, i) => (
            <div key={title} className="flex flex-col items-center text-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: 'rgba(127,119,221,0.15)', border: '1px solid rgba(127,119,221,0.25)' }}>{icon}</div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white"
                  style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>{i + 1}</div>
              </div>
              <h3 className="font-bold text-white">{title}</h3>
              <p className="text-xs" style={{ color: '#aaaaaa' }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-black text-white text-center mb-12">Тэд хэлж байна</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(({ quote, name, grade, avatar }) => (
            <div key={name} className="rounded-2xl p-6" style={{ background: '#13131f', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex gap-0.5 mb-4">
                {Array(5).fill(0).map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
              </div>
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#cccccc' }}>"{quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ background: 'rgba(127,119,221,0.15)' }}>{avatar}</div>
                <div>
                  <p className="font-bold text-white text-sm">{name}</p>
                  <p className="text-xs" style={{ color: '#aaaaaa' }}>{grade}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-4xl mx-auto px-6 py-8 mb-16">
        <div className="relative rounded-3xl p-10 text-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg,rgba(83,74,183,0.5),rgba(29,158,117,0.3))', border: '1px solid rgba(127,119,221,0.3)' }}>
          {/* glow blobs */}
          <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(127,119,221,0.35),transparent 70%)' }} />
          <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(29,158,117,0.3),transparent 70%)' }} />
          <h2 className="text-3xl font-black text-white mb-3 relative">Өнөөдөр эхлэхэд бэлэн үү?</h2>
          <p className="text-base mb-8 relative" style={{ color: '#cccccc' }}>
            Утасны дугаараар 30 секундэд бүртгүүлж, математикийн аялалаа эхлүүлээрэй.
          </p>
          <div className="flex flex-wrap justify-center gap-3 relative">
            <Link href="/login" className="text-base font-bold px-7 py-3 rounded-2xl text-white"
              style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)', boxShadow: '0 0 32px rgba(127,119,221,0.5)' }}>
              Үнэгүй бүртгүүлэх →
            </Link>
            <Link href="/courses" className="text-base font-bold px-7 py-3 rounded-2xl"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#ffffff' }}>
              Хичээл үзэх
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'rgba(255,255,255,0.07)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs"
              style={{ background: 'linear-gradient(135deg,#534AB7,#7F77DD)' }}>О</div>
            <span className="font-bold text-white">Ойутех</span>
            <span className="text-xs ml-2" style={{ color: '#555555' }}>© 2026 Монгол EdTech</span>
          </div>
          <div className="flex items-center gap-5">
            {['Хичээлүүд', 'Үнэ', 'Тусламж', 'Холбоо барих'].map((link) => (
              <a key={link} href="#" className="text-sm transition-colors hover:text-white" style={{ color: '#aaaaaa' }}>{link}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
