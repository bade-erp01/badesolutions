"use client"
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import {useState} from "react";
import Swal from "sweetalert2/dist/sweetalert2.js";
import {ErrorMessage,SuccessToast,} from "../../../../../../../../Functions/Mics";
import moment from "moment";

export default function Page({Data,userData}) {
 const [initialData,setInitialData] = useState(Data)
 const [SALES,setSALES] = useState(0);
 const [Return,setReturn] = useState(0);
 const [OpeningInventory,setOpeningInventory] = useState(0);
 const [NetPurchase,setNetPurchase] = useState(0);
 const [closingInv,setClosingInv] = useState(0);
 const [COGS,setCOGS] = useState(0);
 const [DirectExpense,setDirectExpenses] = useState(0);//direct expense
 const [indirectExpenses,setindirectExpenses] = useState(0)////indirect expense
 const [NetProfit,setNetProfit] = useState(0);
 const [Taxes,setTaxes] = useState(0);
 console.log(initialData.COAs)

  const generateDates = (end, start) => {
      const dates = [];
      let currentDate = moment(start);
      while (currentDate <= moment(end)) {
        dates.push(currentDate.format("YYYY-MM"));
        currentDate = currentDate.add(1, "days");
      }
      return dates;
    };

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
      title: "Computing income statement...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const { startDate, endDate } = formValues;
      const dates = generateDates(
        endDate,startDate
      );

      // do the filters here and update the initialData state with the new values to update the UI
      // get sales snapshot from COA
      setSALES(initialData.COAs[0].Revenue.Revenue.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.openingBalance, 0));

      // GET RETURNS SNAPSHOTS FROM COA
      setReturn(initialData.COAs[0].Revenue.Sales_Returns_Allowance.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.openingBalance, 0));

      // CALCULATE C.O.S
      // CATPTURE CLOSING INVENTORY FOR LAST MONTH AS OPENING INVENTORY FOR CURRENT MONTH
      setOpeningInventory(initialData.COAs[0].Asset.inventory.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).subtract(1, 'month').format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.openingBalance, 0));

      // CAPTURE NET PURCHASE
      setNetPurchase(initialData.COAs[0].Expense.Purchases.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.openingBalance, 0));

      // CAPTURE setClosingInv
      setClosingInv(initialData.COAs[0].Asset.inventory.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.closingBalance, 0));

      // CAPTURE EXPENSE
      setDirectExpenses(initialData.COAs[0].Expense.Direct_Expense.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.openingBalance, 0));

      // CAPTURE `COGS
      setCOGS(initialData.COAs[0].Expense.COGS.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.openingBalance, 0));

      // CAPTURE setTaxes
      setTaxes(initialData.COAs[0].Liability.Tax_payable.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.openingBalance, 0));

      // capture indirectExpenses
      setindirectExpenses(initialData.COAs[0].Expense.Indirect_Expense.monthlyBalances.filter((entry) => {
        const formattedDate = moment(entry.month).format('YYYY-MM');
        return dates.includes(formattedDate);
      }).reduce((acc, entry) => acc + entry.openingBalance, 0));
      
      SuccessToast("Income statement updated.");
    } catch (err) {
      ErrorMessage(err.message);
    }
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={`Income Statement`}
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
                  Income Statement for {userData.business.companyName.toLowerCase()}
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
                          <div className="flex flex-col gap-4 mt-2">
                            {/* show pricelist sales captured */}
                            <p>All Pricelist</p>
                          </div>
                        </details>
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{SALES}
                    </td>
                    </tr>

                    <tr>
                      <td className="p-3">
                        <details>
                          <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                            NET SALES [A]
                          </summary>
                          <div className="flex flex-col gap-4 mt-2">
                            <p className="italic"> Sales - Return</p>
                          </div>
                        </details>
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{SALES - Return}</td>
                    </tr>

                    <tr>
                      <td className="p-3">
                        <details>
                          <summary className="cursor-pointer hover:bg-gray-50 font-bold " title="Cost of Sales">
                            C.O.S [B]
                          </summary>
                          <div className="flex flex-col gap-4 mt-2">
                            <p className="italic">Opening inventory [a] [{userData.business.currency?.currency.Symbol}{OpeningInventory}]</p>
                            <p className="italic">+ Net purchase [{userData.business.currency?.currency.Symbol}{NetPurchase}]</p>
                            <p className="italic" title="Cost of Goods Available for sales"> C.O.G.A.S [a + b] --- [{userData.business.currency?.currency.Symbol}{OpeningInventory + NetPurchase}]</p>
                            <p className="italic">- Closing inventory [{userData.business.currency?.currency.Symbol}{closingInv}]</p>
                            <p className="italic" title="Cost of Goods Sold"> C.O.G.S [{userData.business.currency?.currency.Symbol}{COGS}]</p>
                          </div>
                        </details>
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{(OpeningInventory + NetPurchase) - closingInv}</td>
                    </tr>

                    <tr>
                      <td className="p-3">
                        <details>
                          <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                            DIRECT EXPENSE [C]
                          </summary>
                          <div className="flex flex-col gap-4 mt-2">
                            {/* show list of rxpense category */}
                            {initialData.ExpenseCats.filter((cat) => cat.type === "Direct")
                            .slice(0,3)
                            .map((cat,idx) =>(
                              <p className="itaclic " key={idx}> {cat.NAME} </p>
                            ))}
                          </div>
                          <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-black bg-blue-300 rounded-full">
                              + {initialData.ExpenseCats.filter(cat => cat.type === "Direct").length - 3} More
                          </span>
                        </details>
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{DirectExpense}
                    </td>
                    </tr>

                    <tr>
                      <td className="p-3">
                        <details>
                          <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                            GROSS PROFIT [D]
                          </summary>
                          <div className="flex flex-col gap-4 mt-2">
                            <p className="font-bold "> [A - B] </p>
                          </div>
                        </details>
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{(SALES - Return) - (OpeningInventory + NetPurchase) - closingInv}</td>
                    </tr>

                    <tr>
                      <td className="p-3">
                        <details>
                          <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                            INDIRECT EXPENSE [E]
                          </summary>
                          <div className="flex flex-col gap-4 mt-2">
                            {/* lit of indirect expense */}
                            {initialData.ExpenseCats.filter(cat => cat.type === "Indirect").slice(0,3).map((cat,idx) =>(
                              <p className="itaclic" key={idx}> {cat.NAME} </p>
                            ))}
                          </div>
                          <span className="px-1.5 py-0.5 text-xs font-semibold text-black bg-green-300 rounded-full">
                            + {initialData.ExpenseCats.filter(cat => cat.type === "Indirect").length - 3} More
                          </span>
                        </details>
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{indirectExpenses}
                    </td>
                    </tr>

                    <tr>
                      <td className="p-3">
                        <details>
                          <summary className="cursor-pointer hover:bg-gray-50 font-bold ">
                            OPERATING INCOME [EBIT]
                          </summary>
                          <div className="flex flex-col gap-4 mt-2">
                            <p className="font-bold"> [C - D]</p>
                          </div>
                        </details>
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{(OpeningInventory + NetPurchase - closingInv) - (SALES - Return) - (OpeningInventory + NetPurchase) - closingInv }</td>
                    </tr>

                    <tr>
                      <td className="p-3">Others</td>
                    </tr>

                    <tr>
                      <td className="cursor-pointer hover:bg-gray-50 font-bold ">
                        Net Income before Taxes
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}0</td>
                    </tr>

                    <tr>
                      <td className="cursor-pointer hover:bg-gray-50 font-bold ">
                        Taxes
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{Taxes}
                    </td>
                    </tr>

                    <tr>
                      <td className="cursor-pointer hover:bg-gray-50 font-bold ">
                        Net Income
                      </td>
                      <td className="py-3"> {userData.business.currency?.currency.Symbol}{NetProfit}</td>
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
