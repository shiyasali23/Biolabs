const ENDPOINT = `${import.meta.env.VITE_API_BASE || '/agent'}/query`

function parseBlock(block) {
  let event = 'message'
  const dataLines = []
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim()
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim())
  }
  if (dataLines.length === 0) return null
  try {
    return { event, data: JSON.parse(dataLines.join('\n')) }
  } catch {
    console.warn('[STREAM] dropped unparseable SSE block', { bytes: block.length })
    return null
  }
}

export async function* streamQuery(query, inferenceLocally, isCancelled) {
  console.log('[QUERY] POST /agent/query', { local: !!inferenceLocally, queryChars: (query || '').length })
  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
    body: JSON.stringify({ query, inference_locally: !!inferenceLocally }),
  })
  if (!response.ok || !response.body) {
    console.error('[QUERY] request failed', { status: response.status })
    throw new Error(`request failed (HTTP ${response.status})`)
  }
  console.log('[QUERY] stream opened', { status: response.status })

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    if (isCancelled && isCancelled()) {
      console.log('[QUERY] stream cancelled by client')
      try { await reader.cancel() } catch {}
      return
    }
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let split
    while ((split = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, split)
      buffer = buffer.slice(split + 2)
      const parsed = parseBlock(block)
      if (parsed) yield parsed
    }
  }
  const tail = parseBlock(buffer)
  if (tail) yield tail
}
