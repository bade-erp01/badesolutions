"use client";

import Swal from "sweetalert2";
import moment from "moment";
import { plsWait, ErrorMessage } from "../../../../Functions/Mics";
import api from "@/lib/api";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { escapeHtml } from "@/lib/security/escapeHtml";

const idOf = (val) => {
  if (val == null) return "";
  if (typeof val === "object") return String(val._id ?? "");
  return String(val);
};

const nameOfProduct = (item, prodMap = {}) => {
  if (item?.productId && typeof item.productId === "object") {
    return item.productId.Name || item.productId.name || "";
  }
  if (item?.productName) return item.productName;
  return prodMap[idOf(item?.productId)]?.Name || "";
};

const nameOfVendor = (item) => {
  if (item?.Vendor && typeof item.Vendor === "object") {
    return item.Vendor.Name || item.Vendor.NAME || "";
  }
  if (item?.vendorName) return item.vendorName;
  return "";
};

const nameOfStore = (item) => {
  if (item?.WHIDS && typeof item.WHIDS === "object") {
    return item.WHIDS.WHName || "";
  }
  return "";
};

const calcValue = (item, prodMap = {}) => {
  const pid = idOf(item?.productId);
  const product = prodMap[pid];
  const buyingPrice =
    Number(product?.BuyingPrice) || Number(item?.VendorPrice) || 0;
  const pieces = Number(product?.Pieces) || 1;
  const unitPrice = pieces ? buyingPrice / pieces : 0;
  const caseCost = (Number(item?.currentQty) || 0) * buyingPrice;
  const pieceCost = (Number(item?.pcs) || 0) * unitPrice;
  return parseFloat((caseCost + pieceCost).toFixed(2));
};

export default function StockReportModal({ baseUrl, userData }) {
  const fetchData = async () => {
    try {
      plsWait("Loading Stock Valuation Report...");

      const res = await api.get("/api/Products/report");

      if (!res.ok) throw new Error("Failed to fetch product data");

      const fetchedData = res.data || {};
      try {
        Swal.close();
      } catch (_) {}

      const products = fetchedData.productList || [];
      const inventory = Array.isArray(fetchedData.inventoryItem)
        ? fetchedData.inventoryItem
        : Array.isArray(fetchedData.ReportInventory)
        ? fetchedData.ReportInventory
        : [];

      const prodMap = {};
      products.forEach((p) => {
        if (p?._id) prodMap[String(p._id)] = p;
      });

      const rows = inventory
        .filter(
          (item) =>
            item &&
            ((Number(item.currentQty) || 0) > 0 || (Number(item.pcs) || 0) > 0)
        )
        .map((item) => {
          const productId = idOf(item.productId);
          const vendorId = idOf(item.Vendor);
          const storeId = idOf(item.WHIDS);
          const product = prodMap[productId];

          return {
            productId,
            VendorId: vendorId,
            WHIDS: storeId,
            productName: nameOfProduct(item, prodMap),
            ADCcode: item.ADCcode || item.ACDcode || product?.ACDcode || "",
            Vendor: nameOfVendor(item) || product?.vendorName || "",
            Store: nameOfStore(item),
            currentQty: Number(item.currentQty) || 0,
            pcs: Number(item.pcs) || 0,
            LastBatchDate: item.LastBatchDate
              ? moment(item.LastBatchDate).format("YYYY-MM-DD")
              : "",
            ExpDate: item.ExpDate || "",
            VendorPrice:
              Number(product?.BuyingPrice) || Number(item.VendorPrice) || 0,
            value: calcValue(item, prodMap),
          };
        });

      // Build filter options FROM rows (so selects always have items that exist in the table)
      const vendorOpts = [];
      const storeOpts = [];
      const productOpts = [];
      const seenV = new Set();
      const seenS = new Set();
      const seenP = new Set();

      rows.forEach((r) => {
        if (r.VendorId && !seenV.has(r.VendorId)) {
          seenV.add(r.VendorId);
          vendorOpts.push({ id: r.VendorId, name: r.Vendor || r.VendorId });
        }
        if (r.WHIDS && !seenS.has(r.WHIDS)) {
          seenS.add(r.WHIDS);
          storeOpts.push({ id: r.WHIDS, name: r.Store || r.WHIDS });
        }
        if (r.productId && !seenP.has(r.productId)) {
          seenP.add(r.productId);
          productOpts.push({
            id: r.productId,
            name: r.productName || r.productId,
          });
        }
      });

      vendorOpts.sort((a, b) => a.name.localeCompare(b.name));
      storeOpts.sort((a, b) => a.name.localeCompare(b.name));
      productOpts.sort((a, b) => a.name.localeCompare(b.name));

      showModal(rows, { vendorOpts, storeOpts, productOpts });
    } catch (error) {
      try {
        Swal.close();
      } catch (_) {}
      ErrorMessage(error.message || "Something went wrong");
    }
  };

  const showModal = (rowsData = [], lists = {}) => {
    const originalRows = Array.isArray(rowsData) ? rowsData : [];
    const { vendorOpts = [], storeOpts = [], productOpts = [] } = lists;

    const getTotalValue = (rows) =>
      (rows || [])
        .reduce((acc, r) => acc + (Number(r.value) || 0), 0)
        .toFixed(2);

    const generateTableRows = (rows) => {
      const body = (rows || [])
        .map(
          (item, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 4px;">${index + 1}</td>
          <td style="padding: 4px;">${escapeHtml(item.Store || "")}</td>
          <td style="padding: 4px;">${escapeHtml((item.productName || "").trim())}</td>
          <td style="padding: 4px;">${escapeHtml(item.ADCcode || "")}</td>
          <td style="padding: 4px;">${escapeHtml(item.Vendor || "")}</td>
          <td style="padding: 4px;">${escapeHtml(item.currentQty)}</td>
          <td style="padding: 4px;">${escapeHtml(item.pcs)}</td>
          <td style="padding: 4px;">${escapeHtml(item.LastBatchDate)}</td>
          <td style="padding: 4px;">${escapeHtml(item.ExpDate)}</td>
          <td style="padding: 4px;">${escapeHtml(item.VendorPrice)}</td>
          <td style="padding: 4px;">${escapeHtml(Number(item.value || 0).toFixed(2))}</td>
        </tr>`
        )
        .join("");

      return (
        body +
        `
        <tr style="font-weight: bold; background-color: #f1f5f9;">
          <td colspan="10" style="padding: 6px; text-align: right;">Total Stock Value</td>
          <td style="padding: 6px;">${escapeHtml(getTotalValue(rows))}</td>
        </tr>`
      );
    };

    const htmlContent = `
      <style> tr:hover { background-color: #f7fafc; } @media (max-width: 639px) { .swal2-html-container input, .swal2-html-container select, .swal2-html-container textarea { font-size: 16px !important; } } </style>
      <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;">
        <div>
          <label style="font-weight: 600; font-size: 12px;">Vendors</label><br/>
          <select id="filterVendor" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
            <option value="">All</option>
            ${vendorOpts
              .map(
                (v) =>
                  `<option value="${escapeHtml(String(v.id))}">${escapeHtml(
                    v.name || ""
                  )}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px;">Store</label><br/>
          <select id="filterStore" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
            <option value="">All</option>
            ${storeOpts
              .map(
                (s) =>
                  `<option value="${escapeHtml(String(s.id))}">${escapeHtml(
                    s.name || ""
                  )}</option>`
              )
              .join("")}
          </select>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px;">Product</label><br/>
          <select id="filterProduct" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
            <option value="">All</option>
            ${productOpts
              .map(
                (p) =>
                  `<option value="${escapeHtml(String(p.id))}">${escapeHtml(
                    p.name || ""
                  )}</option>`
              )
              .join("")}
          </select>
        </div>
      </div>
      <div id="excelBtnContainer" style="margin-bottom: 10px; display:flex; gap:8px; justify-content:flex-end;"></div>
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
            ${generateTableRows(originalRows)}
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: "Inventory Valuation Report",
      html: htmlContent,
      width: "max(80%, min(95vw, 640px))",
      showConfirmButton: false,
      showCloseButton: true,
      didOpen: () => {
        const container = Swal.getHtmlContainer();
        if (!container) return;

        const vendorSelect = container.querySelector("#filterVendor");
        const storeSelect = container.querySelector("#filterStore");
        const productSelect = container.querySelector("#filterProduct");
        const tableBody = container.querySelector("#paymentTableBody");
        const excelBtnContainer = container.querySelector("#excelBtnContainer");

        const applyFilter = () => {
          const vendorId = String(vendorSelect?.value || "");
          const storeId = String(storeSelect?.value || "");
          const productId = String(productSelect?.value || "");

          const filtered = originalRows.filter((item) => {
            if (vendorId && String(item.VendorId) !== vendorId) return false;
            if (storeId && String(item.WHIDS) !== storeId) return false;
            if (productId && String(item.productId) !== productId) return false;
            return true;
          });

          // eslint-disable-next-line no-unsanitized/property -- every interpolated value is escaped with escapeHtml
          if (tableBody) tableBody.innerHTML = generateTableRows(filtered);
          return filtered;
        };

        vendorSelect?.addEventListener("change", applyFilter);
        storeSelect?.addEventListener("change", applyFilter);
        productSelect?.addEventListener("change", applyFilter);

        const downloadCSV = (rows) => {
          if (!rows?.length) {
            ErrorMessage("No data to export.");
            return;
          }
          const headers = [
            "Store",
            "Product",
            "Code",
            "Vendor",
            "Case",
            "Pcs",
            "LastPurchDate",
            "ExpiryDate",
            "Price",
            "Value",
          ];
          const csv = [
            headers.join(","),
            ...rows.map((r) =>
              [
                `"${(r.Store || "").replace(/"/g, '""')}"`,
                `"${(r.productName || "").replace(/"/g, '""')}"`,
                `"${(r.ADCcode || "").replace(/"/g, '""')}"`,
                `"${(r.Vendor || "").replace(/"/g, '""')}"`,
                r.currentQty,
                r.pcs,
                `"${r.LastBatchDate || ""}"`,
                `"${r.ExpDate || ""}"`,
                r.VendorPrice,
                r.value,
              ].join(",")
            ),
          ].join("\n");

          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `inventory_valuation_${moment().format(
            "YYYYMMDD_HHmmss"
          )}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          URL.revokeObjectURL(url);
        };

        const openPrintWindow = (rows) => {
          const win = window.open("", "_blank", "width=900,height=700");
          if (!win) {
            ErrorMessage("Unable to open print window. Please allow popups.");
            return;
          }
          // eslint-disable-next-line no-unsanitized/method -- every interpolated value is escaped with escapeHtml
          win.document.write(`
            <html>
              <head>
                <title>Inventory Valuation Report</title>
                <style>
                  table { width:100%; border-collapse: collapse; font-family: Arial, sans-serif; }
                  th, td { border: 1px solid #ccc; padding: 6px; font-size: 12px; }
                  th { background: #f3f4f6; }
                </style>
              </head>
              <body>
                <h2>Inventory Valuation Report</h2>
                <table>
                  <thead>
                    <tr>
                      <th>#</th><th>Store</th><th>Product</th><th>Code</th><th>Vendor</th>
                      <th>Case</th><th>Pcs</th><th>Last Purch. Date</th><th>Expiry Date</th>
                      <th>Price</th><th>Value</th>
                    </tr>
                  </thead>
                  <tbody>${generateTableRows(rows)}</tbody>
                </table>
              </body>
            </html>
          `);
          win.document.close();
          setTimeout(() => win.print(), 400);
        };

        const exportCSVBtn = document.createElement("button");
        exportCSVBtn.textContent = "Download Excel (CSV)";
        exportCSVBtn.style.cssText = "padding:6px 10px;cursor:pointer;";
        exportCSVBtn.onclick = () => downloadCSV(applyFilter());

        const exportPdfBtn = document.createElement("button");
        exportPdfBtn.textContent = "Download PDF";
        exportPdfBtn.style.cssText = "padding:6px 10px;cursor:pointer;";
        exportPdfBtn.onclick = () => openPrintWindow(applyFilter());

        if (excelBtnContainer) {
          excelBtnContainer.innerHTML = "";
          excelBtnContainer.appendChild(exportCSVBtn);
          excelBtnContainer.appendChild(exportPdfBtn);
        }
      },
    });
  };

  return (
    <button
      onClick={fetchData}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <ArrowTrendingUpIcon className="w-4 h-4 inline-block" />
      Inventory Valuation Report
    </button>
  );
}