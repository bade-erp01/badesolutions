"use client";

import React, { useState } from "react";
import { FolderArrowDownIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import moment from "moment";

import { plsWait, Encrypt } from "../../../../Functions/Mics";
import { EXPRESS_PRIVATE_URL } from "../../../../Functions/Functions";

const SalesDumpModal = ({ business, Employees, activeUser }) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
  });

  // ==================== Helpers ====================
  const PriceList = (customersPriceList) => {
    const normalizedKey = customersPriceList?.toLowerCase();
    const priceMap = {
      pricelist1: business.priceList1,
      pricelist2: business.priceList2,
      pricelist3: business.priceList3,
      pricelist4: business.priceList4,
      pricelist5: business.priceList5,
      pricelist6: business.priceList6,
      pricelist7: business.priceList7,
    };
    return priceMap[normalizedKey] || null;
  };

  const getProductName = (id, products = []) => {
    try {
      const prod = products.find((p) => p._id === id);
      return prod?.Name || "N/A";
    } catch {
      return "N/A";
    }
  };

  const getStoreName = (id, stores = []) => {
    try {
      const store = stores.find((s) => s._id === id);
      return store?.WHName || "N/A";
    } catch {
      return "N/A";
    }
  };

  const getVendorName = (id, vendors = []) => {
    try {
      const vendor = vendors.find((v) => v._id === id);
      return vendor?.Name || "N/A";
    } catch {
      return "N/A";
    }
  };

  const getEmployee = (id) => {
    try {
      const staff = Employees.find((s) => s._id === id);
      return `${staff?.firstName || ""} ${staff?.lastName || ""}`.trim() || "N/A";
    } catch {
      return "N/A";
    }
  };

  const filterSales = (activeFilters, salesArr = [], products = [], stores = [], vendors = []) => {
    if (!salesArr.length) return [];

    return salesArr.flatMap((sale) => {
      const saleDate = new Date(sale.startDate);
      const start = activeFilters.startDate ? new Date(activeFilters.startDate) : null;
      const end = activeFilters.endDate ? new Date(activeFilters.endDate) : null;

      if ((start && saleDate < start) || (end && saleDate > end)) return [];

      return (sale.orders || []).map((order) => ({
        "Ref-No": sale.billReferenceNo,
        Status: sale.billStatus,
        WB_No: sale.WayBillNo || "N/A",
        Store: getStoreName(sale.whId, stores),
        Invoicer: sale.RaiseBy,
        Customer: sale.customerName,
        Rep: getEmployee(sale.customer?.salesPerson),
        Manager: getEmployee(sale.customer?.Manager),
        Region: sale.customer?.Region,
        State: sale.customer?.state,
        merchandiser: sale.customer?.merchandiser,
        product: getProductName(order.item._id, products),
        "Sys-Code": order.item.ACDcode || order.item.ADCcode,
        Trace: order.returnId,
        Batch: order.BatchId,
        Category: order.item.category,
        Case: order.Qty,
        Pcs: order.pcsReq || 0,
        Vat: order.vat || 0,
        Unit: order.priceListPrice,
        Total: order.total,
        FOC: order.item.isAservice,
        "Manuf-Code": order.item.Manufacture_code,
        Vendor: getVendorName(order.item.Vendor, vendors),
        Promo: order.promotionData,
        "Promo Total": (order.promotionData || 0) * (order.Qty || 0),
        PriceList: PriceList(sale.priceList),
        "Dis Allowed": sale.discount,
        Ord_Date: sale.startDate,
        Inv_Date: moment(sale.DELIVERYDATE).format("l") || "N/A",
        Inv_Sub: sale.subTotal,
        Inv_Total: sale.grandTotal,
        Month: moment(sale.startDate).format("MMM"),
        Year: moment(sale.startDate).format("YYYY"),
      }));
    });
  };

  const handleExport = (filteredData) => {
    const workbook = XLSX.utils.book_new();

    // Sales Dump
    const salesData = filteredData.filter(
      (line) => line.Status === "Invoice" || line.Status === "Order"
    );
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(salesData), "SalesDump");

    // FOC Issued
    const focData = filteredData.filter((line) => line.FOC === true);
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(focData), "FOC-Issued");

    // Returns
    const returnsData = filteredData.filter((line) => line.Status === "Cancelled");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(returnsData), "Returns");

    const filename = `Sales-Dump [${filters.startDate} - ${filters.endDate}].xlsx`;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, filename);
  };

  const handleDownload = async () => {
    if (!filters.startDate || !filters.endDate) {
      alert("Please select both start and end dates.");
      return;
    }

    setIsLoading(true);
    // plsWait("Generating Sales Dump..."); // You can keep if needed

    try {
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/Report/Generate?Startdate=${filters.startDate}&Enddate=${filters.endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(business.tenantId)}`,
            access: `${Encrypt(activeUser._id)}`,
            sessionKey: `Bearer ${Encrypt(activeUser.SessionId)}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to fetch sales data");
        return;
      }

      const exportData = filterSales(
        filters,
        data.invoice,
        data.Products,
        data.Stores,
        data.Vendors
      );

      if (exportData.length === 0) {
        alert("No records found for the selected period.");
        return;
      }

      handleExport(exportData);
    } catch (error) {
      console.error(error);
      alert("Something went wrong while generating the report.");
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full text-left">
          <FolderArrowDownIcon className="h-5 w-5 text-white" />
          Export Sales Dump
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sales Dump Export</DialogTitle>
          <DialogDescription>
            Select a date range to export sales data with FOC and Returns.
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="pt-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={filters.startDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, startDate: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={filters.endDate}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, endDate: e.target.value }))
                  }
                />
              </div>
            </div>

            <Separator />

            <Button
              onClick={handleDownload}
              disabled={isLoading || !filters.startDate || !filters.endDate}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Excel...
                </>
              ) : (
                "Download Excel Report"
              )}
            </Button>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};

export default SalesDumpModal;