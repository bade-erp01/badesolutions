"use client"
import React, { useState } from 'react';

export default function Page({ data }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const payments = data?.Payments?.slice(0, 300).filter(
    (entry) => entry.cr && entry.status === "posted" && entry.collectionRef === "PMNT"
  ) || [];

  const customerList = data?.Customers || [];
  const Accounts = data?.Accounts || [];

  const totalPages = Math.ceil(payments.length / itemsPerPage);
  const paginatedPayments = payments?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const Getcustomer = (id) => {
    try {
      const customer = customerList.find(cust => cust._id.toString() === id.toString());
      return customer?.Username || "n/a";
    } catch (err) {
      return "n/a";
    }
  };

  const GetAccounts = (id) =>{
    try{
      const bank = Accounts.find(acc => acc._id.toString() === id.toString());
      return bank?.bankName || "n/a";
    }catch(err){
      return "n/a";
    }
  }
 
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Receivables</h1>
        <p className="text-gray-600">Showing {payments.length} most recent payments</p>
      </div>

      {/* Table */}
      <div className="bg-black rounded-lg shadow-md overflow-hidden">
        <div className="overflow-hidden w-full">
          <table className="w-full table-auto divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {["Ref No", "Customer", "Rep", "Accountant", "Type", "Status", "Date", "Bank", "CR"].map((header) => (
                  <th key={header} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-gray-600 divide-y divide-gray-200">
              {paginatedPayments.map((item) => (
                <tr key={item._id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-4 py-2 truncate">{item.paymentReferenceNo}</td>
                  <td className="px-4 py-2 truncate">{Getcustomer(item.customer)}</td>
                  <td className="px-4 py-2 truncate">
                    <span title={item.remarks}>{item.remarks?.slice(0, 8)}...</span>
                  </td>
                  <td className="px-4 py-2 truncate">{item.Accountant}</td>
                  <td className="px-4 py-2">
                    <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      {item.type}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="px-2 inline-flex text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 truncate">{new Date(item.PaymentDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 truncate">{GetAccounts(item.bankAccount)}</td>
                  <td className="px-4 py-2 font-medium">{item.crAmount.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 px-4 py-2 border rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:items-center sm:justify-between w-full">
            <p className="text-sm text-gray-700">
              Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
            </p>
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 border rounded-md text-sm ${
                    currentPage === i + 1
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
