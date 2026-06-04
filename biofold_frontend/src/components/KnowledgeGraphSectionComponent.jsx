import { For, createSignal, onCleanup, onMount } from 'solid-js'
import graphData from '../jsons/knowledge_graph.json'
import knowledgeGraphBg from '../assets/banners/knowledge_graph_bg.jpeg'
import StatTile from './StatTile.jsx'

export default function KnowledgeGraphSectionComponent() {
  const [startCount, setStartCount] = createSignal(false)
  let sectionRef

  onMount(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setStartCount(true)
        observer.disconnect()
      },
      { threshold: 0.28 }
    )
    observer.observe(sectionRef)
    onCleanup(() => observer.disconnect())
  })

  return (
    <section
      ref={sectionRef}
      class="relative isolate mx-4 mb-16 mt-10 max-w-bleed overflow-hidden rounded-[2.5rem] bg-night-card px-4 py-12 text-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] sm:mx-6 sm:px-6 sm:py-16 lg:mx-8 lg:mb-24 lg:mt-4 lg:px-12 lg:py-20 2xl:mx-auto"
    >
      <img
        src={knowledgeGraphBg}
        alt=""
        class="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover opacity-[0.35] blur-[2px]"
      />
      <span class="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(7,21,45,0.65)_0%,rgba(10,31,74,0.55)_44%,rgba(12,35,86,0.75)_100%)]" />
      <span class="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/15" />
      <span class="pointer-events-none absolute left-[8%] top-16 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(122,163,232,0.22),_transparent_70%)] blur-3xl" />
      <span class="pointer-events-none absolute bottom-10 right-[8%] h-64 w-64 rounded-full bg-[radial-gradient(circle,_rgba(58,111,216,0.18),_transparent_72%)] blur-3xl" />
      <span class="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:radial-gradient(rgba(255,255,255,0.55)_0.9px,transparent_1.1px)] [background-size:26px_26px]" />

      <article class="relative mx-auto flex w-full max-w-[90rem] flex-col gap-8 lg:gap-12">
        <header class="flex flex-col items-center gap-4 text-center">
          <h2 class="max-w-3xl text-h2 font-medium text-white">
            Knowledge Graph Powered By
          </h2>
          <p class="text-eyebrow font-semibold uppercase text-white/55">{graphData.kicker}</p>
        </header>

        <section class="flex flex-col gap-4">
          <section class="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <For each={graphData.entities}>
              {(item) => (
                <StatTile
                  label={item.label}
                  value={item.value}
                  unit={item.unit}
                  start={startCount()}
                  delay={0}
                />
              )}
            </For>
          </section>

          <span class="section-floor mt-2 h-px w-full" />

          <section class="mt-2 grid grid-cols-2 gap-4 lg:grid-cols-3">
            <For each={graphData.relationships}>
              {(item, index) => (
                <StatTile
                  label={item.label}
                  value={item.value}
                  unit={item.unit}
                  start={startCount()}
                  delay={index() * 90}
                  size="sm"
                />
              )}
            </For>
            <StatTile variant="more" />
          </section>
        </section>
      </article>
    </section>
  )
}
