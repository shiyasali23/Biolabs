const TONE = {
  pmid:    { c: '#7c3aed', label: 'PMID' },
  chembl:  { c: '#0891b2', label: 'ChEMBL' },
  uniprot: { c: '#059669', label: 'UniProt' },
  mesh:    { c: '#e11d48', label: 'MeSH' },
  hgnc:    { c: '#d97706', label: 'HGNC' },
  nct:     { c: '#1e47a8', label: 'NCT' },
  hpo:     { c: '#0891b2', label: 'HPO' },
  pdb:     { c: '#3a6fd8', label: 'PDB' },
  generic: { c: '#4f5f77', label: '' },
}

function classify(v) {
  if (/^PMID/i.test(v)) return 'pmid'
  if (/^CHEMBL/i.test(v)) return 'chembl'
  if (/^[A-NR-Z][0-9][A-Z0-9]{3}[0-9]$/.test(v)) return 'uniprot'
  if (/^(MeSH:)?D\d{6}$/.test(v)) return 'mesh'
  if (/^HGNC/i.test(v)) return 'hgnc'
  if (/^NCT\d{8}$/.test(v)) return 'nct'
  if (/^HP:\d+$/.test(v)) return 'hpo'
  return 'generic'
}

function href(kind, v) {
  const digits = v.replace(/\D/g, '')
  if (kind === 'pmid') return `${import.meta.env.VITE_PUBMED_URL || 'https://pubmed.ncbi.nlm.nih.gov'}/${digits}/`
  if (kind === 'pdb') return `${import.meta.env.VITE_RCSB_STRUCTURE_URL || 'https://www.rcsb.org/structure'}/${v}`
  if (kind === 'uniprot') return `${import.meta.env.VITE_UNIPROT_URL || 'https://www.uniprot.org/uniprotkb'}/${v}`
  if (kind === 'chembl') return `${import.meta.env.VITE_CHEMBL_URL || 'https://www.ebi.ac.uk/chembl/compound_report_card'}/${v}/`
  return null
}

export default function EntityPillLab(props) {
  const kind = props.kind || classify(props.value)
  const tone = TONE[kind] || TONE.generic
  const link = href(kind, props.value)
  const body = (
    <span
      class="inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[0.66rem] font-semibold"
      style={`color:${tone.c}; background:${tone.c}10; border-color:${tone.c}33;`}
    >
      {props.value}
    </span>
  )
  return link
    ? <a href={link} target="_blank" rel="noreferrer" class="no-underline transition-opacity hover:opacity-75">{body}</a>
    : body
}
