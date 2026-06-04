import { For, onMount } from 'solid-js'
import { setPageMeta } from '../utils/PageMeta.js'
import PageShell from '../components/PageShell.jsx'
import ContentContainer from '../components/ContentContainer.jsx'
import SectionTitle from '../components/SectionTitle.jsx'
import LayerHeading from '../components/LayerHeading.jsx'
import StatGrid from '../components/StatGrid.jsx'
import DomainFlow from '../components/ui/DomainFlow.jsx'
import KnowledgeGraphMap from '../components/ui/KnowledgeGraphMap.jsx'
import doc from '../jsons/documentation.json'
import thinkIcon      from '../assets/icons/think.png'
import planIcon       from '../assets/icons/plan.png'
import executeIcon    from '../assets/icons/execute.png'
import synthesizeIcon from '../assets/icons/synthesize.png'

const PILLAR_ICONS = {
  think:      thinkIcon,
  plan:       planIcon,
  execute:    executeIcon,
  synthesize: synthesizeIcon,
}

const LEAD_CLASS = 'max-w-[72ch] font-sans text-lead text-ink-2'
const BODY_CLASS = 'font-sans text-[0.92rem] font-normal leading-[1.7] tracking-[-0.005em] text-ink-3 sm:text-[1rem]'

export default function DocumentationPage() {
  onMount(() => setPageMeta({
    title: 'Documentation — Biofold',
    description: 'How Biofold works: the biomedical knowledge graph schema, data domains, integrations, and the reasoning pipeline behind the platform.',
  }))

  return (
    <PageShell variant="default">
      <ContentContainer width="content" class="flex flex-col gap-16 pb-10 pt-8 sm:gap-20 sm:pb-12 sm:pt-12">
        <section class="flex flex-col gap-5">
          <h1 class="font-sans text-display font-medium text-ink-1">
            <span class="font-light text-ink-3">Welcome to</span>{' '}
            <span class="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text font-extrabold text-transparent">Biofold</span>
          </h1>
          <p class={LEAD_CLASS}>{doc.intro}</p>
        </section>

        <section class="flex flex-col gap-5">
          <SectionTitle accent="bar">FOUNDATION</SectionTitle>
          <p class={LEAD_CLASS}>{doc.foundation_lead}</p>
          <DomainFlow />
        </section>
      </ContentContainer>

      <LayerHeading>The Data Layer</LayerHeading>

      <ContentContainer width="content" class="flex flex-col gap-5 pb-8 pt-2 sm:pb-10 sm:pt-4">
        <SectionTitle accent="bar">KNOWLEDGE GRAPHS</SectionTitle>
        <p class={LEAD_CLASS}>{doc.graph_lead}</p>
      </ContentContainer>

      <section class="relative z-10 mx-auto w-full max-w-[88rem] px-4 pb-14 sm:px-6 sm:pb-16 lg:px-10">
        <KnowledgeGraphMap />
      </section>

      <ContentContainer width="content" class="grid grid-cols-1 gap-14 pb-16 pt-2 sm:gap-16 sm:pb-20 lg:grid-cols-2 lg:gap-16">
        <section class="flex flex-col gap-5">
          <SectionTitle accent="bar">INTEGRATION</SectionTitle>
          <ol class={`${BODY_CLASS} flex list-decimal flex-col gap-3 pl-7 marker:text-[0.82rem] marker:font-semibold marker:text-ink-5`}>
            <For each={doc.integration_bullets}>
              {(line) => <li>{line}</li>}
            </For>
          </ol>
        </section>

        <section class="flex flex-col gap-6">
          <SectionTitle accent="bar">WHAT IT UNLOCKS</SectionTitle>
          <div class="flex flex-col gap-7">
            <For each={doc.unlocks}>
              {(item) => (
                <div class="flex flex-col gap-2">
                  <h3 class="font-sans text-[1rem] font-semibold tracking-[-0.005em] text-ink-1 sm:text-[1.1rem]">
                    {item.title}
                  </h3>
                  <p class="font-sans text-[0.88rem] leading-[1.6] tracking-[-0.005em] text-ink-3 sm:text-[0.95rem]">
                    {item.path}
                  </p>
                </div>
              )}
            </For>
          </div>
        </section>
      </ContentContainer>

      <ContentContainer width="content" class="flex flex-col gap-5 pb-16 pt-2 sm:pb-20 sm:pt-4">
        <SectionTitle accent="bar">TEXT STORE</SectionTitle>
        <p class={LEAD_CLASS}>{doc.text_store_lead}</p>
        <div class="mt-4 grid grid-cols-2 gap-x-4 sm:gap-x-8 lg:gap-x-12">
          <StatGrid items={doc.text_store_left} />
          <StatGrid items={doc.text_store_right} />
        </div>
      </ContentContainer>

      <ContentContainer width="content" class="flex flex-col gap-5 pb-16 pt-2 sm:pb-20 sm:pt-4">
        <SectionTitle accent="bar">BIOMEDICAL TABLES</SectionTitle>
        <p class={LEAD_CLASS}>{doc.bio_tables_lead}</p>
        <div class="mt-4 grid grid-cols-1 gap-y-10 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-0 lg:gap-x-12">
          <StatGrid variant="biotable" title="CHEMICAL COMPOUNDS" items={doc.chemical_compounds} />
          <StatGrid variant="biotable" title="GENOMIC VARIANTS"   items={doc.genomic_variants} />
        </div>
      </ContentContainer>

      <LayerHeading>The Architecture Layer</LayerHeading>

      <ContentContainer width="content" class="flex flex-col gap-14 pb-16 pt-2 sm:gap-16 sm:pb-20">
        <p class={LEAD_CLASS}>{doc.arch_lead}</p>

        <section class="flex flex-col">
            <span class="block font-sans text-[clamp(1rem,1.4vw,1.25rem)] font-medium leading-[1.65] tracking-[-0.005em] text-ink-1">
              The system can{' '}
              <For each={doc.pillars}>
                {(p, i) => (
                  <>
                    <span class="inline whitespace-nowrap font-bold">
                      {p.label}{' '}
                      <img
                        src={PILLAR_ICONS[p.icon]}
                        alt=""
                        aria-hidden="true"
                        class="inline-block h-[1.1em] w-auto align-middle"
                      />
                    </span>
                    {i() < doc.pillars.length - 1 ? (
                      <span aria-hidden="true" class="mx-2 font-normal text-ink-5">&rarr;</span>
                    ) : ' '}
                  </>
                )}
              </For>
            </span>
          
        </section>

        <section class="flex flex-col">
          <p class={LEAD_CLASS}>{doc.arch_orchestration}</p>
          <p class="font-sans text-[1rem] leading-[1.7] tracking-[-0.005em] text-ink-1 sm:text-[1.1rem]">
            <For each={doc.actions}>
              {(item, i) => (
                <>
                  <span class="font-extrabold text-brand-700">{item.verb}</span>
                  {' '}
                  <span class="font-medium">{item.target}.</span>
                  {i() < doc.actions.length - 1 && ' '}
                </>
              )}
            </For>
          </p>
        </section>

        <section class="flex flex-col gap-6">
          <SectionTitle accent="bar">SYSTEM Capabilities</SectionTitle>
          <div class="flex flex-col gap-7">
            <For each={doc.system_use_cases}>
              {(item) => (
                <div class="flex flex-col gap-2">
                  <h3 class="font-sans text-[1rem] font-semibold tracking-[-0.005em] text-ink-1 sm:text-[1.1rem]">
                    {item.title}
                  </h3>
                  <p class="font-sans text-[0.88rem] leading-[1.6] tracking-[-0.005em] text-ink-3 sm:text-[0.95rem]">
                    {item.path}
                  </p>
                </div>
              )}
            </For>
            <p class="border-t border-hairline pt-7 font-sans text-[0.95rem] leading-[1.7] tracking-[-0.005em] text-ink-2 sm:text-[1.05rem]">
              {doc.arch_closing}
            </p>
          </div>
        </section>

        <section class="flex flex-col gap-5">
          <SectionTitle accent="bar">CROSS-MODALITY REASONING</SectionTitle>
          <p class={LEAD_CLASS}>{doc.cross_modality_lead}</p>
          <p class={LEAD_CLASS}>{doc.cross_modality_body}</p>
        </section>

        <section class="flex flex-col gap-5">
          <SectionTitle accent="bar">REASONING PRIMITIVES</SectionTitle>
          <p class={LEAD_CLASS}>{doc.reasoning_primitives_lead}</p>
          <ul class="grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2 sm:gap-y-8">
            <For each={doc.reasoning_primitives}>
              {(item) => (
                <li class="flex flex-col gap-1.5 border-t border-hairline pt-5 sm:pt-6">
                  <span class="font-sans text-[0.78rem] font-extrabold uppercase tracking-[0.14em] text-brand-700 sm:text-[0.84rem]">
                    {item.name}
                  </span>
                  <p class="font-sans text-[0.98rem] font-medium tracking-[-0.005em] text-ink-1 sm:text-[1.08rem]">
                    {item.flow}
                  </p>
                  <p class="font-sans text-[0.88rem] leading-[1.55] tracking-[-0.005em] text-ink-3 sm:text-[0.95rem]">
                    For {item.purpose}.
                  </p>
                </li>
              )}
            </For>
          </ul>
        </section>
      </ContentContainer>

      <ContentContainer width="content" class="flex flex-col gap-12 pb-24 pt-16 sm:gap-20 sm:pb-32 sm:pt-20">
        <section class="flex flex-col gap-10 sm:gap-14">
          <SectionTitle accent="bar">WHAT'S NEXT</SectionTitle>
          <ul class="grid grid-cols-1 gap-x-16 gap-y-12 sm:grid-cols-2 sm:gap-y-12">
            <For each={doc.whats_next_items}>
              {(item) => (
                <li class="group flex flex-col">
                  <div class="mb-6 h-px w-full bg-gradient-to-r from-brand-700/20 to-transparent transition-colors duration-500 group-hover:from-emerald-400/60" />
                  <h3 class="font-sans text-[1.2rem] font-bold tracking-[-0.02em] text-ink-1 sm:text-[1.35rem]">
                    {item.title}
                  </h3>
                  <p class="mt-3 font-sans text-[0.95rem] leading-[1.7] tracking-[-0.005em] text-ink-3 sm:text-[1.05rem]">
                    {item.desc}
                  </p>
                </li>
              )}
            </For>
          </ul>
        </section>

        <div class="flex flex-col items-center justify-center">
          <p class="mx-auto max-w-[38ch] text-center font-sans text-[clamp(1.6rem,4vw,2.8rem)] font-bold leading-[1.2] tracking-[-0.02em] text-ink-1">
            <span class="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text font-extrabold text-transparent">Biofold</span> is built for the decade when{' '}
            <span class="text-brand-700">Drug Design</span> happens at the speed of thought.
          </p>
        </div>
      </ContentContainer>
    </PageShell>
  )
}
