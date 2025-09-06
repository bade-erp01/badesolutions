"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import { downloadExcel } from "../../../../Functions/Functions";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

export default function StockReportModal({
  data,
  Stores,
  vendors,
  prodductList,
}) {
  const [filteredData, setFilteredData] = useState(
    JSON.parse(data).filter(
      (item) => item.billStatus?.toLowerCase() !== "draft"
    )
  );
  const [StoresList] = useState(JSON.parse(Stores) || []);
  const [customersList] = useState(JSON.parse(vendors) || []);

  const getVendor = (id) => {
    const selectedCustomer = customersList.find((cust) => cust._id === id);
    return selectedCustomer?.Name || "";
  };

  const getSTore = (id) => {
    const selectedBank = StoresList.find((bank) => bank._id === id);
    return selectedBank?.WHName || "";
  };

  const getValue = (productId, caseQty, pcsQty) => {
    const product = prodductList.find((prod) => prod._id === productId);
    if (!product?.BuyingPrice || !product?.Pieces) return 0;

    const unitPrice = product.BuyingPrice / product.Pieces;
    const pieceCost = pcsQty * unitPrice;
    const caseCost = caseQty * product.BuyingPrice;
    const totalCost = pieceCost + caseCost;

    return parseFloat(totalCost.toFixed(1));
  };

  const getTotalValue = (data) => {
    return data
      .reduce(
        (acc, item) =>
          acc + getValue(item.productId, item.currentQty, item.pcs),
        0
      )
      .toFixed(2);
  };

  const generateTableRows = (data) => {
    const rows = data
      .map(
        (item, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px;">${index + 1}</td>
        <td style="padding: 4px;">${getSTore(item.WHIDS)}</td>
        <td style="padding: 4px;">${item.productName.trim()}</td>
        <td style="padding: 4px;">${item.ADCcode}</td>
        <td style="padding: 4px;">${getVendor(item.Vendor)}</td>
        <td style="padding: 4px;">${item.currentQty}</td>
        <td style="padding: 4px;">${item.pcs}</td>
        <td style="padding: 4px;">${item.LastBatchDate}</td>
        <td style="padding: 4px;">${item.ExpDate}</td>
        <td style="padding: 4px;">${item.VendorPrice}</td>
        <td style="padding: 4px;">${getValue(
          item.productId,
          item.currentQty,
          item.pcs
        )}</td>
      </tr>
    `
      )
      .join("");

    const totalRow = `
      <tr style="font-weight: bold; background-color: #f1f5f9;">
        <td colspan="10" style="padding: 6px; text-align: right;">Total Stock Value</td>
        <td style="padding: 6px;">${getTotalValue(data)}</td>
      </tr>
    `;

    return rows + totalRow;
  };

  const showModal = () => {
    Swal.fire({
      title: "Stock Value Report",
      html: `
        <style> tr:hover { background-color: #f7fafc; } </style>
        <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
          <div>
            <label style="font-weight: 600; font-size: 12px;">Vendors</label><br/>
            <select id="customerFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${customersList
                .map((c) => `<option value="${c._id}">${c.Name}</option>`)
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Store</label><br/>
            <select id="Store" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${StoresList.map(
                (b) => `<option value="${b._id}">${b.WHName}</option>`
              ).join("")}
            </select>
          </div>
           <div>
            <label style="font-weight: 600; font-size: 12px;">Prdouct</label><br/>
            <select id="Prdouct" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${prodductList.map(
                (b) => `<option value="${b._id}">${b.Name}</option>`
              ).join("")}
            </select>
          </div>
        </div>
        <div id="excelBtnContainer" style="margin-bottom: 10px;"></div>
        <div style="overflow-x: auto; max-height: 280px;">
          <table style="width:100%; border-collapse: collapse; font-size: 12px;">
            <thead style="background-color: #edf2f7;">
              <tr>
                <th style="padding: 4px;">#</th>
                <th style="padding: 4px;">Store</th>
                <th style="padding: 4px;">Product</th>
                <th style="padding: 4px;">Code</th>
                <th style="padding: 4px;">Vendor</th>
                <th style="padding: 4px;">Case</th>
                <th style="padding: 4px;">Pcs</th>
                <th style="padding: 4px;">Last Purch. Date</th>
                <th style="padding: 4px;">Expiry Date</th>
                <th style="padding: 4px;">Price</th>
                <th style="padding: 4px;">Value</th>
              </tr>
            </thead>
            <tbody id="paymentTableBody">
              ${generateTableRows(filteredData)}
            </tbody>
          </table>
        </div>
        <div id="tableDownloadBtn" style="margin-top: 12px; text-align: right;"></div>
      `,
      width: "70%",
      showConfirmButton: false,
      didOpen: () => {
        const tableBody = document.getElementById("paymentTableBody");

        const applyFilters = () => {
          const customer = document.getElementById("customerFilter").value;
          const Store = document.getElementById("Store").value;
          const Prdouct = document.getElementById("Prdouct").value;

          const filtered = JSON.parse(data).filter((item) => {
            
            return (
              item.billStatus?.toLowerCase() !== "draft" &&
              (!customer ||
                item.Vendor?.toLowerCase() === customer.toLowerCase()) &&
              (!Store || item.WHIDS?.toLowerCase() === Store.toLowerCase()) &&
              (!Prdouct|| item.productId?.toLowerCase() === Prdouct.toLowerCase())
            );
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
                const clean = filtered.map((entry) => ({
                  Store: getSTore(entry.WHIDS),
                  Product: entry.productName.trim(),
                  Code: entry.ADCcode,
                  Vendor: getVendor(entry.Vendor),
                  CASE: entry.currentQty,
                  PCS: entry.pcs,                  
                  "Last Purchase Date": entry.LastBatchDate,
                  Expiry: entry.ExpDate,
                  "Vendor Price": entry.VendorPrice,
                  Value: getValue(entry.productId, entry.currentQty, entry.pcs),
                }));

                // Add total row to Excel
                clean.push({
                  Store: "",
                  Product: "",
                  Code: "",
                  Vendor: "",
                  CASE: "",
                  PCS: "",
                  "Last Purchase Date": "",
                  Expiry: "",
                  "Vendor Price": "Total",
                  Value: getTotalValue(filtered),
                });

                const excelBtn = downloadExcel(clean, `Stock Valuation Report`);
                if (excelBtn instanceof HTMLElement) {
                  excelBtn.click();
                }
              };
              downloadContainer.appendChild(button);
            }
          }
        };

        ["Store", "customerFilter","Prdouct"].forEach((id) => {
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
      Generate Stock Valuation Report
    </button>
  );
}
