export async function buscarEnReddit(idea) {
  const query = encodeURIComponent(idea)
  const url = `https://www.reddit.com/search.json?q=${query}&limit=5&sort=relevance`
  const res = await fetch(url, { headers: { 'User-Agent': 'mi-validadora/1.0' } })
  const json = await res.json()
  return json.data.children.map(p => p.data.title).slice(0, 5)
}
