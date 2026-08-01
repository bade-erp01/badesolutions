"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { Line } from "react-chartjs-2";
import { StarIcon, ChartBarIcon} from "@heroicons/react/24/solid";
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

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const StoreChart = ({ productsList }) => {
  const [products] = useState(productsList);

  // Memoized computations
  const sortedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.currentQty - a.currentQty)
      .filter((p) => p.currentQty > 0);
  }, [products]);

  const bestSeller = sortedProducts[0];

  // Gradient helpers
  const gradientFill = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, 420);
    gradient.addColorStop(0, "rgba(59, 130, 246, 0.65)"); // blue-500
    gradient.addColorStop(1, "rgba(147, 51, 234, 0.15)"); // purple-600
    return gradient;
  };

  const gradientBorder = (ctx) => {
    const gradient = ctx.createLinearGradient(0, 0, 700, 0);
    gradient.addColorStop(0, "#3b82f6");
    gradient.addColorStop(1, "#a855f7");
    return gradient;
  };

  const data = {
    labels: sortedProducts.map((p) => p.productName.length > 12 
      ? p.productName.substring(0, 12) + "..." 
      : p.productName),
    datasets: [
      {
        label: "Current Stock",
        data: sortedProducts.map((p) => p.currentQty),
        fill: true,
        backgroundColor: (context) => gradientFill(context.chart.ctx),
        borderColor: (context) => gradientBorder(context.chart.ctx),
        borderWidth: 3,
        tension: 0.65,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#3b82f6",
        pointBorderWidth: 2,
        pointHoverRadius: 6,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1000, easing: "easeOutQuart" },
    plugins: {
      legend: {
        display: true,
        position: "top",
        align: "end",
        labels: {
          color: "hsl(var(--foreground))",
          font: { size: 13, weight: "600" },
          usePointStyle: true,
          padding: 20,
        },
      },
      tooltip: {
        enabled: false,
        external: (context) => {
          let tooltipEl = document.getElementById("chartjs-tooltip");
          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.style.position = "absolute";
            tooltipEl.style.zIndex = "100";
            document.body.appendChild(tooltipEl);
          }

          const tooltipModel = context.tooltip;
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = "0";
            return;
          }

          const index = tooltipModel.dataPoints[0].dataIndex;
          const product = sortedProducts[index];
          const imageUrl = product.image || "/preview.png";

          tooltipEl.innerHTML = `
            <div class="bg-card border border-border rounded-xl shadow-xl p-4 w-56 text-sm">
              <div class="flex items-center gap-3">
                <img src="${imageUrl}" alt="${product.productName}" 
                     class="w-14 h-14 object-cover rounded-lg border border-border" />
                <div>
                  <strong class="block text-foreground">${product.productName}</strong>
                  <div class="text-muted-foreground text-xs mt-1">
                    ${product.currentQty} cases • ${product.pcs} pcs
                  </div>
                </div>
              </div>
              ${product.LastBatchDate ? 
                `<div class="mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
                  Last purchased: <span class="font-medium">${product.LastBatchDate}</span>
                </div>` : ''}
            </div>
          `;

          const position = context.chart.canvas.getBoundingClientRect();
          tooltipEl.style.left = `${position.left + window.pageXOffset + tooltipModel.caretX - 110}px`;
          tooltipEl.style.top = `${position.top + window.pageYOffset + tooltipModel.caretY - 110}px`;
          tooltipEl.style.opacity = "1";
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Products",
          color: "hsl(var(--muted-foreground))",
          font: { size: 14, weight: "600" },
        },
        ticks: {
          color: "hsl(var(--muted-foreground))",
          maxRotation: 45,
          minRotation: 45,
          font: { size: 12 },
        },
        grid: {
          color: "hsl(var(--border))",
          lineWidth: 0.5,
        },
      },
      y: {
        title: {
          display: true,
          text: "Stock Quantity (Cases)",
          color: "hsl(var(--muted-foreground))",
          font: { size: 14, weight: "600" },
        },
        ticks: { color: "hsl(var(--muted-foreground))" },
        grid: {
          color: "hsl(var(--border))",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Main Card */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm dark:shadow-xl transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl">
              <ChartBarIcon className="h-7 w-7 text-blue-500" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-foreground">Store Inventory Overview</h3>
              <p className="text-sm text-muted-foreground">Real-time stock levels • Top performers</p>
            </div>
          </div>
          
          {bestSeller && (
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full">
            
              {sortedProducts.length} active products
            </div>
          )}
        </div>

        {/* Chart Container */}
        <div className="relative bg-muted/30 rounded-xl border border-border p-4 min-h-[420px] mb-8">
          <Line data={data} options={options} />
        </div>

        {/* Best Seller Highlight */}
        {bestSeller && (
          <div className="bg-gradient-to-br from-card to-muted/50 border border-border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <Image
                src={bestSeller.image || "/preview.png"}
                alt={bestSeller.productName}
                width={140}
                height={140}
                className="w-32 h-32 md:w-36 md:h-36 object-cover rounded-2xl border-2 border-white dark:border-gray-800 shadow-lg"
              />
              <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <StarIcon className="h-3.5 w-3.5" /> TOP
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-600 dark:text-yellow-400 px-4 py-1 rounded-full text-sm font-semibold mb-3">
                MOST STOCKED PRODUCT
              </div>
              
              <h4 className="text-2xl font-bold text-foreground mb-2 leading-tight">
                {bestSeller.productName}
              </h4>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Cases:</span>{" "}
                  <span className="font-mono font-semibold text-foreground">{bestSeller.currentQty}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Pieces:</span>{" "}
                  <span className="font-mono font-semibold text-foreground">{bestSeller.pcs}</span>
                </div>
                {bestSeller.LastBatchDate && (
                  <div>
                    <span className="text-muted-foreground">Last purchase:</span>{" "}
                    <span className="font-medium">{bestSeller.LastBatchDate}</span>
                  </div>
                )}
                {bestSeller.ExpDate && (
                  <div>
                    <span className="text-muted-foreground">Expiry Date:</span>{" "}
                    <span className="font-medium">{bestSeller.ExpDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreChart;