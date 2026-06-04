import { For } from 'solid-js'

export default function StatGrid(props) {
  if (props.variant === 'biotable') {
    return (
      <div class="flex flex-col gap-4">
        <h3 class="font-sans text-[0.78rem] font-extrabold uppercase tracking-[0.16em] text-ink-1 sm:text-[0.84rem]">
          {props.title}
        </h3>
        <ul class="divide-y divide-hairline border-y border-hairline">
          <For each={props.items}>
            {(item) => (
              <li class="grid grid-cols-[4.5rem_1fr] items-baseline gap-x-4 py-3.5 sm:grid-cols-[5.5rem_1fr] sm:gap-x-5 sm:py-4">
                <span class="font-sans text-[0.85rem] font-semibold tabular-nums tracking-[-0.01em] text-brand-700 sm:text-[0.95rem]">
                  {item.stat}
                </span>
                <p class="font-sans text-[0.82rem] leading-[1.55] tracking-[-0.005em] text-ink-3 sm:text-[0.92rem]">
                  {item.text}
                </p>
              </li>
            )}
          </For>
        </ul>
      </div>
    )
  }

  return (
    <ul class="divide-y divide-hairline border-y border-hairline">
      <For each={props.items}>
        {(item) => (
          <li class="grid grid-cols-[1fr_3.5rem] items-baseline gap-x-3 py-3 sm:grid-cols-[1fr_4.5rem] sm:gap-x-4 sm:py-4">
            <p class="font-sans text-[0.78rem] leading-[1.5] tracking-[-0.005em] text-ink-3 sm:text-[0.9rem] sm:leading-[1.55]">
              <span class="font-extrabold uppercase tracking-[0.04em] text-brand-700">
                {item.entity}
              </span>
              {item.detail && <>{' '}{item.detail}</>}
            </p>
            <span class="text-right font-sans text-[0.78rem] font-semibold tabular-nums tracking-[-0.01em] text-ink-1 sm:text-[0.92rem]">
              {item.number}
            </span>
          </li>
        )}
      </For>
    </ul>
  )
}
