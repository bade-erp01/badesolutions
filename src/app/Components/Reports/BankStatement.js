"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import {downloadExcel} from "../../../../Functions/Functions"
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

export default function BankStatement({ dataArray, bank, }) {

  const data = dataArray;
  const [filteredData, setFilteredData] = useState(
      data.filter(item => item.status?.toLowerCase() !== "pending")
    );

  const generateTableRows = (data) => {
    return data
      .map(
        (item, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px;">${index + 1}</td>
        <td style="padding: 4px;">${item.paymentReferenceNo.trim()}</td>
        <td style="padding: 4px;">${item.collectionRef}</td>
        <td style="padding: 4px;">${item.type}</td>
        <td style="padding: 4px;">${item.Accountant}</td>
        <td style="padding: 4px;">
          <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px;">
            ${item.status.toUpperCase()}
          </span>
        </td>
        <td style="padding: 4px;">${moment(item.PaymentDate).format("YYYY-MM-DD")}</td>
        <td style="padding: 4px;">${item.drAmount.toLocaleString()}</td>
        <td style="padding: 4px;">${item.crAmount.toLocaleString()}</td>
        <td style="padding: 4px;">${item.previousBalance.toLocaleString()}</td>
      </tr>
    `
      )
      .join("");
  };

  const showModal = () => {
    Swal.fire({
      title: "Bank Statement",
      html: `
        <style> tr:hover { background-color: #f7fafc; } </style>
        <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
          <div>
            <label style="font-weight: 600; font-size: 12px;">Start Date</label><br/>
            <input type="date" id="startDate" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;" />
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">End Date</label><br/>
            <input type="date" id="endDate" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;" />
          </div>
        </div>
        <div id="excelBtnContainer" style="margin-bottom: 10px;"></div>
        <div style="overflow-x: auto; max-height: 280px;">
          <table style="width:100%; border-collapse: collapse; font-size: 12px;">
            <thead style="background-color: #edf2f7;">
              <tr>
                <th style="padding: 4px;">#</th>
                <th style="padding: 4px;">Ref</th>
                <th style="padding: 4px;">Col</th>
                <th style="padding: 4px;">Gateway</th>
                <th style="padding: 4px;">Accountant</th>
                <th style="padding: 4px;">Staus</th>
                <th style="padding: 4px;">Date</th>
                <th style="padding: 4px;">DR</th>
                <th style="padding: 4px;">CR</th>
                <th style="padding: 4px;">Bal</th>
              </tr>
            </thead>
            <tbody id="paymentTableBody">
              ${generateTableRows(filteredData)}
            </tbody>
          </table>
        </div>
        <div id="tableDownloadBtn" style="margin-top: 12px; text-align: right; "></div>
      `,
      width: "75%",
      showConfirmButton: false,
      didOpen: () => {
        const tableBody = document.getElementById("paymentTableBody");

        const applyFilters = () => {
          const startDate = document.getElementById("startDate").value;
          const endDate = document.getElementById("endDate").value;

          const filtered = data.filter((item) => {
            const itemDate = moment(item.PaymentDate);
            const start = startDate ? moment(startDate) : null;
            const end = endDate ? moment(endDate) : null;

            const dateMatch =
              (!start || itemDate.isSameOrAfter(start, "day")) &&
              (!end || itemDate.isSameOrBefore(end, "day"));

            return dateMatch;
          });

          setFilteredData(filtered);
          updateTable(filtered);
        };

        const updateTable = (filtered) => {
          tableBody.innerHTML = generateTableRows(filtered);

          const downloadContainer = document.getElementById("tableDownloadBtn");
          if (downloadContainer) {
            downloadContainer.innerHTML = "";

            if (filtered.length > 0) {
              const button = document.createElement("button");
              button.innerHTML = `
                <span style="
                  display: inline-flex;
                  align-items: center;
                  gap: 6px;
                  font-size: 13px;
                  background-color: #2b6cb0;
                  color: white;
                  padding: 6px 12px;
                  border-radius: 6px;
                  border: none;
                  cursor: pointer;
                ">
                  <svg data-slot="icon" height="16" width="16" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                  </svg>
                  Download Excel
                </span>
              `;
              button.onclick = () => {
                const clean = []
                filtered.forEach(entry =>{
                  clean.push({
                    "Ref":entry.paymentReferenceNo,
                    "Accountant":entry.Accountant,
                    "status":entry.status,
                    "Date":entry.PaymentDate,
                    "Gateway":entry.type,
                    "DR":entry.drAmount,
                    "CR":entry.crAmount ,
                    "Balance":entry.previousBalance
                  })
                })
                const excelBtn = downloadExcel( clean,`${bank.NAME} statement`);
                if (excelBtn instanceof HTMLElement) {
                  excelBtn.click();
                }
              };
              downloadContainer.appendChild(button);
            }
          }
        };

        ["startDate", "endDate"].forEach((id) => {
          const el = document.getElementById(id);
                    if (el) {
            el.addEventListener("input", applyFilters);
            el.addEventListener("change", applyFilters);
          }
        });

        // Initial render
        updateTable(filteredData);
      },
    });
  };

  return (
    <button
      onClick={showModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <ArrowTrendingUpIcon className="w-4 h-4 inline-block" />
      Generate Bank Statement
    </button>
  );
}
