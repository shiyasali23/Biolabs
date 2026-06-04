import { For, Show, createMemo } from 'solid-js'
import { listDemoQueries } from '../utils/DemoResponseHandler.js'

const DEMOS = listDemoQueries()

export default function SuggestionsLab(props) {
  const matches = createMemo(() => {
    const term = (props.query ?? '').trim().toLowerCase()
    if (!term) return DEMOS
    return DEMOS.filter((d) => d.query.toLowerCase().includes(term) || d.key.toLowerCase().includes(term))
  })

  return (
    <Show when={props.open && matches().length > 0}>
      <div class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-hairline bg-white/95 shadow-3 backdrop-blur-xl">
        <ul class="flex max-h-[60vh] flex-col divide-y divide-hairline overflow-y-auto">
          <For each={matches()}>
            {(d) => (
              <li>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); props.onPick(d) }}
                  class="group flex w-full flex-col items-start gap-1 px-4 py-3 text-left transition-colors hover:bg-blue-50/70"
                >
                  <p class="line-clamp-2 font-sans text-[0.78rem] leading-relaxed text-ink-4">
                    {d.query}
                  </p>
                </button>
              </li>
            )}
          </For>
        </ul>
      </div>
    </Show>
  )
}
