"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { ArrowRight, ArrowUpRight, FileUp, Loader2, X } from "lucide-react";
import { useUser } from "@/contexts/userContext";
import { useRecord } from "@/contexts/recordContext";
import { validateSamplePdf } from "@/lib/sample-pdf";
import styles from "./WorkspaceEntry.module.css";

export function WorkspaceEntryPanel({ destination = "/customer", onComplete, modal = false }) {
  const { loadDummyUserData } = useUser();
  const { loadDummyRecords } = useRecord();
  const router = useRouter();
  const input = useRef(null);
  const busy = useRef(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filename, setFilename] = useState("");
  const Title = modal ? Dialog.Title : "h1";
  async function start(file) {
    if (busy.current) return;
    busy.current = true;
    setLoading(true); setError(""); setFilename(file?.name || "");
    try {
      if (file) await validateSamplePdf(file);
      const [user, records] = await Promise.all([loadDummyUserData(), loadDummyRecords()]);
      if (!user || !records) throw new Error("Sample data could not be loaded. Please try again.");
      onComplete?.();
      router.push(destination);
    } catch (failure) {
      setError(failure.message || "Sample data could not be loaded. Please try again.");
    } finally {
      busy.current = false; setLoading(false);
      if (input.current) input.current.value = "";
    }
  }
  return <div className={styles.panel} aria-busy={loading}>
    <Title className={styles.title}>Open Your Workspace</Title>
    <p className={styles.subtitle}>Explore sample data or sign in.</p>
    <input ref={input} type="file" accept="application/pdf,.pdf" className={styles.file} aria-label="Choose PDF for sample workspace" disabled={loading} onChange={event=>{const file=event.target.files?.[0];if(file)start(file);}}/>
    <button type="button" className={styles.upload} disabled={loading} onClick={()=>input.current?.click()}>
      <span className={styles.uploadIcon}><FileUp size={24} strokeWidth={1.5} aria-hidden="true"/></span>
      <span><strong>Upload PDF</strong><small>PDF · up to 10 MB</small></span>
      <ArrowUpRight size={19} aria-hidden="true"/>
    </button>
    <p className={styles.pdfNote}>Your PDF stays on this device. This opens demonstration data.</p>
    <div className={styles.actions}>
      <button type="button" className={styles.sample} disabled={loading} onClick={()=>start()}>{loading ? <Loader2 size={17} className={styles.spinner} aria-hidden="true"/> : <ArrowRight size={17} aria-hidden="true"/>}<span>{loading ? "Loading sample data…" : "Create sample workspace"}</span></button>
      <Link className={styles.login} href={`/sign-in?next=${encodeURIComponent(destination)}`}>Sign in<ArrowUpRight size={17} aria-hidden="true"/></Link>
    </div>
    {loading && filename && <p className={styles.status} role="status">{filename} selected · opening sample workspace</p>}
    {error && <p className={styles.error} role="alert">{error}</p>}
    <p className={styles.account}>New to Biolabs? <Link href={`/sign-up?next=${encodeURIComponent(destination)}`}>Create account</Link></p>
  </div>;
}

export default function WorkspaceEntry({ children, className, destination = "/customer", open, onOpenChange }) {
  const [localOpen, setLocalOpen] = useState(false);
  const changeOpen = onOpenChange || setLocalOpen;
  return <Dialog.Root open={open ?? localOpen} onOpenChange={changeOpen}>
    {children && <Dialog.Trigger asChild><button type="button" className={className}>{children}</button></Dialog.Trigger>}
    <Dialog.Portal>
      <Dialog.Overlay className={styles.overlay}/>
      <Dialog.Content className={styles.dialog} aria-describedby={undefined}>
        <Dialog.Close className={styles.close} aria-label="Close workspace options"><X size={19}/></Dialog.Close>
        <WorkspaceEntryPanel destination={destination} modal onComplete={()=>changeOpen(false)}/>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
