import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { CHART_COLORS } from "@/lib/chart-theme";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BiochemicalsBarGraph = ({ biochemicalsArray, isHyper, isHealthy }) => {
  if (!biochemicalsArray || biochemicalsArray.length === 0) {
    return null;
  }

  // Set the appropriate title based on the parameters
  let graphTitle = "Measurements within reference range";
  if (!isHealthy) {
    graphTitle = isHyper ? "Measurements above range" : "Measurements below range";
  }

  // Determine if we should use horizontal bars:
  // For healthy or when isHyper is null, we use horizontal bars.
  const isHorizontal = isHealthy || isHyper === null;

  // Prepare data for the chart
  const labels = biochemicalsArray.map((item) => item.name);
  const values = biochemicalsArray.map((item) => {
    // For hypo values, make them negative to face downward if they aren't already
    if (!isHealthy && !isHyper && item.scaled_value > 0) {
      return -item.scaled_value;
    }
    return item.scaled_value;
  });

  // Determine bar color based on status
  const barColor = isHealthy
    ? CHART_COLORS.successFill
    : isHyper ? CHART_COLORS.dangerFill : CHART_COLORS.warningFill;

  const data = {
    labels: labels,
    datasets: [
      {
        data: values,
        backgroundColor: barColor,
        borderColor: isHealthy ? CHART_COLORS.success : isHyper ? CHART_COLORS.danger : CHART_COLORS.warning,
        borderWidth: 1,
        barPercentage: isHorizontal ? 0.5 : 0.3,
        categoryPercentage: isHorizontal ? 0.7 : 0.6,
        barThickness: isHorizontal ? 5 : undefined,
      },
    ],
  };

  // Configuration options with:
  // - Hidden numeric (scaled) tick labels on the appropriate axis.
  // - All vertical grid lines removed (x-axis grid disabled).
  const options = {
    indexAxis: isHorizontal ? 'y' : 'x',
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        position: !isHealthy && !isHyper ? 'top' : 'bottom',
        beginAtZero: true,
        display: true,
        grid: {
          display: false, // Hides all vertical grid lines
        },
        ticks: {
          // For horizontal charts, the x-axis is numeric so hide its ticks.
          // For vertical charts, the x-axis shows categories so display them.
          display: isHorizontal ? false : true,
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 7,
          },
        },
        border: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        display: true,
        grid: {
          // For horizontal charts, the y-axis grid lines (horizontal lines) remain.
          // For vertical charts, they are horizontal grid lines.
          display: true,
          color: CHART_COLORS.cloud,
          drawBorder: false,
        },
        ticks: {
          // For vertical charts, the y-axis is numeric so hide its ticks.
          // For horizontal charts, the y-axis shows categories so display them.
          display: isHorizontal ? true : false,
          autoSkip: false,
          color: CHART_COLORS.slate,
          font: {
            size: 7,
          },
          callback: function(value, index) {
            const label = this.getLabelForValue(value);
            return label.length > 15 ? label.substr(0, 15) + '...' : label;
          }
        },
        border: {
          display: true,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const index = context.dataIndex;
            const biochemical = biochemicalsArray[index];
            let label = ` ${biochemical.value} ${biochemical.unit}`;
            if (!isHealthy) {
              if (isHyper) {
                label += ` (Max Healthy: ${biochemical.healthy_max})`;
              } else {
                label += ` (Min Healthy: ${biochemical.healthy_min})`;
              }
            }
            return label;
          },
        },
      },
      title: {
        display: true,
        text: graphTitle,
        font: {
          size: 12,
          weight: "bold",
        },
      },
    },
  };

  return (
    <div className={`${isHorizontal ? "min-h-[520px]" : "min-h-[250px]"} bio-panel w-full p-3`}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BiochemicalsBarGraph;
