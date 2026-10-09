"use client";
import { formatNumber } from "@/lib/clinical-display";
import styles from "./nutrition.module.css";

const nutrientColors = ["#28765b", "#6b70a6", "#bb8841", "#508a99", "#977295"];

export default function NutritionBars({ rows, unit = "", onSelect, label = "Amount" }) {
  const minimum = Math.min(0, ...rows.map(row => row.value));
  const maximum = Math.max(0, ...rows.map(row => row.value));
  const range = maximum - minimum || 1;
  const zero = -minimum / range * 100;
  const compact = !onSelect && rows.length <= 4;

  return <div className={`${styles.comparison} ${compact ? styles.compactComparison : ""}`} aria-label={label}>
    {rows.map((row, index) => {
      const color = onSelect ? row.value < 0 ? "#bb8841" : "#28765b" : nutrientColors[index % nutrientColors.length];
      const amount = `${formatNumber(row.value)}${unit ? ` ${unit}` : ""}`;
      const content = <>
        <span className={styles.measureHeading}><span className={styles.measureName}>{row.name}</span><span className={styles.measureValue}>{formatNumber(row.value)}{unit && <span className={styles.measureUnit}> {unit}</span>}</span></span>
        <span className={styles.measureTrack} role="meter" aria-label={row.name} aria-valuemin={minimum} aria-valuemax={maximum || 1} aria-valuenow={row.value} aria-valuetext={amount}>
          {minimum < 0 && <span className={styles.zeroLine} style={{left:`${zero}%`}}/>}
          <span className={styles.measureFill} style={{left:`${row.value < 0 ? zero - Math.abs(row.value)/range*100 : zero}%`,width:`${Math.abs(row.value)/range*100}%`}}/>
        </span>
      </>;
      return onSelect
        ? <button key={row.name} className={styles.measure} style={{"--measure-color":color}} onClick={()=>onSelect(row.name,true)} aria-label={`${row.name}, ${amount}`}>{content}</button>
        : <div key={row.name} className={styles.measure} style={{"--measure-color":color}}>{content}</div>;
    })}
  </div>;
}
