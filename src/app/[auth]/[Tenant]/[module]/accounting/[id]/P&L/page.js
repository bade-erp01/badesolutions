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

import { Dencrypt } from "../../../../../../../../Functions/Functions";

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

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
import { Encrypt } from "../../../../../../../../Functions/Mics";

import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select"; 

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

export default function Page({ baseUrl, userData, data }) {
  const [report, setReport] = useState(data || []);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const [dates, setDates] = useState({
    period: "",
  });

  const currency = userData?.business?.currency?.currency?.Symbol || "₦";

  async function GeneratePNLSummary() {
    try {
      const { period } = dates;
      setOpenDialog(true);

      if (!period) {
        throw new Error("Please select a period.");
      }

      setLoading(true);
      const res = await fetch(
        `${baseUrl}/api/Generate/profitandLoss?period=${period}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            access: `${Encrypt(userData.user._id)}`,
          },
          // cache: "force-cache", // Try cache first
          // next: { revalidate: 60 }, // cache for 1 minutes
        },
      );

      const { data } = await res.json();

      setReport(Dencrypt(data));
      SuccessToast("Income statement generated");
      setOpenDialog(false);
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Nav1
        user={userData.user}
        business={userData.business}
        page="Income Statement"
      />

      <div className="flex flex-1 overflow-hidden">
        {/* BLACK SIDEBAR */}
        <aside
          className="hidden md:flex w-72 bg-[#1e1e20]/80 backdrop-blur-lg
          text-white text-white p-5 flex-col gap-4"
        >
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
                <DialogTitle>Generate Income Statement</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label>Select year</Label>
                  <Input
                    type="number"
                    min="2026"
                    value={dates.period}
                    onChange={(e) =>
                      setDates({
                        ...dates,
                        period: e.target.value,
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
                  type="button"
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

          {/* months */}
         {report.length > 0 && (
           <div className="space-y-4 w-full bg-gray-100 rounded p-4">
            <h2 className="text-sm text-black">Select P&L month</h2>
            <Select
              onValueChange={(value) => {

                // Convert value to number (e.g. "6" → 6)
                const monthNum = Number(value + 1); // Add 1 because month index is 0-based

                // Find the matching report entry
                const matchedEntry = report.find(
                  (entry) => Number(entry.period) === monthNum
                );

                if (matchedEntry) {
                  setSelectedMonth(matchedEntry); // set the actual report entry
                } else {
                  ErrorMessage("No snapshot for selected P&L month.");
                }
              }}
              className="w-full bg-black text-black hover:bg-gray-200"
            >
              <SelectTrigger className="w-[200px] text-black">
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
        )}
        </aside>

        {/* MAIN */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>
                <Badge variant="outline" className="text-sm">
                  {selectedMonth?.period
                    ? `P&L Summary for ${selectedMonth?.period}`
                    : "P&L Summary"}{" "}
                  — {userData.business.companyName}
                </Badge>
              </CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Badge variant="outline" className="text-sm">
                        Heads
                      </Badge>
                    </TableHead>
                    <TableHead className="text-right">
                      <Badge variant="outline" className="text-sm">
                        Amount
                      </Badge>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow>
                    <TableCell>Revenue</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {selectedMonth?.totals?.revenue || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow className={`text-red-700`}>
                    <TableCell>Returns [less]</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {selectedMonth?.totals?.salesReturns || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    {/* First cell: the label */}
                    <TableCell>C.O.G.S</TableCell>

                    {/* Second cell: accordion with value + expandable details */}
                    <TableCell className="text-right">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="cogs">
                          <AccordionTrigger className="justify-end">
                            {currency}
                            {selectedMonth?.totals?.cogs || 0}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-left">
                              <p>
                                Opening Inventory: {currency}
                                {selectedMonth?.totals?.OpeningInvntry || 0}
                              </p>
                              <p>
                                + Net Purchase: {currency}
                                {selectedMonth?.totals?.netPurchase || 0}
                              </p>
                              <p className="font-bold">
                                C.O.G.A.S: {currency}
                                {selectedMonth?.totals?.COGAS || 0}
                              </p>
                              <p>
                                - Closing Inventory: {currency}
                                {selectedMonth?.totals?.closingInvntry || 0}
                              </p>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Gross Profit</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {selectedMonth?.totals?.grossProfit || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Operating Expenses</TableCell>
                    <TableCell className="text-right font-semibold">
                      {currency}
                      {selectedMonth?.totals?.operatingExpenses || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>EBIT</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {selectedMonth?.totals?.ebit || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Other income</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {selectedMonth?.totals?.otherIncome || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Interest</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {selectedMonth?.totals?.interest || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Taxes</TableCell>
                    <TableCell className="text-right font-semibold">
                      {currency}
                      {selectedMonth?.totals?.taxes || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-bold text-lg">
                      Net Profit
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {currency}
                      {selectedMonth?.totals?.netIncome || 0}
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
