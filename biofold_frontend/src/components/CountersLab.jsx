import { For } from 'solid-js'

function formatTokens(n) {
  if (!n) return '0'
  if (n < 1000) return String(n)
  if (n < 1000000) return `${(n / 1000).toFixed(1)}k`
  return `${(n / 1000000).toFixed(2)}M`
}

function formatTime(seconds) {
  const total = seconds || 0
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

export default function CountersLab(props) {
  const cells = () => {
    const c = props.state.counters
    return [
      { label: 'tokens', value: formatTokens(c.tokens) },
      { label: 'time', value: formatTime(c.elapsed) },
    ]
  }
  const live = () => props.state.status !== 'error' && props.state.turns.length > 0
  const blink = () => props.state.status === 'streaming'

  return (
    <div class="flex items-center gap-3 rounded-lg px-1 py-1">
      <span class={`h-2 w-2 shrink-0 rounded-full ${live() ? 'bg-leaf-600' : 'bg-rose-500'} ${blink() ? 'animate-pulse' : ''}`} />
      <div class="flex items-baseline gap-4">
        <For each={cells()}>
          {(cell) => (
            <div class="flex items-baseline gap-2">
              <span class="font-mono text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-ink-4">{cell.label}</span>
              <span class="font-mono text-[0.92rem] font-bold tabular-nums text-ink-1">{cell.value}</span>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
