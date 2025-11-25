"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import moment from "moment";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import { Dencrypt, Encrypt } from "../../../../../../../../Functions/Functions";

export default function Page({ baseUrl, userData, VendorList, BanksList }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [billList, setBillList] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const params = useParams();

  // Fetch bills from API
  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${baseUrl}/api/Payables?page=${currentPage}&limit=100`,
          {
            headers: {
              "Content-Type": "application/json",
              dbConnect: `Bearer ${userData.business.rustyRoof}`,
              Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            },
          }
        );

        const data = response.data;
        setBillList(Dencrypt(data.data) || []);
        setTotalPages(data.pagination.totalPages);
        setTotalInvoices(data.pagination.total);
        // ❌ don’t reset currentPage here, it’s already tracked
      } catch (error) {
        console.error("Error fetching bills:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [currentPage, baseUrl, userData]);

  // filter vendor list for vendor names only
  const filteredVendors = (id) => {
    try {
      const vendor = VendorList.find((vendor) => vendor._id === id);
      return vendor ? vendor.Name : "";
    } catch {
      return "";
    }
  };

  // filter Banks BanksList
  const filteredBanksList = (id) => {
    try {
      const acc = BanksList.find((acc) => acc._id === id);
      return acc ? acc.bankName : "";
    } catch {
      return "";
    }
  };

  return (
    <div className="text-sm bg-gray-50 min-h-screen">
      <div className="mx-auto">
        {/* Header */}
        <div className="border border-gray-200 p-4 shadow-xl bg-white">
          <div className="border-b pb-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Account Payables</h1>
          </div>
          <p className="text-gray-600">
            Showing page {currentPage} of {totalPages} ({totalInvoices})
          </p>
        </div>

        {/* Table Container */}
        <div className="shadow-lg border border-gray-200 bg-white">
          {isLoading ? (
            <SuspenenseFallBack pagedata={"Account Payables"} />
          ) : billList.length > 0 ? (
            <>
              <div className="p-6">
                <table className="min-w-full text-sm rounded-lg shadow-md overflow-hidden">
                  <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                      {[
                        "Ref No",
                        "Vendor",
                        "Accountant",
                        "Date",
                        "Status",
                        "Bank",
                        "Amount",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-200">
                    {billList.map((bill) => (
                      <tr
                        key={bill._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 truncate">
                          <Link
                            href={`/${params.auth}/${params.Tenant}/${params.module}/${params.module}/vendorsPayment/vendorsPayment/${Encrypt(
                              bill._id
                            )}`}
                            className="text-indigo-600 hover:text-indigo-400 underline font-bold"
                          >
                            {bill?.billReferenceNo}
                          </Link>
                        </td>
                        <td className="px-4 py-2 truncate">
                          {filteredVendors(bill.vendor)}
                        </td>
                        <td className="px-4 py-2 truncate">{bill.AccountatntId}</td>
                        <td className="px-4 py-2 truncate">
                          {moment(bill.PaymentDate).format("YYYY-MM-DD")}
                        </td>
                        <td className="px-4 py-2 truncate">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                              bill.ledgerStatus === "posted"
                                ? "bg-green-100 text-green-700"
                                : bill.ledgerStatus === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : bill.ledgerStatus === "reversed"
                                ? "bg-red-100 text-red-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {bill.ledgerStatus || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-2 truncate">
                          {filteredBanksList(bill.bankAccount)}
                        </td>
                        <td className="px-4 py-2 truncate font-medium">
                          ₦{bill.Amount?.toLocaleString() ?? "0"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center px-4 py-3 border-t border-gray-200 bg-gray-50">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30"
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-30"
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          ) : (
            <p className="p-6 text-gray-600">Nothing to show</p>
          )}
        </div>
      </div>
    </div>
  );
}
