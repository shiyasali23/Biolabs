export default function UseCaseCard(props) {
  return (
    <article class="group flex flex-col gap-3">
      <div class="relative mb-1 pb-3">
        <h3 class="text-[1.1rem] font-bold tracking-[-0.01em] text-slate-900">
          {props.title}
        </h3>
        <div class="absolute bottom-0 left-0 h-px w-[85%] bg-gradient-to-r from-slate-200 via-slate-200/80 to-transparent" />
      </div>

      <div class="mt-1 flex flex-col gap-3">
        <div class="relative rounded-2xl border border-slate-200/60 bg-white/60 p-4 shadow-[inset_0_1px_4px_rgba(0,0,0,0.02)] backdrop-blur-md transition-colors duration-300 group-hover:bg-white/90">
          <p class="text-[0.9rem] font-medium leading-[1.6] text-slate-500">
            {props.quote}
          </p>
        </div>

        <div class="flex items-start gap-3 px-2">
          <div class="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50/80 text-blue-600">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </div>
          <p class="text-[0.9rem] font-medium leading-[1.6] text-slate-800">
            {props.result}
          </p>
        </div>
      </div>
    </article>
  )
}
