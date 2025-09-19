"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FolderArrowDownIcon } from "@heroicons/react/24/outline";
import { plsWait } from "../../../../Functions/Mics";
import { EXPRESS_PRIVATE_URL } from "../../../../Functions/Functions";

const SalesDumpModal = ({ tenantData,Products ,Stores,Vendors}) => {
  const [salesDatas, setSalesDatas] = useState([]);
  const [ProductList] = useState(Products ? JSON.parse(Products) : []);
  const [StoreList] = useState(Stores ? JSON.parse(Stores) : []);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    product: "",
  });

  const productOptions = ProductList.map(
      (product) => `<option value="${product.Name}">${product.Name}</option>`
    ).join("");

    //get prooduct name
    const filterProductName = (id) => {
      try {
        const prod = ProductList.find((p) => p._id === id);
        return prod ? prod.Name : "N/A";
      } catch (error) {
        return "N/A";
      }
    };


    //get store name
    const filterStoreName = (id) => {
      try {
        const store = StoreList.find((s) => s._id === id);
        return store ? store.WHName : "N/A";
      }
      catch (error) {
        return "N/A";
      }
    };

    //get vendor name
    const filterVendorName = (id) => {
      try {
        const vendor = Vendors.find((v) => v._id === id);
        return vendor ? vendor.Name : "N/A";
      }catch (error) {
        return "N/A";
      }
    };



  const filterSales = (activeFilters) => {
    if (!salesDatas || salesDatas.length === 0) return [];
    const filteredExport = [];

    salesDatas.forEach((sale) => {
      const saleDate = new Date(sale.startDate);
      const start = activeFilters.startDate ? new Date(activeFilters.startDate) : null;
      const end = activeFilters.endDate ? new Date(activeFilters.endDate) : null;

      const matchesDate = (!start || saleDate >= start) && (!end || saleDate <= end);
      if (!matchesDate) return;

      sale.orders.forEach((order) => {
        const matchesProduct = activeFilters.product
          ? order.item.Name?.toLowerCase().includes(activeFilters.product.toLowerCase())
          : true;

        if (matchesProduct) {
          filteredExport.push({
           "Inv-No": sale.billReferenceNo,
            Status: sale.billStatus,
            WB_No: sale.WayBillNo || "N/A",
            Store: filterStoreName(sale.whId),
            Invoicer: sale.RaiseBy,
            Customer: sale.customerName,
            product: filterProductName(order.item._id),
            "Sys-Code": order.item.ACDcode || order.item.ADCcode,
            Trace: order.returnId,
            Batch: order.BatchId,
            Category: order.item.category,
            Case: order.Qty,
            Pcs: order.pcsReq || 0,
            Vat: order.vat || 0,
            Unit: order.priceListPrice,
            Total: order.total,
            "Manuf-Code": order.item.Manufacture_code,
            Vendor: filterVendorName(order.item.Vendor),
            Ord_Date: sale.startDate,
            Inv_Date: sale.InvDate || "N/A",
            Month: new Date(sale.startDate).toLocaleString("default", { month: "short" }),
            Year: new Date(sale.startDate).getFullYear(),
          });
        }
      });
    });

    return filteredExport;
  };

  const handleExport = (filteredData) => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesDump");

    const filename = `Sales Dump [${filters.startDate || "start"} - ${filters.endDate || "end"}].xlsx`;
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
           <div class="sm:col-span-2">
              <label for="product" class="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
              <select id="product" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="">-- Select Product --</option>
                ${productOptions}
              </select>
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
          product: document.getElementById("product").value,
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
              Authorization: `Bearer ${tenantData}`,
            },
          }
        );

        const data = await request.json();
        setSalesDatas(data.invoice);
        Swal.close();

        const activeFilters = result.value;
        setFilters(activeFilters);
        const previewData = filterSales(activeFilters);

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
    <button onClick={openModal} className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full" > 
    <FolderArrowDownIcon className="h-5 w-5 text-white" /> Export Sales Dump 
    </button>
  );
};

export default SalesDumpModal;
