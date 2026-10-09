"use client";
import NutritionBars from "./nutrition/NutritionBars";
import styles from "./nutrition/nutrition.module.css";
import { numeric } from "@/lib/clinical-display";
export default function FoodPredictionsBarGraph({predictedFoodsData,isNutriScore,handleSelectedItem}) {
  const rows=(predictedFoodsData || []).map(food=>({name:food.name,value:numeric(food.score)})).filter(row=>row.value!==null);
  if(!rows.length)return <p className="bio-caption">No supported foods detected.</p>;
  return <section><header className={styles.header}><div><h3>Detected Foods</h3><p>{isNutriScore ? "Nutrition score" : "Personalized score"}</p></div></header><NutritionBars rows={rows} onSelect={handleSelectedItem} label={isNutriScore ? "Nutrition score" : "Personalized score"}/></section>;
}
