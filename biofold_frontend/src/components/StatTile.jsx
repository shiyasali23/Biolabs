import CountUp from './CountUp.jsx'

export default function StatTile(props) {
  if (props.variant === 'more') {
    return (
      <article class="flex min-h-[110px] items-center justify-between gap-4 rounded-card border border-white/[0.1] bg-[linear-gradient(180deg,rgba(20,55,126,0.55)_0%,rgba(10,32,77,0.85)_100%)] p-4 sm:p-6 lg:px-8">
        <p class="text-[1.05rem] font-medium leading-tight tracking-[-0.005em] text-white">
          And Many More
        </p>
        <span class="and-more-arrows text-[1.6rem] font-semibold leading-none">&gt;&gt;&gt;</span>
      </article>
    )
  }

  const labelMaxWidth = props.size === 'sm' ? 'max-w-[16ch]' : 'max-w-[14ch]'
  const valueClass = props.size === 'sm'
    ? 'text-[1.5rem] sm:text-[2rem]'
    : 'text-[1.6rem] sm:text-[2.1rem]'

  return (
    <article class="flex min-h-[110px] flex-col items-start justify-center gap-1 rounded-card border border-white/[0.06] bg-night-tile p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-6 lg:px-8">
      <p class={`${labelMaxWidth} text-[0.78rem] font-medium uppercase leading-tight tracking-[0.12em] text-white sm:text-[0.85rem] sm:tracking-[0.14em]`}>
        {props.label}
      </p>
      <p class={`${valueClass} shrink-0 font-semibold leading-none text-white`}>
        <CountUp value={props.value} unit={props.unit} start={props.start} delay={props.delay ?? 0} />
      </p>
    </article>
  )
}
