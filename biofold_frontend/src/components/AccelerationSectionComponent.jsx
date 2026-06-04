import { For } from 'solid-js'
import accelerationBanner from '../assets/banners/acceleration_banner.jpg'
import items from '../jsons/acceleration.json'
import SectionTitle from './SectionTitle.jsx'
import UseCaseCard from './UseCaseCard.jsx'

export default function AccelerationSectionComponent() {
  return (
    <section class="mt-0 flex w-full justify-center px-4 py-0 sm:px-6 lg:-mt-4 lg:px-8">
      <div class="relative w-full max-w-[1400px] overflow-hidden rounded-[2.5rem] border border-slate-200/50 bg-[#fafafa]/80 shadow-2xl backdrop-blur-3xl">
        <img
          src={accelerationBanner}
          alt=""
          class="pointer-events-none absolute inset-x-0 bottom-0 h-[120px] w-full object-cover object-bottom sm:h-[150px] lg:h-[180px]"
        />

        <div class="relative z-10 flex flex-col items-center px-6 pb-28 pt-8 sm:px-10 sm:pb-32 sm:pt-10 lg:px-16 lg:pb-[13rem] lg:pt-12">
          <div class="mb-6 inline-block text-center lg:mb-10">
            <SectionTitle accent="underline" align="center">What Biofold Accelerates</SectionTitle>
          </div>

          <div class="grid w-full max-w-[80rem] grid-cols-1 gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            <For each={items}>
              {(item) => (
                <UseCaseCard title={item.title} quote={item.quote} result={item.result} />
              )}
            </For>
          </div>
        </div>
      </div>
    </section>
  )
}
