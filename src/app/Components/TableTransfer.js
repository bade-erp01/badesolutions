"use client";
import React, { useState } from "react";

const ITEMS_PER_PAGE = 10;

export default function TransferTable({ TransfersList }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Filter logic
  const filteredTransfers = TransfersList.filter((transfer) => {
    const matchesSearch =
      transfer.billReferenceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transfer.to.toLowerCase().includes(searchTerm.toLowerCase());

    const transferDate = new Date(transfer.transferedDate);
    const matchesDate =
      (!startDate || transferDate >= new Date(startDate)) &&
      (!endDate || transferDate <= new Date(endDate));

    return matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredTransfers.length / ITEMS_PER_PAGE);
  const paginatedTransfers = filteredTransfers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      {/* Search & Filter Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-gray-900 p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Search by product or warehouse..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="px-4 py-2 rounded bg-gray-800 text-white border border-gray-600 w-full md:w-1/3"
        />
        <div className="flex gap-2 items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700 bg-gradient-to-br from-gray-900 to-gray-800 text-white">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Product</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">From Warehouse</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">To Warehouse</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {paginatedTransfers.map((transfer, index) => (
              <tr key={index} className="hover:bg-gray-700 transition duration-200">
                <td className="px-6 py-4 text-sm">{transfer.billReferenceNo}</td>
                <td className="px-6 py-4 text-sm">{transfer.from}</td>
                <td className="px-6 py-4 text-sm">{transfer.to}</td>
                <td className="px-6 py-4 text-sm">{transfer.orders.length}</td>
                <td className="px-6 py-4 text-sm">
                  {new Date(transfer.transferedDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex justify-between items-center px-6 py-4 bg-gray-900 text-gray-300">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
