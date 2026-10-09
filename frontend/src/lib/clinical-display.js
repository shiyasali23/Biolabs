// Display rules only: never alters values sent to a clinical model.
export function numeric(value) {
  if (value == null || typeof value === "boolean" || String(value).trim() === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}
export function rangeStatus(item) {
  const value = numeric(item.value), min = numeric(item.healthy_min), max = numeric(item.healthy_max);
  if (value == null || min == null || max == null || min > max) return "unknown";
  return value < min ? "low" : value > max ? "high" : "normal";
}
export const statusLabels = { normal: "Within range", high: "Above range", low: "Below range", unknown: "Range unavailable" };
export const statusClasses = { normal: "bio-status-normal", high: "bio-status-danger", low: "bio-status-warning", unknown: "bio-status text-[var(--biolabs-slate)] bg-[var(--biolabs-porcelain)]" };
export function formatNumber(value) { const number=numeric(value); return number == null ? "—" : new Intl.NumberFormat("en", { maximumFractionDigits: Math.abs(number)>0 && Math.abs(number)<.01 ? 6 : 2 }).format(number); }
