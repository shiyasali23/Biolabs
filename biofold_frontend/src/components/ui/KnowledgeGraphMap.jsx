import { For } from 'solid-js'
import schema from '../../jsons/kg_schema.json'

const NODE_W = 172
const NODE_H = 44
const TIER_Y = { 1: 100, 2: 280, 3: 460, 4: 640 }
const VIEW_W = 1240
const VIEW_H = 760
const HUB_NODES = new Set(['CHEMICAL', 'GENE', 'DISEASE', 'PROTEIN'])

const COLOR = {
  'brand-300': '#7AA3E8',
  'brand-500': '#3A6FD8',
  'brand-700': '#1E47A8',
  'brand-900': '#0A2461',
  'leaf-200':  '#8EC9A8',
  'leaf-400':  '#6DB58E',
  'leaf-600':  '#2F8B5C',
  'ink-3':     '#3A4A66',
  'ink-4':     '#4F5F77',
  'danger':    '#B43A3A',
}

const NODE_BY_ID = Object.fromEntries(schema.nodes.map(n => [n.id, n]))

function center(id) {
  const n = NODE_BY_ID[id]
  return { x: n.x, y: TIER_Y[n.tier] }
}

function dedupedConnections() {
  const seen = new Map()
  for (const e of schema.edges) {
    const key = e.selfLoop ? `${e.from}#self` : [e.from, e.to].sort().join('::')
    if (!seen.has(key)) seen.set(key, e)
  }
  return [...seen.values()]
}

function pathFor(edge) {
  if (edge.selfLoop) {
    const c = center(edge.from)
    const x1 = c.x - NODE_W / 5
    const x2 = c.x + NODE_W / 5
    const yTop = c.y - NODE_H / 2
    return `M ${x1} ${yTop} C ${x1} ${yTop - 58}, ${x2} ${yTop - 58}, ${x2} ${yTop}`
  }

  const a = center(edge.from)
  const b = center(edge.to)
  const sameTier = a.y === b.y

  if (sameTier) {
    const distance = Math.abs(b.x - a.x)
    const curveDepth = Math.min(120, 60 + distance * 0.10)
    const sx = a.x + (b.x > a.x ? NODE_W / 2 : -NODE_W / 2)
    const ex = b.x + (b.x > a.x ? -NODE_W / 2 : NODE_W / 2)
    const cy = a.y + curveDepth
    const midX = (sx + ex) / 2
    return `M ${sx} ${a.y} Q ${midX} ${cy}, ${ex} ${b.y}`
  }

  const sy = a.y < b.y ? a.y + NODE_H / 2 : a.y - NODE_H / 2
  const ey = a.y < b.y ? b.y - NODE_H / 2 : b.y + NODE_H / 2
  const midY = (sy + ey) / 2
  return `M ${a.x} ${sy} C ${a.x} ${midY}, ${b.x} ${midY}, ${b.x} ${ey}`
}

const CONNECTIONS = dedupedConnections().map((e, i) => ({
  id: e.selfLoop ? `${e.from}-self-${i}` : `${e.from}-${e.to}-${i}`,
  d: pathFor(e),
}))

export default function KnowledgeGraphMap() {
  return (
    <div class="relative overflow-x-auto">
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        class="block w-full min-w-[960px] cursor-default"
        aria-label="Biofold knowledge graph schema"
      >
        <defs>
          <filter id="kg-shadow" x="-20%" y="-20%" width="140%" height="160%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#0B1A33" flood-opacity="0.08" />
          </filter>
          <pattern id="kg-dots" x="0" y="0" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="13" cy="13" r="0.9" fill="rgba(11, 26, 51, 0.16)" />
          </pattern>
          <radialGradient id="kg-light" cx="50%" cy="48%" r="62%">
            <stop offset="0%"   stop-color="rgba(255, 255, 255, 0.85)" />
            <stop offset="70%"  stop-color="rgba(255, 255, 255, 0.3)" />
            <stop offset="100%" stop-color="rgba(255, 255, 255, 0)" />
          </radialGradient>
        </defs>

        <rect class="pointer-events-none" width={VIEW_W} height={VIEW_H} fill="url(#kg-dots)" />
        <rect class="pointer-events-none" width={VIEW_W} height={VIEW_H} fill="url(#kg-light)" />

        <g>
          <For each={CONNECTIONS}>
            {(l) => <path d={l.d} class="kg-line-glow" />}
          </For>
        </g>

        <g>
          <For each={CONNECTIONS}>
            {(l) => <path d={l.d} class="kg-line" />}
          </For>
        </g>

        <g>
          <For each={schema.nodes}>
            {(n) => {
              const c = center(n.id)
              const isHub = HUB_NODES.has(n.id)
              return (
                <g
                  transform={`translate(${c.x - NODE_W / 2} ${c.y - NODE_H / 2})`}
                  style={`--kg-color:${COLOR[n.color]}`}
                  filter="url(#kg-shadow)"
                >
                  <rect
                    class={`kg-pill ${isHub ? 'kg-pill--hub' : ''}`}
                    width={NODE_W}
                    height={NODE_H}
                    rx={NODE_H / 2}
                    ry={NODE_H / 2}
                  />
                  <circle
                    class="kg-dot"
                    cx="16"
                    cy={NODE_H / 2}
                    r={isHub ? '4.5' : '3.5'}
                  />
                  <text
                    class={`kg-text ${isHub ? 'kg-text--hub' : ''}`}
                    x={NODE_W / 2 + 8}
                    y={NODE_H / 2 + 1}
                    text-anchor="middle"
                    dominant-baseline="middle"
                  >
                    {n.label.toUpperCase()}
                  </text>
                </g>
              )
            }}
          </For>
        </g>
      </svg>
    </div>
  )
}
