import React, { useMemo, useState } from 'react';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import moment from 'moment';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
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
  Invoice: 'rgba(34,197,94,0.6)',     // green
  Order: 'rgba(234,179,8,0.6)',       // yellow
  Cancelled: 'rgba(239,68,68,0.6)',   // red
  Unknown: 'rgba(107,114,128,0.6)'    // gray
};

const MySwal = withReactContent(Swal);

const DashboardCharts = ({ invoices, triggerButton = true }) => {
  const [selectedYear, setSelectedYear] = useState('All');
  const [showModal, setShowModal] = useState(false);

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

  // Modal content as a React node
  const modalContent = (
    <div style={{ padding: '1.5rem', fontFamily: 'Segoe UI, sans-serif', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)', borderRadius: 16, minWidth: 320, maxWidth: 900 }}>
      <h2 style={{ textAlign: 'center', fontWeight: 700, fontSize: 24, marginBottom: 24, color: '#4f46e5', letterSpacing: 1 }}>📊 Sales Dashboard</h2>
      {/* KPI Cards */}
      <div className="flex flex-wrap justify-center gap-6 mb-8">
        <div className="bg-white shadow-lg rounded-xl p-6 w-64 text-center border-t-4 border-green-400">
          <div className="text-sm text-gray-500 font-medium">Total Margin</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">₦{totalMargin.toLocaleString()}</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 w-64 text-center border-t-4 border-blue-400">
          <div className="text-sm text-gray-500 font-medium">Total Invoices</div>
          <div className="text-2xl font-bold text-gray-800 mt-2">{totalInvoices}</div>
        </div>
        <div className="bg-white shadow-lg rounded-xl p-6 w-64 text-center border-t-4 border-red-400">
          <div className="text-sm text-gray-500 font-medium">Cancelled Rate</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{cancelledRate}%</div>
        </div>
      </div>
      {/* Year Filter */}
      <div className="mb-6 text-center">
        <label htmlFor="year-select" className="text-sm font-medium text-gray-600 mr-2">Filter by Year:</label>
        <select
          id="year-select"
          value={selectedYear}
          onChange={e => setSelectedYear(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {availableYears.map(year => (
            <option className='text-black' key={year} value={year}>{year}</option>
          ))}
        </select>
      </div>
      {/* Charts */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
        alignItems: 'stretch'
      }}>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef', padding: 16, height: 340 }}>
          <h3 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '0.5rem', color: '#333' }}>Sales Margin by Year & Status</h3>
          <Bar data={filteredMarginData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } },
            scales: { x: { stacked: true }, y: { stacked: true } }
          }} height={260} />
        </div>
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #e0e7ef', padding: 16, height: 340 }}>
          <h3 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '0.5rem', color: '#333' }}>Invoice Status Distribution</h3>
          <Doughnut data={donutData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom' } }
          }} height={260} />
        </div>
      </div>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 2px 8px #e0e7ef',
        padding: 16,
        maxWidth: 900,
        margin: '0 auto',
        height: 340
      }}>
        <h3 style={{ textAlign: 'center', fontSize: '1rem', marginBottom: '0.5rem', color: '#333' }}>YoY Sales Trend</h3>
        <Line data={areaData} options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } }
        }} height={260} />
      </div>
    </div>
  );

  // Show modal handler
  const showDashboardModal = () => {
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
      didOpen: () => setShowModal(true),
      willClose: () => setShowModal(false),
    });
  };

  // Optionally render a trigger button
  return (
    <>
      {triggerButton && (
        <button
          onClick={showDashboardModal}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition text-lg font-semibold mb-6"
        >
          View Sales Dashboard
        </button>
      )}
      {/* Optionally render the dashboard inline if not using modal */}
      {!triggerButton && modalContent}
    </>
  );
};

export default DashboardCharts;
