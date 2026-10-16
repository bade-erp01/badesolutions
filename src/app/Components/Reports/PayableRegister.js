"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import {downloadExcel,Dencrypt} from "../../../../Functions/Functions"
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import {plsWait,ErrorMessage,SuccessToast, Encrypt} from "../../../../Functions/Mics"
import { escapeHtml } from "@/lib/security/escapeHtml";

export default function PayableRegister({ customers,userData ,baseUrl}) {

  const [data,setData] = useState([]);
  // initialize to empty array (don't rely on `data` at init)
  const [filteredData, setFilteredData] = useState([]);
  const [customersList] = useState(customers || []);


  //   fetch data from server
   const fetchData = async () => {
      try {
        plsWait("Loading Report Data...");
        const res = await fetch(`${baseUrl}/api/PayableReports`, {
          method: "GET",
           headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
              access: `${Encrypt(userData.user._id)}`,
              sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
            },
        });
  
        if (!res.ok) throw new Error("Failed to fetch product data");
  
        const fetchedData = await res.json();
        // decrypt/assign data
        const transactions = Dencrypt(fetchedData.Transactions) || [];
        setData(transactions);
        // set initial filtered data (remove pending items as original intent)
        setFilteredData(transactions.filter(item => item.status?.toLowerCase() !== "pending"));
        // Pass the actual fetched lists/data into showModal so the modal renders immediately with data
        showModal(transactions)
      } catch (error) {
        ErrorMessage(error.message);
      }
    };


  const getCustomer = (id) => {
    const selectedCustomer = customersList.find((cust) => cust._id === id);
    return selectedCustomer?.Name || "";
  };


  const generateTableRows = (data) => {
    return data
      .map(
        (item, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px;">${escapeHtml(index + 1)}</td>
        <td style="padding: 4px; text-align: left;">${escapeHtml((item.billReferenceNo || item.paymentReferenceNo || "").toString().trim())}</td>
        <td style="padding: 4px;">${escapeHtml(getCustomer(item.vendor))}</td>
        <td style="padding: 4px;">${escapeHtml(item?.status?.toUpperCase())}</td>
        <td style="padding: 4px;">${escapeHtml(item.AccountatntId || item.Accountant || "")}</td>
        <td style="padding: 4px;">${escapeHtml(moment(item.PaymentDate).format("YYYY-MM-DD"))}</td>
        <td style="padding: 4px;">
        <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px;">
        ${escapeHtml(item.ledgerStatus?.toUpperCase() || "")}
        </span>
        </td>
        <td style="padding: 4px;">${escapeHtml(item.cr ? (item.Amount || item.crAmount || 0).toLocaleString(): (0).toLocaleString())}</td>
        <td style="padding: 4px;">${escapeHtml(item.dr ? (item.Amount || item.drAmount || 0).toLocaleString(): (0).toLocaleString())}</td>
        <td style="padding: 4px;">${escapeHtml(item?.Balance || 0.00)}</td>
      </tr>
    `
      )
      .join("");
  };

  // showModal now accepts the source data (transactions) to avoid relying on async state update
  const showModal = (sourceData) => {
    const baseData = (sourceData || data) || [];
    // apply original "not pending" filter for initial render
    const initialFiltered = baseData.filter(item => item.status?.toLowerCase() !== "pending");

    Swal.fire({
      title: "Payable Transactions",
      html: `
        <style> tr:hover { background-color: #f7fafc; } @media (max-width: 639px) { .swal2-html-container input, .swal2-html-container select, .swal2-html-container textarea { font-size: 16px !important; } } </style>
        <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
          <div>
            <label style="font-weight: 600; font-size: 12px;">Start Date</label><br/>
            <input type="date" id="startDate" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;" />
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">End Date</label><br/>
            <input type="date" id="endDate" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;" />
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Trace</label><br/>
            <select id="typeFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              <option value="CN">Credit Note</option>
              <option value="DN">Debit Note</option>
              <option value="Equity">Equity</option>
              <option value="Payment">Payment</option>
              <option value="Purchase">Purchase</option>
              <option value="Reversed">Reversed</option>
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Suppliers</label><br/>
            <select id="customerFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${customersList
                .map((c) => `<option value="${escapeHtml(c._id)}">${escapeHtml(c.Name)}</option>`)
                .join("")}
            </select>
          </div>
        </div>
        <div id="excelBtnContainer" style="margin-bottom: 10px;"></div>
        <div style="overflow-x: auto; max-height: 280px;">
          <table style="width:100%; border-collapse: collapse; font-size: 12px;">
            <thead style="background-color: #edf2f7;">
              <tr>
                <th style="padding: 4px;">#</th>
                <th style="padding: 4px;">Ref</th>
                <th style="padding: 4px;">Vendor</th>
                <th style="padding: 4px;">Trace</th>
                <th style="padding: 4px;">Accountant</th>
                <th style="padding: 4px;">Date</th>
                <th style="padding: 4px;">Status</th>
                <th style="padding: 4px;">CR</th>
                <th style="padding: 4px;">DR</th>
                <th style="padding: 4px;">BAL.</th>
              </tr>
            </thead>
            <tbody id="paymentTableBody">
              ${generateTableRows(initialFiltered)}
            </tbody>
          </table>
        </div>
        <div id="tableDownloadBtn" style="margin-top: 12px; text-align: right;"></div>
      `,
      width: "max(75%, min(95vw, 640px))",
      showConfirmButton: false,
      didOpen: () => {
        const tableBody = document.getElementById("paymentTableBody");

        const applyFilters = () => {
          const startDate = document.getElementById("startDate").value;
          const endDate = document.getElementById("endDate").value;
          const type = document.getElementById("typeFilter").value;
          const customer = document.getElementById("customerFilter").value;

          const filtered = (baseData || []).filter((item) => {
            const itemDate = moment(item.PaymentDate);
            const start = startDate ? moment(startDate) : null;
            const end = endDate ? moment(endDate) : null;

            const dateMatch =
              (!start || itemDate.isSameOrAfter(start, "day")) &&
              (!end || itemDate.isSameOrBefore(end, "day"));
            const typeMatch =
              !type || item.status?.toLowerCase() === type.toLowerCase();
            const customerMatch =
              !customer || item.vendor?.toLowerCase() === customer.toLowerCase();
           
            return dateMatch && typeMatch && customerMatch ;
          });

          setFilteredData(filtered);
          updateTable(filtered);
        };

        const updateTable = (filtered) => {
          // eslint-disable-next-line no-unsanitized/property -- every interpolated value is escaped with escapeHtml
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
                    "Ref":entry.paymentReferenceNo || entry.billReferenceNo,
                    "Accountant":entry.Accountant || entry.AccountatntId,
                    "Vendor":getCustomer(entry.vendor),
                    "status":entry.ledgerStatus,
                    "Date":moment(entry.PaymentDate).format('YYYY-MM-DD'),
                    "Credit":`${entry.cr ? (entry.Amount || entry.crAmount || 0).toLocaleString(): (0).toLocaleString()}`,
                    "Debit":`${entry.dr ? (entry.Amount || entry.crAmount || 0).toLocaleString(): (0).toLocaleString()}`,
                    "Bal": entry.Balance
                  })
                })
                const excelBtn = downloadExcel( clean,"Payable Transactions");
                if (excelBtn instanceof HTMLElement) {
                  excelBtn.click();
                }
              };
              downloadContainer.appendChild(button);
            }
          }
        };

        ["startDate", "endDate", "typeFilter", "customerFilter", ].forEach((id) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("input", applyFilters);
            el.addEventListener("change", applyFilters);
          }
        });

        // Initial render using computed initialFiltered
        updateTable(initialFiltered);
      },
    });
  };

  return (
    <button
      onClick={
        fetchData
      }
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <ArrowTrendingUpIcon className="w-4 h-4 inline-block" />
      Generate Payable Transactions
    </button>
  );
}
