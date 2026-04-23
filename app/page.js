'use client'
import { useState } from 'react'

export default function Home() {
  const [idea, setIdea] = useState('')
  const [veredicto, setVeredicto] = useState('')
  const [cargando, setCargando] = useState(false)
  const [fuentes, setFuentes] = useState([])
  const [postsAnalizados, setPostsAnalizados] = useState(0)
  const [sugerencias, setSugerencias] = useState([])
  const [cargandoSugerencias, setCargandoSugerencias] = useState(false)

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
      const res = await fetch('/api/sugerir')
      const data = await res.json()
      
      if (data.error) {
        alert('Error al sugerir ideas: ' + data.error)
      } else {
        setSugerencias(data.ideas || [])
      }
    } catch (error) {
      alert('Error de conexión')
    }
    
    setCargandoSugerencias(false)
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2">
            Validador de Ideas IA
          </h1>
          <p className="text-slate-400 text-sm">
            24 agentes analizan Reddit para validar tu idea en 5 segundos
          </p>
        </div>

        <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ej: app para alquilar bicis eléctricas en Corrientes"
            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition resize-none"
            rows={3}
          />

          <button 
            onClick={sugerirIdeas}
            disabled={cargandoSugerencias}
            className="w-full mt-3 bg-slate-700/50 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-300 font-medium py-2 px-4 rounded-xl transition text-sm"
          >
            {cargandoSugerencias ? '🤖 Buscando ideas con demanda...' : '✨ Sugerime 3 ideas con demanda'}
          </button>

          {sugerencias.length > 0 && (
            <div className="mt-4 mb-4 space-y-2">
              <p className="text-xs text-slate-500 mb-2">Tocá una para analizarla:</p>
              {sugerencias.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setIdea(`${s.titulo}: ${s.problema}`)
                    setSugerencias([])
                  }}
                  className="w-full text-left bg-slate-800/50 hover:bg-slate-800 p-3 rounded-xl border border-slate-700/50 transition group"
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
            className="w-full mt-3 bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl transition transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {cargando ? '🤖 Analizando con 24 agentes...' : '🚀 Validar idea con IA'}
          </button>

          {veredicto && (
            <div className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5">
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

        <p className="text-center text-slate-600 text-xs mt-6">
          Powered by Groq + Reddit • Hecho en Corrientes 🇦🇷
        </p>
      </div>
    </main>
  )
    }
