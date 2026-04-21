"use client";

import React from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import { FaDownload } from "react-icons/fa";

const AgingReportDownloader = ({ customer, invoices, Rep }) => {
  const handleDownload = async () => {
    try {
      const periods = [
        { name: "1-30 days", start: moment().subtract(30, "days"), end: moment() },
        { name: "31-60 days", start: moment().subtract(60, "days"), end: moment().subtract(31, "days") },
        { name: "61-90 days", start: moment().subtract(90, "days"), end: moment().subtract(61, "days") },
        { name: "91-120 days", start: moment().subtract(120, "days"), end: moment().subtract(91, "days") },
        { name: ">121 days", start: moment().subtract(9999, "days"), end: moment().subtract(121, "days") },
      ];

      const aging = [];

      const customerInvoices = invoices.filter(
        (entry) =>
          entry.customer &&
          customer._id &&
          entry.customer.toString() === customer._id.toString() &&
          !["Draft", "Cancelled", "Requisition"].includes(entry.billStatus)
      );

      const agingData = {
        Name: customer.Username,
        Rep: Rep || "N/A",
        Current: customer.Debt || 0,
      };

      let carryOver = 0;

      periods.forEach((period) => {
        const periodInvoices = customerInvoices.filter((entry) =>
          moment(entry.startDate).isBetween(period.start, period.end, null, "[]")
        );

        const invoiceTotal = periodInvoices.reduce(
          (total, inv) => total + Number(inv.grandTotal || 0),
          0
        );

        let paymentTotal = periodInvoices.reduce(
          (total, inv) => total + Number(inv.paymentMethod || 0),
          0
        );

        // Add carryover from previous bucket
        if (carryOver < 0) {
          paymentTotal = -carryOver;
          carryOver = 0;
        }

        let periodBalance = invoiceTotal - paymentTotal;

        // If still positive, carry forward remainder
        if (periodBalance < 0) {
          carryOver = periodBalance;
          
        }

        agingData[period.name] = Math.max(periodBalance, 0);
      });

      aging.push(agingData);

      const worksheet = XLSX.utils.json_to_sheet(aging);
      const workbook = { Sheets: { "Aging Report": worksheet }, SheetNames: ["Aging Report"] };
      const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      const blob = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
      });
      saveAs(blob, "Aging_Report.xlsx");
    } catch (error) {
      console.error("Error generating report");
    }
  };

  return (
    <div
      onClick={handleDownload}
      className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out cursor-pointer"
    >
      <FaDownload />
      <span className="text-xs">+120 Days Aging Report</span>
    </div>
  );
};

export default AgingReportDownloader;
