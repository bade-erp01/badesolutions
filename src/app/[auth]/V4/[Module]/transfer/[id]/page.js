"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../../../Functions/Mics";
import { totalInWords } from "../../../../../../../Functions/Functions";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import {
  Trash2,
  KeyRound,
  BadgeCheck,
  Pencil,
  TrendingUp,
  Printer,
  AlertTriangle,
} from "lucide-react";

export default function TransferPage({
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
  const router = useRouter();

  const statusLower = (Singlebill?.status || "").toLowerCase();
  const currencySymbol = Business?.currency?.currency?.Symbol || "";

  const statusVariant = (status) => {
    const s = (status || "").toLowerCase();
    if (s === "draft") return "secondary";
    if (s === "pending") return "outline";
    if (s === "approved") return "default";
    if (s.includes("posted") || s === "completed") return "default";
    if (s === "declined" || s === "cancelled") return "destructive";
    return "secondary";
  };

  const handleProductSelection = async (productId) => {
    if (!productId) return;
    plsWait("Adding product to list");

    const cleanedProducts = productList.find(
      (product) =>
        product?.ACDcode === productId || product?.ADCcode === productId
    );

    if (!cleanedProducts?._id) {
      ErrorMessage("Product not found");
      return;
    }

    try {
      const res = await api.put(`/api/TransferLineAdd/${Singlebill._id}?product=${cleanedProducts._id}`);

      const data = res.data || {};

      if (data.message) {
        SuccessToast(data.message);
        router.refresh();
        window.location.reload();
      } else {
        throw new Error(data.error || res.error);
      }
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  const removeLineItem = async (id) => {
    try {
      plsWait("Removing product from cart");

      const url = `/api/RemoveLineTransfer/${bill._id}?items=${encodeURIComponent(id)}`;

      const response = await api.del(url);

      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        router.refresh();
        window.location.reload();
      } else {
        throw new Error(data.error || response.error || "Unknown error occurred");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  const DeleteDraftPo = async (id) => {
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

      plsWait("Deleting Transfer...");

      const url = `/api/DraftTranfer/${encodeURIComponent(
        id
      )}`;
      const response = await api.del(url);

      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        setTimeout(() => router.back(), 2000);
      } else {
        throw new Error(data.error || response.error || "Something went wrong");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  const handleQtyChange = async (newQty, lineId, field) => {
    try {
      plsWait("updating...");

      const url = `/api/Virtual/Product/TransferForm/${encodeURIComponent(
        Singlebill._id
      )}?${field}=${newQty}&lineId=${encodeURIComponent(
        lineId
      )}&update=${field}`;

      const response = await api.patch(url);

      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        location.reload();
      } else {
        throw new Error(data.error || response.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
      router.refresh();
      location.reload();
    }
  };

  const updateRFP = async (status) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to proceed with updating this transfer?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      plsWait("Updating transfer...");

      const url = `/api/Transfer/${Singlebill._id}?user=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}`;

      const response = await api.patch(url, { status });

      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        window.location.reload();
        router.refresh();
      } else {
        throw new Error(data.error || response.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

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

  const generatePdf = async ({
    business = Business,
    bill: pdfBill = Singlebill,
  } = {}) => {
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
        } catch (_) {}
      }

      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text(business.companyName || "", pageWidth - 10, 12, {
        align: "right",
      });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(
        `${business.shopAddress || ""}, ${business.companyState || ""}, ${
          business.companyCity || ""
        }`,
        pageWidth - 10,
        20,
        { align: "right" }
      );
      doc.text(business.email || "", pageWidth - 10, 26, { align: "right" });
      doc.text(`Tel: ${business.Tel || "N/A"}`, pageWidth - 10, 32, {
        align: "right",
      });

      currentY = 50;

      doc.setFont("helvetica", "bold").setFontSize(17).setTextColor(0, 0, 0);
      doc.text(`Product Transfer`, 10, currentY);
      doc.setFont("helvetica", "normal");
      currentY += 10;

      doc.setFontSize(13).setTextColor(0, 0, 0);
      doc.text(`${pdfBill.billReferenceNo}`, 10, currentY);
      doc.setFontSize(8);
      doc.text(
        `Source:${Singlebill.from.WHName?.toUpperCase()}`,
        10,
        currentY + 6
      );
      doc.text(
        `Destination: ${Singlebill.to.WHName?.toUpperCase() || ""}`,
        10,
        currentY + 12
      );

      currentY += 2;

      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          [
            "Transfer Date:",
            moment(pdfBill.transferedDate).format("YYYY-MM-DD") || "",
          ],
          [
            "Receieve Date:",
            moment(pdfBill.recievedDate).format("YYYY-MM-DD") || "",
          ],
          ["Status:", pdfBill.status],
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1, fontStyle: "normal" },
        columnStyles: {
          0: { halign: "right" },
          1: { halign: "right" },
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
            "Batch",
            "Trace",
            "Expiry Date",
            "Price",
            "Case",
            "Pcs",
            "Total",
          ],
        ],
        body: pdfBill.orders.map((ord, i) => [
          i + 1,
          `${ord.item?.Name}`,
          ord.item?.ACDcode || ord.item?.ADCcode || "N/A",
          ord.BatchNo || "N/A",
          ord.Status || "",
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
        styles: { fontSize: 9, fontStyle: "normal" },
        headStyles: { fontStyle: "normal" },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      autoTable(doc, {
        startY: currentY,
        tableWidth: 76,
        margin: { left: pageWidth - 90 },
        head: [["Subtotal", "Logistics", "Total Due"]],
        body: [
          [
            pdfBill.subTotal?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00",
            pdfBill.shippingFee?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00",
            pdfBill.grandTotal?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) || "0.00",
          ],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 1, fontStyle: "normal" },
        headStyles: { fontStyle: "normal" },
        columnStyles: {
          0: { halign: "right" },
          1: { halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(
        `${totalInWords(pdfBill.grandTotal, business.currency?.currency)}`,
        margin,
        currentY
      );
      currentY += 10;
      doc.text(`Remarks:${pdfBill.Remarks}`, margin, currentY);
      currentY += 10;
      doc.text(`Approved By:`, margin, currentY);
      currentY += 10;
      doc.text(`${Singlebill.from.WHName} Sign & Date: `, margin, currentY);
      currentY += 10;
      if (business.invoicePolicy) {
        doc.text(`${Singlebill.to.WHName} Sign & Date: `, margin, currentY);
        currentY += 10;
      }

      doc.setFontSize(9).setFont("helvetica", "normal");
      doc.text(
        `Generated on Business Automated Dynamic Enterprise`,
        margin,
        pageHeight - 20
      );

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
        doc.save(`${pdfBill.customerName || "Purchase"}.pdf`);
        Swal.close();
      }
    } catch (error) {
      Swal.close();
    }
  };

  return (
    <div className="w-full px-3 sm:px-6 py-6 sm:py-10">
      <Card className="border bg-card text-card-foreground shadow-sm">
        <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Status */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <Badge
              variant={statusVariant(Singlebill.status)}
              className="px-3 py-1 text-sm font-semibold capitalize"
            >
              {Singlebill.status}
            </Badge>
          </div>

          {/* Company + route info */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 border-y py-6">
            <div className="flex items-start gap-4 min-w-0">
              {Business?.companyLogo && (
                <Image
                  src={Business.companyLogo}
                  width={72}
                  height={72}
                  alt="logo"
                  priority
                  className="rounded-md object-contain shrink-0"
                />
              )}
              <div className="space-y-1 min-w-0">
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                  {Business.companyName}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  Source: {Singlebill.from?.WHName}
                </p>
                <p className="font-semibold text-sm sm:text-base">
                  {Singlebill.billReferenceNo}
                </p>
              </div>
            </div>

            <div className="text-left md:text-right space-y-1 shrink-0">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                Destination: {Singlebill.to?.WHName?.toUpperCase()}
              </h3>
              <p className="text-sm text-muted-foreground">
                {new Date(Singlebill.transferedDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {user.raiseLpo && statusLower === "draft" && (
                <Button
                  size="sm"
                  onClick={() => updateRFP("Pending")}
                  title="Process this draft to order"
                >
                  <KeyRound className="h-4 w-4 mr-2" />
                  Lock Request
                </Button>
              )}

              {user.allowInternalTransfers && statusLower === "pending" && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => updateRFP("Draft")}
                  title="Set this transfer back to draft"
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Set to Draft
                </Button>
              )}

              {user.allowInternalTransfers && statusLower === "pending" && (
                <Button
                  size="sm"
                  onClick={() => updateRFP("approved")}
                  title="Approve this transfer request"
                >
                  <BadgeCheck className="h-4 w-4 mr-2" />
                  1st Approval
                </Button>
              )}

              {user.allowInternalTransfers && statusLower === "approved" && (
                <>
                  <Button
                    size="sm"
                    className="bg-teal-600 hover:bg-teal-500 text-white"
                    onClick={() => updateRFP("POSTED TO WAREHOUSE")}
                    title="Update warehouse inventory items"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Update Inventory
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateRFP("Declined")}
                    title="Decline transfer request"
                  >
                    Decline Transfer
                  </Button>
                </>
              )}

              {user.raiseLpo && statusLower === "draft" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => DeleteDraftPo(Singlebill._id)}
                  title="Delete this draft"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>

            {statusLower !== "draft" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => generatePdf({})}
                title={`Download and Print ${Singlebill.status}`}
                className="w-full sm:w-auto"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            )}
          </div>

          {/* ========== DESKTOP TABLE ========== */}
          <div className="hidden md:block overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Photo</TableHead>
                  <TableHead className="text-center">Trace</TableHead>
                  <TableHead className="text-center">Code</TableHead>
                  <TableHead className="text-center">Case</TableHead>
                  <TableHead className="text-center">Pcs</TableHead>
                  <TableHead className="text-center">Batch</TableHead>
                  <TableHead className="text-center">Expiry</TableHead>
                  <TableHead className="text-center">Price</TableHead>
                  <TableHead className="text-right">
                    Total ({currencySymbol})
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {Singlebill.orders?.map((line) => (
                  <TableRow key={line._id}>
                    <TableCell className="font-medium text-primary max-w-[180px]">
                      <Link
                        href={`/${Business.companyName}/${user._id}/product/product/${line.item._id}`}
                        className="hover:underline line-clamp-2"
                      >
                        {line.item?.Name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-center">
                      <Image
                        src={
                          line.item?.image ||
                          line.item?.QrCode ||
                          "/preview.png"
                        }
                        width={38}
                        height={38}
                        alt="preview"
                        className="rounded-md mx-auto object-cover"
                      />
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {line.Status}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {line?.item?.ADCcode || line?.item?.ACDcode}
                    </TableCell>
                    <TableCell className="text-center">
                      {statusLower === "draft" ? (
                        <Input
                          type="number"
                          step="any"
                          defaultValue={line.Qty || 0}
                          className="w-16 h-8 text-center mx-auto"
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (e.target.value !== "") {
                              handleQtyChange(
                                isNaN(val) || val < 0 ? 0 : val,
                                line._id,
                                "Qty"
                              );
                            }
                          }}
                        />
                      ) : (
                        line.Qty
                      )}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {Business.subscriptionplan === "Standard"
                        ? line.pcs || 0
                        : 0}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {line.BatchNo || "N/A"}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {line.ExpDate || "N/A"}
                    </TableCell>
                    <TableCell className="text-center text-xs">
                      {line.buyingPrice}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-xs">
                      {currencySymbol}
                      {Number(line.total || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {user.raiseInvoice && statusLower === "draft" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          title="Remove product from cart"
                          onClick={() => removeLineItem(line._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* ========== MOBILE CARDS ========== */}
          <div className="md:hidden space-y-3">
            {Singlebill.orders?.map((line) => (
              <Card key={line._id} className="overflow-hidden">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <Image
                      src={
                        line.item?.image || line.item?.QrCode || "/preview.png"
                      }
                      width={48}
                      height={48}
                      alt="preview"
                      className="rounded-md object-cover shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/${Business.companyName}/${user._id}/product/product/${line.item._id}`}
                        className="font-medium text-primary hover:underline text-sm line-clamp-2"
                      >
                        {line.item?.Name}
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {line?.item?.ADCcode || line?.item?.ACDcode || "—"}
                      </p>
                    </div>
                    {user.raiseInvoice && statusLower === "draft" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive shrink-0"
                        onClick={() => removeLineItem(line._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Trace</p>
                      <p className="font-medium">{line.Status || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Batch</p>
                      <p className="font-medium">{line.BatchNo || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expiry</p>
                      <p className="font-medium">{line.ExpDate || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Price</p>
                      <p className="font-medium">{line.buyingPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Case</p>
                      {statusLower === "draft" ? (
                        <Input
                          type="number"
                          step="any"
                          defaultValue={line.Qty || 0}
                          className="h-8 w-20 mt-0.5"
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            if (e.target.value !== "") {
                              handleQtyChange(
                                isNaN(val) || val < 0 ? 0 : val,
                                line._id,
                                "Qty"
                              );
                            }
                          }}
                        />
                      ) : (
                        <p className="font-medium">{line.Qty}</p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pcs</p>
                      <p className="font-medium">
                        {Business.subscriptionplan === "Standard"
                          ? line.pcs || 0
                          : 0}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t">
                    <span className="text-xs text-muted-foreground">Line total</span>
                    <span className="font-bold">
                      {currencySymbol}
                      {Number(line.total || 0).toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add product (draft only) */}
          {statusLower === "draft" && (
            <div className="space-y-2">
              <Label>
                {productList?.length
                  ? `Select from ${productList.length} products`
                  : "No products available"}
              </Label>

              {/* Mobile: Select */}
              <div className="md:hidden">
                <Select onValueChange={(val) => handleProductSelection(val)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {productList?.map((product) => (
                      <SelectItem
                        key={product._id}
                        value={product?.ADCcode || product?.ACDcode || product._id}
                      >
                        {product?.productName || product?.Name} — [C:
                        {product.currentQty}, P:{product.pcs}]
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desktop: datalist search */}
              <div className="hidden md:block">
                <Input
                  type="text"
                  list="productsList"
                  placeholder="Type to search products..."
                  className="max-w-md"
                  onBlur={(e) => {
                    if (e.target.value.trim() !== "") {
                      handleProductSelection(e.target.value);
                    }
                    e.target.value = "";
                  }}
                />
                <datalist id="productsList">
                  {productList?.map((product) => (
                    <option
                      key={product._id}
                      value={product?.ACDcode || product?.ADCcode}
                    >
                      {product?.productName || product?.Name} — [C:
                      {product.currentQty}, P:{product.pcs}]
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">
                  Transfer Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Subtotal</span>
                  <strong>
                    {currencySymbol}
                    {Number(Singlebill.subTotal || 0).toFixed(2)}
                  </strong>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-muted-foreground shrink-0">
                    Shipping & Offloading
                  </span>
                  {Singlebill.status === "Draft" ? (
                    <Input
                      type="number"
                      defaultValue={Singlebill.shippingFee || 0}
                      className="w-24 h-8 text-right"
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        handleQtyChange(
                          isNaN(val) || val < 0 ? 0 : val,
                          "",
                          "ShipingFee"
                        );
                      }}
                    />
                  ) : (
                    <strong>
                      {currencySymbol}
                      {Number(Singlebill.shippingFee || 0).toFixed(2)}
                    </strong>
                  )}
                </div>

                <div className="space-y-1.5">
                  <span className="text-muted-foreground">Remark</span>
                  {Singlebill.status === "Draft" ? (
                    <Textarea
                      className="min-h-[72px]"
                      defaultValue={Singlebill.Remarks || ""}
                      onBlur={(e) => {
                        handleQtyChange(e.target.value.trim(), "", "Remarks");
                      }}
                    />
                  ) : (
                    <p className="text-sm">{Singlebill.Remarks || "—"}</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-base font-bold">
                  <span>Grand Total</span>
                  <span>
                    {currencySymbol}
                    {Number(Singlebill.grandTotal || 0).toFixed(2)}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base sm:text-lg">
                  Total In Words
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="italic text-sm sm:text-base text-primary">
                  {totalInWords(
                    Singlebill.grandTotal,
                    Business.currency?.currency
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Attention */}
          <div className="flex flex-col sm:flex-row justify-between gap-6 pt-2">
            <div className="max-w-md space-y-2">
              <h4 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
                <AlertTriangle className="h-4 w-4 text-destructive" />
                Attention
              </h4>
              <p className="text-sm text-destructive">
                Please ensure to verify all entries. Once this transfer is
                processed, it is irreversible.
              </p>
            </div>
            <div className="sm:text-right">
              <p className="font-semibold text-sm text-muted-foreground">
                {Singlebill.billReferenceNo}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t text-center text-xs text-muted-foreground tracking-wide">
            {Singlebill.billReferenceNo}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}