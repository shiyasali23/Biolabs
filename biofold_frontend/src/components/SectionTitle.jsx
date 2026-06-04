const TONE = {
  ink:   'text-ink-1',
  light: 'text-white',
}

export default function SectionTitle(props) {
  const accent = props.accent ?? 'bar'
  const align  = props.align  ?? 'left'
  const tone   = TONE[props.tone ?? 'ink']
  const wrapJustify = align === 'center' ? 'items-center text-center' : 'items-start text-left'

  if (accent === 'bar') {
    return (
      <h2 class={`flex items-center gap-3 sm:gap-4 ${tone}`}>
        <span aria-hidden="true" class="h-7 w-1 rounded-sm bg-gradient-to-b from-emerald-500 to-cyan-600 sm:h-9 lg:h-11" />
        <span class="font-sans text-h2 font-extrabold uppercase">
          {props.children}
        </span>
      </h2>
    )
  }

  const underlineAlign = align === 'center' ? 'mx-auto' : ''

  return (
    <header class={`flex flex-col gap-4 ${wrapJustify}`}>
      <h2 class={`font-sans text-h2 font-bold ${tone}`}>{props.children}</h2>
      <div class={`${underlineAlign} h-px w-24 bg-silver-underline`} />
    </header>
  )
}
