"use client"
import { useEffect,useState } from "react";
import moment from "moment";

export default function Page({ data }) {
  const [Data] = useState(data)
   // for pagintaion
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  
  const totalPages = Math.ceil(Data.transactions.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = Data.transactions.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="max-w-full  px-4 py-8 md:px-8 md:py-10 bg-white  m-4 animate__animated animate__fadeIn">
      {/* Product Info */}
      <div className="text-center mb-6 space-y-1">
        <h2 className="text-xl font-bold text-gray-800">{data.accountName}</h2>
        <p className="text-sm text-gray-500">
          <strong>Code:</strong> {Data.accountCode}
        </p>
        <p className="text-sm text-gray-500">
          <strong>Entries:</strong> {Data.balance}
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* currentQty */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Account
            </label>
            <input
              type="number"
              name="currentQty"
              value={Data.accountName}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            />
          </div>

          {/* pcs */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Code
            </label>
            <input
              type="number"
              name="pcs"
              value={Data.accountCode}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
            />
          </div>
        </div>
      </form>

      {/* Activity Log */}
      <div className="mt-10">
        <div className="bg-gray-50 rounded-lg p-4 shadow overflow-x-auto">
          {Data && Data.transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-gray-700">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-2 py-1">Ref No</th>
                    <th className="px-2 py-1">Date</th>
                    <th className="px-2 py-1">Credit</th>
                    <th className="px-2 py-1">Debit</th>
                    {/* <th className="px-2 py-1">Balance</th> */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentRows.map((tx, idx) => (
                    <tr key={idx} title={tx.ReferenceNo}>
                      <td className="px-2 py-1">
                        {tx.reference.length > 50
                          ? `${Data.accountCode}-${tx.reference?.substring(0, 50)}...`
                          : `${Data.accountCode}-${tx.reference}`}
                      </td>
                      <td className="px-2 py-1">
                        {moment(tx.Date).format("MMM D, YYYY")}
                      </td>
                      <td className="px-2 py-1">
                        CR: {tx.type === "credit" ? tx.amount?.toLocaleString() : 0.00}
                      </td>
                      <td className="px-2 py-1">
                        DR:  {tx.type === "debit" ? tx.amount?.toLocaleString() : 0.00}
                      </td>
                      {/* <td
                        className={`px-2 py-1 ${
                          tx.Balance < 0 ? "text-green-700" : "text-black"
                        } font-semibold`}
                      >
                        {tx.Balance?.toLocaleString()}
                      </td> */}
                    </tr>
                  ))}
                </tbody>
                <caption>
                  <p className="text-sm text-red-700 bg-yellow-100 border border-red-300 rounded-md px-4 py-2">
                    Accounting Entries
                  </p>
                </caption>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="px-2 py-1 text-white">
                      {/* <ExcelDownloadBtn
                        data={data.transcations}
                        page={`${cust.Username.substring(0, 8)} transaction`}
                      /> */}
                    </td>
                  </tr>
                </tfoot>
              </table>

              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-4 text-sm">
                <span
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-400 rounded disabled:opacity-50"
                >
                  Previous
                </span>

                <span className="text-xs text-black font-bold">
                  Page {currentPage} of {totalPages}
                </span>

                <span
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-500 rounded disabled:opacity-50"
                >
                  Next
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No recent transactions found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
