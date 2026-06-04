import { LABEL_COLOR, LABEL_COLOR_FALLBACK } from '../../utils/ResponseHandler.js'

export default function NodeStat(props) {
  const color = LABEL_COLOR[props.label] || LABEL_COLOR_FALLBACK
  
  return (
    <div 
      class="group flex items-center gap-1.5 rounded-md border px-2 py-[0.15rem] transition-all duration-300"
      style={`background-color: ${color}10; border-color: ${color}40;`}
    >
      <div class="relative flex h-1.5 w-1.5 items-center justify-center shrink-0">
        <span class="absolute inline-flex h-full w-full animate-pulse rounded-full opacity-60" style={`background-color:${color}`} />
        <span class="relative inline-flex h-1.5 w-1.5 rounded-full" style={`background-color:${color}; color:${color}`} />
      </div>
      <span 
        class="font-sans text-[0.62rem] font-bold uppercase tracking-[0.06em]"
        style={`color: ${color}`}
      >
        {props.label}
      </span>
      <span class="font-mono text-[0.7rem] font-extrabold tabular-nums text-slate-500 ml-0.5">
        {props.count}
      </span>
    </div>
  )
}
