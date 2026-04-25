"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function BalanceSheet() {
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

  const chartData = [
    { quarter: "Q1", assets: 180000, liabilities: 70000, equity: 110000 },
    { quarter: "Q2", assets: 190000, liabilities: 75000, equity: 115000 },
    { quarter: "Q3", assets: 200000, liabilities: 80000, equity: 120000 },
    {
      quarter: "Q4",
      assets: balanceData.assets,
      liabilities: balanceData.liabilities,
      equity: balanceData.equity,
    },
  ];

  return (
    <div className="w-full p-6  min-h-screen">
      <Card className="bg-gray-900 border-gray-800 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-white">
            Balance Sheet Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Financial Data */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-purple-400">
                  {balanceData.assets.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-red-400">
                  {balanceData.liabilities.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-green-400">
                  {balanceData.equity.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Trends */}
          <h2 className="text-xl font-semibold text-center mb-4 text-white">
            Financial Trends
          </h2>
          <div className="h-80 bg-gray-900 p-2 rounded-md">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="quarter" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1F2937", borderColor: "#374151", color: "#F9FAFB" }}
                />
                <Legend />
                <Line type="monotone" dataKey="assets" stroke="#A78BFA" />
                <Line type="monotone" dataKey="liabilities" stroke="#F87171" />
                <Line type="monotone" dataKey="equity" stroke="#34D399" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Export Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={handleExport}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Export Balance Sheet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
