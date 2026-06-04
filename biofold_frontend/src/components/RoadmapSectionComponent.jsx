import { For } from 'solid-js'
import roadmap from '../jsons/roadmap.json'
import anatomyIcon       from '../assets/icons/anatomy.png'
import quantumChipsIcon  from '../assets/icons/quantum_chips.png'
import drugsIcon         from '../assets/icons/drugs.png'

const ICON_MAP = {
  anatomy:       anatomyIcon,
  quantum_chips: quantumChipsIcon,
  drugs:         drugsIcon,
}

export default function RoadmapSectionComponent() {
  return (
    <section class="relative z-10 mb-16 mt-6 flex w-full justify-center px-4 sm:mt-10 lg:mt-14">
      <div class="relative flex w-full max-w-4xl flex-col items-center justify-center px-4 py-5 text-center sm:px-8 sm:py-7">

        <header class="mb-4 flex flex-col items-center justify-center sm:mb-5">
          <h2 class="text-[clamp(1.6rem,3.5vw,3rem)] font-extrabold leading-[1.05] tracking-[0.02em] text-slate-900">
            Roadmap{' '}
            <span class="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text font-black text-transparent drop-shadow-sm">To</span>
          </h2>
          <div class="mx-auto mt-4 h-px w-24 bg-silver-underline sm:mt-5" />
        </header>

        <div class="mt-2 flex w-full flex-col items-center justify-center">
          <p class="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[clamp(0.8rem,1.2vw,1.3rem)] font-bold leading-none tracking-wide text-slate-700 sm:flex-nowrap sm:gap-x-3">
            <For each={roadmap}>
              {(step, i) => (
                <span class="inline-flex items-center gap-2 whitespace-nowrap">
                  <span>{step.label}</span>
                  <img
                    src={ICON_MAP[step.icon]}
                    alt={step.label}
                    class={`inline-block h-[1.4em] w-auto shrink-0 drop-shadow-sm ${i() === 1 ? 'sm:mr-3' : ''}`}
                  />
                </span>
              )}
            </For>
          </p>
        </div>
      </div>
    </section>
  )
}
