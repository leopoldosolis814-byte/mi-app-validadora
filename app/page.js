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

  // --- CONFIGURACIÓN FORMSPREE ---
  // Reemplaza 'TU_ID_DE_FORMSPREE' con el ID que te da Formspree
  const FORMSPREE_ID = "TU_ID_DE_FORMSPREE" 

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

  // Carrusel Automático [cite: 4, 5]
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

  const handleGoTo = (i: number) => {
    if (i === indiceImagen || transitioning) return
    goToSlide(i)
  }

  const analizarIdea = async () => {
    if (!idea.trim()) return
    setCargando(true)
    
    try {
      // Enviar a Formspree (opcional, para guardar qué ideas busca la gente)
      fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea_analizada: idea })
      }).catch(err => console.log("Formspree error silent fail", err))

      // Análisis original [cite: 7]
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
      setSugerencias(data.ideas || [])
    } catch {
      alert('Error de conexión')
    }
    setCargandoSugerencias(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');

        :root {
          --primary: #6366F1;
          --secondary: #F43F5E;
          --accent: #10B981;
          --glass: rgba(255, 255, 255, 0.9);
          --text: #1E293B;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: #f0f2f5; color: var(--text); }

        .carousel-container { position: fixed; inset: 0; z-index: 0; }
        .slide { position: absolute; inset: 0; opacity: 0; transition: opacity 1.1s ease-in-out; }
        .slide.active { opacity: 1; z-index: 2; }
        .slide img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.9); }

        .main-overlay {
          position: absolute; inset: 0; z-index: 3;
          background: linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(244,63,94,0.1) 100%);
          backdrop-filter: blur(2px);
        }

        .content-wrapper {
          position: relative; z-index: 10; min-height: 100vh;
          display: flex; align-items: center; justify-content: center; padding: 20px;
        }

        .glass-card {
          background: var(--glass);
          backdrop-filter: blur(15px);
          border: 1px solid rgba(255,255,255,0.4);
          border-radius: 32px;
          padding: 40px;
          width: 100%; maxWidth: 550px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
          text-align: center;
        }

        .title-gradient {
          font-family: 'Outfit', sans-serif; font-weight: 800;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          font-size: clamp(32px, 8vw, 56px); margin-bottom: 10px;
        }

        .input-premium {
          width: 100%; background: white; border: 2px solid #E2E8F0;
          border-radius: 18px; padding: 18px; font-size: 16px; margin: 20px 0;
          transition: all 0.3s; resize: none; outline: none;
        }
        .input-premium:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }

        .btn-main {
          width: 100%; background: linear-gradient(135deg, var(--primary), #4F46E5);
          color: white; border: none; border-radius: 18px; padding: 18px;
          font-size: 16px; font-weight: 700; cursor: pointer; transition: 0.3s;
        }
        .btn-main:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99,102,241,0.3); }

        .btn-ghost {
          background: none; border: 2px solid #E2E8F0; color: var(--primary);
          border-radius: 18px; padding: 12px; width: 100%; font-weight: 600;
          cursor: pointer; margin-bottom: 10px; transition: 0.3s;
        }
        .btn-ghost:hover { background: #f5f3ff; border-color: var(--primary); }

        .result-box {
          margin-top: 25px; padding: 20px; background: #F8FAFC;
          border-radius: 20px; border: 1px solid #E2E8F0; text-align: left;
          animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .dot {
          width: 8px; height: 8px; border-radius: 50%; background: #CBD5E1;
          border: none; cursor: pointer; transition: 0.3s;
        }
        .dot.active { width: 24px; border-radius: 4px; background: var(--primary); }
      `}</style>

      <main>
        {/* CARRUSEL [cite: 104, 105] */}
        <div className="carousel-container">
          {IMAGENES_FONDO.map((url, i) => (
            <div key={i} className={`slide ${i === indiceImagen ? 'active' : ''}`}>
              <img src={url} alt="" />
            </div>
          ))}
          <div className="main-overlay" />
        </div>

        <div className="content-wrapper">
          <div className="glass-card">
            <h1 className="title-gradient">¿Tu idea tiene futuro?</h1>
            <p style={{ color: '#64748B', fontWeight: 500 }}>Validación premium con 24 agentes de IA analizando Reddit.</p>

            <textarea
              className="input-premium"
              placeholder="Ej: Una app para paseadores de perros con GPS..."
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              rows={3}
            />

            <button onClick={sugerirIdeas} disabled={cargandoSugerencias} className="btn-ghost">
              {cargandoSugerencias ? '✨ Generando...' : '💡 Sugerir variaciones'}
            </button>

            {sugerencias.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                {sugerencias.map((s, i) => (
                  <div key={i} onClick={() => setIdea(`${s.titulo}: ${s.problema}`)} 
                    style={{ cursor: 'pointer', padding: '10px', background: 'white', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '13px' }}>
                    <strong>{s.titulo}</strong>
                  </div>
                ))}
              </div>
            )}

            <button className="btn-main" onClick={analizarIdea} disabled={cargando || !idea.trim()}>
              {cargando ? '🕵️‍♂️ Investigando en Reddit...' : '→ Validar ahora'}
            </button>

            {veredicto && (
              <div className="result-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: var(--secondary) }}>ANÁLISIS FINAL</span>
                  <span style={{ fontSize: '11px', color: '#94A3B8' }}>{postsAnalizados} fuentes</span>
                </div>
                <div style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{veredicto}</div>
              </div>
            )}

            {/* DOTS [cite: 132, 133] */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px' }}>
              {IMAGENES_FONDO.map((_, i) => (
                <button key={i} className={`dot ${i === indiceImagen ? 'active' : ''}`} onClick={() => handleGoTo(i)} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  )
            }
