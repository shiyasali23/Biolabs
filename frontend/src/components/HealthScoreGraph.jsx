import { formatNumber } from "@/lib/clinical-display";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler } from "chart.js";
import { CHART_COLORS } from "@/lib/chart-theme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function HealthScoreGraph({ handleBiometricEntry, healthScore, clean = false }) {
  if (!healthScore?.length) return <div className="grid h-full place-items-center text-sm text-[var(--biolabs-slate)]">No health-score history is available.</div>;
  const format = (value) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const scores = healthScore.map((item) => item.health_score);
  const data = { labels: healthScore.map((item) => format(item.created_at)), datasets: [{ label: "Health score", data: scores, borderColor: CHART_COLORS.teal, pointBackgroundColor: CHART_COLORS.white, pointBorderColor: scores.map((score) => score < 0 ? CHART_COLORS.danger : CHART_COLORS.success), pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, borderWidth: 2, tension: .32, fill: { target: "origin", above: CHART_COLORS.successWash, below: CHART_COLORS.dangerWash } }] };
  const options = { responsive: true, maintainAspectRatio: false, interaction: { intersect: false, mode: "index" }, plugins: { datalabels: { display: false }, legend: { display: false }, tooltip: { displayColors: false, callbacks: { label: (context) => `Health score: ${formatNumber(context.parsed.y)}` } } }, scales: { x: { grid: { display: false }, ticks: { color: CHART_COLORS.muted, font: { size: 12 } }, border: { color: CHART_COLORS.cloud } }, y: { grid: { color: CHART_COLORS.cloud }, ticks: { color: CHART_COLORS.muted, font: { size: 12 } }, border: { display: false } } }, onClick: (_, elements) => { if (elements.length) handleBiometricEntry(healthScore[elements[0].index].created_at); } };
  if (clean) { options.scales.y.display = false; options.scales.y.grid.display = false; options.scales.x.border.display = false; }
  return <div className="h-full w-full"><Line aria-label={`Interactive line chart showing ${healthScore.length} health-score entries`} data={data} options={options}/><span className="sr-only">Select a data point to inspect that record.</span></div>;
}
