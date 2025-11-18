"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { FunnelIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import React, { Suspense } from "react";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import axios from "axios";
import { Dencrypt,Encrypt } from "../../../../../../../../Functions/Functions";
import moment from "moment"

export default function Page({ baseUrl, userData,VendorList,BanksList }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [billList, setBillList] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Suspense state

  const params = useParams();

  // Fetch bills from API
  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true); // Set loading to true before fetching
      try {
        const response = await axios.get(`${baseUrl}/api/Payables?page=${currentPage}&limit=100`, {
          headers: {
            "Content-Type": "application/json",
            dbConnect: `Bearer ${userData.business.rustyRoof}`,
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
          },
        });

        const data = await response.data;

        setBillList(Dencrypt(data.data) || []);
        setTotalPages(data.pagination.totalPages);
        setTotalInvoices(data.pagination.total);
        setCurrentPage(data.pagination.page);
      } catch (error) {
        // console.log(error.message)
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };

    fetchBills();
  }, [currentPage]);

  // filter vendor list for vendor names only
  const filteredVendors = (id) =>{
    try{
      const vendor = VendorList.find(vendor => {
        return vendor._id === id
      });
      return vendor ? vendor.Name : "";
    }catch(error){
      return ""
    }
  }

  // filter Banks BanksList
  const filteredBanksList = (id) =>{
    try{
      const Acc = BanksList.find(acc => {
        return acc._id === id
      });
      return Acc ? Acc.bankName : "";
    }catch(error){
      return ""
    }
  }

  return (
    <Suspense fallback={ <SuspenenseFallBack pagedata={'Account Payables'}/>}>
      <div className="text-white text-sm bg-gray-50">
        <div className="mx-auto">
          {/* Filter Component */}
          <div className="border border-white/10 p-4 shadow-xl">
            {/* Header */}
            <div className="border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Account Payables</h1>
            </div>
            <p className="text-gray-600">Showin {currentPage} of {totalPages} page</p>
          </div>

          {/* Table Container */}
          <div className="shadow-lg border border-white/10">
            {isLoading ? ( // Show loading fallback while data is being fetched
              <SuspenenseFallBack pagedata={'Account Payables'}/>
            ) : (
              <>
                <div className="min-h-screen bg-gray-50 p-6">
                  <table className="min-w-full text-sm bg-black rounded-lg shadow-md overflow-hidden">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                    <tr>
                    {["Ref No", "Vendor","Accountant", "Date", "Status", "Bank", "Amount"].map((header) => (
                     <th key={header} className="px-4 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    {header}
                    </th>
                   ))}
                  </tr>
                   </thead>
            
                    <tbody className="bg-gray-600 divide-y divide-gray-200">
                      {billList.map((bill) => {

                        return (
                          <tr key={bill._id} className="hover:bg-gray-700/50 transition-colors">
                          <td className="px-4 py-2 truncate">
                            <Link
                             href={`/${params.auth}/${params.Tenant}/${params.module}/${params.module}/vendorsPayment/vendorsPayment/${Encrypt(bill._id)}`}
                            className="text-indigo-400 hover:text-indigo-300 underline font-bold"
                            >
                            {bill?.billReferenceNo}
                            </Link>
                          </td>
                          <td className="px-4 py-2 truncate">{filteredVendors(bill.vendor)}</td>
                            <td className="px-4 py-2 truncate">{bill.AccountatntId}</td>
                          <td className="px-4 py-2 truncate">{moment(bill.PaymentDate).format("YYYY-MM-DD")}</td>
                          <td className="px-4 py-2 truncate">
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                              bill.ledgerStatus === "posted"
                              ? "bg-green-500/30 text-green-300"
                            : bill.ledgerStatus === "pending"
                            ? "bg-yellow-500/30 text-yellow-200"
                            : bill.ledgerStatus === "reversed"
                            ? "bg-red-500/30 text-red-300"
                            : "bg-gray-500/30 text-gray-300"
                            }`}
                            >
                            {bill.ledgerStatus || "N/A"}
                            </span>
                            </td>
                          <td className="px-4 py-2 truncate">{filteredBanksList(bill.bankAccount)}</td>
                          <td className="px-4 py-2 truncate font-medium">
                            ₦{bill.Amount?.toLocaleString() ?? '0'}
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
              </>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
}
