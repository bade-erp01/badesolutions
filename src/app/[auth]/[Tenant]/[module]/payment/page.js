"use client";

import { useEffect, useState } from "react";
import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Card from "@/app/Components/Card";

export default function PaymentListpage({ params }) {
  const [paymentList, setPaymentList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [paymentDate, setPaymentDate] = useState("");
  const itemsPerPage = 9;

  const fetchData = async () => {
    const userData = await fetchUser();
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

    const queryParams = new URLSearchParams({
      page: currentPage.toString(),
      limit: itemsPerPage.toString(),
      ...(status && { status }),
      ...(customerId && { customer: customerId }),
      ...(paymentDate && { PaymentDate: paymentDate }),
    });

    const res = await fetch(`${baseUrl}/api/cashRegister?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${userData.business.tenantId}`
      }
    });

    const data = await res.json();
    setPaymentList(data.items || []);
    setTotalPages(data.totalPages || 1);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, status, customerId, paymentDate]);

  return (
    <div className="space-y-6">
      {/* 🔍 Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <input
          type="text"
          placeholder="Customer ID"
          value={customerId}
          onChange={(e) => setCustomerId(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="">All Statuses</option>
          <option value="posted">Posted</option>
          <option value="pending">Pending</option>
          <option value="failed">Reversed</option>
        </select>
        <input
          type="date"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <button
          onClick={() => {
            setStatus("");
            setCustomerId("");
            setPaymentDate("");
            setCurrentPage(1);
          }}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
        >
          Reset Filters
        </button>
      </div>

      {/* 🧾 Payment Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
        {paymentList.length > 0 ? (
          paymentList.map(payment => (
            <Card key={payment._id} data={payment} module={`${params.module}`} />
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
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Previous
        </button>
        <span>{`Page ${currentPage} of ${totalPages}`}</span>
        <button
          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>
    </div>
  );
}
