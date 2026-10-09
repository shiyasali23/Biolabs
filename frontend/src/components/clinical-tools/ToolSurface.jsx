"use client";
import * as Dialog from '@radix-ui/react-dialog';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X } from 'lucide-react';
import ClinicalTool from './ClinicalTool';
import DetectionTool from './DetectionTool';
import { restoreToolOpener } from './navigation';
import styles from './tools.module.css';

export default function ToolSurface({ kind, modal = false, dismissHref }) {
  const router = useRouter();
  const diagnosis = kind === 'diagnosis';
  const title = diagnosis ? 'Diagnostics Center' : 'Disease Detection';
  const header = (sampleAction, onBack) => <header className={styles.header}>
    <div className={styles.headerTitle}>{onBack && <button type="button" className={styles.back} aria-label="Back to symptoms" onClick={onBack}><ArrowLeft size={18} aria-hidden="true"/></button>}{modal ? <Dialog.Title className={diagnosis ? styles.title : 'sr-only'}>{title}</Dialog.Title> : <h1 className={diagnosis ? styles.title : 'sr-only'}>{title}</h1>}
    </div>
    <div className={styles.headerActions}>{sampleAction}{modal ? <Dialog.Close className={styles.close} aria-label={`Close ${title}`}><X size={21} /></Dialog.Close> : <Link className={styles.close} href="/" aria-label={`Close ${title} and return home`}><X size={21}/></Link>}</div>
  </header>;
  const content = diagnosis ? <ClinicalTool kind={kind} renderHeader={header}/> : <DetectionTool renderHeader={header}/>;
  if (!modal) return <main className={styles.standalone}><Link className={styles.brand} href="/">BIOLABS</Link><section className={styles.surface}>{content}</section></main>;
  return <Dialog.Root open onOpenChange={open => { if (!open) dismissHref ? router.replace(dismissHref) : router.back(); }}>
    <Dialog.Portal><Dialog.Overlay className={`${styles.overlay} ${styles.detectionOverlay}`}/><Dialog.Content aria-modal="true" aria-describedby={undefined} className={`${styles.surface} ${styles.modal} ${diagnosis ? styles.symptomModal : styles.detectionModal}`}
      onOpenAutoFocus={event => { event.preventDefault(); document.querySelector('[data-clinical-initial-focus]')?.focus(); }}
      onCloseAutoFocus={event => { event.preventDefault(); restoreToolOpener(); }}>
      {content}
    </Dialog.Content></Dialog.Portal>
  </Dialog.Root>;
}
