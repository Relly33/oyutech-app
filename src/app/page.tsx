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
  const sliderRef = useRef<HTMLInputElement>(null)
  const eqRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!canvasRef.current || !sliderRef.current || !eqRef.current) return
    const canvas = canvasRef.current as HTMLCanvasElement
    const slider = sliderRef.current as HTMLInputElement
    const eqEl = eqRef.current as HTMLDivElement
    const ctxRaw = canvas.getContext('2d')
    if (!ctxRaw) return
    const ctx = ctxRaw as CanvasRenderingContext2D

    const dpr = window.devicePixelRatio || 1
    let a = 0.6
    let hx = 1.6
    let dragging = false
    let rafId = 0

    function resize() {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width) return
      canvas.width = Math.round(rect.width * dpr)
      canvas.height = Math.round(rect.height * dpr)
    }

    function updateEq() {
      eqEl.innerHTML = `y = <span style="color:#1D9E75;font-weight:700">${a.toFixed(2)}</span> · x²`
    }

    function draw(t: number) {
      const W = canvas.width / dpr
      const H = canvas.height / dpr
      if (!W || !H) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)

      const cx = W / 2, cy = H * 0.88
      const xScale = W / 6, yScale = H / 5
      const glowPulse = Math.sin(t / 800) * 0.5 + 0.5

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.045)'
      ctx.lineWidth = 1
      for (let gx = -3; gx <= 3; gx++) {
        const px = cx + gx * xScale
        ctx.beginPath(); ctx.moveTo(px, 0); ctx.lineTo(px, H); ctx.stroke()
      }
      for (let gy = 0; gy <= 5; gy++) {
        const py = cy - gy * yScale
        ctx.beginPath(); ctx.moveTo(0, py); ctx.lineTo(W, py); ctx.stroke()
      }

      // Axes
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(cx, 0); ctx.lineTo(cx, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, cy); ctx.lineTo(W, cy); ctx.stroke()

      // Parabola — horizontal gradient purple→teal→purple, pulsing glow
      const grad = ctx.createLinearGradient(0, 0, W, 0)
      grad.addColorStop(0, '#7F77DD')
      grad.addColorStop(0.5, '#1D9E75')
      grad.addColorStop(1, '#7F77DD')
      ctx.strokeStyle = grad
      ctx.lineWidth = 3.4
      ctx.lineJoin = 'round'
      ctx.shadowBlur = 16 + glowPulse * 10
      ctx.shadowColor = '#7F77DD'
      ctx.beginPath()
      let first = true
      for (let px = 0; px <= W; px++) {
        const x = (px - cx) / xScale
        const py = cy - a * x * x * yScale
        if (py > H + 20) { first = true; continue }
        if (first) { ctx.moveTo(px, py); first = false } else ctx.lineTo(px, py)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      // Draggable handle dot at (hx, a·hx²)
      const hdotX = cx + hx * xScale
      const hdotY = cy - a * hx * hx * yScale
      ctx.shadowBlur = 20 + glowPulse * 8
      ctx.shadowColor = '#1D9E75'
      ctx.beginPath()
      ctx.arc(hdotX, hdotY, 11, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(29,158,117,0.18)'
      ctx.fill()
      ctx.shadowBlur = 0
      ctx.beginPath()
      ctx.arc(hdotX, hdotY, 8, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(hdotX, hdotY, 5, 0, Math.PI * 2)
      ctx.fillStyle = '#1D9E75'
      ctx.fill()
    }

    function loop(t: number) { draw(t); rafId = requestAnimationFrame(loop) }

    function handleDrag(clientX: number, clientY: number) {
      const rect = canvas.getBoundingClientRect()
      const W = canvas.width / dpr, H = canvas.height / dpr
      const cx = W / 2, cy = H * 0.88
      const xScale = W / 6, yScale = H / 5
      hx = Math.max(0.8, Math.min(2.3, (clientX - rect.left - cx) / xScale))
      const graphY = (cy - (clientY - rect.top)) / yScale
      a = Math.max(0.1, Math.min(3, graphY / (hx * hx)))
      slider.value = a.toFixed(2)
      updateEq()
    }

    function onMouseDown(e: MouseEvent) {
      e.preventDefault(); dragging = true; canvas.style.cursor = 'grabbing'
      handleDrag(e.clientX, e.clientY)
    }
    function onMouseMove(e: MouseEvent) { if (dragging) handleDrag(e.clientX, e.clientY) }
    function onMouseUp() { dragging = false; canvas.style.cursor = 'grab' }
    function onTouchStart(e: TouchEvent) {
      e.preventDefault(); dragging = true
      if (e.changedTouches[0]) handleDrag(e.changedTouches[0].clientX, e.changedTouches[0].clientY)
    }
    function onTouchMove(e: TouchEvent) {
      if (!dragging) return; e.preventDefault()
      if (e.touches[0]) handleDrag(e.touches[0].clientX, e.touches[0].clientY)
    }
    function onTouchEnd() { dragging = false }
    function onSliderInput() { a = parseFloat(slider.value); updateEq() }

    resize()
    updateEq()
    rafId = requestAnimationFrame(loop)

    canvas.addEventListener('mousedown', onMouseDown)
    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchend', onTouchEnd)
    slider.addEventListener('input', onSliderInput)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(rafId)
      canvas.removeEventListener('mousedown', onMouseDown)
      canvas.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchend', onTouchEnd)
      slider.removeEventListener('input', onSliderInput)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div style={{ position: 'relative', maxWidth: 560, width: '100%' }}>
      {/* Ambient glow — replaces ::before pseudo-element */}
      <div style={{
        position: 'absolute', top: -14, right: -14, bottom: -14, left: -14,
        borderRadius: 36,
        background: 'radial-gradient(circle at 60% 40%, rgba(29,158,117,0.25), transparent 70%)',
        filter: 'blur(24px)', pointerEvents: 'none', zIndex: 0,
        animation: 'widgetGlow 4s ease-in-out infinite',
      }} />
      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1, background: '#13131f',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 22, padding: 22,
        boxShadow: '0 30px 70px -24px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 13.5, fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>
            <span className="pulse-dot" style={{ display: 'inline-block', width: 9, height: 9, borderRadius: '50%', background: '#1D9E75', boxShadow: '0 0 10px #1D9E75' }} />
            Амьд жишээ · парабол
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.42)', fontWeight: 500 }}>чирээд үзээрэй</span>
        </div>
        {/* Canvas */}
        <div style={{
          position: 'relative', width: '100%', height: 300, borderRadius: 14,
          background: 'linear-gradient(180deg, #0e0e18, #101019)',
          overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)',
          touchAction: 'none',
        }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', cursor: 'grab' }} />
        </div>
        {/* Footer: equation + label */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, gap: 16 }}>
          <div ref={eqRef} style={{ fontSize: 18, fontWeight: 700, color: '#fff', fontVariantNumeric: 'tabular-nums' }} />
          <div style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>
            нээлт <span style={{ color: '#1D9E75', fontWeight: 600 }}>a</span> коэффициент
          </div>
        </div>
        {/* Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 10 }}>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>0.1</span>
          <input ref={sliderRef} type="range" min="0.1" max="3" step="0.01" defaultValue="0.6"
            style={{ flex: 1, accentColor: '#7F77DD', height: 6, cursor: 'pointer' }} />
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>3.0</span>
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
        .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }
        @keyframes pulseDot { 0%,100% { box-shadow: 0 0 0 0 rgba(29,158,117,0.5); } 50% { box-shadow: 0 0 0 5px rgba(29,158,117,0); } }
        @keyframes widgetGlow { 0%,100% { opacity: .55; } 50% { opacity: .9; } }
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

        {/* Right: hero graph widget */}
        <div className="flex-1 w-full">
          <HeroGraph />
        </div>
        </div>
      </section>

      {/* Section divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(127,119,221,0.1), transparent)', maxWidth: 960, margin: '0 auto' }} />

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

      {/* Section divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(29,158,117,0.12), transparent)', maxWidth: 960, margin: '0 auto' }} />

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs font-bold tracking-widest mb-2" style={{ color: '#1D9E75' }}>ХЭРХЭН АЖИЛЛАДАГ ВЭ</p>
          <h2 className="text-3xl font-black text-white">4 алхамд эхлэх</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map(({ icon, title, desc }, i) => {
            const stepColors = ['#7F77DD', '#1D9E75', '#D85A30', '#BA7517']
            const c = stepColors[i]
            return (
              <div key={title} className="flex flex-col items-center text-center gap-3">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: `${c}22`, border: `1px solid ${c}44` }}>{icon}</div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white"
                    style={{ background: c }}>{i + 1}</div>
                </div>
                <h3 className="font-bold text-white">{title}</h3>
                <p className="text-xs" style={{ color: '#aaaaaa' }}>{desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Section divider */}
      <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(216,90,48,0.12), transparent)', maxWidth: 960, margin: '0 auto' }} />

      {/* Testimonials */}
      <section style={{ background: 'linear-gradient(180deg, rgba(216,90,48,0.04), transparent)' }}>
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest mb-2" style={{ color: '#D85A30' }}>СЭТГЭГДЭЛ</p>
            <h2 className="text-3xl font-black text-white">Тэд хэлж байна</h2>
          </div>
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
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
        <div style={{
          position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 100, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at center, rgba(127,119,221,0.1), transparent 70%)',
        }} />
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
