"use client";

import React, { useMemo, useState, useEffect, useCallback, useRef } from "react";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import moment from "moment";
import Swal from "sweetalert2";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import withReactContent from "sweetalert2-react-content";
import { plsWait, ErrorMessage, Encrypt } from "../../../Functions/Mics";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useUser } from "@/components/UserProvider";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const MySwal = withReactContent(Swal);

const STATUS_STYLE = {
  Invoice: "#10b981",
  Order: "#f59e0b",
  Cancelled: "#ef4444",
  Draft: "#94a3b8",
  Unknown: "#64748b",
};

const money = (n) =>
  `₦${Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 })}`;

const SalesDashboard = ({ baseUrl, triggerButton = true }) => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [range, setRange] = useState("6m"); // default to full 6-month window
  const [showModal, setShowModal] = useState(false);
  const { user } = useUser();
  const openedRef = useRef(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      plsWait("Loading Report Data...");

      // Always last 6 months → today
      const endDate = moment().format("YYYY-MM-DD");
      const startDate = moment().subtract(6, "months").format("YYYY-MM-DD");

      const res = await fetch(
        `${baseUrl}/api/Invoice/report?startDate=${startDate}&endDate=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(user.business.tenantId)}`,
            access: `${Encrypt(user.user._id)}`,
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
          },
        }
      );

      if (!res.ok) {
        let message = "Failed to fetch sales data";
        try {
          const err = await res.json();
          message = err.error || err.message || message;
        } catch (_) {}
        throw new Error(message);
      }

      const fetchedData = await res.json();
      setInvoices(fetchedData.invoices || []);

      Swal.close();
      setLoading(false);
      openedRef.current = false;
      setShowModal(true);
    } catch (error) {
      Swal.close();
      setLoading(false);
      ErrorMessage(error.message || "Something went wrong");
    }
  }, [baseUrl, user]);

  useEffect(() => {
    if (!triggerButton) fetchData();
  }, [triggerButton, fetchData]);

  const stats = useMemo(() => {
    // Client-side sub-filter inside the already-fetched 6-month window
    const cutoff =
      range === "6m"
        ? null
        : moment().subtract(Number(range.replace("m", "")), "months");

    const filtered = invoices.filter((inv) => {
      const d = moment(inv.startDate);
      if (!d.isValid()) return false;
      if (cutoff && d.isBefore(cutoff)) return false;
      return true;
    });

    let revenue = 0;
    let completed = 0;
    let cancelled = 0;
    let openOrders = 0;
    const byMonth = {};
    const byStatus = {};
    const daily = {};

    filtered.forEach((inv) => {
      const amount = Number(inv.grandTotal) || 0;
      const status = inv.billStatus || "Unknown";
      const mKey = moment(inv.startDate).format("YYYY-MM");
      const dKey = moment(inv.startDate).format("YYYY-MM-DD");

      revenue += amount;
      byStatus[status] = (byStatus[status] || 0) + 1;
      byMonth[mKey] = (byMonth[mKey] || 0) + amount;
      daily[dKey] = (daily[dKey] || 0) + amount;

      if (status === "Invoice") completed += 1;
      else if (status === "Cancelled") cancelled += 1;
      else if (status === "Order") openOrders += 1;
    });

    const count = filtered.length;
    const avgTicket = count ? revenue / count : 0;
    const cancelRate = count ? (cancelled / count) * 100 : 0;
    const conversion = count ? (completed / count) * 100 : 0;

    const monthKeys = Object.keys(byMonth).sort();
    const lastMonths = monthKeys.slice(-8);
    const dayKeys = Object.keys(daily).sort().slice(-14);

    const prevRevenue =
      lastMonths.length > 1
        ? lastMonths
            .slice(0, Math.floor(lastMonths.length / 2))
            .reduce((s, k) => s + (byMonth[k] || 0), 0)
        : 0;
    const recentRevenue =
      lastMonths.length > 1
        ? lastMonths
            .slice(Math.floor(lastMonths.length / 2))
            .reduce((s, k) => s + (byMonth[k] || 0), 0)
        : revenue;
    const growth =
      prevRevenue > 0
        ? ((recentRevenue - prevRevenue) / prevRevenue) * 100
        : 0;

    return {
      count,
      revenue,
      avgTicket,
      cancelRate,
      conversion,
      completed,
      cancelled,
      openOrders,
      growth,
      byStatus,
      monthLabels: lastMonths.map((k) => moment(k).format("MMM YY")),
      monthValues: lastMonths.map((k) => byMonth[k] || 0),
      dayLabels: dayKeys.map((k) => moment(k).format("DD MMM")),
      dayValues: dayKeys.map((k) => daily[k] || 0),
    };
  }, [invoices, range]);

  const chartOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#0f172a",
        padding: 12,
        cornerRadius: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#64748b", font: { size: 11 } },
      },
      y: {
        grid: { color: "rgba(148,163,184,0.15)" },
        ticks: {
          color: "#64748b",
          font: { size: 11 },
          callback: (v) =>
            v >= 1000000
              ? `${(v / 1000000).toFixed(1)}M`
              : v >= 1000
              ? `${(v / 1000).toFixed(0)}k`
              : v,
        },
      },
    },
  };

  const barData = {
    labels: stats.monthLabels,
    datasets: [
      {
        label: "Revenue",
        data: stats.monthValues,
        backgroundColor: "rgba(99,102,241,0.75)",
        borderRadius: 10,
        barThickness: 28,
      },
    ],
  };

  const lineData = {
    labels: stats.dayLabels,
    datasets: [
      {
        label: "Daily sales",
        data: stats.dayValues,
        borderColor: "#6366f1",
        backgroundColor: "rgba(99,102,241,0.12)",
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: "#6366f1",
      },
    ],
  };

  const doughnutData = {
    labels: Object.keys(stats.byStatus),
    datasets: [
      {
        data: Object.values(stats.byStatus),
        backgroundColor: Object.keys(stats.byStatus).map(
          (s) => STATUS_STYLE[s] || STATUS_STYLE.Unknown
        ),
        borderWidth: 0,
        hoverOffset: 8,
      },
    ],
  };

  const periodLabel = `${moment()
    .subtract(6, "months")
    .format("DD MMM YYYY")} → ${moment().format("DD MMM YYYY")}`;

  const modalContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="p-3 sm:p-6 bg-gradient-to-br from-slate-100 to-indigo-50 shadow-xl w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-700 tracking-wide">
            Sales Intelligence
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Last 6 months · {periodLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-end">
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="px-3 py-2 text-base sm:text-sm rounded-md border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 w-full min-w-0 text-center border-t-4 border-indigo-400">
          <div className="text-sm text-gray-500">Revenue</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 break-words">
            {money(stats.revenue)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.growth >= 0 ? "+" : ""}
            {stats.growth.toFixed(1)}% vs earlier half
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 w-full min-w-0 text-center border-t-4 border-blue-400">
          <div className="text-sm text-gray-500">Invoices</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 break-words">
            {stats.count.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.completed} completed · {stats.openOrders} open
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 w-full min-w-0 text-center border-t-4 border-green-400">
          <div className="text-sm text-gray-500">Avg. Ticket</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-800 mt-2 break-words">
            {money(stats.avgTicket)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.conversion.toFixed(1)}% conversion
          </div>
        </div>

        <div className="bg-white shadow-md rounded-xl p-4 sm:p-6 w-full min-w-0 text-center border-t-4 border-red-400">
          <div className="text-sm text-gray-500">Cancel Rate</div>
          <div className="text-xl sm:text-2xl font-bold text-red-600 mt-2 break-words">
            {stats.cancelRate.toFixed(1)}%
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats.cancelled} cancelled
          </div>
        </div>
      </div>

      {stats.count === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 sm:p-16 text-center text-gray-500">
          No invoices in this window. Try expanding the date range.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-md p-4 h-[380px] min-w-0">
              <h3 className="text-center text-lg font-semibold mb-2 text-gray-700">
                Revenue by Month
              </h3>
              <div className="h-[300px]">
                <Bar data={barData} options={chartOpts} />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-4 h-[380px] min-w-0">
              <h3 className="text-center text-lg font-semibold mb-2 text-gray-700">
                Status Mix
              </h3>
              <div className="h-[240px]">
                <Doughnut
                  data={doughnutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: "65%",
                    plugins: {
                      legend: { display: false },
                      tooltip: chartOpts.plugins.tooltip,
                    },
                  }}
                />
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-3">
                {Object.entries(stats.byStatus).map(([status, qty]) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 text-xs text-gray-600"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        background:
                          STATUS_STYLE[status] || STATUS_STYLE.Unknown,
                      }}
                    />
                    {status}: <strong>{qty}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 h-[380px] min-w-0">
            <h3 className="text-center text-lg font-semibold mb-2 text-gray-700">
              Recent Daily Rhythm
            </h3>
            <div className="h-[300px]">
              <Line data={lineData} options={chartOpts} />
            </div>
          </div>
        </>
      )}
    </motion.div>
  );

  useEffect(() => {
    if (!showModal || openedRef.current) return;
    openedRef.current = true;

    MySwal.fire({
      html: modalContent,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: "swal2-dashboard-modal",
        htmlContainer: "swal2-dashboard-html",
      },
      width: "100vw",
      padding: 0,
      background: "transparent",
      didOpen: () => {},
      willClose: () => {
        openedRef.current = false;
        setShowModal(false);
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal]);

  useEffect(() => {
    if (!showModal || !openedRef.current) return;
    MySwal.update({ html: modalContent });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range, stats]);

  return (
    <>
      {triggerButton && (
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full disabled:opacity-60"
        >
          <ChartBarIcon className="h-6 w-6" />
          {loading ? "Loading..." : "Sales Intelligence"}
        </button>
      )}
      {!triggerButton && modalContent}
    </>
  );
};

export default SalesDashboard;