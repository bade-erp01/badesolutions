"use client";

import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import { SwatchIcon } from "@heroicons/react/24/outline";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { downloadExcel, Encrypt } from "../../../../Functions/Functions";
import { plsWait, ErrorMessage } from "../../../../Functions/Mics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
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
import { escapeHtml } from "@/lib/security/escapeHtml";

const idOf = (value) => {
  if (value == null || value === "") return "";
  if (typeof value === "object") return String(value._id ?? value.id ?? "");
  return String(value);
};

const getStoreProductId = (order) =>
  idOf(
    order?.storeProductId ??
      order?.storeproductId ??
      order?.item?._id ??
      order?.item
  );

const getUnderlyingProductId = (item) =>
  idOf(item?.productId ?? item?.Product ?? item?.product?._id ?? item?._id);

const getVendorId = (item) =>
  idOf(item?.Vendor ?? item?.vendorId ?? item?.vendor);

const getStoreId = (item) =>
  idOf(item?.WHID ?? item?.whId ?? item?.WHIDS ?? item?.storeId);

const getVendorLabel = (item, fallbackMap = new Map()) => {
  if (item?.vendorName) return item.vendorName;
  if (item?.Vendor && typeof item.Vendor === "object") {
    return item.Vendor.Name || item.Vendor.NAME || "";
  }
  return fallbackMap.get(getVendorId(item)) || "";
};

const getStoreLabel = (item, fallbackMap = new Map()) => {
  if (item?.WHIDS && typeof item.WHIDS === "object") {
    return item.WHIDS.WHName || "";
  }
  if (item?.WHID && typeof item.WHID === "object") {
    return item.WHID.WHName || "";
  }
  return fallbackMap.get(getStoreId(item)) || "";
};

const getProductLabel = (item, fallbackMap = new Map()) => {
  if (item?.productName) return item.productName;
  if (item?.productId && typeof item.productId === "object") {
    return item.productId.Name || item.productId.name || "";
  }
  if (item?.Name) return item.Name;
  return fallbackMap.get(getUnderlyingProductId(item)) || "";
};

const groupOptions = (rows, idKey, nameKey) => {
  const map = new Map();
  for (const row of rows) {
    const id = idOf(row[idKey]);
    if (!id) continue;
    if (!map.has(id)) {
      map.set(id, { id, name: row[nameKey] || id });
    }
  }
  return Array.from(map.values()).sort((a, b) =>
    String(a.name).localeCompare(String(b.name))
  );
};

export default function StockandSalesReport({ baseUrl, userData }) {
  const [loading, setLoading] = useState(false);
  const [dateDialogOpen, setDateDialogOpen] = useState(false);
  const [dateRange, setDateRange] = useState(undefined);

  const getAuthHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
      access: `${Encrypt(userData.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
    }),
    [userData?.business?.tenantId, userData?.user?._id, userData?.SessionId]
  );

  const buildSummaryRows = useCallback(
    (productList, storeList, vendorList, invoicesAll, purchasesAll, inventory) => {
      const productNameMap = new Map(
        (productList || []).map((p) => [idOf(p._id), p.Name || p.name || ""])
      );
      const vendorNameMap = new Map(
        (vendorList || []).map((v) => [idOf(v._id), v.Name || v.NAME || ""])
      );
      const storeNameMap = new Map(
        (storeList || []).map((s) => [idOf(s._id), s.WHName || ""])
      );

      const inventoryMap = new Map();
      for (const item of inventory || []) {
        const id = idOf(item?._id);
        if (id) inventoryMap.set(id, item);
      }

      const invoices = (invoicesAll || []).filter((invoice) => {
        const status = String(invoice.billStatus || "").toLowerCase();
        return status !== "draft" && status !== "cancelled";
      });

      const returns = (invoicesAll || []).filter(
        (invoice) =>
          String(invoice.billStatus || "").toLowerCase() === "cancelled"
      );

      const purchases = (purchasesAll || []).filter(
        (purchase) => purchase.status === "POSTED TO WAREHOUSE"
      );

      const summaryMap = new Map();

      const ensure = (
        storeProductId,
        vendorId,
        storeId,
        productId,
        labels = {}
      ) => {
        const id = idOf(storeProductId);
        if (!id) return null;

        let entry = summaryMap.get(id);
        if (!entry) {
          entry = {
            Product: id,
            Vendor: idOf(vendorId),
            Store: idOf(storeId),
            productId: idOf(productId),
            vendorName: labels.vendorName || "",
            storeName: labels.storeName || "",
            productName: labels.productName || "",
            PurchCase: 0,
            PurchPcs: 0,
            Sold: 0,
            pcs: 0,
            rStock: 0,
            rPcs: 0,
            Stock: 0,
            PcsStock: 0,
            salesVolume: 0,
          };
          summaryMap.set(id, entry);
        } else {
          if (!entry.Vendor && vendorId) entry.Vendor = idOf(vendorId);
          if (!entry.Store && storeId) entry.Store = idOf(storeId);
          if (!entry.productId && productId) entry.productId = idOf(productId);
          if (!entry.vendorName && labels.vendorName)
            entry.vendorName = labels.vendorName;
          if (!entry.storeName && labels.storeName)
            entry.storeName = labels.storeName;
          if (!entry.productName && labels.productName)
            entry.productName = labels.productName;
        }
        return entry;
      };

      for (const purchase of purchases) {
        if (!Array.isArray(purchase.orders)) continue;
        for (const order of purchase.orders) {
          const item = order.item || {};
          const entry = ensure(
            getStoreProductId(order),
            getVendorId(item) || getVendorId(purchase),
            getStoreId(purchase) || getStoreId(item),
            getUnderlyingProductId(item),
            {
              vendorName:
                getVendorLabel(item, vendorNameMap) ||
                getVendorLabel(purchase, vendorNameMap),
              storeName: getStoreLabel(purchase, storeNameMap),
              productName: getProductLabel(item, productNameMap),
            }
          );
          if (!entry) continue;
          entry.PurchCase += Number(order.Qty) || 0;
          entry.PurchPcs += Number(order.pcs) || 0;
        }
      }

      for (const invoice of invoices) {
        if (!Array.isArray(invoice.orders)) continue;
        for (const order of invoice.orders) {
          const item = order.item || {};
          const entry = ensure(
            getStoreProductId(order),
            getVendorId(item),
            getStoreId(invoice) || getStoreId(item),
            getUnderlyingProductId(item),
            {
              vendorName: getVendorLabel(item, vendorNameMap),
              storeName: getStoreLabel(invoice, storeNameMap),
              productName: getProductLabel(item, productNameMap),
            }
          );
          if (!entry) continue;
          entry.Sold += Number(order.Qty) || 0;
          entry.pcs += Number(order.pcsReq ?? order.pcs) || 0;
          entry.salesVolume += Number(order.total) || 0;
        }
      }

      for (const invoice of returns) {
        if (!Array.isArray(invoice.orders)) continue;
        for (const order of invoice.orders) {
          const item = order.item || {};
          const entry = ensure(
            getStoreProductId(order),
            getVendorId(item),
            getStoreId(invoice) || getStoreId(item),
            getUnderlyingProductId(item),
            {
              vendorName: getVendorLabel(item, vendorNameMap),
              storeName: getStoreLabel(invoice, storeNameMap),
              productName: getProductLabel(item, productNameMap),
            }
          );
          if (!entry) continue;
          entry.rStock += Number(order.Qty) || 0;
          entry.rPcs += Number(order.pcsReq ?? order.pcs) || 0;
        }
      }

      for (const [id, entry] of summaryMap) {
        const inv = inventoryMap.get(id);
        if (!inv) continue;

        entry.Stock = Number(inv.currentQty) || 0;
        entry.PcsStock = Number(inv.pcs) || 0;

        if (!entry.productId) entry.productId = getUnderlyingProductId(inv);
        if (!entry.Vendor) entry.Vendor = getVendorId(inv);
        if (!entry.Store) entry.Store = getStoreId(inv);

        if (!entry.productName)
          entry.productName = getProductLabel(inv, productNameMap);
        if (!entry.vendorName)
          entry.vendorName = getVendorLabel(inv, vendorNameMap);
        if (!entry.storeName)
          entry.storeName = getStoreLabel(inv, storeNameMap);
      }

      for (const entry of summaryMap.values()) {
        if (!entry.productName && entry.productId) {
          entry.productName = productNameMap.get(entry.productId) || "";
        }
        if (!entry.vendorName && entry.Vendor) {
          entry.vendorName = vendorNameMap.get(entry.Vendor) || "";
        }
        if (!entry.storeName && entry.Store) {
          entry.storeName = storeNameMap.get(entry.Store) || "";
        }
      }

      return Array.from(summaryMap.values());
    },
    []
  );

  const showReportModal = useCallback(
    (fetchedData, startDate, endDate) => {
      const productList = fetchedData.productList || [];
      const storeList = fetchedData.storeList || [];
      const vendorList = fetchedData.vendorList || [];
      const invoicesAll = fetchedData.invoiceList || [];
      const purchasesAll = fetchedData.PurchaseOrderList || [];
      const inventory =
        fetchedData.inventoryItem || fetchedData.ReportInventory || [];

      const allRows = buildSummaryRows(
        productList,
        storeList,
        vendorList,
        invoicesAll,
        purchasesAll,
        inventory
      );

      const vendorOpts = groupOptions(allRows, "Vendor", "vendorName");
      const storeOpts = groupOptions(allRows, "Store", "storeName");
      const productOpts = groupOptions(allRows, "productId", "productName");

      const vendorOptionsHtml = vendorOpts
        .map(
          (v) =>
            `<option value="${escapeHtml(v.id)}">${escapeHtml(
              v.name || "Unnamed vendor"
            )}</option>`
        )
        .join("");

      const storeOptionsHtml = storeOpts
        .map(
          (s) =>
            `<option value="${escapeHtml(s.id)}">${escapeHtml(
              s.name || "Unnamed store"
            )}</option>`
        )
        .join("");

      const applyFilters = (filters) => {
        const vendorFilter = idOf(filters.vendor);
        const storeFilter = idOf(filters.store);
        const productFilter = idOf(filters.product);

        return allRows.filter((item) => {
          if (vendorFilter && idOf(item.Vendor) !== vendorFilter) return false;
          if (storeFilter && idOf(item.Store) !== storeFilter) return false;
          if (productFilter && idOf(item.productId) !== productFilter)
            return false;
          return true;
        });
      };

      Swal.fire({
        title: "Stock & Sales Report",
        html: `
          <style> @media (max-width: 639px) { .swal2-html-container input, .swal2-html-container select, .swal2-html-container textarea { font-size: 16px !important; } } </style>
          <div style="font-size:12px;color:#718096;margin-bottom:12px;">
            Period: <strong>${escapeHtml(startDate)}</strong> → <strong>${escapeHtml(endDate)}</strong>
          </div>

          <div style="margin-bottom:12px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:8px;text-align:left;">
            <div>
              <label for="vendor" style="font-size:12px;color:#4a5568;">Vendor</label>
              <select id="vendor" style="width:100%;padding:6px;font-size:12px;border:1px solid #cbd5e0;border-radius:4px;">
                <option value="">All vendors</option>
                ${vendorOptionsHtml}
              </select>
            </div>

            <div>
              <label for="store" style="font-size:12px;color:#4a5568;">Store</label>
              <select id="store" style="width:100%;padding:6px;font-size:12px;border:1px solid #cbd5e0;border-radius:4px;">
                <option value="">All stores</option>
                ${storeOptionsHtml}
              </select>
            </div>

            <div style="position:relative;">
              <label for="productSearch" style="font-size:12px;color:#4a5568;">Product</label>
              <input
                id="productSearch"
                type="text"
                placeholder="Type to search product..."
                autocomplete="off"
                style="width:100%;padding:6px;font-size:12px;border:1px solid #cbd5e0;border-radius:4px;box-sizing:border-box;"
              />
              <input id="product" type="hidden" value="" />
              <div
                id="productDropdown"
                style="display:none;position:absolute;left:0;right:0;top:100%;z-index:50;max-height:220px;overflow:auto;background:#fff;border:1px solid #cbd5e0;border-radius:6px;box-shadow:0 8px 20px rgba(0,0,0,0.12);margin-top:2px;"
              ></div>
            </div>
          </div>

          <div id="reportTable" style="max-height:400px;overflow:auto;border:1px solid #e2e8f0;border-radius:6px;"></div>

          <div style="margin-top:12px;text-align:right;">
            <button id="downloadExcelBtn" type="button" style="background-color:#2b6cb0;color:white;padding:6px 12px;border-radius:6px;font-size:12px;margin-right:5px;border:none;cursor:pointer;">
              Download Excel
            </button>
            <button id="downloadPdfBtn" type="button" style="background-color:#2b6cb0;color:white;padding:6px 12px;border-radius:6px;font-size:12px;border:none;cursor:pointer;">
              Download PDF
            </button>
          </div>
        `,
        width: "95%",
        showConfirmButton: false,
        showCloseButton: true,
        didOpen: () => {
          const root = Swal.getHtmlContainer();
          if (!root) return;

          const vendorSelect = root.querySelector("#vendor");
          const storeSelect = root.querySelector("#store");
          const productHidden = root.querySelector("#product");
          const productSearch = root.querySelector("#productSearch");
          const productDropdown = root.querySelector("#productDropdown");
          const tableEl = root.querySelector("#reportTable");
          const excelBtn = root.querySelector("#downloadExcelBtn");
          const pdfBtn = root.querySelector("#downloadPdfBtn");

          const getFilters = () => ({
            vendor: idOf(vendorSelect?.value),
            store: idOf(storeSelect?.value),
            product: idOf(productHidden?.value),
          });

          const renderTable = () => {
            const data = applyFilters(getFilters());

            const rows = data
              .map(
                (item) => `
                <tr style="border-bottom:1px solid #e2e8f0;">
                  <td style="padding:6px;text-align:left;">${escapeHtml(item.productName)}</td>
                  <td style="padding:6px;text-align:left;">${escapeHtml(item.vendorName)}</td>
                  <td style="padding:6px;text-align:left;">${escapeHtml(item.storeName)}</td>
                  <td style="padding:6px;text-align:right;">${escapeHtml(item.PurchCase)}</td>
                  <td style="padding:6px;text-align:right;">${escapeHtml(item.PurchPcs)}</td>
                  <td style="padding:6px;text-align:right;">${escapeHtml(item.Sold)}</td>
                  <td style="padding:6px;text-align:right;">${escapeHtml(item.pcs)}</td>
                  <td style="padding:6px;text-align:right;">${escapeHtml(item.rStock)}</td>
                  <td style="padding:6px;text-align:right;">${escapeHtml(item.rPcs)}</td>
                  <td style="padding:6px;text-align:right;">C: ${escapeHtml(item.Stock)}, P: ${escapeHtml(item.PcsStock)}</td>
                  <td style="padding:6px;text-align:right;">${escapeHtml(Number(item.salesVolume || 0).toLocaleString())}</td>
                </tr>`
              )
              .join("");

            if (!tableEl) return;

            // eslint-disable-next-line no-unsanitized/property -- every interpolated value is escaped with escapeHtml
            tableEl.innerHTML = `
              <table style="width:100%;border-collapse:collapse;font-size:12px;min-width:1000px;">
                <thead style="position:sticky;top:0;background:#edf2f7;z-index:1;">
                  <tr>
                    <th style="padding:7px;text-align:left;">Product</th>
                    <th style="padding:7px;text-align:left;">Vendor</th>
                    <th style="padding:7px;text-align:left;">Store</th>
                    <th style="padding:7px;text-align:right;">Case Buy</th>
                    <th style="padding:7px;text-align:right;">Pcs Buy</th>
                    <th style="padding:7px;text-align:right;">Case Sold</th>
                    <th style="padding:7px;text-align:right;">Pcs Sold</th>
                    <th style="padding:7px;text-align:right;">Case Returned</th>
                    <th style="padding:7px;text-align:right;">Pcs Returned</th>
                    <th style="padding:7px;text-align:right;">Available Stock</th>
                    <th style="padding:7px;text-align:right;">Sales Volume</th>
                  </tr>
                </thead>
                <tbody>
                  ${
                    rows ||
                    `<tr><td colspan="11" style="padding:14px;text-align:center;color:#718096;">No rows match the selected filters.</td></tr>`
                  }
                </tbody>
              </table>
            `;
          };

          const renderProductDropdown = (query = "") => {
            if (!productDropdown) return;

            const q = String(query || "").trim().toLowerCase();
            const matched = !q
              ? productOpts.slice(0, 80)
              : productOpts
                  .filter((p) =>
                    String(p.name || "").toLowerCase().includes(q)
                  )
                  .slice(0, 80);

            const clearRow = `
              <div data-id="" data-name="" style="padding:8px 10px;font-size:12px;cursor:pointer;border-bottom:1px solid #edf2f7;color:#2b6cb0;font-weight:600;">
                All products
              </div>
            `;

            const items = matched
              .map(
                (p) => `
                <div data-id="${escapeHtml(p.id)}" data-name="${escapeHtml(
                  p.name
                )}" style="padding:8px 10px;font-size:12px;cursor:pointer;border-bottom:1px solid #f1f5f9;">
                  ${escapeHtml(p.name || p.id)}
                </div>
              `
              )
              .join("");

            // eslint-disable-next-line no-unsanitized/property -- every interpolated value is escaped with escapeHtml
            productDropdown.innerHTML =
              clearRow +
              (items ||
                `<div style="padding:10px;font-size:12px;color:#718096;">No products found</div>`);
            productDropdown.style.display = "block";

            productDropdown.querySelectorAll("[data-id]").forEach((el) => {
              el.onmouseenter = () => {
                el.style.background = "#edf2f7";
              };
              el.onmouseleave = () => {
                el.style.background = "#fff";
              };
              el.onclick = () => {
                const id = el.getAttribute("data-id") || "";
                const name = el.getAttribute("data-name") || "";
                if (productHidden) productHidden.value = id;
                if (productSearch) {
                  productSearch.value = id ? name : "";
                }
                productDropdown.style.display = "none";
                renderTable();
              };
            });
          };

          // Product search wiring
          if (productSearch) {
            productSearch.addEventListener("focus", () => {
              renderProductDropdown(productSearch.value);
            });

            productSearch.addEventListener("input", () => {
              // typing clears selected id until user picks from list
              if (productHidden) productHidden.value = "";
              renderProductDropdown(productSearch.value);
              // if input emptied, show all products again
              if (!productSearch.value.trim()) {
                renderTable();
              }
            });

            productSearch.addEventListener("keydown", (e) => {
              if (e.key === "Escape") {
                productDropdown.style.display = "none";
              }
              if (e.key === "Enter") {
                e.preventDefault();
                const first = productDropdown?.querySelector(
                  "[data-id]:not([data-id=''])"
                );
                if (first) first.click();
              }
            });
          }

          // close dropdown when clicking outside
          const onDocClick = (e) => {
            if (!productDropdown || !productSearch) return;
            if (
              !productDropdown.contains(e.target) &&
              e.target !== productSearch
            ) {
              productDropdown.style.display = "none";
            }
          };
          document.addEventListener("click", onDocClick);

          renderTable();

          vendorSelect?.addEventListener("change", renderTable);
          storeSelect?.addEventListener("change", renderTable);

          if (excelBtn) {
            excelBtn.onclick = () => {
              const data = applyFilters(getFilters());
              if (!data.length) {
                ErrorMessage("No data to export for these filters.");
                return;
              }

              downloadExcel(
                data.map((item) => ({
                  Product: item.productName,
                  Vendor: item.vendorName,
                  Store: item.storeName,
                  "Case Buy": item.PurchCase,
                  "Pcs Buy": item.PurchPcs,
                  "Case Sold": item.Sold,
                  "Pcs Sold": item.pcs,
                  "Returned Case": item.rStock,
                  "Returned Pcs": item.rPcs,
                  "Inventory Case": item.Stock,
                  "Inventory Pcs": item.PcsStock,
                  "Sales Volume": item.salesVolume || 0,
                })),
                `Sales-${startDate}-${endDate}`
              );
            };
          }

          if (pdfBtn) {
            pdfBtn.onclick = () => {
              const data = applyFilters(getFilters());
              if (!data.length) {
                ErrorMessage("No data to export for these filters.");
                return;
              }

              const doc = new jsPDF({ orientation: "landscape" });
              autoTable(doc, {
                head: [
                  [
                    "Product",
                    "Vendor",
                    "Store",
                    "Case Buy",
                    "Pcs Buy",
                    "Case Sold",
                    "Pcs Sold",
                    "Case Returned",
                    "Pcs Returned",
                    "Avail. Case",
                    "Avail. Pcs",
                    "Sales Volume",
                  ],
                ],
                body: data.map((item) => [
                  item.productName,
                  item.vendorName,
                  item.storeName,
                  item.PurchCase,
                  item.PurchPcs,
                  item.Sold,
                  item.pcs,
                  item.rStock,
                  item.rPcs,
                  item.Stock,
                  item.PcsStock,
                  Number(item.salesVolume || 0).toLocaleString(),
                ]),
                startY: 10,
                styles: { fontSize: 7, cellPadding: 2 },
                headStyles: { fillColor: [43, 108, 176] },
                margin: { left: 8, right: 8 },
              });
              doc.save(`Stock_Sales_${startDate}_to_${endDate}.pdf`);
            };
          }
        },
      });
    },
    [buildSummaryRows]
  );

  const fetchData = useCallback(
    async (range) => {
      if (!range?.from || !range?.to) {
        ErrorMessage("Please select both start and end dates.");
        return;
      }

      try {
        setLoading(true);
        plsWait("Loading Stock & Sales Report...");

        const start = format(range.from, "yyyy-MM-dd");
        const end = format(range.to, "yyyy-MM-dd");

        const res = await fetch(
          `${baseUrl}/api/Products/report?startDate=${encodeURIComponent(
            start
          )}&endDate=${encodeURIComponent(end)}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        const fetchedData = await res.json();

        if (!res.ok) {
          throw new Error(fetchedData?.error || "Failed to fetch product data");
        }

        Swal.close();
        setDateDialogOpen(false);
        showReportModal(fetchedData, start, end);
      } catch (error) {
        Swal.close();
        ErrorMessage(error?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, getAuthHeaders, showReportModal]
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setDateDialogOpen(true)}
        className="flex w-full items-center gap-3 rounded-md p-3 text-xs transition hover:bg-gray-700"
        disabled={loading}
      >
        <SwatchIcon className="h-5 w-5" />
        Stock & Sales Report
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
                  id="date"
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
                    <span>Pick a date range</span>
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