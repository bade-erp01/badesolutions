"use client"; // if using Next.js App Router

import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import { FaDownload } from "react-icons/fa"; // download icon

const AgingReportDownloader = ({ customer, invoices, payments, Rep }) => {

  const handleDownload = async () => {
    try {
      // Define aging periods
     const periods = [
      { name: "1-30 days", start: moment().subtract(30, "days"), end: moment() },
      { name: "31-60 days", start: moment().subtract(60, "days"), end: moment().subtract(31, "days") },
      { name: "61-90 days", start: moment().subtract(90, "days"), end: moment().subtract(61, "days") },
      { name: "91-120 days", start: moment().subtract(120, "days"), end: moment().subtract(91, "days") },
      { name: "> 121 days", start: moment("1900-01-01"), end: moment().subtract(121, "days") },
    ];

      const aging = [];

      // Process single customer object
      const customerInvoices = invoices.filter(
        (entry) =>
          entry.customer.toString() === customer._id.toString() &&
          entry.billStatus !== "Draft" &&
          entry.billStatus !== "Cancelled"
      );

      const customerPayments = invoices.filter(
        (entry) =>
          entry.customer.toString() === customer._id.toString() &&
          entry.billStatus !== "Draft" &&
          entry.billStatus !== "Cancelled" &&
          entry.paymentMethod > 0
      );

      const agingData = {
        Name: customer.Username,
        Rep: Rep ?? "Unknown",
        Current: customer.Debt,
      };

      let remainingPayment = customerPayments.reduce(
        (total, payment) => total + payment.paymentMethod,
        0
      );

      periods.forEach((period) => {
        const periodInvoices = customerInvoices.filter((entry) =>
          moment(entry.startDate).isBetween(period.start, period.end, null, "[]")
        );
        const invoiceTotal = periodInvoices.reduce((total, inv) => total + inv.grandTotal, 0);

        const periodPayments = customerPayments.filter((payment) =>
          moment(payment.startDate).isBetween(period.start, period.end, null, "[]")
        );
        const paymentTotal = periodPayments.reduce((total, pay) => total + pay.paymentMethod, 0);

        let periodTotal = invoiceTotal - paymentTotal;

       //Apply remaining payments only if there's a positive balance 
       if (periodTotal > 0 && remainingPayment > 0) {
         const paymentToSubtract = Math.min(remainingPayment, periodTotal); periodTotal -= paymentToSubtract; remainingPayment -= paymentToSubtract; 
        }

        agingData[period.name] = periodTotal;
      });

      // Strict matching: payments only reduce invoices in the same bucket
      //  let periodTotal = invoiceTotal - paymentTotal;

      aging.push(agingData);

      // Export to Excel
      const worksheet = XLSX.utils.json_to_sheet(aging);
      const workbook = { Sheets: { data: worksheet }, SheetNames: ["data"] };
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(data, "120+ Aging Report.xlsx");
    } catch (error) {
    //   console.error("Error generating report:", error.message);
    }
  };

  return (
    <div
      onClick={handleDownload}
      className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
    >
      <FaDownload />
      <span className="text-xs">+120 Days Aging Report</span>
    </div>
  );
};

export default AgingReportDownloader;
