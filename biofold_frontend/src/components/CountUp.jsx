import { createEffect, createSignal, onCleanup } from 'solid-js'

function formatValue(value) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

export default function CountUp(props) {
  const [displayValue, setDisplayValue] = createSignal(0)
  let frameId = 0

  createEffect(() => {
    if (!props.start) return

    const startedAt = performance.now()
    const durationMs = 1200 + (props.delay ?? 0)

    const step = (now) => {
      const progress = Math.min((now - startedAt) / durationMs, 1)
      const eased = 1 - Math.pow(1 - progress, 4)
      const nextValue = props.value * eased

      setDisplayValue(nextValue)

      if (progress < 1) {
        frameId = requestAnimationFrame(step)
        return
      }

      setDisplayValue(props.value)
    }

    frameId = requestAnimationFrame(step)
  })

  onCleanup(() => cancelAnimationFrame(frameId))

  return (
    <span class="stat-number">
      {formatValue(displayValue())}
      {props.unit}+
    </span>
  )
}
