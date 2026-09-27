"use client";

import { useState, useCallback } from "react";
import Swal from "sweetalert2";
import { SwatchIcon } from "@heroicons/react/24/outline";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import { downloadExcel } from "../../../../Functions/Functions";
import { Encrypt } from "../../../../Functions/Functions";
import { plsWait, ErrorMessage } from "../../../../Functions/Mics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// shadcn components – adjust paths to match your project
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
    [userData]
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
          `${baseUrl}/api/Products/report?startDate=${start}&endDate=${end}`,
          {
            method: "GET",
            headers: getAuthHeaders(),
          }
        );

        if (!res.ok) throw new Error("Failed to fetch product data");

        const fetchedData = await res.json();
        setDateDialogOpen(false);
        showReportModal(fetchedData, start, end);
      } catch (error) {
        ErrorMessage(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    },
    [baseUrl, getAuthHeaders]
  );

  const buildSummary = useCallback(
    (
      productList,
      storeList,
      vendorList,
      invoicesAll,
      purchasesAll,
      inventory,
      filters
    ) => {
      const productMap = new Map(productList.map((p) => [p._id, p.Name]));
      const vendorMap = new Map(vendorList.map((v) => [v._id, v.Name]));
      const storeMap = new Map(storeList.map((s) => [s._id, s.WHName]));
      const inventoryMap = new Map(inventory.map((i) => [i._id, i]));

      const invoices = invoicesAll.filter((inv) => {
        const s = (inv.billStatus || "").toLowerCase();
        return s !== "draft" && s !== "cancelled";
      });
      const returns = invoicesAll.filter(
        (inv) => (inv.billStatus || "").toLowerCase() === "cancelled"
      );
      const purchases = purchasesAll.filter(
        (po) => po.status === "POSTED TO WAREHOUSE"
      );

      const summaryMap = new Map();

      const ensure = (id, vendorId, storeId, productId) => {
        let entry = summaryMap.get(id);
        if (!entry) {
          entry = {
            Product: id,
            Vendor: vendorId || "",
            Store: storeId || "",
            productId: productId || "",
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
        }
        return entry;
      };

      // purchases
      for (const purchase of purchases) {
        if (!Array.isArray(purchase.orders)) continue;
        for (const order of purchase.orders) {
          const item = order.item || {};
          const id = order.storeProductId || order.storeproductId;
          if (!id) continue;
          const entry = ensure(id, item.Vendor, purchase.WHID, item._id);
          entry.PurchCase += order.Qty || 0;
          entry.PurchPcs += order.pcs || 0;
        }
      }

      // invoices (sold + volume)
      for (const invoice of invoices) {
        if (!Array.isArray(invoice.orders)) continue;
        for (const order of invoice.orders) {
          const item = order.item || {};
          const id = order.storeProductId || order.storeproductId;
          if (!id) continue;
          const entry = ensure(id, item.Vendor, invoice.whId, item._id);
          entry.Sold += order.Qty || 0;
          entry.pcs += order.pcsReq || 0;
          entry.salesVolume += Number(order.total) || 0;
        }
      }

      // returns
      for (const invoice of returns) {
        if (!Array.isArray(invoice.orders)) continue;
        for (const order of invoice.orders) {
          const item = order.item || {};
          const id = order.storeProductId || order.storeproductId;
          if (!id) continue;
          const entry = ensure(id, item.Vendor, invoice.whId, item._id);
          entry.rStock += order.Qty || 0;
          entry.rPcs += order.pcsReq || 0;
        }
      }

      // inventory
      for (const [id, entry] of summaryMap) {
        const inv = inventoryMap.get(id);
        if (inv) {
          entry.Stock = inv.currentQty || 0;
          entry.PcsStock = inv.pcs || 0;
        }
      }

      return Array.from(summaryMap.values()).filter((item) => {
        if (filters.vendor && item.Vendor !== filters.vendor) return false;
        if (filters.store && item.Store !== filters.store) return false;
        if (filters.product && item.productId !== filters.product) return false;
        return true;
      });
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
      const inventory = fetchedData.ReportInventory || [];

      const productMap = new Map(productList.map((p) => [p._id, p.Name]));
      const vendorMap = new Map(vendorList.map((v) => [v._id, v.Name]));
      const storeMap = new Map(storeList.map((s) => [s._id, s.WHName]));
      const inventoryMap = new Map(inventory.map((i) => [i._id, i]));

      const getProductName = (id) => {
        const inv = inventoryMap.get(id);
        return inv ? productMap.get(inv.productId) || "" : "";
      };
      const getVendor = (id) => vendorMap.get(id) || "";
      const getStore = (id) => storeMap.get(id) || "";

      Swal.fire({
        title: "Stock & Sales Report",
        html: `
          <div class="text-xs text-muted-foreground mb-3">
            Period: <strong>${startDate}</strong> → <strong>${endDate}</strong>
          </div>

          <div style="margin-bottom: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px;">
            <div>
              <label style="font-size: 12px; color: #4a5568;">Vendor</label>
              <select id="vendor" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
                <option value="">All</option>
                ${vendorList
                  .map((v) => `<option value="${v._id}">${v.Name}</option>`)
                  .join("")}
              </select>
            </div>
            <div>
              <label style="font-size: 12px; color: #4a5568;">Store</label>
              <select id="store" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
                <option value="">All</option>
                ${storeList
                  .map((s) => `<option value="${s._id}">${s.WHName}</option>`)
                  .join("")}
              </select>
            </div>
            <div>
              <label style="font-size: 12px; color: #4a5568;">Product</label>
              <select id="product" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
                <option value="">All</option>
                ${productList
                  .map((p) => `<option value="${p._id}">${p.Name}</option>`)
                  .join("")}
              </select>
            </div>
          </div>

          <div id="reportTable" style="max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 6px;"></div>

          <div style="margin-top: 12px; text-align: right;">
            <button id="downloadExcelBtn" class="swal2-confirm swal2-styled" style="background-color:#2b6cb0;color:white;padding:6px 12px;border-radius:6px;font-size:12px;margin-right:5px;">
              ⬇ Download Excel
            </button>
            <button id="downloadPdfBtn" class="swal2-confirm swal2-styled" style="background-color:#2b6cb0;color:white;padding:6px 12px;border-radius:6px;font-size:12px;">
              ⬇ Download PDF
            </button>
          </div>
        `,
        width: "85%",
        showConfirmButton: false,
        didOpen: () => {
          const renderTable = () => {
            const filters = {
              vendor: document.getElementById("vendor")?.value,
              store: document.getElementById("store")?.value,
              product: document.getElementById("product")?.value,
            };

            const data = buildSummary(
              productList,
              storeList,
              vendorList,
              invoicesAll,
              purchasesAll,
              inventory,
              filters
            );

            const rows = data
              .map(
                (item) => `
                <tr style="border-bottom: 1px solid #e2e8f0;">
                  <td style="padding: 6px;">${getProductName(item.Product)}</td>
                  <td style="padding: 6px;">${getVendor(item.Vendor)}</td>
                  <td style="padding: 6px;">${getStore(item.Store)}</td>
                  <td style="padding: 6px; text-align: right;">${item.PurchCase}</td>
                  <td style="padding: 6px; text-align: right;">${item.PurchPcs}</td>
                  <td style="padding: 6px; text-align: right;">${item.Sold}</td>
                  <td style="padding: 6px; text-align: right;">${item.pcs}</td>
                  <td style="padding: 6px; text-align: right;">${item.rStock}</td>
                  <td style="padding: 6px; text-align: right;">${item.rPcs}</td>
                  <td style="padding: 6px; text-align: right;">C:${item.Stock}, P:${item.PcsStock}</td>
                  <td style="padding: 6px; text-align: right;">${(item.salesVolume || 0).toLocaleString()}</td>
                </tr>
              `
              )
              .join("");

            document.getElementById("reportTable").innerHTML = `
              <table style="width:100%; border-collapse: collapse; font-size: 12px;">
                <thead style="position: sticky; top: 0; background-color: #edf2f7;">
                  <tr>
                    <th style="padding: 6px; text-align: left;">Product</th>
                    <th style="padding: 6px; text-align: left;">Vendor</th>
                    <th style="padding: 6px; text-align: left;">Store</th>
                    <th style="padding: 6px; text-align: right;">Case [Buy]</th>
                    <th style="padding: 6px; text-align: right;">Pcs [Buy]</th>
                    <th style="padding: 6px; text-align: right;">Case [Sell]</th>
                    <th style="padding: 6px; text-align: right;">Pcs [Sell]</th>
                    <th style="padding: 6px; text-align: right;">Case Rtnd</th>
                    <th style="padding: 6px; text-align: right;">Pcs Rtnd</th>
                    <th style="padding: 6px; text-align: right;">Avail. Stock</th>
                    <th style="padding: 6px; text-align: right;">Sales Volume</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            `;
          };

          renderTable();

          ["vendor", "store", "product"].forEach((id) => {
            document.getElementById(id)?.addEventListener("change", renderTable);
          });

          document.getElementById("downloadExcelBtn").onclick = () => {
            const filters = {
              vendor: document.getElementById("vendor")?.value,
              store: document.getElementById("store")?.value,
              product: document.getElementById("product")?.value,
            };
            const data = buildSummary(
              productList,
              storeList,
              vendorList,
              invoicesAll,
              purchasesAll,
              inventory,
              filters
            );

            const excelData = data.map((item) => ({
              Product: getProductName(item.Product),
              Vendor: getVendor(item.Vendor),
              Store: getStore(item.Store),
              "Case Buy": item.PurchCase,
              "Pcs Buy": item.PurchPcs,
              "Case Sell": item.Sold,
              "Pcs Sell": item.pcs,
              "Rtnd Case": item.rStock,
              "Rtnd Pcs": item.rPcs,
              "Invty Case": item.Stock,
              "Invty Pcs": item.PcsStock,
              "Sales Volume": item.salesVolume || 0,
            }));

            downloadExcel(excelData, `Stock_Sales_${startDate}_to_${endDate}`);
          };

          document.getElementById("downloadPdfBtn").onclick = () => {
            const filters = {
              vendor: document.getElementById("vendor")?.value,
              store: document.getElementById("store")?.value,
              product: document.getElementById("product")?.value,
            };
            const data = buildSummary(
              productList,
              storeList,
              vendorList,
              invoicesAll,
              purchasesAll,
              inventory,
              filters
            );

            const pdfData = data.map((item) => [
              getProductName(item.Product),
              getVendor(item.Vendor),
              getStore(item.Store),
              item.PurchCase,
              item.PurchPcs,
              item.Sold,
              item.pcs,
              item.rStock,
              item.rPcs,
              `C:${item.Stock}`,
              `P:${item.PcsStock}`,
              (item.salesVolume || 0).toLocaleString(),
            ]);

            const doc = new jsPDF({ orientation: "landscape" });
            autoTable(doc, {
              head: [
                [
                  "Product",
                  "Vendor",
                  "Store",
                  "Case Buy",
                  "Pcs Buy",
                  "Case Sell",
                  "Pcs Sell",
                  "Case Rtnd",
                  "Pcs Rtnd",
                  "Avail.C",
                  "Avail.P",
                  "Sales Volume",
                ],
              ],
              body: pdfData,
              startY: 10,
              styles: { fontSize: 7 },
            });
            doc.save(`Stock_Sales_${startDate}_to_${endDate}.pdf`);
          };
        },
      });
    },
    [buildSummary]
  );

  return (
    <>
      <button
        onClick={() => setDateDialogOpen(true)}
        className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
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
            <Button variant="outline" onClick={() => setDateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
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