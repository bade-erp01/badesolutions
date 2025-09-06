"use client";

import Swal from "sweetalert2";
import moment from "moment";
import { SwatchIcon } from "@heroicons/react/24/outline";
import { downloadExcel } from "../../../../Functions/Functions";

export default function StockandSalesReport({
  prouctlist,
  vendors,
  PurchaseOrderList,
  InvoiceList,
  Stores,
  inventoryItem
}) {
  const product = prouctlist || [];
  const storeList = JSON.parse(Stores || "[]");
  const vendorlist = JSON.parse(vendors || "[]");
  const invoices = JSON.parse(InvoiceList || "[]").filter(
    invoice => {
      const status = (invoice.billStatus || "").toLowerCase();
      return status !== "draft" && status !== "cancelled";
    }
  );
  // returned ordder
  const returns = JSON.parse(InvoiceList || "[]").filter(
    invoice => {
      const status = (invoice.billStatus || "").toLowerCase();
      return  status === "cancelled";
    }
  );

  // purchased
  const purchases = JSON.parse(PurchaseOrderList || "[]").filter(
    invoice => {
      const status = (invoice.status || "");
      return status === "POSTED TO WAREHOUSE" 
    }
  );
  const inventory = JSON.parse(inventoryItem || "[]");

  // find venddor
 const getVendor = (id) => {
    const selectedCustomer = vendorlist.find((cust) => cust._id === id);
    return selectedCustomer?.Name || "";
  };

  const getSTore = (id) => {
    const selectedBank = storeList.find((bank) => bank._id === id);
    return selectedBank?.WHName || "";
  };

  // prodduct Name
  const getSToreProdduct = (id) => {
    const selectedProduct = inventory.find((element) => element._id === id);
    const MainProdduct = product.find((element) => element._id === selectedProduct.productId);
    return MainProdduct?.Name || "";
  };

  const getStockAndSalesSummary = (filters) => {
    const summaryMap = new Map();

    const isWithinDateRange = (dateStr) => {
      if (!filters.startDate && !filters.endDate) return true;
      const date = moment(dateStr);
      const start = filters.startDate ? moment(filters.startDate) : null;
      const end = filters.endDate ? moment(filters.endDate) : null;
      if (start && date.isBefore(start, "day")) return false;
      if (end && date.isAfter(end, "day")) return false;
      return true;
    };

    purchases.forEach(purchase => {
      if (!isWithinDateRange(purchase.recievedDate)) return;
      if (Array.isArray(purchase.orders)) {
        purchase.orders.forEach(order => {
          const item = order.item || {};
          const id = order.storeProductId || order.storeproductId;
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId ||  order.storeproductId,
            Vendor: item.Vendor || "",
            Store: purchase.WHID || "",
            Purchased: 0,
            Sold: 0,
            Stock: 0,
            pcs:0,
            rStock:0,
            rPcs:0,
            productId:item._id
          };
          existing.Purchased += order.Qty || 0;
          summaryMap.set(id, existing);
        });
      }
    });

    // for case order.pcsReq || 0
    invoices.forEach(invoice => {
      if (!isWithinDateRange(invoice.startDate)) return;
      if (Array.isArray(invoice.orders)) {
        invoice.orders.forEach(order => {
          const item = order.item || {};
          const id = order.storeProductId ||  order.storeproductId
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId ||  order.storeproductId,
            Vendor: item.Vendor || "",
            Store: invoice.whId || "",
            Purchased: 0,
            Sold: 0,// for case
            pcs:0,
            Stock: 0,
            rStock:0,
            rPcs:0,
            productId:item._id
          };
          existing.Sold += order.Qty || 0;
          summaryMap.set(id, existing);
        });
      }
    });

    // for pcs
    invoices.forEach(invoice => {
      if (!isWithinDateRange(invoice.startDate)) return;
      if (Array.isArray(invoice.orders)) {
        invoice.orders.forEach(order => {
          const item = order.item || {};
          const id = order.storeProductId ||  order.storeproductId;
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId ||  order.storeproductId,
            Vendor: item.Vendor || "",
            Store: invoice.whId || "",
            Purchased: 0,
            Sold: 0,
            pcs:0,
            Stock: 0,
            rStock:0,
            rPcs:0,
            productId:item._id
          };
          existing.pcs += order.pcsReq || 0;
          summaryMap.set(id, existing);
        });
      }
    });

    // for returns case
    returns.forEach(invoice => {
      if (!isWithinDateRange(invoice.startDate)) return;
      if (Array.isArray(invoice.orders)) {
        invoice.orders.forEach(order => {
          const item = order.item || {};
          const id = order.storeProductId ||  order.storeproductId;
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId ||  order.storeproductId,
            Vendor: item.Vendor || "",
            Store: invoice.whId || "",
            Purchased: 0,
            Sold: 0,
            pcs:0,
            Stock: 0,
            rStock:0,//returneed case
            rPcs:0,
            productId:item._id
          };
          existing.rStock += order.Qty || 0;
          summaryMap.set(id, existing);
        });
      }
    });

    // for returned pcs
     // for returns case
    returns.forEach(invoice => {
      if (!isWithinDateRange(invoice.startDate)) return;
      if (Array.isArray(invoice.orders)) {
        invoice.orders.forEach(order => {
          const item = order.item || {};
          const id = order.storeProductId ||  order.storeproductId;
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId || order.storeproductId,
            Vendor: item.Vendor || "",
            Store: invoice.whId || "",
            Purchased: 0,
            Sold: 0,
            pcs:0,
            Stock: 0,
            rStock:0,
            rPcs:0,//returneed pcsReq
            productId:item._id
          };
          existing.rPcs += order.pcsReq || 0;
          summaryMap.set(id, existing);
        });
      }
    });

    inventory.forEach(item => {
      const id = item._id;
      const existing = summaryMap.get(id);
      if (existing) {
        existing.Stock = `Case: ${item.currentQty || 0},${" "} Pcs: ${item.pcs || 0}`;
        summaryMap.set(id, existing);
      }
    });

    return Array.from(summaryMap.values()).filter(item => {
      const matchVendor = filters.vendor ? item.Vendor === filters.vendor : true;
      const matchStore = filters.store ? item.Store === filters.store : true;
      const matchProduct = filters.product ? item.productId === filters.product : true;
      return matchVendor && matchStore && matchProduct;
    });
  };

  const showModal = () => {
    Swal.fire({
      title: "Stock and Sales Report",
      html: `
        <div style="margin-bottom: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;">
          <div>
            <label style="font-size: 12px; color: #4a5568;">Start Date</label>
            <input type="date" id="startDate" style="width: 100%; padding: 4px; font-size: 12px;  border: 1px solid #cbd5e0; border-radius: 4px;" />
          </div>
          <div>
            <label style="font-size: 12px; color: #4a5568;">End Date</label>
            <input type="date" id="endDate" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;" />
          </div>
          <div>
            <label style="font-size: 12px; color: #4a5568;">Vendor</label>
            <select id="vendor" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
              <option value="">All</option>
              ${vendorlist.map(v => `<option value="${v._id}">${v.Name}</option>`).join("")}
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #4a5568;">Store</label>
            <select id="store" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
              <option value="">All</option>
              ${storeList.map(s => `<option value="${s._id}">${s.WHName}</option>`).join("")}
            </select>
          </div>
          <div>
            <label style="font-size: 12px; color: #4a5568;">Product</label>
            <select id="product" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
              <option value="">All</option>
              ${product.map(p => `<option value="${p._id}" disabled readOnly>${p.Name}</option>`).join("")}
            </select>
          </div>
        </div>

        <div id="reportTable" style="max-height: 300px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px;"></div>

        <div style="margin-top: 12px; text-align: right;">
          <button id="downloadExcelBtn" class="swal2-confirm swal2-styled" style="
            background-color: #2b6cb0;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
          ">
            ⬇ Download Excel
          </button>
        </div>
      `,
      width: "80%",
      showConfirmButton: false,
      didOpen: () => {
        const renderTable = () => {
          const filters = {
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value,
            vendor: document.getElementById("vendor").value,
            store: document.getElementById("store").value,
            product: document.getElementById("product").value
          };

          const data = getStockAndSalesSummary(filters);
          const tableHTML = `
            <table style="width:100%; border-collapse: collapse; font-size: 12px;">
              <thead style="position: sticky; top: 0; background-color: #edf2f7;">
                <tr>
                  <th style="padding: 6px; text-align: left;">Product</th>
                  <th style="padding: 6px; text-align: left;">Vendor</th>
                  <th style="padding: 6px; text-align: left;">Store</th>
                  <th style="padding: 6px; text-align: right;">Purchased</th>
                  <th style="padding: 6px; text-align: right;">Case Sold</th>
                  <th style="padding: 6px; text-align: right;">Pcs Sold</th>
                  <th style="padding: 6px; text-align: right;">Case Retured</th>
                  <th style="padding: 6px; text-align: right;">Pcs Retured</th>
                  <th style="padding: 6px; text-align: right;">Avail. Stock</th>
                </tr>
              </thead>
              <tbody>
                ${data.map(item => `
                  <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 6px;">${getSToreProdduct(item.Product)}</td>
                    <td style="padding: 6px;">${getVendor(item.Vendor)}</td>
                    <td style="padding: 6px;">${getSTore(item.Store)}</td>
                    <td style="padding: 6px; text-align: right;">${item.Purchased} Case</td>
                    <td style="padding: 6px; text-align: right;">${item.Sold}</td>
                    <td style="padding: 6px; text-align: right;">${item.pcs}</td>
                    <td style="padding: 6px; text-align: right;">${item.rStock}</td>
                    <td style="padding: 6px; text-align: right;">${item.rPcs}</td>
                    <td style="padding: 6px; text-align: right;">${item.Stock}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `;
          document.getElementById("reportTable").innerHTML = tableHTML;
        };

        renderTable();

        ["startDate", "endDate", "vendor", "store", "product"].forEach(id => {
          document.getElementById(id).addEventListener("change", renderTable);
        });

        document.getElementById("downloadExcelBtn").onclick = () => {
          const filters = {
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value,
            vendor: document.getElementById("vendor").value,
            store: document.getElementById("store").value,
            product: document.getElementById("product").value
          };

          const data = getStockAndSalesSummary(filters);

          const excelData = data.map(item => ({
            Product: getSToreProdduct(item.Product),
            Vendor: getVendor(item.Vendor),
            Store: getSTore(item.Store),
            Purchased: `${item.Purchased}`,
            "Case Sold": item.Sold,
            "pcs Sold": item.pcs,
            "Returned Case" : item.rStock,
            "Returned Pcs" : item.rPcs,
            "current Stock": item.Stock
          }));

          downloadExcel(excelData, "Stock_and_Sales_Report");
        };
      }
    });
  };

  return (
    <button
      onClick={showModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <SwatchIcon className="h-5 w-5" />
      Stock & Sales Report
    </button>
  );
}
