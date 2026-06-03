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
import { Badge } from "@/components/ui/badge";
import { Dencrypt, Encrypt } from "../../../../../../../../Functions/Functions";
import BackButton from "@/app/Components/BackBotton";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  ErrorMessage,
  plsWait,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";
import moment from "moment";

export default function BalanceSheet({ data, baseUrl, userData }) {
  const [balanceData, setBalance] = useState(Dencrypt(data.data));
  const [year, setYear] = useState(new Date().getFullYear());
  const [coa, setCoa] = useState(Dencrypt(data.coaBal));
  const [InventoryValue, setInventoryValue] = useState(
    data.inventortyValue || 0,
  );
  const [Assets] = useState(
    Number(
      (
        coa
          .filter((acc) => acc.type === "Asset")
          .reduce((sum, acc) => sum + acc.balance, 0) + InventoryValue
      ).toFixed(2),
    ),
  );

  const [liability] = useState(
    coa
      .filter((acc) => acc.type === "Liability")
      .reduce((sum, acc) => sum + acc.balance, 0),
  );
  const [equity] = useState(
    coa
      .filter((acc) => acc.type === "Equity")
      .reduce((sum, acc) => sum + acc.balance, 0),
  );

  // Generate a range of years (e.g., 2000–2030)
  const startYear = 2026;
  const currentYear = moment().year();

  const years = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  const chartData = balanceData.map((item) => ({
    month: `${item.generatedAt}-${item.period}`,
    quarter: `${item.quarter}-${item.generatedAt}-${item.period}`, // e.g. "Q2"
    assets: item.totals.assets,
    liabilities: item.totals.liabilities,
    equity: item.totals.equity,
    Status: `${item.balanced ? "Balanced" : "Not balanced"}`,
  }));

  // const handleExport = () => {
  //   const data = JSON.stringify(chartData, null, 2);
  //   const blob = new Blob([data], { type: "application/json" });
  //   const a = document.createElement("a");
  //   a.href = URL.createObjectURL(blob);
  //   a.download = "balance-sheet.json";
  //   a.click();
  // };

  // Function to fetch snapshot
  const FetchSnapShot = async (year) => {
    try {
      plsWait(`Fecthing snapshots for ${year}`);
      const res = await fetch(
        `${baseUrl}/api/Generate/BalanceSheet?period=${year}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            access: `${Encrypt(userData.user._id)}`,
          },
        },
      );

      if (!res.ok) {
        throw new Error("Failed to fetch balance data");
      }

      const response = await res.json();
      setBalance(Dencrypt(response.data));
      setYear(year);
      setCoa(Dencrypt(response.coaBal));
      setInventoryValue(response.InventoryValue || 0);
      SuccessToast("");
    } catch (err) {
      ErrorMessage(err.message);
    }
  };

  return (
    <div className="flex flex-col overflow-hidden">
      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar */}
        <aside
          className="w-72 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[90dvh] md:block"
          style={{ overflowY: "auto" }}
        >
          <nav className="">
            <BackButton />
            <Separator className="my-2" />
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`w-full text-black`}>
                  {year}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2">
                <div className="grid grid-cols-3 gap-2">
                  {years.map((y) => (
                    <Button
                      key={y}
                      variant={y === year ? "default" : "ghost"}
                      className={cn("w-full")}
                      onClick={() => FetchSnapShot(y)}
                    >
                      {y}
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-3 relative z-10 max-h-[83dvh] overflow-y-auto">
            <div className="w-full p-6  min-h-screen">
              <Card className="bg-gray-900 border-gray-800 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-center text-white">
                    Balance Sheet Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Financial Data */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center mb-8">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-md">
                          Assets
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge
                          variant="default"
                          className="text-xl font-bold text-purple-400"
                        >
                          {Assets}
                        </Badge>
                        <br />
                        <Badge variant="default" className="text-xs">
                          {InventoryValue > 0 ? "+ Inventory" : ""}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-md">
                          Liabilities
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge
                          variant="default"
                          className="text-xl font-bold text-red-400"
                        >
                          {liability}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-md">
                          Equity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Badge
                          variant="default"
                          className="text-xl font-bold text-green-400"
                        >
                          {equity}
                        </Badge>
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
                        <Line
                          type="monotone"
                          dataKey="assets"
                          stroke="#A78BFA"
                        />
                        <Line
                          type="monotone"
                          dataKey="liabilities"
                          stroke="#F87171"
                        />
                        <Line
                          type="monotone"
                          dataKey="equity"
                          stroke="#34D399"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <Separator className="my-2" />
                </CardContent>
                <footer className="backdrop-blur-md text-white px-4 py-4 flex items-center justify-between">
                  {/* Export Button */}
                  <BalanceSheetExport chartData={balanceData} />
                  <div className="flex items-center gap-2">
                    <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
                    <span className="text-sm font-semibold">
                      Assets & Equity Growth
                    </span>
                  </div>
                </footer>
              </Card>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// download balance sheet for particular month
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"; // ShadCN UI Select

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function BalanceSheetExport({ chartData }) {
  const [selectedMonth, setSelectedMonth] = useState("");

  const handleExport = (month) => {
    
    const entry = chartData.find(
      (item) => Number(item.generatedAt) === month + 1,
    );

    if(!entry){
      alert("No entry found for selected month.")
      return;
    }
    // Prepare rows for Excel
    const rows = [
      { Notes: "Month", Value:  moment(month + 1, "M").format("MMMM") },
      { Notes: "Period", Value: entry.period },
      { Notes: "Quarter", Value: entry.quarter },
    ];

    // Display all Assets accounts
    if (entry.assets && entry.assets.accounts) {
      rows.push({ Notes: "Current Assets", Value: "" });
      entry.assets.accounts.forEach((acc) => {
        rows.push({
          Notes: `${acc.code} - ${acc.name}`,
          Value: acc.balance,
        });
      });

      // non current assets [FIXED ASSET]
      rows.push({ Notes: "Non-Current Assets", Value: "" });
        rows.push({
          Notes: `1300 - Property, plant and Equipment`,
          Value: entry.PPE?.balance || 0 ,
        });

      rows.push({ Notes: "Total Assets",Value:"", Total: entry.totals.assets });
    }

    // Display all Liabilities accounts
    if (entry.liabilities && entry.liabilities.accounts) {
      rows.push({ Notes: "Current Liabilities", Value: "" });
      entry.liabilities.accounts.forEach((acc) => {
        rows.push({
          Notes: `${acc.code} - ${acc.name}`,
          Value: acc.balance,
        });
      });


      // non current liabilities
       rows.push({ Notes: "Non-Current Liabilities", Value: "" });
        rows.push({
          Notes: `Borrowing`,
          Value: 0,
        });

         rows.push({
          Notes: `Loan`,
          Value: 0,
        });


      rows.push({
        Notes: "Total Liabilities",
        Value: "",
        Total:entry.totals.liabilities,
      });
    }

    // Display all Equity accounts
    if (entry.equity && entry.equity.accounts) {
      rows.push({ Notes: "Equity", Value: "" });
      entry.equity.accounts.forEach((acc) => {
        rows.push({
          Notes: `${acc.code} - ${acc.name}`,
          Value: acc.balance,
        });
      });
      rows.push({ Notes: "Total Equity", Value:"", Total: entry.totals.equity });
    }

    // Add summary info
    rows.push({
      Notes: "Liabilities + Equity",
      Value: entry.totals.liabilitiesAndEquity,
    });
    rows.push({ Notes: "Balanced?", Value: entry.balanced ? "Yes" : "No" });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BalanceSheet");

    // Convert workbook to binary array
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // Save file
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `BalanceSheet_${entry.generatedAt}.xlsx`);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        Download Balance Sheet
      </h2>
      <Select
        onValueChange={(value) => {
          setSelectedMonth(value);
          handleExport(value); // trigger download immediately
        }}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select Month" />
        </SelectTrigger>
        <SelectContent>
          {months.map((m, idx) => (
            <SelectItem key={m} value={idx}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
