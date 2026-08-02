"use client"

import React, { useMemo, useState, useEffect } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import moment from 'moment';
import Swal from 'sweetalert2';
import { CursorArrowRaysIcon } from "@heroicons/react/24/outline";
import withReactContent from 'sweetalert2-react-content';
import { plsWait, ErrorMessage, Encrypt } from '../../../Functions/Mics';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { useUser } from "@/components/UserProvider";


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const statusColors = {
  Invoice: 'rgba(34,197,94,0.6)',
  Order: 'rgba(234,179,8,0.6)',
  Cancelled: 'rgba(239,68,68,0.6)',
  Unknown: 'rgba(107,114,128,0.6)'
};

const MySwal = withReactContent(Swal);

const DashboardCharts = ({ business, baseUrl, triggerButton = true }) => {
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const {user} = useUser();

  const fetchData = async () => {
    try {
      setLoading(true);
      plsWait("Loading Report Data...");
      const res = await fetch(`${baseUrl}/api/Invoice/report`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(user.business.tenantId)}`,
          access: `Bearer ${Encrypt(user.user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`
        },
      });

      if (!res.ok) throw new Error("Failed to fetch product data");

      const fetchedData = await res.json();
      // set invoices then trigger showing modal (useEffect will open modal after render)
      setInvoices(fetchedData.invoices || []);
      setShowModal(true);
      setLoading(false);
    } catch (error) {
      ErrorMessage(error.message);
      setLoading(false);
    }
  };

  // If component is rendered directly (no trigger button), fetch on mount
  useEffect(() => {
    if (!triggerButton) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    marginByYearStatus,
    yoySales,
    statusCount,
    totalMargin,
    totalInvoices,
    cancelledRate,
    availableYears
  } = useMemo(() => {
    const marginByYearStatus = {};
    const totalByYear = {};
    const statusCount = {};
    let totalMargin = 0;
    let totalInvoices = invoices.length;
    let cancelledCount = 0;

    invoices.forEach(inv => {
      const year = moment(inv.startDate).year();
      const status = inv.billStatus || 'Unknown';
      const margin = (inv.grandTotal || 0) - (inv.subTotal || 0);

      if (!marginByYearStatus[year]) marginByYearStatus[year] = {};
      if (!marginByYearStatus[year][status]) marginByYearStatus[year][status] = 0;
      marginByYearStatus[year][status] += margin;

      if (!totalByYear[year]) totalByYear[year] = 0;
      totalByYear[year] += inv.grandTotal || 0;

      statusCount[status] = (statusCount[status] || 0) + 1;
      totalMargin += margin;
      if (status === 'Cancelled') cancelledCount++;
    });

    const sortedYears = Object.keys(totalByYear).sort();
    const yoySales = sortedYears.map((year, i) => {
      const current = totalByYear[year];
      const prev = sortedYears[i - 1] ? totalByYear[sortedYears[i - 1]] : null;
      const yoy = prev && prev !== 0 ? ((current - prev) / prev) * 100 : 0;
      return { year, yoy: parseFloat(yoy.toFixed(2)) };
    });

    const cancelledRate = totalInvoices ? ((cancelledCount / totalInvoices) * 100).toFixed(1) : 0;

    return {
      marginByYearStatus,
      yoySales,
      statusCount,
      totalMargin,
      totalInvoices,
      cancelledRate,
      availableYears: ['All', ...sortedYears]
    };
  }, [invoices]);

  const filteredMarginData = useMemo(() => {
    const years = selectedYear === 'All' ? Object.keys(marginByYearStatus) : [selectedYear];
    const statuses = Object.keys(statusColors);

    return {
      labels: years,
      datasets: statuses.map(status => ({
        label: status,
        data: years.map(year => marginByYearStatus[year]?.[status] || 0),
        backgroundColor: statusColors[status]
      }))
    };
  }, [selectedYear, marginByYearStatus]);

  const donutData = {
    labels: Object.keys(statusCount),
    datasets: [{
      data: Object.values(statusCount),
      backgroundColor: Object.keys(statusCount).map(status => statusColors[status] || statusColors.Unknown)
    }]
  };

  const areaData = {
    labels: yoySales.map(d => d.year),
    datasets: [{
      label: 'YoY Sales (%)',
      data: yoySales.map(d => d.yoy),
      borderColor: '#7D5BA6',
      backgroundColor: 'rgba(125,91,166,0.2)',
      fill: true,
      tension: 0.3
    }]
  };

  const modalContent = (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="p-6 bg-gradient-to-br from-slate-100 to-indigo-50 shadow-xl max-w-6xl mx-auto"
    >
      <h2 className="text-center font-bold text-2xl mb-6 text-gray-600 tracking-wide"> Sales Dashboard</h2>

      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div className="bg-white shadow-md rounded-xl p-6 w-64 text-center border-t-4 border-green-400">
          <div className="text-sm text-gray-500">Total Margin</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">₦{totalMargin.toLocaleString()}</div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 w-64 text-center border-t-4 border-blue-400">
          <div className="text-sm text-gray-500">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">{totalInvoices < 1000 ? totalInvoices : `+${totalInvoices}k`}</div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-6 w-64 text-center border-t-4 border-red-400">
          <div className="text-sm text-gray-500">Cancelled Rate</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{cancelledRate}%</div>
        </div>
      </div>

      <div className="mb-6 text-center">
        <label htmlFor="year-select" className="text-sm font-medium text-gray-600 mr-2">Filter by Year:</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {availableYears.map(year => (
            <option key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-md p-4 h-[340px]">
          <h3 className="text-center text-lg font-semibold mb-2 text-gray-700">Sales Margin by Year & Status</h3>
          <Bar data={filteredMarginData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { x: { stacked: true }, y: { stacked: true } }
          }} height={260} />
        </div>
        <div className="bg-white rounded-xl shadow-md p-4 h-[340px]">
          <h3 className="text-center text-lg font-semibold mb-2 text-gray-700">Invoice Status Distribution</h3>
          <Doughnut data={donutData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }} height={260} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 h-[340px]">
        <h3 className="text-center text-lg font-semibold mb-2 text-gray-700">YoY Sales Trend</h3>
        <Line data={areaData} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }} height={260} />
      </div>
    </motion.div>
  );

  // Open sweetalert modal after render when showModal becomes true (so modalContent uses updated state)
  useEffect(() => {
    if (!showModal) return;

    MySwal.fire({
      html: modalContent,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'swal2-dashboard-modal',
        htmlContainer: 'swal2-dashboard-html',
      },
      width: '100vw',
      padding: 0,
      background: 'transparent',
      didOpen: () => {
        // modal already opening; no-op
      },
      willClose: () => setShowModal(false),
    });
    // close handler: when user closes, willClose sets showModal false
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showModal, modalContent]);

  return (
    <>
      {triggerButton && (
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
        >
          <CursorArrowRaysIcon className="h-6 w-6 " />
          View Sales Dashboard
        </button>
      )}
      {!triggerButton && modalContent}
    </>
  );
};

export default DashboardCharts;
