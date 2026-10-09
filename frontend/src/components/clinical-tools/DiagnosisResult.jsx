import { headingCase } from "@/lib/heading-case";
import { ChevronDown } from 'lucide-react';
import styles from './DiagnosisResult.module.css';

const reportSections = [['medications', 'Medications'], ['precautions', 'Precautions'], ['diets', 'Diet']];
const listOf = value => (Array.isArray(value) ? value : value ? [value] : []).map(item => typeof item === 'string' ? item : item?.name).filter(Boolean);

export default function DiagnosisResult({ result, selected, resultRef }) {
  const scores = Object.entries(result.probabilities || {}).sort((a, b) => Number(b[1]) - Number(a[1]));
  const sections = reportSections.map(([key, title]) => ({ key, title, items: listOf(result[key]) })).filter(section => section.items.length);
  const scoreRows = rows => rows.map(([label, raw]) => {
    const available = raw !== '' && raw != null && Number.isFinite(Number(raw));
    const value = available ? Math.max(0, Math.min(100, Number(raw))) : 0;
    return <div className={styles.score} key={label} data-predicted={label === result.prediction || undefined}>
      <dt>{label}</dt><dd><span className={styles.track} aria-hidden="true"><span style={{ width: `${value}%` }}/></span><span className={styles.percent}>{available ? `${Number(raw).toFixed(1)}%` : 'Unavailable'}</span></dd>
    </div>;
  });
  return <section className={styles.result} ref={resultRef} tabIndex={-1} aria-label="Analysis result">
    <p className="sr-only" role="status">Assessment complete. Model prediction: {result.prediction}</p>
    <header className={styles.heading}><p>Model prediction</p><h2>{headingCase(result.prediction)}</h2>{result.description && <p className={styles.description}>{result.description}</p>}</header>
    <div className={styles.layout}>
      <div className={styles.report}>
        {sections.map(({ key, title, items }) => <section className={styles.reportSection} key={key} aria-label={title}><h3>{title}</h3><ul>{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul></section>)}
        <details className={styles.reviewed} open={!sections.length}><summary><span>Symptoms reviewed <small>{selected.length}</small></span><ChevronDown size={16} aria-hidden="true"/></summary><ul>{selected.map(name => <li key={name}>{name}</li>)}</ul></details>
      </div>
      <aside className={styles.scores} aria-label="Model scores"><h3>Model Scores</h3>
        {scores.length ? <><dl>{scoreRows(scores.slice(0, 5))}</dl>{scores.length > 5 && <details className={styles.allScores}><summary>All scores<ChevronDown size={14} aria-hidden="true"/></summary><dl>{scoreRows(scores.slice(5))}</dl></details>}</> : <p className={styles.unavailable}>Scores unavailable</p>}
      </aside>
    </div>
  </section>;
}
