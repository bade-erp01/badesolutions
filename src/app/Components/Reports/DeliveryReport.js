"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import moment from "moment";
import { TruckIcon } from "@heroicons/react/24/outline";
import { useUser } from "@/components/UserProvider";
import { downloadExcel, Encrypt } from "../../../../Functions/Functions";
import { plsWait, ErrorMessage } from "../../../../Functions/Mics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { escapeHtml } from "@/lib/security/escapeHtml";

export default function DeliveryRportModal({ user, business, baseUrl }) {
  const [filteredData, setFilteredData] = useState([]);
  const [StoresList, setStoresList] = useState([]);
  const [customersList, setCustomersList] = useState([]);
  const [usersList] = useState(user || []);
  const [searchPeriod, setSearchPeriod] = useState("");
  const [loading, setLoading] = useState(false);

  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const currentUser = useUser();

  const fetchData = async () => {
    if (!startDate || !endDate) {
      ErrorMessage("Please select both the start date and end date.");
      return;
    }

    if (moment(startDate).isAfter(moment(endDate), "day")) {
      ErrorMessage("Start date cannot be later than end date.");
      return;
    }

    try {
      setLoading(true);
      setDateDialogOpen(false);

      setSearchPeriod(`${startDate} - ${endDate}`);

      plsWait("Loading Report data...");

      const params = new URLSearchParams({
        startDate,
        endDate,
        dateField: "DELIVERYDATE", // ← filters by delivery date
      });

      const tenantId =
        currentUser?.user?.business?.tenantId ||
        business?.tenantId;

      const userId =
        currentUser?.user?.user?._id ||
        currentUser?.user?._id;

      const sessionId =
        currentUser?.user?.SessionId;

      const res = await fetch(
        `${baseUrl}/api/Invoice/report?${params.toString()}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(tenantId)}`,
            access: `${Encrypt(userId)}`,
            sessionKey: `Bearer ${Encrypt(sessionId)}`,
          },
          cache: "no-store",
        }
      );

      if (!res.ok) {
        let message = "Failed to fetch logistics report.";

        try {
          const errorData = await res.json();
          message =  errorData.error || message;
        } catch {
          // Keep the default error message if the response is not JSON.
        }

        throw new Error(message);
      }

      const fetchedData = await res.json();

      setCustomersList(fetchedData.customers || []);
      setStoresList(fetchedData.stores || []);

      const invoices =
        fetchedData.invoices?.filter((item) => {
          const status = item.billStatus?.toLowerCase();
          return status === "invoice" || status === "cancelled";
        }) || [];

      setFilteredData(invoices);
      showModal(invoices);
    } catch (error) {
      ErrorMessage(error.message || "Unable to load logistics report.");
    } finally {
      setLoading(false);
    }
  };

  const getSTore = (id) => {
    const selectedStore = StoresList.find(
      (store) => String(store._id) === String(id?._id || id)
    );

    return selectedStore?.WHName || "";
  };

  const getUser = (id) => {
    const selectedUser = (usersList || []).find(
      (item) => String(item._id) === String(id?._id || id)
    );

    return selectedUser
      ? `${selectedUser.firstName || ""} ${selectedUser.lastName || ""}`.trim()
      : "";
  };

  const generateTableRows = (data) => {
    return data
      .map(
        (item, index) => `
          <tr style="border-bottom: 1px solid #e2e8f0;">
            <td style="padding: 8px;">${index + 1}</td>
            <td style="padding: 8px; text-align: left;">${escapeHtml(item.billReferenceNo?.trim() || "")}</td>
            <td style="padding: 8px;">${escapeHtml(item.customer?.Username || "")}</td>
            <td style="padding: 8px;">${escapeHtml(getSTore(item.whId))}</td>
            <td style="padding: 8px;">${escapeHtml(getUser(item.invoicerId))}</td>
            <td style="padding: 8px;">${escapeHtml(getUser(item.salesPerson))}</td>
            <td style="padding: 8px;">${escapeHtml(item.DELIVERYDATE ? moment(item.DELIVERYDATE).format("YYYY-MM-DD") : "")}</td>
            <td style="padding: 8px;">${escapeHtml(item.DriverNumber || "")}</td>
            <td style="padding: 8px;">
              <span style="padding: 3px 8px; border-radius: 10px; font-size: 11px; background: #f1f5f9;">
                ${escapeHtml((item.billStatus || "").toUpperCase())}
              </span>
            </td>
            <td style="padding: 8px;">${escapeHtml(item.DriverName || "")}</td>
            <td style="padding: 8px;">${escapeHtml(item.vehicleNumber || "")}</td>
            <td style="padding: 8px;">${escapeHtml(item.WayBillNo || "")}</td>
            <td style="padding: 8px;">${escapeHtml(item.shippingFee?.toLocaleString() || "")}</td>
          </tr>
        `
      )
      .join("");
  };

  const showModal = (initialData = []) => {
    Swal.fire({
      title: "Logistics Report",
      html: `
        <style>
          tr:hover { background-color: #f7fafc; }
          @media (max-width: 639px) { .swal2-html-container input, .swal2-html-container select, .swal2-html-container textarea { font-size: 16px !important; } }
          .logistics-filter {
            padding: 8px;
            font-size: 12px;
            border: 1px solid #cbd5e0;
            border-radius: 6px;
            width: 100%;
            background: white;
          }
          .logistics-label {
            font-weight: 600;
            font-size: 12px;
            display: block;
            margin-bottom: 5px;
          }
        </style>

        <div style="margin-bottom: 12px; padding: 10px; background: #f8fafc; border-radius: 8px; text-align: left; font-size: 12px;">
          <strong>Report period:</strong>
          ${escapeHtml(startDate)} to ${escapeHtml(endDate)}
        </div>

        <div style="margin-bottom: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; text-align: left;">
          <div>
            <label class="logistics-label">Status</label>
            <select id="Status" class="logistics-filter">
              <option value="">All statuses</option>
              <option value="Invoice">Invoice</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label class="logistics-label">Customer</label>
            <select id="customerFilter" class="logistics-filter">
              <option value="">All customers</option>
              ${[...customersList]
                .sort((a, b) =>
                  (a.Username || "").localeCompare(b.Username || "")
                )
                .map(
                  (c) =>
                    `<option value="${escapeHtml(c._id)}">${escapeHtml(c.Username || "")}</option>`
                )
                .join("")}
            </select>
          </div>

          <div>
            <label class="logistics-label">Store</label>
            <select id="Store" class="logistics-filter">
              <option value="">All stores</option>
              ${StoresList.map(
                (store) =>
                  `<option value="${escapeHtml(store._id)}">${escapeHtml(store.WHName || "")}</option>`
              ).join("")}
            </select>
          </div>

          <div>
            <label class="logistics-label">Sales Rep</label>
            <select id="Rep" class="logistics-filter">
              <option value="">All reps</option>
              ${(usersList || [])
                .map(
                  (item) =>
                    `<option value="${escapeHtml(item._id)}">${escapeHtml(item.firstName || "")} ${escapeHtml(item.lastName || "")}</option>`
                )
                .join("")}
            </select>
          </div>
        </div>

        <div style="overflow-x: auto; max-height: 420px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <table style="width:100%; border-collapse: collapse; font-size: 12px; min-width: 1000px;">
            <thead style="background-color: #edf2f7; position: sticky; top: 0;">
              <tr>
                <th style="padding: 8px;">#</th>
                <th style="padding: 8px;">Ref</th>
                <th style="padding: 8px;">Customer</th>
                <th style="padding: 8px;">Store</th>
                <th style="padding: 8px;">Invoicer</th>
                <th style="padding: 8px;">Sales Rep</th>
                <th style="padding: 8px;">Date</th>
                <th style="padding: 8px;">Driver No.</th>
                <th style="padding: 8px;">Status</th>
                <th style="padding: 8px;">Driver</th>
                <th style="padding: 8px;">Vehicle No.</th>
                <th style="padding: 8px;">Waybill No.</th>
                <th style="padding: 8px;">Shipping Fee</th>
              </tr>
            </thead>
            <tbody id="paymentTableBody">
              ${generateTableRows(initialData)}
            </tbody>
          </table>
        </div>

        <div id="tableDownloadBtn" style="margin-top: 12px; text-align: right;"></div>
      `,
      width: "90%",
      showConfirmButton: false,
      didOpen: () => {
        const tableBody = document.getElementById("paymentTableBody");
        const originalData = [...initialData];

        const updateTable = (data) => {
          // eslint-disable-next-line no-unsanitized/property -- every interpolated value is escaped with escapeHtml
          tableBody.innerHTML = generateTableRows(data);

          const downloadContainer = document.getElementById("tableDownloadBtn");
          if (!downloadContainer) return;

          downloadContainer.innerHTML = "";

          if (!data.length) {
            downloadContainer.innerHTML =
              '<span style="font-size:12px;color:#64748b;">No records to export.</span>';
            return;
          }

          const button = document.createElement("button");

          button.type = "button";
          button.textContent = "Download Excel";
          button.style.cssText =
            "display:inline-flex;align-items:center;gap:6px;font-size:13px;background:#2563eb;color:white;padding:9px 14px;border-radius:6px;border:none;cursor:pointer;";

          button.onclick = () => {
            const clean = data.map((entry) => ({
              Ref: entry.billReferenceNo || "",
              "Store code": entry.invoicelocation || "",
              Store: getSTore(entry.whId),
              Invoicer: getUser(entry.invoicerId),
              Customer: entry.customer?.Username || "",
              Address: entry.customer?.billingAddress || "",
              State: entry.customer?.state || "",
              Region: entry.customer?.Region || "",
              Rep: getUser(entry.salesPerson),
              Status: entry.billStatus || "",
              Date: entry.DELIVERYDATE
                ? moment(entry.DELIVERYDATE).format("YYYY-MM-DD")
                : "",
              Driver: entry.DriverName || "",
              "Driver No": entry.DriverNumber || "",
              "Vehicle No": entry.vehicleNumber || "",
              "Waybill No": entry.WayBillNo || "",
              Comment: entry.DeliveryComment || "",
              "Shipping Fee": entry.shippingFee || 0,
              GrandTotal: entry.grandTotal || 0,
            }));

            downloadExcel(clean, `${searchPeriod} Logistics Report`);
          };

          downloadContainer.appendChild(button);
        };

        const applyFilters = () => {
          const customer = document.getElementById("customerFilter").value;
          const rep = document.getElementById("Rep").value;
          const store = document.getElementById("Store").value;
          const status = document.getElementById("Status").value;

          const filtered = originalData.filter((item) => {
            const itemCustomerId = String(
              item.customer?._id || item.customer || ""
            );

            const itemRepId = String(
              item.salesPerson?._id || item.salesPerson || ""
            );

            const itemStoreId = String(item.whId?._id || item.whId || "");

            return (
              (!rep || itemRepId === rep) &&
              (!status ||
                item.billStatus?.toLowerCase() === status.toLowerCase()) &&
              (!customer || itemCustomerId === customer) &&
              (!store || itemStoreId === store)
            );
          });

          setFilteredData(filtered);
          updateTable(filtered);
        };

        ["customerFilter", "Rep", "Store", "Status"].forEach((id) => {
          const element = document.getElementById(id);

          if (element) {
            element.addEventListener("change", applyFilters);
          }
        });

        updateTable(originalData);
      },
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setDateDialogOpen(true)}
        disabled={loading}
        className="flex w-full items-center gap-3 rounded-md p-3 text-xs transition hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <TruckIcon className="inline-block h-4 w-4" />
        {loading ? "Loading Logistics Report..." : "Logistics Report"}
      </button>

      <Dialog open={dateDialogOpen} onOpenChange={setDateDialogOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Logistics Report</DialogTitle>
            <DialogDescription>
              Select the delivery date range before fetching the report.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <label htmlFor="logistics-start-date" className="text-sm font-medium">
                Start date
              </label>
              <Input
                id="logistics-start-date"
                type="date"
                value={startDate}
                max={endDate || undefined}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="logistics-end-date" className="text-sm font-medium">
                End date
              </label>
              <Input
                id="logistics-end-date"
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => setDateDialogOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={loading || !startDate || !endDate}
              onClick={fetchData}
            >
              {loading ? "Loading..." : "Generate Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}