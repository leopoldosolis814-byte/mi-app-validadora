export async function POST(request) {
  const { idea } = await request.json()
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{
          role: 'user',
          content: `Analiza esta idea de negocio en 3 puntos cortos: "${idea}". Da: 1.Veredicto, 2.Riesgos, 3.Siguiente paso.`
        }]
      })
    })
    
    const data = await res.json()
    const veredicto = data.choices[0].message.content
    
    return Response.json({ veredicto })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
