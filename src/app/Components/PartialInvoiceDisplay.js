"use client";
import Swal from "sweetalert2";
import { downloadExcel } from "../../../Functions/Functions";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";

export default function PartialInvoiceDisplay({data}) {
  // 🧾 Show modal with altered line
  const showModal = () => {

    Swal.fire({
      title: `${data.billStatus.slice(0,3).toUpperCase()}/${data.billReferenceNo}`,
      html: `
        <table style="width:100%; border-collapse: collapse; font-size: 13px;">
          <thead style="background-color: #edf2f7;">
            <tr>
              <th style="padding: 6px; text-align: center;">S/No</th>
              <th style="padding: 6px; text-align: center;">Product</th>
              <th style="padding: 6px; text-align: center;">Trace</th>
              <th style="padding: 6px; text-align: center;">Code</th>
              <th style="padding: 6px; text-align: center;">Case</th>
              <th style="padding: 6px; text-align: center;">Pcs</th>
              <th style="padding: 6px; text-align: center;">P/RTC</th>
              <th style="padding: 6px; text-align: center;">P/RTP</th>
              <th style="padding: 6px; text-align: center;">Price</th>
              <th style="padding: 6px; text-align: center;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data?.orders.filter(ord => ord.RCRT > 0 || ord.RPCS > 0).map(
                (line, index) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">${index + 1}</td>
                <td style="padding: 6px; text-align: center;">${line.item.Name}</td>
                <td style="padding: 6px; text-align: center;">${line.returnId}</td>
                <td style="padding: 6px; text-align: center;">${line.item.ADCcode || line.item.ACDcode}</td>
                <td style="padding: 6px; text-align: center;">${line.Qty}</td>
                <td style="padding: 6px; text-align: center;">${line.pcsReq}</td>
                <td style="padding: 6px; text-align: center;">${line.RCRT}</td>
                <td style="padding: 6px; text-align: center;">${line.RPCS}</td>
                <td style="padding: 6px; text-align: center;">${line.priceListPrice?.toFixed(2)}</td>
                <td style="padding: 6px; text-align: center;">${line.total?.toFixed(2)}</td>
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
            Print a Copy
          </button>
        </div>
      `,
      width: "70%",
      showConfirmButton: false,
      didOpen: () => {

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
      <ClipboardDocumentListIcon className="w-4 h-4 inline-block" />
      View adjustment
    </button>
  );
}
