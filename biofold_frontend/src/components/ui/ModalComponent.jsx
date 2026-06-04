import { Show, createEffect, onCleanup } from 'solid-js'
import { Portal } from 'solid-js/web'

export default function ModalComponent(props) {
  createEffect(() => {
    if (!props.open) return
    const onKey = (e) => { if (e.key === 'Escape') props.onClose?.() }
    window.addEventListener('keydown', onKey)
    onCleanup(() => window.removeEventListener('keydown', onKey))
  })

  return (
    <Show when={props.open}>
      <Portal>
        <div class={`fixed inset-0 z-[100] flex items-center justify-center ${props.overlayClass || 'p-4'}`} onClick={props.onClose}>
          <div class={`absolute inset-0 backdrop-blur-sm ${props.backdropClass || 'bg-ink-1/40'}`} />
          <div class={`relative ${props.panelClass}`} onClick={(e) => e.stopPropagation()}>
            <header class="flex items-center justify-between border-b border-hairline px-5 py-3">
              <div class="flex items-baseline gap-3">
                <h3 class="font-sans text-[0.95rem] font-semibold text-ink-1">{props.title}</h3>
                <Show when={props.subtitle != null}>
                  <span class="font-mono text-[0.66rem] text-ink-5">{props.subtitle}</span>
                </Show>
              </div>
              <button type="button" onClick={props.onClose} class="rounded-full border border-hairline px-3 py-1 font-mono text-[0.7rem] text-ink-4 transition-colors hover:border-ink-3 hover:text-ink-1">✕ close</button>
            </header>
            {props.children}
          </div>
        </div>
      </Portal>
    </Show>
  )
}
