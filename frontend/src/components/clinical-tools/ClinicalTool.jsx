"use client";
import { headingCase } from "@/lib/heading-case";
import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useUser } from '@/contexts/userContext';
import { getModels, getDiseasePredictions, getDiagnosisPrediction } from '@/lib/diagnosis-api';
import detectionSample from '@/jsons/dummy-disease-detection-data.json';
import diagnosisSchema from '@/jsons/diagnosis-model-schema.json';
import sampleUser from '@/jsons/dummy-user-data.json';
import sampleRecords from '@/jsons/dummy-records-data.json';
import units from '@/jsons/clinical-measurement-units.json';
import { decode, featuresOf, mapsOf, initialInputs, fieldError, selectedSymptoms, readyToRun } from './model-utils.mjs';
import styles from './tools.module.css';
import SymptomsPanel from './SymptomsPanel';
import DiagnosisResult from './DiagnosisResult';

// Explicit mappings from the existing demonstration record, not a fabricated case.
const sampleSymptoms = [
  ['Fatigue', 'fatigue'], ['Weight Gain', 'weight gain'], ['Constipation', 'constipation'],
  ['Lack of Concentration', 'forgetfulness'], ['Puffy Face and Eyes', 'puffy eyelids'],
];
const personalFields = ['Age', 'Gender', 'BMI'];
const unitFor = name => units[name]?.unit || ({ Age: 'years', BMI: 'kg/m²' })[name] || '';

export default function ClinicalTool({ kind, renderHeader }) {
  const diagnosis = kind === 'diagnosis';
  const { userData, latestBiometrics, isSample } = useUser();
  const [models, setModels] = useState(diagnosis ? [diagnosisSchema] : detectionSample.models);
  const [modelId, setModelId] = useState(diagnosis ? diagnosisSchema.id : detectionSample.models[0].id);
  const [fetching, setFetching] = useState(true);
  const [offline, setOffline] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [entries, setEntries] = useState({});
  const [origins, setOrigins] = useState({});
  const [touched, setTouched] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const request = useRef(0);
  const resultRef = useRef(null);
  const id = useId();
  const model = models.find(item => item.id === modelId) || models[0];
  const maps = mapsOf(model);
  const names = featuresOf(model);
  const categories = decode(model?.feature_category, {});
  const existing = useMemo(() => isSample ? {} : {
    ...(userData || {}),
    ...Object.fromEntries((latestBiometrics || []).filter(v => !v.expiryDate || new Date(v.expiryDate) >= new Date()).map(v => [v.name, v.value])),
  }, [userData, latestBiometrics, isSample]);
  const values = entries[model.id] || initialInputs(model, diagnosis, diagnosis ? {} : existing);
  const origin = origins[model.id] || (!diagnosis && Object.values(values).some(v => v !== '') ? 'Existing values · review before analysis' : 'Enter your inputs');
  const selected = selectedSymptoms(model, values);
  const ready = readyToRun(model, values, diagnosis);
  const completed = names.filter(name => !fieldError(values[name], maps[name])).length;
  const probabilities = Object.entries(result?.probabilities || {}).sort((a, b) => b[1] - a[1]);
  const probabilityRows = rows => rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{Number.isFinite(Number(value)) ? `${Number(value).toFixed(1)}%` : 'Not available'}</dd></div>);

  useEffect(() => {
    let active = true;
    setFetching(true);
    getModels(diagnosis ? 'diagnosis_model' : 'disease_detections').then(data => {
      if (!active) return;
      setOffline(!data.length);
      if (data.length) { setModels(data); setModelId(old => data.some(m => m.id === old) ? old : data[0].id); }
      setFetching(false);
    });
    return () => { active = false; };
  }, [diagnosis, attempt]);
  useEffect(() => () => { request.current += 1; }, []);
  useEffect(() => { if (result) resultRef.current?.focus(); }, [result]);

  function change(name, value) {
    setEntries(old => ({ ...old, [model.id]: { ...values, [name]: value } }));
    setTouched(old => ({ ...old, [name]: true }));
    if (origin.startsWith('Sample')) setOrigins(old => ({ ...old, [model.id]: 'Sample data · edited demonstration values' }));
    setError(''); setResult(null);
  }
  function loadSample() {
    let next;
    if (diagnosis) {
      next = initialInputs(model, true);
      for (const [name, evidence] of sampleSymptoms) {
        if (names.includes(name) && sampleRecords.file_1.toLowerCase().includes(evidence)) next[name] = 1;
      }
      if (maps.Gender) next.Gender = sampleUser.user.gender;
    } else next = detectionSample.models.find(m => m.id === model.id)?.sample?.inputs;
    if (!next || !readyToRun(model, next, diagnosis)) { setError('No complete sample is available for this model. Please enter the remaining inputs.'); return; }
    setEntries(old => ({ ...old, [model.id]: { ...next } }));
    setOrigins(old => ({ ...old, [model.id]: 'Sample data loaded · not your medical information' }));
    setTouched({}); setResult(null); setError('');
  }
  async function submit(event) {
    event.preventDefault();
    if (busy || !ready) return;
    const currentRequest = ++request.current;
    setBusy(true); setError('');
    try {
      const prediction = await (diagnosis ? getDiagnosisPrediction : getDiseasePredictions)(model.id, values, { sample: origin.startsWith('Sample') });
      if (currentRequest !== request.current) return;
      if (!prediction?.prediction) setError('The analysis service could not return a result. Your inputs are saved here. Please try again.');
      else setResult(prediction);
    } catch { if (currentRequest === request.current) setError('Analysis is unavailable. Your inputs have been kept; please try again.'); }
    finally { if (currentRequest === request.current) setBusy(false); }
  }
  function field(name) {
    const inputId = `${id}-${name.replaceAll(' ', '-')}`;
    const issue = fieldError(values[name], maps[name]);
    const showError = touched[name] && issue;
    return <label className={styles.field} key={name} htmlFor={inputId}>
      <span className={styles.fieldName}>{name}</span>
      <span className={styles.inputWithUnit}>
        {maps[name] ? <select id={inputId} value={values[name] ?? ''} required disabled={busy} aria-invalid={!!showError} aria-describedby={showError ? `${inputId}-error` : undefined} onBlur={() => setTouched(old => ({ ...old, [name]: true }))} onChange={e => change(name, e.target.value)}>
          <option value="">Select</option>{Object.keys(maps[name]).map(option => <option key={option} value={option}>{option}</option>)}
        </select> : <><input id={inputId} type="number" inputMode="decimal" min="0" step="any" required disabled={busy} value={values[name] ?? ''} placeholder="Enter value" aria-invalid={!!showError} aria-describedby={`${inputId}-unit${showError ? ` ${inputId}-error` : ''}`} onBlur={() => setTouched(old => ({ ...old, [name]: true }))} onChange={e => change(name, e.target.value)}/><span id={`${inputId}-unit`} className={styles.unit}>{unitFor(name) || 'Unit not supplied'}</span></>}
      </span>{showError && <span id={`${inputId}-error`} className={styles.fieldError}>{issue}</span>}
    </label>;
  }

  function editInputs() {
    setResult(null);
    requestAnimationFrame(() => document.querySelector('[data-clinical-initial-focus]')?.focus());
  }
  return <>{renderHeader?.(undefined, result && diagnosis ? editInputs : undefined)}<form className={`${styles.workflow} ${diagnosis ? styles.diagnosisWorkflow : ''}`} onSubmit={submit} aria-busy={busy}>
    <div className={styles.scrollBody}>
      {!diagnosis && <div className={styles.utility}>
        <p role="status" className={origin.startsWith('Sample') ? styles.sampleStatus : styles.muted}>{origin}</p>
        {!result && <button type="button" className={styles.secondary} disabled={busy} onClick={loadSample}>Load sample data</button>}
      </div>}
      {offline && <p className={styles.notice} role="status">Live model details are unavailable. Showing the saved model definition; analysis still requires the service. <button type="button" onClick={() => setAttempt(n => n + 1)}>Retry connection</button></p>}
      {error && <p className={styles.error} role="alert">{error}</p>}
      {result && diagnosis ? <DiagnosisResult result={result} selected={selected} resultRef={resultRef}/> : result ? <section ref={resultRef} tabIndex={-1} className={styles.results} aria-label="Analysis result">
        <p className="sr-only" role="status">Assessment complete</p>
        <h2>{headingCase(result.prediction)}</h2>
        
        {result.description && <details><summary>About this result</summary><p>{result.description}</p></details>}
        <h3>Model Scores</h3>
        <dl className={styles.probabilities}>{probabilityRows(probabilities.slice(0, 5))}</dl>
        {probabilities.length > 5 && <details><summary>View all {probabilities.length} model scores</summary><dl className={styles.probabilities}>{probabilityRows(probabilities.slice(5))}</dl></details>}
        {!Object.keys(result.probabilities || {}).length && <p>Confidence scores were not returned.</p>}
        {diagnosis && <><details><summary>Symptoms reviewed</summary><p>{selected.join(', ')}.</p></details>{[['precautions','Care information'],['diets','Nutrition information'],['medications','Medication information']].map(([key,title]) => result[key]?.length ? <details key={key}><summary>{title}</summary><p className={styles.muted}>Reference information to discuss with a clinician; this is not a treatment recommendation.</p><ul>{(Array.isArray(result[key]) ? result[key] : [result[key]]).map((item,i) => <li key={i}>{String(item)}</li>)}</ul></details> : null)}</>}
      </section> : diagnosis ? <SymptomsPanel id={id} names={names} maps={maps} categories={categories} values={values} selected={selected} busy={busy} onChange={change} contextFields={Object.keys(maps).map(field)} onClear={() => { setEntries(old => ({ ...old, [model.id]: { ...values, ...Object.fromEntries(selected.map(name => [name, 0])) } })); setError(''); }}/>
       : <>
        <div className={styles.modelSelect}><label htmlFor={`${id}-model`}>Prediction model</label><select data-clinical-initial-focus id={`${id}-model`} value={model.id} disabled={busy} onChange={e => { setModelId(e.target.value); setTouched({}); setError(''); setResult(null); }}>
          {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select><p className={styles.muted}>{completed} of {names.length} required values complete</p></div>
        <fieldset className={styles.fieldsGroup}><legend>Personal Context</legend><div className={styles.fields}>{names.filter(n => personalFields.includes(n)).map(field)}</div></fieldset>
        <fieldset className={styles.fieldsGroup}><legend>Biochemical Measurements</legend><div className={styles.fields}>{names.filter(n => !personalFields.includes(n)).map(field)}</div></fieldset>
        <p className={styles.modelNote}>Use the displayed units. Model: {model.name}. {fetching ? 'Checking model details…' : 'Results are screening signals, not diagnoses.'}</p>
      </>}
    </div>
    <footer className={styles.footer}>
      <div>{!result && <p className={styles.readiness} role="status">{busy ? 'Analysis in progress…' : result ? 'Assessment complete' : ready ? <><Check size={15} aria-hidden="true"/>Ready for analysis</> : diagnosis ? selected.length < 5 ? `Select ${5-selected.length} more symptom${5-selected.length === 1 ? '' : 's'}` : 'Select Gender' : `${names.length-completed} required values remaining`}</p>}<p className={styles.disclaimer}>Informational assessment · not a diagnosis</p></div>
      {result && diagnosis ? null : result ? <button type="button" className={styles.primary} onClick={event => { event.preventDefault(); setResult(null); requestAnimationFrame(() => document.querySelector('[data-clinical-initial-focus]')?.focus()); }}>Edit {diagnosis ? 'symptoms' : 'measurements'}</button> : <button type="submit" className={styles.primary} disabled={!ready || busy}>{busy ? <><Loader2 className={styles.spinner} size={18} aria-hidden="true"/>Analyzing</> : <>{diagnosis ? 'Run assessment' : 'Run detection'}<ArrowRight size={18} aria-hidden="true"/></>}</button>}
    </footer>
  </form></>;
}
