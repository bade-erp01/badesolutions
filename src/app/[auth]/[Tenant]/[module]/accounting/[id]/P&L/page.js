import React from "react";
import { Link } from "next/navigation";

export default function ProfitAndLossSheet({ data }) {
  return (
    <div className="bg-white rounded p-6 m-3 shadow-md animate__animated animate__fadeInUp animate__faster">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg text-gray-500 font-semibold">
          Income Statement
        </h3>
      </div>

      <div className="overflow-y-hidden max-h-screen">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="text-xs text-gray-500 border-b">
            <tr>
              <th className="p-3">Heads</th>
              <th className="py-3">Acum</th>
            </tr>
          </thead>

          <tbody className="text-gray-700">
            {/* Example row */}
            <tr>
              <td className="p-3">
                <details>
                  <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                    SALES
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    {/* {data.orders?.map((order, idx) => ( */}
                    <div
                      // key={idx}
                      className="border p-2 rounded hover:border-purple-300 hover:bg-white text-xs"
                    >
                      <p className="text-purple-800">
                        <strong>Product:</strong> Example Product
                      </p>
                      <h4 className="font-semibold mb-2">Total: $100</h4>
                    </div>
                    {/* ))} */}
                  </div>
                </details>
              </td>
              <td className="py-3">$100</td>
            </tr>

            <tr>
              <td className="p-3">
                <details>
                  <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                    NET SALES [A]
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    {/* {data.orders?.map((order, idx) => ( */}
                    <div
                      // key={idx}
                      className="border p-2 rounded hover:border-purple-300 hover:bg-white text-xs"
                    >
                      <p className="text-purple-800">
                        <strong>Product:</strong> Example Product
                      </p>
                      <h4 className="font-semibold mb-2">Total: $100</h4>
                    </div>
                    {/* ))} */}
                  </div>
                </details>
              </td>
              <td className="py-3">$100</td>
            </tr>

            <tr>
              <td className="p-3">
                <details>
                  <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                    DIRECT EXPENSE [B]
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    {/* {data.orders?.map((order, idx) => ( */}
                    <div
                      // key={idx}
                      className="border p-2 rounded hover:border-purple-300 hover:bg-white text-xs"
                    >
                      <p className="text-purple-800">
                        <strong>Product:</strong> Example Product
                      </p>
                      <h4 className="font-semibold mb-2">Total: $100</h4>
                    </div>
                    {/* ))} */}
                  </div>
                </details>
              </td>
              <td className="py-3">$100</td>
            </tr>

            <tr>
              <td className="p-3">
                <details>
                  <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                    GROSS PROFIT [C]
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    {/* {data.orders?.map((order, idx) => ( */}
                    <div
                      // key={idx}
                      className="border p-2 rounded hover:border-purple-300 hover:bg-white text-xs"
                    >
                      <p className="text-purple-800">
                        <strong>Product:</strong> Example Product
                      </p>
                      <h4 className="font-semibold mb-2">Total: $100</h4>
                    </div>
                    {/* ))} */}
                  </div>
                </details>
              </td>
              <td className="py-3">$100</td>
            </tr>


            <tr>
              <td className="p-3">
                <details>
                  <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                    INDIRECT EXPENSE [D]
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    {/* {data.orders?.map((order, idx) => ( */}
                    <div
                      // key={idx}
                      className="border p-2 rounded hover:border-purple-300 hover:bg-white text-xs"
                    >
                      <p className="text-purple-800">
                        <strong>Product:</strong> Example Product
                      </p>
                      <h4 className="font-semibold mb-2">Total: $100</h4>
                    </div>
                    {/* ))} */}
                  </div>
                </details>
              </td>
              <td className="py-3">$100</td>
            </tr>


            <tr>
              <td className="p-3">
                <details>
                  <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                     OPERATING INCOME
                  </summary>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
                    {/* {data.orders?.map((order, idx) => ( */}
                    <div
                      // key={idx}
                      className="border p-2 rounded hover:border-purple-300 hover:bg-white text-xs"
                    >
                      <p className="text-purple-800">
                        <strong>Product:</strong> Example Product
                      </p>
                      <h4 className="font-semibold mb-2">Total: $100</h4>
                    </div>
                    {/* ))} */}
                  </div>
                </details>
              </td>
              <td className="py-3">$100</td>
            </tr>

            <tr>
              <td  className="p-3">Others</td>
            </tr>

            <tr>
              <td  className="cursor-pointer hover:bg-gray-50 font-bold ">
                Net Income before Taxes
              </td>
              <td className="py-3">$100</td>
            </tr>

             <tr>
              <td  className="cursor-pointer hover:bg-gray-50 font-bold ">
                Taxes
              </td>
              <td className="py-3">$100</td>
            </tr>

             <tr>
              <td className="cursor-pointer hover:bg-gray-50 font-bold ">
                 Net Income
              </td>
              <td className="py-3">$100</td>
            </tr>
            
          </tbody>
        </table>
      </div>
    </div>
  );
}
