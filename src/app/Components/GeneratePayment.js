"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import moment from "moment";
import "animate.css";

export default function GenerealPaymentMargin({
  businessColor = "#27272a",
  yearlyPayment,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoices] = useState(Array.isArray(yearlyPayment) ? yearlyPayment : []);

  const chartRef = useRef(null);
  const plotlyRef = useRef(null);

  const toNum = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);

  // ✅ Memoized monthly totals
  const monthTotals = useMemo(() => {
    const year = moment().year();
    const totals = new Array(12).fill(0);

    invoices.forEach((inv) => {
      if (!inv) return;
      if (String(inv.billStatus || "").toLowerCase() === "cancelled") return;

      const s = moment(inv.PaymentDate);
      if (s.isValid() && s.year() === year) {
        totals[s.month()] += toNum(inv.crAmount);
      }
    });

    return totals;
  }, [invoices]);

  // ✅ Memoized chart data
  const chartData = useMemo(() => {
    const chartType = Math.random() < 0.5 ? "bar" : "scatter";
    const chartMode = chartType === "scatter" ? "lines+markers" : undefined;
    const colors = ["#27272a", "#16A085"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return [
      {
        x: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
        y: monthTotals.map((v) => Number(v.toFixed(2))),
        type: chartType,
        mode: chartMode,
        marker: { color: randomColor || businessColor },
      },
    ];
  }, [monthTotals, businessColor]);

  const chartLayout = useMemo(() => ({
    title: "M/M PAYMENT RECORD",
  }), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const Plotly = (await import("plotly.js-dist-min")).default;
        plotlyRef.current = Plotly;

        if (mounted && chartRef.current) {
          Plotly.newPlot(chartRef.current, chartData, chartLayout);
        }
      } catch (err) {
        setError(err?.message || String(err));
      }
    })();

    return () => {
      mounted = false;
      const Plotly = plotlyRef.current;
      if (Plotly && chartRef.current) {
        Plotly.purge(chartRef.current);
      }
    };
  }, [chartData, chartLayout]);

  return (
    <div className="space-y-4 animate__animated animate__fadeInUp animate__faster">
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
