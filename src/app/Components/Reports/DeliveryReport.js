"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import {downloadExcel} from "../../../../Functions/Functions"
import { TruckIcon } from "@heroicons/react/24/outline";

export default function DeliveryRportModal({ data, Stores, customers,users }) {
 const [filteredData, setFilteredData] = useState(
  JSON.parse(data).filter(item => {
    const status = item.billStatus?.toLowerCase();
    return status === "invoice" || status === "cancelled";
  })
);
  const [StoresList] = useState(JSON.parse(Stores)  || []);
  const [customersList] = useState(JSON.parse(customers) || []);
  const [usersList] = useState(JSON.parse(users) || []);
  const [searchPeriod, setSearchPeriod] = useState('')

  const getCustomer = (id) => {
    const selectedCustomer = customersList.find((cust) => cust._id === id);
    return selectedCustomer?.Username || "";
  };

  const getSTore = (id) => {
    const selectedBank = StoresList.find((bank) => bank._id === id);
    return selectedBank?.WHName || "";
  };

//   getsales person
  const getUser = (id) => {
    const selectedBank = usersList.find((bank) => bank._id === id);
    return `${selectedBank?.firstName} ${selectedBank?.lastName}` || "";
  };

  const generateTableRows = (data) => {
    return data
      .map(
        (item, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px;">${index + 1}</td>
        <td style="padding: 4px; text-align: left;">${item.billReferenceNo.trim()}</td>
        <td style="padding: 4px;">${getCustomer(item.customer)}</td>
        <td style="padding: 4px;">${getSTore(item.whId)}</td>
        <td style="padding: 4px;">${getUser(item.invoicerId)}</td>
        <td style="padding: 4px;">${getUser(item.salesPerson)}</td>
        <td style="padding: 4px;">${item.DELIVERYDATE ? moment(item.DELIVERYDATE).format("YYYY-MM-DD") : ''}</td>
        <td style="padding: 4px;">${item.DriverNumber}</td>
        <td style="padding: 4px;">
        <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px;">
        ${item.billStatus.toUpperCase()}
        </span>
        </td>
        <td style="padding: 4px;">${item.DriverName.toLocaleString()}</td>
        <td style="padding: 4px;">${item.vehicleNumber.toLocaleString()}</td>
        <td style="padding: 4px;">${item.WayBillNo || ""}</td>
        <td style="padding: 4px;">${item.shippingFee.toLocaleString()}</td>
      </tr>
    `
      )
      .join("");
  };

  const showModal = () => {
    Swal.fire({
      title: "Logistics Report",
      html: `
        <style> tr:hover { background-color: #f7fafc; } </style>
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
            <label style="font-weight: 600; font-size: 12px;">Status</label><br/>
            <select id="Status" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              <option value="Invoice">Invoice</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Customer</label><br/>
            <select id="customerFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${customersList
                .map((c) => `<option value="${c._id}">${c.Username}</option>`)
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Store</label><br/>
            <select id="Store" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${StoresList
                .map((b) => `<option value="${b._id}">${b.WHName}</option>`)
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Rep</label><br/>
            <select id="Rep" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${usersList
                .map((b) => `<option value="${b._id}">${b.firstName} ${b.lastName}</option>`)
                .join("")}
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
                <th style="padding: 4px;">Customer</th>
                <th style="padding: 4px;">Store</th>
                <th style="padding: 4px;">Invoicer</th>
                <th style="padding: 4px;">Sales Rep</th>
                <th style="padding: 4px;">Date</th>
                <th style="padding: 4px;">Driver No.</th>
                <th style="padding: 4px;">Status</th>
                <th style="padding: 4px;">Driver</th>
                <th style="padding: 4px;">Vehicle No.</th>
                <th style="padding: 4px;">WB No..</th>
                <th style="padding: 4px;">Shipping Fee</th>
              </tr>
            </thead>
            <tbody id="paymentTableBody">
              ${generateTableRows(filteredData)}
            </tbody>
          </table>
        </div>
        <div id="tableDownloadBtn" style="margin-top: 12px; text-align: right;"></div>
      `,
      width: "80%",
      showConfirmButton: false,
      didOpen: () => {
        const tableBody = document.getElementById("paymentTableBody");

        const applyFilters = () => {
          const startDate = document.getElementById("startDate").value;
          const endDate = document.getElementById("endDate").value;
          const customer = document.getElementById("customerFilter").value;
          const Rep = document.getElementById("Rep").value;
          const Store = document.getElementById("Store").value;
          const Status = document.getElementById("Status").value;

            const start = startDate ? moment(startDate) : null;
            const end = endDate ? moment(endDate) : null;
            setSearchPeriod(`${startDate}-${endDate}`)
 
            const filtered = filteredData.filter((item) => {
            const itemDate = moment(item.startDate);
        
                return (
                    (!start || itemDate.isSameOrAfter(start, "day")) &&
                    (!end || itemDate.isSameOrBefore(end, "day")) &&
                    (!Rep || item.salesPerson?.toLowerCase() === Rep.toLowerCase()) &&
                    (!Status || item.billStatus?.toLowerCase() === Status.toLowerCase()) &&
                    (!customer || item.customer?.toLowerCase() === customer.toLowerCase()) &&
                    (!Store || item.whId?.toLowerCase() === Store.toLowerCase())
                );
            });

          setFilteredData(filtered);
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
                const clean = []
                filtered.forEach(entry =>{
                  clean.push({
                    "Ref":entry.billReferenceNo,
                    "Store code":entry.invoicelocation,
                    "Store":getSTore(entry.whId),
                    "Invoicer":getUser(entry.invoicerId),
                    "Customer":getCustomer(entry.customer),
                    "Rep":getUser(entry.salesPerson),
                    "status":entry.billStatus,
                    "Date":entry.DELIVERYDATE ? moment(entry.DELIVERYDATE).format('YYYY-MM-DD'):'',
                    "Driver":entry.DriverName,
                    "Vehicle No":entry.DriverNumber,
                    "W/B":entry.WayBillNo,
                    "Shipping Fee":entry.shippingFee
                  })
                })
                const excelBtn = downloadExcel( clean,`${searchPeriod} Logistics Report`);
                if (excelBtn instanceof HTMLElement) {
                  excelBtn.click();
                }
              };
              downloadContainer.appendChild(button);
            }
          }
        };

        ["startDate", "endDate", "customerFilter", "bankFilter","Rep","Store","Status"].forEach((id) => {
          const el = document.getElementById(id);
                    if (el) {
            el.addEventListener("input", applyFilters);
            el.addEventListener("change", applyFilters);
          }
        });

        // Initial render
        updateTable(filteredData);
      },
    });
  };

  return (
    <button
      onClick={showModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <TruckIcon className="w-4 h-4 inline-block" />
      Generate Logistics Report
    </button>
  );
}
