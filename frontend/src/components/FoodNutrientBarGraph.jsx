"use client";
import { headingCase } from "@/lib/heading-case";
import { useState } from "react";
import { numeric } from "@/lib/clinical-display";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import NutritionBars from "./nutrition/NutritionBars";
import styles from "./nutrition/nutrition.module.css";
export default function FoodNutrientBarGraph({selectedData,isItemFood}) {
  const name = Object.keys(selectedData || {})[0];
  const item = selectedData?.[name] || {};
  const associations = item.associations || {};
  const categories = [...new Set(Object.values(associations).map(row=>row.category).filter(Boolean))];
  const [category,setCategory] = useState(isItemFood ? categories[0] || "all" : "all");
  const [limit,setLimit] = useState(12);
  const rows = Object.entries(associations).filter(([,row])=>category === "all" || row.category === category).map(([name,row])=>({name,value:numeric(row.value),unit:row.unit || item.unit || ""})).filter(row=>Number.isFinite(row.value)).sort((a,b)=>b.value-a.value);
  const units = [...new Set(rows.map(row=>row.unit))];
  return <section><header className={styles.header}><div><h2>{headingCase(name)}</h2><p>Per 100 g{!isItemFood ? ` · ${item.unit || "amount"}` : ""}</p></div><Select value={category} onValueChange={value=>{setCategory(value);setLimit(12);}}><SelectTrigger className={styles.categoryTrigger} aria-label="Nutrient category"><SelectValue/></SelectTrigger><SelectContent className={styles.categoryMenu} align="end" sideOffset={4}><SelectItem className={styles.categoryOption} value="all">All categories</SelectItem>{categories.map(value=><SelectItem className={styles.categoryOption} key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></header><div className={styles.groups}>{units.map(unit=>{const group = rows.filter(row=>row.unit===unit);return <div key={unit}>{units.length>1&&<p className={styles.unit}>Amounts in {unit || "supplied units"}</p>}<NutritionBars rows={group.slice(0,limit)} unit={unit} label={isItemFood ? "Nutrients" : name}/>{group.length>limit&&<button className={styles.more} onClick={()=>setLimit(value=>value+12)}>Show more ({group.length-limit})</button>}</div>;})}</div>{!rows.length&&<p className="bio-caption">No amounts available in this category.</p>}</section>;
}
