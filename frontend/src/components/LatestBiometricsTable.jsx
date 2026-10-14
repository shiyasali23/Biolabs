"use client";
import { useMemo, useState } from "react";
import { ChevronDown, Loader2 } from "lucide-react";
import dynamic from "next/dynamic";
// The trend chart (chart.js) loads only when a result is opened.
const BiochemicalLineGraphModal = dynamic(() => import("./BiochemicalLineGraphModal"), { ssr: false });
import { useUser } from "@/contexts/userContext";
import { updateBiometrics } from "@/lib/user-api";
import { rangeStatus, statusLabels, statusClasses, formatNumber } from "@/lib/clinical-display";

const PREVIEW_COUNT=3;
const RESULT_GROUPS=[{id:"high",title:"Above range",statuses:["high"]},{id:"low",title:"Below range",statuses:["low"]},{id:"other",title:"Other results",statuses:["normal","unknown"]}];
const SUMMARY=[["all","Total"],["high","Above"],["low","Below"],["normal","Within"]];
const keyOf=item=>String(item.id ?? item.name);

export default function LatestBiometricsTable({ latestBiometrics=[], biometrics, editable=false, showSummary=false }) {
  const { isSample, handleAuthResponse, applySampleValues } = useUser();
  const [query,setQuery]=useState(""); const [filter,setFilter]=useState("all"); const [selected,setSelected]=useState(null); const [expanded,setExpanded]=useState(null); const [sort,setSort]=useState("name");
  const [open3,setOpen3]=useState({});
  const [drafts,setDrafts]=useState({});
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState(null);

  const items=latestBiometrics;
  const rows=useMemo(()=>items.filter(item=>(`${item.name} ${item.category}`).toLowerCase().includes(query.toLowerCase()) && (filter==="all" || rangeStatus(item)===filter)).sort((a,b)=>String(a[sort]??"").localeCompare(String(b[sort]??""),undefined,{numeric:true})),[items,query,filter,sort]);
  const groups=useMemo(()=>RESULT_GROUPS.map(group=>({...group,items:rows.filter(item=>group.statuses.includes(rangeStatus(item)))})).filter(group=>group.items.length),[rows]);
  const counts=useMemo(()=>{const c={all:items.length,high:0,low:0,normal:0};items.forEach(item=>{const s=rangeStatus(item);if(s in c)c[s]+=1;});return c;},[items]);

  const open=item=>{const full=biometrics?.[item.category]?.[item.name];setSelected(full?{...full,name:item.name,category:item.category}:item);};
  const live=item=>{const d=drafts[keyOf(item)];return d!==undefined&&d!==""?{...item,value:d}:item;};
  const status=item=>{const s=rangeStatus(live(item));return <span className={statusClasses[s]}>{statusLabels[s]}</span>;};
  const range=item=>`${formatNumber(item.healthy_min)}–${formatNumber(item.healthy_max)} ${item.unit||""}`;
  const edit=(item,value)=>{setMessage(null);setDrafts(current=>{const next={...current};if(value!==""&&Number(value)===Number(item.value))delete next[keyOf(item)];else next[keyOf(item)]=value;return next;});};
  const changeCount=Object.keys(drafts).length;

  const save=async()=>{
    const entries=Object.entries(drafts);
    if(entries.some(([,value])=>value===""||!Number.isFinite(Number(value)))){setMessage({type:"error",text:"Enter a number for each changed value."});return;}
    // Sample edits stay in this session; signed-in edits come back from the server.
    if(isSample){applySampleValues(Object.fromEntries(entries.map(([key,value])=>[key,Number(value)])));setDrafts({});setMessage({type:"success",text:"Saved for this sample session."});return;}
    setSaving(true);
    try{
      const now=new Date().toISOString();
      const unexpired=latestBiometrics.filter(({expiryDate})=>!expiryDate||expiryDate>=now).map(({id,scaledValue})=>({id,value:scaledValue}));
      const response=await updateBiometrics(entries.map(([id,value])=>({id:Number(id),value:Number(value)})),unexpired);
      if(!response)throw new Error("update failed");
      await handleAuthResponse(response);
      setDrafts({});setMessage({type:"success",text:"Measurements saved."});
    }catch{setMessage({type:"error",text:"Could not save. Previous values are unchanged."});}
    finally{setSaving(false);}
  };

  const valueCell=item=>editable
    ? <span className="result-edit"><input type="number" step="any" inputMode="decimal" className={`result-input${drafts[keyOf(item)]!==undefined?" is-changed":""}`} aria-label={`${item.name} value`} value={drafts[keyOf(item)]??item.value??""} onChange={e=>edit(item,e.target.value)}/><span className="bio-caption">{item.unit}</span></span>
    : <><strong className="font-medium">{formatNumber(item.value)}</strong> <span className="bio-caption">{item.unit}</span></>;

  return <>
    {showSummary&&<div className="result-summary" role="group" aria-label="Filter by range">{SUMMARY.map(([value,label])=><button key={value} type="button" aria-pressed={filter===value} className={`result-summary-item result-summary-${value}`} onClick={()=>setFilter(filter===value&&value!=="all"?"all":value)}><strong>{counts[value]}</strong><span>{label}</span></button>)}</div>}
    <div className="result-tools"><input aria-label="Search measurements" className="bio-input" placeholder="Search a marker or category" value={query} onChange={e=>setQuery(e.target.value)}/><select aria-label="Filter by reference range" className="bio-input" value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All results</option>{Object.entries(statusLabels).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select><select aria-label="Sort measurements" className="bio-input" value={sort} onChange={e=>setSort(e.target.value)}><option value="name">Sort by marker</option><option value="category">Sort by category</option><option value="value">Sort by value</option></select></div>
    {!showSummary&&!editable&&<p className="bio-caption mb-3" aria-live="polite">{rows.length} measurements</p>}
    {message&&<p role={message.type==="error"?"alert":"status"} className={`result-message result-message-${message.type}`}>{message.text}</p>}
    {groups.map(group=>{const showAll=open3[group.id];const visible=showAll?group.items:group.items.slice(0,PREVIEW_COUNT);const hidden=group.items.length-PREVIEW_COUNT;const listId=`results-${group.id}`;return <section key={group.id} className="result-group" aria-labelledby={`${listId}-title`}>
      <header className="result-group-head"><h3 id={`${listId}-title`}><span className={`result-group-dot result-group-dot-${group.id}`} aria-hidden="true"/>{group.title}</h3><span className="bio-caption">{group.items.length}</span></header>
      <div id={listId}>
        <div className="bio-table-shell desktop-results"><table className="result-table"><caption className="sr-only">{group.title} measurements</caption><thead><tr><th>Marker</th><th>Result</th><th>Reference range</th><th>Status</th><th><span className="sr-only">History</span></th></tr></thead><tbody>{visible.map(item=><tr key={keyOf(item)}><td><strong className="font-medium">{item.name}</strong><span className="block bio-caption mt-1">{item.category}</span></td><td>{valueCell(item)}</td><td>{range(item)}</td><td>{status(item)}</td><td><button className="bio-icon-button" aria-label={`View ${item.name} history`} onClick={()=>open(item)}>↗</button></td></tr>)}</tbody></table></div>
        <div className="mobile-results">{visible.map(item=>{const k=keyOf(item);return <article className="mobile-result" key={k}><div className="mobile-result-main"><strong className="font-medium">{item.name}</strong>{editable?valueCell(item):<span className="result-value">{formatNumber(item.value)} <span className="font-normal">{item.unit}</span></span>}<span>{status(item)}</span><button type="button" className="mobile-result-toggle" aria-expanded={expanded===k} aria-label={`${expanded===k?"Hide":"Show"} ${item.name} details`} onClick={()=>setExpanded(expanded===k?null:k)}>{expanded===k?"−":"+"}</button></div>{expanded===k&&<div className="result-range"><p>{item.category} · Reference {range(item)}</p><button className="bio-button-secondary mt-3" onClick={()=>open(item)}>View history →</button></div>}</article>;})}</div>
      </div>
      {hidden>0&&<button type="button" className="result-more" aria-expanded={!!showAll} aria-controls={listId} onClick={()=>setOpen3(state=>({...state,[group.id]:!state[group.id]}))}>{showAll?"Show less":`Show ${hidden} more`}<ChevronDown size={16} aria-hidden="true" className={showAll?"rotate-180":undefined}/></button>}
    </section>;})}
    {!rows.length&&<p className="bio-panel p-6">No measurements match your search. Try another marker or range filter.</p>}
    {editable&&changeCount>0&&<div className="result-savebar" role="region" aria-label="Unsaved changes"><span>{changeCount} {changeCount===1?"change":"changes"}</span><div><button type="button" className="bio-button-secondary" onClick={()=>{setDrafts({});setMessage(null);}} disabled={saving}>Discard</button><button type="button" className="bio-button-primary" onClick={save} disabled={saving}>{saving?<><Loader2 size={16} className="animate-spin" aria-hidden="true"/>Saving</>:"Save"}</button></div></div>}
    {selected&&<BiochemicalLineGraphModal isOpen onClose={()=>setSelected(null)} selectedBiochemical={selected}/>}
  </>;
}
