const WIDTH = {
  content: 'max-w-content',
  wide:    'max-w-wide',
  bleed:   'max-w-bleed',
}

export default function ContentContainer(props) {
  const width = WIDTH[props.width ?? 'wide']
  const extra = props.class ?? ''

  return (
    <div class={`relative z-10 mx-auto w-full ${width} px-5 sm:px-8 lg:px-12 ${extra}`}>
      {props.children}
    </div>
  )
}
