"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import { plsWait, Encrypt, ErrorMessage } from "../../../../Functions/Mics";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

export default function StockReportModal({ baseUrl, userData }) {
  const [filteredData, setFilteredData] = useState([]);
  const [stores, setStores] = useState([]);
  const [vendorList, setVendorList] = useState([]);
  const [productList, setProductList] = useState([]);
  const [data, setData] = useState();

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
      setStores(fetchedData.storeList || []);
      setVendorList(fetchedData.vendorList || []);
      setProductList(fetchedData.productList || []);

      // build maps from fetched data so we don't rely on React state (which updates async)
      const prodMap = {};
      (fetchedData.productList || []).forEach((p) => {
        if (p && p._id) prodMap[p._id] = p;
      });
      const vendorMap = {};
      (fetchedData.vendorList || []).forEach((v) => {
        if (v && v._id) vendorMap[v._id] = v;
      });
      const storeMap = {};
      (fetchedData.storeList || []).forEach((s) => {
        if (s && s._id) storeMap[s._id] = s;
      });

      // use inventory from fetchedData directly to avoid reading stale state
      const inventory = Array.isArray(fetchedData.inventoryItem)
        ? fetchedData.inventoryItem
        : [];

      // local helpers that use the fresh maps
      const localGetProductName = (id) => {
        const p = prodMap[id];
        return p?.Name || "";
      };
      const localGetVendor = (id) => {
        const v = vendorMap[id];
        return v?.Name || v?.NAME || "";
      };
      const localGetStore = (id) => {
        const s = storeMap[id];
        return s?.WHName || "";
      };
      const localGetProductBuyingPrice = (id) => {
        const p = prodMap[id];
        return p?.BuyingPrice || 0;
      };
      const localGetValue = (productId, caseQty, pcsQty) => {
        const product = prodMap[productId];
        if (!product) return 0;
        const buyingPrice = Number(product.BuyingPrice) || 0;
        const pieces = Number(product.Pieces) || 1;
        const unitPrice = pieces ? buyingPrice / pieces : 0;
        const pieceCost = (pcsQty || 0) * unitPrice;
        const caseCost = (caseQty || 0) * buyingPrice;
        const totalCost = pieceCost + caseCost;
        return parseFloat(totalCost.toFixed(2));
      };

      // build initial data with products and store products, filter out product with no stock
      const initialFilteredData = inventory
        .filter(
          (item) =>
            item &&
            ((item.currentQty && item.currentQty > 0) ||
              (item.pcs && item.pcs > 0))
        )
        .map((item) => {
          return {
            productId: item.productId,
            productName: localGetProductName(item.productId),
            ADCcode: item.ADCcode || item.ACDcode || "",
            Vendor: localGetVendor(item.Vendor),
            VendorId: item.Vendor, // keep id for filtering
            WHIDS: item.WHIDS,
            currentQty: item.currentQty || 0,
            pcs: item.pcs || 0,
            LastBatchDate: item.LastBatchDate
              ? moment(item.LastBatchDate).format("YYYY-MM-DD")
              : "",
            ExpDate: item.ExpDate || "",
            VendorPrice: localGetProductBuyingPrice(item.productId),
            value: localGetValue(item.productId, item.currentQty, item.pcs),
          };
        });

      setFilteredData(initialFilteredData);
      // pass fresh lists and rows to showModal so it uses the fresh fetched data (not stale React state)
      showModal(initialFilteredData, {
        stores: fetchedData.storeList || [],
        vendors: fetchedData.vendorList || [],
        products: fetchedData.productList || [],
        prodMap,
      });
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  // keep these for other uses (they will use React state if necessary)
  const getVendor = (id) => {
    const selectedCustomer = vendorList.find((cust) => cust._id === id);
    return selectedCustomer?.Name || selectedCustomer?.NAME || "";
  };

  const getStore = (id) => {
    const store = stores.find((s) => s._id === id);
    return store?.WHName || "";
  };

  const getProductName = (id) => {
    const product = productList.find((p) => p._id === id);
    return product?.Name || "";
  };

  const getProductBuyingPrice = (id) => {
    const product = productList.find((p) => p._id === id);
    return product?.BuyingPrice || 0;
  };

  const getValue = (productId, caseQty, pcsQty) => {
    if (!data || !Array.isArray(data.productList)) return 0;
    const product = data.productList.find((prod) => prod._id === productId);
    if (!product) return 0;
    const buyingPrice = Number(product.BuyingPrice) || 0;
    const pieces = Number(product.Pieces) || 1;
    const unitPrice = pieces ? buyingPrice / pieces : 0;
    const pieceCost = (pcsQty || 0) * unitPrice;
    const caseCost = (caseQty || 0) * buyingPrice;
    const totalCost = pieceCost + caseCost;
    return parseFloat(totalCost.toFixed(2));
  };

  // showModal accepts rows and fresh lists (so UI renders immediately using fresh data)
  const showModal = (rowsData = [], lists = {}) => {
    // lists: { stores, vendors, products, prodMap }
    const usedStores = Array.isArray(lists.stores) ? lists.stores : stores;
    const usedVendors = Array.isArray(lists.vendors)
      ? lists.vendors
      : vendorList;
    const usedProducts = Array.isArray(lists.products)
      ? lists.products
      : productList;
    const prodMap = lists.prodMap || {};

    const localGetStore = (id) => {
      const s = (usedStores || []).find((x) => x._id === id) || (lists.stores && lists.stores.find((x) => x._id === id));
      return s?.WHName || "";
    };
    const localGetProductName = (id) => {
      const p = (usedProducts || []).find((x) => x._id === id) || prodMap[id];
      return p?.Name || "";
    };
    const localGetVendor = (id) => {
      const v = (usedVendors || []).find((x) => x._id === id);
      return v?.Name || v?.NAME || "";
    };
    const localGetValue = (item) => {
      // attempt to use prodMap if available, else fallback to outer getValue
      const product = prodMap[item.productId] || (data && data.productList && data.productList.find((p) => p._id === item.productId));
      if (!product) return 0;
      const buyingPrice = Number(product.BuyingPrice) || 0;
      const pieces = Number(product.Pieces) || 1;
      const unitPrice = pieces ? buyingPrice / pieces : 0;
      const pieceCost = (item.pcs || 0) * unitPrice;
      const caseCost = (item.currentQty || 0) * buyingPrice;
      return parseFloat((pieceCost + caseCost).toFixed(2));
    };

    const getTotalValueLocal = (rows) =>
      (rows || [])
        .reduce((acc, r) => acc + Number(localGetValue(r) || 0), 0)
        .toFixed(2);

    const generateTableRowsLocal = (rows) => {
      const rowsHtml = rows
        .map(
          (item, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 4px;">${index + 1}</td>
          <td style="padding: 4px;">${localGetStore(item.WHIDS)}</td>
          <td style="padding: 4px;">${(item.productName || localGetProductName(item.productId) || "").trim()}</td>
          <td style="padding: 4px;">${item.ADCcode || ""}</td>
          <td style="padding: 4px;">${item.Vendor || localGetVendor(item.VendorId)}</td>
          <td style="padding: 4px;">${item.currentQty}</td>
          <td style="padding: 4px;">${item.pcs}</td>
          <td style="padding: 4px;">${item.LastBatchDate}</td>
          <td style="padding: 4px;">${item.ExpDate}</td>
          <td style="padding: 4px;">${item.VendorPrice}</td>
          <td style="padding: 4px;">${localGetValue(item)}</td>
        </tr>`
        )
        .join("");

      const totalRow = `
        <tr style="font-weight: bold; background-color: #f1f5f9;">
          <td colspan="10" style="padding: 6px; text-align: right;">Total Stock Value</td>
          <td style="padding: 6px;">${getTotalValueLocal(rows)}</td>
        </tr>`;

      return rowsHtml + totalRow;
    };

    const rowsToRender = Array.isArray(rowsData) ? rowsData : [];

    const htmlContent = `
      <style> tr:hover { background-color: #f7fafc; } </style>
      <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
        <div>
          <label style="font-weight: 600; font-size: 12px;">Vendors</label><br/>
          <select id="customerFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
            <option value="">All</option>
            ${(usedVendors || []).map((c) => `<option value="${c._id}">${c.Name || c.NAME || ""}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px;">Store</label><br/>
          <select id="Store" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
            <option value="">All</option>
            ${(usedStores || []).map((b) => `<option value="${b._id}">${b.WHName}</option>`).join("")}
          </select>
        </div>
        <div>
          <label style="font-weight: 600; font-size: 12px;">Product</label><br/>
          <select id="Product" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
            <option value="">All</option>
            ${((usedProducts || []).slice()).sort((a, b) => (a.Name || "").localeCompare(b.Name || "")).map((b) => `<option value="${b._id}">${b.Name}</option>`).join("")}
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
            ${generateTableRowsLocal(rowsToRender)}
          </tbody>
        </table>
      </div>
      <div id="tableDownloadBtn" style="margin-top: 12px; text-align: right;"></div>
    `;

    Swal.fire({
      title: "Inventory Valuation Report",
      html: htmlContent,
      width: "80%",
      showConfirmButton: false,
    });

    // after modal is rendered, wire up filters and download buttons
    setTimeout(() => {
      const container = document.querySelector(".swal2-html-container");
      if (!container) return;

      const vendorSelect = container.querySelector("#customerFilter");
      const storeSelect = container.querySelector("#Store");
      const productSelect = container.querySelector("#Product");
      const tableBody = container.querySelector("#paymentTableBody");
      const excelBtnContainer = container.querySelector("#excelBtnContainer");

      // keep original rows for filtering
      const originalRows = Array.isArray(rowsToRender) ? rowsToRender : [];

      const renderTable = (rows) => {
        tableBody.innerHTML = generateTableRowsLocal(rows);
      };

      const filterRows = () => {
        const vendorId = vendorSelect ? vendorSelect.value : "";
        const storeId = storeSelect ? storeSelect.value : "";
        const productId = productSelect ? productSelect.value : "";

        const filtered = originalRows.filter((item) => {
          if (vendorId && String(item.VendorId || "") !== String(vendorId)) return false;
          if (storeId && String(item.WHIDS || "") !== String(storeId)) return false;
          if (productId && String(item.productId || "") !== String(productId)) return false;
          return true;
        });

        renderTable(filtered);
      };

      if (vendorSelect) vendorSelect.addEventListener("change", filterRows);
      if (storeSelect) storeSelect.addEventListener("change", filterRows);
      if (productSelect) productSelect.addEventListener("change", filterRows);

      // Download CSV (Excel-friendly) function
      const downloadCSV = (rows) => {
        if (!rows || !rows.length) {
          ErrorMessage("No data to export.");
          return;
        }
        const headers = ["Store", "Product", "Code", "Vendor", "Case", "Pcs", "LastPurchDate", "ExpiryDate", "Price", "Value"];
        const csvRows = [
          headers.join(","),
          ...rows.map((r) =>
            [
              `"${localGetStore(r.WHIDS)}"`,
              `"${(r.productName || localGetProductName(r.productId) || "").replace(/"/g, '""')}"`,
              `"${(r.ADCcode || "").replace(/"/g, '""')}"`,
              `"${(r.Vendor || localGetVendor(r.VendorId || r.Vendor) || "").replace(/"/g, '""')}"`,
              r.currentQty,
              r.pcs,
              `"${r.LastBatchDate}"`,
              `"${r.ExpDate}"`,
              r.VendorPrice,
              localGetValue(r),
            ].join(",")
          ),
        ].join("\n");

        const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `inventory_valuation_${moment().format("YYYYMMDD_HHmmss")}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      };

      // Open printable window for PDF (user can "Save as PDF" from print dialog)
      const openPrintWindow = (rows) => {
        const win = window.open("", "_blank", "width=900,height=700");
        if (!win) {
          ErrorMessage("Unable to open print window. Please allow popups.");
          return;
        }
        const tableHtml = `
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
                  <th>#</th>
                  <th>Store</th>
                  <th>Product</th>
                  <th>Code</th>
                  <th>Vendor</th>
                  <th>Case</th>
                  <th>Pcs</th>
                  <th>Last Purch. Date</th>
                  <th>Expiry Date</th>
                  <th>Price</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                ${generateTableRowsLocal(rows)}
              </tbody>
            </table>
            <p>Total stock value: ${getTotalValueLocal(rows)}</p>
          </body>
          </html>
        `;
        win.document.write(tableHtml);
        win.document.close();
        setTimeout(() => {
          win.print();
        }, 500);
      };

      // buttons
      const exportCSVBtn = document.createElement("button");
      exportCSVBtn.textContent = "Download Excel (CSV)";
      exportCSVBtn.style.padding = "6px 10px";
      exportCSVBtn.style.cursor = "pointer";
      exportCSVBtn.className = "rounded-md";
      exportCSVBtn.onclick = () => {
        const vendorId = vendorSelect ? vendorSelect.value : "";
        const storeId = storeSelect ? storeSelect.value : "";
        const productId = productSelect ? productSelect.value : "";
        const filtered = originalRows.filter((item) => {
          if (vendorId && String(item.VendorId || "") !== String(vendorId)) return false;
          if (storeId && String(item.WHIDS || "") !== String(storeId)) return false;
          if (productId && String(item.productId || "") !== String(productId)) return false;
          return true;
        });
        downloadCSV(filtered);
      };

      const exportPdfBtn = document.createElement("button");
      exportPdfBtn.textContent = "Download PDF";
      exportPdfBtn.style.padding = "6px 10px";
      exportPdfBtn.style.cursor = "pointer";
      exportPdfBtn.className = "rounded-md";
      exportPdfBtn.onclick = () => {
        const vendorId = vendorSelect ? vendorSelect.value : "";
        const storeId = storeSelect ? storeSelect.value : "";
        const productId = productSelect ? productSelect.value : "";
        const filtered = originalRows.filter((item) => {
          if (vendorId && String(item.VendorId || "") !== String(vendorId)) return false;
          if (storeId && String(item.WHIDS || "") !== String(storeId)) return false;
          if (productId && String(item.productId || "") !== String(productId)) return false;
          return true;
        });
        openPrintWindow(filtered);
      };

      if (excelBtnContainer) {
        excelBtnContainer.innerHTML = "";
        excelBtnContainer.appendChild(exportCSVBtn);
        excelBtnContainer.appendChild(exportPdfBtn);
      }
    }, 100);
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
