"use client";

import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";
import "animate.css";

export default function BalanceSheet({data}) {
  const [balanceData, setBalanceData] = useState({
    assets: 200000,
    liabilities: 80000,
    equity: 120000,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setBalanceData((prev) => ({
        assets: prev.assets + Math.floor(Math.random() * 5000),
        liabilities: prev.liabilities + Math.floor(Math.random() * 3000),
        equity: prev.assets - prev.liabilities,
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    const data = JSON.stringify(balanceData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "balance-sheet.json";
    a.click();
  };

  const chartData = {
    labels: ["Q1", "Q2", "Q3", "Q4"],
    datasets: [
      {
        label: "Assets",
        data: [180000, 190000, 200000, balanceData.assets],
        borderColor: "#4B5563",
        backgroundColor: "rgba(75,85,99,0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Liabilities",
        data: [70000, 75000, 80000, balanceData.liabilities],
        borderColor: "#EF4444",
        backgroundColor: "rgba(239,68,68,0.2)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Equity",
        data: [110000, 115000, 120000, balanceData.equity],
        borderColor: "#10B981",
        backgroundColor: "rgba(16,185,129,0.2)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: { size: 14 },
        },
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { color: "#E5E7EB" },
      },
      y: {
        grid: { color: "#E5E7EB" },
      },
    },
  };

  return (
    <div className="w-full text-sm">
      <div className="max-w-full p-6 m-4 rounded-sm shadow-md bg-gray-300 animate__animated animate__fadeInUp">
        <h1 className="text-3xl font-bold text-black text-center mb-6">📊 Balance Sheet Overview</h1>

        {/* Financial Data */}
        <div className="grid grid-cols-1 text-black md:grid-cols-3 gap-6 text-center font-semibold">
          <div className="p-4 rounded-md shadow-md bg-purple-200">
            <h2 className="text-lg mb-2">Assets</h2>
            <p className="text-xl font-bold">{balanceData.assets.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-md shadow-md bg-red-200">
            <h2 className="text-lg mb-2">Liabilities</h2>
            <p className="text-xl font-bold">{balanceData.liabilities.toLocaleString()}</p>
          </div>
          <div className="p-4 rounded-md shadow-md bg-green-200">
            <h2 className="text-lg mb-2">Equity</h2>
            <p className="text-xl font-bold">{balanceData.equity.toLocaleString()}</p>
          </div>
        </div>

        {/* Financial Trends */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-black text-center mb-4">📈 Financial Trends</h2>
          <div className="bg-white p-2 shadow overflow-x-auto">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Export Button */}
        <div className="mt-8 text-center">
          <button
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg shadow transition"
            onClick={handleExport}
          >
            📁 Export Balance Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
