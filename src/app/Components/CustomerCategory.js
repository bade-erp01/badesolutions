"use client";
import {
  ExclamationTriangleIcon,
  CalculatorIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { totalInWords } from "../../../Functions/Functions";
import { useState } from "react";
import Marquee from "react-fast-marquee";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

function CustomerCategoryPieChart({ customersList, invoiceList, userData }) {
  const [customers] = useState(customersList || []);
  const [invoice] = useState(invoiceList || []);

  // get debtors
  const debtors = customers.filter((cust) => cust.Debt > 0);

  return (
    <section className="sm:p-10 mx-auto max-w-6xl transition-all duration-700">
      {/* Summary Cards */}
      <div className="text-right">
        <span className="text-xs text-gray-900 tracking-tight mb-1">
          Total Debt:{" "}
          {totalInWords(
            customers
              .filter((c) => c.Debt > 0)
              .reduce((acc, curr) => acc + curr.Debt, 0),
            userData.business.currency?.currency
          )}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-7">
        {[
          {
            title: "Crm List",
            value: customers.length,
            icon: <UserGroupIcon className="h-6 w-6 text-gray-900" />,
            bg: "bg-[#ffa2a2]",
          },
          {
            title: "Total Debtors",
            value: debtors.length,
            icon: <ExclamationTriangleIcon className="h-6 w-6 text-gray-900" />,
            bg: "bg-[#ffb86a]",
          },
          {
            title: "Total Debt",
            value: `${userData.business.currency?.currency.Symbol}${customers
              .filter((c) => c.Debt > 0)
              .reduce((acc, curr) => acc + curr.Debt, 0)
              .toLocaleString()}`,
            icon: <CalculatorIcon className="h-6 w-6 text-gray-300" />,
            bg: "bg-[#09090b]",
            textColor: "text-red-400",
          },
        ].map((card, idx) => (
          <div
            key={idx}
            className="p-5 rounded-lg shadow-md mt-4 bg-white dark:bg-gray-800 transition-all duration-500"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm text-gray-500 dark:text-gray-300 font-semibold">
                  {card.title}
                </h3>
                <p
                  className={`text-sm mt-1 font-semibold ${
                    card.textColor || "text-gray-800 dark:text-white"
                  }`}
                >
                  {card.value}
                </p>
              </div>
              <div
                className={`flex items-center gap-2 ${card.bg} px-4 py-2 rounded-full shadow-sm`}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* debtors list */}

      <div className="w-full text-center m-1">
        <Marquee gradient={false} speed={40} className="w-full text-center m-1 overflow-hidden">
          {debtors.length > 0 ? (
            debtors.map((debtor) => (
              <div key={debtor._id} className="w-full text-center mt-3">
                <span className="mx-1 text-black bg-gray-100 px-2 py-1 rounded text-xs">
                  {debtor.Username} owes:
                  {userData.business.currency?.currency.Symbol}
                  {debtor.Debt.toLocaleString()}
                </span>
                <span className="mx-2 text-black">|</span>
              </div>
            ))
          ) : (
            <span className="text-gray-300">No debtors to display.</span>
          )}
        </Marquee>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
       
        <ChartPieInteractive customers={debtors} />

        <TopDebtorsRadarChart customers={debtors} />
      </div>

      {/* Line Chart */}
      <div className="mt-12 h-[400px] animate-fade-in">
        {summarizeCustomerInvoices(customers, invoice)}
      </div>
    </section>
  );
}

function summarizeCustomerInvoices(customers) {
  const summarized = customers
    .filter((cust) => cust.Debt > 0)
    .map((customer) => {
      // .sort((a, b) => b.Debt - a.Debt) // Sort by highest debt first
      // const customerInvoices = invoices.filter(
      //   (invoice) => invoice.customer === customer._id
      // );
      // const totalAmount = customerInvoices.reduce(
      //   (sum, invoice) => sum + invoice.grandTotal,
      //   0
      // );
      return {
        username: customer.Username,
        totalAmount: customer.Debt,
        image:
          customer.image ||
          "https://img.icons8.com/glyph-neue/64/gender-neutral-user.png",
      };
    });

  const chartData = {
    labels: summarized.map((item) => item.username.substring(0, 5)),
    datasets: [
      {
        label: "Total Amount",
        data: summarized.map((item) => item.totalAmount),
        fill: true,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: "#fff",
        pointBorderColor: "#38bdf8",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 20,
        bottom: 10,
        left: 10,
        right: 10,
      },
    },
    animation: {
      duration: 1200,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        labels: {
          color: "#e2e8f0",
          font: { size: 14, weight: "bold" },
        },
      },
      tooltip: {
        enabled: false,
        external: function (context) {
          const tooltipModel = context.tooltip;
          const chartCanvas = context.chart.canvas;
          let tooltipEl = document.getElementById("chartjs-tooltip");

          if (!tooltipEl) {
            tooltipEl = document.createElement("div");
            tooltipEl.id = "chartjs-tooltip";
            tooltipEl.style.position = "absolute";
            tooltipEl.style.background = "#1e293b6c";
            tooltipEl.style.border = "1px solid #38bdf8";
            tooltipEl.style.borderRadius = "8px";
            tooltipEl.style.padding = "10px";
            tooltipEl.style.color = "#f1f5f9";
            tooltipEl.style.pointerEvents = "none";
            tooltipEl.style.transition = "all 0.3s ease";
            tooltipEl.style.zIndex = "100";
            document.body.appendChild(tooltipEl);
          }

          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = "0";
            return;
          }

          const index = tooltipModel.dataPoints[0].dataIndex;
          const customer = summarized[index];
          const imageUrl = customer.image;

          tooltipEl.innerHTML = `
            <div style="text-align:center;">
              <strong>${customer.username}</strong><br/>
              <img src="${
                imageUrl ||
                "https://img.icons8.com/glyph-neue/64/gender-neutral-user.png"
              }" alt="${
            customer.username
          }" style="width:30px;height:auto;border-radius:4px;margin-top:4px;" />
              <div style="margin-top:6px;">Debt: ${
                userData.business.currency?.currency.Symbol
              }${customer.totalAmount.toLocaleString()}</div>
            </div>
          `;

          const position = chartCanvas.getBoundingClientRect();
          tooltipEl.style.left =
            position.left + window.pageXOffset + tooltipModel.caretX + "px";
          tooltipEl.style.top =
            position.top + window.pageYOffset + tooltipModel.caretY - 80 + "px";
          tooltipEl.style.opacity = "1";
        },
      },
      title: {
        display: true,
        text: `Debtors Overview`,
        font: { size: 20 },
        color: "#e2e8f0",
        padding: { top: 10, bottom: 20 },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Customer Name",
          color: "#cbd5e1",
          font: { size: 16, weight: "bold" },
        },
        ticks: {
          color: "#94a3b8",
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { display: false },
      },
      y: {
        title: {
          display: true,
          text: "Debt Amount",
          color: "#cbd5e1",
          font: { size: 16, weight: "bold" },
        },
        ticks: { color: "#94a3b8" },
        grid: {
          color: "rgba(255,255,255,0.05)",
          borderDash: [4, 4],
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="relative h-[400px] w-full bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg ring-1 ring-gray-700 border border-gray-700 p-6 rounded-lg animate-fade-in-up overflow-hidden">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}

export default CustomerCategoryPieChart;


import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, Radar, RadarChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export function TopDebtorsRadarChart({ customers }) {
  const getTopDebtors = (customers) =>
    customers
      .filter((c) => c.Debt && c.Debt > 0)
      .sort((a, b) => b.Debt - a.Debt)
      .slice(0, 5)

  const topDebtors = getTopDebtors(customers)

  const chartData = topDebtors.map((debtor) => ({
    name: debtor.Username.substring(0, 10),
    debt: debtor.Debt,
  }))

  const chartConfig = {
    debt: {
      label: "Debt Amount",
      color: "var(--chart-3)",
    },
  }

  return (
    <Card>
      <CardHeader className="items-center p-4">
        <CardTitle>Top 5 Debtors</CardTitle>
        <CardDescription>Debt overview for top debtors</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <PolarAngleAxis dataKey="name" />
            <Radar
              dataKey="debt"
              fill="var(--color-debt)"
              fillOpacity={0.6}
              dot={{ r: 4, fillOpacity: 1 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Top debtors overview <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground">
          {topDebtors.length} debtors displayed
        </div>
      </CardFooter>
    </Card>
  )
}



// display customer insight
import React, { useMemo } from "react"
import { Label, Pie, PieChart, Sector } from "recharts"

import {
  // ChartContainer,
  ChartStyle,
  // ChartTooltip,
  // ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Utility: group customers by category
function getCategoryData(customers) {
  const counts = customers.reduce((acc, c) => {
    acc[c.category] = (acc[c.category] || 0) + 1
    return acc
  }, {})

  return Object.entries(counts).map(([category, count]) => ({
    category,
    count,
    fill: `var(--color-${category})`,
  }))
}

const chartConfig = {
   Lead: { label: "Lead", color: "var(--chart-1)" },
   Customer: { label: "Customer", color: "var(--chart-2)" },
}

export function ChartPieInteractive({customers}) {
  const id = "pie-interactive"
  const customerData = getCategoryData(customers)
  const [activeCategory, setActiveCategory] = useState(customerData[0]?.category)

  const activeIndex = useMemo(
    () => customerData.findIndex((item) => item.category === activeCategory),
    [activeCategory, customerData]
  )
  const categories = useMemo(() => customerData.map((item) => item.category), [customerData])

  return (
    <Card data-chart={id} className="flex flex-col">
      <ChartStyle id={id} config={chartConfig} />
      <CardHeader className="flex-row items-start space-y-0 pb-0">
        <div className="grid gap-1">
          <CardTitle>Customer Categories</CardTitle>
          <CardDescription>Distribution of customers</CardDescription>
        </div>
        <Select value={activeCategory} onValueChange={setActiveCategory}>
          <SelectTrigger
            className="ml-auto h-7 w-[150px] rounded-lg pl-2.5"
            aria-label="Select a category"
          >
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {categories.map((key) => {
              const config = chartConfig[key]
              if (!config) return null
              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{ backgroundColor: `var(--color-${key})` }}
                    />
                    {config.label}
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={chartConfig}
          className="mx-auto aspect-square w-full max-w-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={customerData}
              dataKey="count"
              nameKey="category"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({ outerRadius = 0, ...props }) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {customerData[activeIndex].count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

