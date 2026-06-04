import { For } from 'solid-js'
import techStackBg from '../assets/banners/tech_stack_bg.jpg'
import techStack from '../jsons/tech_stack.json'
import SectionTitle from './SectionTitle.jsx'
import StepTimeline from './StepTimeline.jsx'

export default function TechStackSectionComponent() {
  return (
    <section class="relative isolate mx-auto w-full max-w-[1400px] overflow-hidden px-4 pb-8 pt-4 sm:px-8 lg:px-12 lg:pb-12 lg:pt-4">
      <div class="relative mx-auto w-full max-w-wide sm:px-8 lg:px-12">
        <div class="grid grid-cols-1 items-center gap-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">

          <article class="relative flex flex-col justify-center lg:pr-8">
            <div class="relative z-10 mb-10 flex w-full justify-center lg:justify-start">
              <header class="inline-flex flex-col items-center gap-4 text-center lg:text-left">
                <h2 class="font-sans text-[clamp(2rem,3vw,2.8rem)] font-bold text-ink-1">What we are solving</h2>
                <div class="h-px w-24 bg-silver-underline" />
              </header>
            </div>

            <div class="relative py-8">
              <div class="pointer-events-none absolute inset-0 z-0 opacity-[0.2] [background-image:linear-gradient(to_right,#94a3b8_1px,transparent_1px),linear-gradient(to_bottom,#94a3b8_1px,transparent_1px)] [background-size:2.5rem_2.5rem] [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />

              <div class="relative z-10 flex flex-col gap-8">
                <p
                  class="border-l-2 border-slate-300 pl-5 text-[clamp(1rem,1.3vw,1.15rem)] font-semibold leading-[1.6] tracking-[-0.005em] text-slate-700"
                  innerHTML={techStack.problem_lead}
                />

                <div class="flex flex-col gap-7 text-[1.05rem] font-medium leading-[1.8] tracking-[0.01em] text-slate-500 sm:text-[1.1rem]">
                  <For each={techStack.problems}>
                    {(item) => (
                      <div class="relative pl-6">
                        <span class="absolute left-0 top-[0.6rem] h-1.5 w-1.5 rounded-full bg-blue-500" />
                        <p innerHTML={item.html} />
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </div>
          </article>

          <article class="relative flex flex-col overflow-hidden rounded-[2.5rem] border border-white/[0.06] bg-night-card p-6 text-[#133435] shadow-3 sm:p-8 lg:p-10">
            <img
              src={techStackBg}
              alt=""
              class="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.25] blur-[3px]"
            />
            <span class="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:24px_24px]" />
            <span class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,transparent_0%,rgba(7,21,45,0.85)_100%)]" />

            <header class="relative z-10 mb-8 flex items-center justify-center gap-5">
              <span class="h-px flex-1 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.12)_100%)]" />
              <h3 class="text-eyebrow font-semibold uppercase text-cyan-400">How We Build</h3>
              <span class="h-px flex-1 bg-[linear-gradient(270deg,transparent_0%,rgba(255,255,255,0.12)_100%)]" />
            </header>

            <div class="relative z-10">
              <StepTimeline items={techStack.stack} />
            </div>
          </article>

        </div>
      </div>
    </section>
  )
}
