"use client";
import {
  ExclamationTriangleIcon,
  CalculatorIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRef, useState } from "react";
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
import { Pie, Line } from "react-chartjs-2";

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

function CustomerCategoryPieChart({ customersList, invoiceList }) {
  const pieRef = useRef(null);
  const [customers] = useState(customersList || []);
  const [invoice] = useState(invoiceList || []);

  // get debtors
  const debtors = customers.filter(cust => cust.Debt > 0);


  const categoryCount =
    customers?.reduce((acc, curr) => {
      const cat = curr.category || "Uncategorized";
      acc[cat] = acc[cat] ? acc[cat] + 1 : 1;
      return acc;
    }, {}) || {};

  const pieData = {
    labels: Object.keys(categoryCount),
    datasets: [
      {
        data: Object.values(categoryCount),
        backgroundColor: [
          "#17a2b8",
          "#6f42c1",
          "#dc3545",
          "#ffc107",
          "#20c997",
          "#6610f2",
        ],
        borderColor: "#fff",
        borderWidth: 2,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1200,
      easing: "easeOutQuart",
    },
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "#ccc",
          font: { size: 14 },
        },
      },
      title: {
        display: true,
        text: "Insight into your customer conversion journey.",
        font: { size: 18 },
        color: "#1a1515ff",
      },
    },
  };

  const getTopDebtors = (customers) =>
    customers
      .filter((c) => c.Debt && c.Debt > 0)
      .sort((a, b) => b.Debt - a.Debt)
      .slice(0, 5);

  return (
   <section className="sm:p-10 mx-auto max-w-6xl rounded bg-gray-100 backdrop-blur-md shadow-xl transition-all duration-700">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
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
            value: `₦${customers
              .filter((c) => c.Debt > 0)
              .reduce((acc, curr) => acc + curr.Debt, 0)
              .toLocaleString()}`,
            icon: < CalculatorIcon className="h-6 w-6 text-red-500" />,
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700 p-6 h-[400px] animate-fade-in">
          <Pie ref={pieRef} data={pieData} options={pieOptions} />
        </div>

        <div className="bg-white dark:bg-gray-900 shadow-md border border-gray-200 dark:border-gray-700 p-6 h-[400px] overflow-y-auto animate-fade-in">
          <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-4">
            Top 5 Debtors
          </h3>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {getTopDebtors(customers).length > 0 ? (
              getTopDebtors(customers).map((debtor) => (
                <li
                  key={debtor._id}
                  className="text-sm flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 rounded-md"
                >
                  <Image
                  height={40}
                  width={40}
                  quality={100}
                  loading="eager"
                  priority={true}
                    src={debtor.image || "https://img.icons8.com/glyph-neue/64/gender-neutral-user.png"}
                    alt={debtor.Username}
                    className="h-8 w-8 rounded-full shadow-sm"
                  />
                  <span className="text-gray-800 dark:text-white font-medium">
                    {debtor.Username}
                  </span>
                  <span className="text-red-600 text-sm font-semibold">
                    ₦{debtor.Debt.toLocaleString()}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-gray-500 dark:text-gray-400 py-4 text-center">
                No debtors to show
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Line Chart */}
      <div className="mt-12 h-[400px] animate-fade-in">
        {summarizeCustomerInvoices(customers, invoice)}
      </div>
    </section>
  );
}

function summarizeCustomerInvoices(customers, invoices) {
  const summarized = debtors.map((customer) => {
    // const customerInvoices = invoices.filter(
    //   (invoice) => invoice.customer === customer._id
    // );
    // const totalAmount = customerInvoices.reduce(
    //   (sum, invoice) => sum + invoice.grandTotal,
    //   0
    // );
    return {
      username: customer.Username,
      totalAmount:customer.Debt,
      image: customer.image || "https://img.icons8.com/glyph-neue/64/gender-neutral-user.png",
    };
  });

  const chartData = {
    labels: summarized.map((item) => item.username),
    datasets: [
      {
        label: "Total Amount",
        data: summarized.map((item) => item.totalAmount).reduce((acc, val, idx) => {
          acc.push((acc[idx - 1] || 0) + val);
          return acc;
        }, []),
        fill: true,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
        borderColor: "#38bdf8",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
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
            tooltipEl.style.background = "#1e293b";
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
              <img src="${imageUrl || "https://img.icons8.com/glyph-neue/64/gender-neutral-user.png"}" alt="${customer.username}" style="width:60px;height:auto;border-radius:4px;margin-top:4px;" />
              <div style="margin-top:6px;">Total: ₦${customer.totalAmount.toLocaleString()}</div>
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
