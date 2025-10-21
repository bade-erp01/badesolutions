import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { saveAs } from 'file-saver';

const ITEMS_PER_PAGE = 10;

const ScheduledActivity = ({ Sales,customerName }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered and searched data
  const filteredSales = useMemo(() => {
    return Sales.filter((inv) => {
      const matchesSearch =
        inv.billReferenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter ? inv.billStatus === statusFilter : true;

      const invoiceDate = moment(inv.startDate);
      const matchesDate =
        (!startDate || invoiceDate.isSameOrAfter(moment(startDate))) &&
        (!endDate || invoiceDate.isSameOrBefore(moment(endDate)));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [Sales, searchTerm, statusFilter, startDate, endDate]);

  const totalPages = Math.ceil(filteredSales.length / ITEMS_PER_PAGE);
  const paginatedSales = filteredSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const exportToCSV = () => {
    const headers = ['INV No', 'Status', 'Date', 'Total'];
    const rows = filteredSales.map((inv) => [
      inv.billReferenceNo,
      inv.billStatus,
      moment(inv.startDate).format('YYYY-MM-DD'),
      inv.grandTotal
    ]);

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${customerName}.csv`);
  };

  return (
    <section className="max-w-6xl mx-auto p-4 text-xs">
     
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="search"
          placeholder="Search INV No or Customer"
          className="px-3 py-2 border rounded w-full"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="px-3 py-2 border rounded w-full"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Invoice">Invoice</option>
          <option value="Order">Order</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input
          type="date"
          className="px-3 py-2 border rounded w-full"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="px-3 py-2 border rounded w-full"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Table */}
          <table className="min-w-full text-sm text-gray-700">
            <tbody className="divide-y divide-gray-200 text-xs">
          {paginatedSales.map((inv, idx) => (
           <React.Fragment key={idx}>
              <details className="bg-white rounded-lg shadow overflow-x-auto text-xs">
                <summary className="px-2 py-2 cursor-pointer hover:bg-gray-50 ">
                    {inv.billReferenceNo} - [{moment(inv.startDate).format('MMM D, YYYY')}] - {inv.grandTotal.toLocaleString()}
                </summary>
                <tr>
                  <td colSpan="4" className="px-4 py-2 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {inv.orders?.map((order, orderIdx) => (
                        <div key={orderIdx} className="border p-2 rounded hover:border-purple-300 hover:bg-white text-xs">
                          <p className='text-purple-800'><strong>Product:</strong> {order.item.Name}</p>
                          <h4 className="font-semibold mb-2">Case: {order.Qty}, Pcs: {order.pcsReq}</h4>
                          <h4 className="font-semibold mb-2">Sold @: {order.priceListPrice.toLocaleString()}</h4>
                          <h4 className="font-semibold mb-2">Total: {order.total.toLocaleString()}</h4>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              </details>
            </React.Fragment>
          ))}
            </tbody>
          </table>

        {/* Pagination + Export */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          ← Prev
        </span>
        <span>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <span
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-white border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          Next →
        </span>
        <span
          onClick={exportToCSV}
          className="ml-4 px-4 py-1 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Export CSV
        </span>
      </div>
    </section>
  );
};

export default ScheduledActivity;
