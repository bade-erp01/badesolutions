"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import moment from "moment";
import "animate.css";

/**
 * GenerealPaymentMargin
 * - Displays monthly sales turnover (random bar/line chart with random colors)
 * - Uses Plotly.js for rendering charts
 */
export default function GenerealPaymentMargin({
  businessColor = "#27272a", // fallback color
  yearlyPayment,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState(Array.isArray(yearlyPayment) ? yearlyPayment : []);

  const chartRef = useRef(null);
  const plotlyRef = useRef(null);

  const toNum = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);

  const computeAggregates = useCallback(() => {
    const year = moment().year();
    const monthTotals = new Array(12).fill(0);

    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i];
      if (!inv) continue;
      const status = String(inv.billStatus || "").toLowerCase();
      if (status === "cancelled") continue;

      const s = moment(inv.PaymentDate);
      if (s.isValid() && s.year() === year) {
        monthTotals[s.month()] += toNum(inv.crAmount);
      }
    }

    return { monthTotals };
  }, [invoices]);

  useEffect(() => {
    if (loading) return;
    let mounted = true;

    const chartNode = chartRef.current;

    (async () => {
      try {
        const Plotly = (await import("plotly.js-dist-min")).default || (await import("plotly.js-dist-min"));
        plotlyRef.current = Plotly;

        const { monthTotals } = computeAggregates();

        // Randomize chart type (bar vs line)
        const chartType = Math.random() < 0.5 ? "bar" : "scatter";
        const chartMode = chartType === "scatter" ? "lines+markers" : undefined;

        // Randomize color
        const colors = ["#27272a", "#16A085"];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];

        // Monthly turnover chart
        const xArray = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
        const yArray = monthTotals.map((v) => Number(v.toFixed(2)));
        const chartData = [
          {
            x: xArray,
            y: yArray,
            type: chartType,
            mode: chartMode,
            marker: { color: randomColor || businessColor },
          },
        ];
        const chartLayout = { title: `M/M PAYMENT RECORD (${chartType.toUpperCase()})` };
        if (mounted && chartNode) Plotly.newPlot(chartNode, chartData, chartLayout);
      } catch (err) {
        setError(err?.message || String(err));
      }
    })();

    return () => {
      mounted = false;
      try {
        const Plotly = plotlyRef.current;
        if (Plotly && chartNode) {
          Plotly.purge(chartNode);
        }
      } catch (_) {}
    };
  }, [loading, computeAggregates, businessColor]);

  return (
    <div className="space-y-4 animate__animated animate__fadeInUp animate__faster ">
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-gray-500 font-semibold">
          Overall Payment collection for {moment().format("YYYY")}
        </h3>
        <div className="text-sm text-gray-500">
          {loading ? "Loading..." : error ? "Error" : "12 months performance"}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <div ref={chartRef} id="chart" className="max-h-75" style={{ width: "100%", height: "25%" }} />
      </div>
    </div>
  );
}
