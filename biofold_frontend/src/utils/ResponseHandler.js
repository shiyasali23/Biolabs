import { createStore, produce } from 'solid-js/store'

export const LABEL_COLOR_FALLBACK = '#4f5f77'

export const LABEL_COLOR = {
  Chemical: '#0891b2', Protein: '#059669', Gene: '#d97706', Disease: '#e11d48',
  Variant: '#7c3aed', AdverseEvent: '#db2777', Pathway: '#2563eb', PDBStructure: '#3a6fd8',
  ATCClass: '#0d9488', ClinicalTrial: '#1e47a8', Phenotype: '#0891b2', Publication: '#6d28d9',
  Organism: '#65a30d', Tissue: '#ca8a04', OntologyTerm: LABEL_COLOR_FALLBACK,
}

const NAME_KEYS = [
  'drug_name', 'chembl_preferred_compound_name', 'protein_name', 'gene_symbol', 'gene_name',
  'descriptor_name', 'name', 'title', 'reaction_meddra_pt', 'hpo_term_name', 'pathway_name',
  'trial_brief_title_text', 'organism_scientific_name', 'tissue_name', 'who_drug_name', 'concept_term_text',
]

export function entityName(entity) {
  const props = (entity && entity.props) || {}
  for (const key of NAME_KEYS) if (props[key]) return String(props[key])
  return (entity && entity.pk) || '—'
}

function cleanIntent(value) {
  if (typeof value !== 'string' || !value) return 'Working'
  if (!value.includes('_')) return value
  return value.split('_').map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(' ')
}

const DISCLAIMER_RE =
  /\s*\*?\s*(?:Note:?\s*)?(?:The\s+)?M2\s+(?:binding\s+)?model[^.]*class[- ]imbalance[^.]*\.(?:[^.\n]*(?:triage|ranking)[^.\n]*\.)?\s*\*?/gi

function stripDisclaimer(markdown) {
  if (typeof markdown !== 'string' || !markdown) return markdown || ''
  let out = markdown.replace(DISCLAIMER_RE, '')
  out = out.replace(/\n#+\s*Notes?\s*\n(\s*)$/i, '\n')
  return out.replace(/\n{3,}/g, '\n\n').trimEnd()
}

function grab(markdown, regex) {
  const match = markdown.match(regex)
  return match ? match[1] : null
}

function extractMolecule(markdown, entities) {
  let smiles = grab(markdown, /canonical\s*smiles[^`:\n]*[:`]\s*`?\s*([^`\n]+?)\s*`?\s*(?:\n|$)/i)
  if (smiles) smiles = smiles.replace(/`/g, '').trim()
  if (!smiles) {
    const codeSpans = [...markdown.matchAll(/`([^`\n]{8,})`/g)].map((m) => m[1])
    smiles = codeSpans.find((c) => /[a-z]/.test(c) && /[()=#@\[\]\\/]/.test(c) && !/\s/.test(c)) || null
  }
  if (!smiles) {
    const named = entities.find((e) => e.props && e.props.canonical_smiles && markdown.includes(entityName(e)))
    if (named) smiles = named.props.canonical_smiles
  }
  if (!smiles) return null
  const match = entities.find((e) => e.props && e.props.canonical_smiles === smiles)
  return { smiles, name: match ? entityName(match) : null }
}

function extractStructures(markdown, entities) {
  const pdbEntities = entities.filter((e) => e.label === 'PDBStructure')
  const pdbByPk = Object.fromEntries(pdbEntities.map((e) => [e.pk.toUpperCase(), e]))
  const structures = []
  const seen = new Set()

  const add = (rawId, context) => {
    const id = rawId.toUpperCase()
    if (seen.has(id) || !/[A-Za-z]/.test(id)) return
    seen.add(id)
    const resolution = context.match(/([0-9]+\.[0-9]+)/)
    const method = context.match(/(X-?RAY[^,\n|]*|NMR|CRYO[- ]?EM|ELECTRON[^,\n|]*|SOLUTION[^,\n|]*)/i)
    const entity = pdbByPk[id]
    structures.push({
      pdb: id,
      resolution: resolution ? resolution[1] : null,
      method: (method ? method[1].trim() : null) || (entity && entity.props && entity.props.method) || null,
    })
  }

  const sectionMatch = markdown.match(/#+\s*Structures?\b([\s\S]*?)(?:\n#+\s|\n*$)/i)
  if (sectionMatch) {
    const section = sectionMatch[1]
    const tokenRe = /\b([0-9][A-Za-z0-9]{3})\b/g
    let match
    while ((match = tokenRe.exec(section)) !== null) {
      add(match[1], section.slice(match.index + 4, match.index + 50))
    }
  } else {
    const keywordRe = /PDB[^0-9\n]{0,12}?([0-9][A-Za-z0-9]{3})\b/gi
    let match
    while ((match = keywordRe.exec(markdown)) !== null) {
      add(match[1], markdown.slice(match.index, match.index + 70))
    }
    for (const entity of pdbEntities) {
      if (markdown.toUpperCase().includes(entity.pk.toUpperCase())) add(entity.pk, '')
    }
  }
  return structures.slice(0, 6)
}

function extractBinding(markdown) {
  const scoreText = grab(markdown, /predicted[\s_]*(?:binding\s*)?score[^0-9\n]{0,10}([01]?\.\d+)/i)
  if (scoreText == null) return null
  const label =
    /strong_binder/i.test(markdown) ? 'strong_binder' :
    /weak_or_no_binder/i.test(markdown) ? 'weak_or_no_binder' :
    grab(markdown, /predicted[\s_]*label[^a-z\n]{0,8}([a-z_]+)/i)
  const band = grab(markdown, /confidence[\s_]*band[^a-z\n]{0,8}([a-z]+)/i)
  const measured = grab(markdown, /(?:measured[^0-9\n]{0,20}|pch?embl[^0-9\n]{0,8})([0-9]+\.[0-9]+)/i)
  return { score: scoreText, label: label || null, band: band || null, measured: measured || null }
}

function initialState() {
  return {
    status: 'idle',
    query: '',
    backend: '',
    counters: { turn: 0, maxTurns: 0, tokens: 0, elapsed: 0, evidence: 0 },
    turns: [],
    entities: [],
    relationships: [],
    finalAnswer: '',
    visuals: { molecule: null, structures: [], binding: null },
    warning: null,
    error: null,
  }
}

export class ResponseHandler {
  constructor() {
    const [state, setState] = createStore(initialState())
    this.state = state
    this.setState = setState
    this.timer = null
    this.startedAt = 0
    this.evidenceHandles = new Set()
  }

  reset() {
    this.stopTimer()
    this.evidenceHandles = new Set()
    this.setState(produce((s) => Object.assign(s, initialState())))
  }

  begin(query) {
    this.reset()
    this.startedAt = performance.now()
    this.setState(produce((s) => { s.status = 'streaming'; s.query = query }))
    this.timer = setInterval(() => {
      this.setState('counters', 'elapsed', Math.round((performance.now() - this.startedAt) / 1000))
    }, 250)
  }

  stopTimer() {
    if (this.timer) { clearInterval(this.timer); this.timer = null }
  }

  ingest(event) {
    const data = event.data || {}
    if (event.event === 'session_open') {
      console.log('[LAB] session open', { backend: data.inference_backend, maxTurns: data.max_turns })
      this.setState(produce((s) => {
        s.query = data.query || s.query
        s.backend = data.inference_backend || ''
        s.counters.maxTurns = data.max_turns || 0
      }))
      return
    }
    if (event.event === 'turn_start') {
      this.setState('counters', 'turn', data.turn || 0)
      return
    }
    if (event.event === 'turn_result') {
      const calls = (data.calls || []).map((c) => ({
        name: c.name,
        success: !!c.success,
        errorCode: c.error_code || null,
        elapsed: c.elapsed_seconds ?? null,
        handle: c.handle || null,
        summary: c.summary || null,
      }))
      for (const c of calls) {
        if (c.handle) this.evidenceHandles.add(c.handle)
        if (c.errorCode) console.warn('[KG] tool call error', { name: c.name, errorCode: c.errorCode })
      }
      const entities = data.entities || []
      const relationships = data.relationships || []
      const literature = data.literature || []
      const bioTables = data.bio_tables || []
      this.setState(produce((s) => {
        s.turns.push({
          turn: data.turn,
          intent: cleanIntent(data.intent),
          calls,
          entities,
          relationships,
          literature,
          bioTables,
        })
        if (entities.length) s.entities.push(...entities)
        if (relationships.length) s.relationships.push(...relationships)
        s.counters.evidence = this.evidenceHandles.size
      }))
      console.debug('[KG] turn', { turn: data.turn, intent: cleanIntent(data.intent), entities: entities.length, relationships: relationships.length, literature: literature.length, bioTables: bioTables.length })
      return
    }
    if (event.event === 'done') {
      this.stopTimer()
      console.log('[LAB] run done', { turns: data.turn_count, tokens: data.tokens_used, elapsedSec: data.elapsed_seconds })
      const answer = stripDisclaimer(data.final_answer || '')
      this.setState(produce((s) => {
        s.status = 'done'
        s.finalAnswer = answer
        s.counters.turn = data.turn_count ?? s.counters.turn
        s.counters.tokens = data.tokens_used ?? 0
        s.counters.elapsed = Math.round(data.elapsed_seconds ?? s.counters.elapsed)
        s.visuals = {
          molecule: extractMolecule(answer, s.entities),
          structures: extractStructures(answer, s.entities),
          binding: extractBinding(answer),
        }
      }))
      console.log('[VISUALS] extracted', { molecule: !!this.state.visuals.molecule, structures: this.state.visuals.structures.length, binding: !!this.state.visuals.binding })
      return
    }
    if (event.event === 'warning') {
      console.warn('[LAB] backend warning', { code: data.code, message: data.message })
      this.setState('warning', { code: data.code, message: data.message })
      return
    }
    if (event.event === 'error') {
      this.stopTimer()
      console.error('[LAB] backend error', { stage: data.stage, code: data.code, message: data.message })
      this.setState(produce((s) => {
        s.status = 'error'
        s.error = { stage: data.stage, code: data.code, message: data.message }
      }))
    }
  }

  fail(message) {
    this.stopTimer()
    console.error('[LAB] transport failure', { message })
    this.setState(produce((s) => {
      s.status = 'error'
      s.error = { stage: 'transport', code: 'ERR_TRANSPORT', message }
    }))
  }

  dispose() {
    this.stopTimer()
  }
}
