import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";
import { CHART_COLORS } from "@/lib/chart-theme";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Healthy values render as horizontal bars; above-range bars rise and below-range bars hang from the top axis.
export default function BiochemicalsBarGraph({ biochemicalsArray, isHyper, isHealthy }) {
  if (!biochemicalsArray?.length) return null;
  const isHorizontal = isHealthy || isHyper === null;
  const isHypo = !isHealthy && !isHyper;
  const tone = isHealthy ? "success" : isHyper ? "danger" : "warning";
  const font = { size: 7 };

  const data = {
    labels: biochemicalsArray.map((item) => item.name),
    datasets: [{
      data: biochemicalsArray.map((item) => (isHypo && item.scaled_value > 0 ? -item.scaled_value : item.scaled_value)),
      backgroundColor: CHART_COLORS[`${tone}Fill`],
      borderColor: CHART_COLORS[tone],
      borderWidth: 1,
      barPercentage: isHorizontal ? 0.5 : 0.3,
      categoryPercentage: isHorizontal ? 0.7 : 0.6,
      barThickness: isHorizontal ? 5 : undefined,
    }],
  };

  const options = {
    indexAxis: isHorizontal ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      // The value axis is unlabeled; only the category axis shows names.
      x: { position: isHypo ? "top" : "bottom", beginAtZero: true, grid: { display: false }, ticks: { display: !isHorizontal, autoSkip: false, maxRotation: 45, minRotation: 45, font } },
      y: {
        beginAtZero: true,
        grid: { color: CHART_COLORS.cloud },
        ticks: {
          display: isHorizontal, autoSkip: false, color: CHART_COLORS.slate, font,
          callback(value) { const label = this.getLabelForValue(value); return label.length > 15 ? `${label.slice(0, 15)}...` : label; },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: ({ dataIndex }) => {
            const item = biochemicalsArray[dataIndex];
            const limit = isHealthy ? "" : isHyper ? ` (Max Healthy: ${item.healthy_max})` : ` (Min Healthy: ${item.healthy_min})`;
            return ` ${item.value} ${item.unit}${limit}`;
          },
        },
      },
      title: {
        display: true,
        text: isHealthy ? "Measurements within reference range" : isHyper ? "Measurements above range" : "Measurements below range",
        font: { size: 12, weight: "bold" },
      },
    },
  };

  return (
    <div className={`${isHorizontal ? "min-h-[520px]" : "min-h-[250px]"} bio-panel w-full p-3`}>
      <Bar data={data} options={options} />
    </div>
  );
}
