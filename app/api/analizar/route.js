import { NextResponse } from 'next/server'
import { buscarEnReddit } from '@/lib/reddit'
import { analizarConIA } from '@/lib/ai'
export async function POST(req) {
  try {
    const { idea } = await req.json()
    if (!idea) return NextResponse.json({ error: 'Falta la idea' }, { status: 400 })
    const posts = await buscarEnReddit(idea)
    const resultado = await analizarConIA(idea, posts)
    return NextResponse.json(resultado)
  } catch (e) { return NextResponse.json({ error: e.message }, { status: 500 }) }
}
