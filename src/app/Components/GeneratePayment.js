"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import moment from "moment";
import "animate.css";

export default function GeneralPaymentMargin({
  businessColor = "#27272a",
  yearlyPayment = [],
}) {
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [isChartLoaded, setIsChartLoaded] = useState(false);

  const chartRef = useRef(null);
  const plotlyRef = useRef(null);

  const toNum = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);

  const { monthTotals, totalPayment } = useMemo(() => {
    const year = moment().year();
    const totals = new Array(12).fill(0);
    let total = 0;

    yearlyPayment.forEach((inv) => {
      if (!inv || String(inv.billStatus || "").toLowerCase() === "cancelled") return;
      const s = moment(inv.PaymentDate);
      if (s.isValid() && s.year() === year) {
        const amount = toNum(inv.crAmount);
        totals[s.month()] += amount;
        total += amount;
      }
    });

    return { monthTotals: totals, totalPayment: total };
  }, [yearlyPayment]);

  const chartData = useMemo(() => [{
    x: ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
    y: monthTotals.map((v) => Number(v.toFixed(2))),
    type: "bar",
    name: "Monthly Payments",
    marker: {
      color: Array(12).fill(0).map((_, i) =>
        i === moment().month() ? "#16A085" : businessColor
      ),
      opacity: 0.9,
    },
    hovertemplate: "<b>%{x}</b><br>Payment: ₦%{y:,.2f}<extra></extra>",
  }], [monthTotals, businessColor]);

  // Staggered Load - Start after 800ms
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Chart Rendering
  useEffect(() => {
    if (!isReady) return;

    let mounted = true;

    (async () => {
      try {
        const Plotly = (await import("plotly.js-dist-min")).default;
        plotlyRef.current = Plotly;

        if (mounted && chartRef.current) {
          await Plotly.newPlot(chartRef.current, chartData, {
            title: { text: `Monthly Payment Collection • ${moment().year()}`, font: { size: 18 } },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { family: "Inter, sans-serif" },
            margin: { t: 60, r: 30, b: 60, l: 70 },
            xaxis: { gridcolor: "#eee" },
            yaxis: { gridcolor: "#eee", tickprefix: "₦" },
          }, { responsive: true });

          setIsChartLoaded(true);
        }
      } catch (err) {
        setError(err?.message || "Failed to load chart");
      }
    })();

    return () => {
      mounted = false;
      if (plotlyRef.current && chartRef.current) {
        plotlyRef.current.purge(chartRef.current);
      }
    };
  }, [chartData, isReady]);

  const exportChart = async () => {
    if (!plotlyRef.current || !chartRef.current) return;
    plotlyRef.current.downloadImage(chartRef.current, {
      format: "png",
      filename: "monthly-payments",
      width: 1200,
      height: 700,
    });
  };

  if (!isReady) {
    return (
      <div className="space-y-8 animate__animated animate__fadeInUp">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">General Payment Margin</h2>
            <p>Overall Collection Performance • {moment().format("YYYY")}</p>
          </div>
        </div>
        <div className="h-[420px] flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 rounded-3xl">
          <div className="text-center">
            <div className="animate-spin h-8 w-8 border-b-2 border-zinc-400 mx-auto rounded-full"></div>
            <p className="mt-3 text-sm text-zinc-500">Loading payment chart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate__animated animate__fadeInUp">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">General Payment Margin</h2>
          <p>Overall Collection Performance • {moment().format("YYYY")}</p>
        </div>

        <div className="border p-6 rounded-2xl text-center lg:text-left">
          <p className="text-sm ">Total Collection</p>
          <p className="text-lg font-semibold mt-1 font-mono">₦{totalPayment.toLocaleString()}</p>
        </div>
      </div>

      {error && <div className="text-red-600 bg-red-50 p-4 rounded-xl">{error}</div>}

      <div className="bg-white dark:bg-zinc-900 rounded-3xl border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-lg">Monthly Payment Trend</h3>
          <button
            onClick={exportChart}
            className="text-sm px-5 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 rounded-full flex items-center gap-2 transition"
          >
            ↓ Export PNG
          </button>
        </div>

        <div ref={chartRef} className="w-full h-[350px]" />
      </div>
    </div>
  );
}
