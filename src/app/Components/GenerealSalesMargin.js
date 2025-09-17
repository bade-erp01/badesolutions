"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import moment from "moment";
import { EXPRESS_PRIVATE_URL } from "../../../Functions/Functions";

/**
 * GenerealSalesMargin
 * - Displays revenue by warehouse (pie chart) and monthly sales turnover (line chart)
 * - Uses Plotly.js for rendering charts
 */
export default function GenerealSalesMargin({
  businessColor = "black",
  yearlysales,
  warehouses,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [invoices, setInvoices] = useState(Array.isArray(yearlysales) ? yearlysales : []);
  const [whs, setWhs] = useState(Array.isArray(warehouses) ? warehouses : []);

  const pieRef = useRef(null);
  const lineRef = useRef(null);
  const plotlyRef = useRef(null);

  const toNum = (v) => (typeof v === "number" ? v : parseFloat(v) || 0);

  const computeAggregates = useCallback(() => {
    const year = moment().year();
    const monthTotals = new Array(12).fill(0);
    const whTotals = new Map();

    whs.forEach((wh) => {
      whTotals.set(String(wh._id), 0);
    });

    for (let i = 0; i < invoices.length; i++) {
      const inv = invoices[i];
      if (!inv) continue;
      const status = String(inv.billStatus || "").toLowerCase();
      if (status === "cancelled") continue;

      const s = moment(inv.startDate);
      if (s.isValid() && s.year() === year) {
        monthTotals[s.month()] += toNum(inv.grandTotal);
      }

      const whId = inv.whId ? String(inv.whId) : null;
      if (whId && whTotals.has(whId)) {
        whTotals.set(whId, whTotals.get(whId) + toNum(inv.grandTotal));
      }
    }

    return { monthTotals, whTotals };
  }, [invoices, whs]);

  useEffect(() => {
    if (loading) return;
    let mounted = true;

    const pieNode = pieRef.current;
    const lineNode = lineRef.current;

    (async () => {
      try {
        const Plotly = (await import("plotly.js-dist-min")).default || (await import("plotly.js-dist-min"));
        plotlyRef.current = Plotly;

        const { monthTotals, whTotals } = computeAggregates();

        // PIE chart: revenue by warehouse
        const NDxArray = whs.map((w) => w.WHName || "Unknown");
        const NDyArray = whs.map((w) => whTotals.get(String(w._id)) || 0);
        const pieData = [{ labels: NDxArray, values: NDyArray, type: "pie" }];
        const pieLayout = { title: "REVENUE GENERATION MARGIN" };
        if (mounted && pieNode) Plotly.newPlot(pieNode, pieData, pieLayout);

        // Line chart: month-by-month
        const xArray = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const yArray = monthTotals.map((v) => Number(v.toFixed(2)));
        const lineData = [{ x: xArray, y: yArray, type: "scatter", mode: "bar", marker: { color: businessColor } }];
        const lineLayout = { title: "M/M SALES TURN OVER" };
        if (mounted && lineNode) Plotly.newPlot(lineNode, lineData, lineLayout);
      } catch (err) {
        setError(err?.message || String(err));
      }
    })();

    return () => {
      mounted = false;
      try {
        const Plotly = plotlyRef.current;
        if (Plotly) {
          if (pieNode) Plotly.purge(pieNode);
          if (lineNode) Plotly.purge(lineNode);
        }
      } catch (_) {}
    };
  }, [loading, computeAggregates, whs, businessColor]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg text-gray-500 font-semibold">
          Total Converted Sales for {moment().format("YYYY")}
        </h3>
        <div className="text-sm text-gray-500">
          {loading ? "Loading..." : error ? "Error" : "12 months performance"}
        </div>
      </div>

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div>
        <div ref={lineRef} id="myPlot" style={{ width: "100%", height: "25%" }} />
 
        {/* Uncomment below to show pie chart */}
        {/* <div ref={pieRef} id="PIE" style={{ width: "100%", height: "50%" }} /> */}
      </div>
    </div>
  );
}
