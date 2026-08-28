"use client";

import { mutate } from "swr";
import { useState, useEffect, Suspense } from "react";
import QRCode from "qrcode";
import Swal from "sweetalert2";
import Image from "next/image";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import {
  totalInWords,
  Encrypt,
  EXPRESS_PRIVATE_URL,
} from "../../../../../Functions/Functions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../Functions/Mics";
import { useRouter } from "next/navigation";
import { Trash2, Printer, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export default function DraftInvoicePage({ Business, bill, products, user }) {
  const [inputValue, setInputValue] = useState("");
  const router = useRouter();

  const checkExpiryDate = (createdAt) => {
    try {
      const expiryTime = moment(createdAt).add(24, "hours");
      const now = moment();
      const duration = moment.duration(expiryTime.diff(now));
      if (duration.asMilliseconds() <= 0) {
        return "⛔ Expired";
      } else {
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        return `⏳Expire in: ${hours}h ${minutes}m ${seconds}s`;
      }
    } catch (err) {
      return "";
    }
  };

  useEffect(() => {
    Swal.close();
  }, []);

  const createdAt = moment(bill.createdAt);
  const now = moment();
  const isOlderThan24Hours = now.diff(createdAt, "hours") < 24;

  const loadImageAsDataURL = async (src, watermarkText = "B.A.D.E") => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        ctx.font = "italic bold 16px 'Courier New'";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.globalAlpha = 0.5;
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 10);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Image loading failed"));
      img.src = src;
    });
  };

  const generatePdf = async (business, customer, bill) => {
    try {
      Swal.fire({
        title: "Setting things up ⌛...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      if (business.companyLogo) {
        try {
          const logo = await loadImageAsDataURL(business.companyLogo);
          doc.addImage(logo, "JPEG", 10, 12, 30, 30);
        } catch (err) {
          console.warn("Logo failed to load");
        }
      }

      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text(business.companyName || "", pageWidth - 10, 12, {
        align: "right",
      });

      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(
        `${business.shopAddress || ""}, ${business.companyState || ""}, ${business.companyCity || ""}`,
        pageWidth - 10,
        20,
        { align: "right" },
      );
      doc.text(business.email || "", pageWidth - 10, 26, { align: "right" });
      doc.text(`Tel: ${business.Tel || "N/A"}`, pageWidth - 10, 32, {
        align: "right",
      });

      let currentY = 50;

      doc.setFontSize(15).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text("QUOTATION", 10, currentY);
      currentY += 10;

      doc.setFont("helvetica", "bold").setTextColor(0, 0, 0).setFontSize(13);
      doc.text(`${bill.customerName?.toUpperCase() || ""}`, 10, currentY);
      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(`${customer?.billingAddress || "N/A"}`, 10, currentY + 6);
      doc.text(`${customer?.phone || "N/A"}`, 10, currentY + 12);
      doc.text(
        `Contact Person: ${customer?.contactPerson || bill.customerName || "N/A"}`,
        10,
        currentY + 18,
      );
      doc.text(
        `Download Date: ${moment().format("YYYY-MM-DD")}`,
        10,
        currentY + 24,
      );

      try {
        const qrDataURL = await QRCode.toDataURL(
          "https://badesolutions.com.ng",
        );
        doc.addImage(qrDataURL, "PNG", pageWidth - 40, currentY, 35, 35);
      } catch (err) {
        console.warn("QR code failed to generate");
      }

      currentY += 30;

      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { hhalign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "#",
            "Product",
            "Code",
            "Price",
            "Promo",
            "CASE",
            "PCS",
            "VAT",
            "Total",
          ],
        ],
        body: bill.orders.map((ord, i) => [
          i + 1,
          ord.item?.Name || "N/A",
          ord.item?.ACDcode || ord.item?.ADCcode || "N/A",
          ord.priceListPrice || 0,
          ord.promotionData || 0,
          ord.Qty || 0,
          ord.pcsReq || 0,
          ord.item?.VAT?.$numberDecimal || ord.item?.VAT || 0,
          ord.total?.toFixed(2) || "0.00",
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: currentY,
        tableWidth: 76,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          ["Tax Rate", `${bill.taxRate?.toFixed(2) || 0} (inc in sub.)`],
          ["Subtotal", bill.subTotal?.toFixed(2) || "0.00"],
          ["Discount", bill.discount?.toFixed(2) || "0.00"],
          ["Total Due", bill.grandTotal?.toFixed(2) || "0.00"],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.text(
        `${totalInWords(bill.grandTotal, business.currency?.currency)}`,
        10,
        currentY,
      );
      currentY += 10;
      doc.text("Authorized signatories", 10, currentY);
      currentY += 10;
      doc.text(
        `${business.companyName.toLowerCase()} _______________________________`,
        10,
        currentY,
      );
      currentY += 10;
      doc.text(
        "Customer Sign & Date _______________________________",
        10,
        currentY,
      );
      currentY += 10;
      if (business.invoicePolicy) {
        doc.text(business.invoicePolicy, 10, currentY);
        currentY += 10;
      }

      doc.setFontSize(9);
      doc.text(
        `Kindly note that this ${bill.billStatus} is invalid after ${moment().format("l")}`,
        10,
        pageHeight - 20,
      );

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: "right" },
        );
      }

      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");

      if (win) {
        win.onload = () => {
          Swal.close();
          win.print();
        };
      } else {
        doc.save(`${bill.customerName || "invoice"}.pdf`);
        Swal.close();
      }
    } catch (error) {
      Swal.close();
      console.error("Error generating PDF:");
    }
  };

  const handleProductSelection = async (productId) => {
    try {
      plsWait("Adding product...");
      const cleanedProducts = await products.find((product) => {
        return (
          product.item?.ACDcode === productId ||
          product.item?.ADCcode === productId
        );
      });

      if (!cleanedProducts) {
        throw new Error("Product not found");
      }

      const url = `${EXPRESS_PRIVATE_URL}/api/Draft/add/order/${Encrypt(bill._id)}?productId=${productId}&priceList=${Singlebill.customer.priceList}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
        body: JSON.stringify({ product: cleanedProducts.storeId }),
      });
      const data = await res.json();
      if (data.message) {
        SuccessToast(data.message);
        setInputValue("");
        router.refresh();
      } else {
        throw new Error(data.error || "Unknown error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message);
      setInputValue("");
      router.refresh();
    }
  };

  const deleteDraftInvoice = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) return;

      plsWait("Deleting Requisition. Please wait.");
      const url = `${EXPRESS_PRIVATE_URL}/api/Draft/order/Delete/${Encrypt(bill._id)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          "idempotency-key": `delete-${bill._id}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
      });
      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);
        router.back();
      } else {
        ErrorMessage(data.error || "Failed to delete Requisition.");
        Swal.close();
        router.refresh();
      }
    } catch (error) {
      ErrorMessage(error.message || "Unexpected error occurred.");
      Swal.close();
      router.refresh();
    }
  };

  const handleQtyChange = async (
    lineId,
    value,
    toUpdate,
    billId,
    storeId,
    userId,
  ) => {
    try {
      plsWait("Updating cart...");
      const url = `${EXPRESS_PRIVATE_URL}/api/Invoice/Cart/Update?user=${Encrypt(userId)}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
        body: JSON.stringify({ lineId, value, toUpdate, billId, storeId }),
      });

      const data = await response.json();
      if (data.message) {
        SuccessToast(data.message);
        mutate(`${EXPRESS_PRIVATE_URL}/api/Invoice/${Encrypt(billId)}`);
        router.refresh();
      } else {
        throw new Error(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      ErrorMessage(err.message);
      router.refresh();
    }
  };

  let isProcessing = false;

  const processInvoice = async () => {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const { value: userInput } = await Swal.fire({
        title: "Enter your Operational Code",
        input: "password",
        inputLabel: "This action will Adjust Inventory of Billing location.",
        inputPlaceholder: "Provide OPS CODE",
        inputAutoFocus: true,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) return "You need to Enter your code!";
        },
      });

      if (!userInput) {
        isProcessing = false;
        return;
      }

      plsWait(
        "Please wait while i process your request. This should only take a bit. Do not reload this page...",
      );

      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/wareHouse/Bill?user=${Encrypt(user._id)}&ops=${Encrypt(userInput)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            access: `${Encrypt(user._id)}`,
            "idempotency-key": `Draft-${bill._id}`,
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
          },
          body: JSON.stringify({
            billId: bill._id,
            customer: Singlebill.customer._id,
            restriction: userInfo.business?.InvoiceRestriction,
          }),
        },
      );

      const data = await response.json();
      if (response.ok) {
        SuccessToast(data.message || "Operation completed successfully!");
        router.refresh();
      } else {
        throw new Error(data.error || "An error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message);
      router.refresh();
    } finally {
      isProcessing = false;
    }
  };

  const removeLineItem = async (lineId) => {
    try {
      plsWait("Removing item from order...");
      const url = `${EXPRESS_PRIVATE_URL}/api/Draft/delete/order?user=${Encrypt(user._id)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
        body: JSON.stringify({ lineId, billId: bill._id }),
      });

      const data = await response.json();
      if (data.message) {
        SuccessToast(data.message);
        router.refresh();
      } else {
        ErrorMessage(data.error || "Something went wrong.");
        router.refresh();
      }
    } catch (err) {
      ErrorMessage("Unexpected error occurred.");
      router.refresh();
    }
  };

  const userInfo = { user, business: Business };
  const Singlebill = bill;
  const isCancelled = Singlebill?.billStatus?.toLowerCase() === "cancelled";
  const currency = userInfo.business.currency?.currency.Symbol || "";
  const isDraft = Singlebill.billStatus?.toLowerCase() === "draft";
  const canEdit =
    user._id === Singlebill.invoicerId && user.raiseInvoice && isDraft;

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Draft"} />}>
      <div className="max-w-6xl mx-auto px-3 py-4 sm:px-6 sm:py-8 bg-white shadow-2xl text-xs m-2 sm:m-6 border border-border">
        
        {/* Status + Date */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8">
          <Badge
            variant={isCancelled ? "destructive" : "default"}
            className="w-fit text-xs sm:text-sm px-3 py-1"
          >
            {Singlebill.billStatus}
          </Badge>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Created on:{" "}
            <span className="font-medium text-foreground">
              {moment(Singlebill.createdAt).format(
                "dddd DD MMMM YYYY [at] hh:mm A",
              )}
            </span>
          </p>
        </div>

        {/* Company + Customer Info */}
        <div className="border-t border-b py-6 sm:py-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border bg-white">
              <Image
                src={userInfo.business.companyLogo}
                width={90}
                height={90}
                alt="logo"
                className="object-cover w-full h-full"
              />
            </div>
            <div className="min-w-0 space-y-1 text-sm">
              <h3 className="text-sm sm:text-base font-extrabold tracking-tight truncate">
                {Singlebill.customerName?.toUpperCase()}
              </h3>
              <p className="truncate text-xs sm:text-sm text-muted-foreground">
                <a
                  href={`mailto:${Singlebill.customer?.Email}`}
                  className="hover:underline"
                >
                  {Singlebill.customer?.Email || "N/A"}
                </a>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {Singlebill.customer?.phone}
              </p>
              <p className="truncate text-xs sm:text-sm text-muted-foreground">
                {Singlebill.customer?.billingAddress?.slice(0, 80)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {moment(Singlebill.startDate).format("YYYY-MM-DD")}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
            {((!userInfo.business.InvoiceRestriction && canEdit) ||
              (userInfo.business.InvoiceRestriction &&
                canEdit &&
                isOlderThan24Hours)) &&
              Singlebill.orders?.length > 0 && (
                <Button
                  onClick={processInvoice}
                  className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Checkout Cart
                </Button>
              )}

            {canEdit && (
              <Button
                variant="destructive"
                onClick={deleteDraftInvoice}
                className="w-full sm:w-auto"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}

            {isDraft && (
              <Button
                variant="secondary"
                onClick={() =>
                  generatePdf(Business, Singlebill.customer, bill)
                }
                className="w-full sm:w-auto"
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
            )}
          </div>
        </div>

        {/* Product Table */}
        <Card className="mb-6 sm:mb-8 overflow-hidden">
          <ScrollArea className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center text-[10px] sm:text-xs uppercase">
                    Product
                  </TableHead>
                  <TableHead className="text-center text-[10px] sm:text-xs uppercase">
                    Case
                  </TableHead>
                  <TableHead className="text-center text-[10px] sm:text-xs uppercase">
                    PCS
                  </TableHead>
                  <TableHead className="text-center text-[10px] sm:text-xs uppercase">
                    Price
                  </TableHead>
                  <TableHead className="text-center text-[10px] sm:text-xs uppercase hidden sm:table-cell">
                    Promo
                  </TableHead>
                  <TableHead className="text-right text-[10px] sm:text-xs uppercase">
                    Total
                  </TableHead>
                  {canEdit && <TableHead className="w-10" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Singlebill.orders?.map((line) => (
                  <TableRow key={line._id}>
                    <TableCell className="text-center text-xs max-w-[140px] sm:max-w-none">
                      {isDraft ? (
                        <span className="block truncate font-medium">
                          {line.item?.Name}
                        </span>
                      ) : (
                        <a
                          href={`/SalesPortal/Products/${Encrypt(line.item._id)}`}
                          className="text-primary hover:underline block truncate"
                        >
                          {line.item?.Name}
                        </a>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {canEdit ? (
                        <Input
                          type="number"
                          defaultValue={line.Qty || 0}
                          min={0}
                          className="h-8 w-14 sm:w-16 mx-auto text-center text-xs"
                          onBlur={(e) => {
                            let val = e.target.value;
                            if (val < 0) val = 0;
                            handleQtyChange(
                              line._id,
                              val,
                              "Qty",
                              Singlebill._id,
                              line.storeProductId,
                              userInfo.user._id,
                            );
                          }}
                        />
                      ) : (
                        <span className="text-xs">{line.Qty}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center">
                      {Business.allowSkuSplitting && canEdit ? (
                        <Input
                          type="number"
                          defaultValue={line.pcsReq || 0}
                          min={0}
                          className="h-8 w-14 sm:w-16 mx-auto text-center text-xs"
                          onBlur={(e) => {
                            let val = e.target.value;
                            if (val < 0) val = 0;
                            handleQtyChange(
                              line._id,
                              val,
                              "pcs",
                              Singlebill._id,
                              line.storeProductId,
                              userInfo.user._id,
                            );
                          }}
                        />
                      ) : (
                        <span className="text-xs">{line.pcsReq || 0}</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center text-xs whitespace-nowrap">
                      {currency}
                      {line.priceListPrice?.toFixed(2)}
                    </TableCell>

                    <TableCell className="text-center text-xs hidden sm:table-cell whitespace-nowrap">
                      {currency}
                      {line.promotionData || 0}
                    </TableCell>

                    <TableCell className="text-right font-bold text-xs whitespace-nowrap">
                      {currency}
                      {line.total?.toFixed(2)}
                    </TableCell>

                    {canEdit && (
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeLineItem(line._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </Card>

        {/* Add Product */}
        {canEdit && (
          <div className="mb-6 sm:mb-8 space-y-4">
            {/* Mobile */}
            <div className="block md:hidden space-y-2">
              <Label>Select {products.length} Products</Label>
              <Select
                onValueChange={(value) => {
                  if (value) handleProductSelection(value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem
                      key={product.item._id}
                      value={product.item.ACDcode || product.item.ADCcode}
                    >
                      {product.item.Name} [Case: {product.Case} Pcs:{" "}
                      {product.pcs}]
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop */}
            <div className="hidden md:block space-y-2">
              <Label>Search {products.length} Products</Label>
              <Input
                type="text"
                list="productsList"
                placeholder="Type to search products..."
                defaultValue={inputValue}
                className="max-w-xl"
                onBlur={(e) => {
                  const trimmedValue = e.target.value.trim();
                  setInputValue(trimmedValue);
                  if (trimmedValue !== "") {
                    handleProductSelection(trimmedValue);
                    setInputValue("");
                  }
                  e.target.value = "";
                }}
              />
              <datalist id="productsList">
                {products.map((product) => (
                  <option
                    key={product.item._id}
                    value={product.item.ACDcode || product.item.ADCcode}
                  >
                    {product.item.Name} [Case: {product.Case} Pcs:{" "}
                    {product.pcs}]
                  </option>
                ))}
              </datalist>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
          <Card className="bg-gradient-to-br from-white via-orange-50 to-white border-orange-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <strong>
                  {currency}
                  {(Singlebill.subTotal - Singlebill.taxRate).toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Rate:</span>
                <strong>
                  {currency}
                  {Singlebill.taxRate?.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Fee:</span>
                <strong>
                  {currency}
                  {Singlebill.shippingFee?.toFixed(2)}
                </strong>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm sm:text-base font-bold">
                <span>Grand Total:</span>
                <span>
                  {currency}
                  {Singlebill.grandTotal?.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg">
                Total In Words
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="italic text-sm sm:text-base text-orange-700">
                {totalInWords(
                  Singlebill.grandTotal,
                  userInfo.business.currency?.currency,
                )}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Terms + Issued by */}
        <div className="mt-8 sm:mt-12 flex flex-col md:flex-row justify-between items-start gap-6 sm:gap-10">
          <div className="max-w-md space-y-2">
            <h4 className="font-semibold text-sm sm:text-base">
              Terms & Conditions
            </h4>
            <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line">
              {userInfo.business.invoicePolicy}
            </p>
          </div>
          <div className="space-y-2 md:text-right">
            <h4 className="font-semibold text-sm sm:text-base">Issued by</h4>
            <p className="text-xs sm:text-sm font-medium">
              {Singlebill.RaiseBy}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t text-center">
          {userInfo.business.InvoiceRestriction ? (
            <p className="text-sm font-medium">
              {checkExpiryDate(Singlebill.createdAt)}
            </p>
          ) : (
            <h2
              className={`mt-2 sm:mt-3 font-bold text-sm sm:text-base tracking-wide ${
                isCancelled ? "text-destructive" : "text-foreground"
              }`}
            >
              {Singlebill.billStatus?.toUpperCase()} /{" "}
              {Singlebill.billReferenceNo} / {Singlebill.invoicelocation}
            </h2>
          )}
        </div>
      </div>
    </Suspense>
  );
}