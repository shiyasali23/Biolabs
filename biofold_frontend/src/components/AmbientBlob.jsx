const TONE = {
  brand:     'rgba(58, 111, 216, 0.14)',
  brandSoft: 'rgba(109, 160, 255, 0.14)',
  leaf:      'rgba(109, 181, 142, 0.12)',
  leafSoft:  'rgba(124, 196, 170, 0.18)',
  cyan:      'rgba(34, 211, 238, 0.12)',
}

const POS = {
  tl: 'left-[8%] top-[14%]',
  tr: 'right-[10%] top-[28%]',
  bl: 'bottom-[12%] left-[34%]',
  br: 'bottom-10 right-[8%]',
  cl: 'left-[10%] top-[16%]',
}

const SIZE = {
  sm: 'h-40 w-40',
  md: 'h-56 w-56',
  lg: 'h-72 w-72',
  xl: 'h-80 w-80',
}

export default function AmbientBlob(props) {
  const color = TONE[props.tone ?? 'brand']
  const pos   = POS[props.pos  ?? 'tl']
  const size  = SIZE[props.size ?? 'lg']

  return (
    <span
      aria-hidden="true"
      class={`pointer-events-none absolute rounded-full blur-3xl ${pos} ${size}`}
      style={`background: radial-gradient(circle, ${color}, transparent 70%);`}
    />
  )
}
