'use client'
import { useState, useEffect, useRef } from 'react'

const IMAGENES_FONDO = [
  'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915707/Copilot_20260422_235149_gx07ic.png',
  'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915709/Copilot_20260423_000431_k2gk4n.png',
  'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915710/Copilot_20260423_000306_xucvfd.png',
  'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915712/Copilot_20260423_000714_yreyre.png',
] [cite: 1]

const TITULO_PALABRAS = ['¿Tu', 'idea', 'tiene', 'futuro?'] [cite: 1]

export default function Home() {
  const [idea, setIdea] = useState('') [cite: 1]
  const [veredicto, setVeredicto] = useState('') [cite: 1]
  const [cargando, setCargando] = useState(false) [cite: 1]
  const [fuentes, setFuentes] = useState<string[]>([]) [cite: 1]
  const [postsAnalizados, setPostsAnalizados] = useState(0) [cite: 1]
  const [sugerencias, setSugerencias] = useState<any[]>([]) [cite: 1]
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false) [cite: 1]
  const [indiceImagen, setIndiceImagen] = useState(0) [cite: 1]
  const [prevIndice, setPrevIndice] = useState<number | null>(null) [cite: 1, 2]
  const [transitioning, setTransitioning] = useState(false) [cite: 2]
  const [tituloVisible, setTituloVisible] = useState(false) [cite: 2]
  const intervalRef = useRef<NodeJS.Timeout | null>(null) [cite: 2]

  useEffect(() => {
    const t = setTimeout(() => setTituloVisible(true), 200) [cite: 3]
    return () => clearTimeout(t) [cite: 3]
  }, [])

  const goToSlide = (next: number) => {
    if (transitioning) return [cite: 3]
    setTransitioning(true) [cite: 3]
    setPrevIndice(indiceImagen) [cite: 3]
    setIndiceImagen(next) [cite: 3]
    setTimeout(() => {
      setPrevIndice(null) [cite: 3]
      setTransitioning(false) [cite: 3]
    }, 1100) [cite: 3]
  }

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndiceImagen(prev => {
        const next = (prev + 1) % IMAGENES_FONDO.length [cite: 4]
        goToSlide(next) [cite: 4]
        return prev [cite: 4]
      })
    }, 6000) [cite: 4]
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) } [cite: 4]
  }, [transitioning])

  const handleGoTo = (i: number) => {
    if (i === indiceImagen || transitioning) return [cite: 5, 6]
    goToSlide(i) [cite: 6]
    if (intervalRef.current) clearInterval(intervalRef.current) [cite: 4]
    intervalRef.current = setInterval(() => {
      setIndiceImagen(prev => {
        const next = (prev + 1) % IMAGENES_FONDO.length [cite: 5]
        goToSlide(next) [cite: 5]
        return prev [cite: 5]
      })
    }, 6000) [cite: 5]
  }

  const analizarIdea = async () => {
    if (!idea.trim()) return [cite: 6]
    setCargando(true) [cite: 6]
    setVeredicto('') [cite: 6]
    setFuentes([]) [cite: 6]
    setPostsAnalizados(0) [cite: 6]
    try {
      const res = await fetch('/api/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }) [cite: 6]
      })
      const data = await res.json() [cite: 7]
      if (data.error) {
        setVeredicto(`Error: ${data.error}`) [cite: 7]
      } else {
        setVeredicto(data.veredicto) [cite: 7]
        setFuentes(data.fuentes || []) [cite: 7]
        setPostsAnalizados(data.posts_analizados || 0) [cite: 7]
      }
    } catch {
      setVeredicto('Error de conexión. Revisá tu internet.') [cite: 7]
    }
    setCargando(false) [cite: 7]
  }

  const sugerirIdeas = async () => {
    setCargandoSugerencias(true) [cite: 8]
    setSugerencias([]) [cite: 8]
    try {
      const res = await fetch('/api/sugerir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }) [cite: 8]
      })
      const data = await res.json() [cite: 8]
      if (data.error) {
        alert('Error al sugerir: ' + data.error) [cite: 8]
      } else {
        setSugerencias(data.ideas || []) [cite: 9, 10]
      }
    } catch {
      alert('Error de conexión') [cite: 10]
    }
    setCargandoSugerencias(false) [cite: 10]
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=Plus+Jakarta+Sans:wght@300;400;600;700&display=swap');

        :root {
          --primary: #6366F1; /* Violeta Eléctrico */
          --secondary: #F43F5E; /* Coral */
          --accent: #10B981; /* Esmeralda */
          --bg-soft: #F8FAFC;
          --glass-bg: rgba(255, 255, 255, 0.85);
          --glass-border: rgba(255, 255, 255, 0.4);
          --text-main: #1E293B;
          --text-muted: #64748B;
        } [cite: 11]

        body {
          background: #EEF2FF;
          font-family: 'Plus Jakarta Sans', sans-serif;
          color: var(--text-main);
          -webkit-font-smoothing: antialiased;
        } [cite: 12]

        .carousel-track { position: fixed; inset: 0; z-index: 0; } [cite: 13, 14]
        .slide { position: absolute; inset: 0; overflow: hidden; } [cite: 14, 15]
        .slide img { width: 100%; height: 100%; object-fit: cover; } [cite: 15, 16]
        
        .slide-active img { animation: zoomIn 8s ease-out forwards; } [cite: 17]
        @keyframes zoomIn { from { transform: scale(1.15); } to { transform: scale(1); } } [cite: 18, 19]

        .overlay-vibrant {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(244, 63, 94, 0.1) 100%);
          backdrop-filter: saturate(1.2);
        } [cite: 27, 28]

        .card-glass {
          background: var(--glass-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.08);
          position: relative;
          overflow: hidden;
        } [cite: 50, 51]

        .titulo-vibrant {
          font-family: 'Outfit', sans-serif;
          font-weight: 800;
          background: linear-gradient(to right, var(--primary), var(--secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
        } [cite: 45, 46, 111]

        .input-fun {
          width: 100%;
          background: white;
          border: 2px solid #E2E8F0;
          border-radius: 16px;
          padding: 16px;
          font-size: 16px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        } [cite: 54, 55, 56]
        .input-fun:focus { border-color: var(--primary); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(99,102,241,0.1); } [cite: 58]

        .btn-vibrant {
          background: linear-gradient(135deg, var(--primary) 0%, #4F46E5 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 15px -3px rgba(99,102,241,0.3);
        } [cite: 64, 65, 66]
        .btn-vibrant:hover:not(:disabled) { transform: scale(1.02); box-shadow: 0 20px 25px -5px rgba(99,102,241,0.4); } [cite: 70, 71]

        .btn-pivot {
          background: white;
          border: 2px solid #E2E8F0;
          color: var(--primary);
          border-radius: 16px;
          padding: 12px;
          font-weight: 600;
          transition: all 0.3s;
        } [cite: 59, 60, 61]
        .btn-pivot:hover { border-color: var(--primary); background: #F5F3FF; } [cite: 62]

        .resultado-anim {
          background: #F8FAFC;
          border-radius: 20px;
          padding: 20px;
          border: 1px solid #E2E8F0;
          animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        } [cite: 83, 84]
        @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } } [cite: 87, 88]

        .dot-vibrant {
          height: 8px; width: 8px;
          border-radius: 4px;
          background: #CBD5E1;
          transition: all 0.4s ease;
        } [cite: 97, 98]
        .dot-vibrant.active { width: 24px; background: var(--primary); } [cite: 99, 134]
      `}</style>

      <main style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <div className="carousel-track">
          {IMAGENES_FONDO.map((url, i) => (
            (i === indiceImagen || (i === prevIndice && transitioning)) && (
              <div key={i} className={`slide ${i === indiceImagen ? 'slide-active slide-enter' : 'slide-exit'}`}>
                <img src={url} alt="" style={{ opacity: 0.6 }} />
              </div>
            ) [cite: 104, 105]
          ))}
          <div className="overlay-vibrant" /> [cite: 105]
        </div>

        <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', padding: '20px' }}>
          <div style={{ maxWidth: '540px', width: '100%', textAlign: 'center' }}>
            
            <div style={{ display: 'inline-block', padding: '6px 16px', background: 'white', borderRadius: '100px', marginBottom: '24px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>✨ VALIDACIÓN CON IA</span> [cite: 108, 109]
            </div>

            <h1 className="titulo-vibrant" style={{ fontSize: 'clamp(40px, 8vw, 64px)', lineHeight: 1.1, marginBottom: '16px' }}>
              ¿Tu idea tiene <br/> futuro?
            </h1> [cite: 110, 111]

            <p style={{ color: 'var(--text-muted)', fontSize: '16px', marginBottom: '32px', fontWeight: 500 }}>
              24 agentes exploran Reddit por vos. 🚀
            </p> [cite: 113, 114]

            <div className="card-glass" style={{ padding: '32px' }}>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Describe tu app mágica aquí..."
                className="input-fun"
                rows={3}
              /> [cite: 115, 116]

              <button onClick={sugerirIdeas} disabled={cargandoSugerencias} className="btn-pivot" style={{ width: '100%', marginTop: '12px' }}>
                {cargandoSugerencias ? 'Buscando inspiración...' : '💡 Explorar 3 variaciones'}
              </button> [cite: 117, 118, 119]

              {sugerencias.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                  {sugerencias.map((s, i) => (
                    <button key={i} onClick={() => { setIdea(`${s.titulo}: ${s.problema}`); setSugerencias([]) }} 
                      style={{ padding: '12px', textAlign: 'left', borderRadius: '12px', border: '1px solid #E2E8F0', background: 'white', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '14px' }}>{s.titulo}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.problema}</div>
                    </button> [cite: 121, 122, 123]
                  ))}
                </div>
              )}

              <button onClick={analizarIdea} disabled={cargando || !idea.trim()} className="btn-vibrant" style={{ width: '100%', marginTop: '20px' }}>
                {cargando ? '🕵️‍♂️ Analizando la red...' : '¡Validar mi idea ahora!'}
              </button> [cite: 124, 125, 126]

              {veredicto && (
                <div className="resultado-anim" style={{ marginTop: '24px', textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 800, fontSize: '12px', color: 'var(--secondary)' }}>EL VEREDICTO</span>
                    <span style={{ fontSize: '11px', background: '#E0F2FE', color: '#0369A1', padding: '2px 8px', borderRadius: '4px' }}>{postsAnalizados} posts</span> [cite: 127]
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', fontSize: '14px', lineHeight: 1.6, fontFamily: 'inherit' }}>{veredicto}</pre> [cite: 128]
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
              {IMAGENES_FONDO.map((_, i) => (
                <button key={i} onClick={() => handleGoTo(i)} className={`dot-vibrant ${i === indiceImagen ? 'active' : ''}`} style={{ border: 'none', cursor: 'pointer' }} />
              ))} [cite: 132, 133, 134]
            </div>

            <p style={{ marginTop: '40px', fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.3)', letterSpacing: '0.1em' }}>
              GROQ • REDDIT API • NEXT.JS
            </p> [cite: 135]
          </div>
        </div>
      </main>
    </>
  )
          }
