"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FolderArrowDownIcon } from "@heroicons/react/24/outline";
import Invoice from "../../../../models/Invoices";

const SalesDumpModal = ({ salesDatas }) => {
  const salesArray = JSON.parse(salesDatas || "[]");
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    product: "",
  });

  const filterSales = (activeFilters) => {
    const filteredExport = [];

    salesArray.forEach((sale) => {
      const saleDate = new Date(sale.startDate);
      const start = activeFilters.startDate
        ? new Date(activeFilters.startDate)
        : null;
      const end = activeFilters.endDate
        ? new Date(activeFilters.endDate)
        : null;

      const matchesDate =
        (!start || saleDate >= start) && (!end || saleDate <= end);

      if (!matchesDate) return;

      sale.orders.forEach((order) => {
        const matchesProduct = activeFilters.product
          ? order.item.Name?.toLowerCase().includes(
              activeFilters.product.toLowerCase()
            )
          : true;

        if (matchesProduct) {
          filteredExport.push({
            InvoiceNo: sale.billReferenceNo,
            WB_No: sale.WayBillNo || "N/A",
            Store: sale.whId,
            Invoicer:sale.RaiseBy,
            Customer: sale.customerName,
            Product: order.item.Name,
            Product_Code: order.item.ACDcode || order.item.ADCcode,
            Trace:order.item.returnId,
            Batch:order.item.BatchId,
            Product_Category: order.item.category,
            productId: order.item._id,
            Case: order.Qty,
            Pcs: order.pcsReq,
            Vat: order.vat || 0,
            UnitPrice: order.priceListPrice,
            Total: order.total,
            ManufactureCode: order.item.Manufacture_code,
            Vendor: order.item.Vendor?.$oid,
            Ord_Date: sale.startDate,
            Inv_Date: sale.InvDate || "N/A",
            Month: new Date(sale.startDate).toLocaleString("default", { month: "long" }).substring(0,3),
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

    const filename = `Sales Dump [${filters.startDate || "start"} - ${
      filters.endDate || "end"
    }].xlsx`;
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, filename);
  };

  const openModal = () => {
    Swal.fire({
      title:
        '<span style="font-size: 1.5rem; font-weight: 700;">Sales Dump Filters</span>',
      html: `
    <div class="flex flex-col gap-4 max-w-md">
      <div class="flex items-center gap-2">
        <label for="startDate" class="w-24 text-sm font-medium text-gray-700">Start Date</label>
        <input
          type="date"
          id="startDate"
          placeholder="Start Date"
          class="w-40 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div class="flex items-center gap-2">
        <label for="endDate" class="w-24 text-sm font-medium text-gray-700">End Date</label>
        <input
          type="date"
          id="endDate"
          placeholder="End Date"
          class="w-40 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <div class="flex items-center gap-2">
        <label for="product" class="w-24 text-sm font-medium text-gray-700">Product</label>
        <input
          type="text"
          id="product"
          placeholder="Product Name"
          class="w-40 px-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  `,
      confirmButtonText: " Preview Results",
      cancelButtonText: " Cancel",
      showCancelButton: true,
      customClass: {
        popup: "bg-gray-900 text-white rounded-xl",
        confirmButton:
          "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500",
        cancelButton:
          "bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600",
      },
      focusConfirm: false,
      preConfirm: () => {
        return {
          startDate: document.getElementById("startDate").value,
          endDate: document.getElementById("endDate").value,
          product: document.getElementById("product").value,
        };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const activeFilters = result.value;
        setFilters(activeFilters);
        const previewData = filterSales(activeFilters);

        if (previewData.length === 0) {
          Swal.fire("No results found", "Try adjusting your filters.", "info");
          return;
        }

        const tableHtml = `
        <style>
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 12px;
            }

            th, td {
              padding: 4px;
              border: 1px solid #cbd5e0;
              white-space: nowrap;
            }

            thead {
              background-color: #edf2f7;
              font-weight: 600;
              color: #2d3748;
            }

            tr:hover {
              background-color: #f7fafc;
            }

            select, input[type="date"] {
              padding: 4px;
              font-size: 12px;
              border: 1px solid #cbd5e0;
              border-radius: 4px;
              width: 100%;
            }

            label {
              font-weight: 600;
              font-size: 12px;
              display: block;
              margin-bottom: 2px;
            }
          </style>

          <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; max-height: 300px; overflow-y: auto; max-width: 100%;">
          <table class="table-auto text-left text-sm border border-gray-300 w-full">
            <thead class="bg-gray-800 text-white">
              <tr>
                <th class="px-2 py-1 whitespace-nowrap">Invoice</th>
                <th class="px-2 py-1 whitespace-nowrap">WB No</th>
                <th class="px-2 py-1 whitespace-nowrap">Store</th>
                <th class="px-2 py-1 whitespace-nowrap">Invoicer</th>
                <th class="px-2 py-1 whitespace-nowrap">Customer</th>
                <th class="px-2 py-1 whitespace-nowrap">Product</th>
                <th class="px-2 py-1 whitespace-nowrap">Product Code</th>
                <th class="px-2 py-1 whitespace-nowrap">Trace</th>
                <th class="px-2 py-1 whitespace-nowrap">Batch</th>
                <th class="px-2 py-1 whitespace-nowrap">Category</th>
                <th class="px-2 py-1 whitespace-nowrap">Product ID</th>
                <th class="px-2 py-1 whitespace-nowrap">Case</th>
                <th class="px-2 py-1 whitespace-nowrap">Pcs</th>
                <th class="px-2 py-1 whitespace-nowrap">VAT</th>
                <th class="px-2 py-1 whitespace-nowrap">Unit Price</th>
                <th class="px-2 py-1 whitespace-nowrap">Total</th>
                <th class="px-2 py-1 whitespace-nowrap">Manufacture Code</th>
                <th class="px-2 py-1 whitespace-nowrap">Vendor</th>
                <th class="px-2 py-1 whitespace-nowrap">Order Date</th>
                <th class="px-2 py-1 whitespace-nowrap">Invoice Date</th>
                <th class="px-2 py-1 whitespace-nowrap">Month</th>
                <th class="px-2 py-1 whitespace-nowrap">Year</th>
              </tr>
            </thead>
            <tbody>
              ${previewData
                .map(
                  ({ sale, order }) => `
                  <tr class="border-t">
                    <td class="px-2 py-1 whitespace-nowrap">${sale.billReferenceNo}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${sale.WayBillNo || "N/A"}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${sale.whId}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${sale.RaiseBy}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${sale.customerName}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.item.Name}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.item.ACDcode || order.item.ADCcode}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.item.returnId}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.item.BatchId}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.item.category}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.item._id}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.Qty}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.pcsReq}</td>
                    <td class="px-2 py-1 whitespace-nowrap">₦${order.vat?.toLocaleString() || "0"}</td>
                    <td class="px-2 py-1 whitespace-nowrap">₦${order.priceListPrice.toLocaleString()}</td>
                    <td class="px-2 py-1 whitespace-nowrap">₦${order.total.toLocaleString()}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.item.Manufacture_code}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${order.item.Vendor?.$oid || "N/A"}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${new Date(sale.startDate).toLocaleDateString()}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${sale.InvDate || "N/A"}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${new Date(sale.startDate).toLocaleString("default", { month: "long" }).substring(0, 3)}</td>
                    <td class="px-2 py-1 whitespace-nowrap">${new Date(sale.startDate).getFullYear()}</td>
                  </tr>
                `
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
    <button
      onClick={openModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <FolderArrowDownIcon className="h-5 w-5 text-white" />
      Export Sales Dump
    </button>
  );
};

export default SalesDumpModal;
