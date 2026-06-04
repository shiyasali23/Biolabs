const RCSB_DOWNLOAD = import.meta.env.VITE_RCSB_DOWNLOAD_URL || 'https://files.rcsb.org/download'

export class StructureApi {
  async fetchPdb(pdbId) {
    const id = String(pdbId || '').trim().toUpperCase()
    if (!id) throw new Error('missing PDB id')
    console.log('[3D] fetching PDB', { id })
    const response = await fetch(`${RCSB_DOWNLOAD}/${id}.pdb`)
    if (!response.ok) throw new Error(`PDB ${id} not found (HTTP ${response.status})`)
    return response.text()
  }
}
