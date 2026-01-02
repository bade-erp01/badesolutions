"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Encrypt } from "../../../../../../Functions/Mics";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import axios from "axios";

export default function InvoiceLandingPage({ baseUrl, userData }) {
  const [searchRef, setSearchRef] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [billList, setBillList] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();
  const itemsPerPage = 20;

  // Fetch bills from API
  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          page: currentPage,
          itemsPerPage,
          searchRef,
          startDate,
          endDate,
        }).toString();

        const response = await axios.get(`${baseUrl}/api/Invoice?${query}`, {
          headers: {
            "Content-Type": "application/json",
            dbConnect: `Bearer ${userData.business.rustyRoof}`,
            Authorization: `Bearer ${userData.business.tenantId}`,
          },
        });

        const data = await response.data;

        setBillList(data.invoices || []);
        setTotalPages(data.totalPages);
        setTotalInvoices(data.totalInvoices);
        setCurrentPage(data.currentPage);
      } catch (error) {

      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [currentPage, searchRef, startDate, endDate]);

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Invoice List"} />}>
      <div className="text-white text-xs">
        <div className="mx-auto">
          {/* Filter Component */}
          <div className="border border-white/10 bg-gray-200 p-4 shadow-sm">
            <div className="border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-600">Invoice Management</h1>
            </div>
          </div>

          {/* Table Container */}
            {isLoading ? (
              <SuspenenseFallBack pagedata={"Invoice List"} />
            ) : billList.length > 0 ? (
              <div className="bg-white rounded p-3 shadow-md animate__animated animate__fadeInUp animate__faster">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead className="bg-gray-100 text-gray-900 uppercase text-xs sticky top-0 z-10">
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
                      {billList.map((bill) => {
                        const url =
                          bill.billStatus?.toLowerCase() === "draft"
                            ? `/${params.auth}/${params.Tenant}/${params.module}/Forms/invoice/${Encrypt(bill._id)}`
                            : `/${params.auth}/${params.Tenant}/bill/bill/${Encrypt(bill._id)}`;

                        return (
                          <tr
                            key={bill._id}
                            className="transition text-xs text-gray-400 hover:bg-gray-300 hover:text-black"
                          >
                            <td className="px-4 py-3 border-t border-white/10">
                              <Link
                                href={url}
                                className="text-indigo-400 hover:text-indigo-300 underline font-bold"
                              >
                                {bill?.billReferenceNo && bill?.invoicelocation
                                  ? `${bill.billReferenceNo}/${bill.invoicelocation}`
                                  : "View Draft"}
                              </Link>
                            </td>
                            <td className="px-4 py-3 border-t border-white/10 italic font-semibold">{bill.customerName}</td>
                            <td className="px-4 py-3 border-t border-white/10">{bill.startDate}</td>
                            <td className="px-4 py-3 border-t border-white/10">{bill.RaiseBy}</td>
                            <td className="px-4 py-3 border-t border-white/10">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs rounded-full text-gray-600 ${
                                  bill.billStatus === "Invoice"
                                    ? "bg-green-500/30"
                                    : bill.billStatus === "Order"
                                    ? "bg-yellow-500/30"
                                    : bill.billStatus === "Cancelled"
                                    ? "bg-red-500/30"
                                    : bill.billStatus === "Processing"
                                    ? "bg-purple-500/30 text-white"
                                    : "bg-gray-500/30 "
                                }`}
                              >
                                {bill.billStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3 border-t border-white/10 text-right font-bold">
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
                      className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30"
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30"
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-black font-bold">No invoices found</div>
            )}
        </div>
      </div>
    </Suspense>
  );
}
