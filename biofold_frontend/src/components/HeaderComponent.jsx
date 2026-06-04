import { A } from '@solidjs/router'
import { For } from 'solid-js'
import BrandMark from './BrandMark.jsx'
import navItems from '../jsons/nav.json'

export default function HeaderComponent() {
  return (
    <header class="relative z-50 mx-auto flex w-full max-w-wide items-center justify-between px-6 pt-6 sm:px-8 lg:px-12 lg:pt-8">
      <BrandMark tone="ink" />

      <nav class="flex items-center gap-4">
        <For each={navItems}>
          {(item) => (
            <A
              href={item.href}
              class="inline-flex items-center justify-center rounded-full border border-slate-200/80 bg-white/60 px-3 py-1.5 text-[0.72rem] font-semibold tracking-tight text-ink-2 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-blue-300 hover:bg-blue-50/90 hover:text-blue-700 hover:shadow-md sm:px-5 sm:py-2 sm:text-[0.9rem] lg:px-6 lg:py-2.5 lg:text-[0.95rem]"
            >
              {item.label}
            </A>
          )}
        </For>
      </nav>
    </header>
  )
}
