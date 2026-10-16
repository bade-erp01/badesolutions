"use client";

import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";

import {
  downloadExcel,
  pricelistSetter,
  Encrypt,
} from "../../../../Functions/Functions";
import { plsWait, ErrorMessage } from "../../../../Functions/Mics";
import { useUser } from "@/components/UserProvider";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const idOf = (val) => {
  if (val == null || val === "") return "";
  if (typeof val === "object") return String(val._id ?? "");
  return String(val);
};

export default function SalesRportModal({ user, business, baseUrl }) {
  const [StoresList, setStoresList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [usersList] = useState(user);
  const [loading, setLoading] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState(undefined);
  const currentUser = useUser();

  const fetchData = async (range) => {
    if (!range?.from || !range?.to) {
      ErrorMessage("Please select both start and end dates.");
      return;
    }

    try {
      setLoading(true);
      plsWait("Loading Report Data...");

      const start = format(range.from, "yyyy-MM-dd");
      const end = format(range.to, "yyyy-MM-dd");

      const res = await fetch(`${baseUrl}/api/Invoice/report?startDate=${start}&endDate=${end}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(
            currentUser.user.business.tenantId
          )}`,
          access: `${Encrypt(currentUser.user.user._id)}`,
          sessionKey: `Bearer ${Encrypt(currentUser.user.SessionId)}`,
        },
      });

      const fetchedData = await res.json();
      if (!res.ok) throw new Error(fetchedData.error || `Failed to fetch product data`);


      try {
        Swal.close();
      } catch (_) {}

      setCustomersList(fetchedData.customers || []);
      setStoresList(fetchedData.stores || []);

      const invoicesFiltered =
        fetchedData.invoices?.filter((item) => {
          if ((item.billStatus || "").toLowerCase() === "draft") return false;

          const itemDate = moment(item.startDate, ["YYYY-MM-DD", moment.ISO_8601]);
          if (!itemDate.isValid()) return false;

          return (
            itemDate.isSameOrAfter(moment(start), "day") &&
            itemDate.isSameOrBefore(moment(end), "day")
          );
        }) || [];

      setDateDialogOpen(false);

      showModal(
        invoicesFiltered,
        fetchedData.customers || [],
        fetchedData.stores || [],
        usersList,
        start,
        end
      );
    } catch (error) {
      try {
        Swal.close();
      } catch (_) {}
      ErrorMessage(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const showModal = (
    initialInvoices = [],
    customers = [],
    stores = [],
    users = [],
    startDate = "",
    endDate = ""
  ) => {
    const searchPeriod = `${startDate}_${endDate}`;

    const getSTore = (id) => {
      const selectedStore = stores.find((s) => idOf(s._id) === idOf(id));
      return selectedStore?.WHName || "";
    };

    const getUser = (id) => {
      const selectedUser = users.find((u) => idOf(u._id) === idOf(id));
      return selectedUser
        ? `${selectedUser.firstName} ${selectedUser.lastName}`
        : "";
    };

    const getCustomerName = (item) => {
      if (!item?.customer) return "";
      if (typeof item.customer === "object") {
        return item.customer.Username || item.customer.Name || "";
      }
      return "";
    };

    const generateTableRows = (data) =>
      (data || [])
        .map(
          (item, index) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 4px;">${index + 1}</td>
        <td style="padding: 4px; text-align: left;">${(
          item.billReferenceNo || ""
        ).trim()}</td>
        <td style="padding: 4px;">${(item.invoicelocation || "").trim()}</td>
        <td style="padding: 4px;">${getCustomerName(item)}</td>
        <td style="padding: 4px;">${getSTore(item.whId)}</td>
        <td style="padding: 4px;">${getUser(item.invoicerId)}</td>
        <td style="padding: 4px;">${getUser(item.salesPerson)}</td>
        <td style="padding: 4px;">${
          item.startDate
            ? moment(item.startDate).format("YYYY-MM-DD")
            : ""
        }</td>
        <td style="padding: 4px;">${
          item.DELIVERYDATE
            ? moment(item.DELIVERYDATE).format("YYYY-MM-DD")
            : ""
        }</td>
        <td style="padding: 4px;">
          <span style="padding: 2px 8px; border-radius: 10px; font-size: 11px;">
            ${item.billStatus?.toUpperCase() || ""}
          </span>
        </td>
        <td style="padding: 4px;">${pricelistSetter(
          item.priceList,
          business
        )}</td>
        <td style="padding: 4px;">${(item.taxRate ?? 0).toLocaleString()}</td>
        <td style="padding: 4px;">${(item.discount ?? 0).toLocaleString()}</td>
        <td style="padding: 4px;">${(item.subTotal ?? 0).toLocaleString()}</td>
        <td style="padding: 4px;">${(
          item.grandTotal ?? 0
        ).toLocaleString()}</td>
      </tr>
    `
        )
        .join("");

    Swal.fire({
      title: "Sales Report",
      html: `
        <style> tr:hover { background-color: #f7fafc; } @media (max-width: 639px) { .swal2-html-container input, .swal2-html-container select, .swal2-html-container textarea { font-size: 16px !important; } } </style>
        <div style="font-size:12px;color:#64748b;margin-bottom:10px;text-align:left;">
          Period: <strong>${startDate}</strong> → <strong>${endDate}</strong>
        </div>
        <div style="margin-bottom: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 8px; text-align:left;">
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
                .slice()
                .sort(
                  (a, b) =>
                    a.Username?.localeCompare(b.Username || "") || 0
                )
                .map(
                  (c) =>
                    `<option value="${idOf(c._id)}">${
                      c.Username || ""
                    }</option>`
                )
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Store</label><br/>
            <select id="Store" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${stores
                .map(
                  (b) =>
                    `<option value="${idOf(b._id)}">${b.WHName || ""}</option>`
                )
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">Rep</label><br/>
            <select id="Rep" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              ${(users || [])
                .map(
                  (b) =>
                    `<option value="${idOf(b._id)}">${b.firstName || ""} ${
                      b.lastName || ""
                    }</option>`
                )
                .join("")}
            </select>
          </div>
          <div>
            <label style="font-weight: 600; font-size: 12px;">PriceList</label><br/>
            <select id="PriceList" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
              <option value="">All</option>
              <option value="PriceList1">${business.priceList1 || ""}</option>
              <option value="PriceList2">${business.priceList2 || ""}</option>
              <option value="PriceList3">${business.priceList3 || ""}</option>
              <option value="PriceList4">${business.priceList4 || ""}</option>
              <option value="PriceList5">${business.priceList5 || ""}</option>
              <option value="PriceList6">${business.priceList6 || ""}</option>
              <option value="PriceList7">${business.priceList7 || ""}</option>
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
      showCloseButton: true,
      didOpen: () => {
        const root = Swal.getHtmlContainer();
        if (!root) return;

        const tableBody = root.querySelector("#paymentTableBody");
        let currentData = initialInvoices.slice();

        const applyFilters = () => {
          const Others = root.querySelector("#Others")?.value || "";
          const customer = root.querySelector("#customerFilter")?.value || "";
          const Rep = root.querySelector("#Rep")?.value || "";
          const Store = root.querySelector("#Store")?.value || "";
          const Status = root.querySelector("#Status")?.value || "";
          const PriceList = root.querySelector("#PriceList")?.value || "";

          const filtered = initialInvoices.filter((item) => {
            const othersMatch =
              !Others ||
              (Others.toLowerCase() === "vat" && Number(item.taxRate) > 0) ||
              (Others.toLowerCase() === "discount" &&
                Number(item.discount) > 0);

            const customerId = idOf(item.customer?._id || item.customer);
            const salesPersonId = idOf(item.salesPerson);
            const storeId = idOf(item.whId);

            return (
              othersMatch &&
              (!Rep || salesPersonId === idOf(Rep)) &&
              (!Status ||
                (item.billStatus || "").toLowerCase() ===
                  Status.toLowerCase()) &&
              (!customer || customerId === idOf(customer)) &&
              (!Store || storeId === idOf(Store)) &&
              (!PriceList ||
                (item.priceList || "").toLowerCase() ===
                  PriceList.toLowerCase())
            );
          });

          currentData = filtered;
          updateTable(filtered);
        };

        const updateTable = (filtered) => {
          if (tableBody) tableBody.innerHTML = generateTableRows(filtered);

          const downloadContainer = root.querySelector("#tableDownloadBtn");
          if (!downloadContainer) return;

          downloadContainer.innerHTML = "";

          if (filtered.length > 0) {
            const button = document.createElement("button");
            button.type = "button";
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
                Download Excel
              </span>
            `;
            button.onclick = () => {
              const clean = filtered.map((entry) => ({
                Ref: entry.billReferenceNo,
                "Store code": entry.invoicelocation,
                Store: getSTore(entry.whId),
                Invoicer: getUser(entry.invoicerId),
                Customer: getCustomerName(entry),
                Rep: getUser(entry.salesPerson),
                status: entry.billStatus,
                Pricelist: pricelistSetter(entry.priceList, business),
                "Ord Date": entry.startDate,
                "Inv Date": entry.DELIVERYDATE
                  ? moment(entry.DELIVERYDATE).format("YYYY-MM-DD")
                  : "",
                VAT: entry.taxRate,
                "Dis Allowed": entry.discount,
                "Sub Total": entry.subTotal,
                Grand: entry.grandTotal,
              }));
              downloadExcel(clean, `${searchPeriod} Sales Report`);
            };
            downloadContainer.appendChild(button);
          }
        };

        [
          "customerFilter",
          "Rep",
          "Store",
          "Status",
          "Others",
          "PriceList",
        ].forEach((id) => {
          const el = root.querySelector(`#${id}`);
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
    <>
      <button
        type="button"
        onClick={() => setDateDialogOpen(true)}
        disabled={loading}
        className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
      >
        <ArrowTrendingUpIcon className="w-4 h-4 inline-block" />
        Generate Sales Report
      </button>

      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Date Range</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd, y")} –{" "}
                        {format(dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick start and end date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={1}
                />
              </PopoverContent>
            </Popover>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => dateRange && fetchData(dateRange)}
              disabled={!dateRange?.from || !dateRange?.to || loading}
            >
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}