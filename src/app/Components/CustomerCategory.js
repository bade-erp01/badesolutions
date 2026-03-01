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
      <div className="mt-8 animate-fade-in">
        {summarizeCustomerInvoices(customers, invoice)}
      </div>
    </section>
  );
}

function summarizeCustomerInvoices(customers, invoice) {
  const summarized = customers
    .filter((cust) => cust.Debt > 0)
    .map((customer) => ({
      username: customer.Username,
      totalAmount: customer.Debt,
      image:
        customer.image ||
        "https://img.icons8.com/glyph-neue/64/gender-neutral-user.png",
    }));

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

  const chartConfig = {
    totalAmount: {
      label: "Total Amount",
      color: "var(--chart-1)",
    },
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Debtors Overview</CardTitle>
        <CardDescription>Debt amount by customer</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <Line data={chartData} />
        </ChartContainer>
      </CardContent>
    </Card>
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

