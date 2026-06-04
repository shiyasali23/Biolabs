import proteinBanner from '../assets/banners/protein_banner.png'
import StartExperimentButton from './ui/StartExperimentButton.jsx'
import AmbientBlob from './AmbientBlob.jsx'

export default function HeroComponent() {
  return (
    <section class="relative z-10 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 pb-4 pt-8 sm:px-6 sm:py-5 lg:px-12 lg:py-5">
      <AmbientBlob tone="brandSoft" pos="cl" size="sm" />
      <AmbientBlob tone="leafSoft"  pos="bl" size="sm" />

      <div class="mx-auto grid w-full max-w-[84rem] grid-cols-2 items-center gap-4 sm:gap-6 lg:gap-16">
        <article class="hero-copy relative flex flex-col justify-center justify-self-center lg:justify-self-end lg:pr-2">
          <h1 class="max-w-[22ch] text-[clamp(1.85rem,4.6vw,3rem)] font-medium leading-[1.2] tracking-[-0.01em] text-ink-2 sm:leading-[1.18] sm:tracking-[-0.015em]">
            The Unified Biomedicine Platform. Accelerating Next Era of{' '}
            <span class="bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text font-semibold text-transparent">Life Science</span> Research.
          </h1>

          <p class="mt-3 text-[1.1rem] font-semibold tracking-[-0.02em] text-slate-600 sm:mt-5 sm:text-[1.1rem] lg:mt-7 lg:text-[1.45rem]">
            Manifesting Personalized Drugs
          </p>

          <small class="mt-2 max-w-[34ch] text-[0.9rem] font-normal leading-5 tracking-[-0.015em] text-ink-4 sm:mt-3 sm:text-[0.9rem] sm:leading-6 lg:mt-4 lg:text-lg lg:leading-7">
            A Biotech R&amp;D from{' '}
            <a
              href={import.meta.env.VITE_BIOLABS_URL || 'https://www.biolabsltd.com'}
              target="_blank"
              rel="noreferrer"
              class="font-medium text-ink-2 underline decoration-ink-2/30 underline-offset-4 transition-colors hover:text-blue-600 hover:decoration-blue-600/50"
            >
              Biolabs
            </a>
          </small>
        </article>

        <figure class="hero-visual relative isolate flex min-h-0 flex-col items-center justify-center gap-3 sm:gap-5 lg:gap-6">
          <div class="relative w-full max-w-[680px]">
            <span class="hero-fog pointer-events-none absolute inset-x-[8%] inset-y-[16%] rounded-[3rem] bg-white/28 blur-3xl" />
            <span class="hero-reflection pointer-events-none absolute right-[12%] top-[8%] h-24 w-[56%] rounded-full bg-white/55 blur-3xl" />
            <span class="hero-particles pointer-events-none absolute inset-[12%] rounded-[3rem] opacity-70" />
            <img
              src={proteinBanner}
              alt="Protein banner"
              class="hero-image relative z-10 mx-auto block max-h-[39vh] w-full object-contain object-center sm:max-h-[44vh] lg:max-h-[56vh]"
            />
          </div>
          <div class="relative z-10">
            <StartExperimentButton>Start Experimenting</StartExperimentButton>
          </div>
        </figure>
      </div>
    </section>
  )
}
