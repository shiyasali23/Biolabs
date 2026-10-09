"use client";
import { useEffect,useRef,useState } from "react";
import Link from "next/link";
import { Plus, PanelLeft } from "lucide-react";
import { Dialog,DialogContent,DialogTitle } from "@/components/ui/dialog";
import PageToolbar from "@/components/PageToolbar";
import HealthInputPanel from "@/components/HealthInputPanel";
import LoadingComponent from "@/components/LoadingComponent";
import NoDataFound from "@/components/NoDataFound";
import PreviousRecords from "@/components/PreviousRecords";
import { useIntelligence } from "@/contexts/intelligenceContext";
import { useRecord } from "@/contexts/recordContext";
import { useUser } from "@/contexts/userContext";
export default function VaultPage(){
 const {isLogined,isSample,userDataLoading}=useUser(); const {recordsArray,recordsLoading,updateRecord,fetchRecords}=useRecord(); const {openIntelligence}=useIntelligence(); const requested=useRef(false);
 const [text,setText]=useState("");const [extractedTexts,setExtractedTexts]=useState([]);const [selected,setSelected]=useState(null);const [drawer,setDrawer]=useState(false);const [message,setMessage]=useState("");const [success,setSuccess]=useState(false);
 const dirty=!selected&&Boolean(text.trim()||extractedTexts.length);
 useEffect(()=>{if(!isLogined){requested.current=false;return;}if(!recordsArray&&!recordsLoading&&!requested.current){requested.current=true;fetchRecords();}},[isLogined,recordsArray,recordsLoading,fetchRecords]);
 useEffect(()=>{if(!dirty)return;const warn=e=>{e.preventDefault();e.returnValue="";};window.addEventListener("beforeunload",warn);return()=>window.removeEventListener("beforeunload",warn);},[dirty]);
 const mayDiscard=()=>!dirty||window.confirm("Discard this unsaved record draft?");
 const choose=record=>{if(!mayDiscard())return;setSelected(record);setText("");setExtractedTexts([]);setDrawer(false);setMessage("");};
 const create=()=>{if(!mayDiscard())return;setSelected(null);setText("");setExtractedTexts([]);setMessage("");};
 const copy=()=>{setText(selected.text||"");setExtractedTexts([selected.file_1,selected.file_2].filter(Boolean));setSelected(null);setMessage("");};
 const save=async data=>{if(isSample){setSuccess(false);setMessage("Sample records are read-only. Sign in to save your own data.");return;}setSuccess(false);const response=await updateRecord(data);if(response?.data){setText("");setExtractedTexts([]);setSelected(null);setSuccess(true);setMessage("Record saved to your Vault.");}else setMessage(response?.message||"The record could not be saved. Your draft is still here.");};
 if(userDataLoading)return <LoadingComponent text="Loading records"/>;
 if(!isLogined&&!isSample)return <main className="bio-page"><NoDataFound isOpen route="vault"/></main>;
 const library=<PreviousRecords recordsArray={recordsArray||[]} handleSelectedRecord={choose} selectedRecord={selected}/>;
 return <main className="bio-page pb-16"><div className="bio-container"><PageToolbar title="Vault" description="Notes and extracted report text, together."><button className="bio-button-secondary records-trigger" onClick={()=>setDrawer(true)}><PanelLeft size={17}/>Records</button><button className="bio-button-primary" onClick={create}><Plus size={17}/>New record</button></PageToolbar>{message&&<p role={success?"status":"alert"} className={`mb-5 p-4 rounded-lg text-sm ${success?"bg-[var(--biolabs-success-bg)] text-[var(--biolabs-success)]":"bg-[var(--biolabs-danger-bg)] text-[var(--biolabs-danger)]"}`}>{message}</p>}<div className="vault-layout"><div className="vault-desktop-library">{library}{!recordsArray&&!recordsLoading&&<button className="bio-button-secondary m-4" onClick={fetchRecords}>Retry loading records</button>}</div><section className="min-w-0">{selected?<article className="record-reader"><div className="flex flex-wrap justify-between items-center gap-4 border-b pb-5 mb-6"><h2 className="bio-subtitle">Saved Record</h2><button className="bio-button-secondary" onClick={copy}>Use as new draft</button></div><p className="whitespace-pre-wrap break-words leading-7">{selected.text}</p>{[selected.file_1,selected.file_2].filter(Boolean).map((content,index)=><details key={index} className="border-t mt-6 pt-4"><summary className="cursor-pointer font-medium">Document extract {index+1}</summary><p className="whitespace-pre-wrap break-words bio-body mt-4">{content}</p></details>)}<button className="bio-button-primary mt-6" onClick={()=>openIntelligence({text:selected.text||"",extractedTexts:[selected.file_1,selected.file_2].filter(Boolean)})}>Ask Intelligence</button></article>:<><h2 className="bio-subtitle mb-4">New Record</h2><HealthInputPanel isIntelligence={false} isLogined={isLogined} handleRecordUpdate={save} setIntelligenceOpen={()=>openIntelligence({text,extractedTexts})} text={text} setText={setText} extractedTexts={extractedTexts} setExtractedTexts={setExtractedTexts} setMessage={value=>{setSuccess(false);setMessage(value);}} isSubmitting={recordsLoading}/><p className="bio-caption mt-4">Attach up to two images to extract their text. Original images are not stored in the Vault.</p>{isSample&&<p className="bio-caption mt-3"><Link href="/sign-in?next=/workspace/vault" className="underline text-[var(--biolabs-teal)]">Sign in</Link> to save a record. Sample mode is read-only.</p>}{extractedTexts.map((content,index)=><details key={index} className="border-t mt-4 pt-4"><summary className="cursor-pointer text-sm">Review document extract {index+1}</summary><p className="bio-body whitespace-pre-wrap break-words mt-3">{content}</p></details>)}</>}</section></div></div><Dialog open={drawer} onOpenChange={setDrawer}><DialogContent className="bio-redesign navigation-drawer" aria-describedby={undefined}><DialogTitle>Records</DialogTitle>{library}</DialogContent></Dialog></main>;
}
