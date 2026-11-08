
"use client";

import { useEffect, useMemo, useState } from "react";

import BackButton from "@/app/Components/BackBotton";

import {
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";

import { Dencrypt } from "../../../../../../../../Functions/Functions";

import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Download, Loader2 } from "lucide-react";
import Notch from "@/app/Components/Notch";
import {
  downloadIncomeStatement,
  formatAmount,
  toNumber,
} from "@/app/Components/Reports/IncomeStatementPdf";

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

import api from "@/lib/api";

import { Badge } from "@/components/ui/badge";
import moment from "moment";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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

// The API answers { data: <encrypted array> }; the layout passes that raw
// response, the client re-fetch passes the decrypted array.
function toReport(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload) return [];
  if (typeof payload === "string") {
    try {
      return toReport(Dencrypt(payload));
    } catch {
      return [];
    }
  }
  if (typeof payload === "object" && "data" in payload) return toReport(payload.data);
  return [];
}

// 1-12 for a snapshot. `generatedAt` holds the month number; fall back to a
// date in case a snapshot stores one.
function monthOf(entry) {
  const n = Number(entry?.generatedAt);
  if (Number.isInteger(n) && n >= 1 && n <= 12) return n;
  const d = moment(entry?.generatedAt);
  return d.isValid() ? d.month() + 1 : null;
}

function Amount({ value, currency, className = "" }) {
  const negative = toNumber(value) < 0;
  return (
    <span
      className={`whitespace-nowrap tabular-nums ${negative ? "text-red-600" : ""} ${className}`}
    >
      {formatAmount(value, currency)}
    </span>
  );
}

export default function Page({ baseUrl, userData, data }) {
  const [report, setReport] = useState(() => toReport(data));
  const [reportYear, setReportYear] = useState(moment().year());
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [monthIndex, setMonthIndex] = useState("");

  const [dates, setDates] = useState({
    period: "",
  });

  const currency = userData?.business?.currency?.currency?.Symbol || "₦";

  // month number (1-12) -> snapshot
  const snapshotsByMonth = useMemo(() => {
    const map = new Map();
    for (const entry of report) {
      const m = monthOf(entry);
      if (m) map.set(m, entry);
    }
    return map;
  }, [report]);

  // Default to the latest month that has a snapshot.
  useEffect(() => {
    if (!snapshotsByMonth.size) {
      setMonthIndex("");
      return;
    }
    const latest = Math.max(...snapshotsByMonth.keys());
    setMonthIndex(String(latest - 1));
  }, [snapshotsByMonth]);

  const selectedMonth =
    monthIndex === "" ? null : snapshotsByMonth.get(Number(monthIndex) + 1) || null;
  const totals = selectedMonth?.totals || {};

  // Graph data from the available monthly snapshots.
  const chartData = useMemo(() => {
    const availableMonths = [...snapshotsByMonth.entries()].sort(
      ([monthA], [monthB]) => monthA - monthB
    );

    return {
      labels: availableMonths.map(([month]) => months[month - 1]),
      datasets: [
        {
          label: "Revenue",
          data: availableMonths.map(([, snapshot]) =>
            toNumber(snapshot?.totals?.revenue)
          ),
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: "Net Profit",
          data: availableMonths.map(([, snapshot]) =>
            toNumber(snapshot?.totals?.netIncome)
          ),
          borderColor: "#16a34a",
          backgroundColor: "rgba(22, 163, 74, 0.08)",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
      ],
    };
  }, [snapshotsByMonth]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: "index",
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          usePointStyle: true,
          boxWidth: 8,
          padding: 12,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `${context.dataset.label}: ${formatAmount(
              context.parsed.y,
              currency
            )}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) =>
            `${currency}${Number(value).toLocaleString()}`,
        },
      },
    },
  };

  async function GeneratePNLSummary() {
    try {
      const { period } = dates;
      setOpenDialog(true);

      if (!period) {
        throw new Error("Please select a period.");
      }

      setLoading(true);
      const res = await api.get(
        `/api/Generate/profitandLoss?period=${period}`,
      );

      if (!res.ok) {
        throw new Error("Could not generate the income statement.");
      }

      const { data } = res.data || {};

      setReport(toReport(data));
      setReportYear(Number(period));
      SuccessToast("Income statement generated");
      setOpenDialog(false);
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload() {
    if (!selectedMonth) {
      ErrorMessage("Select a month with a P&L snapshot first.");
      return;
    }
    try {
      setDownloading(true);
      await downloadIncomeStatement({
        totals,
        year: reportYear,
        monthIndex: Number(monthIndex),
        business: userData.business,
        currencySymbol: currency,
      });
    } catch (err) {
      ErrorMessage(err.message || "Could not create the PDF.");
    } finally {
      setDownloading(false);
    }
  }

  const periodLabel = selectedMonth
    ? `${months[Number(monthIndex)]} ${reportYear}`
    : null;

  return (
    <div className="flex flex-col">
        {/* BLACK SIDEBAR */}
        <Notch>
          <BackButton />

          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="w-full flex gap-2">
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
           <div className="space-y-4 w-full rounded p-4">
            <h2 className="text-sm">Select P&L month ({reportYear})</h2>
            <Select value={monthIndex} onValueChange={setMonthIndex}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select Month" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m, idx) => {
                  const hasData = snapshotsByMonth.has(idx + 1);
                  return (
                    <SelectItem key={m} value={String(idx)} disabled={!hasData}>
                      {m}
                      {!hasData && (
                        <span className="ml-2 text-xs text-muted-foreground">No data</span>
                      )}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        )}
        </Notch>

        {/* MAIN */}
        <main className="flex-1 min-w-0">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
              <CardTitle>
                <Badge variant="outline" className="text-sm whitespace-normal text-left">
                  {periodLabel ? `P&L Summary for ${periodLabel}` : "P&L Summary"}{" "}
                  — {userData.business.companyName}
                </Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={!selectedMonth || downloading}
              >
                {downloading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Download />
                )}
                Download income statement
              </Button>
            </CardHeader>

            <CardContent>
              {chartData.labels.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3">
                    Revenue and Net Profit
                  </h3>
                  <div className="h-[220px] w-full">
                    <Line data={chartData} options={chartOptions} />
                  </div>
                </div>
              )}

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
                    <TableCell>[A] Revenue</TableCell>
                    <TableCell className="text-right">
                      <Amount value={totals.revenue} currency={currency} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[B] Returns [less]</TableCell>
                    <TableCell className="text-right">
                      <Amount value={totals.salesReturns} currency={currency} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    {/* First cell: the label */}
                    <TableCell>[C] C.O.G.S</TableCell>

                    {/* Second cell: accordion with value + expandable details */}
                    <TableCell className="text-right">
                      <Accordion type="single" collapsible>
                        <AccordionItem value="cogs">
                          <AccordionTrigger className="justify-end">
                            <Amount value={totals.COGS} currency={currency} />
                          </AccordionTrigger>
                          <AccordionContent>
                            <dl className="ml-auto max-w-xs space-y-2 text-sm">
                              {[
                                ["Opening Inventory", totals.OpeningInvntry],
                                ["+ Net Purchase", totals.netPurchase],
                                ["+ Goods in Transit", totals.gitTotal],
                                ["C.O.G.A.S", totals.COGAS, "font-bold"],
                                ["- Closing Inventory", totals.closingInvntry],
                              ].map(([label, value, cls]) => (
                                <div key={label} className={`flex justify-between gap-4 ${cls || ""}`}>
                                  <dt className="text-left">{label}</dt>
                                  <dd>
                                    <Amount value={value} currency={currency} />
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[D] Gross Profit</TableCell>
                    <TableCell className="text-right">
                      <Amount value={totals.grossProfit} currency={currency} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[E] Operating Expenses</TableCell>
                    <TableCell className="text-right font-semibold">
                      <Amount value={totals.operatingExpenses} currency={currency} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[F] EBIT</TableCell>
                    <TableCell className="text-right">
                      <Amount value={totals.ebit} currency={currency} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[G] Other income</TableCell>
                    <TableCell className="text-right">
                      <Amount value={totals.otherIncome} currency={currency} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[H] Interest</TableCell>
                    <TableCell className="text-right">
                      <Amount value={totals.interest} currency={currency} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[I] Taxes</TableCell>
                    <TableCell className="text-right font-semibold">
                      <Amount value={totals.taxes} currency={currency} />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-bold text-base sm:text-lg">
                      Net Profit
                    </TableCell>
                    <TableCell className="text-right font-bold text-base sm:text-lg">
                      <Amount value={totals.netIncome} currency={currency} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </main>
      </div>
  );
}
