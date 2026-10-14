// utils/biometrics-worker.js
import { getConditions } from "@/lib/biochemicals-api";

// Shapes raw biometric entries for the dashboards: the health-score series, every measurement grouped by category
// with its history, the latest value of each measurement, and the latest above/below-range values (with any linked
// conditions from the API). Above/below lists share objects with latestBiometrics, so conditions show in both.
export const processBiometricData = async (rawEntries) => {
  // Ignore malformed entries so one bad record cannot break the whole page.
  const entries = (Array.isArray(rawEntries) ? rawEntries : []).filter((entry) => entry && Array.isArray(entry.biometrics));
  const healthScore = entries
    .map(({ created_at, health_score }) => ({ created_at, health_score }))
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const byName = new Map(); // measurement name -> { category, history, latest, latestTS, latestExpiry }
  for (const entry of entries) {
    const ts = new Date(entry.created_at).getTime();
    for (const bio of entry.biometrics) {
      let record = byName.get(bio.name);
      if (!record) byName.set(bio.name, (record = { category: bio.category, history: [], latest: null, latestTS: 0, latestExpiry: "" }));
      record.history.push({ ts, bio });
      if (ts > record.latestTS) Object.assign(record, { latest: bio, latestTS: ts, latestExpiry: bio.expiry_date });
    }
  }

  const biometrics = Object.create(null);
  const latestBiometrics = [];
  const hyper = [];
  const hypo = [];
  for (const [name, record] of byName) {
    record.history.sort((a, b) => a.ts - b.ts);
    const ref = record.latest ?? record.history[0].bio;
    (biometrics[record.category] ??= Object.create(null))[name] = {
      id: ref.id,
      lastUpdated: new Date(record.latestTS).toISOString(),
      expiryOn: record.latestExpiry,
      unit: ref.unit,
      healthy_min: ref.healthy_min,
      healthy_max: ref.healthy_max,
      entries: record.history.map(({ ts, bio }) => ({ createdAt: new Date(ts).toISOString(), value: bio.value, scaledValue: bio.scaled_value, expiryDate: bio.expiry_date, isHyper: bio.is_hyper })),
    };
    if (!record.latest) continue;
    const bio = record.latest;
    const latest = { id: bio.id, name: bio.name, category: bio.category, unit: bio.unit, healthy_min: bio.healthy_min, healthy_max: bio.healthy_max, value: bio.value, scaledValue: bio.scaled_value, expiryDate: bio.expiry_date, isHyper: bio.is_hyper };
    latestBiometrics.push(latest);
    if (latest.isHyper === true) hyper.push(latest);
    else if (latest.isHyper === false) hypo.push(latest);
  }

  const flagged = latestBiometrics.filter(({ isHyper }) => isHyper !== null).map(({ id, isHyper }) => ({ id, is_hyper: isHyper }));
  if (flagged.length) {
    try { attachConditions(await getConditions(flagged), hyper, hypo); }
    catch (error) { console.error("Error fetching conditions:", error); }
  }
  return { healthScore, biometrics, latestBiometrics, hyperBiochemicals: hyper, hypoBiochemicals: hypo };
};

const attachConditions = (conditions, hyper, hypo) => {
  if (!conditions?.length) return;
  const hyperById = new Map(hyper.map((bio) => [bio.id, bio]));
  const hypoById = new Map(hypo.map((bio) => [bio.id, bio]));
  for (const { id, is_hyper, conditions: linked } of conditions) {
    const bio = (is_hyper ? hyperById : hypoById).get(id);
    if (bio) bio.conditions = linked;
  }
};
