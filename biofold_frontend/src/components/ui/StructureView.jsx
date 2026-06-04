import { createEffect, createSignal, onCleanup } from 'solid-js'
import { StructureApi } from '../../lib/StructureApi.js'

let molModPromise = null
function load3Dmol() {
  if (!molModPromise) molModPromise = import('3dmol')
  return molModPromise
}

const structureApi = new StructureApi()

export default function StructureView(props) {
  let hostRef
  let viewer = null
  let requestId = 0
  const [status, setStatus] = createSignal('loading')

  createEffect(async () => {
    const pdb = props.pdbId
    if (!pdb || !hostRef) return
    const current = ++requestId
    setStatus('loading')
    try {
      const mod = await load3Dmol()
      if (current !== requestId) return
      const data = await structureApi.fetchPdb(pdb)
      if (current !== requestId) return
      const $3Dmol = mod.default ?? mod
      if (viewer) { try { viewer.clear() } catch {} viewer = null }
      hostRef.innerHTML = ''
      viewer = $3Dmol.createViewer(hostRef, { backgroundColor: 'white' })
      viewer.addModel(data, 'pdb')
      viewer.setStyle({}, { cartoon: { color: 'spectrum' } })
      viewer.zoomTo()
      viewer.render()
      setStatus('ok')
      console.log('[3D] structure rendered', { pdbId: pdb })
    } catch (e) {
      if (current === requestId) {
        setStatus('error')
        console.warn('[3D] structure unavailable', { pdbId: pdb, error: String(e) })
      }
    }
  })

  onCleanup(() => { try { viewer?.clear?.() } catch {} })

  return (
    <div class="relative h-full w-full overflow-hidden rounded-xl bg-surface-2">
      <div ref={(el) => (hostRef = el)} class="absolute inset-0" />
      {status() !== 'ok' && (
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="font-mono text-[0.6rem] text-ink-5">
            {status() === 'loading' ? `loading ${props.pdbId}…` : `3D unavailable (${props.pdbId})`}
          </span>
        </div>
      )}
    </div>
  )
}
