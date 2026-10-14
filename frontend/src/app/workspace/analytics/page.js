"use client";
import { useState } from "react";
import Link from "next/link";
import BiometricsAccordion from "@/components/BiometricsAccordion";
import LoadingComponent from "@/components/LoadingComponent";
import LatestBiometricsTable from "@/components/LatestBiometricsTable";
import NoDataFound from "@/components/NoDataFound";
import HyperHypoConditions from "@/components/HyperHypoConditions";
import { getBiometricEntry } from "@/utils/analytics-utils";
import { useUser } from "@/contexts/userContext";
import { rangeStatus, formatNumber } from "@/lib/clinical-display";
import PatientHeader from "@/components/PatientHeader";
import dynamic from "next/dynamic";

// Model cards load after the patient record is on screen.
const DiseaseDetectionModal = dynamic(() => import("@/components/DiseaseDetectionModal"), { ssr: false });
// chart.js loads with the charts (fixed-height containers, so no layout shift); the entry modal only on click.
const HealthScoreGraph = dynamic(() => import("@/components/HealthScoreGraph"), { ssr: false });
const BiometricsEntryModal = dynamic(() => import("@/components/BiometricsEntryModal"), { ssr: false });

function SummaryArrow({ direction }) {
  const path = direction === "up" ? "M5 11 11 5m0 0v5m0-5H6" : "M5 5l6 6m0 0V6m0 5H6";
  return <svg aria-hidden="true" viewBox="0 0 16 16"><path d={path}/></svg>;
}

export default function Analytics() {
  const { isLogined,isSample,userDataLoading,biometricsEntries,latestBiometrics,biometrics,healthScore,hyperBiochemicals,hypoBiochemicals }=useUser();
  const [entry,setEntry]=useState(null);
  const openEntry=timestamp=>setEntry(getBiometricEntry(new Map((biometricsEntries||[]).map(item=>[item.created_at,item])),timestamp));
  if(userDataLoading)return <main className="bio-page"><LoadingComponent text="Loading clinical data"/></main>;
  if(!isLogined&&!isSample)return <main className="bio-page"><NoDataFound isOpen route="analytics"/></main>;
  const rows=latestBiometrics||[];
  const aboveCount=rows.filter(i=>rangeStatus(i)==="high").length;
  const belowCount=rows.filter(i=>rangeStatus(i)==="low").length;
  const withinCount=rows.filter(i=>rangeStatus(i)==="normal").length;
  const totalCount=Math.max(rows.length,1);
  return <main className="bio-page pb-16"><div className="bio-container">
    <PatientHeader/>
    {!biometricsEntries?.length?<section className="bio-panel mt-8 p-8"><h2 className="bio-subtitle">Your First Measurement Starts Here.</h2><p className="bio-body mt-3">Add biochemical results to begin your clinical history.</p><Link className="bio-button-primary mt-5" href="/profile?tab=measurements">Add measurements</Link></section>:<>
    <section className="analytics-summary crm-summary" aria-label="Biochemical summary">
      <div className="analytics-summary-total"><strong>{rows.length}</strong><span>Latest measurements</span></div>
      <div className="analytics-summary-status">
        <div className="analytics-summary-heading"><h2>Reference Status</h2><span>{withinCount} within range</span></div>
        <div className="analytics-summary-breakdown">
          <div className="analytics-summary-stat analytics-summary-high"><span className="analytics-summary-icon"><SummaryArrow direction="up"/></span><span><strong>{aboveCount}</strong><small>Above range</small></span></div>
          <div className="analytics-summary-stat analytics-summary-low"><span className="analytics-summary-icon"><SummaryArrow direction="down"/></span><span><strong>{belowCount}</strong><small>Below range</small></span></div>
        </div>
        <div className="analytics-summary-rail" aria-label={`${withinCount} within range, ${aboveCount} above range, ${belowCount} below range`}><span className="is-within" style={{width:`${withinCount/totalCount*100}%`}}/><span className="is-high" style={{width:`${aboveCount/totalCount*100}%`}}/><span className="is-low" style={{width:`${belowCount/totalCount*100}%`}}/></div>
      </div>
    </section>
    <section className="crm-section" aria-labelledby="predictions-heading"><h2 id="predictions-heading" className="bio-subtitle mb-5">ML Predictions</h2><DiseaseDetectionModal isOpen embedded customerView/></section>
    <section className="crm-section" aria-labelledby="measurements-heading"><h2 id="measurements-heading" className="bio-subtitle mb-5">Latest Results</h2><LatestBiometricsTable latestBiometrics={rows} biometrics={biometrics} editable/></section>
    <section className="bio-card p-5 sm:p-6 mb-8"><div className="flex flex-wrap justify-between items-baseline gap-3 mb-5"><h2 className="bio-subtitle">Health Score Trend</h2></div><div className="h-[220px] sm:h-[260px]"><HealthScoreGraph healthScore={healthScore} handleBiometricEntry={openEntry}/></div><details className="mt-4 border-t pt-3 text-sm"><summary className="cursor-pointer text-[var(--biolabs-teal)] py-2">View score entries</summary><ul className="divide-y">{healthScore?.map((item,index)=><li key={`${item.created_at}-${index}`}><button className="w-full flex justify-between gap-4 py-3 text-left" onClick={()=>openEntry(item.created_at)}><span>{new Date(item.created_at).toLocaleDateString()}</span><strong className="font-medium tabular-nums">{formatNumber(item.health_score)} →</strong></button></li>)}</ul></details></section>
    <details open className="mt-8 border-t pt-6"><summary className="bio-subtitle cursor-pointer">Clinical Associations</summary><div className="mt-5"><HyperHypoConditions hyperBiochemicals={hyperBiochemicals} hypoBiochemicals={hypoBiochemicals}/></div></details>
    {biometrics&&<details open className="mt-10 border-t pt-6"><summary className="bio-subtitle cursor-pointer">History By Category</summary><div className="mt-5"><BiometricsAccordion biometrics={biometrics}/></div></details>}
    </>}
    {entry&&<BiometricsEntryModal isOpen onClose={()=>setEntry(null)} selectedBiometricEntry={entry}/>}</div></main>;
}
