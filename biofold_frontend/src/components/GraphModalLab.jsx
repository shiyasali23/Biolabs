import { For, Show, createEffect, createMemo, createSignal, onCleanup } from 'solid-js'
import TableLab from './TableLab.jsx'
import ModalComponent from './ui/ModalComponent.jsx'
import { LABEL_COLOR, LABEL_COLOR_FALLBACK, entityName } from '../utils/ResponseHandler.js'

const NODE_CAP = 260
const EDGE_CAP = 600
const METRIC_KEYS = ['report_count', 'pchembl', 'inference_score', 'combined_score', 'resolution', 'max_phase', 'value', 'confidence', 'tpm']

let cyModPromise = null
function loadCytoscape() {
  if (!cyModPromise) cyModPromise = import('cytoscape')
  return cyModPromise
}

function edgeMetric(props) {
  if (!props) return null
  for (const key of METRIC_KEYS) {
    if (props[key] != null) return `${key} ${props[key]}`
  }
  return null
}

function NodeDetail(props) {
  const entity = () => props.entity
  return (
    <div class="flex flex-col gap-4">
      <button
        type="button"
        onClick={props.onClear}
        class="self-start rounded-full border border-hairline px-2.5 py-1 font-mono text-[0.6rem] text-ink-4 transition-colors hover:border-brand-300 hover:text-brand-700"
      >
        ← all nodes
      </button>

      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-1.5">
          <span class="h-2.5 w-2.5 rounded-full" style={`background:${LABEL_COLOR[entity().label] || LABEL_COLOR_FALLBACK}`} />
          <span class="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em]" style={`color:${LABEL_COLOR[entity().label] || LABEL_COLOR_FALLBACK}`}>{entity().label}</span>
        </div>
        <p class="font-sans text-[0.95rem] font-semibold leading-snug text-ink-1">{entityName(entity())}</p>
        <p class="break-all font-mono text-[0.6rem] text-ink-5">{entity().pk}</p>
      </div>

      <Show when={props.relationships.length}>
        <div class="flex flex-col gap-1.5">
          <p class="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-ink-5">Relationships · {props.relationships.length}</p>
          <ul class="flex flex-col gap-1">
            <For each={props.relationships.slice(0, 80)}>
              {(rel) => (
                <li class="flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-2 py-1">
                  <span class="shrink-0 font-mono text-[0.54rem] font-semibold uppercase tracking-[0.04em] text-brand-700">{rel.etype}</span>
                  <button type="button" onClick={() => props.onSelect(rel.neighborPk)} class="min-w-0 flex-1 truncate text-left font-sans text-[0.68rem] text-ink-2 transition-colors hover:text-brand-700">{rel.neighborName}</button>
                  <Show when={rel.metric}>
                    <span class="shrink-0 font-mono text-[0.54rem] text-ink-4">{rel.metric}</span>
                  </Show>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      <Show when={Object.keys(entity().props || {}).length}>
        <div class="flex flex-col gap-1.5">
          <p class="font-mono text-[0.56rem] font-semibold uppercase tracking-[0.16em] text-ink-5">Properties</p>
          <div class="flex flex-col gap-1 rounded-md border border-hairline bg-surface-2 p-2">
            <For each={Object.entries(entity().props).slice(0, 40)}>
              {([key, value]) => (
                <div class="flex gap-3 font-mono text-[0.6rem]">
                  <span class="shrink-0 text-ink-5">{key}</span>
                  <span class="ml-auto line-clamp-2 break-words text-right text-ink-2">{String(value)}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default function GraphModalLab(props) {
  let hostRef
  let cy = null
  const [selected, setSelected] = createSignal(null)
  const [note, setNote] = createSignal('')

  const entities = () => props.entities ?? []
  const relationships = () => props.relationships ?? []
  const entityByPk = createMemo(() => {
    const map = new Map()
    for (const entity of entities()) map.set(entity.pk, entity)
    return map
  })
  const legend = createMemo(() => [...new Set(entities().slice(0, NODE_CAP).map((e) => e.label))])
  const selectedEntity = createMemo(() => (selected() ? entityByPk().get(selected()) : null))
  const selectedRelationships = createMemo(() => {
    const pk = selected()
    if (!pk) return []
    const map = entityByPk()
    return relationships()
      .filter((r) => r.from_pk === pk || r.to_pk === pk)
      .map((r) => {
        const neighborPk = r.from_pk === pk ? r.to_pk : r.from_pk
        const neighbor = map.get(neighborPk)
        return {
          etype: (r.edge_type || '').toLowerCase().replace(/_/g, ' '),
          neighborPk,
          neighborName: neighbor ? entityName(neighbor) : neighborPk,
          metric: edgeMetric(r.props),
        }
      })
  })

  const highlight = (node) => {
    cy.elements().removeClass('hl faded')
    const hood = node.closedNeighborhood()
    cy.elements().not(hood).addClass('faded')
    hood.addClass('hl')
  }

  const focusNode = (pk) => {
    setSelected(pk)
    if (!cy) return
    const node = cy.$id(pk)
    if (node && node.length) {
      highlight(node)
      cy.animate({ center: { eles: node }, zoom: 1.3 }, { duration: 300 })
    }
  }

  const clearFocus = () => {
    setSelected(null)
    if (cy) cy.elements().removeClass('hl faded')
  }

  createEffect(async () => {
    if (!props.open || !hostRef) return
    const ents = entities().slice(0, NODE_CAP)
    setNote(entities().length > NODE_CAP ? `showing ${NODE_CAP} of ${entities().length} nodes` : '')
    const pkSet = new Set(ents.map((e) => e.pk))
    try {
      const mod = await loadCytoscape()
      const cytoscape = mod.default ?? mod
      if (cy) { try { cy.destroy() } catch {} cy = null }

      const edges = relationships().filter((r) => pkSet.has(r.from_pk) && pkSet.has(r.to_pk)).slice(0, EDGE_CAP)
      const degree = {}
      for (const r of edges) { degree[r.from_pk] = (degree[r.from_pk] || 0) + 1; degree[r.to_pk] = (degree[r.to_pk] || 0) + 1 }
      const maxDegree = Math.max(1, ...Object.values(degree))

      const nodes = ents.map((e) => ({ data: { id: e.pk, name: entityName(e), color: LABEL_COLOR[e.label] || LABEL_COLOR_FALLBACK, deg: degree[e.pk] || 0 } }))
      const edgeEls = edges.map((r, i) => ({ data: { id: `e${i}`, source: r.from_pk, target: r.to_pk, etype: (r.edge_type || '').toLowerCase().replace(/_/g, ' ') } }))

      cy = cytoscape({
        container: hostRef,
        elements: [...nodes, ...edgeEls],
        style: [
          { selector: 'node', style: {
            'background-color': 'data(color)',
            width: `mapData(deg, 0, ${maxDegree}, 16, 46)`,
            height: `mapData(deg, 0, ${maxDegree}, 16, 46)`,
            'border-width': 2, 'border-color': 'data(color)', 'border-opacity': 0.3,
          } },
          { selector: 'edge', style: { width: 1.5, 'line-color': '#cbd5e1', 'curve-style': 'bezier', opacity: 0.4 } },
          { selector: '.faded', style: { opacity: 0.07 } },
          { selector: 'node.hl', style: {
            'border-opacity': 1, 'border-width': 3, 'z-index': 20,
            label: 'data(name)', 'font-size': 9, 'font-family': 'JetBrains Mono, monospace',
            color: '#0b1a33', 'text-valign': 'center', 'text-halign': 'right', 'text-margin-x': 4,
            'text-background-color': '#ffffff', 'text-background-opacity': 0.85, 'text-background-padding': 2,
          } },
          { selector: 'edge.hl', style: {
            'line-color': '#3a6fd8', width: 2.5, opacity: 0.95, 'z-index': 20,
            label: 'data(etype)', 'font-size': 8, 'font-family': 'JetBrains Mono, monospace', color: '#1e47a8',
            'text-rotation': 'autorotate', 'text-background-color': '#ffffff', 'text-background-opacity': 0.95, 'text-background-padding': 2,
          } },
        ],
        layout: { name: 'cose', animate: false, fit: true, padding: 50, nodeRepulsion: 8000, idealEdgeLength: 90, componentSpacing: 120 },
      })
      console.log('[GRAPH] rendered', { nodes: nodes.length, edges: edgeEls.length })

      const fitGraph = () => { if (cy) { cy.resize(); cy.fit(undefined, 40) } }
      cy.on('layoutstop', fitGraph)
      setTimeout(fitGraph, 90)

      cy.on('tap', 'node', (evt) => { highlight(evt.target); setSelected(evt.target.id()) })
      cy.on('tap', (evt) => { if (evt.target === cy) clearFocus() })
    } catch (e) {
      console.error('[GRAPH] cytoscape failed', { error: String(e) })
      setNote('graph engine unavailable')
    }
  })

  onCleanup(() => { try { cy?.destroy() } catch {} })

  return (
    <ModalComponent
      open={props.open}
      onClose={props.onClose}
      title="Knowledge Graph"
      subtitle={`${entities().length} nodes · ${relationships().length} edges${note() ? ` · ${note()}` : ''}`}
      overlayClass="p-2 sm:p-3"
      backdropClass="bg-ink-1/50"
      panelClass="flex h-[96vh] w-full max-w-[1700px] flex-col overflow-hidden rounded-2xl border border-hairline bg-white shadow-3"
    >
      <div class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_360px]">
        <div class="relative min-h-0 border-r border-hairline bg-surface">
          <div ref={(el) => (hostRef = el)} class="absolute inset-0" />
          <div class="pointer-events-none absolute left-3 top-3 flex max-w-[60%] flex-wrap gap-x-3 gap-y-1 rounded-lg border border-hairline bg-white/80 px-2.5 py-1.5">
            <For each={legend()}>
              {(label) => (
                <span class="flex items-center gap-1">
                  <span class="h-2 w-2 rounded-full" style={`background:${LABEL_COLOR[label] || LABEL_COLOR_FALLBACK}`} />
                  <span class="font-mono text-[0.56rem] text-ink-3">{label}</span>
                </span>
              )}
            </For>
          </div>
          <span class="pointer-events-none absolute bottom-3 left-3 font-mono text-[0.58rem] text-ink-5">click a node to reveal its links</span>
        </div>

        <div class="min-h-0 overflow-y-auto p-4">
          <Show when={selectedEntity()} fallback={<TableLab entities={props.entities} selected={selected()} onSelect={focusNode} />}>
            <NodeDetail entity={selectedEntity()} relationships={selectedRelationships()} onSelect={focusNode} onClear={clearFocus} />
          </Show>
        </div>
      </div>
    </ModalComponent>
  )
}
