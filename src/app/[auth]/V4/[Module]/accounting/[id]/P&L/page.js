
"use client";

import { useEffect, useMemo, useState } from "react";
import moment from "moment";
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

import BackButton from "@/app/Components/BackBotton";
import Notch from "@/app/Components/Notch";

import {
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";

import { Dencrypt } from "../../../../../../../../Functions/Functions";

import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Download, Loader2 } from "lucide-react";

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

import api from "@/lib/api";

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

  if (typeof payload === "object" && "data" in payload) {
    return toReport(payload.data);
  }

  return [];
}

function monthOf(entry) {
  const n = Number(entry?.generatedAt);

  if (Number.isInteger(n) && n >= 1 && n <= 12) {
    return n;
  }

  const d = moment(entry?.generatedAt);

  return d.isValid() ? d.month() + 1 : null;
}

function Amount({ value, currency, className = "" }) {
  const negative = toNumber(value) < 0;

  return (
    <span
      className={`whitespace-nowrap tabular-nums ${
        negative ? "text-red-600" : ""
      } ${className}`}
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

  const currency =
    userData?.business?.currency?.currency?.Symbol || "₦";

  const snapshotsByMonth = useMemo(() => {
    const map = new Map();

    for (const entry of report) {
      const month = monthOf(entry);

      if (month) {
        map.set(month, entry);
      }
    }

    return map;
  }, [report]);

  useEffect(() => {
    if (!snapshotsByMonth.size) {
      setMonthIndex("");
      return;
    }

    const latest = Math.max(...snapshotsByMonth.keys());

    setMonthIndex(String(latest - 1));
  }, [snapshotsByMonth]);

  const selectedMonth =
    monthIndex === ""
      ? null
      : snapshotsByMonth.get(Number(monthIndex) + 1) || null;

  const totals = selectedMonth?.totals || {};

  const chartData = useMemo(() => {
    const labels = [];
    const revenue = [];
    const netIncome = [];

    for (let i = 1; i <= 12; i++) {
      const snapshot = snapshotsByMonth.get(i);

      if (!snapshot) continue;

      labels.push(months[i - 1]);
      revenue.push(toNumber(snapshot.totals?.revenue));
      netIncome.push(toNumber(snapshot.totals?.netIncome));
    }

    return {
      labels,
      datasets: [
        {
          label: "Revenue",
          data: revenue,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.08)",
          tension: 0.3,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
        },
        {
          label: "Net Profit",
          data: netIncome,
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
          padding: 15,
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

      if (!period || !Number.isInteger(Number(period))) {
        throw new Error("Please enter a valid year.");
      }

      setLoading(true);

      const res = await api.get(
        `/api/Generate/profitandLoss?period=${period}`
      );

      const responseBody = res?.data ?? {};

      const reportPayload =
        responseBody &&
        typeof responseBody === "object" &&
        Object.prototype.hasOwnProperty.call(responseBody, "data")
          ? responseBody.data
          : responseBody;

      const generatedReport = toReport(reportPayload);

      if (!generatedReport.length) {
        throw new Error("No income statement data was returned.");
      }

      setReport(generatedReport);
      setReportYear(Number(period));

      SuccessToast("Income statement generated");
      setOpenDialog(false);
    } catch (err) {
      ErrorMessage(
        err?.response?.data?.message ||
          err.message ||
          "Could not generate the income statement."
      );
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
        business: userData?.business,
        currencySymbol: currency,
      });
    } catch (err) {
      ErrorMessage(
        err.message || "Could not create the PDF."
      );
    } finally {
      setDownloading(false);
    }
  }

  const periodLabel = selectedMonth
    ? `${months[Number(monthIndex)]} ${reportYear}`
    : null;

  return (
    <div className="flex flex-col">
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
              <DialogTitle>
                Generate Income Statement
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="report-year">
                  Select year
                </Label>

                <Input
                  id="report-year"
                  type="number"
                  min="2026"
                  value={dates.period}
                  onChange={(e) =>
                    setDates({
                      ...dates,
                      period: e.target.value,
                    })
                  }
                  placeholder="Enter year"
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

        {report.length > 0 && (
          <div className="space-y-3 w-full rounded p-4">
            <h2 className="text-sm">
              Select P&L month ({reportYear})
            </h2>

            <select
              value={monthIndex}
              onChange={(e) => setMonthIndex(e.target.value)}
              className="w-full max-w-[220px] rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="" disabled>
                Select Month
              </option>

              {months.map((month, index) => {
                const hasData = snapshotsByMonth.has(index + 1);

                return (
                  <option
                    key={month}
                    value={String(index)}
                    disabled={!hasData}
                  >
                    {month}
                    {!hasData ? " - No data" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}
      </Notch>

      <main className="flex-1 min-w-0 space-y-4">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
            <CardTitle>
              <span className="inline-flex rounded-md border px-3 py-2 text-sm font-medium whitespace-normal">
                {periodLabel
                  ? `P&L Summary for ${periodLabel}`
                  : "P&L Summary"}{" "}
                — {userData?.business?.companyName}
              </span>
            </CardTitle>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={!selectedMonth || downloading}
            >
              {downloading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Download income statement
            </Button>
          </CardHeader>

          <CardContent>
            {chartData.labels.length > 0 ? (
              <div className="mb-6">
                <h3 className="text-sm font-semibold mb-3">
                  Revenue and Net Profit Trajectory
                </h3>

                <div className="h-[220px] w-full">
                  <Line
                    data={chartData}
                    options={chartOptions}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-6 rounded-lg border border-dashed py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Generate an income statement to view the graph.
                </p>
              </div>
            )}

            <div className="border-t pt-5">
              <h3 className="text-base font-semibold mb-3">
                Income Statement
              </h3>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <span className="text-sm font-semibold">
                        Heads
                      </span>
                    </TableHead>

                    <TableHead className="text-right">
                      <span className="text-sm font-semibold">
                        Amount
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <TableRow>
                    <TableCell>[A] Revenue</TableCell>
                    <TableCell className="text-right">
                      <Amount
                        value={totals.revenue}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[B] Returns [less]</TableCell>
                    <TableCell className="text-right">
                      <Amount
                        value={totals.salesReturns}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[C] C.O.G.S</TableCell>

                    <TableCell className="text-right">
                      <Accordion
                        type="single"
                        collapsible
                      >
                        <AccordionItem
                          value="cogs"
                          className="border-b-0"
                        >
                          <AccordionTrigger className="justify-end py-2">
                            <Amount
                              value={totals.COGS}
                              currency={currency}
                            />
                          </AccordionTrigger>

                          <AccordionContent>
                            <dl className="ml-auto max-w-xs space-y-2 text-sm">
                              {[
                                [
                                  "Opening Inventory",
                                  totals.OpeningInvntry,
                                ],
                                [
                                  "+ Net Purchase",
                                  totals.netPurchase,
                                ],
                                [
                                  "+ Goods in Transit",
                                  totals.gitTotal,
                                ],
                                [
                                  "C.O.G.A.S",
                                  totals.COGAS,
                                  "font-bold",
                                ],
                                [
                                  "- Closing Inventory",
                                  totals.closingInvntry,
                                ],
                              ].map(([label, value, cls]) => (
                                <div
                                  key={label}
                                  className={`flex justify-between gap-4 ${
                                    cls || ""
                                  }`}
                                >
                                  <dt className="text-left">
                                    {label}
                                  </dt>

                                  <dd>
                                    <Amount
                                      value={value}
                                      currency={currency}
                                    />
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
                      <Amount
                        value={totals.grossProfit}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[E] Operating Expenses</TableCell>
                    <TableCell className="text-right font-semibold">
                      <Amount
                        value={totals.operatingExpenses}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[F] EBIT</TableCell>
                    <TableCell className="text-right">
                      <Amount
                        value={totals.ebit}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[G] Other income</TableCell>
                    <TableCell className="text-right">
                      <Amount
                        value={totals.otherIncome}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[H] Interest</TableCell>
                    <TableCell className="text-right">
                      <Amount
                        value={totals.interest}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell>[I] Taxes</TableCell>
                    <TableCell className="text-right font-semibold">
                      <Amount
                        value={totals.taxes}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>

                  <TableRow>
                    <TableCell className="font-bold text-base sm:text-lg">
                      Net Profit
                    </TableCell>

                    <TableCell className="text-right font-bold text-base sm:text-lg">
                      <Amount
                        value={totals.netIncome}
                        currency={currency}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
