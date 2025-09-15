"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { FolderArrowDownIcon } from "@heroicons/react/24/outline";

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
            Customer: sale.customerName,
            Product: order.item.Name,
            Quantity: order.Qty,
            UnitPrice: order.priceListPrice,
            Total: order.total,
            ManufactureCode: order.item.Manufacture_code,
            Vendor: order.item.Vendor?.$oid,
            Date: sale.startDate,
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
        <div class="mb-2 grid grid-cols-1 gap-2">
          <table class="table-auto text-left text-sm border border-gray-300 w-fit max-w-full">
            <thead class="bg-gray-800 text-white">
              <tr>
                <th class="px-2 py-1 whitespace-nowrap">Invoice</th>
                <th class="px-2 py-1 whitespace-nowrap">Customer</th>
                <th class="px-2 py-1 whitespace-nowrap">Product</th>
                <th class="px-2 py-1 whitespace-nowrap">Qty</th>
                <th class="px-2 py-1 whitespace-nowrap">Unit Price</th>
                <th class="px-2 py-1 whitespace-nowrap">Total</th>
                <th class="px-2 py-1 whitespace-nowrap">Date</th>
              </tr>
            </thead>
            <tbody>
              ${previewData
                .map(
                  (row) => `
                <tr class="border-t">
                  <td class="px-2 py-1 whitespace-nowrap">${row.InvoiceNo}</td>
                  <td class="px-2 py-1 whitespace-nowrap">${row.Customer}</td>
                  <td class="px-2 py-1 whitespace-nowrap">${row.Product}</td>
                  <td class="px-2 py-1 whitespace-nowrap">${row.Quantity}</td>
                  <td class="px-2 py-1 whitespace-nowrap">₦${row.UnitPrice.toLocaleString()}</td>
                  <td class="px-2 py-1 whitespace-nowrap">₦${row.Total.toLocaleString()}</td>
                  <td class="px-2 py-1 whitespace-nowrap">${new Date(row.Date).toLocaleDateString()}</td>
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
