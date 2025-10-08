"use client"
import React, { useState } from 'react';

export default function Page({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 100;

  const payments = data?.Payments.filter((entry)=> entry.cr && entry.status ==="posted" && entry.collectionRef ==="PMNT") || [];
  const customerList = data?.Customers || []
  // Filter by search term and date range
  const filteredPayments = payments.filter((item) => {
    const matchesSearch = item.paymentReferenceNo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const paymentDate = new Date(item.PaymentDate);
    const isAfterStart = startDate ? paymentDate >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? paymentDate <= new Date(endDate) : true;

    return matchesSearch && isAfterStart && isBeforeEnd;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const Getcustomer = (id)=>{
    try{
      const customer = customerList.find(cust =>{
        return cust._id.toString() === id.toString()
      })
      return customer.Username || "n/a"
    }catch(err){

    }
  }

  return (
    <div className="p-4 bg-gray-100">
      {/* Filters */}
      <div className=" flex flex-wrap gap-4 items-center bg-gray-500 p-1">
        <input
          type="text"
          placeholder="Search Reference No"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border px-3 py-2 rounded w-60"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <span>to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
      </div>

      {/* Table */}
      <table className="min-w-full text-xs border border-gray-300 mb-4">
        <thead className="bg-gray-500">
          <tr>
            <th className="px-4 py-2 border">Ref No</th>
            <th className="px-4 py-2 border">Customer</th>
            <th className="px-4 py-2 border">Rep</th>
            <th className="px-4 py-2 border">Accountant</th>
            <th className="px-4 py-2 border">Type</th>
            <th className="px-4 py-2 border">Status</th>
            <th className="px-4 py-2 border">Date</th>
            <th className="px-4 py-2 border">Bank</th>
            <th className="px-4 py-2 border">CR</th>
          </tr>
        </thead>
        <tbody className='text-xs'>
          {paginatedPayments.map((item) => (
            <tr key={item._id} className="text-sm text-gray-700">
              <td className="px-4 py-2 border text-xs">{item.paymentReferenceNo}</td>
              <td className="px-4 py-2 border text-xs">{Getcustomer(item.customer)}</td>
              <td className="px-4 py-2 border text-xs" title={item.remarks}>{item.remarks.slice(0,8)}...</td>
              <td className="px-4 py-2 border text-xs">{item.Accountant}</td>
              <td className="px-4 py-2 border text-xs">{item.type}</td>
              <td className="px-4 py-2 border text-xs">{item.status}</td>
              <td className="px-4 py-2 border text-xs">{item.PaymentDate}</td>
              <td className="px-4 py-2 border text-xs">{item.bankAccount}</td>
              <td className="px-4 py-2 border text-xs">{item.crAmount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded bg-gray-800 hover:bg-gray-300"
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 border rounded text-black ${
              currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded bg-gray-800 hover:bg-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}
