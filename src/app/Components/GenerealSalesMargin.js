"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import moment from "moment";
import "animate.css";

export default function GenerealSalesMargin({
  businessColor = "#27272a",
  yearlysales,
  warehouses,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoices] = useState(Array.isArray(yearlysales) ? yearlysales : []);
  const [whs] = useState(Array.isArray(warehouses) ? warehouses : []);

  const pieRef = useRef(null);
  const chartRef = useRef(null);
  const plotlyRef = useRef(null);

  const toNum = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);

  // Memoized aggregates
  const { monthTotals, whTotals } = useMemo(() => {
    const year = moment().year();
    const monthTotals = new Array(12).fill(0);
    const whTotals = new Map(whs.map((wh) => [String(wh._id), 0]));

    invoices.forEach((inv) => {
      if (!inv) return;
      if (String(inv.billStatus || "").toLowerCase() === "cancelled") return;

      const s = moment(inv.startDate);
      if (s.isValid() && s.year() === year) {
        monthTotals[s.month()] += toNum(inv.grandTotal);
      }

      const whId = inv.whId ? String(inv.whId) : null;
      if (whId && whTotals.has(whId)) {
        whTotals.set(whId, whTotals.get(whId) + toNum(inv.grandTotal));
      }
    });

    return { monthTotals, whTotals };
  }, [invoices, whs]);

  // Memoized chart data
  const pieData = useMemo(() => [{
    labels: whs.map((w) => w.WHName || "Unknown"),
    values: whs.map((w) => whTotals.get(String(w._id)) || 0),
    type: "pie",
  }], [whs, whTotals]);

  const chartData = useMemo(() => {
    const chartType = Math.random() < 0.5 ? "bar" : "scatter";
    const chartMode = chartType === "scatter" ? "lines+markers" : undefined;
    const colors = ["#27272a", "#16A085"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    return [{
      x: ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"],
      y: monthTotals.map((v) => Number(v.toFixed(2))),
      type: chartType,
      mode: chartMode,
      marker: { color: randomColor || businessColor },
    }];
  }, [monthTotals, businessColor]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const Plotly = (await import("plotly.js-dist-min")).default;
        plotlyRef.current = Plotly;

        if (mounted && pieRef.current) {
          Plotly.newPlot(pieRef.current, pieData, { title: "REVENUE GENERATION MARGIN" });
        }
        if (mounted && chartRef.current) {
          Plotly.newPlot(chartRef.current, chartData, { title: "M/M SALES TURN OVER" });
        }
      } catch (err) {
        setError(err?.message || String(err));
      }
    })();

    return () => {
      mounted = false;
      const Plotly = plotlyRef.current;
      if (Plotly) {
        if (pieRef.current) Plotly.purge(pieRef.current);
        if (chartRef.current) Plotly.purge(chartRef.current);
      }
    };
  }, [pieData, chartData]);

  return (
    <div className="space-y-4 animate__animated animate__fadeInUp animate__faster">
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-gray-500 font-semibold">
          Overall Converted Sales for {moment().format("YYYY")}
        </h3>
        <div className="text-sm text-gray-500">
          {loading ? "Loading..." : error ? "Error" : "12 months performance"}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <div ref={chartRef} id="chart" className="max-h-75" style={{ width: "100%", height: "25%" }} />
        {/* <div ref={pieRef} id="PIE" style={{ width: "100%", height: "50%" }} /> */}
      </div>
    </div>
  );
}
