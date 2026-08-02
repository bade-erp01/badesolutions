"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import { downloadExcel, pricelistSetter,Encrypt } from "../../../../Functions/Functions";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import { plsWait, ErrorMessage } from "../../../../Functions/Mics";
import { useUser } from "@/components/UserProvider";

export default function SalesRportModal({ user, business, baseUrl }) {
  const [StoresList, setStoresList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [usersList] = useState(user);
  const [searchPeriod, setSearchPeriod] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const currentUser = useUser();

  const fetchData = async () => {
    try {
      setLoading(true);
      plsWait("Loading Report Data...");
      const res = await fetch(`${baseUrl}/api/Invoice/report`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(currentUser.user.business.tenantId)}`,
          access: `${Encrypt(currentUser.user.user._id)}`,
          sessionKey: `Bearer ${Encrypt(currentUser.user.SessionId)}`
        },
      });

      if (!res.ok) throw new Error("Failed to fetch product data");

      const fetchedData = await res.json();
      // assign data
      setCustomersList(fetchedData.customers);
      setStoresList(fetchedData.stores);
      const invoicesFiltered = fetchedData.invoices?.filter(
        (item) => item.billStatus?.toLowerCase() !== "draft"
      ) || [];
      setFilteredData(invoicesFiltered);

      // Pass the actual fetched lists/data into showModal so the modal renders immediately
      setTimeout(() => {
        showModal(invoicesFiltered, fetchedData.customers || [], fetchedData.stores || [], usersList);
      }, 100);
      setLoading(false);
    } catch (error) {
      ErrorMessage(error.message);
      setLoading(false);
    }
  };

  const showModal = (initialInvoices = [], customers = [], stores = [], users = []) => {
    // local helpers that use the provided lists (avoids stale closure over state)

    const getSTore = (id) => {
      const selectedStore = stores.find((s) => s._id === id);
      return selectedStore?.WHName || "";
    };

    const getUser = (id) => {
      const selectedUser = users.find((u) => u._id === id);
      return selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : "";
    };

    const generateTableRows = (data) =>
      (data || [])
        .map(
          (item, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px;">${index + 1}</td>
        <td style="padding: 4px; text-align: left;">${(item.billReferenceNo || "").trim()}</td>
        <td style="padding: 4px;">${(item.invoicelocation || "").trim()}</td>
        <td style="padding: 4px;">${item.customer.Username}</td>
        <td style="padding: 4px;">${getSTore(item.whId)}</td>
        <td style="padding: 4px;">${getUser(item.invoicerId)}</td>
        <td style="padding: 4px;">${getUser(item.salesPerson)}</td>
        <td style="padding: 4px;">${moment(item.startDate).format("YYYY-MM-DD")}</td>
        <td style="padding: 4px;">${item.DELIVERYDATE ? moment(item.DELIVERYDATE).format("YYYY-MM-DD") : ""}</td>
        <td style="padding: 4px;">
          <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px;">
            ${item.billStatus?.toUpperCase() || ""}
          </span>
        </td>
        <td style="padding: 4px;">${pricelistSetter(item.priceList, business)}</td>
        <td style="padding: 4px;">${(item.taxRate ?? 0).toLocaleString()}</td>
        <td style="padding: 4px;">${(item.discount ?? 0).toLocaleString()}</td>
        <td style="padding: 4px;">${(item.subTotal ?? 0).toLocaleString()}</td>
        <td style="padding: 4px;">${(item.grandTotal ?? 0).toLocaleString()}</td>
      </tr>
    `
        )
        .join("");

    Swal.fire({
      title: "Sales Report",
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
            <label style="font-weight: 600; font-size: 12px;">Others</label><br/>
            <select id="Others" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              <option value="discount">Discount</option>
              <option value="vat">VAT</option>
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Status</label><br/>
            <select id="Status" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              <option value="Invoice">Invoice</option>
              <option value="Order">Order</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Customer</label><br/>
            <select id="customerFilter" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${customers
                .sort((a, b) => a.Username?.localeCompare(b.Username || "") || 0)
                .map((c) => `<option value="${c._id}">${c.Username}</option>`)
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Store</label><br/>
            <select id="Store" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${stores.map((b) => `<option value="${b._id}">${b.WHName}</option>`).join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Rep</label><br/>
            <select id="Rep" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${users
                .map((b) => `<option value="${b._id}">${b.firstName} ${b.lastName}</option>`)
                .join("")}
            </select>
          </div>
           <div>
            <label style="font-weight: 600; font-size: 12px;">PriceList</label><br/>
            <select id="PriceList" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
             <option value="PriceList1">${business.priceList1}</option>
             <option value="PriceList2">${business.priceList2}</option>
             <option value="PriceList3">${business.priceList3}</option>
             <option value="PriceList4">${business.priceList4}</option>
             <option value="PriceList5">${business.priceList5}</option>
             <option value="PriceList6">${business.priceList6}</option>
             <option value="PriceList7">${business.priceList7}</option>
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
                <th style="padding: 4px;">Store Code</th>
                <th style="padding: 4px;">Customer</th>
                <th style="padding: 4px;">Store</th>
                <th style="padding: 4px;">Invoicer</th>
                <th style="padding: 4px;">Sales Rep</th>
                <th style="padding: 4px;">Ord.Date</th>
                <th style="padding: 4px;">Inv.Date</th>
                <th style="padding: 4px;">Status</th>
                <th style="padding: 4px;">Pricelist</th>
                <th style="padding: 4px;">VAT</th>
                <th style="padding: 4px;">Dis. Allowed</th>
                <th style="padding: 4px;">Sub.</th>
                <th style="padding: 4px;">Grand</th>
              </tr>
            </thead>
            <tbody id="paymentTableBody">
              ${generateTableRows(initialInvoices)}
            </tbody>
          </table>
        </div>
        <div id="tableDownloadBtn" style="margin-top: 12px; text-align: right;"></div>
      `,
      width: "93%",
      showConfirmButton: false,
      didOpen: () => {
        const tableBody = document.getElementById("paymentTableBody");
        let currentData = initialInvoices.slice();

        const applyFilters = () => {
          const startDate = document.getElementById("startDate").value;
          const endDate = document.getElementById("endDate").value;
          const Others = document.getElementById("Others").value;
          const customer = document.getElementById("customerFilter").value;
          const Rep = document.getElementById("Rep").value;
          const Store = document.getElementById("Store").value;
          const Status = document.getElementById("Status").value;
          const PriceList = document.getElementById("PriceList").value;

          const start = startDate ? moment(startDate) : null;
          const end = endDate ? moment(endDate) : null;
          setSearchPeriod(`${startDate}-${endDate}`);

          const filtered = initialInvoices.filter((item) => {
            const itemDate = moment(item.startDate);
            const othersMatch =
              !Others ||
              (Others.toLowerCase() === "vat" && item.taxRate > 0) ||
              (Others.toLowerCase() === "discount" && item.discount > 0) ||
              item.collectionRef?.toLowerCase() === Others.toLowerCase();
            return (
              (!start || itemDate.isSameOrAfter(start, "day")) &&
              (!end || itemDate.isSameOrBefore(end, "day")) &&
              othersMatch &&
              (!Rep || (item.salesPerson || "").toLowerCase() === Rep.toLowerCase()) &&
              (!Status || (item.billStatus || "").toLowerCase() === Status.toLowerCase()) &&
              (!customer || item.customer._id === customer) &&
              (!Store || item.whId === Store) &&
              (!PriceList || (item.priceList || "").toLowerCase() === PriceList.toLowerCase())
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
                    "Store code": entry.invoicelocation,
                    Store: getSTore(entry.whId),
                    Invoicer: getUser(entry.invoicerId),
                    Customer: entry.customer.Username,
                    Rep: getUser(entry.salesPerson),
                    status: entry.billStatus,
                    Pricelist: pricelistSetter(entry.priceList, business),
                    "Ord Date": entry.startDate,
                    "Inv Date": entry.DELIVERYDATE ? moment(entry.DELIVERYDATE).format("YYYY-MM-DD") : "",
                    VAT: entry.taxRate,
                    "Dis Allowed": entry.discount,
                    "Sub Total": entry.subTotal,
                    Grand: entry.grandTotal,
                  });
                });
                const excelBtn = downloadExcel(clean, `${searchPeriod} Sales Report`);
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
          "bankFilter",
          "Rep",
          "Store",
          "Status",
          "Others",
          "PriceList",
        ].forEach((id) => {
          const el = document.getElementById(id);
          if (el) {
            el.addEventListener("input", applyFilters);
            el.addEventListener("change", applyFilters);
          }
        });

        // Initial render (uses passed-in invoices so it shows immediately)
        updateTable(currentData);
      },
    });
  };

  return (
    <button
      onClick={fetchData}
      disabled={loading}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <ArrowTrendingUpIcon className="w-4 h-4 inline-block" />
      Generate Sales Report
    </button>
  );
}
