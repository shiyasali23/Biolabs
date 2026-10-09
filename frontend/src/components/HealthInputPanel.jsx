"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { ArrowUp, BrainCircuit, FileImage, FlaskConical, Loader2, Save, X } from "lucide-react";
import { useUser } from "@/contexts/userContext";
import { extractTextFromImage } from "@/utils/vault-utils";

export default function HealthInputPanel({
  isIntelligence,
  isLogined,
  handleRecordUpdate = null,
  getGeratedTexts = null,
  setIntelligenceOpen = null,
  extractedTexts = [],
  setExtractedTexts,
  extractedPromts = [],
  setExtractedPromts,
  text = "",
  setText,
  promt = "",
  setPromt,
  setMessage = () => {},
  isSubmitting = false,
}) {
  const { latestBiometrics, isSample } = useUser();
  const inputId = useId();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [fileLoading, setFileLoading] = useState(false);
  const [isBiometricsSelected, setIsBiometricsSelected] = useState(false);
  const currentContents = isIntelligence ? extractedPromts : extractedTexts;
  const currentText = isIntelligence ? promt : text;

  const fileUrls = useMemo(() => uploadedFiles.map((file) => ({ file, url: URL.createObjectURL(file) })), [uploadedFiles]);
  useEffect(() => () => fileUrls.forEach(({ url }) => URL.revokeObjectURL(url)), [fileUrls]);

  const setContents = useCallback((updater) => {
    if (isIntelligence) setExtractedPromts?.(updater);
    else setExtractedTexts?.(updater);
  }, [isIntelligence, setExtractedPromts, setExtractedTexts]);

  const handleFileChange = useCallback(async (event) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    setMessage("");
    setFileLoading(true);
    try {
      for (const file of files.slice(0, Math.max(0, 2 - currentContents.length))) {
        if (!["image/jpeg","image/png"].includes(file.type) || file.size > 5*1024*1024) { setMessage("Choose a JPEG or PNG image up to 5 MB."); continue; }
        const extractedText = await extractTextFromImage(file);
        if (!extractedText?.trim()) {
          setMessage("No readable text was found in that image.");
          continue;
        }
        setContents((previous) => [...previous, extractedText.trim()].slice(-2));
        setUploadedFiles((previous) => [...previous, file].slice(-2));
      }
    } catch {
      setMessage("The document could not be processed. Try a clearer image.");
    } finally {
      setFileLoading(false);
      event.target.value = "";
    }
  }, [currentContents.length, setContents, setMessage]);

  const handleRemoveFile = (index) => {
    setUploadedFiles((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
    setContents((previous) => previous.filter((_, itemIndex) => itemIndex !== index));
  };

  const handleTextChange = (event) => {
    setMessage("");
    if (isIntelligence) setPromt?.(event.target.value);
    else setText?.(event.target.value);
  };

  const handleSubmitClick = () => {
    setMessage("");
    const recordData = { text: currentText || "" };
    if (currentContents.length) {
      if (isIntelligence) recordData.files = [...currentContents];
      else currentContents.forEach((content, index) => { recordData[`file_${index + 1}`] = content; });
    }
    if (isBiometricsSelected && latestBiometrics?.length) {
      recordData.biometrics = latestBiometrics.reduce((result, biometric) => {
        result[biometric.name] = { value: biometric.value, healthy_min: biometric.healthy_min, healthy_max: biometric.healthy_max };
        return result;
      }, {});
    }
    if (isIntelligence) getGeratedTexts?.(recordData);
    else handleRecordUpdate?.(recordData);
  };

  const canSubmit = Boolean(currentText?.trim() || currentContents.length) && !fileLoading && !isSubmitting && (isIntelligence || (isLogined && !isSample));

  return (
    <section className={`overflow-hidden rounded-xl border bg-white ${isIntelligence ? "assistant-composer" : "record-composer"}`} aria-label={isIntelligence ? "Ask clinical intelligence" : "Create a medical record"}>
      <label htmlFor={`${inputId}-text`} className="sr-only">{isIntelligence ? "Clinical intelligence question" : "Medical record notes"}</label>
      <textarea
        id={`${inputId}-text`}
        className={`w-full resize-none border-0 bg-white px-5 py-4 text-base leading-6 text-[var(--biolabs-ink)] outline-none placeholder:text-[var(--biolabs-slate)] focus:ring-0 ${isIntelligence ? "min-h-28" : "min-h-44"}`}
        placeholder={isIntelligence ? "Ask a health question or attach a clinical document…" : "Add notes, observations, or details from a medical report…"}
        onChange={handleTextChange}
        value={currentText || ""}
      />

      {currentContents.length > 0 && (
        <div className="flex flex-wrap gap-2 border-t bg-[var(--biolabs-mist)] px-4 py-3" aria-label="Attached document extracts">
          {currentContents.map((content, index) => (
            <div key={`${content.slice(0, 20)}-${index}`} className="flex min-w-0 max-w-full items-center gap-2 rounded-md border bg-white p-2">
              {uploadedFiles[index] && fileUrls[index] ? (
                <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded"><Image src={fileUrls[index].url} alt="" fill sizes="32px" className="object-cover" /></span>
              ) : (
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><FileImage aria-hidden="true" size={15} /></span>
              )}
              <span className="max-w-48 truncate text-xs text-[var(--biolabs-slate)]">Document {index + 1}: {content}</span>
              <button type="button" className="grid h-11 w-11 shrink-0 place-items-center rounded text-[var(--biolabs-slate)] transition hover:bg-[var(--biolabs-danger-bg)] hover:text-[var(--biolabs-danger)]" aria-label={`Remove document ${index + 1}`} onClick={() => handleRemoveFile(index)}><X aria-hidden="true" size={14} /></button>
            </div>
          ))}
        </div>
      )}

      {isBiometricsSelected && <p className="px-4 py-2 bio-caption bg-[var(--biolabs-aqua)]">{latestBiometrics?.length} {isSample ? "sample " : ""}measurements included with this question.</p>}
      <div className="composer-actions flex flex-col justify-between gap-3 border-t px-4 py-3 sm:flex-row sm:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={`${inputId}-file`} className={`bio-button-secondary cursor-pointer ${currentContents.length >= 2 || fileLoading ? "pointer-events-none opacity-50" : ""}`}>
            {fileLoading ? <Loader2 aria-hidden="true" className="animate-spin" size={16} /> : <FileImage aria-hidden="true" size={16} />}
            {fileLoading ? "Reading document" : "Attach image"}
          </label>
          <input id={`${inputId}-file`} type="file" accept="image/jpeg,image/png" multiple className="sr-only" onChange={handleFileChange} disabled={currentContents.length >= 2 || fileLoading} />
          {isIntelligence && (isLogined || isSample) && latestBiometrics?.length > 0 && (
            <button type="button" className={isBiometricsSelected ? "bio-button-secondary !border-[var(--biolabs-teal)] !bg-[var(--biolabs-aqua)] !text-[var(--biolabs-teal)]" : "bio-button-secondary"} aria-pressed={isBiometricsSelected} onClick={() => setIsBiometricsSelected((selected) => !selected)}><FlaskConical aria-hidden="true" size={16} />Use biometrics</button>
          )}
          {!isIntelligence && setIntelligenceOpen && (
            <button type="button" className="bio-button-secondary" onClick={() => setIntelligenceOpen(true)}><BrainCircuit aria-hidden="true" size={16} />Ask Intelligence</button>
          )}
        </div>
        <button type="button" className="bio-button-primary w-full sm:w-auto" disabled={!canSubmit} onClick={handleSubmitClick}>
          {isSubmitting ? <Loader2 aria-hidden="true" className="animate-spin" size={16} /> : isIntelligence ? <ArrowUp aria-hidden="true" size={16} /> : <Save aria-hidden="true" size={16} />}
          {isSubmitting ? "Processing" : isIntelligence ? "Send" : "Save record"}
        </button>
      </div>
    </section>
  );
}
