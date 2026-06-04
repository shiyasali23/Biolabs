import { For } from 'solid-js'
import domains from '../../jsons/data_domains.json'

export default function DomainFlow() {
  return (
    <p class="text-[0.92rem] leading-[1.95] tracking-[-0.005em] sm:text-[1rem]">
      <For each={domains}>
        {(d, i) => (
          <>
            <span class="font-semibold text-ink-1">{d}</span>
            {i() < domains.length - 1 && (
              <span class="mx-2 text-brand-500">&rarr;</span>
            )}
          </>
        )}
      </For>
    </p>
  )
}
