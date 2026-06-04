import { A } from '@solidjs/router'

const SIZE = {
  default: { img: 'h-9 w-auto sm:h-12 lg:h-16',    text: 'text-[1.1rem] sm:text-[1.5rem] lg:text-[1.85rem]' },
  large:   { img: 'h-16 w-auto',                    text: 'text-[1.85rem]' },
}

const TONE = {
  ink:   'text-[#0b172a]',
  light: 'text-white',
}

export default function BrandMark(props) {
  const size = SIZE[props.size ?? 'default']
  const tone = TONE[props.tone ?? 'ink']

  return (
    <A
      href="/"
      aria-label="Biofold home"
      class="group flex items-center gap-1.5 transition-all duration-300 hover:opacity-80"
    >
      <img
        src="/logo/no_bg_logo.png"
        alt="Biofold logo"
        class={`${size.img} object-contain transition-transform duration-500 group-hover:scale-105`}
      />
      <span class={`brand-techno mt-0.5 font-bold tracking-[0.08em] ${size.text} ${tone}`}>
        Biofold
      </span>
    </A>
  )
}
