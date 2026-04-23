'use client'
import { useState, useEffect, useRef } from 'react'

const IMAGENES_FONDO = [
  'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915707/Copilot_20260422_235149_gx07ic.png',
  'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915709/Copilot_20260423_000431_k2gk4n.png',
  'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915710/Copilot_20260423_000306_xucvfd.png',
  'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915712/Copilot_20260423_000714_yreyre.png',
]

const TITULO_PALABRAS = ['¿Tu', 'idea', 'tiene', 'futuro?']

export default function Home() {
  const [idea, setIdea] = useState('')
  const [veredicto, setVeredicto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [fuentes, setFuentes] = useState<string[]>([])
  const [postsAnalizados, setPostsAnalizados] = useState(0)
  const [sugerencias, setSugerencias] = useState<any[]>([])
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false)
  const [indiceImagen, setIndiceImagen] = useState(0)
  const [prevIndice, setPrevIndice] = useState<number | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const [tituloVisible, setTituloVisible] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setTituloVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  const goToSlide = (next: number) => {
    if (transitioning) return
    setTransitioning(true)
    setPrevIndice(indiceImagen)
    setIndiceImagen(next)
    setTimeout(() => {
      setPrevIndice(null)
      setTransitioning(false)
    }, 1100)
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndiceImagen(prev => {
        const next = (prev + 1) % IMAGENES_FONDO.length
        goToSlide(next)
        return prev
      })
    }, 6000)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [transitioning])

  const resetInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setIndiceImagen(prev => {
        const next = (prev + 1) % IMAGENES_FONDO.length
        goToSlide(next)
        return prev
      })
    }, 6000)
  }

  const handleGoTo = (i: number) => {
    if (i === indiceImagen || transitioning) return
    goToSlide(i)
    resetInterval()
  }

  const analizarIdea = async () => {
    if (!idea.trim()) return
    setCargando(true)
    setVeredicto('')
    setFuentes([])
    setPostsAnalizados(0)
    try {
      const res = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      })
      const data = await res.json()
      if (data.error) {
        setVeredicto(`Error: ${data.error}`)
      } else {
        setVeredicto(data.veredicto)
        setFuentes(data.fuentes || [])
        setPostsAnalizados(data.posts_analizados || 0)
      }
    } catch {
      setVeredicto('Error de conexión. Revisá tu internet.')
    }
    setCargando(false)
  }

  const sugerirIdeas = async () => {
    setCargandoSugerencias(true)
    setSugerencias([])
    try {
      const res = await fetch('/api/sugerir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      })
      const data = await res.json()
      if (data.error) {
        alert('Error al sugerir: ' + data.error)
      } else {
        setSugerencias(data.ideas || [])
      }
    } catch {
      alert('Error de conexión')
    }
    setCargandoSugerencias(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap');

        :root {
          --coral:     #FF5C3A;
          --coral-dim: #CC3D22;
          --teal:      #00D4C8;
          --teal-dim:  #00A89E;
          --lime:      #C8F135;
          --lime-dim:  #9DC217;
          --ink:       #0A0C0F;
          --ink-2:     #0F1318;
          --surface:   #141A22;
          --surface-2: #1C242F;
          --glass:     rgba(20,26,34,0.88);
          --border:    rgba(255,255,255,0.07);
          --border-h:  rgba(0,212,200,0.3);
          --text-1:    #F4F0EB;
          --text-2:    #7A8494;
          --text-3:    #3D4550;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--ink);
          font-family: 'DM Sans', sans-serif;
          color: var(--text-1);
          -webkit-font-smoothing: antialiased;
          overflow-x: hidden;
        }

        /* ─── CARRUSEL ─── */
        .carousel-wrap {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        .slide {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .slide img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          will-change: transform, opacity;
          transform-origin: center center;
        }

        .slide-active img {
          animation: kenBurns 7s ease-in-out forwards;
        }
        @keyframes kenBurns {
          from { transform: scale(1.07) translate(1%, 0.5%); }
          to   { transform: scale(1.00) translate(0%, 0%); }
        }

        .slide-enter {
          animation: enterSlide 1.1s cubic-bezier(0.16,1,0.3,1) forwards;
        }
        @keyframes enterSlide {
          from { opacity: 0; clip-path: inset(0 0 8% 0); }
          to   { opacity: 1; clip-path: inset(0 0 0% 0); }
        }

        .slide-exit {
          animation: exitSlide 1.0s cubic-bezier(0.16,1,0.3,1) forwards;
          z-index: 1;
        }
        @keyframes exitSlide {
          from { opacity: 1; clip-path: inset(0% 0 0 0); }
          to   { opacity: 0; clip-path: inset(0% 0 8% 0); }
        }

        /* Overlay: escuro pesado embaixo, leve em cima */
        .overlay-base {
          position: absolute; inset: 0;
          background:
            linear-gradient(to top,
              rgba(10,12,15,0.97) 0%,
              rgba(10,12,15,0.72) 35%,
              rgba(10,12,15,0.28) 65%,
              rgba(10,12,15,0.5) 100%),
            linear-gradient(135deg, rgba(10,12,15,0.55) 0%, transparent 55%);
        }

        /* Faixa colorida decorativa sutil na parte de baixo */
        .overlay-accent {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--coral), var(--teal), var(--lime));
          opacity: 0.7;
        }

        /* ─── TÍTULO ─── */
        .titulo-wrap {
          text-align: center;
          margin-bottom: 28px;
        }

        .titulo-row {
          display: flex;
          justify-content: center;
          flex-wrap: wrap;
          gap: 0.18em;
          margin-bottom: 18px;
        }

        .word-clip {
          display: inline-block;
          overflow: hidden;
          line-height: 1;
        }

        .word-inner {
          display: inline-block;
          opacity: 0;
          transform: translateY(110%);
          transition:
            opacity   0.65s cubic-bezier(0.16,1,0.3,1),
            transform 0.65s cubic-bezier(0.16,1,0.3,1);
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(52px, 9vw, 80px);
          font-weight: 300;
          letter-spacing: -0.02em;
        }

        /* Palavras coloridas alternadas */
        .word-inner.c0 { color: var(--text-1); }
        .word-inner.c1 {
          font-style: italic;
          color: var(--coral);
          filter: drop-shadow(0 0 24px rgba(255,92,58,0.45));
        }
        .word-inner.c2 { color: var(--text-1); }
        .word-inner.c3 {
          color: var(--teal);
          filter: drop-shadow(0 0 24px rgba(0,212,200,0.45));
        }

        .titulo-visible .word-inner { opacity: 1; transform: translateY(0); }
        .titulo-visible .word-inner:nth-child(1) { transition-delay: 0.05s; }
        .titulo-visible .word-clip:nth-child(2) .word-inner { transition-delay: 0.17s; }
        .titulo-visible .word-clip:nth-child(3) .word-inner { transition-delay: 0.29s; }
        .titulo-visible .word-clip:nth-child(4) .word-inner { transition-delay: 0.41s; }

        /* Linha decorativa tricolor */
        .titulo-line {
          display: flex;
          justify-content: center;
          gap: 4px;
          margin-bottom: 18px;
        }
        .titulo-line span {
          height: 2px;
          border-radius: 1px;
          width: 0;
          transition: width 0.9s cubic-bezier(0.16,1,0.3,1);
        }
        .titulo-visible .titulo-line span:nth-child(1) { width: 32px; background: var(--coral); transition-delay: 0.55s; }
        .titulo-visible .titulo-line span:nth-child(2) { width: 32px; background: var(--teal);  transition-delay: 0.65s; }
        .titulo-visible .titulo-line span:nth-child(3) { width: 32px; background: var(--lime);  transition-delay: 0.75s; }

        .subtitulo {
          opacity: 0;
          transform: translateY(10px);
          transition: opacity 0.7s ease, transform 0.7s ease;
          transition-delay: 0.9s;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.04em;
          color: var(--text-2);
          line-height: 1.7;
        }
        .titulo-visible .subtitulo { opacity: 1; transform: translateY(0); }

        /* ─── CARD ─── */
        .card {
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: 16px;
          backdrop-filter: blur(28px);
          -webkit-backdrop-filter: blur(28px);
          padding: 28px;
          position: relative;
          overflow: hidden;
        }

        /* Borda superior com gradiente de cores */
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--coral), var(--teal) 50%, var(--lime));
          border-radius: 16px 16px 0 0;
        }

        /* Corner decorativo */
        .card::after {
          content: '';
          position: absolute;
          bottom: -40px; right: -40px;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,212,200,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ─── INPUT ─── */
        .input-field {
          width: 100%;
          background: rgba(10,12,15,0.6);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          color: var(--text-1);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          resize: none;
          outline: none;
          transition: border-color 0.3s, box-shadow 0.3s;
          letter-spacing: 0.02em;
        }
        .input-field::placeholder {
          color: var(--text-3);
          font-style: italic;
        }
        .input-field:focus {
          border-color: rgba(0,212,200,0.4);
          box-shadow: 0 0 0 3px rgba(0,212,200,0.06);
        }

        /* ─── BOTONES ─── */
        .btn-ghost {
          width: 100%;
          margin-top: 10px;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text-2);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.06em;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .btn-ghost:hover:not(:disabled) {
          border-color: rgba(0,212,200,0.3);
          color: var(--teal);
          background: rgba(0,212,200,0.04);
        }
        .btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }

        .btn-cta {
          width: 100%;
          margin-top: 10px;
          position: relative;
          border: none;
          border-radius: 10px;
          padding: 15px 24px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 500;
          letter-spacing: 0.08em;
          cursor: pointer;
          overflow: hidden;
          background: linear-gradient(135deg, var(--coral) 0%, #FF8A5C 50%, var(--coral-dim) 100%);
          color: #fff;
          transition: all 0.35s ease;
          box-shadow: 0 4px 20px rgba(255,92,58,0.3);
        }

        .btn-cta::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--teal) 0%, #00F5E8 50%, var(--teal-dim) 100%);
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        .btn-cta span { position: relative; z-index: 1; }

        .btn-cta:hover:not(:disabled)::before { opacity: 1; }
        .btn-cta:hover:not(:disabled) {
          box-shadow: 0 6px 28px rgba(0,212,200,0.35);
          transform: translateY(-1px);
        }
        .btn-cta:active:not(:disabled) { transform: translateY(0px); }
        .btn-cta:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

        /* Pulsación sutil */
        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(255,92,58,0.3); }
          50%       { box-shadow: 0 4px 32px rgba(255,92,58,0.5); }
        }
        .btn-cta:not(:disabled):not(:hover) {
          animation: ctaPulse 2.5s ease-in-out infinite;
        }

        /* ─── SUGERENCIAS ─── */
        .sug-grid {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 14px;
          margin-bottom: 4px;
        }

        .sug-label {
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--text-3);
          margin-bottom: 10px;
        }

        .sug-card {
          width: 100%;
          text-align: left;
          background: rgba(10,12,15,0.5);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .sug-card::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 3px;
          background: linear-gradient(to bottom, var(--teal), var(--lime));
          opacity: 0;
          transition: opacity 0.3s;
        }

        .sug-card:hover { border-color: rgba(0,212,200,0.25); background: rgba(0,212,200,0.03); }
        .sug-card:hover::before { opacity: 1; }
        .sug-card:hover .sug-title { color: var(--teal); }

        .sug-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px;
          font-weight: 600;
          color: var(--text-1);
          transition: color 0.3s;
        }
        .sug-desc { font-size: 12px; color: var(--text-2); margin-top: 4px; font-weight: 300; line-height: 1.5; }
        .sug-meta { font-size: 11px; color: var(--teal-dim); margin-top: 8px; letter-spacing: 0.03em; }

        /* ─── RESULTADO ─── */
        .result-card {
          margin-top: 20px;
          background: rgba(10,12,15,0.55);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 20px;
          animation: resultIn 0.55s cubic-bezier(0.16,1,0.3,1) forwards;
          position: relative;
          overflow: hidden;
        }

        .result-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, var(--teal), var(--lime));
        }

        @keyframes resultIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .result-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px;
          font-weight: 400;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--teal);
        }

        .badge {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--lime-dim);
          background: rgba(200,241,53,0.08);
          border: 1px solid rgba(200,241,53,0.2);
          border-radius: 6px;
          padding: 3px 10px;
        }

        .result-text {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #C4C0BA;
          line-height: 1.85;
          white-space: pre-wrap;
          letter-spacing: 0.01em;
        }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          margin: 16px 0;
        }

        .fuentes-row { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .fuentes-label {
          font-size: 10px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text-3);
        }
        .fuente-chip {
          font-size: 11px;
          color: var(--text-2);
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 3px 8px;
          letter-spacing: 0.03em;
        }

        /* ─── DOTS ─── */
        .dots-row {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          margin-top: 28px;
        }

        .dot {
          border: none;
          cursor: pointer;
          height: 3px;
          border-radius: 2px;
          background: var(--text-3);
          transition: all 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        .dot.d0.active { background: var(--coral); box-shadow: 0 0 8px rgba(255,92,58,0.6); }
        .dot.d1.active { background: var(--teal);  box-shadow: 0 0 8px rgba(0,212,200,0.6); }
        .dot.d2.active { background: var(--lime);  box-shadow: 0 0 8px rgba(200,241,53,0.6); }
        .dot.d3.active { background: var(--coral); box-shadow: 0 0 8px rgba(255,92,58,0.6); }

        /* ─── EYEBROW ─── */
        .eyebrow {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 14px;
          margin-bottom: 30px;
        }
        .eyebrow-line { height: 1px; width: 36px; }
        .eyebrow-text {
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--text-3);
          font-family: 'DM Sans', sans-serif;
          font-weight: 400;
        }

        /* Glow spots de fundo */
        .bg-glow {
          position: fixed;
          border-radius: 50%;
          pointer-events: none;
          filter: blur(80px);
          opacity: 0.12;
          z-index: 1;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--text-3); border-radius: 2px; }
      `}</style>

      <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--ink)' }}>

        {/* Glows decorativos */}
        <div className="bg-glow" style={{ width: 400, height: 400, background: 'var(--coral)', top: '10%', left: '-10%' }} />
        <div className="bg-glow" style={{ width: 360, height: 360, background: 'var(--teal)', bottom: '15%', right: '-8%' }} />
        <div className="bg-glow" style={{ width: 280, height: 280, bac
