'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

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
  const [fuentes, setFuentes] = useState([])
  const [postsAnalizados, setPostsAnalizados] = useState(0)
  const [sugerencias, setSugerencias] = useState([])
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false)
  const [indiceImagen, setIndiceImagen] = useState(0)
  const [prevIndice, setPrevIndice] = useState(null)
  const [tituloVisible, setTituloVisible] = useState(false)

  const intervalRef = useRef(null)
  const transitioningRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => setTituloVisible(true), 200)
    return () => clearTimeout(t)
  }, [])

  const goToSlide = useCallback((next) => {
    if (transitioningRef.current) return
    transitioningRef.current = true
    setPrevIndice(indiceImagen)
    setIndiceImagen(next)
    setTimeout(() => {
      setPrevIndice(null)
      transitioningRef.current = false
    }, 1100)
  }, [indiceImagen])

  const resetInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const next = (indiceImagen + 1) % IMAGENES_FONDO.length
      goToSlide(next)
    }, 6000)
  }, [indiceImagen, goToSlide])

  useEffect(() => {
    resetInterval()
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [resetInterval])

  const handleGoTo = (i) => {
    if (i === indiceImagen || transitioningRef.current) return
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
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --gold: #C9A84C;
          --gold-light: #E8C97A;
          --gold-dim: #8A6E30;
          --obsidian: #080B0F;
          --charcoal: #0D1117;
          --surface: #111820;
          --surface-2: #161E28;
          --border: rgba(201,168,76,0.15);
          --border-hover: rgba(201,168,76,0.35);
          --text-primary: #F0EBE0;
          --text-secondary: #8A8070;
          --text-muted: #4A4540;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: var(--obsidian);
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          -webkit-font-smoothing: antialiased;
        }

      .carousel-track {
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
          transform-origin: center center;
          will-change: transform, opacity;
        }

      .slide-active img {
          animation: kenBurns 7s ease-in-out forwards;
        }

        @keyframes kenBurns {
          0% { transform: scale(1.08) translate(0%, 0%); }
          100% { transform: scale(1.0) translate(-1%, -0.5%); }
        }

      .slide-enter {
          animation: slideEnter 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideEnter {
          from { opacity: 0; transform: translateY(18px) scale(1.04); }
          to { opacity: 1; transform: translateY(0px) scale(1.0); }
        }

      .slide-exit {
          animation: slideExit 1.0s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          z-index: 1;
        }
        @keyframes slideExit {
          from { opacity: 1; transform: translateY(0px) scale(1.0); }
          to { opacity: 0; transform: translateY(-12px) scale(0.98); }
        }

      .overlay-premium {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(8,11,15,0.97) 0%, rgba(8,11,15,0.55) 40%, rgba(8,11,15,0.2) 70%, rgba(8,11,15,0.4) 100%),
            linear-gradient(135deg, rgba(8,11,15,0.6) 0%, transparent 60%);
        }

      .overlay-vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 30%, rgba(8,11,15,0.5) 100%);
        }

      .titulo-word {
          display: inline-block;
          overflow: hidden;
          margin-right: 0.25em;
        }
      .titulo-word span {
          display: inline-block;
          opacity: 0;
          transform: translateY(100%);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
      .titulo-visible.titulo-word span {
          opacity: 1;
          transform: translateY(0);
        }
      .titulo-word:nth-child(1) span { transition-delay: 0.05s; }
      .titulo-word:nth-child(2) span { transition-delay: 0.18s; }
      .titulo-word:nth-child(3) span { transition-delay: 0.31s; }
      .titulo-word:nth-child(4) span { transition-delay: 0.44s; }

      .subtitulo-anim {
          opacity: 0;
          transform: translateY(12px);
          transition: opacity 0.8s ease, transform 0.8s ease;
          transition-delay: 0.8s;
        }
      .titulo-visible.subtitulo-anim {
          opacity: 1;
          transform: translateY(0);
        }

      .linea-gold {
          width: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold), transparent);
          margin: 0 auto;
          transition: width 1.2s cubic-bezier(0.16,1,0.3,1);
          transition-delay: 0.6s;
        }
      .titulo-visible.linea-gold {
          width: 120px;
        }

      .titulo-shimmer {
          background: linear-gradient(
            90deg,
            var(--gold-dim) 0%,
            var(--gold-light) 30%,
            #FFF5D6 50%,
            var(--gold-light) 70%,
            var(--gold-dim) 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 5s linear infinite;
          animation-delay: 1.2s;
        }
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
      }
      .card-main {
          background: linear-gradient(145deg, rgba(22,30,40,0.92), rgba(13,17,23,0.96));
          border: 1px solid var(--border);
          border-radius: 2px;
          backdrop-filter: blur(24px);
          position: relative;
          overflow: hidden;
        }
      .card-main::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--gold-dim), var(--gold), var(--gold-dim), transparent);
        }

      .input-premium {
          width: 100%;
          background: rgba(8,11,15,0.6);
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 14px 16px;
          color: var(--text-primary);
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.02em;
          resize: none;
          outline: none;
          transition: border-color 0.3s ease;
        }
      .input-premium::placeholder { color: var(--text-muted); font-style: italic; }
      .input-premium:focus { border-color: var(--border-hover); }

      .btn-secondary {
          width: 100%;
          background: transparent;
          border: 1px solid var(--border);
          border-radius: 2px;
          color: var(--text-secondary);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 400;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          padding: 10px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 10px;
        }
      .btn-secondary:hover:not(:disabled) {
          border-color: var(--border-hover);
          color: var(--gold-light);
          background: rgba(201,168,76,0.04);
        }
      .btn-secondary:disabled { opacity: 0.4; cursor: not-allowed; }

      .btn-primary {
          width: 100%;
          position: relative;
          background: transparent;
          border: 1px solid var(--gold-dim);
          border-radius: 2px;
          color: var(--gold-light);
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 14px 24px;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.4s ease;
          margin-top: 10px;
        }
      .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(201,168,76,0.0), rgba(201,168,76,0.12));
          opacity: 0;
          transition: opacity 0.4s ease;
        }
      .btn-primary:hover:not(:disabled)::before { opacity: 1; }
      .btn-primary:hover:not(:disabled) {
          border-color: var(--gold);
          color: #FFF5D6;
          box-shadow: 0 0 24px rgba(201,168,76,0.15), inset 0 0 24px rgba(201,168,76,0.05);
        }
      .btn-primary:disabled { opacity: 0.35; cursor: not-allowed; }

        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 rgba(201,168,76,0); }
          50% { box-shadow: 0 0 20px 4px rgba(201,168,76,0.18); }
        }
      .btn-primary:not(:disabled):not(:hover) {
          animation: goldPulse 3s ease-in-out infinite;
        }

      .sugerencia-card {
          background: rgba(8,11,15,0.5);
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 14px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
          width: 100%;
        }
      .sugerencia-card:hover {
          border-color: var(--border-hover);
          background: rgba(201,168,76,0.04);
        }
      .sugerencia-card:hover.sug-title { color: var(--gold-light); }

      .sug-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          transition: color 0.3s;
        }
      .sug-desc { font-size: 12px; color: var(--text-secondary); margin-top: 4px; font-weight: 300; }
      .sug-meta { font-size: 11px; color: var(--gold-dim); margin-top: 6px; letter-spacing: 0.04em; }

      .resultado-card {
          margin-top: 20px;
          background: rgba(8,11,15,0.5);
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 20px;
          animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards;
          position: relative;
        }
      .resultado-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent);
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

      .resultado-titulo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 13px;
          font-weight: 400;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold);
        }

      .resultado-texto {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 300;
          color: #C8C0B0;
          line-height: 1.8;
          letter-spacing: 0.01em;
          white-space: pre-wrap;
        }

      .badge-posts {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--gold-dim);
          border: 1px solid var(--border);
          border-radius: 2px;
          padding: 3px 8px;
        }

      .fuente-tag {
          font-size: 10px;
          letter-spacing: 0.06em;
          color: var(--text-muted);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 2px;
          padding: 3px 8px;
          background: rgba(255,255,255,0.02);
        }

      .dot-btn {
          border: none;
          cursor: pointer;
          border-radius: 1px;
          height: 2px;
          background: var(--text-muted);
          transition: all 0.4s ease;
        }
      .dot-btn.active {
          background: var(--gold);
          box-shadow: 0 0 8px rgba(201,168,76,0.5);
        }

      .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--border), transparent);
          margin: 16px 0;
        }

        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--gold-dim); border-radius: 2px; }
      `}</style>

      <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--obsidian)' }}>
        <div className="carousel-track">
          {IMAGENES_FONDO.map((url, i) => {
            const isActive = i === indiceImagen
            const isExiting = i === prevIndice && transitioningRef.current
            if (!isActive &&!isExiting) return null
            return (
              <div
                key={i}
                className={`slide ${isActive? 'slide-active slide-enter' : 'slide-exit'}`}
                style={{ zIndex: isActive? 2 : 1 }}
              >
                <img
                  src={url}
                  alt=""
                  loading={i === 0? "eager" : "lazy"}
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
            )
          })}
          <div className="overlay-premium" />
          <div className="overlay-vignette" />
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.025,
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")',
            backgroundSize: '128px 128px',
          }} />
        </div>

        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '40px 20px', position: 'relative', zIndex: 10
        }}>
          <div style={{ maxWidth: '580px', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, transparent, var(--gold-dim))' }} />
              <span style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold-dim)', fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}>
                Validación de mercado
              </span>
              <div style={{ height: '1px', width: '40px', background: 'linear-gradient(90deg, var(--gold-dim), transparent)' }} />
            </div>

            <div className={tituloVisible? 'titulo-visible' : ''} style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(48px, 8vw, 76px)',
                fontWeight: 300,
                lineHeight: 1.05,
                letterSpacing: '-0.01em',
                marginBottom: '16px',
              }}>
                {TITULO_PALABRAS.map((word, i) => (
                  <span key={i} className="titulo-word">
                    <span className="titulo-shimmer">{word}</span>
                  </span>
                ))}
              </h1>

              <div className="linea-gold" />

              <p className="subtitulo-anim" style={{
                marginTop: '20px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
                fontWeight: 300,
                letterSpacing: '0.06em',
                color: 'var(--text-secondary)',
                lineHeight: 1.7,
              }}>
                24 agentes analizan Reddit y te dicen si vale la pena construirla
              </p>
            </div>

            <div className="card-main" style={{ padding: '28px' }}>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ej: app para alquilar bicis eléctricas por hora..."
                className="input-premium"
                rows={3}
              />

              <button
                onClick={sugerirIdeas}
                disabled={cargandoSugerencias}
                className="btn-secondary"
              >
                {cargandoSugerencias? 'Generando ideas...' : 'Sugerir ideas'}
              </button>

              <button
                onClick={analizarIdea}
                disabled={cargando ||!idea.trim()}
                className="btn-primary"
              >
                {cargando? 'Analizando...' : 'Validar mi idea'}
              </button>

              {sugerencias.length > 0 && (
                <>
                  <div className="divider" />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sugerencias.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setIdea(s.title)}
                        className="sugerencia-card"
                      >
                        <div className="sug-title">{s.title}</div>
                        <div className="sug-desc">{s.desc}</div>
                        <div className="sug-meta">{s.meta}</div>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {veredicto && (
                <div className="resultado-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div className="resultado-titulo">Veredicto</div>
                    {postsAnalizados > 0 && (
                      <div className="badge-posts">{postsAnalizados} posts</div>
                    )}
                  </div>
                  <p className="resultado-texto">{veredicto}</p>
                  {fuentes.length > 0 && (
                    <>
                      <div className="divider" />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {fuentes.map((f, i) => (
                          <span key={i} className="fuente-tag">{f}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '40px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 20
        }}>
          {IMAGENES_FONDO.map((_, i) => (
            <button
              key={i}
              onClick={() => handleGoTo(i)}
              className={`dot-btn ${i === indiceImagen? 'active' : ''}`}
              style={{ width: '32px' }}
              aria-label={`Ir a slide ${i + 1}`}
            />
          ))}
        </div>
      </main>
    </>
  )
  }
