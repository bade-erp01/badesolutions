"use client";
import { useState, useEffect, Suspense } from "react";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import moment from "moment";

const FinancialOverview = ({ data }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactionPages, setTransactionPages] = useState({});
  const itemsPerTransactionPage = 10;

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (!data || typeof data !== "object") {
    return <p className="text-red-500">No financial data provided.</p>;
  }

  const allAccounts = Object.entries(data)
    .filter(([key]) => key !== "accountCode")
    .flatMap(([_, category]) =>
      Object.entries(category)
        .filter(([key]) =>
          [
            "Asset",
            "Liability",
            "Equity",
            "Revenue",
            "Expense",
            "Non_current_liabilities",
            "Non_current_assets",
            "Cost_of_sales",
          ].includes(key)
        )
        .map(([_, account]) => account)
    );

  const accs = allAccounts.flatMap((category) =>
    Object.entries(category)
      .filter(([key]) => key !== "accountCode")
      .map(([_, account]) => account)
  );

  const handleTransactionPageChange = (accountCode, direction, totalPages) => {
    setTransactionPages((prev) => {
      const current = prev[accountCode] || 1;
      const nextPage =
        direction === "next"
          ? Math.min(current + 1, totalPages)
          : Math.max(current - 1, 1);
      return { ...prev, [accountCode]: nextPage };
    });
  };

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Charts of account"} />}>
      <div className="text-white text-xs">
        <div className="mx-auto">
          <div className="border border-white/10 bg-gradient-to-br from-[#6c6c6e] to-[#78787a] p-4 shadow-xl">
            <div className="border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-200">
                Accounting Entries
              </h1>
            </div>
          </div>

          <div className="bg-gray-600 shadow-lg border border-white/10">
            {isLoading ? (
              <SuspenenseFallBack pagedata={"Charts of Account"} />
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-800 border border-gray-200 shadow-md rounded-lg overflow-hidden">
                  <thead className="bg-grey-600 text-white uppercase text-xs sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left">Code</th>
                      <th className="px-4 py-3 text-center">Description</th>
                      <th className="px-4 py-3 text-center">Account Type</th>
                      {/* <th className="px-4 py-3 text-center">
                        Financial Statement
                      </th> */}
                      <th>
                        GL Bal
                      </th>
                      <th> </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y bg-grey-600">
                    {accs
                      .sort((a, b) => a.code.localeCompare(b.code))
                      .map((account, index) => {
                        const currentPage = transactionPages[account.code] || 1;
                        const totalPages = Math.ceil(
                          (account.transactions?.length || 0) /
                            itemsPerTransactionPage
                        );
                        const paginatedTransactions = account.transactions
                          ? account.transactions.slice(
                              (currentPage - 1) * itemsPerTransactionPage,
                              currentPage * itemsPerTransactionPage
                            )
                          : [];

                        return (
                          <tr
                            key={index}
                            className="hover:bg-gray-800 transition-colors text-left"
                          >
                            <td colSpan={4} className="p-1">
                              <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer bg-gray-800 hover:bg-gray-900 text-xs text-white transition-colors px-4 py-2">
                                  <div className="flex gap-4 w-full">
                                    <span className="w-1/4">{account.code}</span>
                                    <span className="w-1/4 truncate">
                                      {account.description}
                                    </span>
                                    <span className="w-1/4">
                                      {account.AccountType}
                                    </span>
                                    {/* <span className="w-1/4">
                                      {account.reportsTo}
                                    </span> */}
                                    <span className="w-1/4">
                                      {account?.Balance?.toLocaleString() || 0.00}
                                    </span>
                                    <span></span>
                                  </div>
                                  <span className="text-gray-500 group-open:rotate-180 transition-transform duration-300">
                                    ▼
                                  </span>
                                </summary>
                                <div className=" text-white">
                                  {paginatedTransactions.length > 0 ? (
                                    <>
                                      <div className="overflow-x-auto p-3">
                                        <table className="min-w-full text-white bg-gray-800">
                                          <thead className="bg-gray-700 text-white uppercase text-xs sticky top-0 z-10">
                                            <tr>
                                              <th className="text-left px-2 py-1">
                                                Date
                                              </th>
                                              <th className="text-left px-2 py-1">
                                                Amount
                                              </th>
                                              <th className="text-left px-2 py-1">
                                                Type
                                              </th>
                                              <th className="text-left px-2 py-1">
                                                Description
                                              </th>
                                              <th className="text-left px-2 py-1">
                                                Reference
                                              </th>
                                              <th className="text-left px-2 py-1">
                                                GL.Bal
                                              </th>
                                            </tr>
                                          </thead>
                                          <tbody className="">
                                            {paginatedTransactions.map(
                                              (entry, idx) => (
                                                <tr
                                                  key={idx}
                                                  className="text-xs px-2 py-1"
                                                >
                                                  <td>
                                                    {moment(
                                                      entry.date.$date
                                                    ).format("l")}
                                                  </td>
                                                  <td>{entry.amount}</td>
                                                  <td className="capitalize">
                                                    {entry.type}
                                                  </td>
                                                  <td>{entry.description}</td>
                                                  <td>{entry.reference}</td>
                                                  <td>{entry.Balance}</td>
                                                </tr>
                                              )
                                            )}
                                          </tbody>
                                        </table>
                                      </div>

                                      {/* Pagination Controls */}
                                      <div className="flex justify-center items-center gap-2 text-xs py-2">
                                        <button
                                          onClick={() =>
                                            handleTransactionPageChange(
                                              account.code,
                                              "prev",
                                              totalPages
                                            )
                                          }
                                          disabled={currentPage === 1}
                                          className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                                        >
                                          Prev
                                        </button>
                                        <span className="text-white">
                                          Page {currentPage} of {totalPages}
                                        </span>
                                        <button
                                          onClick={() =>
                                            handleTransactionPageChange(
                                              account.code,
                                              "next",
                                              totalPages
                                            )
                                          }
                                          disabled={currentPage === totalPages}
                                          className="px-2 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 disabled:opacity-50"
                                        >
                                          Next
                                        </button>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="p-4 text-sm text-gray-300">
                                      No transactions available.
                                    </div>
                                  )}
                                </div>
                              </details>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default FinancialOverview;
