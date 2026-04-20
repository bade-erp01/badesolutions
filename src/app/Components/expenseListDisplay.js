"use client";

import { useState, useEffect, Suspense } from "react";
import Card from "@/app/Components/Card"
import { Encrypt } from "../../../Functions/Mics";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import axios from "axios";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";


export default function InvoiceLandingPage({ baseUrl, userData }) {
  const [searchRef, setSearchRef] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [billList, setBillList] = useState([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const itemsPerPage = 15;

  // Fetch bills from API
  useEffect(() => {
    const fetchBills = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({
          page: currentPage,
          itemsPerPage,
          searchRef,
        }).toString();

        const response = await axios.get(`${baseUrl}/api/ExpenseList?${query}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            access: `${Encrypt(userData.user._id)}`,
          },
        });

        const data = await response.data;

        setBillList(data.expenses || []);
        setTotalPages(data.pagination.totalPages);
        setTotalInvoices(data.pagination.total);
        setCurrentPage(data.pagination.page);
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, [currentPage, searchRef]);

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Expense"} />}>
      <div className="text-white text-xs">
        <div className="mx-auto">
          {isLoading ? (
            <SuspenenseFallBack pagedata={"Expenses"} />
          ) : billList.length > 0 ? (
            <div className="animate__animated animate__fadeInUp animate__faster">
                {/* Expense Grid */}
                <div className="flex flex-col h-[81vh] p-1">
                  {/* Scrollable cards grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-1 flex-1 overflow-y-auto"  style={{ scrollbarWidth: 'thin', scrollbarColor: '#4B5563 transparent' }}>
                    {billList.map((element) => (
                      <Card key={element._id} data={element} module="expense" />
                    ))}
                  </div>

                  {/* Fixed pagination bar */}
                  <div className="flex justify-between items-center px-4 py-3 border-t border-white/10 bg-[#121216] rounded-b-md">
                    <span className="text-xs text-white/70">
                      Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        className="px-3 py-1 text-sm rounded-md bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={currentPage === 1}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        className="px-3 py-1 text-sm rounded-md bg-white/10 text-white hover:bg-white/20 transition disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
          ) : (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="default">
                </EmptyMedia>
                <EmptyTitle className="text-black font-bold">No expense registerd Yet</EmptyTitle>
                <EmptyDescription>
                  You haven&apos;t created any expense yet. Get started by
                  recording your first expense.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </Suspense>
  );
}
