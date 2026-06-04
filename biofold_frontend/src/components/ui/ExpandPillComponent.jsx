export default function ExpandPillComponent(props) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      class="mt-1 shrink-0 rounded-full border border-hairline bg-surface-1 px-3 py-1 font-sans text-[0.65rem] font-semibold uppercase tracking-wider text-ink-4 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 shadow-sm"
    >
      {props.children}
    </button>
  )
}
