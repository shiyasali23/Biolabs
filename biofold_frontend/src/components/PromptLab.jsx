import { createSignal } from 'solid-js'
import SuggestionsLab from './SuggestionsLab.jsx'

export const MIN_CHARS = 3

function SegmentedToggle(props) {
  return (
    <div class="flex flex-col gap-1 sm:gap-1.5">
      <span class="px-1 font-mono text-[0.5rem] font-semibold uppercase tracking-[0.1em] text-ink-5 sm:text-[0.58rem] sm:tracking-[0.18em]">
        {props.label}
      </span>
      <div
        role="tablist"
        aria-label={props.label}
        class="relative inline-flex items-center rounded-full border border-hairline bg-surface-3/70 p-0.5 text-[0.56rem] font-semibold uppercase tracking-[0.08em] sm:text-[0.72rem] sm:tracking-[0.14em]"
      >
        <span
          aria-hidden="true"
          class="absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full bg-white shadow-1 transition-transform duration-400 ease-emphasis"
          style={{ transform: props.value === props.options[0].value ? 'translateX(0)' : 'translateX(100%)' }}
        />
        {props.options.map((opt) => (
          <button
            type="button"
            role="tab"
            aria-selected={props.value === opt.value}
            onClick={() => props.onChange(opt.value)}
            class={`relative z-10 inline-flex items-center gap-1 rounded-full px-2 py-1 transition-colors duration-300 sm:gap-1.5 sm:px-3 sm:py-1.5 ${props.value === opt.value ? 'text-ink-1' : 'text-ink-4 hover:text-ink-2'}`}
          >
            {opt.dot && (
              <span class={`inline-block h-1 w-1 rounded-full transition-colors duration-300 sm:h-1.5 sm:w-1.5 ${props.value === opt.value ? opt.dot.active : 'bg-ink-5/60'}`} />
            )}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function PromptLab(props) {
  const [mode, setMode]           = createSignal('demo')
  const [inference, setInference] = createSignal('open')
  const [open, setOpen]           = createSignal(false)
  const value = () => props.value || ''
  const isReady = () => value().trim().length >= MIN_CHARS

  const onSubmit = (e) => {
    e.preventDefault()
    if (!isReady()) return
    setOpen(false)
    props.onRun?.({ query: value().trim(), mode: mode(), inference: inference() })
  }

  const pick = (demo) => {
    props.onValueChange?.(demo.query)
    setMode('demo')
    setOpen(false)
  }

  return (
    <form class="lab-prompt group relative w-full" onSubmit={onSubmit}>
      <span class="lab-prompt__halo pointer-events-none absolute -inset-2 rounded-[1.75rem] opacity-0 blur-2xl transition-opacity duration-700 group-focus-within:opacity-100" />
      <div class="lab-prompt__shell relative flex flex-col gap-3 rounded-[1.5rem] border border-hairline bg-white/85 p-3 shadow-2 backdrop-blur-xl sm:p-4">
        <textarea
          rows="3"
          placeholder="Start the experiment — e.g. proteins implicated in BRCA1 pathways…"
          value={value()}
          onInput={(e) => { props.onValueChange?.(e.currentTarget.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 80)}
          class="lab-prompt__input w-full resize-none bg-transparent px-2 py-2 text-[0.95rem] leading-7 tracking-[-0.005em] text-ink-1 placeholder:text-ink-5 focus:outline-none sm:text-[1rem]"
        />
        <div class="flex flex-nowrap items-end justify-between gap-2 border-t border-hairline pt-3 sm:gap-6">
          <div class="flex flex-nowrap items-end gap-2 sm:gap-6">
            <SegmentedToggle
              label="Mode"
              value={mode()}
              onChange={setMode}
              options={[
                { value: 'live', label: 'Live', dot: { active: 'bg-leaf-600 shadow-[0_0_8px_rgba(47,139,92,0.55)]' } },
                { value: 'demo', label: 'Demo' },
              ]}
            />
            <SegmentedToggle
              label="Inference"
              value={inference()}
              onChange={setInference}
              options={[
                { value: 'local', label: 'Local', dot: { active: 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.55)]' } },
                { value: 'open',  label: 'Open' },
              ]}
            />
          </div>

          <button
            type="submit"
            disabled={!isReady() || props.running}
            class="lab-run group/run relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-3.5 py-1.5 text-[0.74rem] font-medium tracking-[-0.005em] text-white sm:gap-2.5 sm:px-5 sm:py-2 sm:text-[0.82rem]"
          >
            <span aria-hidden="true" class="lab-run__fill pointer-events-none absolute inset-0 rounded-full" />
            <span aria-hidden="true" class="lab-run__sheen pointer-events-none absolute inset-0 rounded-full" />
            <span aria-hidden="true" class="lab-run__glow pointer-events-none absolute -inset-px rounded-full opacity-0 transition-opacity duration-500 ease-emphasis group-hover/run:opacity-100" />
            <span class="relative z-10">
              {props.running ? 'Running…' : 'Run'}
            </span>
            <span aria-hidden="true" class="lab-run__chevron relative z-10 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/10 transition-transform duration-300 ease-emphasis group-hover/run:translate-x-0.5 sm:h-5 sm:w-5">
              <svg viewBox="0 0 24 24" class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14" />
                <path d="m13 6 6 6-6 6" />
              </svg>
            </span>
          </button>
        </div>
      </div>

      <SuggestionsLab
        open={open() && !props.running}
        query={value()}
        onPick={pick}
      />
    </form>
  )
}
