"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { Separator } from "@/components/ui/separator";
import {Encrypt,Dencrypt} from "../../../../../../../../Functions/Functions"

export default function BalanceSheet({data}) {
  const [balanceData] = useState(Dencrypt(data.data));
  const [inventoryData] = useState(data.inventoryValue);

 

  const handleExport = () => {
    const data = JSON.stringify(balanceData, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "balance-sheet.json";
    a.click();
  };

  const chartData = [{ quarter: balanceData.quarter, assets: balanceData.totals.assets, liabilities: balanceData.totals.liabilities, equity: balanceData.totals.equity },];

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
                <CardTitle className="text-white text-md">Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-purple-400">
                  {Math.round(balanceData.totals.assets + inventoryData).toLocaleString()}
                  
                  {/* {inventoryData > 0 &&
                    ` (Includes Inventory: ${inventoryData.toLocaleString()})`} */}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-md">Liabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-red-400">
                  {balanceData.totals.liabilities.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white text-md">Equity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold text-green-400">
                  {balanceData.totals.equity.toLocaleString()}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Financial Trends */}
          <h2 className="text-xs text-center mb-4 text-white">
            Financial Trends
          </h2>
          <div className="h-80 bg-gray-900 p-2 rounded-md">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="quarter" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    borderColor: "#374151",
                    color: "#F9FAFB",
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="assets" stroke="#A78BFA" />
                <Line type="monotone" dataKey="liabilities" stroke="#F87171" />
                <Line type="monotone" dataKey="equity" stroke="#34D399" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <Separator className="my-2" />
        </CardContent>
        <footer className="backdrop-blur-md text-white px-4 py-4 flex items-center justify-between">
          {/* Export Button */}
          <Button
              onClick={handleExport}
              className="bg-gray-700 hover:bg-gray-600 text-white"
            >
              Export Balance Sheet
          </Button>
          <div className="flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
            <span className="text-sm font-semibold">
              Assets & Equity Growth
            </span>
          </div>
        </footer>
      </Card>
    </div>
  );
}
