"use client";
import React, { useEffect, useState, useMemo } from "react";
import { format } from "date-fns";
import "animate.css";
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

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const toNum = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);

function GeneralSalesMargin({
  businessColor = "#27272a",
  yearlysales = [],
  warehouses = [],
}) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);

  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const prevYear = useMemo(() => currentYear - 1, [currentYear]);
  const currentMonth = useMemo(() => new Date().getMonth(), []);
  let prevTotal = 0;


  const { totalRevenue, yoyGrowth, momGrowth, chartData } = useMemo(() => {
    const monthTotals = new Array(12).fill(0);
    const whTotals = new Map(warehouses.map((wh) => [String(wh._id), 0]));

    let currentTotal = 0;
    

    for (const inv of yearlysales) {
      if (!inv || String(inv.billStatus || "").toLowerCase() === "cancelled")
        continue;

      const s = new Date(inv.startDate);
      if (isNaN(s)) continue;

      const amount = toNum(inv.grandTotal);
      const year = s.getFullYear();

      if (year === currentYear) {
        monthTotals[s.getMonth()] += amount;
        currentTotal += amount;
      } else if (year === prevYear) {
        prevTotal += amount;
      }
    }

    // YoY Growth
    let growth = 0;
    if (prevTotal > 0) {
      growth = ((currentTotal - prevTotal) / prevTotal) * 100;
    } else if (currentTotal > 0) {
      growth = 100;
    }

    // MoM Growth
    const currentMonthSales = monthTotals[currentMonth] || 0;
    const prevMonthSales = currentMonth > 0 ? monthTotals[currentMonth - 1] : 0;
    let momGrowth = 0;
    if (prevMonthSales > 0) {
      momGrowth = ((currentMonthSales - prevMonthSales) / prevMonthSales) * 100;
    } else if (currentMonthSales > 0) {
      momGrowth = 100;
    }

    const chartData = [
      "JAN","FEB","MAR","APR","MAY","JUN",
      "JUL","AUG","SEP","OCT","NOV","DEC",
    ].map((month, index) => ({
      month,
      sales: Number(monthTotals[index].toFixed(2)),
      fill: index === currentMonth ? "#16A085" : businessColor,
    }));

    return {
      totalRevenue: currentTotal,
      yoyGrowth: growth.toFixed(1),
      momGrowth: momGrowth.toFixed(1),
      chartData,
    };
  }, [yearlysales, warehouses, businessColor, currentYear, prevYear, currentMonth]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `₦${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => `₦${value.toLocaleString()}`,
        },
        grid: { color: "#e5e7eb" },
      },
      x: { grid: { display: false } },
    },
  }), []);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!isReady) {
    return (
      <div className="space-y-8 animate__animated animate__fadeInUp">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">General Sales Margin</h2>
            <p>Overall performance • {format(new Date(), "yyyy")}</p>
          </div>
        </div>
        <div className="h-[420px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-3xl border">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-400 mx-auto"></div>
            <p className="mt-4 text-sm text-zinc-500">Loading sales analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate__animated animate__fadeInUp">
      {/* Header + KPIs */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">General Sales Margin</h2>
          <p>Overall performance • {format(new Date(), "yyyy")}</p>
        </div>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">

        <div className="flex flex-wrap gap-4">
          {/* last year sales */}
          <div className="dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 min-w-[180px]">
            <p className="text-sm">Total Revenue • {prevYear}</p>
            <p className="text-xl font-semibold mt-1">₦{prevTotal.toLocaleString()}</p>
          </div>
          
          {/* Total Revenue */}
          <div className="dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 min-w-[180px]">
            <p className="text-sm">Total Revenue • {format(new Date(), "yyyy")}</p>
            <p className="text-xl font-semibold mt-1 text-green-600">₦{totalRevenue.toLocaleString()}</p>
          </div>

          {/* YoY Growth */}
          <div className="dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 min-w-[180px]">
            <p className="text-sm">YoY Growth</p>
            <p className={`text-xl font-semibold mt-1 ${parseFloat(yoyGrowth) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {parseFloat(yoyGrowth) >= 0 ? "+" : ""}
              {yoyGrowth}%
            </p>
            <p className="text-xs">vs last year</p>
          </div>

          {/* MoM Growth */}
          <div className="dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-100 dark:border-zinc-800 min-w-[180px]">
            <p className="text-sm">MoM Growth</p>
            <p className={`text-xl font-semibold mt-1 ${parseFloat(momGrowth) >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {parseFloat(momGrowth) >= 0 ? "+" : ""}
              {momGrowth}%
            </p>
            <p className="text-xs">vs last month</p>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-xl">{error}</div>}

      {/* Chart */}
      <div className="dark:bg-zinc-900 rounded-3xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Monthly Sales Trend for {format(new Date(), "yyyy")}</h3>
        </div>

        <div className="w-full h-[380px]">
          <Bar
            data={{
              labels: chartData.map((d) => d.month),
              datasets: [
                {
                  label: "Sales",
                  data: chartData.map((d) => d.sales),
                  backgroundColor: chartData.map((d) => d.fill),
                  borderRadius: 6,
                },
              ],
            }}
            options={chartOptions}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(GeneralSalesMargin);
