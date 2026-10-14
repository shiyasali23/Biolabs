"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Activity, AlertTriangle, Beaker, CheckCircle2, Clock3, Droplets, Loader2, ShieldAlert, Sparkles, X } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useUser } from "@/contexts/userContext";
import { getDiseasePredictions, getModels } from "@/lib/diagnosis-api";
import sampleDetectionData from "@/jsons/dummy-disease-detection-data.json";
import ErrorComponent from "./ErrorComponent";
import LoadingComponent from "./LoadingComponent";

const UPCOMING_MODELS = ["Alzheimer’s detection", "Kidney function", "Cancer prediction"];
// Models fetched once are reused by every mount (dashboard, analytics) without a global provider.
let cachedDetectionModels = [];
const parseJson = (value, fallback) => { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } };

export default function DiseaseDetectionModal({ isOpen, onClose, embedded = false, customerView = false }) {
  const [diseaseDetectionModals, setModels] = useState(cachedDetectionModels);
  const setDiseaseDetectionModals = useCallback((models) => { cachedDetectionModels = models; setModels(models); }, []);
  const { userData, latestBiometrics, isSample } = useUser();
  const [loading, setLoading] = useState(false);
  const [predictionLoading, setPredictionLoading] = useState(null);
  const [openAcc, setOpenAcc] = useState("");
  const [inputValuesArray, setInputValuesArray] = useState([]);
  const [errorsDict, setErrorsDict] = useState({});
  const [predictionsDict, setPredictionsDict] = useState({});
  const [editedModels, setEditedModels] = useState({});
  const [liveResults, setLiveResults] = useState({});
  const autoLoadAttemptedRef = useRef(false);
  const requestInFlightRef = useRef(false);
  const modelType = "disease_detections";

  const initializeModels = useCallback((models) => {
    const userValues = new Map(Object.entries(userData ?? {}).map(([key, value]) => [key.toLowerCase(), value]));
    const biometricValues = new Map((latestBiometrics ?? []).map((item) => [item.name.toLowerCase(), item]));
    setInputValuesArray(models.map((model) => {
      const featureNames = parseJson(model.feature_names, []);
      const sampleInputs = isSample ? model.sample?.inputs : null;
      const features = featureNames.reduce((result, feature) => {
        const accountValue = userValues.get(feature.toLowerCase());
        const biometricValue = biometricValues.get(feature.toLowerCase())?.value;
        result[feature] = sampleInputs?.[feature] ?? biometricValue ?? accountValue ?? "";
        return result;
      }, {});
      return { id: model.id, features };
    }));
    setErrorsDict({});
    setEditedModels({});
    setLiveResults({});
    setPredictionsDict(isSample ? Object.fromEntries(models.filter((model) => model.sample?.result).map((model) => [model.id, model.sample.result])) : {});
    if (isSample && models[0] && !customerView) setOpenAcc(String(models[0].id));
    if (customerView) setOpenAcc("");
  }, [customerView, isSample, latestBiometrics, userData]);

  const loadModels = useCallback(async () => {
    if (requestInFlightRef.current) return;
    requestInFlightRef.current = true;
    setLoading(true);
    try {
      const models = isSample ? sampleDetectionData.models : await getModels(modelType);
      if (models.length) {
        setDiseaseDetectionModals(models);
        initializeModels(models);
      }
    } finally {
      requestInFlightRef.current = false;
      setLoading(false);
    }
  }, [initializeModels, isSample, modelType, setDiseaseDetectionModals]);

  useEffect(() => {
    if (!isOpen) return;
    if (isSample) {
      setDiseaseDetectionModals(sampleDetectionData.models);
      initializeModels(sampleDetectionData.models);
    } else if (!diseaseDetectionModals.length && !autoLoadAttemptedRef.current) {
      autoLoadAttemptedRef.current = true;
      void loadModels();
    }
    else initializeModels(diseaseDetectionModals);
  }, [diseaseDetectionModals, initializeModels, isOpen, loadModels]);

  useEffect(() => {
    if (!isOpen || embedded) return undefined;
    const closeOnEscape = (event) => { if (event.key === "Escape") onClose(); };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", closeOnEscape); };
  }, [isOpen, onClose, embedded]);

  const inputForModel = useCallback((modelId) => inputValuesArray.find((item) => item.id === modelId)?.features ?? {}, [inputValuesArray]);
  const handleValuesChange = (modelId, feature, value) => {
    setInputValuesArray((current) => current.map((item) => item.id === modelId ? { ...item, features: { ...item.features, [feature]: value } } : item));
    setErrorsDict((current) => ({ ...current, [modelId]: "" }));
    setEditedModels((current) => ({ ...current, [modelId]: true }));
    setLiveResults((current) => {
      const next = { ...current };
      delete next[modelId];
      return next;
    });
    setPredictionsDict((current) => {
      const next = { ...current };
      delete next[modelId];
      return next;
    });
  };

  const handlePredict = async (modelId) => {
    const features = inputForModel(modelId);
    if (!Object.keys(features).length || Object.values(features).some((value) => value === "" || value == null)) {
      setOpenAcc(String(modelId));
      setErrorsDict((current) => ({ ...current, [modelId]: "Complete every required field before running detection." }));
      return;
    }
    setPredictionLoading(modelId);
    setErrorsDict((current) => ({ ...current, [modelId]: "" }));
    try {
      const prediction = await getDiseasePredictions(modelId, features);
      if (prediction) {
        setPredictionsDict((current) => ({ ...current, [modelId]: prediction }));
        setLiveResults((current) => ({ ...current, [modelId]: true }));
      }
      else setErrorsDict((current) => ({ ...current, [modelId]: "A result could not be generated. Please try again." }));
    } catch {
      setErrorsDict((current) => ({ ...current, [modelId]: "Detection is temporarily unavailable." }));
    } finally {
      setOpenAcc(String(modelId));
      setPredictionLoading(null);
    }
  };

  const expiryByName = useMemo(() => new Map((latestBiometrics ?? []).map((item) => [item.name.toLowerCase(), item.expiryDate])), [latestBiometrics]);
  if (!isOpen) return null;

  return (
    <div className={embedded ? "clinical-tool" : "bio-modal-overlay"} onMouseDown={(event) => { if (!embedded && event.target === event.currentTarget) onClose(); }}>
      <section className={embedded ? "clinical-tool-content" : "bio-modal max-w-6xl !p-0"} role={embedded ? undefined : "dialog"} aria-modal={embedded ? undefined : true} aria-labelledby={customerView ? undefined : "detection-title"} aria-label={customerView ? "Disease prediction models" : undefined}>
        {!customerView && <header className="sticky top-0 z-10 flex items-start justify-between gap-5 border-b bg-white/95 p-5 backdrop-blur sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><Beaker aria-hidden="true" size={21} /></span>
            <div><p className="bio-eyebrow !mb-1">Biochemical Models</p><h2 id="detection-title" className="text-2xl font-medium tracking-[-.03em]">Disease Pattern Detection</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--biolabs-slate)]">{isSample ? "Explore validated sample outputs, or edit any input to run a live calculation." : "Review prefilled health data, complete any missing fields, and run a selected model."}</p></div>
          </div>
          {!embedded && <button type="button" className="bio-icon-button shrink-0" aria-label="Close disease detection" onClick={onClose}><X aria-hidden="true" size={18} /></button>}
        </header>}

        <div className="p-5 sm:p-7">
          {loading ? <LoadingComponent text="Loading detection models" /> : !diseaseDetectionModals.length ? <ErrorComponent heading="Detection Models Are Unavailable" buttonText="Try again" handleTryAgain={loadModels} /> : (
            <Accordion type="single" value={openAcc} collapsible onValueChange={setOpenAcc} className={customerView ? "grid grid-cols-1 items-start gap-4 sm:grid-cols-2" : "space-y-4"}>
              {diseaseDetectionModals.map((model) => {
                const features = parseJson(model.feature_names, []);
                const featureMaps = parseJson(model.feature_maps, {});
                const outputLabels = Object.keys(parseJson(model.output_maps, {}));
                const prediction = predictionsDict[model.id];
                const ModelIcon = model.name === "Diabetes" ? Droplets : Activity;
                return (
                  <AccordionItem key={model.id} value={String(model.id)} className={`min-w-0 overflow-hidden rounded-xl px-0 ${customerView ? "border-0 bg-white shadow-[0_10px_30px_rgba(11,23,57,0.09)] transition-shadow hover:shadow-[0_14px_36px_rgba(11,23,57,0.13)] motion-reduce:transition-none data-[state=open]:sm:col-span-2" : "border"}`}>
                    <AccordionTrigger className={`${customerView ? "items-start px-4 py-5 sm:px-5" : "px-5 py-5 sm:px-6"} text-left hover:no-underline`}>
                      {customerView ? <span className="flex min-w-0 flex-1 flex-col pr-2">
                        <span className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><ModelIcon aria-hidden="true" size={18} /></span><span className="text-lg font-semibold leading-6">{model.name}</span></span>
                        {prediction ? <span className="mt-5 grid grid-cols-2 gap-2.5">{outputLabels.map((label) => { const active = prediction.prediction === label; const probability = Number(prediction.probabilities?.[label]); return <span key={label} className={`min-w-0 rounded-xl px-3 py-3 ${active ? "bg-[var(--biolabs-teal)] text-white shadow-[0_6px_16px_rgba(8,127,122,0.22)]" : "bg-[var(--biolabs-porcelain)] text-[var(--biolabs-ink)]"}`}><span className={`block truncate text-[11px] font-semibold leading-4 ${active ? "text-white" : "text-[var(--biolabs-slate)]"}`}>{label}</span><span className="mt-1 block text-lg font-medium tabular-nums">{probability.toFixed(1)}%</span><span className={`mt-2 block h-1 overflow-hidden rounded-full ${active ? "bg-white/30" : "bg-[var(--biolabs-cloud)]"}`}><span className={`block h-full rounded-full ${active ? "bg-white" : "bg-[var(--biolabs-teal)]"}`} style={{ width: `${probability}%` }} /></span></span>; })}</span> : <span className="mt-5 text-sm text-[var(--biolabs-slate)]">Awaiting calculation</span>}
                        <span className="mt-5 text-xs font-semibold text-[var(--biolabs-teal)]">View inputs</span>
                      </span> : <span className="flex w-full flex-col justify-between gap-2 pr-3 sm:flex-row sm:items-center">
                        <span className="block text-lg font-semibold">{model.name}</span>
                        <span className="flex flex-wrap items-center gap-2">{isSample && editedModels[model.id] && !liveResults[model.id] && <span className="rounded-md bg-[var(--biolabs-warning-bg)] px-3 py-2 text-xs font-semibold text-[var(--biolabs-warning)]">Edited · live calculation required</span>}{isSample && liveResults[model.id] && <span className="bio-status-normal"><CheckCircle2 aria-hidden="true" size={12} />Live result</span>}{model.accuracy != null && <span className="bio-status-normal"><CheckCircle2 aria-hidden="true" size={12} />Reported model accuracy {(Number(model.accuracy) * 100).toFixed(1)}%</span>}</span>
                      </span>}
                    </AccordionTrigger>
                    <AccordionContent className={`${customerView ? "border-t bg-white px-3 pb-5 pt-4 sm:px-4" : "border-t px-5 pb-6 pt-5 sm:px-6"}`}>
                      {errorsDict[model.id] && <p role="alert" className="mb-5 rounded-md bg-[var(--biolabs-danger-bg)] px-4 py-3 text-sm font-semibold text-[var(--biolabs-danger)]">{errorsDict[model.id]}</p>}
                      <div className={`grid gap-3 ${customerView ? "grid-cols-1 xl:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}`}>
                        {features.map((feature) => {
                          const expiry = expiryByName.get(feature.toLowerCase());
                          const expired = !isSample && expiry && new Date(expiry) < new Date();
                          const mostImpacted = prediction && model.max_feature_impact === feature;
                          const value = inputForModel(model.id)[feature] ?? "";
                          return (
                            <label key={feature} className={`rounded-lg border p-3 ${mostImpacted ? "border-[var(--biolabs-teal)] bg-[var(--biolabs-aqua)]" : "bg-white"}`}>
                              <span className="bio-label flex items-center justify-between gap-2"><span className="truncate">{feature}</span>{mostImpacted && <Sparkles aria-label="Most influential input" className="shrink-0 text-[var(--biolabs-teal)]" size={13} />}</span>
                              {featureMaps[feature] ? <select className="bio-input" value={value} onChange={(event) => handleValuesChange(model.id, feature, event.target.value)}><option value="">Select a value</option>{Object.keys(featureMaps[feature]).map((option) => <option key={option} value={option}>{option}</option>)}</select> : <input className="bio-input" type="number" step="any" value={value} placeholder="Enter value" onChange={(event) => handleValuesChange(model.id, feature, event.target.value)} />}
                              {expired && <span className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[var(--biolabs-warning)]"><Clock3 aria-hidden="true" size={11} />Expired {new Date(expiry).toLocaleDateString()}</span>}
                            </label>
                          );
                        })}
                      </div>
                      <div className="mt-6 flex flex-col justify-between gap-5 border-t pt-5 lg:flex-row lg:items-center">
                        <div className="flex flex-wrap gap-2">{outputLabels.map((label) => { const active = prediction?.prediction === label; const probability = prediction?.probabilities?.[label]; return <span key={label} className={`rounded-md border px-3 py-2 text-xs font-semibold ${active ? "border-[var(--biolabs-teal)] bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal-dark)]" : "bg-[var(--biolabs-mist)] text-[var(--biolabs-slate)]"}`}>{label}{probability != null ? ` · ${Number(probability).toFixed(1)}%` : ""}</span>; })}</div>
                        <button type="button" className="bio-button-primary w-full lg:w-auto" disabled={predictionLoading != null || (isSample && !editedModels[model.id])} onClick={() => handlePredict(model.id)}>{predictionLoading === model.id ? <><Loader2 aria-hidden="true" className="animate-spin" size={16} />Running model</> : isSample && !editedModels[model.id] ? "Sample result loaded" : liveResults[model.id] ? "Recalculate" : isSample ? "Run live detection" : "Run detection"}</button>
                      </div>
                      {prediction && <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--biolabs-slate)]"><AlertTriangle aria-hidden="true" className="mt-0.5 shrink-0" size={13} />{isSample && !editedModels[model.id] ? "This is a stored result from synthetic demonstration data. Edit an input to calculate a new result using the live service." : "The highlighted input had the greatest influence on this model output."}</p>}
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}

          {!customerView && <section className="mt-10 border-t pt-7" aria-labelledby="upcoming-models-heading"><p className="bio-eyebrow !mb-2">Research Pipeline</p><h3 id="upcoming-models-heading" className="font-semibold">Upcoming Models</h3><div className="mt-4 grid gap-3 sm:grid-cols-3">{UPCOMING_MODELS.map((model) => <div key={model} className="bio-panel p-4 text-sm font-semibold text-[var(--biolabs-slate)]">{model}</div>)}</div></section>}
          {!customerView && <p className="mt-7 flex items-start gap-2 rounded-lg bg-[var(--biolabs-warning-bg)] p-4 text-xs leading-5 text-[var(--biolabs-warning)]"><ShieldAlert aria-hidden="true" className="mt-0.5 shrink-0" size={14} />Model outputs are informational screening signals and must not be treated as a confirmed diagnosis. Consult a qualified clinician.</p>}
        </div>
      </section>
    </div>
  );
}
