"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FolderArrowDownIcon } from "@heroicons/react/24/outline";
import { plsWait, Encrypt } from "../../../../Functions/Mics";
import { EXPRESS_PRIVATE_URL } from "../../../../Functions/Functions";
import moment from "moment";

const SalesDumpModal = ({ business }) => {
  const [salesDatas, setSalesDatas] = useState([]);
  const [ProductList, setProductList] = useState([]);
  const [StoreList, setStoreList] = useState([]);
  const [Vendors, setVendorList] = useState([]);
  
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    product: "",
  });

  // helpers that can operate on provided lists (or fall back to state)

  const PriceList = (customersPriceList) => {
      const normalizedKey = customersPriceList?.toLowerCase();

      const priceMap = {
        pricelist1: business.priceList1,
        pricelist2: business.priceList2,
        pricelist3: business.priceList3,
        pricelist4: business.priceList4,
        pricelist5: business.priceList5,
        pricelist6: business.priceList6,
        pricelist7: business.priceList7,
      };

      return priceMap[normalizedKey] || null;
    };


  const getProductName = (id, products = ProductList) => {
    try {
      const prod = products.find((p) => p._id === id);
      return (prod && prod.Name) || "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  const getStoreName = (id, stores = StoreList) => {
    try {
      const store = stores.find((s) => s._id === id);
      return (store && store.WHName) || "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  const getVendorName = (id, vendors = Vendors) => {
    try {
      const vendor = vendors.find((v) => v._id === id);
      return vendor ? vendor.Name : "N/A";
    } catch (error) {
      return "N/A";
    }
  };

  // filterSales can accept explicit arrays so we can preview using fetched data immediately
  const filterSales = (activeFilters, salesArr = salesDatas, products = ProductList, stores = StoreList, vendors = Vendors) => {
    if (!salesArr || salesArr.length === 0) return [];
    const filteredExport = [];

    salesArr.forEach((sale) => {
      const saleDate = new Date(sale.startDate);
      const start = activeFilters.startDate ? new Date(activeFilters.startDate) : null;
      const end = activeFilters.endDate ? new Date(activeFilters.endDate) : null;

      const matchesDate = (!start || saleDate >= start) && (!end || saleDate <= end);
      if (!matchesDate) return;

      (sale.orders || []).forEach((order) => {
        const matchesProduct = activeFilters.product
          ? order.item._id?.toString().includes(activeFilters.product.toString())
          : true;

        if (matchesProduct) {
          filteredExport.push({
            "Ref-No": sale.billReferenceNo,
            Status: sale.billStatus,
            WB_No: sale.WayBillNo || "N/A",
            Store: getStoreName(sale.whId, stores),
            Invoicer: sale.RaiseBy,
            Customer: sale.customerName,
            product: getProductName(order.item._id, products),
            "Sys-Code": order.item.ACDcode || order.item.ADCcode,
            Trace: order.returnId,
            Batch: order.BatchId,
            Category: order.item.category,
            Case: order.Qty,
            Pcs: order.pcsReq || 0,
            Vat: order.vat || 0,
            Unit: order.priceListPrice,
            Total: order.total,
            FOC:order.item.isAservice,
            "Manuf-Code": order.item.Manufacture_code,
            Vendor: getVendorName(order.item.Vendor, vendors),
            Promo: order.promotionData,
            "Promo Total": (order.promotionData || 0) * (order.Qty || 0),
            PriceList: PriceList(sale.priceList),
            "Dis Allowed":sale.discount,
            Ord_Date: sale.startDate,
            Inv_Date: moment(sale.DELIVERYDATE).format("l") || "N/A",
            Inv_Sub: sale.subTotal,
            Inv_Total: sale.grandTotal,
            Month : moment(inv.startDate).format("MMM"), // short month (e.g. "Dec") const
            Year : moment(inv.startDate).format("YYYY") // full year (e.g. "2025")
          });
        }
      });
    });

    return filteredExport;
  };

  const handleExport = (filteredData) => {
    // First sheet for sales 
    const salesDumpData = filteredData?.filter(line => {
      return line.Status === "Invoice" || line.Status === "Order"
    });

    const worksheet1 = XLSX.utils.json_to_sheet(salesDumpData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet1, "SalesDump");

    const otherData = filteredData?.filter(line => line.FOC === true);
    
    // Second sheet (example: FOC COUNT)
    const worksheet2 = XLSX.utils.json_to_sheet(otherData);
    XLSX.utils.book_append_sheet(workbook, worksheet2, "FOC-Issued");
    
    
    // 👉 Third sheet: Example —returns
    const returns = filteredData?.filter(line => {
      return line.Status === "Cancelled"; 
    });;
    const worksheet3 = XLSX.utils.json_to_sheet(returns);
    XLSX.utils.book_append_sheet(workbook, worksheet3, "Returns");

    // Filename
    const filename = `Sales-Dump,FOC-Issued & Returns [${filters.startDate || "start"} - ${filters.endDate || "end"}].xlsx`;

    // Write and save
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, filename);
  };

  const openModal = () => {
    Swal.fire({
      title: '<span style="font-size: 1.5rem; font-weight: 700;">Sales Dump Filters</span>',
      html: `
        <div class="flex flex-col gap-6 p-6 bg-white rounded-lg shadow-sm max-w-2xl w-full">
          <h2 class="text-2xl font-bold text-gray-800">Filter Sales Dump</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" id="startDate" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div>
              <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" id="endDate" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
        </div>
      `,
      confirmButtonText: "Preview Results",
      cancelButtonText: "Cancel",
      showCancelButton: true,
      customClass: {
        popup: "bg-gray-900 text-white rounded-xl",
        confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500",
        cancelButton: "bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600",
      },
      focusConfirm: false,
      preConfirm: () => {
        return {
          startDate: document.getElementById("startDate").value,
          endDate: document.getElementById("endDate").value,
        };
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        plsWait("Generating export data...");

        const request = await fetch(
          `${EXPRESS_PRIVATE_URL}/api/Report/Generate?Startdate=${result.value.startDate}&Enddate=${result.value.endDate}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Encrypt(business.tenantId)}`,
              dbConnect: `Bearer ${business.rustyRoof}`,
            },
          }
        );

        const data = await request.json();
        if (!request.ok) {
          Swal.fire("Error", data.message || "Failed to fetch sales data.", "error");
          return;
        }

        // update state (for later use)...
        setSalesDatas(data.invoice);
        setProductList(data.Products);
        setStoreList(data.Stores);
        setVendorList(data.Vendors);

        Swal.close();

        const activeFilters = result.value;
        setFilters(activeFilters);

        // Build preview using the fetched data directly (fixes "no data on first load")
        const previewData = filterSales(activeFilters, data.invoice, data.Products, data.Stores, data.Vendors);

        if (previewData.length === 0) {
          Swal.fire("No results found", "Try adjusting your filters.", "info");
          return;
        }

        const tableHtml = `
          <style>
            .swal2-popup {
              max-width: 90vw !important;
              width: auto !important;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 0.875rem;
              overflow-x: auto;
            }
            th, td {
              padding: 0.5rem;
              border: 1px solid #cbd5e0;
              text-align: left;
            }
            thead {
              background-color: #4a5568;
              color: #fff;
              position: relative;
            }
            tbody tr:nth-child(even) {
              background-color: #f7fafc;
            }
            tbody tr:hover {
              background-color: #edf2f7;
            }
          </style>
          <div style="max-height: 60vh; overflow-y: auto;">
            <table>
              <thead>
                <tr class="text-xs">
                  ${Object.keys(previewData[0]).map((key) => `<th>${key}</th>`).join("")}
                </tr>
              </thead>
              <tbody>
                ${previewData
                  .map(
                    (row) =>
                      `<tr class="text-xs">${Object.values(row)
                        .map((value) => `<td class="text-xs">${value}</td>`)
                        .join("")}
                      </tr>`
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        `;

        Swal.fire({
          title: "Preview Sales Dump",
          html: tableHtml,
          confirmButtonText: "Export to Excel",
          showCancelButton: true,
          customClass: {
            popup: "swal2-preview-popup",
          },
        }).then((exportResult) => {
          if (exportResult.isConfirmed) {
            handleExport(previewData);
          }
        });
      }
    });
  };

  return (
    <button onClick={openModal} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full">
      <FolderArrowDownIcon className="h-5 w-5 text-white" /> Export Sales Dump
    </button>
  );
};

export default SalesDumpModal;
