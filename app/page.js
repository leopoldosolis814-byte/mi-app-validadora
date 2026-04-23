'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const IMAGENES_FONDO = [
    'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915707/Copilot_20260422_235149_gx07ic.png',
    'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915709/Copilot_20260423_000431_k2gk4n.png',
    'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915710/Copilot_20260423_000306_xucvfd.png',
    'https://res.cloudinary.com/ds2udm1nc/image/upload/v1776915712/Copilot_20260423_000714_yreyre.png',
  ]

  const TITULO = '¿Tu idea tiene futuro?'
  const SUBTITULO = '24 agentes analizan Reddit y te dicen si vale la pena construirla'

  const [idea, setIdea] = useState('')
  const [veredicto, setVeredicto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [fuentes, setFuentes] = useState([])
  const [postsAnalizados, setPostsAnalizados] = useState(0)
  const [sugerencias, setSugerencias] = useState([])
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false)
  const [indiceImagen, setIndiceImagen] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setIndiceImagen(prev => (prev + 1) % IMAGENES_FONDO.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

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
        setVeredicto(`❌ Error: ${data.error}`)
      } else {
        setVeredicto(data.veredicto)
        setFuentes(data.fuentes || [])
        setPostsAnalizados(data.posts_analizados || 0)
      }
    } catch (error) {
      setVeredicto('❌ Error de conexión. Revisá tu internet.')
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
    } catch (error) {
      alert('Error de conexión')
    }
    setCargandoSugerencias(false)
  }

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {IMAGENES_FONDO.map((url, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{
            backgroundImage: `url(${url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: i === indiceImagen ? 1 : 0,
            zIndex: -2
          }}
        />
      ))}
      
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm" style={{ zIndex: -1 }} />

      <div className="min-h-screen flex items-center justify-center p-6 relative z-10">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-4 leading-tight drop-shadow-lg">
              {TITULO}
            </h1>
            <p className="text-slate-300 text-base md:text-lg">
              {SUBTITULO}
            </p>
          </div>

          <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 shadow-2xl">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Ej: app para alquilar bicis eléctricas en Corrientes"
              className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
              rows={3}
            />

            <button 
              onClick={sugerirIdeas}
              disabled={cargandoSugerencias}
              className="w-full mt-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 font-medium py-2 px-4 rounded-xl transition text-sm"
            >
              {cargandoSugerencias
               ? '🤖 Generando pivots...'
                : idea.trim()
                 ? '✨ Dame 3 pivots de esta idea'
                  : '✨ Sugerime 3 ideas para empezar'
              }
            </button>

            {sugerencias.length > 0 && (
              <div className="mt-4 mb-4 space-y-2">
                <p className="text-xs text-slate-400 mb-2">Tocá una para analizarla:</p>
                {sugerencias.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setIdea(`${s.titulo}: ${s.problema}`)
                      setSugerencias([])
                    }}
                    className="w-full text-left bg-slate-800/60 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/50 transition group"
                  >
                    <p className="font-bold text-white text-sm group-hover:text-blue-400">{s.titulo}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.problema}</p>
                    <div className="flex gap-3 mt-2">
                      <span className="text-xs text-emerald-400">👤 {s.cliente}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">⚡ {s.validacion}</p>
                  </button>
                ))}
              </div>
            )}

            <button 
              onClick={analizarIdea}
              disabled={cargando || !idea.trim()}
              className="w-full mt-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/20"
            >
              {cargando ? '🤖 Analizando con 24 agentes...' : '🚀 Validar idea con IA'}
            </button>

            {veredicto && (
              <div className="mt-6 bg-slate-800/40 border border-slate-700/50 rounded-xl p-5 animate-in fade-in duration-500">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-blue-400">Análisis Completo</h3>
                  {postsAnalizados > 0 && (
                    <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg">
                      {postsAnalizados} posts analizados
                    </span>
                  )}
                </div>
                
                <div className="prose prose-invert prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-slate-300 text-sm leading-relaxed">
                    {veredicto}
                  </pre>
                </div>

                {fuentes.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-700/50">
                    <p className="text-xs text-slate-500 mb-2">📡 Datos extraídos de:</p>
                    <div className="flex flex-wrap gap-2">
                      {fuentes.map((f, i) => (
                        <span key={i} className="text-xs bg-slate-700/50 px-2 py-1 rounded-lg text-slate-400">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {IMAGENES_FONDO.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndiceImagen(i)}
                className={`h-2 rounded-full transition-all ${
                  i === indiceImagen ? 'bg-white w-8' : 'bg-slate-600 w-2'
                }`}
              />
            ))}
          </div>

          <p className="text-center text-slate-500 text-xs mt-6">
            Powered by Groq + Reddit • Hecho en Corrientes 🇦🇷
          </p>
        </div>
      </div>
    </main>
  )
                     }
