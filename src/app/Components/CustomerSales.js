import React, { useState, useMemo } from 'react';
import moment from 'moment';
import { saveAs } from 'file-saver';

const ITEMS_PER_PAGE = 10;

const ScheduledActivity = ({ Sales,customer,business,Rep }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);


  const PriceList = (customersPriceList) => {
      const normalizedKey = customersPriceList?.toLowerCase();

      const priceMap = {
        pricelist1: business.priceList1,
        pricelist2: business.priceList2,
        pricelist3: business.priceList3,
        pricelist4: business.priceList4,
        pricelist5: business.priceList5,
        pricelist6: business.priceList6,
        pricelist7: business.priceList7,
      };

      return priceMap[normalizedKey] || null;
    };

    // find sale person and manager
    const SaleRep = (id) => {
      const salesRep = Rep.find(person => person._id === id);
      return salesRep?.firstName && salesRep?.lastName
        ? `${salesRep.firstName} ${salesRep.lastName}`
        : "N/A";
    };


  // Filtered and searched data
  const filteredSales = useMemo(() => {
    return Sales.filter((inv) => {
      const matchesSearch =
        inv.billReferenceNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.Username?.toLowerCase().includes(searchTerm.toLowerCase());

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
    const headers = ['Ref No', 'Status', 'Date', 'Customer',"State","Region",'Address',"Rep","Manager","Machadizer", 'Product','Sys-Code','Promo','Promo Total','FOC','Trace','Batch','Category', 'Qty', 'Pcs','Vat',"Dis Allowed","PriceList", 'Price', 'Total','Month','Year'];
    const rows = filteredSales.flatMap((inv) =>
      inv.orders?.map((order) => [
      inv.billReferenceNo,
      inv.billStatus,
      moment(inv.startDate).format('YYYY-MM-DD'),
      customer.Username,
      customer.State,
      customer.Region,
      customer.billingAddress || customer.street,
      SaleRep(inv.salesPerson),
      SaleRep(customer.Manager),
      customer.Merchandiser,
      order.item.Name,
      order.item.ACDcode || order.item.ADCcode,
      order.promotionData,
      (order.promotionData || 0) * (order.Qty || 0),
      order.item.isAservice,
      order.returnId,
      order.BatchId,
      order.item.category,
      order.Qty,
      order.pcsReq,
      order.vat || 0,
      inv.discount,
      PriceList(inv.priceList),
      order.priceListPrice,
      order.total,
      moment(inv.startDate).format("MMM"), // short month (e.g. "Dec") const
      moment(inv.startDate).format("YYYY") 
      ]) || []
    );

    const csvContent =
      [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${customer.Username} dump.csv`);
  };

  return (
    <section className=" text-xs">
     
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <input
          type="search"
          placeholder="Search INV No"
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
          <table className="min-w-full text-sm">
            <tbody className="divide-y divide-gray-200 text-xs">
          {paginatedSales.map((inv, idx) => (
           <React.Fragment key={idx}>
              <details className="rounded-lg shadow overflow-x-auto text-xs">
                <summary className="px-2 py-2 cursor-pointer  ">
                   {inv.billStatus.toUpperCase().slice(0, 3)}/{inv.billReferenceNo} - [{moment(inv.startDate).format('MMM D, YYYY')}] - {inv.grandTotal.toLocaleString()}
                </summary>
                <tr>
                  <td colSpan="4" className="px-4 py-2 ">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {inv.orders?.map((order, orderIdx) => (
                        <div key={orderIdx} className="border p-2 rounded hover:border-purple-300 text-xs">
                          <p className=''><strong>Product:</strong> {order.item.Name}</p>
                          <h4 className="font-semibold mb-2">Case: {order.Qty}, Pcs: {order.pcsReq}</h4>
                          <h4 className="font-semibold mb-2">Sold @: {order.priceListPrice?.toLocaleString()}</h4>
                          <h4 className="font-semibold mb-2">Total: {order.total?.toLocaleString()}</h4>
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
      <div className="flex justify-between items-center mt-4 text-sm ">
        <span
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          ← Prev
        </span>
        <span>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <span
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next →
        </span>
        <span
          onClick={exportToCSV}
          className="ml-4 px-4 py-1 text-white rounded"
        >
          Export dump CSV
        </span>
      </div>
    </section>
  );
};

export default ScheduledActivity;
