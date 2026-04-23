export async function GET() {
  try {
    const systemPrompt = `
Sos un analista de tendencias de startups.
Tu trabajo es encontrar nichos con demanda real en 2026.
Das ideas específicas, no genéricas tipo "app de fitness".
`;

    const userPrompt = `
Dame 3 ideas de micro-SaaS o negocios online que cumplan:

1. Poca competencia en Latam
2. Se puede validar en 1 semana sin código
3. Mercado que ya gasta plata en resolverlo
4. Basado en problemas que la gente comenta en Reddit/Twitter

Formato: devolvé SOLO un array JSON así:
[
  {
    "titulo": "Nombre corto de la idea",
    "problema": "Qué dolor específico resuelve en 1 línea",
    "cliente": "Quién paga exactamente",
    "validacion": "Cómo validar en 48hs sin código"
  }
]

Sin texto extra, solo el JSON.
`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.9 // Alta para que varíe cada vez
      })
    })
    
    const data = await groqRes.json()
    const texto = data.choices[0].message.content
    
    // Extraer el JSON de la respuesta
    const jsonMatch = texto.match(/\[[\s\S]*\]/)
    const ideas = jsonMatch? JSON.parse(jsonMatch[0]) : []
    
    return Response.json({ ideas })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
