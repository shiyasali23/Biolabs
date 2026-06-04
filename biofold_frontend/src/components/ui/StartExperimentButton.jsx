import { A } from '@solidjs/router'
import { For } from 'solid-js'

const SPARKLES = [
  { left: 7,  top: 26, size: 1.4, delay: 0.0, duration: 3.2, blue: false },
  { left: 13, top: 68, size: 1.0, delay: 1.4, duration: 2.6, blue: true  },
  { left: 19, top: 38, size: 1.6, delay: 0.7, duration: 3.8, blue: false },
  { left: 25, top: 76, size: 0.9, delay: 2.1, duration: 2.9, blue: false },
  { left: 31, top: 22, size: 1.2, delay: 0.3, duration: 3.4, blue: true  },
  { left: 37, top: 58, size: 1.0, delay: 1.8, duration: 2.7, blue: false },
  { left: 43, top: 32, size: 1.4, delay: 2.5, duration: 3.1, blue: false },
  { left: 49, top: 72, size: 1.1, delay: 0.9, duration: 3.6, blue: true  },
  { left: 55, top: 26, size: 1.0, delay: 1.6, duration: 2.8, blue: false },
  { left: 61, top: 62, size: 1.3, delay: 0.4, duration: 3.3, blue: false },
  { left: 67, top: 36, size: 0.9, delay: 2.3, duration: 3.0, blue: true  },
  { left: 73, top: 70, size: 1.5, delay: 1.2, duration: 3.7, blue: false },
  { left: 79, top: 28, size: 1.1, delay: 0.6, duration: 2.5, blue: false },
  { left: 85, top: 60, size: 1.3, delay: 2.0, duration: 3.5, blue: true  },
  { left: 91, top: 34, size: 1.0, delay: 1.5, duration: 2.9, blue: false },
]

export default function StartExperimentButton(props) {
  const label = props.children ?? 'Start Experimenting'
  const href = props.href ?? '/lab'

  return (
    <A
      href={href}
      class="start-btn group relative inline-flex items-baseline justify-center gap-1 overflow-visible whitespace-nowrap rounded-full px-3 py-1.5 sm:gap-1.5 sm:px-9 sm:py-3.5 lg:px-10 lg:py-4"
    >
      <span class="start-btn__ring pointer-events-none absolute -inset-[2px] rounded-full" />
      <span class="start-btn__halo pointer-events-none absolute -inset-3 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

      <span class="start-btn__fill pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <span class="start-btn__particles pointer-events-none absolute inset-0">
          <For each={SPARKLES}>
            {(s) => (
              <span
                class={`start-btn__sparkle${s.blue ? ' start-btn__sparkle--blue' : ''}`}
                style={`left:${s.left}%; top:${s.top}%; width:${s.size}px; height:${s.size}px; animation-delay:${s.delay}s; animation-duration:${s.duration}s`}
              />
            )}
          </For>
        </span>
        <span class="start-btn__glass pointer-events-none absolute inset-0" />
      </span>

      <span class="start-btn__bezel pointer-events-none absolute inset-0 rounded-full" />

      <span class="relative z-10 text-[0.62rem] font-medium tracking-[-0.005em] text-white sm:text-[0.95rem] lg:text-[1rem]">
        {label}
      </span>

      <span class="start-btn__chevron relative z-10 inline-block text-[0.58rem] font-semibold leading-none text-white sm:text-[0.9rem] lg:text-[0.95rem]">
        &gt;&gt;
      </span>
    </A>
  )
}
