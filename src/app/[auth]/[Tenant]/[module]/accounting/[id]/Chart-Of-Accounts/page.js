"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import moment from "moment";
import Link from "next/link";
import { Encrypt } from "../../../../../../../../Functions/Mics";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Card, CardContent } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Badge } from "@/components/ui/badge";

import {
  Search,
  Wallet,
  Landmark,
  ReceiptText,
  Scale,
} from "lucide-react";

const FinancialOverview = ({ data, url, userData }) => {
  const [isLoading, setIsLoading] = useState(true);

  const [COAData, setCOAData] = useState(data || []);

  const [search, setSearch] = useState("");
  
  useEffect(() => {
    setIsLoading(false);
  }, []);

  const filteredData = useMemo(() => {
    return COAData.filter((entry) => {
      const value = search.toLowerCase();

      return (
        entry?.name?.toLowerCase().includes(value) ||
        entry?.code?.toLowerCase().includes(value) ||
        entry?.type?.toLowerCase().includes(value)
      );
    });
  }, [COAData, search]);

  const totals = useMemo(() => {
    let assets = 0;
    let liabilities = 0;
    let revenue = 0;
    let expenses = 0;

    COAData.forEach((acc) => {
      const balance = Number(acc.balance || 0);

      if (acc.type === "Asset") assets += balance;

      if (acc.type === "Liability") liabilities += balance;

      if (acc.type === "Revenue") revenue += balance;

      if (acc.type === "Expense") expenses += balance;
    });

    return {
      assets,
      liabilities,
      revenue,
      expenses,
    };
  }, [COAData]);

  if (!Array.isArray(COAData) || COAData.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px] border border-zinc-200 rounded-3xl bg-white">
        <div className="text-center space-y-3">
          <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center border border-zinc-200">
            <ReceiptText className="h-6 w-6 text-zinc-500" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-zinc-900">
              No Financial Records
            </h2>

            <p className="text-sm text-zinc-500 mt-1">
              No chart of account data available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Charts of Account"} />}>
      <div className="bg-[#f5f7fb] text-zinc-900 p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 p-8 shadow-sm">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.04),transparent_35%)]" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div className="space-y-3">
                <Badge className="bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100 px-4 py-1 rounded-full shadow-sm">
                  Financial Management
                </Badge>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900">
                    Chart of Accounts
                  </h1>

                  <p className="text-zinc-600 mt-2 max-w-2xl text-sm">
                    Structured accounting overview with categorized balances,
                    account tracking, and financial visibility.
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-[340px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search account..."
                  type="search"
                  className="pl-11 h-12 rounded-2xl border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:border-zinc-300 shadow-sm"
                />
              </div>
            </div>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

            <MetricCard
              title="Assets"
              value={totals.assets}
              icon={<Wallet className="h-5 w-5" />}
            />

            <MetricCard
              title="Liabilities"
              value={totals.liabilities}
              icon={<Landmark className="h-5 w-5" />}
            />

            <MetricCard
              title="Revenue"
              value={totals.revenue}
              icon={<Scale className="h-5 w-5" />}
            />

            <MetricCard
              title="Expenses"
              value={totals.expenses}
              icon={<ReceiptText className="h-5 w-5" />}
            />
          </div>

          {/* TABLE */}
          <Card className="border-zinc-200 bg-white shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <SuspenenseFallBack
                  pagedata={"Charts of Account"}
                />
              ) : (
                <div className="overflow-x-auto">

                  <Table>

                    <TableHeader className="bg-zinc-50">
                      <TableRow className="border-zinc-200 hover:bg-transparent">

                        <TableHead className="h-14 px-6 text-zinc-500 font-medium">
                          Account Code
                        </TableHead>

                        <TableHead className="text-zinc-500 font-medium">
                          Description
                        </TableHead>

                        <TableHead className="text-zinc-500 font-medium">
                          Type
                        </TableHead>

                        <TableHead className="text-right pr-8 text-zinc-500 font-medium">
                          Balance
                        </TableHead>

                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredData.map((entry) => (
                        <TableRow
                          key={entry._id}
                          className="border-zinc-100 hover:bg-zinc-50 transition-colors text-xs"
                        >

                          <TableCell className="px-6 py-5">
                            <Link
                              href={`#`}
                              className="font-semibold text-zinc-900 hover:text-zinc-600 transition"
                            >
                              {entry.code}
                            </Link>
                          </TableCell>

                          <TableCell className="text-zinc-700 font-medium">
                            {entry.name}
                          </TableCell>

                          <TableCell>
                            <Badge
                              variant="secondary"
                            >
                              {entry.type}
                            </Badge>
                          </TableCell>

                          <TableCell className="text-right pr-8 text-md">
                            <div className="flex flex-col items-end">
                              <span className="font-semibold text-zinc-900">
                                <span className="text-xs text-zinc-400">
                                  {entry.currency}
                                </span>{" "}
                                {Number(entry.balance || 0).toLocaleString()}
                              </span>
                            </div>
                          </TableCell>

                        </TableRow>
                      ))}
                    </TableBody>

                  </Table>

                </div>
              )}
            </CardContent>
          </Card>

          {/* FOOTER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm text-zinc-500 px-1">

            <p>
              Showing{" "}
              <span className="text-zinc-800 font-medium">
                {filteredData.length}
              </span>{" "}
              account entries
            </p>

            <p>
              Generated {moment().format("MMMM Do YYYY, h:mm:ss a")}
            </p>

          </div>

        </div>
      </div>
    </Suspense>
  );
};

export default FinancialOverview;

function MetricCard({ title, value, icon }) {
  return (
    <Card className="border-zinc-200 bg-white rounded-3xl overflow-hidden shadow-sm">

      <CardContent className="p-5">

        <div className="flex items-start justify-between">

          <div className="space-y-2">
            <p className="text-sm text-zinc-500">
              {title}
            </p>

            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
              ₦{Number(value || 0).toLocaleString()}
            </h3>
          </div>

          <div className="h-11 w-11 rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center text-zinc-700">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}