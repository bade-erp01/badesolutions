"use client";
import Swal from "sweetalert2";
import { useState } from "react";
import { downloadExcel } from "../../../../Functions/Functions";
import { CalendarDaysIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { escapeHtml } from "@/lib/security/escapeHtml";
import api from "@/lib/api";

// Ageing of everything customers owe, from the credit-risk report (payments applied to the
// oldest invoices first). This used to put each customer's WHOLE debt in one bucket by the
// date of their last payment, and dropped customers who had never paid.
export default function ReceivablesAgingModal() {
  const [loading, setLoading] = useState(false);

  const getAgingBuckets = async () => {
    const r = await api.get("/api/reports/credit-risk");
    if (!r.ok) throw new Error(r.error || "Could not load the ageing");
    const rep = r.data;
    const out = {};
    for (const b of rep.buckets) out[b.label] = rep.aging[b.key] || 0;
    if (rep.summary.notOnStatement > 0) out["Not on statement"] = rep.summary.notOnStatement;
    out["Total owed"] = rep.summary.totalReceivables;
    return out;
  };

  // Show modal with aging summary
  const showModal = async () => {
    if (loading) return;
    setLoading(true);
    let agingData;
    try {
      agingData = await getAgingBuckets();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Receivable Aging Summary", text: err.message });
      return;
    } finally {
      setLoading(false);
    }
    const tenant = typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "";
    const fullReport = `/${encodeURIComponent(tenant)}/V4/accounting/accounting/Credit-Risk/Credit-Risk`;

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
                <td style="padding: 6px;">${escapeHtml(bucket)}</td>
                <td style="padding: 6px; text-align: right;">${escapeHtml(Math.round(amount).toLocaleString())}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 12px; text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
          <a href="${escapeHtml(fullReport)}" style="
            padding: 6px 12px;
            border-radius: 6px;
            border: 1px solid #2b6cb0;
            color: #2b6cb0;
            font-size: 13px;
            text-decoration: none;
          ">Full credit-risk report</a>
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
      width: "max(50%, min(95vw, 640px))",
      showConfirmButton: false,
      didOpen: () => {
        const clean = Object.entries(agingData).map(
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
    <Button
      onClick={showModal}
      variant="outline"
      type="button"
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <CalendarDaysIcon className="w-4 h-4 inline-block" />
      {loading ? "Loading…" : "Receivable Aging Summary"}
    </Button>
  );
}
