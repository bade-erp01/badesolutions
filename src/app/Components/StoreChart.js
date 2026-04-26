"use client";

import { useState } from "react";
import Image from "next/image";
import { Line } from "react-chartjs-2";
import { StarIcon, ChartBarIcon } from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const StoreChart = ({ productsList }) => {
  const [products] = useState(productsList);
  const filtered = products.sort((a, b) => b.currentQty - a.currentQty).filter((p) => p.currentQty > 0);
  const sorted = [...filtered];
  const bestSort = products.sort((a, b) => b.currentQty - a.currentQty);
  const bestSeller = bestSort[0];

  const gradientFill = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, "rgba(250, 72, 40, 0.62)");
    gradient.addColorStop(1, "rgba(205, 203, 211, 0.69)");
    return gradient;
  };

  const gradientBorder = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 600, 0);
    gradient.addColorStop(0, "#cf1e11b2");
    gradient.addColorStop(1, "#94d4eefb");
    return gradient;
  };

  const data = {
    labels: sorted.map((p) => p.productName.substring(0, 7).trim()),
    datasets: [
      {
        label: "Heat Map",
        data: sorted.map((p) => p.currentQty),
        fill: true,
        backgroundColor: (context) => gradientFill(context.chart.ctx),
        borderColor: (context) => gradientBorder(context.chart.ctx),
        pointBackgroundColor: "#a9c1e6ff",
        pointBorderColor: "#a9c1e6ff",
        pointBorderWidth: 2,
        tension: 0.7,
        pointRadius: 2,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        labels: {
          color: "#a9c1e6ff",
          font: { size: 13, weight: "600" },
        },
      },
      tooltip: {
        enabled: false,
        external: function (context) {
          const tooltipModel = context.tooltip;
          const chartCanvas = context.chart.canvas;
          let tooltipEl = document.getElementById("chartjs-tooltip");

          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.style.position = "absolute";
            tooltipEl.style.background = "rgba(30,41,59,0.9)";
            tooltipEl.style.border = "1px solid #475569";
            tooltipEl.style.borderRadius = "10px";
            tooltipEl.style.padding = "12px";
            tooltipEl.style.color = "#f8fafc";
            tooltipEl.style.pointerEvents = "none";
            tooltipEl.style.transition = "opacity 0.3s ease";
            tooltipEl.style.zIndex = "100";
            document.body.appendChild(tooltipEl);
          }

          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = "0";
            return;
          }

          const index = tooltipModel.dataPoints[0].dataIndex;
          const product = sorted[index];
          const imageUrl = product.image || "/preview.png";

          tooltipEl.innerHTML = `
            <div style="text-align:center;">
              <strong>${product.productName}</strong><br/>
              <img src="${imageUrl}" alt="${product.productName}" style="width:60px;height:auto;border-radius:6px;margin-top:6px;" />
              <div style="margin-top:8px;">Case:${product.currentQty} Pcs:${product.pcs}</div>
            </div>
          `;

          const position = chartCanvas.getBoundingClientRect();
          tooltipEl.style.left =
            position.left + window.pageXOffset + tooltipModel.caretX + "px";
          tooltipEl.style.top =
            position.top + window.pageYOffset + tooltipModel.caretY - 90 + "px";
          tooltipEl.style.opacity = "1";
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Product Name",
          color: "#e3e3e6ff",
          font: { size: 15, weight: "bold" },
        },
        ticks: {
          color: "#e3e3e6ff",
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: true,
          color: "rgba(255, 252, 252, 0.4)",
          borderDash: [4, 4],
        },
      },
      y: {
        title: {
          display: true,
          text: "Available Stock Quantity",
          color: "#e3e3e6ff",
          font: { size: 15, weight: "bold" },
        },
        ticks: { color: "#e3e3e6ff" },
        grid: {
          color: "rgba(255, 252, 252, 0.4)",
          borderDash: [4, 4],
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="rounded-lg p-6 shadow-lg bg-[#1e1e20]/70 backdrop-blur-md border border-gray-700 mb-6">
      <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ChartBarIcon className="h-6 w-6 text-sky-400" />
        <span>Store Inventory Overview</span>
      </h4>

      <div className="mb-6">
        <div
          className="border border-gray-600 rounded-lg p-2 bg-black/30"
          style={{
            minWidth: `600px`,
            height: "450px",
          }}
        >
          <Line data={data} options={options} />
        </div>
      </div>

      {bestSeller && (
        <div className="bg-black/40 border border-gray-600 rounded-lg shadow-md p-5 flex items-center gap-6">
          <Image
            src={bestSeller.image || "/preview.png"}
            alt={bestSeller.productName}
            width={50}
            height={50}
            quality={100}
            className="w-24 h-24 object-cover rounded-lg border border-gray-500"
          />
          <div>
            <div className="flex items-center gap-2 mb-1 text-xs">
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-semibold">
                Most Stocked Product
              </span>
              <div className="flex gap-1">
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <StarIcon className="h-5 w-5 text-yellow-400" />
                <StarIcon className="h-5 w-5 text-yellow-400" />
              </div>
            </div>
            <h5 className="text-sm font-bold text-white">{bestSeller.productName}</h5>
            <p className="text-xs text-gray-300">Case:{bestSeller.currentQty} Pcs:{bestSeller.pcs}</p>
            <p className="text-xs text-gray-400 mt-1">
              <strong>Last Purchased date:</strong>{" "}
              {bestSeller.LastBatchDate || "No data available."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreChart;
