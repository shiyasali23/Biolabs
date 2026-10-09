"use client";
import { useState } from "react";
import { numeric } from "@/lib/clinical-display";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NutritionBars from "./nutrition/NutritionBars";
import styles from "./nutrition/nutrition.module.css";
export default function FoodsScoreBarGraph({data=[],handleSelectedItem,expiredBiometrics=[]}) {
  const [category,setCategory]=useState("all");
  const [limit,setLimit]=useState(12);
  const categories=[...new Set(data.map(item=>item.category || "Other"))].sort();
  const rows=[...data].filter(item=>numeric(item.value) !== null && (category==="all" || (item.category || "Other")===category)).map(item=>({...item,value:numeric(item.value)})).sort((a,b)=>b.value-a.value);
  return <section><header className={styles.header}><div><h2>Recommended Foods</h2></div>
    <Select value={category} onValueChange={value=>{setCategory(value);setLimit(12);}}>
      <SelectTrigger className={styles.categoryTrigger} aria-label="Recommendation category"><SelectValue /></SelectTrigger>
      <SelectContent className={styles.categoryMenu} align="end" sideOffset={4}>
        <SelectItem className={styles.categoryOption} value="all">All categories</SelectItem>
        {categories.map(value=><SelectItem className={styles.categoryOption} key={value} value={value}>{value.charAt(0).toUpperCase()+value.slice(1)}</SelectItem>)}
      </SelectContent>
    </Select>
  </header>{expiredBiometrics.length>0&&<p className={styles.warning}>Based on measurements that have expired.</p>}<NutritionBars rows={rows.slice(0,limit)} label="Recommendation score" onSelect={handleSelectedItem}/>{rows.length>limit&&<button className={styles.more} onClick={()=>setLimit(value=>value+12)}>Show more foods ({rows.length-limit})</button>}{!rows.length&&<p className="bio-caption">No foods in this category.</p>}</section>;
}
