const TONE = {
  error:   { box: 'border-rose-300 bg-rose-50',   code: 'text-rose-700',  message: 'text-rose-800' },
  warning: { box: 'border-amber-300 bg-amber-50', code: 'text-amber-700', message: 'text-amber-800' },
}

export default function NoticeComponent(props) {
  const tone = () => TONE[props.tone] || TONE.error
  return (
    <div class={`rounded-xl border px-3 py-2 ${tone().box}`}>
      <span class={`font-mono text-[0.62rem] font-bold uppercase tracking-[0.12em] ${tone().code}`}>{props.code}</span>
      <p class={`mt-0.5 font-sans text-[0.76rem] ${tone().message}`}>{props.message}</p>
    </div>
  )
}
