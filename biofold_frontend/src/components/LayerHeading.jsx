export default function LayerHeading(props) {
  return (
    <div class="relative z-10 mx-auto flex w-full max-w-content flex-col items-center gap-4 px-5 py-14 text-center sm:px-8 sm:py-20 lg:px-12">
      <h2 class="font-sans text-h1 font-medium text-ink-1">
        {props.children}
      </h2>
      <div class="h-px w-20 bg-gradient-to-r from-transparent via-brand-700 to-transparent" />
    </div>
  )
}
