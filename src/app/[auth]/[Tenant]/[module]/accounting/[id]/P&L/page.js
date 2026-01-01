"use client"
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import {useState} from "react"
import Swal from "sweetalert2/dist/sweetalert2.js";

export default function Page({initialData,userData}) {
 
  async function GeneratePNLSummary() {
    const { value: formValues } = await Swal.fire({
      title: "Generate income Statement",
      html: `
        <input id="report-start" type="date" class="swal2-input" placeholder="Start Date"/>
        <input id="report-end" type="date" class="swal2-input" placeholder="End Date"/>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Generate",
      preConfirm: () => {
        const startDate = document.getElementById("report-start").value;
        const endDate = document.getElementById("report-end").value;
        if (!startDate || !endDate) {
          Swal.showValidationMessage("Please select both dates");
        }
        return { startDate, endDate };
      },
    });

    if (!formValues) return;

    Swal.fire({
      title: "Fetching report…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const { startDate, endDate } = formValues;
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/customerReport/${customerId}?Start=${startDate}&End=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
            access: `${Encrypt(userInfo.user._id)}`,
          },
          cache: "no-store", // Optional: disables caching for fresh data
        }
      );

      const TransactionResult = await res.json();

      if (!res.ok || TransactionResult.length < 1) {
        throw new Error(data.error || "No transactions found.");
      }

      Swal.close();
      SuccessToast("Your report has been saved.");
    } catch (err) {
      ErrorMessage(err.message);
    }
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`Profit & Loss`}
      />

      <div className="flex flex-1 text-white bt-2 ">
        {/* Sidebar (collapsible on mobile) */}
        <aside
          className={`bg-[#1e1e20]/80 backdrop-blur-lg
          text-white px-4 py-6 transition-all duration-300 max-h-[83dvh] overflow-y-auto md:block`}
          style={{ overflowY: "auto" }}
        >
          <BackButton />
          <hr />
          <nav className="space-y-4">
            {/* show modal button */}
            <button onClick={GeneratePNLSummary} className="text-xs w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out">
              <CalendarDaysIcon className="h-5 w-5 text-gray-100" />
              <span className="text-xs md:text-base">Select Statement period</span>
            </button>
          </nav>
        </aside>{" "}
        {/* Main Content Area */}
        <main className="flex-1 ">
          <section className="w-full max-w-7xl mx-auto flex flex-col gap-6 rounded-lg p-2 relative max-h-[81dvh] overflow-y-auto">
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
                            <p className="italic">
                              {" "}
                              -Cost of Goods Sold (COGS) --- [₦0.00]
                            </p>
                            <p className="italic">
                              {" "}
                              -Credit Memo [Mapped to Invoice] --- [₦0.00]
                            </p>
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
                      <td className="p-3">Others</td>
                    </tr>

                    <tr>
                      <td className="cursor-pointer hover:bg-gray-50 font-bold ">
                        Net Income before Taxes
                      </td>
                      <td className="py-3">$100</td>
                    </tr>

                    <tr>
                      <td className="cursor-pointer hover:bg-gray-50 font-bold ">
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
          </section>
        </main>
      </div>
      <Footer2 />
    </div>
  );
}
