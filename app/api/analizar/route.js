export async function POST(request) {
  const { idea } = await request.json()
  
  try {
    // 1. 24 agentes buscan en Reddit en paralelo
    const agentes = [
      `"${idea}" problema`, `"${idea}" odio`, `"${idea}" frustrante`,
      `"${idea}" uso`, `"${idea}" app para`, `"${idea}" herramienta`,
      `"${idea}" pagar`, `"${idea}" precio`, `"${idea}" gratis vs pago`,
      `"${idea}" alternativa`, `"${idea}" mejor que`, `"${idea}" vs`,
      `"${idea}" no funciona`, `"${idea}" intenté`, `"${idea}" abandoné`,
      `"${idea}" cuántos`, `"${idea}" gente usa`, `"${idea}" popular`,
      `site:reddit.com/r/startups "${idea}"`,
      `site:reddit.com/r/entrepreneur "${idea}"`,
      `site:reddit.com/r/smallbusiness "${idea}"`,
      `site:reddit.com/r/SideProject "${idea}"`,
      `site:reddit.com/r/marketing "${idea}"`,
      `site:reddit.com/r/sales "${idea}"`
    ]

    const promesasReddit = agentes.map(query => 
      fetch(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=3&sort=relevance`, {
        headers: { 'User-Agent': 'IdeaValidator/1.0' }
      }).then(r => r.json()).catch(() => null)
    )

    const resultados = await Promise.all(promesasReddit)
    
    // 2. Extraer posts únicos
    const todosLosPosts = []
    resultados.forEach(data => {
      if (data?.data?.children) {
        data.data.children.forEach(post => {
          todosLosPosts.push({
            titulo: post.data.title,
            subreddit: post.data.subreddit,
            upvotes: post.data.ups,
            comentarios: post.data.num_comments,
            texto: post.data.selftext?.slice(0, 150) || ''
          })
        })
      }
    })

    const postsUnicos = [...new Map(todosLosPosts.map(p => [p.titulo, p])).values()].slice(0, 30)
    
    const contextoReddit = postsUnicos.length > 0 
      ? postsUnicos.map(p => `r/${p.subreddit} [${p.upvotes}↑ ${p.comentarios} comments]: ${p.titulo}`).join('\n')
      : 'No se encontraron posts relevantes en Reddit.'

    // 3. Tu systemPrompt + userPrompt con datos de 24 agentes
    const systemPrompt = `
Sos un inversor experto en startups.
Sos directo, crítico y basado en datos.
No das consejos genéricos.
Analizaste Reddit con 24 agentes de investigación.
`;

    const userPrompt = `
Idea: ${idea}

EVIDENCIA DE 24 AGENTES EN REDDIT:
${contextoReddit}

Posts analizados: ${postsUnicos.length}
Subreddits: ${[...new Set(postsUnicos.map(p => p.subreddit))].join(', ')}

Analizá esta idea y devolvé SOLO en este formato:

🧠 Veredicto
- Score: X/10
- Riesgo: Bajo / Medio / Alto
- Tipo: (innovadora / saturada / nicho / tendencia)

📊 Evidencia de mercado
- Qué ya existe similar según Reddit
- Qué dicen los usuarios (problemas reales con quotes si hay)

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
- Explicación corta y directa basada en los ${postsUnicos.length} posts encontrados
`;

    // 4. Llamar a Groq con tu prompt
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3 // Más determinista para números
      })
    })
    
    const data = await groqRes.json()
    
    if (data.error) {
      return Response.json({ error: data.error.message }, { status: 500 })
    }
    
    const veredicto = data.choices[0].message.content
    
    return Response.json({ 
      veredicto,
      agentes_usados: 24,
      posts_analizados: postsUnicos.length,
      fuentes: [...new Set(postsUnicos.map(p => `r/${p.subreddit}`))]
    })
    
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
  }
