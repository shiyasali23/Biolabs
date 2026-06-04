import { For } from 'solid-js'
import { listDemoQueries } from '../utils/DemoResponseHandler.js'

const DEMOS = listDemoQueries()

export default function DemoCardsLab(props) {
  return (
    <div class="grid w-full grid-cols-3 gap-2 sm:gap-3">
      <For each={DEMOS}>
        {(demo) => (
          <button
            type="button"
            onClick={() => props.onPick?.(demo.query)}
            class="group flex h-full min-w-0 flex-col gap-1 rounded-lg border border-hairline bg-white/70 p-2 text-left shadow-1 backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white hover:shadow-2 sm:gap-1.5 sm:rounded-xl sm:p-3.5"
          >
            <span class="font-sans text-[0.58rem] font-semibold leading-snug tracking-[-0.005em] text-ink-1 line-clamp-3 break-words sm:text-[0.78rem]">{demo.title}</span>
            <span class="font-sans text-[0.54rem] leading-relaxed text-ink-4 line-clamp-2 break-words sm:text-[0.7rem] sm:line-clamp-3">{demo.query}</span>
          </button>
        )}
      </For>
    </div>
  )
}
