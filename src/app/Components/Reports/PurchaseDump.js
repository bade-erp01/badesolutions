"use client";
import React, { useState,useEffect } from "react";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { plsWait, Encrypt, ErrorMessage } from "../../../../Functions/Mics";
import moment from "moment";

const PurchaseDumpModal = ({ business,Products,EXPRESS_PRIVATE_URL,storesData,vendorsData}) => {
    const [ProductList] = useState(Products);//from server
    const [StoreList] = useState(storesData);
    const [Vendors] = useState(vendorsData);
    const [filters, setFilters] = useState({
        startDate: "",
        endDate: "",
        product: "",
    });


    const getProductName = (id, products = ProductList) => {
        try {
            const prod = (products || []).find((p) => p._id === id);
            return (prod && prod.Name) || "N/A";
        } catch {
            return "N/A";
        }
    };

    const getStoreName = (id, stores = StoreList) => {
        try {
            const store = (stores || []).find((s) => s._id === id);
            return (store && store.WHName) || "N/A";
        } catch {
            return "N/A";
        }
    };

    const getVendorName = (id, vendors = Vendors) => {
        try {
            const vendor = (vendors || []).find((v) => v._id === id);
            return vendor ? vendor.Name : "N/A";
        } catch {
            return "N/A";
        }
    };

    // filterSales accepts explicit arrays so we can preview using fetched data immediately
    const filterSales = (
        activeFilters,
        sales = [],
        products = ProductList,
        stores = StoreList,
        vendors = Vendors
    ) => {
        if (!sales || sales.length === 0) return [];
        const filteredExport = [];
        
        sales.forEach((sale) => {
            const saleDate = new Date(sale.startDate || sale.createdAt || sale.OrderDate || null);
            const start = activeFilters.startDate ? new Date(activeFilters.startDate) : null;
            const end = activeFilters.endDate ? new Date(activeFilters.endDate) : null;
            
            const matchesDate = (!start || saleDate >= start) && (!end || saleDate <= end);
            if (!matchesDate) return;
            
            (sale.orders || []).forEach((order) => {
                const itemId = order?.item?.productId || order?.item;
                // matched products form activeFilters
                const matchesProduct = activeFilters.product
                    ? itemId?.toString().includes(activeFilters.product.toString())
                    : true;

                if (matchesProduct) {
                    filteredExport.push({
                        "Ref-No": sale.billReferenceNo || "N/A",
                        Status: sale.status || "N/A",
                        Store: getStoreName(sale.WHID),
                        product: getProductName(order.item.productId),
                        "Sys-Code": (order.item && (order.item.ACDcode || order.item.ADCcode)) || "N/A",
                        // Trace: order.Status ,
                        Batch: order.BatchNo || "N/A",
                        Category: (order.item && order.item.category) || "N/A",
                        Case: order.Qty || 0,
                        Pcs: order.pcs  || order.roll || 0,
                        "Unit Price": order.buyingPrice || 0,
                        "Line Total": order.total ,
                        "Exp Date": order.ExpDate || "N/A",
                        Supplier: getVendorName(order?.item?.Vendor),
                        "Rec Date": sale.recievedDate || sale.recievedDate || "N/A",
                        "Dis. Rec":sale.discount || 0,
                        "PO Sub": sale.subTotal || 0,
                        "PO Total": sale.grandTotal || 0,
                        Month: sale.recievedDate ? new Date(sale.recievedDate).toLocaleString("default", { month: "short" }) : "N/A",
                        Year: sale.recievedDate ? new Date(sale.recievedDate).getFullYear() : "N/A",
                    });
                }
            });
        });

        return filteredExport;
    };

    const handleExport = (filteredData) => {
        const worksheet = XLSX.utils.json_to_sheet(filteredData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseDump");

        const filename = `Purchase Dump [${filters.startDate || "start"} - ${filters.endDate || "end"}].xlsx`;
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(blob, filename);
    };



    const openModal = async () => {
        const productOptionsHtml = [
            `<option value="">-- All Products --</option>`,
            ...(ProductList || []).sort((a, b) => a.Name.trim().localeCompare(b.Name.trim())).map((p) => `<option value="${p._id}">${p.Name }</option>`),
        ].join("");

        const storeOptionsHtml = [
            `<option disabled value="">-- All Stores --</option>`,
            ...(StoreList || []).map((s) => `<option value="${s._id}">${s.WHName }</option>`),
        ].join("");

        const SupplierOptionsHtml = [
            `<option value="">-- All Suppliers --</option>`,
            ...(Vendors || []).map((v) => `<option value="${v._id}">${v.Name }</option>`),
        ].join("");

        Swal.fire({
            title: '<span style="font-size: 1.25rem; font-weight: 700;">Purchase Dump Filters</span>',
            html: `
            <div class="flex flex-col gap-4 p-4 bg-white rounded-lg shadow-sm max-w-2xl w-full">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label for="startDate" class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                    <input type="date" required id="startDate" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md" />
                </div>
                <div>
                    <label for="endDate" class="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                    <input type="date" required id="endDate" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md" />
                </div>
                </div>
                <div>
                <label for="storeSelect" class="block text-sm font-medium text-gray-700 mb-1">Store</label>
                <select id="storeSelect" required class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                    ${storeOptionsHtml}
                </select>
                </div>
                <div>
                <label for="SupplierSelect" class="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                <select id="SupplierSelect" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                    ${SupplierOptionsHtml}
                </select>
                </div>
                <div>
                <label for="productSelect" class="block text-sm font-medium text-gray-700 mb-1">Product (optional)</label>
                <select id="productSelect" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md">
                    ${productOptionsHtml}
                </select>
                </div>
            </div>
            `,
            confirmButtonText: "Preview Results",
            cancelButtonText: "Cancel",
            showCancelButton: true,
            showConfirmButton: true,      // ensure confirm button is shown
            buttonsStyling: true,        // allow Tailwind/custom classes to style buttons
            focusConfirm: true,
            customClass: {
            popup: "bg-gray-900 text-white rounded-xl",
            confirmButton: "bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-500",
            cancelButton: "bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600",
            },
            // 👇 this line disables the spinner
            showLoaderOnConfirm: false,
            preConfirm: () => {
            return {
                startDate: document.getElementById("startDate").value,
                endDate: document.getElementById("endDate").value,
                product: document.getElementById("productSelect").value || "",
                store: document.getElementById("storeSelect").value || "",
                supplier: document.getElementById("SupplierSelect").value || "",
            };
            },
        }).then(async (result) => {
            if (!result.isConfirmed) return;

            plsWait("Generating export data...");

            try {
            const request = await fetch(
                `${EXPRESS_PRIVATE_URL}/api/Purchasees/report?Startdate=${result.value.startDate}&Enddate=${result.value.endDate}&supplier=${result.value.supplier}&store=${result.value.store}`,
                {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Encrypt(business.tenantId)}`,
                    access: Encrypt(userData.user._id),
                    sessionKey: `Bearer ${Encrypt(userData.SessionId)}`
                },
                }
            );

            const data = await request.json();
            if (!request.ok) {
                Swal.fire("Error", data.message || "Failed to fetch sales data.", "error");
                return;
            }

            // Use consistent property names returned by your API
            const purchases = data.filteredPurchaseOrders || data.purchaseOrders || data.invoice || data.data || [];

            Swal.close();

            const activeFilters = result.value;
            setFilters(activeFilters);

            const previewData = filterSales(
                activeFilters,
                purchases,
                data.Products || data.products || [],
                data.Stores || data.stores || [],
                data.VendorList || data.Vendors || []
            );

            if (!previewData || previewData.length === 0) {
                Swal.fire("No results found", "Try adjusting your filters.", "info");
                return;
            }

            const tableHtml = `
                <style>
                .swal2-popup { max-width: 90vw !important; width: auto !important; color: #111827; }
                table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
                th, td { padding: 0.35rem 0.5rem; border: 1px solid #e5e7eb; text-align: left; vertical-align: top; }
                thead th { background: #374151; color: #fff; position: sticky; top: 0; z-index: 1; }
                tbody tr:nth-child(even) { background: #f9fafb; }
                .scroll-wrap { max-height: 60vh; overflow: auto; }
                </style>
                <div class="scroll-wrap">
                <table>
                    <thead>
                    <tr>${Object.keys(previewData[0]).map((k) => `<th>${k}</th>`).join("")}</tr>
                    </thead>
                    <tbody>
                    ${previewData
                        .map(
                        (row) =>
                            `<tr>${Object.values(row)
                            .map((v) => `<td>${v === null || v === undefined ? "" : String(v)}</td>`)
                            .join("")}</tr>`
                        )
                        .join("")}
                    </tbody>
                </table>
                </div>
            `;

            Swal.fire({
                title: "Preview Purchase Dump",
                html: tableHtml,
                confirmButtonText: "Export to Excel",
                showCancelButton: true,
                showConfirmButton: true,
                width: "90%",
                customClass: { popup: "swal2-preview-popup" },
            }).then((exportResult) => {
                if (exportResult.isConfirmed) {
                handleExport(previewData);
                }
            });
            } catch (err) {
              ErrorMessage("Faile to load dataset. Please try again later.");
            }
        });
    };

    return (
        <button
            onClick={openModal}
            className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
        >
            <ShoppingBagIcon className="h-5 w-5 text-white" /> Generate Purchase Dump
        </button>
    );
};

export default PurchaseDumpModal;
