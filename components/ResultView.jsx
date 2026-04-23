import GlassCard from './GlassCard'
export default function ResultView({ data }) {
  if (data.error) return <p className="text-red-500 mt-6">Error: {data.error}</p>
  return (
    <div className="mt-8 w-full max-w-2xl"><GlassCard>
      <h2 className="text-2xl font-bold mb-4">Veredicto</h2>
      <p className="text-lg mb-4">{data.veredicto}</p>
      <h3 className="font-semibold mb-2">Posts de Reddit:</h3>
      <ul className="list-disc pl-5 space-y-1">{data.posts?.map((post, i) => (<li key={i} className="text-sm text-white/70">{post}</li>))}</ul>
    </GlassCard></div>
  )
}
