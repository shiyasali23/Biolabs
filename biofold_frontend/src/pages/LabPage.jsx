import { Show, createMemo, createSignal, onCleanup, onMount } from 'solid-js'
import { setPageMeta } from '../utils/PageMeta.js'
import PageShell from '../components/PageShell.jsx'
import AmbientBlob from '../components/AmbientBlob.jsx'
import PromptLab, { MIN_CHARS } from '../components/PromptLab.jsx'
import DemoCardsLab from '../components/DemoCardsLab.jsx'
import ActionsLab from '../components/ActionsLab.jsx'
import NoticeComponent from '../components/ui/NoticeComponent.jsx'
import { LiveResponseHandler } from '../utils/LiveResponseHandler.js'
import { DemoResponseHandler } from '../utils/DemoResponseHandler.js'
import labIcon from '../assets/icons/lab_experiment.png'

export default function LabPage() {
  const [runner, setRunner] = createSignal(null)
  const [query, setQuery] = createSignal('')
  const state = createMemo(() => runner()?.state)

  const isOpen = createMemo(() => !!runner())
  const isStreaming = createMemo(() => state()?.status === 'streaming')
  const showCards = createMemo(() => !isOpen() && query().trim().length < MIN_CHARS)

  onMount(() => setPageMeta({
    title: 'Lab — Biofold',
    description: 'Run cross-domain biomedical queries in the Biofold Lab: entities, relationships, structures, binding predictions, and literature in one workspace.',
  }))

  const handleRun = ({ query, mode, inference }) => {
    console.log('[LAB] run triggered', { mode, inference, queryChars: (query || '').length })
    runner()?.abort()
    const next = mode === 'live' ? new LiveResponseHandler() : new DemoResponseHandler()
    setRunner(next)
    if (mode === 'live') next.run(query, inference === 'local')
    else next.run(query)
  }

  onCleanup(() => runner()?.abort())

  return (
    <PageShell variant="lab">
      <AmbientBlob tone="brandSoft" pos="tl" size="lg" />
      <AmbientBlob tone="leaf"      pos="tr" size="xl" />
      <span class="bg-dot-grid pointer-events-none absolute inset-0 opacity-[0.05]" />

      <section
        class="relative z-10 flex flex-col items-center px-4 pb-12 pt-8 sm:px-6 lg:px-7 data-[open=true]:flex-1 data-[open=true]:pb-28"
        data-open={isOpen() ? 'true' : 'false'}
      >
        <div class="flex w-full max-w-3xl flex-col items-center gap-6">
          <Show when={!isOpen()}>
            <header class="flex flex-col items-center">
              <h1 class="lab-title flex items-center gap-0 font-medium leading-[1.02] tracking-[-0.035em] text-ink-1">
                <span class="-mr-1">
                  The <span class="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text font-semibold text-transparent">Lab</span>
                </span>
                <span aria-hidden="true" class="lab-icon" style={`--lab-icon-url: url(${labIcon})`} />
              </h1>
            </header>
          </Show>
          <div class="flex w-full flex-col items-center gap-2.5">
            <div class="w-full">
              <PromptLab value={query()} onValueChange={setQuery} onRun={handleRun} running={isStreaming()} />
            </div>
            <Show when={!isOpen()}>
              <p class="text-[0.74rem] text-ink-5">More experiment surfaces coming soon.</p>
            </Show>
          </div>
          <Show when={showCards()}>
            <DemoCardsLab onPick={setQuery} />
          </Show>
        </div>

        <Show when={isOpen()}>
          <div class="mt-8 flex w-full flex-col gap-4">
            <Show when={state().error}>
              <NoticeComponent tone="error" code={state().error.code} message={state().error.message} />
            </Show>
            <Show when={state().warning}>
              <NoticeComponent tone="warning" code={state().warning.code} message={state().warning.message} />
            </Show>

            <ActionsLab state={state()} />
          </div>
        </Show>
      </section>
    </PageShell>
  )
}
