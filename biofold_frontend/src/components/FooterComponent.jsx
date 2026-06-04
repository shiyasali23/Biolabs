import { For } from 'solid-js'
import BrandMark from './BrandMark.jsx'
import footerData from '../jsons/footer.json'

export default function FooterComponent() {
  return (
    <footer class="relative overflow-hidden border-t border-slate-800/50 bg-brand-1000 pb-6 pt-12 sm:pt-14">
      <div class="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
      <div class="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[800px] -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12)_0%,transparent_70%)] blur-3xl" />

      <div class="relative z-10 mx-auto max-w-wide px-6 sm:px-8 lg:px-12">
        <div class="mb-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">

          <div class="flex flex-col items-start lg:col-span-5">
            <div class="mb-6">
              <BrandMark tone="light" size="large" />
            </div>
            <p class="max-w-sm text-[clamp(1.5rem,3vw,2.5rem)] font-bold leading-tight tracking-tight text-white">
              <span class="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Accelerating</span> Life Science.
            </p>
          </div>

          <div class="grid grid-cols-2 gap-8 lg:col-span-7">
            <For each={footerData.groups}>
              {(group) => (
                <div class="flex flex-col gap-6">
                  <h3 class="text-[0.85rem] font-semibold uppercase tracking-widest text-white opacity-90">
                    {group.title}
                  </h3>
                  <ul class="flex flex-col gap-4">
                    <For each={group.items}>
                      {(item) => (
                        <li>
                          <a
                            href={item.href}
                            class="text-[0.95rem] font-light text-slate-400 transition-colors duration-300 hover:text-cyan-400"
                          >
                            {item.label}
                          </a>
                        </li>
                      )}
                    </For>
                  </ul>
                </div>
              )}
            </For>
          </div>
        </div>

        <div class="flex flex-col items-center justify-center gap-6 border-t border-white/10 pb-4 pt-8 sm:flex-row">
          <p class="text-[0.85rem] font-light text-slate-500">
            &copy; {new Date().getFullYear()} Biofold Ltd. All rights reserved.
          </p>
        </div>
      </div>

      <div class="pointer-events-none absolute -bottom-4 left-1/2 flex w-full -translate-x-1/2 select-none justify-center overflow-hidden leading-none opacity-[0.02]">
        <span class="brand-techno whitespace-nowrap text-[22vw] font-bold tracking-widest text-white">
          BIOFOLD
        </span>
      </div>
    </footer>
  )
}
