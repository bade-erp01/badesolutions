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
                  {/* <div className="flex flex-col gap-4 mt-2">
                   <p className="italic"> -Dis. Allowed --- [₦0.00]</p>
                   <p className="italic"> -Cost of Goods Sold (COGS) --- [₦0.00]</p>
                   <p className="italic"> -Credit Memo [Mapped to Invoice] --- [₦0.00]</p>
                  </div> */}
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
                  <div className="flex flex-col gap-4 mt-2">
                   <p className="italic"> -Dis. Allowed --- [₦0.00]</p>
                   <p className="italic"> -Cost of Goods Sold (COGS) --- [₦0.00]</p>
                   <p className="italic"> -Credit Memo [Mapped to Invoice] --- [₦0.00]</p>
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
                  <div className="flex flex-col gap-4 mt-2">
                    {/* show list of rxpense category */}
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
                  <div className="flex flex-col gap-4 mt-2">
                   <p className="font-bold "> [A - B] </p>
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
                   <div className="flex flex-col gap-4 mt-2">
                    {/* lit of indirect expense */}
                   {/* <p className="italic"> -Dis. Allowed --- [₦0.00]</p> */}
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
                  <div className="flex flex-col gap-4 mt-2">
                   <p className="font-bold"> [C - D]</p>
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
