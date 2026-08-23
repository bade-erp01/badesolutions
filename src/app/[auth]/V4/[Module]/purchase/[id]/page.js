"use client";

import React, { useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  TrashIcon,
  KeyIcon,
  CheckBadgeIcon,
  PencilIcon,
  PaperClipIcon,
  ArrowTrendingUpIcon,
  PrinterIcon,
} from "@heroicons/react/24/solid";
import { Loader2 } from "lucide-react";

import {
  Encrypt,
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../../../Functions/Mics";
import {
  totalInWords,
  EXPRESS_PRIVATE_URL,
} from "../../../../../../../Functions/Functions";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DraftPurchasePage({
  user,
  Business,
  customer,
  bill,
  products,
  Whouse,
}) {
  const [Singlebill, setsingleBill] = useState(bill);
  const [cust] = useState(customer);
  const [productList] = useState(products);
  const [updatingLineId, setUpdatingLineId] = useState(null);

  const isUpdatingAnyLine = Boolean(updatingLineId);

  Swal.close();
  const router = useRouter();
  const params = useParams();

  // ──────────────────────────────────────────────
  // Upload helpers
  // ──────────────────────────────────────────────
  const processAndUploadFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const img = new window.Image();
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;

            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const resizedImage = canvas.toDataURL("image/jpeg", 0.7);

            const request = await fetch(
              `${EXPRESS_PRIVATE_URL}/api/attachement?po=${Encrypt(bill._id)}`,
              {
                method: "POST",
                body: JSON.stringify({ image: resizedImage }),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
                  access: `${Encrypt(user._id)}`,
                  sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
                },
              }
            );

            const response = await request.json();
            resolve({ success: !!response.message });
          };
          img.src = e.target.result;
        } catch {
          resolve({ success: false });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadLPOFile = async () => {
    try {
      const { value: files } = await Swal.fire({
        title: "Select Files",
        input: "file",
        inputAttributes: {
          accept: "image/*",
          "aria-label": "Upload your Files",
          multiple: "multiple",
        },
        preConfirm: (fileInput) => {
          const maxSize = 1024 * 1024;
          const files = fileInput instanceof FileList ? Array.from(fileInput) : [];

          for (const file of files) {
            if (file.size > maxSize) {
              Swal.showValidationMessage(`File "${file.name}" exceeds 1MB limit.`);
              return false;
            }
            if (file.type === "application/pdf") {
              Swal.showValidationMessage(`PDF files are not allowed: "${file.name}".`);
              return false;
            }
          }
          return files;
        },
      });

      if (files && files.length > 0) {
        plsWait("Uploading...");
        const uploadPromises = Array.from(files).map((file) =>
          processAndUploadFile(file)
        );
        const results = await Promise.all(uploadPromises);

        const successfulUploads = results.filter((r) => r.success).length;
        const failedUploads = results.filter((r) => !r.success).length;

        Swal.fire({
          title: "Upload Results",
          html: `Successfully uploaded ${successfulUploads} file(s).<br>Failed to upload ${failedUploads} file(s).`,
          icon: successfulUploads > 0 ? "success" : "warning",
        });
      }
    } catch (error) {
      ErrorMessage("Error uploading file:", error);
    }
  };

  // ──────────────────────────────────────────────
  // API handlers
  // ──────────────────────────────────────────────
  const handleProductSelection = async (productId) => {
    if (!productId || isUpdatingAnyLine) return;
    plsWait("Adding product to list");

    const cleanedProducts = productList.find(
      (product) =>
        product?.item?.ACDcode === productId || product?.item?.ADCcode === productId
    );

    try {
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/VendorProduct/lpo?product=${cleanedProducts.storeId}&po=${bill._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            access: `${Encrypt(user._id)}`,
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
          },
        }
      );

      const data = await res.json();
      if (data.message) {
        SuccessToast(data.message);
        if (data.updatedInvoice) {
          setsingleBill(data.updatedInvoice);
        } else {
          router.refresh();
          window.location.reload();
        }
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      ErrorMessage(error);
    }
  };

  const removeLineItem = async (id) => {
    if (isUpdatingAnyLine) return;

    try {
      setUpdatingLineId(id);
      plsWait("Removing product from cart");

      const url = `${EXPRESS_PRIVATE_URL}/api/RemoveLinePo?po=${bill._id}&items=${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
      });

      const data = await response.json();
      if (data.message) {
        SuccessToast(data.message);
        if (data.updatedInvoice) {
          setsingleBill(data.updatedInvoice);
        } else {
          setsingleBill((prev) => ({
            ...prev,
            orders: prev.orders.filter((o) => o._id !== id),
            grandTotal: prev.orders
              .filter((o) => o._id !== id)
              .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0),
          }));
        }
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    } finally {
      setUpdatingLineId(null);
    }
  };

  const DeleteDraftPo = async (id) => {
    if (isUpdatingAnyLine) return;

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

      plsWait("");
      const url = `${EXPRESS_PRIVATE_URL}/api/Vendor/Bill/${encodeURIComponent(id)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
      });

      const data = await response.json();
      if (data.message) {
        SuccessToast(data.message);
        setTimeout(() => {
          router.push(`/${params.auth}/V4/vendor/vendor`);
        }, 2000);
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  // ──────────────────────────────────────────────
  // LINE ITEM UPDATE – loader + live UI update
  // ──────────────────────────────────────────────
  const handleQtyChange = async (newQty, lineId, field) => {
    if (updatingLineId) return;

    try {
      setUpdatingLineId(lineId);

      const url = `${EXPRESS_PRIVATE_URL}/api/updateLinePo/?po=${encodeURIComponent(
        Singlebill._id
      )}&${field}=${newQty}&lineId=${encodeURIComponent(lineId)}&update=${field}`;

      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
      });

      const data = await response.json();

      if (data.message && data.updatedInvoice) {
        setsingleBill(data.updatedInvoice);
        SuccessToast(data.message);
      } else if (data.message) {
        SuccessToast(data.message);
        router.refresh();
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    } finally {
      setUpdatingLineId(null);
    }
  };

  const updateRFP = async (status) => {
    if (isUpdatingAnyLine) return;

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to proceed with updating this Request for Purchase?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      plsWait("Updating Request for Purchase");
      const url = `${EXPRESS_PRIVATE_URL}/api/VendorBillPost?po=${Singlebill._id}&user=${encodeURIComponent(
        `${user.firstName} ${user.lastName}`
      )}`;

      const response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
          "idempotency-key": `${status}-${Singlebill._id}`,
        },
      });

      const data = await response.json();
      if (data.message) {
        SuccessToast(data.message);
        if (data.updatedInvoice) {
          setsingleBill(data.updatedInvoice);
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  const LockRFP = async (payload) => {
    if (isUpdatingAnyLine) return;

    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to proceed with updating this Request for Purchase?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      plsWait("Updating Request for Purchase");
      const url = `${EXPRESS_PRIVATE_URL}/api/VendorBillPost?po=${Singlebill._id}&user=${encodeURIComponent(
        `${user.firstName} ${user.lastName}`
      )}`;

      const response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify(payload),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
      });

      const data = await response.json();
      if (data.message) {
        SuccessToast(data.message);
        if (data.updatedInvoice) {
          setsingleBill(data.updatedInvoice);
        } else {
          window.location.reload();
        }
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  // ──────────────────────────────────────────────
  // PDF generation
  // ──────────────────────────────────────────────
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
        ctx.fillStyle = "rgba(109, 107, 107, 0.59)";
        ctx.globalAlpha = 0.5;
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 10);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Image loading failed"));
      img.src = src;
    });
  };

  const generatePdf = async ({ business = Business, bill = Singlebill } = {}) => {
    if (isUpdatingAnyLine) return;

    try {
      plsWait("Setting things up, Ensure your printer is connected ⌛...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let currentY = margin;

      if (business.companyLogo) {
        try {
          const logo = await loadImageAsDataURL(business.companyLogo);
          doc.addImage(logo, "JPEG", 10, 12, 30, 30);
        } catch {
          console.warn("Logo failed to load");
        }
      }

      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text(business.companyName || "", pageWidth - 10, 12, { align: "right" });

      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(
        `${business.shopAddress || ""}, ${business.companyState || ""}, ${business.companyCity || ""}`,
        pageWidth - 10,
        20,
        { align: "right" }
      );
      doc.text(business.email || "", pageWidth - 10, 26, { align: "right" });
      doc.text(`Tel: ${business.Tel || "N/A"}`, pageWidth - 10, 32, { align: "right" });

      currentY = 50;

      doc.setFontSize(17).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text(`${bill.billReferenceNo}`, 10, currentY);
      currentY += 10;

      doc.setFont("helvetica", "bold").setTextColor(0, 0, 0).setFontSize(13);
      doc.text(`${bill.Vendor.Name?.toUpperCase() || ""}`, 10, currentY);
      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(`${bill.Vendor?.Address || "N/A"}`, 10, currentY + 6);
      doc.text(`${bill.Vendor?.vendor_tel || "N/A"}`, 10, currentY + 12);

      currentY += 2;

      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          ["Store:", Whouse.WHName || ""],
          ["Receive Date:", moment(bill.recievedDate).format("YYYY-MM-DD") || ""],
          ["Status:", bill.status],
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: {halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: currentY,
        head: [["#", "Product", "Code", "Batch", "Expiry Date", "Price", "Case", "Pcs", "Total"]],
        body: bill.orders.map((ord, i) => [
          i + 1,
          `${ord.item?.productName}`,
          ord.item?.ACDcode || ord.item?.ADCcode || "N/A",
          ord.BatchNo || "N/A",
          ord.ExpDate || "N/A",
          ord.VendorPrice?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || 0,
          ord.Qty || 0,
          ord.pcsReq || 0,
          ord.total?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }) || 0,
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: currentY,
        tableWidth: 76,
        margin: { left: pageWidth - 90 },
        head: [["Subtotal", "Logistics", "Total Due"]],
        body: [
          [
            bill.subTotal?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00",
            bill.shippingFee?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00",
            bill.grandTotal?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00",
          ],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: {halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(10);
      doc.text(
        `${totalInWords(bill.grandTotal, business.currency?.currency)}`,
        margin,
        currentY
      );
      currentY += 10;
      doc.text(`Remarks: ${bill.Remarks}`, margin, currentY);

      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, {
          align: "right",
        });
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
        doc.save(`${bill.customerName || "Purchase"}.pdf`);
        Swal.close();
      }
    } catch (error) {
      Swal.close();
      console.error("Error generating PDF:", error);
    }
  };

  const isDraft = Singlebill.status?.toLowerCase() === "draft";
  const isPending = Singlebill.status?.toLowerCase() === "pending";
  const isApproved = Singlebill.status?.toLowerCase() === "approved";

  return (
    <div className="w-full sm:px-6 sm:py-10">
      <Card className="border-border shadow-lg bg-card text-card-foreground animate-in fade-in duration-300">
        <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge
              variant={
                isDraft
                  ? "secondary"
                  : isPending
                  ? "outline"
                  : isApproved
                  ? "default"
                  : "secondary"
              }
              className="text-sm px-3 py-1"
            >
              {Singlebill.status}
            </Badge>
          </div>

          {/* Company + Vendor Info */}
          <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-10 border-y border-border py-6">
            <div className="flex items-start gap-4 sm:gap-6">
              {Business.companyLogo && (
                <Image
                  src={Business.companyLogo}
                  width={80}
                  height={80}
                  alt="logo"
                  priority
                  className="rounded-md object-contain shrink-0"
                />
              )}
              <div className="space-y-1 text-sm">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">
                  {Business.companyName}
                </h3>
                <p className="text-muted-foreground font-medium">{Whouse.WHName}</p>
                <p className="text-muted-foreground">{Business.Tel}</p>
                <p className="text-muted-foreground">{Business.Address}</p>
                <p className="text-muted-foreground">{Business.CompanyCity}</p>
                <p className="mt-2 font-semibold text-foreground">
                  {Singlebill.status} / {Singlebill.billReferenceNo}
                </p>
              </div>
            </div>

            <div className="text-left lg:text-right space-y-1 text-sm min-w-0">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                {cust?.Name?.toUpperCase()}
              </h3>
              <p>
                <a
                  href={`tel:${cust.vendor_tel}`}
                  className="text-primary hover:underline"
                >
                  {cust.vendor_tel || "N/A"}
                </a>
              </p>
              <p>
                <a
                  href={`mailto:${cust.email}`}
                  className="text-primary hover:underline"
                >
                  {cust.email || "N/A"}
                </a>
              </p>
              <p className="text-muted-foreground">
                🗓️ {new Date(Singlebill.recievedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action Buttons – all disabled while any line is updating */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {user.raiseLpo && isDraft && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isUpdatingAnyLine}
                    onClick={() =>
                      LockRFP({
                        status: "Pending",
                        Remarks: Singlebill.Remarks,
                        discount: Singlebill.discount,
                        shippingFee: Singlebill.shippingFee,
                      })
                    }
                    className="gap-2"
                  >
                    <KeyIcon className="h-4 w-4" />
                    Lock Request
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isUpdatingAnyLine}
                    onClick={uploadLPOFile}
                    className="gap-2"
                  >
                    <PaperClipIcon className="h-4 w-4" />
                    Upload Attachment
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={isUpdatingAnyLine}
                    onClick={() => DeleteDraftPo(Singlebill._id)}
                    className="gap-2"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              )}

              {user.allowInternalTransfers && isPending && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={isUpdatingAnyLine}
                    onClick={() => updateRFP("Draft")}
                    className="gap-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Set to Draft
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={isUpdatingAnyLine}
                    onClick={() => updateRFP("approved")}
                    className="gap-2"
                  >
                    <CheckBadgeIcon className="h-4 w-4" />
                    Approve
                  </Button>
                </>
              )}

              {user.allowInternalTransfers && isApproved && (
                <Button
                  size="sm"
                  disabled={isUpdatingAnyLine}
                  onClick={() => updateRFP("POSTED TO WAREHOUSE")}
                  className="gap-2 bg-teal-600 hover:bg-teal-500 text-white"
                >
                  <ArrowTrendingUpIcon className="h-4 w-4" />
                  Update Inventory
                </Button>
              )}
            </div>

            {!isDraft && (
              <Button
                variant="secondary"
                size="sm"
                disabled={isUpdatingAnyLine}
                onClick={() => generatePdf({})}
                className="gap-2 w-full sm:w-auto"
              >
                <PrinterIcon className="h-4 w-4" />
                Print
              </Button>
            )}
          </div>

          {/* Products Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-center whitespace-nowrap">Product</TableHead>
                    <TableHead className="text-center">Photo</TableHead>
                    <TableHead className="text-center">Code</TableHead>
                    <TableHead className="text-center">Case</TableHead>
                    <TableHead className="text-center">Pcs</TableHead>
                    <TableHead className="text-center">Batch</TableHead>
                    <TableHead className="text-center whitespace-nowrap">Expiry</TableHead>
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-right whitespace-nowrap">
                      Total ({Business.currency?.currency?.Symbol})
                    </TableHead>
                    {user.raiseInvoice && isDraft && (
                      <TableHead className="w-10" />
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Singlebill.orders.map((line) => {
                    const isUpdating = updatingLineId === line._id;

                    return (
                      <TableRow
                        key={line._id}
                        className={`hover:bg-muted/40 transition-opacity ${
                          isUpdating ? "opacity-60 pointer-events-none" : ""
                        }`}
                      >
                        <TableCell className="text-center font-medium">
                          <Link
                            href={`/${params.auth}/V4/inventory/inventory/${Encrypt(line.item._id)}`}
                            className="text-primary hover:underline text-xs sm:text-sm"
                          >
                            {line.item.productName}
                          </Link>
                        </TableCell>

                        <TableCell className="text-center">
                          <Image
                            src={line.item.image || line.item.QrCode || "/preview.png"}
                            width={36}
                            height={36}
                            alt="preview"
                            className="rounded-md mx-auto object-cover"
                          />
                        </TableCell>

                        <TableCell className="text-center text-xs">
                          {line?.item?.ADCcode || line?.item?.ACDcode}
                        </TableCell>

                        {/* Case Qty */}
                        <TableCell className="text-center">
                          {isDraft ? (
                            <div className="relative inline-flex items-center justify-center">
                              <Input
                                type="number"
                                defaultValue={line.Qty}
                                disabled={isUpdating || isUpdatingAnyLine}
                                className="w-16 h-8 text-center text-xs"
                                onBlur={(e) => {
                                  const val = parseFloat(e.target.value);
                                  handleQtyChange(
                                    isNaN(val) || val < 0 ? 0 : val,
                                    line._id,
                                    "Qty"
                                  );
                                }}
                              />
                              {isUpdating && (
                                <Loader2 className="absolute h-3.5 w-3.5 animate-spin text-muted-foreground" />
                              )}
                            </div>
                          ) : (
                            <span className="text-xs">{line.Qty}</span>
                          )}
                        </TableCell>

                        {/* Pcs */}
                        <TableCell className="text-center">
                          {Business.subscriptionplan === "Standard" ? (
                            isDraft ? (
                              <div className="relative inline-flex items-center justify-center">
                                <Input
                                  type="number"
                                  defaultValue={line.pcs || 0}
                                  disabled={isUpdating || isUpdatingAnyLine}
                                  className="w-16 h-8 text-center text-xs"
                                  onBlur={(e) => {
                                    const val = parseFloat(e.target.value);
                                    handleQtyChange(
                                      isNaN(val) || val < 0 ? 0 : val,
                                      line._id,
                                      "Pcs"
                                    );
                                  }}
                                />
                                {isUpdating && (
                                  <Loader2 className="absolute h-3.5 w-3.5 animate-spin text-muted-foreground" />
                                )}
                              </div>
                            ) : (
                              <span className="text-xs">{line.pcs || 0}</span>
                            )
                          ) : (
                            <span className="text-xs">0</span>
                          )}
                        </TableCell>

                        {/* Batch */}
                        <TableCell className="text-center">
                          {isDraft ? (
                            <Input
                              type="text"
                              defaultValue={line.BatchNo}
                              disabled={isUpdating || isUpdatingAnyLine}
                              className="w-24 h-8 text-center text-xs mx-auto"
                              onBlur={(e) =>
                                handleQtyChange(e.target.value.trim(), line._id, "BatchNo")
                              }
                            />
                          ) : (
                            <span className="text-xs">{line.BatchNo}</span>
                          )}
                        </TableCell>

                        {/* Expiry */}
                        <TableCell className="text-center">
                          {isDraft ? (
                            <Input
                              type="date"
                              defaultValue={line.ExpDate}
                              disabled={isUpdating || isUpdatingAnyLine}
                              className="w-32 h-8 text-center text-xs mx-auto"
                              onBlur={(e) =>
                                handleQtyChange(e.target.value, line._id, "ExpDate")
                              }
                            />
                          ) : (
                            <span className="text-xs">{line.ExpDate}</span>
                          )}
                        </TableCell>

                        <TableCell className="text-center text-xs">
                          {line.buyingPrice}
                        </TableCell>

                        <TableCell className="text-right font-semibold text-xs">
                          {isUpdating ? (
                            <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" />
                          ) : (
                            <>
                              {Business.currency?.currency?.Symbol}
                              {Number(line.total || 0).toFixed(2)}
                            </>
                          )}
                        </TableCell>

                        {user.raiseInvoice && isDraft && (
                          <TableCell className="text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isUpdating || isUpdatingAnyLine}
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => removeLineItem(line._id)}
                            >
                              {isUpdating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <TrashIcon className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Add Product (Draft only) */}
          {isDraft && (
            <div className="space-y-2">
              <div className="block md:hidden">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Select from {productList.length} Products
                </label>
                <Select
                  onValueChange={handleProductSelection}
                  // disabled={isUpdatingAnyLine}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productList.map((product) => (
                      <SelectItem
                        key={product.storeId}
                        value={product?.item?.ADCcode || product?.item?.ACDcode}
                      >
                        {product?.item?.Name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden md:block">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Search from {productList.length} Products
                </label>
                <Input
                  type="text"
                  list="productsList"
                  placeholder="Type to search products..."
                  className="max-w-md"
                  // disabled={isUpdatingAnyLine}
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      handleProductSelection(e.target.value);
                    }
                    e.target.value = "";
                  }}
                />
                <datalist id="productsList">
                  {productList.map((product) => (
                    <option
                      key={product.storeId}
                      value={product?.item?.ACDcode || product?.item?.ADCcode}
                    >
                      {product?.item?.Name}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
          )}

          {/* Summary + Words */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted/30 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <strong>
                    {Business.currency?.currency?.Symbol}
                    {(Singlebill.subTotal - (Singlebill.taxRate || 0)).toFixed(2)}
                  </strong>
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Discount Received</span>
                  {isDraft ? (
                    <Input
                      type="number"
                      defaultValue={Singlebill.discount || 0}
                      disabled={isUpdatingAnyLine}
                      className="w-24 h-8 text-center"
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        setsingleBill({
                          ...Singlebill,
                          discount: isNaN(val) || val < 0 ? 0 : val,
                        });
                      }}
                    />
                  ) : (
                    <strong>
                      {Business.currency?.currency?.Symbol}
                      {Number(Singlebill.discount || 0).toFixed(2)}
                    </strong>
                  )}
                </div>

                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Shipping & Offloading</span>
                  {isDraft ? (
                    <Input
                      type="number"
                      defaultValue={Singlebill.shippingFee || 0}
                      disabled={isUpdatingAnyLine}
                      className="w-24 h-8 text-center"
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        setsingleBill({
                          ...Singlebill,
                          shippingFee: isNaN(val) || val < 0 ? 0 : val,
                        });
                      }}
                    />
                  ) : (
                    <strong>
                      {Business.currency?.currency?.Symbol}
                      {Number(Singlebill.shippingFee || 0).toFixed(2)}
                    </strong>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-muted-foreground">Remark</span>
                  {isDraft ? (
                    <Textarea
                      defaultValue={Singlebill.Remarks || ""}
                      disabled={isUpdatingAnyLine}
                      className="min-h-[60px] text-sm"
                      onBlur={(e) =>
                        setsingleBill({ ...Singlebill, Remarks: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-xs text-foreground">{Singlebill.Remarks || "—"}</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-base font-bold pt-1">
                  <span>Grand Total</span>
                  <span>
                    {Business.currency?.currency?.Symbol}
                    {Number(Singlebill.grandTotal || 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Total In Words</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="italic text-sm sm:text-base text-primary">
                  {totalInWords(Singlebill.grandTotal, Business.currency?.currency)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attachments + Reference */}
          <div className="flex flex-col md:flex-row justify-between gap-8 pt-4">
            <div className="space-y-3 max-w-md">
              <h4 className="font-semibold text-sm">Attachments</h4>
              <p className="text-xs text-muted-foreground">
                Please ensure all documents are attached before finalizing the purchase request.
              </p>
              <div className="space-y-2">
                {Singlebill.Attachment?.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <PaperClipIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <Link
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline truncate"
                    >
                      Attachment {index + 1}
                    </Link>
                  </div>
                ))}
                {(!Singlebill.Attachment || Singlebill.Attachment.length === 0) && (
                  <p className="text-xs text-muted-foreground">No attachments yet.</p>
                )}
              </div>
            </div>

            <div className="text-left md:text-right">
              <h4 className="font-semibold text-sm">{Singlebill.billReferenceNo}</h4>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-border text-center text-xs text-muted-foreground tracking-wide">
            {Singlebill.billReferenceNo}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}