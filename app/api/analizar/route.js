export async function POST(request) {
  const { idea } = await request.json()
  
  try {
    // 1. Queries más simples que sí matchean en Reddit
    const agentes = [
      `${idea}`,
      `${idea} problem`,
      `${idea} alternative`,
      `${idea} startup`,
      `${idea} app`,
      `building ${idea}`,
      `anyone use ${idea}`,
      `${idea} review`
    ]

    console.log('Buscando:', idea)

    // 2. Mejor User-Agent + delay para no ban
    const promesasReddit = agentes.map((query, i) => 
      new Promise(resolve => setTimeout(() => {
        fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=5&sort=top&t=all`, {
          headers: { 
            'User-Agent': 'Mozilla/5.0 (compatible; IdeaValidator/1.0; +https://tudominio.com)'
          }
        })
       .then(r => {
          console.log(`Agente ${i} status:`, r.status)
          return r.json()
        })
       .then(resolve)
       .catch(err => {
          console.log(`Agente ${i} error:`, err.message)
          resolve(null)
        })
      }, i * 200)) // 200ms entre requests
    )

    const resultados = await Promise.all(promesasReddit)
    
    // 3. Extraer posts con más datos
    const todosLosPosts = []
    resultados.forEach((data, i) => {
      if (data?.data?.children?.length > 0) {
        console.log(`Agente ${i} encontró:`, data.data.children.length)
        data.data.children.forEach(post => {
          if (post.data.title && post.data.ups > 0) { // Filtrar posts vacíos
            todosLosPosts.push({
              titulo: post.data.title,
              subreddit: post.data.subreddit,
              upvotes: post.data.ups,
              comentarios: post.data.num_comments,
              url: `https://reddit.com${post.data.permalink}`
            })
          }
        })
      }
    })

    const postsUnicos = [...new Map(todosLosPosts.map(p => [p.titulo, p])).values()].slice(0, 30)
    
    console.log('Total posts únicos:', postsUnicos.length)

    // 4. Si no hay posts, avisarle a Groq que improvise
    const contextoReddit = postsUnicos.length > 0 
    ? postsUnicos.map(p => `r/${p.subreddit} [${p.upvotes}↑ ${p.comentarios} comments]: ${p.titulo}`).join('\n')
      : `No se encontraron posts específicos sobre "${idea}" en Reddit. Analizá basándote en tendencias generales de startups y tu conocimiento del mercado.`

    const systemPrompt = `
Sos un inversor experto en startups.
Sos directo, crítico y basado en datos.
No das consejos genéricos.
Si no hay datos de Reddit, usa tu conocimiento general pero aclará que es estimación sin datos.
`;

    const userPrompt = `
Idea: ${idea}

EVIDENCIA DE REDDIT:
${contextoReddit}

Posts analizados: ${postsUnicos.length}
Timestamp: ${new Date().toISOString()}

Analizá esta idea y devolvé SOLO en este formato:

🧠 Veredicto
- Score: X/10
- Riesgo: Bajo / Medio / Alto
- Tipo: (innovadora / saturada / nicho / tendencia)
- Datos usados: ${postsUnicos.length > 0? 'Reales de Reddit' : 'Estimación sin datos de Reddit'}

📊 Evidencia de mercado
- Qué ya existe similar
- Qué dicen los usuarios (si hay posts) o qué dirían típicamente

⚠️ Problemas críticos
- Punto 1
- Punto 2
- Punto 3

💡 Oportunidades
- Punto 1
- Punto 2
- Punto 3

🚀 Recomendación final
- (Construir / No construir / Pivotear)
- Explicación corta y directa
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
        temperature: 0.7 // Más variedad
      })
    })
    
    const data = await groqRes.json()
    
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 })
    }
    
    const veredicto = data.choices[0].message.content
    
    return Response.json({ 
      veredicto,
      agentes_usados: 8,
      posts_analizados: postsUnicos.length,
      fuentes: [...new Set(postsUnicos.map(p => `r/${p.subreddit}`))],
      debug: postsUnicos.length === 0? 'No se encontraron posts en Reddit' : 'OK'
    })
    
  } catch (error) {
    console.error('Error:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
