"use client";

import { useState } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { Encrypt } from "../../../../../../Functions/Mics";
import { FunnelIcon, FolderOpenIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";

export default function InvoiceLandingPage({ billList, userData }) {
  const [searchRef, setSearchRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const bills = billList;
  const params = useParams();
  const itemsPerPage = 10;

  const filteredBills = bills.filter((bill) => {
    const statusMatch = !searchRef || bill.billStatus === searchRef;
    const dateMatch =
      (!startDate || new Date(bill.startDate) >= new Date(startDate)) &&
      (!endDate || new Date(bill.startDate) <= new Date(endDate));
    return statusMatch && dateMatch;
  });

  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="text-white text-xs">
      <div className=" mx-auto">
        {/* Filter Component */}
        <div className="border border-white/10 bg-gradient-to-br from-[#1a1a1f] to-[#111114] p-4 shadow-xl">
         {/* Header */}
        <div className="border-b pb-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-200">Invoice Management</h1>
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Status Dropdown */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-white/70 mb-1">
                <FunnelIcon className="w-4 h-4 inline-block" /> Filter By
              </label>
              <select
                className="bg-[#1f1f24] text-white border border-white/30 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                value={searchRef}
                onChange={(e) => {
                  setSearchRef(e.target.value); 
                  setCurrentPage(1);
                }}
              >
                <option value="">All</option>
                <option value="Invoice">Invoice</option>
                <option value="Order">Order</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            {/* Start Date */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-white/70 mb-1">
                <CalendarDaysIcon className="w-4 h-4 inline-block" /> Start Date
              </label>
              <input
                type="date"
                className="bg-[#1f1f24] text-white border border-white/30 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col">
              <label className="text-xs font-medium text-white/70 mb-1">
                <CalendarDaysIcon className="w-4 h-4 inline-block" /> End Date
              </label>
              <input
                type="date"
                className="bg-[#1f1f24] text-white border border-white/30 rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-gray-600 shadow-lg border border-white/10">
          <div className="overflow-x-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-white/10 text-white uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left">Ref No</th>
                  <th className="px-4 py-3 text-left">Customer</th>
                  <th className="px-4 py-3 text-left">Order Date</th>
                  <th className="px-4 py-3 text-left">Raised By</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBills.map((bill) => {
                  const url =
                    bill.billStatus?.toLowerCase() === "draft"
                      ? `/${params.auth}/${params.Tenant}/${params.module}/Forms/invoice/${Encrypt(bill._id)}`
                      : `/${params.auth}/${params.Tenant}/bill/bill/${Encrypt(bill._id)}`;

                  return (
                    <tr key={bill._id} className="hover:bg-white/5 transition text-xs">
                      <td className="px-4 py-3 border-t border-white/10">
                        <Link
                          href={url}
                          className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                        >
                          {bill?.billReferenceNo && bill?.invoicelocation
                            ? `${bill.billReferenceNo}/${bill.invoicelocation}`
                            : "View Draft"}
                        </Link>
                      </td>
                      <td className="px-4 py-3 border-t border-white/10">{bill.customerName}</td>
                      <td className="px-4 py-3 border-t border-white/10">{bill.startDate}</td>
                      <td className="px-4 py-3 border-t border-white/10">{bill.RaiseBy}</td>
                      <td className="px-4 py-3 border-t border-white/10">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                            bill.billStatus === "Invoice"
                              ? "bg-green-500/30 text-green-300"
                              : bill.billStatus === "Order"
                              ? "bg-yellow-500/30 text-yellow-200"
                              : bill.billStatus === "Cancelled"
                              ? "bg-red-500/30 text-red-300"
                              : "bg-gray-500/30 text-gray-300"
                          }`}
                        >
                          {bill.billStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 border-t border-white/10 text-right">
                        ₦{bill.grandTotal.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center px-4 py-3 border-t border-white/10 bg-[#121216]">
            <span className="text-sm text-white/60">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>

          <ExcelDownloadBtn data={filteredBills} page={"Invoice"} />
        </div>
      </div>
    </div>
  );
}
