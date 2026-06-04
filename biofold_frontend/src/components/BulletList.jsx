import { For } from 'solid-js'

const TONE = {
  brand: { dot: 'bg-blue-500',  text: 'text-slate-500',  glow: '' },
  cyan:  { dot: 'bg-cyan-400',  text: 'text-slate-200',  glow: 'shadow-[0_0_12px_rgba(34,211,238,0.8)]' },
}

export default function BulletList(props) {
  const tone = TONE[props.tone ?? 'brand']

  return (
    <div class={`flex flex-col gap-3 sm:gap-5 lg:gap-6 ${props.class ?? ''}`}>
      <For each={props.items}>
        {(item) => (
          <div class="relative flex items-start gap-3 sm:gap-4 lg:gap-5">
            <span class="mt-[8px] inline-flex h-2 w-2 shrink-0">
              <span class={`inline-flex h-2 w-2 rounded-full ${tone.dot} ${tone.glow}`} />
            </span>
            <p class={`text-[0.85rem] sm:text-[1rem] lg:text-[1.1rem] font-medium leading-snug ${tone.text}`}>
              {item}
            </p>
          </div>
        )}
      </For>
    </div>
  )
}
