"use client";
import { useState } from "react";
import { PencilLine, X } from "lucide-react";
import { useUser } from "@/contexts/userContext";
import { formatNumber } from "@/lib/clinical-display";
import UserDataComponent from "./UserDataComponent";
import styles from "./PatientHeader.module.css";

const ageFrom = dob => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now < new Date(now.getFullYear(), birth.getMonth(), birth.getDate())) age -= 1;
  return age;
};
const bmiFrom = (height, weight) => height && weight ? weight / ((height / 100) ** 2) : null;

export default function PatientHeader() {
  const { userData, biometricsEntries, healthScore } = useUser();
  const [editing, setEditing] = useState(false);
  const user = userData || {};
  const name = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Patient";
  const initials = name.split(" ").map(part => part[0]).slice(0, 2).join("").toUpperCase();
  const age = user.age ?? ageFrom(user.date_of_birth);
  const bmi = user.bmi ?? bmiFrom(Number(user.height), Number(user.weight));
  const facts = [user.gender && user.gender[0].toUpperCase() + user.gender.slice(1), age != null && `${age} yrs`, bmi && `BMI ${formatNumber(bmi)}`].filter(Boolean);
  const latestEntry = biometricsEntries?.length ? biometricsEntries.reduce((latest, entry) => entry.created_at > latest.created_at ? entry : latest) : null;
  const latestScore = healthScore?.length ? healthScore[healthScore.length - 1]?.health_score : null;
  const stats = [
    ["Last result", latestEntry ? new Date(latestEntry.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"],
    ["Health score", latestScore != null ? formatNumber(latestScore) : "—"],
  ];

  return <section className={styles.card} aria-labelledby="patient-name">
    <div className={styles.top}>
      <div className={styles.identity}>
        <span className={styles.avatar} aria-hidden="true">{initials}</span>
        <div className={styles.nameBlock}>
          <h1 id="patient-name">{name}</h1>
          <p>{facts.join(" · ")}{user.id != null && <span className={styles.id}>ID {String(user.id).padStart(6, "0")}</span>}</p>
        </div>
      </div>
      <button type="button" className={styles.edit} aria-expanded={editing} aria-controls="patient-details" onClick={() => setEditing(value => !value)}>
        {editing ? <X size={16} aria-hidden="true"/> : <PencilLine size={16} aria-hidden="true"/>}<span>{editing ? "Close" : "Edit details"}</span>
      </button>
    </div>
    <dl className={styles.stats}>
      {stats.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      {user.email && <div className={styles.contact}><dt>Contact</dt><dd>{user.email}</dd></div>}
    </dl>
    {editing && <div id="patient-details" className={styles.details}><UserDataComponent/></div>}
  </section>;
}
