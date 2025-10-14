"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import { plsWait ,Encrypt} from "../../../../Functions/Mics";
import { downloadExcel } from "../../../../Functions/Functions";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

export default function StockReportModal({ baseUrl, userData }) {
  const [filteredData, setFilteredData] = useState([]);
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      plsWait("Loading Stock Valuation Report...");
      const res = await fetch(`${baseUrl}/api/Products/report`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userData.business.tenantId}`,
          dbConnect: `Bearer ${userData.business.rustyRoof}`,
          access: `${Encrypt(userData.user._id)}`,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch product data");

      const fetchedData = await res.json();
      setData(fetchedData);

      const initialFilteredData = fetchedData?.inventoryItem?.filter(
        (item) => item.billStatus?.toLowerCase() !== "draft"
      );
      setFilteredData(initialFilteredData);
      showModal()
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const getVendor = (id) => {
    const selectedCustomer = data?.customersList.find((cust) => cust._id === id);
    return selectedCustomer?.Name || "";
  };

  const getSTore = (id) => {
    const selectedBank = data?.StoresList.find((bank) => bank._id === id);
    return selectedBank?.WHName || "";
  };

  const getValue = (productId, caseQty, pcsQty) => {
    const product = data.prodductList.find((prod) => prod._id === productId);
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
    if (!data) {
      Swal.fire("Error", "Data not loaded. Please try again.", "error");
      return;
    }

    Swal.fire({
      title: "Stock Value Report",
      html: `
        <style> tr:hover { background-color: #f7fafc; } </style>
        <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
          <div>
            <label style="font-weight: 600; font-size: 12px;">Vendors</label><br/>
            <select id="customerFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${data.vendorList
                .map((c) => `<option value="${c._id}">${c.NAME}</option>`)
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Store</label><br/>
            <select id="Store" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${data.StoresList.map(
                (b) => `<option value="${b._id}">${b.WHName}</option>`
              ).join("")}
            </select>
          </div>
           <div>
            <label style="font-weight: 600; font-size: 12px;">Prdouct</label><br/>
            <select id="Prdouct" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${data.prodductList.map(
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
    });
  };
  
  return (
    <button
      onClick={fetchData}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <ArrowTrendingUpIcon className="w-4 h-4 inline-block" />
      Generate Stock Valuation Report
    </button>
  );
}
