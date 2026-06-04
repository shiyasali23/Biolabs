import { For, Show, createMemo, createSignal } from 'solid-js'
import { LABEL_COLOR, LABEL_COLOR_FALLBACK, entityName } from '../utils/ResponseHandler.js'

const CAP = 120

export default function TableLab(props) {
  const [q, setQ] = createSignal('')
  const rows = createMemo(() => {
    const term = q().trim().toLowerCase()
    const all = props.entities ?? []
    const filtered = term
      ? all.filter((e) => e.pk.toLowerCase().includes(term) || e.label.toLowerCase().includes(term) || entityName(e).toLowerCase().includes(term))
      : all
    return { shown: filtered.slice(0, CAP), total: filtered.length }
  })

  return (
    <section class="flex flex-col gap-2">
      <div class="flex items-center justify-between gap-3">
        <h3 class="font-sans text-[0.66rem] font-bold uppercase tracking-[0.18em] text-ink-5">KG Table</h3>
        <input
          type="text"
          placeholder="search…"
          value={q()}
          onInput={(e) => setQ(e.currentTarget.value)}
          class="w-40 rounded-full border border-hairline bg-white px-3 py-1 font-mono text-[0.66rem] text-ink-2 placeholder:text-ink-5 focus:border-brand-300 focus:outline-none"
        />
      </div>
      <div class="max-h-80 overflow-y-auto rounded-xl border border-hairline bg-white">
        <table class="w-full border-collapse text-left">
          <thead class="sticky top-0 bg-surface-2">
            <tr class="font-mono text-[0.58rem] uppercase tracking-[0.12em] text-ink-5">
              <th class="px-3 py-2 font-semibold">pk</th>
              <th class="px-3 py-2 font-semibold">label</th>
              <th class="px-3 py-2 font-semibold">name</th>
            </tr>
          </thead>
          <tbody>
            <For each={rows().shown}>
              {(e) => (
                <tr
                  class={`border-t border-hairline transition-colors hover:bg-blue-50/50 ${props.selected === e.pk ? 'bg-blue-50' : ''}`}
                  onClick={() => props.onSelect?.(e.pk)}
                >
                  <td class="px-3 py-1.5 font-mono text-[0.66rem] text-ink-2">{e.pk}</td>
                  <td class="px-3 py-1.5">
                    <span class="font-mono text-[0.6rem] font-semibold" style={`color:${LABEL_COLOR[e.label] || LABEL_COLOR_FALLBACK}`}>{e.label}</span>
                  </td>
                  <td class="px-3 py-1.5 font-sans text-[0.7rem] text-ink-3">{entityName(e)}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
      <Show when={rows().total > CAP}>
        <span class="font-mono text-[0.6rem] text-ink-5">showing {CAP} of {rows().total} — refine search to narrow</span>
      </Show>
    </section>
  )
}
