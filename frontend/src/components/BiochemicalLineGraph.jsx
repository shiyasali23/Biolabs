import { headingCase } from "@/lib/heading-case";
import { rangeStatus, statusLabels, statusClasses, formatNumber } from "@/lib/clinical-display";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from "chart.js";
import { CHART_COLORS } from "@/lib/chart-theme";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip);

export default function BiochemicalLineGraph({ biochemical, name }) {
  if (!biochemical?.entries?.length) return <div className="bio-panel grid min-h-64 place-items-center text-sm text-[var(--biolabs-slate)]">No data available</div>;
  const entries = [...biochemical.entries].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const values = entries.map((entry) => entry.value);
  const span = Math.max(...values, biochemical.healthy_max) - Math.min(...values, biochemical.healthy_min) || 1;
  const min = Math.max(0, Math.min(...values, biochemical.healthy_min) - span * .25);
  const max = Math.max(...values, biochemical.healthy_max) + span * .25;
  const data = { labels: entries.map((entry) => new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })), datasets: [{ data: values, borderColor: CHART_COLORS.teal, backgroundColor: CHART_COLORS.teal, pointBackgroundColor: entries.map((entry) => rangeStatus({...biochemical,...entry}) === "normal" ? CHART_COLORS.teal : CHART_COLORS.danger), pointRadius: 3, borderWidth: 2, tension: .3 }] };
  const rangePlugin = { id: `range-${name.replace(/\W/g, "-")}`, beforeDatasetsDraw(chart) { const { ctx, chartArea, scales } = chart; if (!chartArea) return; const top = scales.y.getPixelForValue(biochemical.healthy_max), bottom = scales.y.getPixelForValue(biochemical.healthy_min); ctx.save(); ctx.fillStyle = CHART_COLORS.tealWash; ctx.fillRect(chartArea.left, top, chartArea.right - chartArea.left, bottom - top); ctx.restore(); } };
  const tickFont = (context) => ({ size: context.chart.width < 260 ? 10 : 12 });
  const options = { responsive: true, maintainAspectRatio: false, plugins: { datalabels: { display: false }, legend: { display: false }, tooltip: { displayColors: false, callbacks: { label: (context) => `${name}: ${context.parsed.y.toFixed(2)} ${biochemical.unit}` } } }, scales: { x: { grid: { display: false }, ticks: { color: CHART_COLORS.muted, font: tickFont, maxRotation: 0, autoSkipPadding: 6 }, border: { color: CHART_COLORS.cloud } }, y: { min, max, grid: { color: CHART_COLORS.cloud }, ticks: { color: CHART_COLORS.muted, font: tickFont, maxTicksLimit: 5 }, border: { display: false } } } };
  const latest = entries.at(-1);
  return <article className="bio-card min-w-0 p-3 sm:p-4"><div className="flex flex-col items-start gap-2 sm:flex-row sm:justify-between sm:gap-4"><div className="min-w-0"><h3 className="text-[13px] font-semibold leading-snug sm:text-base">{headingCase(name)}</h3><p className="mt-1 text-[11px] text-[var(--biolabs-slate)] sm:text-xs">Current reference {biochemical.healthy_min}–{biochemical.healthy_max} {biochemical.unit}</p></div><span className={statusClasses[rangeStatus({...biochemical,...latest})]}>{statusLabels[rangeStatus({...biochemical,...latest})]}</span></div><div className="mt-3 h-40 sm:mt-4 sm:h-64"><Line data={data} options={options} plugins={[rangePlugin]}/></div><details className="mt-2 text-xs sm:mt-3 sm:text-sm"><summary className="cursor-pointer py-2">View measurement values</summary><ul className="divide-y">{entries.map((entry,index)=><li key={index} className="flex flex-wrap justify-between gap-x-4 py-2"><span>{new Date(entry.createdAt).toLocaleDateString()}</span><span>{formatNumber(entry.value)} {biochemical.unit}</span></li>)}</ul></details><div className="mt-3 flex flex-wrap justify-between gap-x-2 gap-y-1 border-t pt-3 text-[11px] text-[var(--biolabs-slate)] sm:mt-4 sm:text-xs"><span>Updated {new Date(biochemical.lastUpdated).toLocaleDateString()}</span><span>{new Date(biochemical.expiryOn) < new Date() ? "Expired" : "Valid until"} {new Date(biochemical.expiryOn).toLocaleDateString()}</span></div></article>;
}
