"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";

import {
  ArrowUpCircle,
  Wallet,
  Landmark,
  TrendingUp,
} from "lucide-react";

const cashFlowData = {
  company: "ABC Distribution Ltd",
  period: "For the Year Ended December 31, 2025",

  operatingActivities: [
    { name: "Net Profit", amount: 4500000 },
    { name: "Depreciation Expense", amount: 350000 },
    { name: "Increase in Accounts Payable", amount: 200000 },
    { name: "Decrease in Inventory", amount: 150000 },
    { name: "Increase in Accounts Receivable", amount: -500000 },
    { name: "Tax Paid", amount: -250000 },
  ],

  investingActivities: [
    { name: "Purchase of Equipment", amount: -2000000 },
    { name: "Purchase of Vehicle", amount: -1200000 },
    { name: "Sale of Old Equipment", amount: 300000 },
  ],

  financingActivities: [
    { name: "Bank Loan Received", amount: 5000000 },
    { name: "Owner Capital Injection", amount: 1500000 },
    { name: "Loan Repayment", amount: -800000 },
    { name: "Dividend Paid", amount: -400000 },
  ],

  openingCashBalance: 2000000,
};

export default function CashFlowStatement() {
  const operatingTotal = cashFlowData.operatingActivities.reduce(
    (acc, item) => acc + item.amount,
    0,
  );

  const investingTotal = cashFlowData.investingActivities.reduce(
    (acc, item) => acc + item.amount,
    0,
  );

  const financingTotal = cashFlowData.financingActivities.reduce(
    (acc, item) => acc + item.amount,
    0,
  );

  const netCashFlow =
    operatingTotal + investingTotal + financingTotal;

  const closingBalance =
    cashFlowData.openingCashBalance + netCashFlow;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const Amount = ({ value }) => (
    <span
      className={`font-semibold ${
        value < 0 ? "text-red-500" : "text-green-600"
      }`}
    >
      {value < 0 ? "-" : ""}
      {formatCurrency(Math.abs(value))}
    </span>
  );

  return (
    <div className="min-h-screen bg-muted/30 p-3 md:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-3">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="text-lg md:text-md font-bold tracking-tight">
                  Cash Flow Statement
                </CardTitle>

                <CardDescription className="mt-2 text-sm md:text-base">
                  {cashFlowData.company}
                </CardDescription>

                <CardDescription>
                  {cashFlowData.period}
                </CardDescription>
              </div>

              <Badge className="w-fit px-4 py-2 text-sm">
                Financial Report
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Operating
                  </p>

                  <h2 className="mt-2 text-lg font-bold">
                    <Amount value={operatingTotal} />
                  </h2>
                </div>

                <ArrowUpCircle className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Investing
                  </p>

                  <h2 className="mt-2 text-lg font-bold">
                    <Amount value={investingTotal} />
                  </h2>
                </div>

                <Landmark className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Financing
                  </p>

                  <h2 className="mt-2 text-lg font-bold">
                    <Amount value={financingTotal} />
                  </h2>
                </div>

                <Wallet className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-2 border-primary">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Net Cash Flow
                  </p>

                  <h2 className="mt-2 text-lg font-bold">
                    <Amount value={netCashFlow} />
                  </h2>
                </div>

                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* OPERATING ACTIVITIES */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Operating Activities
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {cashFlowData.operatingActivities.map(
                    (item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>

                        <TableCell className="text-right">
                          <Amount value={item.amount} />
                        </TableCell>
                      </TableRow>
                    ),
                  )}

                  <TableRow className="bg-muted/40 font-bold">
                    <TableCell>
                      Net Cash from Operating Activities
                    </TableCell>

                    <TableCell className="text-right">
                      <Amount value={operatingTotal} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* INVESTING ACTIVITIES */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Investing Activities
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {cashFlowData.investingActivities.map(
                    (item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>

                        <TableCell className="text-right">
                          <Amount value={item.amount} />
                        </TableCell>
                      </TableRow>
                    ),
                  )}

                  <TableRow className="bg-muted/40 font-bold">
                    <TableCell>
                      Net Cash Used in Investing Activities
                    </TableCell>

                    <TableCell className="text-right">
                      <Amount value={investingTotal} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* FINANCING ACTIVITIES */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">
              Financing Activities
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {cashFlowData.financingActivities.map(
                    (item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.name}</TableCell>

                        <TableCell className="text-right">
                          <Amount value={item.amount} />
                        </TableCell>
                      </TableRow>
                    ),
                  )}

                  <TableRow className="bg-muted/40 font-bold">
                    <TableCell>
                      Net Cash from Financing Activities
                    </TableCell>

                    <TableCell className="text-right">
                      <Amount value={financingTotal} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* CASH SUMMARY */}
        <Card className="shadow-lg border-2">
          <CardHeader>
            <CardTitle className="text-xl">
              Cash Summary
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-between text-sm md:text-base">
              <span>Opening Cash Balance</span>

              <Amount
                value={cashFlowData.openingCashBalance}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm md:text-base">
              <span>Net Increase in Cash</span>

              <Amount value={netCashFlow} />
            </div>

            <Separator />

            <div className="flex items-center justify-between text-lg font-bold">
              <span>Closing Cash Balance</span>

              <Amount value={closingBalance} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}