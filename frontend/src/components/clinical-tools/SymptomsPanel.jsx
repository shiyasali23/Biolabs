"use client";
import { headingCase } from "@/lib/heading-case";
import { useMemo } from 'react';
import { ChevronDown, X } from 'lucide-react';
import styles from './SymptomsPanel.module.css';

function groupSymptoms(names, maps, categories) {
  const symptoms = names.filter(name => !maps[name]);
  const available = new Set(symptoms);
  const groups = Object.entries(categories).map(([label, items]) => [label, items.filter(name => available.has(name))]).filter(([,items]) => items.length);
  const grouped = new Set(groups.flatMap(([,items]) => items));
  const remaining = symptoms.filter(name => !grouped.has(name));
  if (remaining.length) groups.push(['Other symptoms', remaining]);
  return groups;
}

export default function SymptomsPanel({ id, names, maps, categories, values, selected, busy, onChange, onClear, contextFields }) {
  const groups = useMemo(() => groupSymptoms(names, maps, categories), [names, maps, categories]);
  const option = name => <label className={styles.option} key={name}><input type="checkbox" disabled={busy} checked={Number(values[name]) === 1} onChange={event => onChange(name, event.target.checked ? 1 : 0)}/><span>{name}</span></label>;
  const group = ([label,items]) => <details className={styles.group} key={label}>
          <summary data-clinical-initial-focus={label === groups[0]?.[0] ? '' : undefined}><span>{headingCase(label.replace(/ Symptoms$/,''))}</span><span className={styles.groupCount}>{items.filter(name => Number(values[name]) === 1).length || ''}</span><ChevronDown size={16} aria-hidden="true"/></summary>
          <div className={styles.options}>{items.map(option)}</div>
        </details>;
  return <div className={styles.layout}>
    <section className={styles.picker} aria-label="Symptoms">
      <div className={styles.categories} aria-label="Available symptoms">
        {groups.map(group)}
      </div>
    </section>
    <aside className={styles.selection} aria-labelledby={`${id}-selection`}>
      <div className={styles.context}>{contextFields}</div>
      <div className={styles.selectionHeading}><h2 id={`${id}-selection`}>Selected <span>{selected.length}</span></h2>{selected.length > 0 && <button type="button" className={styles.clear} disabled={busy} onClick={onClear}>Clear</button>}</div>
      {selected.length > 0 && <ul className={styles.selected}>{selected.map(name => <li key={name}><span>{name}</span><button type="button" disabled={busy} aria-label={`Remove ${name}`} onClick={() => onChange(name, 0)}><X size={14} aria-hidden="true"/></button></li>)}</ul>}
    </aside>
  </div>;
}
