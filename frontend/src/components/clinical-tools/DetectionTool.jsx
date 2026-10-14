"use client";
import { headingCase } from "@/lib/heading-case";

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, ChevronDown, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/userContext';
import { getModels, getDiseasePredictions } from '@/lib/diagnosis-api';
import samples from '@/jsons/dummy-disease-detection-data.json';
import units from '@/jsons/clinical-measurement-units.json';
import { featuresOf, mapsOf, initialInputs, fieldError, readyToRun } from './model-utils.mjs';
import { outputsOf, updateMeasurement, scoreText } from './detection-utils.mjs';
import shared from './tools.module.css';
import styles from './DetectionTool.module.css';

const personal = ['Age', 'Gender', 'BMI'];
const unitFor = name => units[name]?.unit || ({ Age: 'years', BMI: 'kg/m²' })[name] || 'Unit not supplied';
const outcomeTone = label => ({ Negative: 'green', Healthy: 'green', Positive: 'red', Hepatitis: 'amber', Fibrosis: 'orange', Cirrhosis: 'red' })[label] || 'neutral';

function OutcomeRings({ model, result }) {
  const gradientId = useId().replaceAll(':', '');
  return <dl className={styles.outcomes} data-has-result={!!result?.prediction || undefined} style={{ gridTemplateColumns: `repeat(${outputsOf(model).length}, minmax(0, 1fr))`, maxWidth: `${outputsOf(model).length * 110}px` }}>{outputsOf(model).map(label => {
    const raw = result?.probabilities?.[label];
    const available = raw !== undefined && raw !== null && raw !== '' && Number.isFinite(Number(raw));
    const score = available ? Math.min(100, Math.max(0, Number(raw))) : null;
    return <div key={label} className={styles.outcome} data-tone={outcomeTone(label)} data-selected={result?.prediction === label || undefined}>
      <dt>{label}</dt><dd>{result?.prediction === label && <span className="sr-only">Predicted outcome: </span>}<svg viewBox="0 0 100 100" aria-hidden="true">
        <defs><linearGradient id={`${gradientId}-${label}-track`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--outcome-track)"/><stop offset=".5" stopColor="var(--outcome-sheen)"/><stop offset="1" stopColor="var(--outcome-track)"/></linearGradient>
        <linearGradient id={`${gradientId}-${label}-value`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="var(--outcome-light)"/><stop offset=".5" stopColor="var(--outcome-color)"/><stop offset="1" stopColor="var(--outcome-color)"/></linearGradient></defs>
        <circle className={styles.ringTrack} stroke={`url(#${gradientId}-${label}-track)`} cx="50" cy="50" r="40" pathLength="100" strokeDasharray="94 100" transform="rotate(-79.2 50 50)"/>
        {score > 0 && <circle className={styles.ringValue} stroke={`url(#${gradientId}-${label}-value)`} cx="50" cy="50" r="40" pathLength="100" strokeDasharray={`${score * .94} 100`} style={{ "--dash": score * .94 }} transform="rotate(-79.2 50 50)"/>}
      </svg>{available && <span className={styles.ringScore}>{scoreText(raw)}</span>}{!available && <span className="sr-only">{result ? 'Score unavailable' : 'Awaiting prediction'}</span>}</dd>
    </div>;
  })}</dl>;
}

export default function DetectionTool({ renderHeader }) {
  const { userData, latestBiometrics, isSample } = useUser();
  const [models, setModels] = useState(samples.models);
  const [activeId, setActiveId] = useState(null);
  const [entries, setEntries] = useState({});
  const [origins, setOrigins] = useState({});
  const [results, setResults] = useState({});
  const [errors, setErrors] = useState({});
  const [running, setRunning] = useState([]);
  const [touched, setTouched] = useState({});
  const [offline, setOffline] = useState(false);
  const [retry, setRetry] = useState(0);
  const [sampleError, setSampleError] = useState('');
  const resultFocus = useRef(null);
  const request = useRef(0);
  const id = useId();
  const existing = useMemo(() => isSample ? {} : {
    ...(userData || {}),
    ...Object.fromEntries((latestBiometrics || []).filter(item => !item.expiryDate || new Date(item.expiryDate) >= new Date()).map(item => [item.name, item.value])),
  }, [userData, latestBiometrics, isSample]);
  const valuesFor = model => entries[model.id] || initialInputs(model, false, existing);
  const ready = model => readyToRun(model, valuesFor(model), false);
  const busy = running.length > 0;
  const allReady = models.every(ready);
  const resultCount = Object.keys(results).length;

  useEffect(() => {
    let mounted = true;
    getModels('disease_detections').then(data => {
      if (!mounted) return;
      setOffline(!data.length);
      if (data.length) setModels(data);
    });
    return () => { mounted = false; };
  }, [retry]);
  useEffect(() => () => { request.current++; }, []);
  function loadSample() {
    const next = {};
    for (const model of models) {
      const values = samples.models.find(item => item.id === model.id)?.sample.inputs;
      if (!values || !readyToRun(model, values, false)) {
        setSampleError('A complete sample is unavailable for one of these models. Please review its inputs.');
        return;
      }
      next[model.id] = { ...values };
    }
    setEntries(next);
    setOrigins(Object.fromEntries(models.map(model => [model.id, 'Sample data loaded'])));
    setResults({}); setErrors({}); setTouched({}); setSampleError('');
  }
  function change(model, name, value) {
    setEntries(old => updateMeasurement(models, old, existing, model.id, name, value));
    const affected = models.filter(item => featuresOf(item).includes(name));
    setOrigins(old => ({ ...old, ...Object.fromEntries(affected.map(item => [item.id, old[item.id]?.startsWith('Sample') ? 'Sample data · edited' : 'Entered measurements'])) }));
    setTouched(old => ({ ...old, [`${model.id}-${name}`]: true }));
    setResults(old => Object.fromEntries(Object.entries(old).filter(([modelId]) => !affected.some(item => item.id === modelId))));
    setErrors(old => Object.fromEntries(Object.entries(old).filter(([modelId]) => !affected.some(item => item.id === modelId))));
  }
  async function run(targets) {
    if (busy || !targets.every(ready)) return;
    const current = ++request.current;
    setRunning(targets.map(model => model.id));
    setErrors(old => Object.fromEntries(Object.entries(old).filter(([modelId]) => !targets.some(model => model.id === modelId))));
    setResults(old => Object.fromEntries(Object.entries(old).filter(([modelId]) => !targets.some(model => model.id === modelId))));
    await Promise.all(targets.map(async model => {
      let response;
      try { response = await getDiseasePredictions(model.id, valuesFor(model), { sample: origins[model.id]?.startsWith('Sample') || false }); }
      catch { response = null; }
      if (request.current !== current) return;
      if (response?.prediction) setResults(old => ({ ...old, [model.id]: response }));
      else setErrors(old => ({ ...old, [model.id]: 'The service could not return a result. Your measurements are kept. Please try again.' }));
    }));
    if (request.current !== current) return;
    setRunning([]); setActiveId(null);
    requestAnimationFrame(() => { resultFocus.current?.focus({ preventScroll: true }); resultFocus.current?.parentElement.scrollTo({ top: 0 }); });
  }
  function field(model, name) {
    const fieldId = `${id}-${model.id}-${name.replaceAll(' ', '-')}`;
    const values = valuesFor(model);
    const options = mapsOf(model)[name];
    const issue = touched[`${model.id}-${name}`] && fieldError(values[name], options);
    const props = { id: fieldId, value: values[name] ?? '', disabled: busy, required: true, 'aria-invalid': !!issue,
      'aria-describedby': `${!options ? `${fieldId}-unit ` : ''}${issue ? `${fieldId}-error` : ''}`.trim() || undefined,
      onChange: event => change(model, name, event.target.value),
      onBlur: () => setTouched(old => ({ ...old, [`${model.id}-${name}`]: true })) };
    return <label key={name} htmlFor={fieldId} className={shared.field}>
      <span className={shared.fieldName}>{name}</span>
      <span className={shared.inputWithUnit}>{options ? <select {...props}><option value="">Select</option>{Object.keys(options).map(option => <option key={option}>{option}</option>)}</select> : <><input {...props} type="number" min="0" step="any" inputMode="decimal" placeholder="Enter value"/><span className={shared.unit} id={`${fieldId}-unit`}>{unitFor(name)}</span></>}</span>
      {issue && <span className={shared.fieldError} id={`${fieldId}-error`} role="status">{issue}</span>}
    </label>;
  }
  function modelRow(model, index = 0) {
    const result = results[model.id];
    const selected = model.id === activeId;
    const panelId = `${id}-${model.id}-inputs`;
    return <article className={styles.modelRow} key={model.id} aria-labelledby={`${id}-${model.id}-title`}>
      <div className={styles.modelIdentity}>
        <h2 id={`${id}-${model.id}-title`}>{headingCase(model.name)}</h2>
        {result?.prediction
          ? <p className={styles.verdict} data-tone={outcomeTone(result.prediction)}><strong>{result.prediction}</strong><span>{scoreText(result.probabilities?.[result.prediction])}</span></p>
          : <p className={styles.pending}>{running.includes(model.id) ? 'Analyzing…' : 'Not run yet'}</p>}
      </div>
      <div className={styles.modelOutputs}>
        <OutcomeRings model={model} result={result}/>
        {errors[model.id] && <p className={styles.rowError} role="alert">{errors[model.id]}</p>}
      </div>
        <button type="button" id={`${panelId}-toggle`} data-clinical-initial-focus={index === 0 ? '' : undefined} className={styles.openModel} disabled={busy} aria-label={`Review ${model.name} inputs`} aria-expanded={selected} aria-controls={panelId} onClick={() => setActiveId(selected ? null : model.id)}><span>Review inputs</span><ChevronDown size={16} aria-hidden="true"/></button>
      <form id={panelId} hidden={!selected} aria-labelledby={`${panelId}-toggle`} className={styles.inputPanel} onSubmit={event => { event.preventDefault(); run([model]); }}>
        <fieldset className={shared.fieldsGroup}><legend>Personal Context</legend><div className={styles.fields}>{featuresOf(model).filter(name => personal.includes(name)).map(name => field(model, name))}</div></fieldset>
        <fieldset className={shared.fieldsGroup}><legend>Measurements</legend><div className={styles.fields}>{featuresOf(model).filter(name => !personal.includes(name)).map(name => field(model, name))}</div></fieldset>
        <div className={styles.inputActions}><button className={shared.primary} type="submit" disabled={busy || !ready(model)}>{running.includes(model.id) ? 'Analyzing…' : `Run ${model.name}`}<ArrowRight size={16} aria-hidden="true"/></button></div>
      </form>
    </article>;
  }

  const sampleAction = <button type="button" className={shared.headerSample} onClick={loadSample} disabled={busy}>Load sample data</button>;
  return <>{renderHeader?.(sampleAction)}<div className={shared.workflow} aria-busy={busy}>
    <div className={`${shared.scrollBody} ${styles.body}`}>
      {offline && <p className={shared.notice} role="status">Live model details are unavailable. Saved definitions are shown; predictions require the service. <button type="button" onClick={() => setRetry(n => n + 1)}>Retry</button></p>}
      {sampleError && <p className={shared.error} role="alert">{sampleError}</p>}
      <section className={styles.overview} aria-label="Detection models" ref={resultFocus} tabIndex={-1}>
        <h2 className="sr-only">Detection Models</h2>
        {!!resultCount && <p className="sr-only" role="status">{resultCount} of {models.length} models returned a result</p>}
        {models.map((model, index) => modelRow(model, index))}
      </section>
    </div>
    <footer className={`${shared.footer} ${styles.footer}`}>
      <div>{busy && <p className={shared.readiness} role="status">Running analysis…</p>}<p className={shared.disclaimer}>Informational screening support. Review results with a qualified clinician.</p></div>
      <button className={shared.primary} type="button" disabled={busy || !allReady} onClick={() => run(models)}>{busy ? <><Loader2 size={17} className={shared.spinner} aria-hidden="true"/>Analyzing</> : <>Get All<ArrowRight size={17} aria-hidden="true"/></>}</button>
    </footer>
  </div></>;
}
