"use client";

import Swal from "sweetalert2";
import moment from "moment";
import { SwatchIcon } from "@heroicons/react/24/outline";
import { downloadExcel } from "../../../../Functions/Functions";
import { Encrypt } from "../../../../Functions/Functions";
import { plsWait, ErrorMessage, SuccessToast } from "../../../../Functions/Mics";
import { useState } from "react";
import jsPDF from 'jspdf';
import autoTable from "jspdf-autotable";

export default function StockandSalesReport({
  baseUrl,
  userData
}) {

  const [loading, setLoading] = useState(false);
  const [prouctlist, setProuctlist] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [PurchaseOrderList, setPurchaseOrderList] = useState([]);
  const [InvoiceList, setInvoiceList] = useState([]);
  const [Stores, setStores] = useState([]);
  const [inventoryItem, setInventoryItem] = useState([]);
   const doc = new jsPDF();

   
  const fetchData = async () => {
    try {
      setLoading(true);
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
      // assign data
      setProuctlist(fetchedData.productList);
      setVendors(fetchedData.vendorList);
      setPurchaseOrderList(fetchedData.PurchaseOrderList);
      setInvoiceList(fetchedData.invoiceList);
      setStores(fetchedData.storeList);
      setInventoryItem(fetchedData.ReportInventory);
      showModal();
      setLoading(false);
    } catch (error) {
      ErrorMessage(error.message);
      setLoading(false);
    } 
  };

  const product = prouctlist;
  const storeList = Stores;
  const vendorlist = vendors;
  const invoices = InvoiceList.filter(
    invoice => {
      const status = invoice.billStatus.toLowerCase();
      return status !== "draft" && status !== "cancelled";
    }
  );
  // returned ordder
  const returns = InvoiceList.filter(
    invoice => {
      const status = (invoice.billStatus || "").toLowerCase();
      return status === "cancelled";
    }
  );

  // purchased
  const purchases = PurchaseOrderList.filter(
    invoice => {
      const status = (invoice.status || "");
      return status === "POSTED TO WAREHOUSE"
    }
  );
  const inventory = inventoryItem;

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
    const MainProdduct = product.find((element) => element._id === selectedProduct?.productId);
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
            Product: order.storeProductId || order.storeproductId,
            Vendor: item.Vendor || "",
            Store: purchase.WHID || "",
            PurchCase: 0,
            PurchPcs: 0,
            Sold: 0,
            Stock: 0,
            pcs: 0,
            rStock: 0,
            rPcs: 0,
            productId: item._id
          };
          existing.PurchCase += order.Qty || 0;
          summaryMap.set(id, existing);
        });
      }
    });

    // purchase pcs
    purchases.forEach(purchase => {
      if (!isWithinDateRange(purchase.recievedDate)) return;
      if (Array.isArray(purchase.orders)) {
        purchase.orders.forEach(order => {
          const item = order.item || {};
          const id = order.storeProductId || order.storeproductId;
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId || order.storeproductId,
            Vendor: item.Vendor || "",
            Store: purchase.WHID || "",
            PurchCase: 0,
            PurchPcs: 0,
            Sold: 0,
            Stock: 0,
            pcs: 0,
            rStock: 0,
            rPcs: 0,
            productId: item._id
          };
          existing.PurchPcs += order.pcs || order.pcs || 0;
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
          const id = order.storeProductId || order.storeproductId
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId || order.storeproductId,
            Vendor: item.Vendor || "",
            Store: invoice.whId || "",
            PurchCase: 0,
            PurchPcs: 0,
            Sold: 0,// for case
            pcs: 0,
            Stock: 0,
            rStock: 0,
            rPcs: 0,
            productId: item._id
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
          const id = order.storeProductId || order.storeproductId;
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId || order.storeproductId,
            Vendor: item.Vendor || "",
            Store: invoice.whId || "",
            PurchCase: 0,
            PurchPcs: 0,
            Sold: 0,
            pcs: 0,
            Stock: 0,
            rStock: 0,
            rPcs: 0,
            productId: item._id
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
          const id = order.storeProductId || order.storeproductId;
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId || order.storeproductId,
            Vendor: item.Vendor || "",
            Store: invoice.whId || "",
            PurchCase: 0,
            PurchPcs: 0,
            Sold: 0,
            pcs: 0,
            Stock: 0,
            rStock: 0,//returneed case
            rPcs: 0,
            productId: item._id
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
          const id = order.storeProductId || order.storeproductId;
          const existing = summaryMap.get(id) || {
            Product: order.storeProductId || order.storeproductId,
            Vendor: item.Vendor || "",
            Store: invoice.whId || "",
            PurchCase: 0,
            PurchPcs: 0,
            Sold: 0,
            pcs: 0,
            Stock: 0,
            rStock: 0,
            rPcs: 0,//returneed pcsReq
            productId: item._id
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
            <select id="product" disabled style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
              <option value="">All</option>
              ${product.map(p => `<option value="${p._id}" >${p.Name}</option>`).join("")}
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
            margin-right: 5px;
          ">
            ⬇ Download Excel
          </button>
           <button id="downloadPdfBtn" class="swal2-confirm swal2-styled" style="
            background-color: #2b6cb0;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 12px;
          ">
            ⬇ Download PDF
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
                  <th style="padding: 6px; text-align: right;">Case [Buy]</th>
                  <th style="padding: 6px; text-align: right;">Pcs [Buy]</th>
                  <th style="padding: 6px; text-align: right;">Case [Sell]</th>
                  <th style="padding: 6px; text-align: right;">Pcs [Sell]</th>
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
                    <td style="padding: 6px; text-align: right;">${item.PurchCase}</td>
                    <td style="padding: 6px; text-align: right;">${item.PurchPcs}</td>
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
          const element = document.getElementById(id);
          if (element) {
            element.addEventListener("change", renderTable);
          }
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
            "Case Buy": item.PurchCase,
            "Pcs Buy": item.PurchPcs,
            "Case Sell": item.Sold,
            "pcs Sell": item.pcs,
            "Returned Case": item.rStock,
            "Returned Pcs": item.rPcs,
            "current Stock": item.Stock
          }));

          downloadExcel(excelData, "Stock_and_Sales_Report");
        };

        document.getElementById("downloadPdfBtn").onclick = () => {
          const filters = {
            startDate: document.getElementById("startDate").value,
            endDate: document.getElementById("endDate").value,
            vendor: document.getElementById("vendor").value,
            store: document.getElementById("store").value,
            product: document.getElementById("product").value
          };

          const data = getStockAndSalesSummary(filters);

          const pdfData = data.map(item => [
            getSToreProdduct(item.Product),
            getVendor(item.Vendor),
            getSTore(item.Store),
            item.PurchCase,
            item.PurchPcs,
            item.Sold,
            item.pcs,
            item.rStock,
            item.rPcs,
            item.Stock
          ]);

         
          autoTable(doc,{
            head: [["Product", "Vendor", "Store", "Case [Buy]", "Pcs [Buy]", "Case [Sell]", "Pcs [Sell]", "Case Retured", "Pcs Retured", "Avail. Stock"]],
            body: pdfData,
          });

          doc.save("Stock_and_Sales_Report.pdf");
        };
      }
    });
  };

  return (
    <button
      onClick={()=>fetchData()}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
      disabled={loading}
    >
      <SwatchIcon className="h-5 w-5" />
      Stock & Sales Report
    </button>
  );
}
