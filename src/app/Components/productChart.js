"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { escapeHtml } from "@/lib/security/escapeHtml";
import { safeUrl } from "@/lib/security/safeUrl";
import { Bar } from "react-chartjs-2";
import { StarIcon, ChartBarIcon, TrophyIcon } from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Filler);

const ProductSalesChart = ({ productsList }) => {
  const [products] = useState(productsList);

  const processedData = useMemo(() => {
    const filtered = [...products]
      .filter((p) => p.TotalSale > 0)
      .sort((a, b) => b.TotalSale - a.TotalSale);

    return {
      filtered,
      bestSeller: filtered[0],
      top10: filtered.slice(0, 10),
    };
  }, [products]);

  const { bestSeller, top10 } = processedData;
  const totalSales = top10.reduce((sum, p) => sum + p.TotalSale, 0);

  const data = {
    labels: top10.map((p) =>
      p.Name.length > 22 ? p.Name.substring(0, 22) + "..." : p.Name
    ),
    datasets: [
      {
        label: "Units Sold",
        data: top10.map((p) => p.TotalSale),
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "#f97316");
          gradient.addColorStop(1, "#c2410c");
          return gradient;
        },
        borderColor: "#fb923c",
        borderWidth: 2,
        borderRadius: 12,
        borderSkipped: false,
        hoverBackgroundColor: "#fb923c",
      },
    ],
  };

  const options = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 1400, easing: "easeOutQuart" },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: false,
        external: function (context) {
          let tooltipEl = document.getElementById("chartjs-tooltip");
          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.style.position = "absolute";
            tooltipEl.style.padding = "14px";
            tooltipEl.style.borderRadius = "12px";
            tooltipEl.style.pointerEvents = "none";
            tooltipEl.style.zIndex = "100";
            tooltipEl.style.boxShadow = "0 10px 15px -3px rgb(0 0 0 / 0.3)";
            document.body.appendChild(tooltipEl);
          }

          if (context.tooltip.opacity === 0) {
            tooltipEl.style.opacity = "0";
            return;
          }

          const index = context.tooltip.dataPoints[0].dataIndex;
          const product = top10[index];
          const imageUrl = product.image || "/preview.png";

          tooltipEl.innerHTML = `
            <div class="flex gap-4 items-center min-w-[240px]">
              <img src="${escapeHtml(safeUrl(imageUrl))}" alt="${escapeHtml(product.Name)}" class="w-16 h-16 object-cover rounded-2xl" />
              <div>
                <div class="font-bold text-base">${escapeHtml(product.Name)}</div>
                <div class="text-xl font-mono font-semibold text-orange-500">${escapeHtml(product.TotalSale)} units</div>
              </div>
            </div>
          `;

          const position = context.chart.canvas.getBoundingClientRect();
          tooltipEl.style.opacity = "1";
          tooltipEl.style.left = `${position.left + window.pageXOffset + context.tooltip.caretX + 20}px`;
          tooltipEl.style.top = `${position.top + window.pageYOffset + context.tooltip.caretY - 50}px`;
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Units Sold", font: { size: 13, weight: "600" } },
        ticks: { font: { size: 12 } },
        grid: { color: "rgba(148, 163, 184, 0.15)" },
      },
      y: {
        ticks: { font: { size: 13 }, padding: 12 },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-zinc-950 
                    rounded-md p-4 sm:p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-700/50 mb-3">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="shrink-0 p-3 bg-orange-100 dark:bg-orange-500/10 rounded-2xl">
            <ChartBarIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Sales Performance
            </h3>
            <p className="text-slate-500 dark:text-slate-400">Top products by volume</p>
          </div>
        </div>

        <div className="text-left md:text-right">
          <div className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
            TOTAL UNITS SOLD
          </div>
          <div className="text-3xl sm:text-4xl font-mono font-bold text-slate-900 dark:text-white tracking-tighter">
            {totalSales.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Chart Area */}
        <div className="lg:col-span-7 min-w-0 bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-2xl p-3 sm:p-5 md:p-6">
          <div className="h-[360px] sm:h-[460px] md:h-[520px]">
            <Bar data={data} options={options} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-5 min-w-0 space-y-6">
          {/* Best Seller */}
          {bestSeller && (
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-amber-900/30 dark:to-orange-900/20 
                            border border-orange-200 dark:border-orange-500/30 rounded-3xl p-4 sm:p-7 relative">
              <div className="absolute top-5 right-5">
                <TrophyIcon className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <div className="px-4 py-1 bg-amber-400 text-amber-950 text-xs font-bold rounded-full flex items-center gap-1">
                  <StarIcon className="h-4 w-4" /> BEST SELLER
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
                <Image
                  src={bestSeller.image || "/preview.png"}
                  alt={bestSeller.Name}
                  width={140}
                  height={140}
                  className="shrink-0 w-32 h-32 md:w-36 md:h-36 object-cover rounded-2xl border border-orange-300 dark:border-orange-400 shadow-md"
                />

                <div className="pt-1 min-w-0">
                  <h4 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight break-words">
                    {bestSeller.Name}
                  </h4>
                  <p className="text-2xl font-mono font-semibold text-orange-600 dark:text-orange-400 mt-1">
                    {bestSeller.TotalSale} <span className="text-base">units</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">
                    {bestSeller.ADCcode || bestSeller.ACDcode}
                  </p>

                  <div className="mt-5">
                    <p className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-1">Description</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                      {bestSeller.description || bestSeller.Description || "No description available."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top 5 */}
          <div className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-3xl p-4 sm:p-6">
            <h5 className="font-semibold text-slate-700 dark:text-slate-300 mb-5 flex items-center gap-2">
              TOP 5 PRODUCTS
              <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            </h5>

            <div className="space-y-4">
              {top10.slice(0, 5).map((product, idx) => (
                <div key={idx} className="flex items-center gap-3 sm:gap-4 group">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center bg-slate-200 dark:bg-slate-800 text-orange-600 dark:text-orange-400 font-bold rounded-2xl text-sm">
                    #{idx + 1}
                  </div>

                  <Image
                    src={product.image || "/preview.png"}
                    alt={product.Name}
                    width={48}
                    height={48}
                    className="shrink-0 w-12 h-12 object-cover rounded-xl"
                  />

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {product.Name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {product.ADCcode || product.ACDcode}
                    </p>
                  </div>

                  <div className="shrink-0 font-mono font-bold text-lg sm:text-xl text-slate-900 dark:text-white">
                    {product.TotalSale}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductSalesChart;