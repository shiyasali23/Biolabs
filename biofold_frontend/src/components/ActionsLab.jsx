import { For, Show, createEffect } from 'solid-js'
import ActionRowLab from './ActionRowLab.jsx'
import AnswerCardLab from './AnswerCardLab.jsx'
import VisualsRailLab from './VisualsRailLab.jsx'
import KgPanelLab from './KgPanelLab.jsx'
import CountersLab from './CountersLab.jsx'

const COLS = 'md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]'

export default function ActionsLab(props) {
  const turns = () => props.state.turns.filter((t) => t.intent !== 'Synthesizing')
  const streaming = () => props.state.status === 'streaming'
  const done = () => props.state.status === 'done'
  const hasAnswer = () => !!props.state.finalAnswer
  const hasVisuals = () => !!props.state.visuals.molecule || props.state.visuals.structures.length > 0
  const hasEntities = () => props.state.entities.length > 0
  const answerHasRight = () => done() && (hasVisuals() || hasEntities())
  let endRef

  createEffect(() => {
    const count = turns().length
    const finished = done()
    if (endRef && count && (streaming() || finished)) {
      requestAnimationFrame(() => endRef.scrollIntoView({ behavior: 'smooth', block: 'nearest' }))
    }
  })

  return (
    <div class="overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
      <div class={`grid grid-cols-1 px-4 py-2.5 ${COLS}`}>
        <div class="flex min-w-0 items-center justify-between gap-3 md:pr-4">
          <span class="font-sans text-[0.92rem] font-bold tracking-[-0.01em] text-ink-1">Actions</span>
          <div class="md:hidden">
            <CountersLab state={props.state} />
          </div>
        </div>
        <div class="hidden min-w-0 items-center justify-between gap-3 md:flex md:border-l md:border-hairline md:pl-4">
          <span class="font-sans text-[0.92rem] font-bold tracking-[-0.01em] text-ink-1">Results</span>
          <CountersLab state={props.state} />
        </div>
      </div>

      <For each={turns()}>
        {(turn) => <ActionRowLab turn={turn} state={props.state} cols={COLS} />}
      </For>

      <Show when={streaming()}>
        <div class="flex items-center gap-2.5 px-4 py-4">
          <span class="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-cyan-500" />
          <span class="font-sans text-[0.8rem] text-ink-4">thinking…</span>
        </div>
      </Show>

      <Show when={hasAnswer()}>
        <Show
          when={answerHasRight()}
          fallback={
            <div class="px-4 py-5">
              <AnswerCardLab state={props.state} />
            </div>
          }
        >
          <div class={`grid grid-cols-1 gap-y-4 px-4 py-5 ${COLS}`}>
            <div class="min-w-0 md:pr-4">
              <AnswerCardLab state={props.state} />
            </div>
            <div class="flex min-w-0 flex-col gap-4 md:border-l md:border-hairline md:pl-4">
              <Show when={hasVisuals()}>
                <VisualsRailLab state={props.state} />
              </Show>
              <Show when={hasEntities()}>
                <KgPanelLab state={props.state} />
              </Show>
            </div>
          </div>
        </Show>
      </Show>

      <span ref={(el) => (endRef = el)} aria-hidden="true" />
    </div>
  )
}
