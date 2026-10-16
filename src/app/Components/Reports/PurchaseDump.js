"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { ShoppingBag, Loader2 } from "lucide-react";
import { plsWait, Encrypt, ErrorMessage } from "../../../../Functions/Mics";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PurchaseDumpModal = ({
  business,
  Products,
  EXPRESS_PRIVATE_URL,
  storesData,
  vendorsData,
  userData,
}) => {
  const [ProductList] = useState(Products || []);
  const [StoreList] = useState(storesData || []);
  const [Vendors] = useState(vendorsData || []);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    product: "",
    store: "",
    supplier: "",
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
      const saleDate = new Date(
        sale.startDate || sale.createdAt || sale.OrderDate || null
      );
      const start = activeFilters.startDate
        ? new Date(activeFilters.startDate)
        : null;
      const end = activeFilters.endDate
        ? new Date(activeFilters.endDate)
        : null;

      const matchesDate =
        (!start || saleDate >= start) && (!end || saleDate <= end);
      if (!matchesDate) return;

      (sale.orders || []).forEach((order) => {
        const itemId = order?.item?.productId || order?.item;

        const matchesProduct = activeFilters.product
          ? itemId?.toString().includes(activeFilters.product.toString())
          : true;

        if (matchesProduct) {
          filteredExport.push({
            "Ref-No": sale.billReferenceNo || "N/A",
            Status: sale.status || "N/A",
            Store: getStoreName(sale.WHID, stores),
            product: getProductName(order?.item?.productId, products),
            "Sys-Code":
              (order.item && (order.item.ACDcode || order.item.ADCcode)) ||
              "N/A",
            Batch: order.BatchNo || "N/A",
            Category: (order.item && order.item.category) || "N/A",
            Case: order.Qty || 0,
            Pcs: order.pcs || order.roll || 0,
            "Unit Price": order.buyingPrice || 0,
            "Line Total": order.total,
            "Exp Date": order.ExpDate || "N/A",
            Supplier: getVendorName(order?.item?.Vendor, vendors),
            "Rec Date": sale.recievedDate || "N/A",
            "Dis. Rec": sale.discount || 0,
            "PO Sub": sale.subTotal || 0,
            "PO Total": sale.grandTotal || 0,
            Month: sale.recievedDate
              ? new Date(sale.recievedDate).toLocaleString("default", {
                  month: "short",
                })
              : "N/A",
            Year: sale.recievedDate
              ? new Date(sale.recievedDate).getFullYear()
              : "N/A",
          });
        }
      });
    });

    return filteredExport;
  };

  const handleExport = (filteredData, activeFilters) => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "PurchaseDump");

    const filename = `Purchase Dump [${activeFilters.startDate || "start"} - ${
      activeFilters.endDate || "end"
    }].xlsx`;

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, filename);
  };

  const handlePreview = async () => {
    if (!filters.startDate || !filters.endDate) {
      ErrorMessage("Start date and end date are required");
      return;
    }
    if (!filters.store) {
      ErrorMessage("Please select a store");
      return;
    }

    setLoading(true);
    setOpen(false);
    plsWait("Generating export data...");

    try {
      const request = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/Purchasees/report?Startdate=${filters.startDate}&Enddate=${filters.endDate}&supplier=${filters.supplier}&store=${filters.store}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(business.tenantId)}`,
            access: Encrypt(userData.user._id),
            sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
          },
        }
      );

      const data = await request.json();

      if (!request.ok) {
        Swal.fire(
          "Error",
          data.message || "Failed to fetch purchase data.",
          "error"
        );
        return;
      }

      const purchases =
        data.filteredPurchaseOrders ||
        data.purchaseOrders ||
        data.invoice ||
        data.data ||
        [];

      Swal.close();

      const activeFilters = { ...filters };

      const previewData = filterSales(
        activeFilters,
        purchases,
        data.Products || data.products || ProductList,
        data.Stores || data.stores || StoreList,
        data.VendorList || data.Vendors || Vendors
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
              <tr>${Object.keys(previewData[0])
                .map((k) => `<th>${k}</th>`)
                .join("")}</tr>
            </thead>
            <tbody>
              ${previewData
                .map(
                  (row) =>
                    `<tr>${Object.values(row)
                      .map(
                        (v) =>
                          `<td>${
                            v === null || v === undefined ? "" : String(v)
                          }</td>`
                      )
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
          handleExport(previewData, activeFilters);
        }
      });
    } catch (err) {
      console.error(err);
      ErrorMessage("Failed to load dataset. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="flex w-full items-center gap-3 rounded-md p-3 text-left text-xs text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          <ShoppingBag className="h-4 w-4 shrink-0 text-zinc-600 dark:text-zinc-300" />
          <span>Generate Purchase Dump</span>
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <DialogHeader>
          <DialogTitle className="text-zinc-900 dark:text-zinc-50">
            Purchase Dump Filters
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label
              htmlFor="pd-startDate"
              className="text-zinc-700 dark:text-zinc-300"
            >
              Start Date
            </Label>
            <Input
              id="pd-startDate"
              type="date"
              required
              value={filters.startDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, startDate: e.target.value }))
              }
              className="dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="pd-endDate"
              className="text-zinc-700 dark:text-zinc-300"
            >
              End Date
            </Label>
            <Input
              id="pd-endDate"
              type="date"
              required
              value={filters.endDate}
              onChange={(e) =>
                setFilters((f) => ({ ...f, endDate: e.target.value }))
              }
              className="dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label
              htmlFor="pd-store"
              className="text-zinc-700 dark:text-zinc-300"
            >
              Store
            </Label>
            <select
              id="pd-store"
              required
              value={filters.store}
              onChange={(e) =>
                setFilters((f) => ({ ...f, store: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">-- Select Store --</option>
              {StoreList.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.WHName}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label
              htmlFor="pd-supplier"
              className="text-zinc-700 dark:text-zinc-300"
            >
              Supplier
            </Label>
            <select
              id="pd-supplier"
              value={filters.supplier}
              onChange={(e) =>
                setFilters((f) => ({ ...f, supplier: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">-- All Suppliers --</option>
              {Vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label
              htmlFor="pd-product"
              className="text-zinc-700 dark:text-zinc-300"
            >
              Product (optional)
            </Label>
            <select
              id="pd-product"
              value={filters.product}
              onChange={(e) =>
                setFilters((f) => ({ ...f, product: e.target.value }))
              }
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            >
              <option value="">-- All Products --</option>
              {[...ProductList]
                .sort((a, b) => a.Name.trim().localeCompare(b.Name.trim()))
                .map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.Name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={handlePreview}
            className="bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Preview Results"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseDumpModal;