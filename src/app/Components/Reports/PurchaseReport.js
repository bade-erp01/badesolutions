"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import { downloadExcel } from "../../../../Functions/Functions";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { plsWait, ErrorMessage } from "../../../../Functions/Mics";

export default function PurchaseReportModal({ Stores, Vendors, data }) {
    const [StoresList] = useState(Stores || []);
    const [customersList] = useState(Vendors || []);
    const [loading, setLoading] = useState(false);
    const [Data] = useState(data.filter(po => po.status !== "Draft") || []);

    const showModal = () => {
        const getCustomer = (id) => {
            const selectedCustomer = customersList.find((cust) => cust._id === id);
            return selectedCustomer?.Name || "";
        };

        const getStore = (id) => {
            const selectedStore = StoresList.find((s) => s._id === id);
            return selectedStore?.WHName || "";
        };

        const generateTableRows = (dataToUse) =>
            dataToUse
                .map(
                    (item, index) => `
            <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 4px;">${index + 1}</td>
                <td style="padding: 4px; text-align: left;">${(item.billReferenceNo || "").trim()}</td>
                <td style="padding: 4px;">${getCustomer(item.Vendor)}</td>
                <td style="padding: 4px;">${getStore(item.WHID)}</td>
                <td style="padding: 4px;">${moment(item.recievedDate).format("YYYY-MM-DD")}</td>
                <td style="padding: 4px;">
                    <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px;">
                        ${item.status?.toUpperCase() || ""}
                    </span>
                </td>
                <td style="padding: 4px;">${(item.discount ?? 0).toLocaleString()}</td>
                <td style="padding: 4px;">${(item.subTotal ?? 0).toLocaleString()}</td>
                <td style="padding: 4px;">${(item.grandTotal ?? 0).toLocaleString()}</td>
            </tr>
        `
                )
                .join("");

        Swal.fire({
            title: "Purchase Report",
            html: `
                <style> tr:hover { background-color: #f7fafc; } @media (max-width: 639px) { .swal2-html-container input, .swal2-html-container select, .swal2-html-container textarea { font-size: 16px !important; } } </style>
                <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px;">
                    <div>
                        <label style="font-weight: 600; font-size: 12px;">Start Date</label><br/>
                        <input type="date" id="startDate" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;" />
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 12px;">End Date</label><br/>
                        <input type="date" id="endDate" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;" />
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 12px;">Others</label><br/>
                        <select id="Others" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
                            <option value="">All</option>
                            <option value="discount">Discount Recieved</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 12px;">Status</label><br/>
                        <select id="Status" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
                            <option value="">All</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="posted to warehouse">Posted</option>
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 12px;">Suppliers</label><br/>
                        <select id="customerFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
                            <option value="">All</option>
                            ${customersList
                                .sort((a, b) => a.Name?.localeCompare(b.Name || "") || 0)
                                .map((c) => `<option value="${c._id}">${c.Name}</option>`)
                                .join("")}
                        </select>
                    </div>
                    <div>
                        <label style="font-weight: 600; font-size: 12px;">Store</label><br/>
                        <select id="Store" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
                            <option value="">All</option>
                            ${StoresList.map((b) => `<option value="${b._id}">${b.WHName}</option>`).join("")}
                        </select>
                    </div>
                </div>
                <div id="excelBtnContainer" style="margin-bottom: 10px;"></div>
                <div style="overflow-x: auto; max-height: 280px;">
                    <table style="width:100%; border-collapse: collapse; font-size: 12px;">
                        <thead style="background-color: #edf2f7;">
                            <tr>
                                <th style="padding: 4px;">#</th>
                                <th style="padding: 4px;">Ref</th>
                                <th style="padding: 4px;">Vendor</th>
                                <th style="padding: 4px;">Store</th>
                                <th style="padding: 4px;">Recv.Date</th>
                                <th style="padding: 4px;">Status</th>
                                <th style="padding: 4px;">Dis. Recieved</th>
                                <th style="padding: 4px;">Sub.</th>
                                <th style="padding: 4px;">Grand</th>
                            </tr>
                        </thead>
                        <tbody id="paymentTableBody">
                            ${generateTableRows(Data)}
                        </tbody>
                    </table>
                </div>
                <div id="tableDownloadBtn" style="margin-top: 12px; text-align: right;"></div>
            `,
            width: "93%",
            showConfirmButton: false,
            didOpen: () => {
                const tableBody = document.getElementById("paymentTableBody");
                let currentData = Data.slice();

                const applyFilters = () => {
                    const startDate = document.getElementById("startDate").value;
                    const endDate = document.getElementById("endDate").value;
                    const Others = document.getElementById("Others").value;
                    const customer = document.getElementById("customerFilter").value;
                    const Store = document.getElementById("Store").value;
                    const Status = document.getElementById("Status").value;
                    const start = startDate ? moment(startDate) : null;
                    const end = endDate ? moment(endDate) : null;

                    const filtered = Data.filter((item) => {
                        const itemDate = moment(item.recievedDate);
                        const othersMatch =
                            !Others || (Others.toLowerCase() === "discount" && item.discount > 0);

                        return (
                            (!start || itemDate.isSameOrAfter(start, "day")) &&
                            (!end || itemDate.isSameOrBefore(end, "day")) &&
                            othersMatch &&
                            (!Status || (item.status || "").toLowerCase() === Status.toLowerCase()) &&
                            (!customer || item.Vendor === customer) &&
                            (!Store || item.WHID === Store)
                        );
                    });

                    currentData = filtered;
                    updateTable(filtered);
                };

                const updateTable = (filtered) => {
                    tableBody.innerHTML = generateTableRows(filtered);

                    const downloadContainer = document.getElementById("tableDownloadBtn");
                    if (downloadContainer) {
                        downloadContainer.innerHTML = "";

                        if (filtered.length > 0) {
                            const button = document.createElement("button");
                            button.innerHTML = `
                                <span style="
                                    display: inline-flex;
                                    align-items: center;
                                    gap: 6px;
                                    font-size: 13px;
                                    background-color: #2b6cb0;
                                    color: white;
                                    padding: 6px 12px;
                                    border-radius: 6px;
                                    border: none;
                                    cursor: pointer;
                                ">
                                    <svg data-slot="icon" height="16" width="16" fill="none" stroke-width="1.5" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"></path>
                                    </svg>
                                    Download Excel
                                </span>
                            `;
                            button.onclick = () => {
                                const clean = [];
                                filtered.forEach((entry) => {
                                    clean.push({
                                        Ref: entry.billReferenceNo,
                                        Store: getStore(entry.WHID),
                                        Vendor: getCustomer(entry.Vendor),
                                        status: entry.status,
                                        "Recv Date": moment(entry.recievedDate).format("YYYY-MM-DD"),
                                        "Dis Recieved": entry.discount,
                                        "Sub Total": entry.subTotal,
                                        Grand: entry.grandTotal,
                                    });
                                });
                                const excelBtn = downloadExcel(clean, `Purchase Report`);
                                if (excelBtn instanceof HTMLElement) {
                                    excelBtn.click();
                                }
                            };
                            downloadContainer.appendChild(button);
                        }
                    }
                };

                [
                    "startDate",
                    "endDate",
                    "customerFilter",
                    "Store",
                    "Status",
                    "Others",
                ].forEach((id) => {
                    const el = document.getElementById(id);
                    if (el) {
                        el.addEventListener("input", applyFilters);
                        el.addEventListener("change", applyFilters);
                    }
                });

                updateTable(currentData);
            },
        });
    };

    return (
        <button
            onClick={showModal}
            disabled={loading}
            className="flex items-center gap-3 bg-gray-300 text-black/70 p-3 rounded-md hover:bg-gray-700 transition hover:text-gray-100 text-sm w-full"
        >
            <ShoppingBagIcon className="w-4 h-4 inline-block" />
            Generate Purchase summary
        </button>
    );
}
