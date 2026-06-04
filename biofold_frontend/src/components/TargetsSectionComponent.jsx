import targetsBg from '../assets/banners/targets_bg.png'
import targets from '../jsons/targets.json'
import BulletList from './BulletList.jsx'

export default function TargetsSectionComponent() {
  return (
    <section class="relative mb-4 mt-8 flex w-full justify-end overflow-hidden py-0 lg:mt-16">
      <div class="relative w-[95%] max-w-[1500px] sm:w-[90%] lg:w-[85%]">
        <img
          src={targetsBg}
          alt="Target visualization"
          class="h-[320px] w-full rounded-l-[2.5rem] object-cover object-right sm:h-[380px] lg:h-[420px] xl:h-[480px]"
        />

        <div class="pointer-events-none absolute inset-0 z-0 rounded-l-[2.5rem] bg-gradient-to-r from-[#030b17]/60 via-[#030b17]/20 to-transparent via-50%" />

        <div class="absolute inset-0 z-10 flex flex-col justify-center px-4 py-8 sm:px-10 lg:px-16 xl:px-20">
          <div class="relative max-w-lg overflow-hidden rounded-[2rem] p-6 sm:p-10 lg:p-12 xl:max-w-2xl">
            <div class="relative z-10">
              <header class="mb-5 sm:mb-8 lg:mb-10">
                <h2 class="text-[clamp(1.5rem,3vw,3rem)] font-bold leading-[1.05] tracking-[-0.04em] text-white">
                  What We <br/>
                  <span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-[1.25em] font-extrabold text-transparent drop-shadow-lg">Target</span>
                </h2>
              </header>

              <BulletList items={targets} tone="cyan" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
