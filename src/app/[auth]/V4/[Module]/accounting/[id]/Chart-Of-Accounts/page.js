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
    return COAData.sort((a,b)=>{return a.code - b.code}).filter((entry) => {
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
      <div className="flex items-center justify-center min-h-[300px] border rounded-3xl">
        <div className="text-center space-y-3">

          <div>
            <h2 className="text-lg font-semibold ">
              No Financial Records
            </h2>

            <p className="text-sm  mt-1">
              No chart of account data available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Charts of Account"} />}>
      <div className="">
        <div className=" space-y-6">

          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl border border-zinc-200 p-8 shadow-sm">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.04),transparent_35%)]" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div className="space-y-3">
                <Badge variant="default">
                  Financial Management
                </Badge>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight ">
                    Chart of Accounts
                  </h1>

                  <p className=" mt-2 max-w-2xl text-sm">
                    Structured accounting overview with categorized balances,
                    account tracking, and financial visibility.
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-[340px] relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 " />

                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search account..."
                  type="search"
                  className="pl-11 h-12 rounded-2xl border-zinc-200focus-visible:ring-0 focus-visible:border-zinc-300 shadow-sm"
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
          <Card className="border-zinc-200  shadow-sm rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {isLoading ? (
                <SuspenenseFallBack
                  pagedata={"Charts of Account"}
                />
              ) : (
                <div className="overflow-x-auto">

                  <Table>

                    <TableHeader className="">
                      <TableRow className="border-zinc-200 hover:bg-transparent">

                        <TableHead className="h-14 px-6  font-medium">
                          Account Code
                        </TableHead>

                        <TableHead className=" font-medium">
                          Description
                        </TableHead>

                        <TableHead className=" font-medium">
                          Type
                        </TableHead>

                        <TableHead className="text-right pr-8  font-medium">
                          Balance
                        </TableHead>

                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {filteredData.map((entry) => (
                        <TableRow
                          key={entry._id}
                          className="border-zinc-100 hover:transition-colors text-xs"
                        >

                          <TableCell className="px-6 py-5">
                            <Link
                              href={`#`}
                              className="font-semibold"
                            >
                              {entry.code}
                            </Link>
                          </TableCell>

                          <TableCell className=" font-medium">
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
                              <span className="font-semibold ">
                                <span className="text-sm">
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm  px-1">

            <p>
              Showing{" "}
              <span className=" font-medium">
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
    <Card className="border-zinc-200  rounded-3xl overflow-hidden shadow-sm">

      <CardContent className="p-5">

        <div className="flex items-start justify-between">

          <div className="space-y-2">
            <p className="text-sm ">
              {title}
            </p>

            <h3 className="text-xl font-bold  tracking-tight">
              ₦{Number(value || 0).toLocaleString()}
            </h3>
          </div>

          <div className="h-11 w-11 rounded-2xl border border-zinc-200 flex items-center justify-center ">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}