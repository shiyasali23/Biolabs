import React, { useEffect, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  SubTitle,
} from "chart.js";
import ErrorComponent from "./ErrorComponent";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  SubTitle
);

const HealthScoreGraph = ({ handleBiometricEntry, healthScore }) => {
  const chartRef = useRef(null);

  if (!healthScore) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date
      .getFullYear()
      .toString()
      .slice(2)}`;
  };

  // Use effect to add additional removal of data values
  useEffect(() => {
    // This ensures that any auto-generated labels are removed after rendering
    const removeLabels = () => {
      if (chartRef.current) {
        const chart = chartRef.current;
        const valueLabels = document.querySelectorAll(
          '[data-testid="value-label"]'
        );
        valueLabels.forEach((label) => {
          label.style.display = "none";
        });
      }
    };

    // Run on mount and periodically check
    removeLabels();
    const interval = setInterval(removeLabels, 100);
    return () => clearInterval(interval);
  }, [chartRef]);

  const data = {
    labels: healthScore.map((item) => formatDate(item.created_at)),
    datasets: [
      {
        label: "Biometrics Entries",
        data: healthScore.map((item) => item.health_score),
        borderColor: "#006A71",
        backgroundColor: "rgba(0, 106, 113, 0.1)",
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#006A71",
        borderWidth: 3,
        // Explicitly disable any value display
        datalabels: { display: false },
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: {
        enabled: false,
        callbacks: {
          label: () => null, // Forcibly remove any labels
        },
      },
      datalabels: { display: false }, // Disable datalabels plugin if it exists
      title: {
        display: true,
        text: "Biometrics Entries",
        font: {
          size: 17,
          weight: "bold",
          letterSpacing: 1.5,
        },
        color: "#333333",
        padding: {
          top: 10,
        },
      },
      subtitle: {
        display: true,
        text: "*(Click on the dates)",
        font: {
          size: 10,
          weight: "bold",
        },
        color: "rgba(51, 51, 51, 0.84)",
        padding: {
          top: 10,
        },
      },
      legend: { display: false },
    },
    scales: {
      x: {
        offset: true,
        grid: { display: true, drawBorder: false },
        ticks: { display: false },
      },
      y: {
        grid: { display: true, drawBorder: false },
        ticks: { display: false },
        afterDataLimits: (scale) => {
          if (scale.min > 0) scale.min = 0;
          if (scale.max < 0) scale.max = 0;
          const range = scale.max - scale.min;
          scale.min -= range * 0.1;
          scale.max += range * 0.1;
        },
      },
    },
    layout: { padding: { left: 0, right: 0, top: 0, bottom: 0 } },
    elements: { line: { borderJoinStyle: "round" } },
    onClick: (event, elements, chart) => {
      if (elements.length > 0) {
        const { index } = elements[0];
        const createdAt = healthScore[index].created_at;
        handleBiometricEntry(createdAt);
      }
    },
  };

  return (
    <div className="w-full h-full bg-[#ECF4F3] shadow-[0_0_8px_2px_rgba(0,0,0,0.05)]">
      {!healthScore ? (
        <ErrorComponent />
      ) : (
        <div className="w-full h-full">
          <Line
            ref={chartRef}
            data={data}
            options={options}
            plugins={[
              {
                id: "preventDataValueDisplay",
                beforeInit: (chart) => {
                  // Override any method that might display data values
                  const originalDraw = chart.draw;
                  chart.draw = function () {
                    originalDraw.apply(this, arguments);

                    // Find and remove any text that might be showing data values
                    const ctx = chart.ctx;
                    const originalFillText = ctx.fillText;
                    ctx.fillText = function (text, x, y) {
                      // Check if text is a number (likely a data value)
                      if (!isNaN(parseFloat(text)) && isFinite(text)) {
                        return; // Don't display numerical values
                      }
                      originalFillText.apply(this, arguments);
                    };
                  };
                },
              },
              {
                id: "zeroLine",
                afterDatasetsDraw: (chart) => {
                  const { ctx, chartArea, scales } = chart;
                  if (!chartArea) return;
                  const zeroY = scales.y.getPixelForValue(0);
                  if (zeroY >= chartArea.top && zeroY <= chartArea.bottom) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.strokeStyle = "rgba(0, 105, 113, 0.49)";
                    ctx.lineWidth = 1.5;
                    ctx.setLineDash([]);
                    ctx.moveTo(chartArea.left, zeroY);
                    ctx.lineTo(chartArea.right, zeroY);
                    ctx.stroke();
                    ctx.restore();
                  }
                },
              },
              {
                id: "customBackground",
                beforeDraw: (chart) => {
                  const { ctx, chartArea } = chart;
                  if (!chartArea) return;
                  ctx.save();
                  ctx.fillStyle = "#ECF4F3";
                  ctx.fillRect(0, 0, chart.width, chart.height);
                  ctx.restore();
                },
              },
              {
                id: "dateLabels",
                afterDatasetsDraw: (chart) => {
                  const { ctx, data, scales } = chart;
                  ctx.save();
                  ctx.textAlign = "center";
                  data.datasets[0].data.forEach((datapoint, index) => {
                    const xPos = scales.x.getPixelForValue(index);
                    const yPos = scales.y.getPixelForValue(datapoint);
                    const chartMiddle = (scales.y.top + scales.y.bottom) / 2;
                    const isAboveMiddle = yPos < chartMiddle;

                    // Only draw date labels
                    const label = data.labels[index];
                    const labelYPos = isAboveMiddle ? yPos + 35 : yPos - 35;

                    // Draw only the date label
                    ctx.font = "bold 9px 'Inter', sans-serif";
                    ctx.fillStyle = "#333333";
                    ctx.fillText(label, xPos, labelYPos);

                    // Draw lines connecting points to date labels
                    ctx.beginPath();
                    ctx.strokeStyle = "#006A71";
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(xPos, yPos + (isAboveMiddle ? 4 : -4));
                    ctx.lineTo(xPos, labelYPos + (isAboveMiddle ? -4 : 4));
                    ctx.stroke();
                  });
                  ctx.restore();
                },
              },
              {
                id: "clickablePoints",
                afterDatasetsDraw: (chart) => {
                  const { ctx, data, scales } = chart;
                  ctx.save();

                  // Create larger invisible hit areas around each point
                  data.datasets[0].data.forEach((datapoint, index) => {
                    const xPos = scales.x.getPixelForValue(index);
                    const yPos = scales.y.getPixelForValue(datapoint);

                    // Add cursor style to make points appear clickable
                    chart.canvas.style.cursor = "pointer";

                    // Store data point positions for click detection
                    if (!chart.clickableAreas) chart.clickableAreas = [];
                    chart.clickableAreas[index] = {
                      x: xPos,
                      y: yPos,
                      radius: 15, // Larger than visible point for easier clicking
                      dataIndex: index,
                    };
                  });

                  ctx.restore();
                },
              },
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default HealthScoreGraph;
