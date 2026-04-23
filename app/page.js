'use client'
import { useState } from 'react'

export default function Home() {
  const [idea, setIdea] = useState('')
  const [veredicto, setVeredicto] = useState('')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)

  const analizar = async () => {
    if (!idea) return
    setLoading(true)
    setVeredicto('')
    setEnviado(false)
    const res = await fetch('/api/analizar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea })
    })
    const data = await res.json()
    setVeredicto(data.veredicto || data.error)
    setLoading(false)
  }

  const guardarEmail = async (e) => {
    e.preventDefault()
    await fetch('https://formspree.io/f/mojypkzp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        idea_analizada: idea, 
        veredicto_ia: veredicto 
      })
    })
    setEnviado(true)
    setEmail('')
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-4">
      <div className="max-w-2xl mx-auto pt-8 pb-12">
        
        <div className="text-center mb-8">
          <div className="inline-block mb-3 px-4 py-1 bg-purple-500/20 rounded-full border border-purple-500/30">
            <span className="text-sm text-purple-300">Powered by Groq + Reddit</span>
          </div>
          <h1 className="text-5xl font-black mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Valida tu idea
          </h1>
          <p className="text-slate-400 text-lg">Descubrí si tu idea tiene futuro en 10 segundos</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-700/50 shadow-2xl shadow-purple-500/10">
          <label className="text-sm text-slate-400 mb-2 block font-medium">Describí tu idea de negocio</label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Ej: Una app para dueños de perros que conecta paseadores certificados cerca tuyo..."
            className="w-full h-36 bg-slate-900/80 rounded-2xl p-4 border border-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none resize-none text-white placeholder:text-slate-500 transition-all"
          />
          <button
            onClick={analizar}
            disabled={loading || !idea}
            className="w-full mt-5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:opacity-50 font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Analizando con IA...
              </span>
            ) : '✨ Analizar con Reddit + IA'}
          </button>
        </div>

        {veredicto && (
          <div className="mt-6 bg-slate-800/50 backdrop-blur-xl rounded-3xl p-6 md:p-8 border border-slate-700/50 shadow-2xl shadow-purple-500/10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Veredicto de la IA</h2>
            </div>
            
            <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
              <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">{veredicto}</p>
            </div>
            
            {!enviado ? (
              <form onSubmit={guardarEmail} className="mt-6 pt-6 border-t border-slate-700/50">
                <p className="text-sm text-slate-300 mb-3 font-medium">🚀 ¿Querés recibir el análisis completo + tips extra por email?</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="flex-1 bg-slate-900/80 rounded-xl px-4 py-3 border border-slate-600 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 outline-none text-white placeholder:text-slate-500 transition-all"
                  />
                  <button type="submit" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 px-6 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
                    Enviar
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-2">Sin spam. Solo ideas validadas.</p>
              </form>
            ) : (
              <div className="mt-6 pt-6 border-t border-slate-700/50">
                <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
                  <span className="text-2xl">✅</span>
                  <div>
                    <p className="text-green-400 font-bold">¡Listo! Email enviado</p>
                    <p className="text-xs text-slate-400">Revisá tu bandeja de entrada</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <p className="text-center text-xs text-slate-600 mt-8">
          Hecho con ❤️ usando Next.js + Groq + Formspree
        </p>
      </div>
    </main>
  )
    }
