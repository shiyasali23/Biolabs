import { For, Show, createMemo } from 'solid-js'
import ModalComponent from './ui/ModalComponent.jsx'

const ROW_CAP = 200

function format(value) {
  if (value == null) return '—'
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

function columnsOf(records) {
  const seen = new Set()
  const order = []
  for (const record of records) {
    for (const key of Object.keys(record.row || {})) {
      if (!seen.has(key)) { seen.add(key); order.push(key) }
    }
  }
  return order
}

function groupByTable(tables) {
  const groups = {}
  const order = []
  for (const entry of tables) {
    if (!groups[entry.table]) { groups[entry.table] = []; order.push(entry.table) }
    groups[entry.table].push(entry)
  }
  return order.map((name) => ({ name, records: groups[name] }))
}

export default function BioTableModal(props) {
  const groups = createMemo(() => groupByTable(props.tables || []))

  return (
    <ModalComponent
      open={props.open}
      onClose={props.onClose}
      title="Biomedical Tables"
      subtitle={`${(props.tables || []).length} record(s)`}
      panelClass="flex max-h-[86vh] w-full max-w-[1100px] flex-col overflow-hidden rounded-2xl border border-hairline bg-white shadow-3"
    >
      <div class="flex min-h-0 flex-1 flex-col gap-6 overflow-auto p-5">
        <For each={groups()}>
          {(group) => {
            const cols = columnsOf(group.records)
            return (
              <section class="flex flex-col gap-2">
                <div class="flex items-baseline gap-2">
                  <h4 class="font-mono text-[0.7rem] font-bold uppercase tracking-[0.14em] text-ink-3">{group.name}</h4>
                  <span class="font-mono text-[0.6rem] text-ink-5">{group.records.length} row(s) · {cols.length} fields</span>
                </div>

                <Show
                  when={group.records.length === 1}
                  fallback={
                    <div class="overflow-auto rounded-xl border border-hairline">
                      <table class="w-full border-collapse text-left">
                        <thead class="sticky top-0 bg-surface-2">
                          <tr class="font-mono text-[0.56rem] uppercase tracking-[0.1em] text-ink-5">
                            <th class="whitespace-nowrap px-3 py-2 font-semibold">pk</th>
                            <For each={cols}>{(c) => <th class="whitespace-nowrap px-3 py-2 font-semibold">{c}</th>}</For>
                          </tr>
                        </thead>
                        <tbody>
                          <For each={group.records.slice(0, ROW_CAP)}>
                            {(record) => (
                              <tr class="border-t border-hairline">
                                <td class="whitespace-nowrap px-3 py-1.5 font-mono text-[0.64rem] font-semibold text-ink-2">{record.pk}</td>
                                <For each={cols}>{(c) => <td class="whitespace-nowrap px-3 py-1.5 font-mono text-[0.64rem] text-ink-3">{format(record.row[c])}</td>}</For>
                              </tr>
                            )}
                          </For>
                        </tbody>
                      </table>
                    </div>
                  }
                >
                  <div class="overflow-hidden rounded-xl border border-hairline">
                    <table class="w-full border-collapse text-left">
                      <tbody>
                        <For each={cols}>
                          {(c) => (
                            <tr class="border-t border-hairline first:border-t-0">
                              <td class="w-2/5 bg-surface-2 px-3 py-1.5 align-top font-mono text-[0.62rem] text-ink-5">{c}</td>
                              <td class="px-3 py-1.5 font-mono text-[0.66rem] text-ink-2">{format(group.records[0].row[c])}</td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Show>

                <Show when={group.records.length > ROW_CAP}>
                  <span class="font-mono text-[0.6rem] text-ink-5">showing {ROW_CAP} of {group.records.length} rows</span>
                </Show>
              </section>
            )
          }}
        </For>
      </div>
    </ModalComponent>
  )
}
