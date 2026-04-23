"use client";
import Nav1 from "@/app/Components/Nav1";
import Footer2 from "@/app/Components/Footer2";
import BackButton from "@/app/Components/BackBotton";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import Swal from "sweetalert2/dist/sweetalert2.js";
import {
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";
import {pricelistSetter} from "../../../../../../../../Functions/Functions"
import moment from "moment";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Page({ Data, userData }) {
  const [initialData, setInitialData] = useState(Data);
  const [SALES, setSALES] = useState(0);
  const [Return, setReturn] = useState(0);
  const [OpeningInventory, setOpeningInventory] = useState(0);
  const [NetPurchase, setNetPurchase] = useState(0);
  const [closingInv, setClosingInv] = useState(0);
  const [COGS, setCOGS] = useState(0);
  const [DirectExpense, setDirectExpenses] = useState(0); //direct expense
  const [indirectExpenses, setindirectExpenses] = useState(0); ////indirect expense
  const [NetProfit, setNetProfit] = useState(0);
  const [Taxes, setTaxes] = useState(0);
  const [currency] = useState(userData.business.currency?.currency.Symbol);
  //  console.log(initialData.COAs)

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
      const dates = generateDates(endDate, startDate);

      // do the filters here and update the initialData state with the new values to update the UI
      // get sales snapshot from COA
      setSALES(
        initialData.COAs[0].Revenue.Revenue.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month).format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.openingBalance, 0),
      );

      // GET RETURNS SNAPSHOTS FROM COA
      setReturn(
        initialData.COAs[0].Revenue.Sales_Returns_Allowance.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month).format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.openingBalance, 0),
      );

      // CALCULATE C.O.S
      // CATPTURE CLOSING INVENTORY FOR LAST MONTH AS OPENING INVENTORY FOR CURRENT MONTH
      setOpeningInventory(
        initialData.COAs[0].Asset.inventory.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month)
              .subtract(1, "month")
              .format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.openingBalance, 0),
      );

      // CAPTURE NET PURCHASE
      setNetPurchase(
        initialData.COAs[0].Expense.Purchases.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month).format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.openingBalance, 0),
      );

      // CAPTURE setClosingInv
      setClosingInv(
        initialData.COAs[0].Asset.inventory.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month).format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.closingBalance, 0),
      );

      // CAPTURE EXPENSE
      setDirectExpenses(
        initialData.COAs[0].Expense.Direct_Expense.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month).format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.openingBalance, 0),
      );

      // CAPTURE `COGS
      setCOGS(
        initialData.COAs[0].Expense.COGS.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month).format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.openingBalance, 0),
      );

      // CAPTURE setTaxes
      setTaxes(
        initialData.COAs[0].Liability.Tax_payable.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month).format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.openingBalance, 0),
      );

      // capture indirectExpenses
      setindirectExpenses(
        initialData.COAs[0].Expense.Indirect_Expense.monthlyBalances
          .filter((entry) => {
            const formattedDate = moment(entry.month).format("YYYY-MM");
            return dates.includes(formattedDate);
          })
          .reduce((acc, entry) => acc + entry.openingBalance, 0),
      );

      SuccessToast("Income statement updated.");
    } catch (err) {
      ErrorMessage(err.message);
    }
  }

 return (
  <div className="flex flex-col min-h-screen">
    <Nav1
      user={userData.user}
      business={userData.business}
      page="Income Statement"
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

      {/* Main Content */}
      <main className="flex-1">
        <section className="w-full mx-auto p-6 h-[83vh] overflow-y-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                Income Statement — {userData.business.companyName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-2/3">Heads</TableHead>
                    <TableHead className="text-right">Accum.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* SALES */}
                  <TableRow>
                    <TableCell>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="sales">
                          <AccordionTrigger>Sales</AccordionTrigger>
                          <AccordionContent>
                            <p>All Pricelist</p>
                            <Badge variant="secondary">
                            {pricelistSetter(userData.business.priceList1,userData.business)}
                            </Badge>

                            <Badge variant="secondary">
                            {pricelistSetter(userData.business.priceList2,userData.business)}
                            </Badge>

                            <Badge variant="secondary">
                            {pricelistSetter(userData.business.priceList3,userData.business)}
                            </Badge>

                            <Badge variant="secondary">
                            {pricelistSetter(userData.business.priceList4,userData.business)}
                            </Badge>

                            <Badge variant="secondary">
                            {pricelistSetter(userData.business.priceList5,userData.business)}
                            </Badge>

                            <Badge variant="secondary">
                            {pricelistSetter(userData.business.priceList6,userData.business)}
                            </Badge>

                            <Badge variant="secondary">
                            {pricelistSetter(userData.business.priceList7,userData.business)}
                            </Badge>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                    <TableCell className="text-right">{currency}{SALES}</TableCell>
                  </TableRow>

                  {/* NET SALES */}
                  <TableRow>
                    <TableCell>Net Sales [A]</TableCell>
                    <TableCell className="text-right">{currency}{SALES - Return}</TableCell>
                  </TableRow>

                  {/* COST OF SALES */}
                  <TableRow>
                    <TableCell>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="cos">
                          <AccordionTrigger>Cost of Sales [B]</AccordionTrigger>
                          <AccordionContent className="space-y-1 text-sm text-gray-600">
                            <p>Opening inventory: {currency}{OpeningInventory}</p>
                            <p>+ Net purchase: {currency}{NetPurchase}</p>
                            <p>COGAS: {currency}{OpeningInventory + NetPurchase}</p>
                            <p>- Closing inventory: {currency}{closingInv}</p>
                            <p>COGS: {currency}{COGS}</p>
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                    <TableCell className="text-right">{currency}{(OpeningInventory + NetPurchase) - closingInv}</TableCell>
                  </TableRow>

                  {/* DIRECT EXPENSE */}
                  <TableRow>
                    <TableCell>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="direct-expense">
                          <AccordionTrigger>Direct Expense [C]</AccordionTrigger>
                          <AccordionContent className="space-y-1 text-sm text-gray-600">
                            {initialData.ExpenseCats.filter(cat => cat.type === "Direct")
                              .slice(0,3)
                              .map((cat, idx) => (
                                <Badge variant="secondary" className="gap-1" key={idx}>{cat.NAME}</Badge>
                              ))}
                            {initialData.ExpenseCats.filter(cat => cat.type === "Direct").length > 3 && (
                              <Badge variant="secondary">
                                + {initialData.ExpenseCats.filter(cat => cat.type === "Direct").length - 3} More
                              </Badge>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                    <TableCell className="text-right">{currency}{DirectExpense}</TableCell>
                  </TableRow>

                  {/* GROSS PROFIT */}
                  <TableRow>
                    <TableCell className="font-medium">Gross Profit [D]</TableCell>
                    <TableCell className="text-right font-medium">
                      {currency}{(SALES - Return) - (OpeningInventory + NetPurchase) - closingInv}
                    </TableCell>
                  </TableRow>

                  {/* INDIRECT EXPENSE */}
                  <TableRow>
                    <TableCell>
                      <Accordion type="single" collapsible>
                        <AccordionItem value="indirect-expense">
                          <AccordionTrigger>Indirect Expense [E]</AccordionTrigger>
                          <AccordionContent className="space-y-1 text-sm text-gray-600">
                            {initialData.ExpenseCats.filter(cat => cat.type === "Indirect")
                              .slice(0,3)
                              .map((cat, idx) => (
                                <Badge variant="secondary" className="gap-1" key={idx}>{cat.NAME}</Badge>
                              ))}
                            {initialData.ExpenseCats.filter(cat => cat.type === "Indirect").length > 3 && (
                              <Badge variant="outline">
                                + {initialData.ExpenseCats.filter(cat => cat.type === "Indirect").length - 3} More
                              </Badge>
                            )}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </TableCell>
                    <TableCell className="text-right">{currency}{indirectExpenses}</TableCell>
                  </TableRow>

                  {/* OPERATING INCOME */}
                  <TableRow>
                    <TableCell className="font-medium">Operating Income [EBIT]</TableCell>
                    <TableCell className="text-right font-medium">
                      {currency}{((SALES - Return) - ((OpeningInventory + NetPurchase) - closingInv)) - DirectExpense - indirectExpenses}
                    </TableCell>
                  </TableRow>

                  {/* TAXES */}
                  <TableRow>
                    <TableCell>Taxes</TableCell>
                    <TableCell className="text-right">{currency}{Taxes}</TableCell>
                  </TableRow>

                  {/* NET INCOME */}
                  <TableRow>
                    <TableCell className="font-bold text-lg">Net Income</TableCell>
                    <TableCell className="text-right font-bold text-lg">{currency}{NetProfit}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>

    <Footer2 />
  </div>
)

}
