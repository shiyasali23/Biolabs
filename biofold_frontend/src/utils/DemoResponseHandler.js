import { BaseResponseHandler } from './BaseResponseHandler.js'
import demoCards from '../jsons/demo_cards.json'

const GAP_CAP_MS = 800
const GAP_MIN_MS = 160
const DEMO_KEYS = Object.keys(demoCards)

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

let demoEventsPromise = null
function loadDemoEvents() {
  if (!demoEventsPromise) {
    demoEventsPromise = import('../jsons/query_test_response_8.json').then((mod) => mod.default)
  }
  return demoEventsPromise
}

export function listDemoQueries() {
  return DEMO_KEYS.map((key) => ({ key, query: demoCards[key].query, title: demoCards[key].title_card || '' }))
}

export function matchDemoKey(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return DEMO_KEYS[0]
  for (const key of DEMO_KEYS) {
    if (demoCards[key].query.trim().toLowerCase() === q) return key
  }
  for (const key of DEMO_KEYS) {
    const candidate = demoCards[key].query.toLowerCase()
    if (candidate.includes(q) || q.includes(candidate)) return key
  }
  const words = q.split(/\W+/).filter((w) => w.length > 3)
  let best = DEMO_KEYS[0]
  let bestScore = 0
  for (const key of DEMO_KEYS) {
    const cardWords = new Set(demoCards[key].query.toLowerCase().split(/\W+/))
    const score = words.filter((w) =>
      cardWords.has(w) && !DEMO_KEYS.every((other) => demoCards[other].query.toLowerCase().includes(w)),
    ).length
    if (score > bestScore) { bestScore = score; best = key }
  }
  return best
}

function pacing(event) {
  if (event.event === 'session_open') return 120
  if (event.event === 'turn_start') return 280
  if (event.event === 'turn_result') {
    const seconds = (event.data && event.data.elapsed_seconds) || 0
    return Math.min(Math.max(seconds * 1000, GAP_MIN_MS), GAP_CAP_MS)
  }
  if (event.event === 'done') return 360
  return 120
}

export class DemoResponseHandler extends BaseResponseHandler {
  run(query) {
    this.cancelled = false
    this.handler.begin(query)
    const key = matchDemoKey(query)
    ;(async () => {
      try {
        const demoData = await loadDemoEvents()
        if (this.cancelled) return
        const events = (demoData[key] && demoData[key].events_parsed) || []
        console.log('[LAB] demo replay', { key, events: events.length })
        for (const event of events) {
          if (this.cancelled) return
          await sleep(pacing(event))
          if (this.cancelled) return
          this.handler.ingest(event)
        }
      } catch (err) {
        if (this.cancelled) return
        this.handler.fail(err && err.message ? err.message : String(err))
      }
    })()
  }
}
