"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useUser } from "@/contexts/userContext";
import FoodsScoreBarGraph from "./FoodsScoreBarGraph";
import styles from "./nutrition/nutrition.module.css";
export default function FoodsScores({ processedFoodsScore, handleSelectedItem }) {
  const {latestBiometrics,userDataLoading,isLogined,isSample,loadDummyUserData}=useUser();
  const [showExpired,setShowExpired]=useState(false);
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const expired=useMemo(()=>latestBiometrics?.filter(({expiryDate})=>new Date(expiryDate)<new Date()) || [],[latestBiometrics]);
  const sample=async()=>{setLoading(true);setError("");try {if(!await loadDummyUserData()) throw new Error();}catch{setError("Sample recommendations could not be loaded. Try again.");}finally{setLoading(false);}};
  if(userDataLoading||loading)return <p role="status" className="bio-caption">Loading recommendations…</p>;
  if(!isLogined&&!isSample)return <div className={styles.notice}><div><h2>Recommended Foods</h2><p>Sign in for personalized rankings, or try sample data.</p>{error&&<p role="alert">{error}</p>}</div><div className={styles.actions}><Link className="bio-button-secondary" href="/sign-in?next=/workspace/food">Sign in</Link><button className="bio-button-primary" onClick={sample}>Try sample data</button></div></div>;
  if(!processedFoodsScore)return <div className={styles.notice}><div><h2>Recommended Foods</h2><p>Add measurements to get your rankings.</p></div><Link className="bio-button-secondary" href="/profile?tab=measurements">Add measurements</Link></div>;
  if(expired.length&&!showExpired)return <div className={styles.notice}><div><h2>Recommended Foods</h2><p>Some measurements have expired.</p></div><div className={styles.actions}><button className="bio-button-secondary" onClick={()=>setShowExpired(true)}>Review rankings</button><Link className="bio-button-primary" href="/profile?tab=measurements">Update measurements</Link></div></div>;
  return <FoodsScoreBarGraph data={processedFoodsScore} handleSelectedItem={handleSelectedItem} expiredBiometrics={expired}/>;
}
