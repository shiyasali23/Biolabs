"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock3, FlaskConical, Loader2 } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useBiochemical } from "@/contexts/biochemicalContext";
import { useUser } from "@/contexts/userContext";
import { updateBiometrics } from "@/lib/user-api";
import ErrorComponent from "./ErrorComponent";
import LoadingComponent from "./LoadingComponent";

const formatCategory = (value) => value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function BiochemicalsUpdate() {
  const { biochemicalData, biochemicalDataLoading, setBiochemicalDataLoading, fetchBiochemicals } = useBiochemical();
  const { latestBiometrics, handleAuthResponse } = useUser();
  const [openCategory, setOpenCategory] = useState("");
  const [changes, setChanges] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });
  const latestById = useMemo(() => new Map((latestBiometrics ?? []).map((item) => [item.id, item])), [latestBiometrics]);

  useEffect(() => {
    if (!biochemicalData) fetchBiochemicals();
  }, [biochemicalData, fetchBiochemicals]);

  const handleInputChange = (id, rawValue) => {
    setMessage({ type: "", text: "" });
    setChanges((current) => {
      const next = { ...current };
      const currentValue = latestById.get(id)?.value;
      const numericValue = rawValue === "" ? "" : Number(rawValue);
      if (rawValue !== "" && Number.isFinite(numericValue) && Number(currentValue) === numericValue) delete next[id];
      else next[id] = { id, value: rawValue };
      return next;
    });
  };

  const handleSave = async () => {
    if (!Object.keys(changes).length) return;
    if(Object.values(changes).some(item=>item.value === "" || !Number.isFinite(Number(item.value)))) { setMessage({type:"error",text:"Enter a numeric value for each changed measurement, or restore its previous value."}); return; }
    setMessage({ type: "", text: "" });
    setBiochemicalDataLoading(true);
    const currentDate = new Date().toISOString();
    const unexpiredBiometrics = latestBiometrics
      ?.filter(({ expiryDate }) => !expiryDate || expiryDate >= currentDate)
      .map(({ id, scaledValue }) => ({ id, value: scaledValue })) ?? null;
    try {
      const response = await updateBiometrics(Object.values(changes).map(item=>({...item,value:Number(item.value)})), unexpiredBiometrics);
      if (!response) throw new Error("Biometrics update failed");
      await handleAuthResponse(response);
      setChanges({});
      setMessage({ type: "success", text: "Biometrics updated successfully." });
    } catch {
      setMessage({ type: "error", text: "The measurements could not be saved. Your previous values are unchanged." });
    } finally {
      setBiochemicalDataLoading(false);
    }
  };

  if (biochemicalDataLoading && !biochemicalData) return <LoadingComponent text="Loading biochemical reference data" />;
  if (!biochemicalData) return <ErrorComponent heading="Reference Data Is Unavailable" buttonText="Try again" handleTryAgain={fetchBiochemicals} />;

  return (
    <div className="bio-card overflow-hidden">
      <div className="flex flex-col justify-between gap-4 border-b bg-[var(--biolabs-mist)] p-5 sm:flex-row sm:items-center sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[var(--biolabs-aqua)] text-[var(--biolabs-teal)]"><FlaskConical aria-hidden="true" size={19} /></span>
          <div><h3 className="font-semibold">Add Measurements</h3></div>
        </div>
        <span className="whitespace-nowrap text-xs font-semibold text-[var(--biolabs-slate)]">{Object.keys(changes).length} unsaved {Object.keys(changes).length === 1 ? "change" : "changes"}</span>
      </div>

      {message.text && <p role={message.type === "error" ? "alert" : "status"} className={`m-5 rounded-md px-4 py-3 text-sm font-semibold sm:mx-7 ${message.type === "success" ? "bg-[var(--biolabs-success-bg)] text-[var(--biolabs-success)]" : "bg-[var(--biolabs-danger-bg)] text-[var(--biolabs-danger)]"}`}>{message.text}</p>}

      <Accordion type="single" collapsible value={openCategory} onValueChange={setOpenCategory} className="w-full px-5 sm:px-7">
        {Object.entries(biochemicalData).map(([category, items]) => (
          <AccordionItem key={category} value={category}>
            <AccordionTrigger className="py-5 text-left text-sm font-semibold hover:no-underline"><span className="flex items-center gap-3">{formatCategory(category)}<span className="rounded-full bg-[var(--biolabs-porcelain)] px-2 py-0.5 text-[10px] font-bold text-[var(--biolabs-slate)]">{items.length}</span></span></AccordionTrigger>
            <AccordionContent className="pb-7">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                  const current = latestById.get(item.id);
                  const expiryDate = current?.expiryDate ? new Date(current.expiryDate) : null;
                  const expired = expiryDate && expiryDate < new Date();
                  const outsideRange = current?.isHyper === true || current?.isHyper === false;
                  const status = expired
                    ? { label: "Expired", className: "bio-status-warning", icon: Clock3 }
                    : outsideRange
                      ? { label: "Outside range", className: "bio-status-danger", icon: AlertTriangle }
                      : current
                        ? { label: "In range", className: "bio-status-normal", icon: CheckCircle2 }
                        : null;
                  const StatusIcon = status?.icon;
                  return (
                    <article key={item.id} className="rounded-lg border bg-white p-4">
                      <div className="mb-4 flex min-h-10 items-start justify-between gap-3">
                        <label htmlFor={`biochemical-${item.id}`} className="text-sm font-semibold leading-5">{item.name}</label>
                        {status && <span className={status.className}><StatusIcon aria-hidden="true" size={12} />{status.label}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <input id={`biochemical-${item.id}`} type="number" step="any" inputMode="decimal" className="bio-input min-w-0" value={changes[item.id]?.value ?? current?.value ?? ""} placeholder="Enter value" onChange={(event) => handleInputChange(item.id, event.target.value)} />
                        <span className="max-w-[7rem] shrink-0 text-xs font-semibold text-[var(--biolabs-slate)]">{item.unit}</span>
                      </div>
                      {(current?.healthy_min != null || current?.healthy_max != null) && <p className="mt-3 text-xs text-[var(--biolabs-slate)]">Reference range: {current?.healthy_min ?? "—"}–{current?.healthy_max ?? "—"} {item.unit}</p>}
                      {expired && <p className="mt-2 text-xs font-medium text-[var(--biolabs-warning)]">Expired {expiryDate.toLocaleDateString()}</p>}
                    </article>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {Object.keys(changes).length > 0 && <div className="sticky bottom-0 flex flex-col items-start justify-between gap-3 border-t bg-white/95 p-5 backdrop-blur sm:flex-row sm:items-center sm:px-7"><p className="text-sm text-[var(--biolabs-slate)]">{Object.keys(changes).length} unsaved</p><button type="button" className="bio-button-primary w-full shrink-0 sm:w-auto" disabled={biochemicalDataLoading} onClick={handleSave}>{biochemicalDataLoading ? <><Loader2 aria-hidden="true" className="animate-spin" size={17} />Saving</> : "Save measurements"}</button></div>}
    </div>
  );
}
