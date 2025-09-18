"use client";

import { useState, useMemo } from "react";
import {useParams} from "next/navigation"
import Card from "@/app/Components/Card";

export default function PaymentListpage({ bank, Customers, Payments }) {
  const {auth, Tenant, module} = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const [accountId, setAccountId] = useState("");

  const CustomersList = useMemo(() => JSON.parse(Customers) || [], [Customers]);
  const PaymentList = useMemo(() => JSON.parse(Payments) || [], [Payments]);
  const Accountslist = useMemo(() => JSON.parse(bank) || [], [bank]);

  const itemsPerPage = 12;

  // 🔍 Filtered Payments
  const filteredPayments = useMemo(() => {
    return PaymentList.filter(payment => {
      const matchStatus = status ? payment.status === status : true;
      const matchCustomer = customerId ? payment.customer === customerId : true;
      const matchDate = paymentDate ? payment.PaymentDate === paymentDate : true;
      const matchAccount = accountId ? payment.bankAccount === accountId : true;
      return matchStatus && matchCustomer && matchDate && matchAccount;
    });
  }, [PaymentList, status, customerId, paymentDate, accountId]);

  // 📄 Paginated Payments
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const paginatedPayments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPayments.slice(start, start + itemsPerPage);
  }, [filteredPayments, currentPage]);

  return (
    <div className="space-y-6 ">
      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-4 items-center justify-between p-2 text-xs text-white bg-gray-500 shadow-sm">
      {/* Customer Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-white mb-1">Customer</label>
        <select
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="border bg-gray-700 text-white border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="">All Customers</option>
          {CustomersList.map(customer => (
            <option key={customer._id} value={customer._id}>
              {customer.Username || customer.customer_code}
            </option>
          ))}
        </select>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-white mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-700 text-white"
        >
          <option value="">All Statuses</option>
          <option value="posted">Posted</option>
          <option value="pending">Pending</option>
          <option value="Reversed">Reversed</option>
        </select>
      </div>

      {/* Account Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-white mb-1">Account</label>
        <select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-700 text-white"
        >
          <option value="">All Accounts</option>
          {Accountslist.map(account => (
            <option key={account._id} value={account._id}>
              {account.NAME || account.bankCode}
            </option>
          ))}
        </select>
      </div>

      {/* Date Filter */}
      <div className="flex flex-col">
        <label className="text-sm font-medium text-white mb-1">Payment Date</label>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="border border-gray-300 px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400 bg-gray-700 text-white"
        />
      </div>

      {/* Reset Button */}
      <div className="flex items-end">
        <button
          onClick={() => {
            setStatus("");
            setCustomerId("");
            setPaymentDate("");
            setAccountId("");
            setCurrentPage(1);
          }}
          className="mt-6 bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition"
        >
          Reset Filters
        </button>
      </div>
    </div>

      {/* 🧾 Payment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {paginatedPayments.length > 0 ? (
          paginatedPayments.map(payment => (
            <Card key={payment._id} data={payment} module={`${module}`} />
          ))
        ) : (
          <p className="text-center col-span-full">No payments found.</p>
        )}
      </div>

      {/* 📄 Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button
          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-400 text-xs"
        >
          Prev
        </button>
        <span  className="text-black text-xs ">{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-400 rounded hover:bg-gray-400 text-xs"
        >
          Next
        </button>
      </div>
    </div>
  );
}
