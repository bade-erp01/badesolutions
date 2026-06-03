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

export default function Page({ baseUrl, userData }) {
  const [report, setReport] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const [dates, setDates] = useState({
    startDate: "",
    endDate: "",
  });

  const currency = userData?.business?.currency?.currency?.Symbol || "₦";

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

  async function GeneratePNLSummary() {
    try {
      const { startDate, endDate } = dates;
      setOpenDialog(true);

      if (!startDate || !endDate) {
        throw new Error("Please select both start and end dates.");
      }

      setLoading(true);
      const res = await fetch(
        `${baseUrl}/api/Generate/profitandLoss?startDate=${dates.startDate}&endDate=${dates.endDate}`,
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
                <Badge variant="outline" className="text-sm">
                  {report.period
                    ? `P&L Summary for ${report.period.startDate} to ${report.period.endDate}`
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
                      {report?.totals?.revenue || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow className={`text-red-700`}>
                    <TableCell>Returns [less]</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {report?.totals?.salesReturns || 0}
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
                            {report?.totals?.cogs || 0}
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2 text-left">
                              <p>
                                Opening Inventory: {currency}
                                {report?.totals?.OpeningInvntry || 0}
                              </p>
                              <p>
                               + Net Purchase: {currency}
                                {report?.totals?.netPurchase || 0}
                              </p>
                              <p>
                               - Closing Inventory: {currency}
                                {report?.totals?.closingInvntry || 0}
                              </p>
                              <p className="font-bold">
                                C.O.G.A.S: {currency}
                                {report?.totals?.COGAS || 0}
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
                      {report?.totals?.grossProfit || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Operating Expenses</TableCell>
                    <TableCell className="text-right font-semibold">
                      {currency}
                      {report?.totals?.operatingExpenses || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>EBIT</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {report?.totals?.ebit || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Other income</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {report?.totals?.otherIncome || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Interest</TableCell>
                    <TableCell className="text-right">
                      {currency}
                      {report?.totals?.interest || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>Taxes</TableCell>
                    <TableCell className="text-right font-semibold">
                      {currency}
                      {report?.totals?.taxes || 0}
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-bold text-lg">
                      Net Profit
                    </TableCell>
                    <TableCell className="text-right font-bold text-lg">
                      {currency}
                      {report?.totals?.netIncome || 0}
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
