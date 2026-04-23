'use client'
import { useState } from 'react'
import GlassCard from '@/components/GlassCard'
import ResultView from '@/components/ResultView'
export default function Home() {
  const [idea, setIdea] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const handleAnalizar = async () => {
    setLoading(true)
    const res = await fetch('/api/analizar', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idea }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <GlassCard>
        <h1 className="text-3xl font-bold mb-4">Valida tu idea</h1>
        <textarea value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Ej: Una app para dueños de perros..." className="w-full p-3 rounded-lg bg-white/10 border border-white/20 mb-4 text-white" rows={4} />
        <button onClick={handleAnalizar} disabled={loading ||!idea} className="w-full bg-sky-500 hover:bg-sky-700 py-3 rounded-lg font-semibold disabled:opacity-50">
          {loading? 'Analizando...' : 'Analizar con Reddit + IA'}
        </button>
      </GlassCard>
      {result && <ResultView data={result} />}
    </main>
  )
  }
