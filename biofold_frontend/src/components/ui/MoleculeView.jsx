import { createEffect, createSignal } from 'solid-js'

let smilesModPromise = null
function loadSmilesDrawer() {
  if (!smilesModPromise) smilesModPromise = import('smiles-drawer')
  return smilesModPromise
}

export default function MoleculeView(props) {
  let svgRef
  const [error, setError] = createSignal(null)

  createEffect(async () => {
    const smiles = props.smiles
    if (!smiles || !svgRef) return
    try {
      const mod = await loadSmilesDrawer()
      const SD = mod.default ?? mod
      const drawer = new SD.SvgDrawer({
        width: props.width ?? 300,
        height: props.height ?? 220,
        bondThickness: 1.1,
        bondLength: 20,
        themes: {
          light: {
            C: '#0b1a33', N: '#1e47a8', O: '#e11d48', F: '#059669', CL: '#059669',
            BR: '#7c3aed', I: '#7c3aed', P: '#d97706', S: '#ca8a04', B: '#0891b2',
            BACKGROUND: 'transparent',
          },
        },
      })
      SD.parse(
        smiles,
        (tree) => { svgRef.innerHTML = ''; drawer.draw(tree, svgRef, 'light'); setError(null) },
        (err) => { setError(String(err)); console.warn('[2D] SMILES parse failed', { chars: (smiles || '').length, error: String(err) }) },
      )
    } catch (e) {
      setError(String(e))
      console.warn('[2D] molecule render failed', { error: String(e) })
    }
  })

  return (
    <div class="flex h-full w-full items-center justify-center">
      {error() ? (
        <span class="font-mono text-[0.6rem] text-ink-5">2D render unavailable</span>
      ) : (
        <svg ref={(el) => (svgRef = el)} viewBox={`0 0 ${props.width ?? 300} ${props.height ?? 220}`} class="block h-full w-full max-h-[220px]" />
      )}
    </div>
  )
}
