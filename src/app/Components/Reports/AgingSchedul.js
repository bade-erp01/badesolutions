"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import { downloadExcel } from "../../../../Functions/Functions";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";

export default function ReceivablesAgingModal({ data }) {
  const [debtorsList] = useState(
    (data || []).filter((customer) => customer.Debt > 0)
  );

  // 🔍 Normalize date whether it's serial or standard
  function normalizeDate(value) {
    if (!value) return null;
    const isSerial = typeof value === "number" || /^\d+(\.\d+)?$/.test(value);
    if (isSerial) {
      const serial = parseFloat(value);
      const baseDate = moment("1899-12-30");
      const days = Math.floor(serial);
      const timeFraction = serial - days;
      const date = baseDate.clone().add(days, "days");
      const time = moment.duration(timeFraction * 24, "hours");
      return date.add(time).format("YYYY-MM-DD HH:mm:ss");
    }
    return moment(value).isValid()
      ? moment(value).format("YYYY-MM-DD HH:mm:ss")
      : null;
  }

  // 📆 Calculate debt days from normalized date
  const calculateDebtDays = (lastPayDate) => {
    const normalized = normalizeDate(lastPayDate);
    if (!normalized) return null;
    const today = moment();
    const lastPayment = moment(normalized);
    return today.diff(lastPayment, "days");
  };

  // 📊 Group debts into aging buckets
  const getAgingBuckets = () => {
    const buckets = {
      "Current (0–30 days)": 0,
      "31–60 Days": 0,
      "61–90 Days": 0,
      "Over 90 Days": 0,
    };

    debtorsList.forEach((cust) => {
      const days = calculateDebtDays(cust.lastPayDate);
      if (days === null) return;

      if (days <= 30) buckets["Current (0–30 days)"] += cust.Debt;
      else if (days <= 60) buckets["31–60 Days"] += cust.Debt;
      else if (days <= 90) buckets["61–90 Days"] += cust.Debt;
      else buckets["Over 90 Days"] += cust.Debt;
    });

    return buckets;
  };

  // 🧾 Show modal with aging summary
  const showModal = () => {
    const agingData = getAgingBuckets();

    Swal.fire({
      title: "Receivable Aging Summary",
      html: `
        <table style="width:100%; border-collapse: collapse; font-size: 13px;">
          <thead style="background-color: #edf2f7;">
            <tr>
              <th style="padding: 6px; text-align: left;">Aging Bucket</th>
              <th style="padding: 6px; text-align: right;">Total Debt</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(agingData)
              .map(
                ([bucket, amount]) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">${bucket}</td>
                <td style="padding: 6px; text-align: right;">${amount.toLocaleString()}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 12px; text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="downloadAgingExcel" style="
            background-color: #2b6cb0;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 13px;
          ">
            Download Excel
          </button>
        </div>
      `,
      width: "50%",
      showConfirmButton: false,
      didOpen: () => {
        const clean = Object.entries(getAgingBuckets()).map(
          ([bucket, amount]) => ({
            "Aging Bucket": bucket,
            "Total Debt": amount,
          })
        );

        document.getElementById("downloadAgingExcel").onclick = () => {
          const excelBtn = downloadExcel(clean, `Receivable Aging Summary`);
          if (excelBtn instanceof HTMLElement) {
            excelBtn.click();
          }
        };
      },
    });
  };

  return (
    <button
      onClick={showModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <CalendarDaysIcon className="w-4 h-4 inline-block" />
      Receivable Aging Summary
    </button>
  );
}
