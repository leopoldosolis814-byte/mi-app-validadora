import OpenAI from 'openai'
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
export async function analizarConIA(idea, postsReddit) {
  const prompt = `Sos un analista de startups. Idea: "${idea}". Posts de Reddit: ${postsReddit.join(' | ')}. Devolvé JSON: { "veredicto": "texto corto de 2 líneas", "posts": [los 5 títulos] }`
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }], model: 'gpt-4o-mini', response_format: { type: 'json_object' },
  })
  return JSON.parse(completion.choices[0].message.content)
}
