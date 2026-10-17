"use client";

// "+120 days" ageing for one customer. The backend (GET /api/reports/credit-risk/customer/:id)
// applies payments to the oldest invoices first, so the buckets are what is still owed and
// add up to the customer's balance. (This used to bucket invoice totals in the browser and
// never subtracted payments.)

import React, { useState } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import { FaDownload } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { ErrorMessage } from "../../../../Functions/Mics";

const AgingReportDownloader = ({ customer, Rep }) => {
  const [busy, setBusy] = useState(false);

  const handleDownload = async () => {
    if (busy || !customer?._id) return;
    setBusy(true);
    try {
      const r = await api.get(`/api/reports/credit-risk/customer/${customer._id}`);
      if (!r.ok) throw new Error(r.error || "Could not build the ageing report");
      const rep = r.data;
      const label = Object.fromEntries(rep.buckets.map((b) => [b.key, b.label]));

      const summary = {
        Name: rep.customer.name || customer.Username,
        Rep: Rep || "",
        Balance: rep.customer.debt,
        ...Object.fromEntries(rep.buckets.map((b) => [label[b.key], rep.aging[b.key]])),
        "Not on statement": rep.notOnStatement,
        "Oldest open (days)": rep.oldestDays,
        "Avg days to pay": rep.avgDaysToPay ?? "",
        "Last payment": rep.lastPayment ? moment(rep.lastPayment).format("YYYY-MM-DD") : "",
        "Credit limit": rep.customer.creditLimit || "",
      };
      const open = rep.openInvoices.map((i) => ({
        Reference: i.reference,
        Date: moment(i.date).format("YYYY-MM-DD"),
        "Invoice amount": i.amount,
        Outstanding: i.outstanding,
        "Age (days)": i.ageDays,
        Bucket: label[i.bucket],
      }));

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([summary]), "Aging Report");
      XLSX.utils.book_append_sheet(
        wb,
        open.length ? XLSX.utils.json_to_sheet(open) : XLSX.utils.aoa_to_sheet([["No open invoices"]]),
        "Open invoices",
      );
      const out = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const safeName = String(summary.Name || "customer").replace(/[^\w.-]+/g, "_").slice(0, 40);
      saveAs(new Blob([out], { type: "application/octet-stream" }), `Aging_${safeName}_${moment().format("YYYY-MM-DD")}.xlsx`);
    } catch (error) {
      ErrorMessage(error.message || "Could not build the ageing report");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      onClick={handleDownload}
      className={`flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out ${busy ? "opacity-70 cursor-wait" : "cursor-pointer"}`}
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FaDownload />}
      <span className="text-xs">+120 Days Aging Report</span>
    </div>
  );
};

export default AgingReportDownloader;
