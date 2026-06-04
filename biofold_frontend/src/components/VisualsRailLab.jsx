import { For, Show, createMemo, createSignal, lazy } from 'solid-js'

const MoleculeView = lazy(() => import('./ui/MoleculeView.jsx'))
const StructureView = lazy(() => import('./ui/StructureView.jsx'))

function Card(props) {
  return (
    <div class="flex flex-col gap-3 rounded-xl border border-hairline bg-surface p-3.5">
      <span class="font-mono text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-ink-5">{props.label}</span>
      {props.children}
    </div>
  )
}

export default function VisualsRailLab(props) {
  const visuals = () => props.state.visuals
  const structures = () => visuals().structures || []
  const [activePdb, setActivePdb] = createSignal(null)
  const currentPdb = createMemo(() => activePdb() || (structures()[0] && structures()[0].pdb))

  return (
    <>
      <Show when={visuals().molecule}>
        <Card label={visuals().molecule.name ? `2D Molecule · ${visuals().molecule.name}` : '2D Molecule'}>
          <div class="h-[220px] w-full"><MoleculeView smiles={visuals().molecule.smiles} width={440} height={220} /></div>
          <code class="break-all font-mono text-[0.62rem] text-ink-5">{visuals().molecule.smiles}</code>
        </Card>
      </Show>

      <Show when={structures().length}>
        <Card label={`3D Structure · PDB ${currentPdb() || ''}`}>
          <div class="h-[280px] w-full">
            <Show when={currentPdb()}><StructureView pdbId={currentPdb()} /></Show>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <For each={structures()}>
              {(s) => (
                <button
                  type="button"
                  onClick={() => setActivePdb(s.pdb)}
                  class={`rounded-md border px-2 py-1 font-mono text-[0.64rem] transition-colors ${currentPdb() === s.pdb ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-hairline text-ink-4 hover:border-brand-300'}`}
                >
                  {s.pdb}{s.resolution ? ` · ${s.resolution}Å` : ''}{s.method ? ` · ${s.method}` : ''}
                </button>
              )}
            </For>
          </div>
        </Card>
      </Show>
    </>
  )
}
