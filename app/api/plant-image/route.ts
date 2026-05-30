export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  if (!q) return Response.json({ imageUrl: null })

  try {
    const url = `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(q)}&photos=true&per_page=5&order=desc&order_by=observations_count`
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return Response.json({ imageUrl: null })

    const data = await res.json()
    const imageUrl = data.results?.[0]?.default_photo?.medium_url ?? null
    return Response.json({ imageUrl })
  } catch {
    return Response.json({ imageUrl: null })
  }
}
