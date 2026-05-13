"use client";

import { useState } from "react";
import moment from "moment";

import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";

import {
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";

import { pricelistSetter } from "../../../../../../../../Functions/Functions";

import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Loader2 } from "lucide-react";

/* shadcn/ui */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

export default function Page({ Data, userData }) {
  const [report, setReport] = useState({
    SALES: 0,
    Return: 0,
    OpeningInventory: 0,
    NetPurchase: 0,
    closingInv: 0,
    DirectExpense: 0,
    indirectExpenses: 0,
    Taxes: 0,
    EBIT: 0,
    NetProfit: 0,
  });

  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [dates, setDates] = useState({
    startDate: "",
    endDate: "",
  });

  const coa = Data?.COAs?.[0];

  const currency =
    userData?.business?.currency?.currency?.Symbol || "₦";

  const generateDates = (start, end) => {
    const arr = [];
    let cur = moment(start).startOf("month");
    const last = moment(end).endOf("month");

    while (cur <= last) {
      arr.push(cur.format("YYYY-MM"));
      cur.add(1, "month");
    }

    return arr;
  };

  const sumBalances = (list = [], dates, field = "openingBalance") =>
    list
      .filter((i) =>
        dates.includes(moment(i.month).format("YYYY-MM"))
      )
      .reduce((a, b) => a + (Number(b[field]) || 0), 0);

  async function GeneratePNLSummary() {
    try {
      const { startDate, endDate } = dates;

      if (!startDate || !endDate) {
        return ErrorMessage("Select start and end dates");
      }

      setLoading(true);

      const range = generateDates(startDate, endDate);

      const SALES = sumBalances(
        coa?.Revenue?.Revenue?.monthlyBalances,
        range
      );

      const Return = sumBalances(
        coa?.Revenue?.Sales_Returns_Allowance?.monthlyBalances,
        range
      );

      const OpeningInventory = sumBalances(
        coa?.Asset?.inventory?.monthlyBalances,
        range
      );

      const NetPurchase = sumBalances(
        coa?.Expense?.Purchases?.monthlyBalances,
        range
      );

      const closingInv = sumBalances(
        coa?.Asset?.inventory?.monthlyBalances,
        range,
        "closingBalance"
      );

      const DirectExpense = sumBalances(
        coa?.Expense?.Direct_Expense?.monthlyBalances,
        range
      );

      const indirectExpenses = sumBalances(
        coa?.Expense?.Indirect_Expense?.monthlyBalances,
        range
      );

      const Taxes = sumBalances(
        coa?.Liability?.Tax_payable?.monthlyBalances,
        range
      );

      const COGS =
        OpeningInventory + NetPurchase - closingInv;

      const GrossProfit =
        SALES - Return - COGS;

      const EBIT =
        GrossProfit - DirectExpense - indirectExpenses;

      const NetProfit =
        EBIT - Taxes;

      setReport({
        SALES,
        Return,
        OpeningInventory,
        NetPurchase,
        closingInv,
        DirectExpense,
        indirectExpenses,
        Taxes,
        EBIT,
        NetProfit,
      });

      SuccessToast("Income statement generated");
      setOpenDialog(false);
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  const GrossProfit =
    report.SALES - report.Return -
    (report.OpeningInventory + report.NetPurchase - report.closingInv);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      <Nav1
        user={userData.user}
        business={userData.business}
        page="Income Statement"
      />

      <div className="flex flex-1 overflow-hidden">

        {/* BLACK SIDEBAR */}
        <aside className="hidden md:flex w-72 bg-[#1e1e20]/80 backdrop-blur-lg
          text-white text-white p-5 flex-col gap-4">
          <BackButton />

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="w-full flex gap-2 bg-white text-black hover:bg-gray-200">
                <CalendarDaysIcon className="h-5 w-5" />
                Select Period
              </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  Generate Income Statement
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={dates.startDate}
                    onChange={(e) =>
                      setDates({
                        ...dates,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={dates.endDate}
                    onChange={(e) =>
                      setDates({
                        ...dates,
                        endDate: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={GeneratePNLSummary}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                Income Statement — {userData.business.companyName}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Heads</TableHead>
                    <TableHead className="text-right">
                      Amount
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>

                  <TableRow>
                    <TableCell>Sales</TableCell>
                    <TableCell className="text-right">
                      {currency}{report.SALES}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Net Sales</TableCell>
                    <TableCell className="text-right">
                      {currency}{report.SALES - report.Return}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Gross Profit</TableCell>
                    <TableCell className="text-right font-semibold">
                      {currency}{GrossProfit}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Direct Expenses</TableCell>
                    <TableCell className="text-right">
                      {currency}{report.DirectExpense}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Indirect Expenses</TableCell>
                    <TableCell className="text-right">
                      {currency}{report.indirectExpenses}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>EBIT</TableCell>
                    <TableCell className="text-right font-semibold">
                      {currency}{report.EBIT}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Taxes</TableCell>
                    <TableCell className="text-right">
                      {currency}{report.Taxes}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-bold text-lg">
                      Net Profit
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {currency}{report.NetProfit}
                    </TableCell>
                  </TableRow>

                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>

      <Footer2 />
    </div>
  );
}