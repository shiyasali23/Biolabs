import { For, Show, createMemo, createSignal } from 'solid-js'
import { entityName } from '../utils/ResponseHandler.js'
import NodeStat from './ui/NodeStat.jsx'
import ExpandPillComponent from './ui/ExpandPillComponent.jsx'
import BioTableModal from './BioTableModal.jsx'

const METRIC_KEYS = [
  'inference_score', 'report_count', 'pchembl', 'combined_score', 'predicted_score',
  'tpm', 'inference_network_score', 'text_mining_score', 'max_phase',
]

function relationMetric(rel) {
  const props = rel.props || {}
  for (const key of METRIC_KEYS) {
    if (props[key] != null) return { key, value: props[key] }
  }
  return null
}

function elapsedLabel(calls) {
  const total = calls.reduce((sum, c) => sum + (c.elapsed || 0), 0)
  if (!total) return ''
  if (total < 1) return `${Math.max(1, Math.round(total * 1000))}ms`
  return `${total.toFixed(1)}s`
}

function groupByLabel(entities) {
  const groups = {}
  for (const entity of entities) {
    if (!groups[entity.label]) groups[entity.label] = []
    groups[entity.label].push(entity)
  }
  return Object.entries(groups).sort((a, b) => b[1].length - a[1].length)
}

function BindingResult(props) {
  return (
    <div class="flex flex-wrap items-center gap-x-5 gap-y-2">
      <div class="flex items-baseline gap-2">
        <span class="font-mono text-[1.7rem] font-bold tabular-nums text-ink-1">{props.binding.score}</span>
        <span class="font-mono text-[0.56rem] uppercase tracking-[0.14em] text-ink-5">predicted score</span>
      </div>
      <Show when={props.binding.label}>
        <span class="rounded-full border border-hairline bg-surface-2 px-2.5 py-1 font-mono text-[0.66rem] font-semibold text-ink-2">{props.binding.label.replace(/_/g, ' ')}</span>
      </Show>
      <Show when={props.binding.measured}>
        <span class="font-mono text-[0.7rem] text-ink-3">measured pChEMBL {props.binding.measured}</span>
      </Show>
    </div>
  )
}

export default function ActionRowLab(props) {
  const turn = () => props.turn
  const kind = createMemo(() => {
    const t = turn()
    if (t.literature.length) return 'literature'
    if (t.bioTables.length) return 'biotable'
    if (t.entities.length || t.relationships.length) return 'kg'
    return 'plain'
  })
  const groups = createMemo(() => groupByLabel(turn().entities))
  const binding = createMemo(() => {
    if (props.state.status !== 'done') return null
    if (!turn().calls.some((c) => c.name === 'predict_binding')) return null
    return props.state.visuals.binding
  })
  const [open, setOpen] = createSignal(false)
  const [tableOpen, setTableOpen] = createSignal(false)

  return (
    <div class={`grid grid-cols-1 gap-y-3 border-b border-hairline px-4 py-4 ${props.cols}`}>
      <div class="flex min-w-0 items-center justify-between gap-3 md:pr-4">
        <span class="min-w-0 rounded-md border border-hairline/70 bg-surface-2 px-3 py-1.5 font-sans text-[0.84rem] font-semibold leading-snug tracking-[-0.005em] text-ink-1">{turn().intent}</span>
        <span class="shrink-0 font-mono text-[0.6rem] tabular-nums text-ink-5">{elapsedLabel(turn().calls)}</span>
      </div>

      <div class="min-w-0 md:border-l md:border-hairline md:pl-4">
        <Show
          when={binding()}
          fallback={
            <>
              <Show when={kind() === 'kg'}>
                <div class="flex items-start justify-between gap-3">
                  <div class="flex flex-wrap items-center gap-2">
                    <For each={groups()}>
                      {([label, list]) => <NodeStat label={label} count={list.length} />}
                    </For>
                  </div>
                  <ExpandPillComponent onClick={() => setOpen(!open())}>
                    {open() ? 'collapse' : 'expand'}
                  </ExpandPillComponent>
                </div>
                <Show when={open()}>
                  <div class="mt-3 flex flex-col gap-2 border-t border-hairline pt-2">
                    <For each={groups()}>
                      {([label, list]) => (
                        <div>
                          <p class="mb-1 font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-5">{label}</p>
                          <div class="flex flex-wrap gap-x-3 gap-y-0.5">
                            <For each={list.slice(0, 40)}>
                              {(entity) => <span class="font-sans text-[0.72rem] text-ink-3">{entityName(entity)}</span>}
                            </For>
                            <Show when={list.length > 40}>
                              <span class="font-mono text-[0.62rem] text-ink-5">+{list.length - 40} more</span>
                            </Show>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
                <Show when={open() && turn().relationships.length}>
                  <ul class="mt-3 flex flex-col gap-1 border-t border-hairline pt-2">
                    <For each={turn().relationships.slice(0, 30)}>
                      {(rel) => {
                        const metric = relationMetric(rel)
                        return (
                          <li class="flex items-center gap-2 font-mono text-[0.64rem] text-ink-3">
                            <span class="text-ink-2">{rel.from_pk}</span>
                            <span class="text-ink-5">{rel.edge_type.toLowerCase().replace(/_/g, ' ')}</span>
                            <span class="text-ink-2">{rel.to_pk}</span>
                            <Show when={metric}>
                              <span class="ml-auto rounded bg-surface-2 px-1.5 text-ink-4">{metric.key}={metric.value}</span>
                            </Show>
                          </li>
                        )
                      }}
                    </For>
                  </ul>
                </Show>
              </Show>

              <Show when={kind() === 'literature'}>
                <ul class="flex flex-col gap-2">
                  <For each={(open() ? turn().literature : turn().literature.slice(0, 1))}>
                    {(item) => (
                      <li class="rounded-lg border border-hairline bg-surface-2 p-2.5">
                        <div class="flex items-center gap-2">
                          <Show when={item.pubmed_identifier} fallback={<span class="rounded bg-surface-3 px-1.5 py-0.5 font-mono text-[0.58rem] text-ink-5">internal chunk</span>}>
                            <a href={`${import.meta.env.VITE_PUBMED_URL || 'https://pubmed.ncbi.nlm.nih.gov'}/${item.pubmed_identifier}/`} target="_blank" rel="noreferrer" class="rounded border border-violet-400/40 bg-violet-400/10 px-1.5 py-0.5 font-mono text-[0.6rem] font-semibold text-violet-700">PMID:{item.pubmed_identifier}</a>
                          </Show>
                          <Show when={item.score != null}>
                            <span class="ml-auto font-mono text-[0.6rem] tabular-nums text-ink-4">score {Number(item.score).toFixed(3)}</span>
                          </Show>
                        </div>
                        <Show when={item.chunk_text}>
                          <p class="mt-1.5 font-sans text-[0.74rem] leading-relaxed text-ink-3">{item.chunk_text}</p>
                        </Show>
                      </li>
                    )}
                  </For>
                  <Show when={turn().literature.length > 1}>
                    <button
                      type="button"
                      onClick={() => setOpen(!open())}
                      class="self-start font-mono text-[0.6rem] text-ink-4 underline underline-offset-2 hover:text-brand-700"
                    >
                      {open() ? 'show less' : `show ${turn().literature.length - 1} more`}
                    </button>
                  </Show>
                </ul>
              </Show>

              <Show when={kind() === 'biotable'}>
                <div class="flex items-start justify-between gap-3">
                  <div class="flex min-w-0 flex-col gap-2">
                    <For each={turn().bioTables.slice(0, 1)}>
                      {(record) => (
                        <div class="rounded-lg border border-hairline bg-surface-2 p-2.5">
                          <p class="font-mono text-[0.64rem] font-semibold text-ink-2">{record.table} · {record.pk}</p>
                          <div class="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                            <For each={Object.entries(record.row).slice(0, 5)}>
                              {([key, value]) => (
                                <span class="font-mono text-[0.62rem] text-ink-4"><span class="text-ink-5">{key}</span> {String(value)}</span>
                              )}
                            </For>
                            <Show when={Object.keys(record.row).length > 5}>
                              <span class="font-mono text-[0.62rem] text-ink-5">+{Object.keys(record.row).length - 5} fields</span>
                            </Show>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                  <ExpandPillComponent onClick={() => setTableOpen(true)}>
                    expand
                  </ExpandPillComponent>
                </div>
                <BioTableModal open={tableOpen()} tables={turn().bioTables} onClose={() => setTableOpen(false)} />
              </Show>
            </>
          }
        >
          <BindingResult binding={binding()} />
        </Show>
      </div>
    </div>
  )
}
