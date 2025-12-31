import React from "react";
import {Link} from "next/navigation"

export default function ProfitAndLossSheet(Data) {
  return (
    <div className="bg-white rounded p-6 m-3 shadow-md animate__animated animate__fadeInUp animate__faster">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-gray-500 font-semibold">Profit and Loss Table</h3>
      </div>

      <div className="overflow-y-hidden max-h-96">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-gray-500 border-b">
            <tr>
              <th className="border-r">S/N</th>
              <th className="p-3">Item</th>
              <th className="py-3">Value</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {Data.length > 0 ? (
              Data.map((invoice, index) => (
                <tr
                  key={index}
                  className="border-b animate__animated animate__fadeInRight text-xs"
                >
                 
                  <td className="p-3 font-semibold text-blue-700">
                    <Link
                      href={`/`}
                      className="text-indigo-600"
                    >
                      {invoice.billReferenceNo}/{invoice.invoicelocation}
                    </Link>
                  </td>
                  <td className="py-3">{invoice.customerName}</td>
                  <td className="py-3">
                    {userData.business.currency?.currency.Symbol}
                    {invoice.grandTotal?.toLocaleString()}
                  </td>
                  <td className="py-3">{invoice.RaiseBy}</td>
                  <td
                    className={`py-3 ${
                      invoice.billStatus !== "Cancelled"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {invoice.billStatus}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 text-center text-gray-500 text-sm"
                >
                  No data to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
