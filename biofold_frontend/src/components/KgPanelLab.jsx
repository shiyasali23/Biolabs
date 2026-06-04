import { For, Show, createMemo, createSignal } from 'solid-js'
import GraphModalLab from './GraphModalLab.jsx'
import NodeStat from './ui/NodeStat.jsx'

export default function KgPanelLab(props) {
  const [open, setOpen] = createSignal(false)
  const clusters = createMemo(() => {
    const counts = {}
    for (const entity of props.state.entities) counts[entity.label] = (counts[entity.label] || 0) + 1
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  })
  const total = () => props.state.entities.length
  const relationshipCount = () => props.state.relationships.length

  return (
    <Show when={total() > 0}>
      <div class="flex flex-col gap-2.5 rounded-xl border border-hairline bg-surface p-3.5">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-ink-5">Knowledge Graph</span>
          <span class="font-mono text-[0.6rem] text-ink-5">{total()} nodes · {relationshipCount()} edges</span>
        </div>
        <div class="flex flex-wrap items-center gap-x-2 gap-y-2.5">
          <For each={clusters()}>
            {([label, count]) => <NodeStat label={label} count={count} />}
          </For>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          class="group mt-2 inline-flex items-center gap-2 self-end rounded-lg bg-gradient-to-r from-brand-500 to-brand-700 px-4 py-2 font-sans text-[0.72rem] font-semibold text-white shadow-glow-blue transition-all duration-300 hover:shadow-2 active:scale-[0.98]"
        >
          <span>Expand graph</span>
          <span aria-hidden="true" class="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </button>
      </div>
      <GraphModalLab
        open={open()}
        entities={props.state.entities}
        relationships={props.state.relationships}
        onClose={() => setOpen(false)}
      />
    </Show>
  )
}
