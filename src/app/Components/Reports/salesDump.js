'use client';
import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { FolderArrowDownIcon } from "@heroicons/react/24/outline";

const SalesDumpModal = ({ salesDatas }) => {
  const salesArray = JSON.parse(salesDatas || '[]');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    product: '',
    customer: '',
    vendor: ''
  });

  const handleExport = (filteredData) => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SalesDump');

    const filename = `Sales Dump [${filters.startDate || 'start'} - ${filters.endDate || 'end'}].xlsx`;
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, filename);
  };

  const applyFilters = () => {
    const filteredExport = [];

    salesArray.forEach((sale) => {
      const saleDate = new Date(sale.startDate);
      const start = filters.startDate ? new Date(filters.startDate) : null;
      const end = filters.endDate ? new Date(filters.endDate) : null;

      const matchesCustomer = filters.customer
        ? sale.customerName?.toLowerCase().includes(filters.customer.toLowerCase())
        : true;

      const matchesDate =
        (!start || saleDate >= start) &&
        (!end || saleDate <= end);

      if (!matchesCustomer || !matchesDate) return;

      sale.orders.forEach((order) => {
        const matchesProduct = filters.product
          ? order.item.Name?.toLowerCase().includes(filters.product.toLowerCase())
          : true;

        const matchesVendor = filters.vendor
          ? order.item.Vendor?.$oid?.includes(filters.vendor)
          : true;

        if (matchesProduct && matchesVendor) {
          filteredExport.push({
            InvoiceNo: sale.billReferenceNo,
            Customer: sale.customerName,
            Product: order.item.Name,
            Quantity: order.Qty,
            UnitPrice: order.priceListPrice,
            Total: order.total,
            ManufactureCode: order.item.Manufacture_code,
            Vendor: order.item.Vendor?.$oid,
            Date: sale.startDate
          });
        }
      });
    });

    handleExport(filteredExport);
  };

  const openModal = () => {
    Swal.fire({
      title: 'Sales Dump Filters',
      html: `
        <input type="date" id="startDate" class="swal2-input" placeholder="Start Date" />
        <input type="date" id="endDate" class="swal2-input" placeholder="End Date" />
        <input type="text" id="product" class="swal2-input" placeholder="Product Name" />
        <input type="text" id="customer" class="swal2-input" placeholder="Customer Name" />
        <input type="text" id="vendor" class="swal2-input" placeholder="Vendor ID" />
      `,
      confirmButtonText: 'Export to Excel',
      preConfirm: () => {
        setFilters({
          startDate: document.getElementById('startDate').value,
          endDate: document.getElementById('endDate').value,
          product: document.getElementById('product').value,
          customer: document.getElementById('customer').value,
          vendor: document.getElementById('vendor').value
        });
      },
      didClose: () => {
        applyFilters();
      }
    });
  };

  return (
    <button
      onClick={openModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <FolderArrowDownIcon className="h-4 w-4 text-gray-100" />
      Open Sales Dump
    </button>
  );
};

export default SalesDumpModal;
