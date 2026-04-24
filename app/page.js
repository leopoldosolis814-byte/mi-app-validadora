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
  const [fuentes, setFuentes] = useState([])
  const [postsAnalizados, setPostsAnalizados] = useState(0)
  const [sugerencias, setSugerencias] = useState([])
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false)
  const [indiceImagen, setIndiceImagen] = useState(0)
  const [prevIndice, setPrevIndice] = useState(null)
  const [transitioning, setTransitioning] = useState(false)
  const [tituloVisible, setTituloVisible] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setTituloVisible(true), 300)
    return () => clearTimeout(t)
  }, [])

  const goToSlide = (next) => {
    if (transitioning) return
    setTransitioning(true)
    setPrevIndice(indiceImagen)
    setIndiceImagen(next)
    setTimeout(() => {
      setPrevIndice(null)
      setTransitioning(false)
    }, 1200)
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndiceImagen(prev => {
        const next = (prev + 1) % IMAGENES_FONDO.length
        if (!transitioning) goToSlide(next)
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
        if (!transitioning) goToSlide(next)
        return prev
      })
    }, 6000)
  }

  const handleGoTo = (i) => {
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
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Outfit:wght@300;400;500;600&display=swap');

        :root {
          --bg:           #080D14;
          --surface:      rgba(11,18,32,0.88);
          --border:       rgba(255,255,255,0.07);
          --coral:        #FF5F4B;
          --coral-glow:   rgba(255,95,75,0.25);
          --mint:         #3FFFC2;
          --mint-dim:     #1DB88A;
          --mint-glow:    rgba(63,255,194,0.14);
          --violet:       #B57BFF;
          --violet-dim:   #7B4FCC;
          --amber:        #FFB830;
          --text-1:       #EEF2FA;
          --text-2:       #7A8BA8;
          --text-3:       #3A4860;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: var(--bg); font-family: 'Outfit', sans-serif; color: var(--text-1); -webkit-font-smoothing: antialiased; overflow-x: hidden; }

        .c-track { position: fixed; inset: 0; z-index: 0; }
        .c-slide  { position: absolute; inset: 0; overflow: hidden; }
        .c-slide img { width: 100%; height: 100%; object-fit: cover; object-position: center top; will-change: transform, opacity; }
        .c-slide-active img { animation: kb 8s cubic-bezier(0.25,0.46,0.45,0.94) forwards; }
        @keyframes kb { 0% { transform: scale(1.07) translateX(0px); } 100% { transform: scale(1.0) translateX(-10px); } }
        .c-slide-enter { animation: sEnter 1.2s cubic-bezier(0.22,1,0.36,1) forwards; z-index: 3; }
        @keyframes sEnter { from { opacity: 0; clip-path: inset(0 100% 0 0); } to { opacity: 1; clip-path: inset(0 0% 0 0); } }
        .c-slide-exit { animation: sExit 1.1s ease forwards; z-index: 2; }
        @keyframes sExit { from { opacity: 1; } to { opacity: 0; } }

        .ov-base { position: absolute; inset: 0; background: linear-gradient(to top, rgba(8,13,20,0.97) 0%, rgba(8,13,20,0.58) 45%, rgba(8,13,20,0.15) 75%, rgba(8,13,20,0.5) 100%), linear-gradient(to right, rgba(8,13,20,0.5) 0%, transparent 50%); }
        .ov-color { position: absolute; inset: 0; background: radial-gradient(ellipse 80% 55% at 15% 85%, rgba(255,95,75,0.13) 0%, transparent 60%), radial-gradient(ellipse 55% 45% at 85% 15%, rgba(63,255,194,0.09) 0%, transparent 55%); mix-blend-mode: screen; }
        .ov-vign { position: absolute; inset: 0; background: radial-gradient(ellipse at center, transparent 30%, rgba(8,13,20,0.42) 100%); }
        .noise { position: absolute; inset: 0; pointer-events: none; opacity: 0.03; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)'/%3E%3C/svg%3E"); background-size: 200px 200px; }

        .orb { position: fixed; border-radius: 50%; filter: blur(90px); pointer-events: none; z-index: 1; animation: orbF 9s ease-in-out infinite alternate; }
        @keyframes orbF { 0% { transform: translateY(0px) scale(1); } 100% { transform: translateY(22px) scale(1.05); } }

        .eyebrow { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 28px; opacity: 0; animation: fadeUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s forwards; }
        .ey-line { height: 1px; width: 36px; background: linear-gradient(90deg, transparent, var(--mint-dim)); }
        .ey-line.r { background: linear-gradient(90deg, var(--mint-dim), transparent); }
        .ey-txt { font-size: 10px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase; color: var(--mint-dim); }

        .title-wrap { text-align: center; margin-bottom: 28px; }
        .t-word { display: inline-block; overflow: hidden; margin-right: 0.2em; vertical-align: bottom; }
        .t-word span { display: inline-block; opacity: 0; transform: translateY(110%) rotate(3deg); transition: opacity 0.65s cubic-bezier(0.22,1,0.36,1), transform 0.65s cubic-bezier(0.22,1,0.36,1); }
        .t-vis .t-word span { opacity: 1; transform: translateY(0) rotate(0deg); }
        .t-word:nth-child(1) span { transition-delay: 0.10s; }
        .t-word:nth-child(2) span { transition-delay: 0.22s; color: var(--coral); }
        .t-word:nth-child(3) span { transition-delay: 0.34s; }
        .t-word:nth-child(4) span { transition-delay: 0.46s; color: var(--mint); }
        .t-h1 { font-family: 'Cormorant Garamond', serif; font-size: clamp(52px, 9vw, 82px); font-weight: 600; line-height: 1.0; letter-spacing: -0.02em; color: var(--text-1); }
        .t-bar { display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 14px; }
        .t-seg { height: 3px; border-radius: 99px; opacity: 0; transform: scaleX(0); transform-origin: left center; transition: transform 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease; }
        .t-vis .t-seg { opacity: 1; transform: scaleX(1); }
        .t-vis .t-seg:nth-child(1) { background: var(--coral);  width: 48px; transition-delay: 0.55s; }
        .t-vis .t-seg:nth-child(2) { background: var(--mint);   width: 20px; transition-delay: 0.65s; }
        .t-vis .t-seg:nth-child(3) { background: var(--violet); width: 12px; transition-delay: 0.72s; }
        .t-sub { font-size: 14px; font-weight: 300; letter-spacing: 0.04em; line-height: 1.7; color: var(--text-2); margin-top: 18px; opacity: 0; transform: translateY(10px); transition: opacity 0.7s ease, transform 0.7s ease; transition-delay: 0.85s; }
        .t-vis .t-sub { opacity: 1; transform: translateY(0); }

        .card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; backdrop-filter: blur(32px) saturate(180%); padding: 28px; position: relative; overflow: hidden; box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset, 0 32px 64px rgba(0,0,0,0.5), 0 0 100px rgba(63,255,194,0.04); }
        .card::before { content: ''; position: absolute; inset: 0; border-radius: 16px; padding: 1px; background: linear-gradient(135deg, rgba(63,255,194,0.2), rgba(181,123,255,0.12), rgba(255,95,75,0.16)); -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events: none; }

        .pill { display: inline-flex; align-items: center; gap: 6px; font-size: 10px; font-weight: 500; letter-spacing: 0.12em; text-transform: uppercase; color: var(--mint); background: rgba(63,255,194,0.08); border: 1px solid rgba(63,255,194,0.18); border-radius: 99px; padding: 4px 10px; margin-bottom: 16px; }
        .pill-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--mint); animation: blink 2s ease-in-out infinite; }
        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.25; } }

        .inp { width: 100%; background: rgba(8,13,20,0.7); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; color: var(--text-1); font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 300; letter-spacing: 0.01em; resize: none; outline: none; transition: border-color 0.3s, box-shadow 0.3s; }
        .inp::placeholder { color: var(--text-3); font-style: italic; }
        .inp:focus { border-color: rgba(63,255,194,0.28); box-shadow: 0 0 0 3px rgba(63,255,194,0.06); }

        .btn-ghost { width: 100%; margin-top: 10px; background: transparent; border: 1px solid var(--border); border-radius: 8px; color: var(--text-2); font-family: 'Outfit', sans-serif; font-size: 12px; font-weight: 500; letter-spacing: 0.07em; text-transform: uppercase; padding: 10px 16px; cursor: pointer; transition: all 0.25s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .btn-ghost:hover:not(:disabled) { border-color: rgba(181,123,255,0.32); color: var(--violet); background: rgba(181,123,255,0.05); }
        .btn-ghost:disabled { opacity: 0.35; cursor: not-allowed; }

        .btn-cta { width: 100%; margin-top: 10px; position: relative; overflow: hidden; background: linear-gradient(135deg, var(--coral) 0%, #FF8566 100%); border: none; border-radius: 10px; color: #fff; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; padding: 15px 24px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 24px rgba(255,95,75,0.28); }
        .btn-cta::before { content: ''; position: absolute; top: 0; left: 0; bottom: 0; width: 45%; opacity: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent); animation: ctaShim 3.5s ease-in-out 2s infinite; }
        @keyframes ctaShim { 0% { transform: translateX(-100%) skewX(-18deg); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateX(280%) skewX(-18deg); opacity: 0; } }
        .btn-cta::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(255,255,255,0.1), transparent); opacity: 0; transition: opacity 0.3s; }
        .btn-cta:hover:not(:disabled)::after { opacity: 1; }
        .btn-cta:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 36px rgba(255,95,75,0.38); }
        .btn-cta:active:not(:disabled) { transform: translateY(0); }
        .btn-cta:disabled { opacity: 0.38; cursor: not-allowed; box-shadow: none; }

        .sug-card { background: rgba(8,13,20,0.55); border: 1px solid var(--border); border-radius: 10px; padding: 14px 16px; cursor: pointer; text-align: left; width: 100%; transition: all 0.25s ease; position: relative; overflow: hidden; }
        .sug-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: linear-gradient(180deg, var(--coral), var(--violet)); border-radius: 3px 0 0 3px; opacity: 0; transition: opacity 0.25s; }
        .sug-card:hover { border-color: rgba(255,95,75,0.2); background: rgba(255,95,75,0.04); }
        .sug-card:hover::before { opacity: 1; }
        .sug-card:hover .sug-t { color: var(--coral); }
        .sug-t { font-family: 'Cormorant Garamond', serif; font-size: 17px; font-weight: 600; color: var(--text-1); transition: color 0.25s; }
        .sug-d { font-size: 12px; color: var(--text-2); margin-top: 4px; font-weight: 300; line-height: 1.5; }
        .sug-m { font-size: 11px; color: var(--violet); margin-top: 6px; font-weight: 500; }

        .res { margin-top: 20px; background: rgba(8,13,20,0.6); border: 1px solid var(--border); border-radius: 12px; padding: 22px; animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) forwards; position: relative; overflow: hidden; }
        .res::before { content: ''; position: absolute; top: 0; left: 24px; right: 24px; height: 2px; background: linear-gradient(90deg, var(--coral), var(--violet), var(--mint)); border-radius: 0 0 4px 4px; }
        .res-label { font-size: 10px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; color: var(--mint); }
        .res-posts { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: var(--amber); background: rgba(255,184,48,0.1); border: 1px solid rgba(255,184,48,0.2); border-radius: 6px; padding: 3px 10px; }
        .res-text { font-size: 13px; font-weight: 300; color: #B8C8E0; line-height: 1.85; letter-spacing: 0.01em; white-space: pre-wrap; margin-top: 14px; font-family: 'Outfit', sans-serif; }
        .div-line { height: 1px; background: linear-gradient(90deg, transparent, var(--border), transparent); margin: 16px 0; }
        .src-tag { font-size: 10px; letter-spacing: 0.06em; color: var(--text-3); background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 6px; padding: 3px 8px; font-weight: 400; }

        .dot { height: 3px; border-radius: 99px; cursor: pointer; border: none; background: var(--text-3); transition: all 0.4s cubic-bezier(0.22,1,0.36,1); }
        .dot.on { background: linear-gradient(90deg, var(--coral), var(--violet)); box-shadow: 0 0 10px rgba(255,95,75,0.4); }

        @keyframes fadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--text-3); border-radius: 99px; }
      `}</style>
<main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--bg)' }}>

        <div className="c-track">
          {IMAGENES_FONDO.map((url, i) => {
            const isActive = i === indiceImagen
            const isExiting = i === prevIndice && transitioning
            if (!isActive && !isExiting) return null
            return (
              <div key={i} className={`c-slide ${isActive ? 'c-slide-active c-slide-enter' : 'c-slide-exit'}`} style={{ zIndex: isActive ? 3 : 2 }}>
                <img src={url} alt="" />
              </div>
            )
          })}
          <div className="ov-base" />
          <div className="ov-color" />
          <div className="ov-vign" />
          <div className="noise" />
        </div>

        <div className="orb" style={{ width: 380, height: 380, top: '55%', left: '-100px', background: 'radial-gradient(circle, rgba(255,95,75,0.11) 0%, transparent 70%)', animationDuration: '10s' }} />
        <div className="orb" style={{ width: 280, height: 280, top: '8%', right: '-70px', background: 'radial-gradient(circle, rgba(63,255,194,0.09) 0%, transparent 70%)', animationDuration: '13s', animationDirection: 'alternate-reverse' }} />

        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ maxWidth: '580px', width: '100%' }}>

            <div className="eyebrow">
              <div className="ey-line" />
              <span className="ey-txt">Validación de mercado · IA</span>
              <div className="ey-line r" />
            </div>

            <div className={`title-wrap ${tituloVisible ? 't-vis' : ''}`}>
              <h1 className="t-h1">
                {TITULO_PALABRAS.map((word, i) => (
                  <span key={i} className="t-word"><span>{word}</span></span>
                ))}
              </h1>
              <div className="t-bar">
                <div className="t-seg" />
                <div className="t-seg" />
                <div className="t-seg" />
              </div>
              <p className="t-sub">24 agentes analizan Reddit y te dicen si vale la pena construirla</p>
            </div>

            <div className="card">
              <div className="pill">
                <span className="pill-dot" />
                24 agentes activos
              </div>

              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Ej: app para alquilar bicis eléctricas por hora..."
                className="inp"
                rows={3}
              />

              <button onClick={sugerirIdeas} disabled={cargandoSugerencias} className="btn-ghost">
                {cargandoSugerencias ? '✦ Generando pivots...' : idea.trim() ? '✦ Explorar 3 pivots de esta idea' : '✦ Sugerirme 3 ideas para empezar'}
              </button>

              {sugerencias.length > 0 && (
                <div style={{ marginTop: '14px', marginBottom: '4px' }}>
                  <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', marginBottom: '10px', fontWeight: 500 }}>
                    Seleccioná una idea para analizar
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {sugerencias.map((s, i) => (
                      <button key={i} onClick={() => { setIdea(`${s.titulo}: ${s.problema}`); setSugerencias([]) }} className="sug-card">
                        <div className="sug-t">{s.titulo}</div>
                        <div className="sug-d">{s.problema}</div>
                        <div className="sug-m">◆ {s.cliente} · {s.validacion}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={analizarIdea} disabled={cargando || !idea.trim()} className="btn-cta">
                {cargando ? '◌ Analizando con 24 agentes...' : '→ Validar idea con Inteligencia Artificial'}
              </button>

              {veredicto && (
                <div className="res">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="res-label">Análisis completo</span>
                    {postsAnalizados > 0 && <span className="res-posts">{postsAnalizados} posts</span>}
                  </div>
                  <pre className="res-text">{veredicto}</pre>
                  {fuentes.length > 0 && (
                    <>
                      <div className="div-line" />
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-3)', fontWeight: 500 }}>Fuentes</span>
                        {fuentes.map((f, i) => <span key={i} className="src-tag">{f}</span>)}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              {IMAGENES_FONDO.map((_, i) => (
                <button key={i} onClick={() => handleGoTo(i)} className={`dot ${i === indiceImagen ? 'on' : ''}`} style={{ width: i === indiceImagen ? '36px' : '14px' }} />
              ))}
            </div>

            <p style={{ textAlign: 'center', marginTop: '22px', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
              Powered by Groq · Reddit API
            </p>
          </div>
        </div>
      </main>
    </>
  )
              }
