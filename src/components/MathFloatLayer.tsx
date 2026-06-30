'use client'
import { useEffect, useRef } from 'react'

export default function MathFloatLayer() {
  const layerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const syms = ['∫', 'π', 'x²', '√', '∞', 'Σ', 'sin', 'θ', '≈']
    const colors = ['#7F77DD', '#1D9E75', '#BA7517', '#7F77DD', '#D85A30',
                     '#1D9E75', '#7F77DD', '#1D9E75', '#BA7517']

    const elements: HTMLSpanElement[] = []

    for (let i = 0; i < 9; i++) {
      const s = document.createElement('span')
      s.textContent = syms[i % syms.length]
      const size = 34 + Math.round(Math.random() * 58)
      const dur = 20 + Math.random() * 18
      const o = 0.05 + Math.random() * 0.05

      s.style.position = 'absolute'
      s.style.bottom = '-12%'
      s.style.left = (4 + Math.random() * 90) + '%'
      s.style.fontSize = size + 'px'
      s.style.fontWeight = '700'
      s.style.fontFamily = 'Inter, system-ui, sans-serif'
      s.style.color = colors[i % colors.length]
      s.style.willChange = 'transform, opacity'
      s.style.setProperty('--o', o.toFixed(3))

      if (reduce) {
        s.style.opacity = (o * 0.7).toFixed(3)
        s.style.top = (Math.random() * 80) + '%'
        s.style.bottom = 'auto'
      } else {
        s.style.opacity = '0'
        s.style.animation = `mathFloatUp ${dur.toFixed(1)}s linear ${(-Math.random() * dur).toFixed(1)}s infinite`
      }

      layer.appendChild(s)
      elements.push(s)
    }

    return () => {
      elements.forEach(el => el.remove())
    }
  }, [])

  return (
    <>
      <style jsx global>{`
        @keyframes mathFloatUp {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          12%  { opacity: var(--o, 0.08); }
          88%  { opacity: var(--o, 0.08); }
          100% { transform: translateY(-130vh) rotate(16deg); opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .math-float-layer span { animation: none !important; }
        }
      `}</style>
      <div
        ref={layerRef}
        className="math-float-layer"
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
    </>
  )
}
