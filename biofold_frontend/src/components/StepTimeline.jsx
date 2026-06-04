import { For } from 'solid-js'

export default function StepTimeline(props) {
  return (
    <div class="relative">
      <div class="absolute inset-y-0 left-[0.925rem] w-24 -translate-x-1/2 rounded-full bg-[linear-gradient(180deg,rgba(34,211,238,0)_0%,rgba(34,211,238,0.06)_22%,rgba(56,189,248,0.06)_70%,rgba(56,189,248,0)_100%)] blur-xl" />
      <span class="brand-gradient-line absolute bottom-4 left-[0.925rem] top-4 w-px -translate-x-1/2" />

      <div class="relative flex flex-col gap-8">
        <For each={props.items}>
          {(layer, index) => (
            <div class="group relative flex items-center gap-6 sm:gap-8">
              <div class="relative z-10 flex h-[2.2rem] w-[2.2rem] shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-[linear-gradient(180deg,rgba(34,211,238,0.1)_0%,rgba(34,211,238,0.02)_100%)] backdrop-blur-md transition-all duration-500 ease-out group-hover:scale-110 group-hover:border-cyan-300/50">
                <span class="text-[0.95rem] font-bold text-white">
                  {index() + 1}
                </span>
              </div>
              <div class="flex flex-col justify-center">
                <h4 class="text-[1.15rem] font-medium tracking-[-0.01em] text-white/95 sm:text-[1.2rem]">
                  {layer.title}
                </h4>
                {layer.detail && (
                  <p class="mt-1 text-[0.93rem] font-light tracking-[0.005em] text-white/55">
                    {layer.detail}
                  </p>
                )}
              </div>
            </div>
          )}
        </For>
      </div>
    </div>
  )
}
