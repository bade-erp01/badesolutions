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
  LockClosedIcon,
  ClipboardDocumentListIcon,
  PencilIcon,
  PrinterIcon,
} from "@heroicons/react/24/solid";
import api from "@/lib/api";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../../../Functions/Mics";
import { totalInWords, Dencrypt } from "../../../../../../../Functions/Functions";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MerchantRequestPanel from "./MerchantRequestPanel";

export default function TransitPage({
  user,
  Business,
  DecryptedData,
  products,
}) {
  const [Singlebill, setSinglebill] = useState(DecryptedData);
  const [productList] = useState(products);
  // what is being saved right now: "add", a line id, or "Remarks" (spinners, no page reload)
  const [saving, setSaving] = useState(null);
  // bumped when a save fails, so the quantity boxes show the saved values again
  const [rev, setRev] = useState(0);
  Swal.close();
  const router = useRouter();
  const params = useParams();

  // the API answers line changes with the whole updated request (same shape as the page load)
  const apply = (data) => {
    if (data?.updatedRequest) setSinglebill(Dencrypt(data.updatedRequest));
  };

  const handleProductSelection = async (productId) => {
    const picked = productList.find((product) => product?.ACDcode === productId || product?.ADCcode === productId);
    if (!picked) return ErrorMessage("Product not found");
    setSaving("add");
    const res = await api.put(`/api/TransitOrderProductAdd/${Singlebill._id}?product=${picked._id}`);
    setSaving(null);
    if (!res.ok) return ErrorMessage(res.error);
    apply(res.data);
    SuccessToast(`${picked.productName || "Product"} added`);
  };

  const removeLineItem = async (id) => {
    setSaving(id);
    const res = await api.del(`/api/RemoveLineTransit/${Singlebill._id}?items=${encodeURIComponent(id)}`);
    setSaving(null);
    if (!res.ok) return ErrorMessage(res.error);
    apply(res.data);
  };

  const handleQtyChange = async (newQty, lineId, field) => {
    // nothing changed: no request
    if (field === "Remarks" ? newQty === (Singlebill.Remarks || "") : Singlebill.orders.find((l) => l._id === lineId)?.[field === "Qty" ? "Qty" : "pcs"] === newQty) return;
    setSaving(field === "Remarks" ? "Remarks" : lineId);
    const url = `/api/transitLine/${encodeURIComponent(Singlebill._id)}?${field}=${encodeURIComponent(newQty)}&lineId=${encodeURIComponent(lineId)}&update=${field}`;
    const res = await api.patch(url);
    setSaving(null);
    if (!res.ok) {
      ErrorMessage(res.error);
      // put the inputs back to what is saved
      setRev((n) => n + 1);
      return;
    }
    apply(res.data);
  };

  // drafts only (the API refuses anything else); the idempotency key makes a double click or a
  // retry replay the first answer instead of failing
  const deleteRequest = async () => {
    const ok = await Swal.fire({
      title: `Delete ${Singlebill.billReferenceNo || "this purchase request"}?`,
      text: "This draft and its products will be removed. This can't be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      confirmButtonText: "Delete",
    });
    if (!ok.isConfirmed) return;
    setSaving("delete");
    const res = await api.del(`/api/Transit/${Singlebill._id}`, {
      headers: { "idempotency-key": `DELETE-TRANSIT-${Singlebill._id}` },
    });
    if (!res.ok) {
      setSaving(null);
      return ErrorMessage(res.error);
    }
    SuccessToast(res.data?.message || "Purchase request deleted");
    router.push(`/${params.auth}/V4/transits/transits`);
  };

  const updateRFP = async (status) => {
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

      if (!result.isConfirmed) {
        return;
      }

      plsWait("Updating Request for Purchase");

      const url = `/api/Transit/status/${Singlebill._id}?user=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}`;

      const response = await api.patch(url, {
          status: status,
        });

      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        window.location.reload();
        router.refresh(); // Or use router.refresh() if you're in App Router
      } else {
        throw new Error(data.error || response.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  // generate pdf
  const loadImageAsDataURL = async (src, watermarkText = "B.A.D.E") => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        // Draw image
        ctx.drawImage(img, 0, 0);

        // 💧 Add watermark (bottom right)

        ctx.font = "italic bold 16px 'Courier New'";
        ctx.textAlign = "center"; // Or "left" depending on your layout
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(109, 107, 107, 0.59)"; // Semi-transparent white
        ctx.globalAlpha = 0.5; // Semi-transparent watermark
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 10); // Centered horizontally, 10px from bottom

        // Convert to PNG
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Image loading failed"));
      img.src = src;
    });
  };

  // 📄 Full PDF generator
  const generatePdf = async ({ business = Business, bill = Singlebill }) => {
    try {
      plsWait("Setting things up, Ensure your printer is connected ⌛...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let currentY = margin;

      // 🖼️ Logo
      if (business.companyLogo) {
        try {
          const logo = await loadImageAsDataURL(business.companyLogo);
          doc.addImage(logo, "JPEG", 10, 12, 30, 30);
        } catch (err) {
          // console.warn("Logo failed to load");
        }
      }

      // Header: Company name (KEEP BOLD)
      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text(business.companyName || "", pageWidth - 10, 12, {
        align: "right",
      });

      // Rest of document should be NORMAL font (no bold)
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

      // Title (KEEP BOLD)
      doc.setFont("helvetica", "bold").setFontSize(17).setTextColor(0, 0, 0);
      doc.text(`Goods in Transit`, 10, currentY);
      // Switch back to normal for everything else
      doc.setFont("helvetica", "normal");
      currentY += 10;

      // Left Column: Customer Info
      doc.setFontSize(13).setTextColor(0, 0, 0);
      doc.text(`${bill.billReferenceNo}`, 10, currentY);
      doc.setFontSize(8);
      doc.text(
        `Recieve date:${new Date(Singlebill.recievedDate).toLocaleDateString()}`,
        10,
        currentY + 6
      );
      doc.text(
        `Destination: ${Singlebill.WHID.WHName?.toUpperCase() || ""}`,
        10,
        currentY + 12
      );

      currentY += 2;

      // 🧾 Bill Metadata
      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          [
            "Transfer Date:",
            moment(bill.transferedDate).format("YYYY-MM-DD") || "",
          ],
          [
            "Receieve Date:",
            moment(bill.recievedDate).format("YYYY-MM-DD") || "",
          ],
          ["Status:", bill.status],
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1, fontStyle: "normal" },
        columnStyles: {
          0: { halign: "right" },
          1: { halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      // 📊 Invoice Table (all normal)
      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "#",
            "Product",
            "Code",
            "Price",
            "Case",
            "Pcs",
            "Total",
          ],
        ],
        body: bill.orders.map((ord, i) => [
          i + 1,
          `${ord.item?.productName}`,
          ord.item?.ACDcode || ord.item?.ADCcode || "N/A",
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

      // 💰 Summary Table
      autoTable(doc, {
        startY: currentY,
        tableWidth: 76,
        margin: { left: pageWidth - 90 },
        head: [["Subtotal",  "Total Due"]],
        body: [
          [
            bill.subTotal?.toLocaleString(undefined, {
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
        styles: { fontSize: 9, cellPadding: 1, fontStyle: "normal" },
        headStyles: { fontStyle: "normal" },
        columnStyles: {
          0: { halign: "right" },
          1: { halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      // ✍️ Signatures & Words (normal)
      doc.setFontSize(10).setFont("helvetica", "normal");
      doc.text(
        `${totalInWords(bill.grandTotal, business.currency?.currency)}`,
        margin,
        currentY
      );
      currentY += 10;
      doc.text(`Remarks:${bill.Remarks}`, margin, currentY);
      currentY += 10;
      doc.text(`Sign & Date: `, margin, currentY);
      currentY += 10;
     
      // 📎 Footer
      doc.setFontSize(9).setFont("helvetica", "normal");
      doc.text(
        `Generated on Business Automated Dynamic Enterprise`,
        margin,
        pageHeight - 20
      );

      // 📄 Page Numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: "right" }
        );
      }

      // 🖨️ Preview or Save
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
      // console.error("Error generating PDF:", error);
    }
  };

  const status = String(Singlebill.status || "").toLowerCase();
  const isDraft = status === "draft";
  const isPending = status === "pending";
  const isDeclined = status === "declined";
  const isConverted = status === "converted";
  const symbol = Business.currency?.currency?.Symbol || "";
  const money = (n) => `${symbol}${Number(n || 0).toFixed(2)}`;
  const canRemove = user.raiseInvoice && isDraft;
  const lineSum = Singlebill.orders.reduce((s, l) => s + (Number(l.total) || 0), 0);

  return (
    <div className="w-full sm:px-6 sm:py-10">
      <Card className="border-border shadow-lg bg-card text-card-foreground animate-in fade-in duration-300">
        <CardContent className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge
              variant={isDraft ? "secondary" : isPending ? "outline" : isDeclined ? "destructive" : "default"}
              className="text-sm px-3 py-1"
            >
              {Singlebill.status}
            </Badge>
            <span className="text-xs text-muted-foreground">Purchase request</span>
          </div>

          {/* Business + vendor */}
          <div className="flex flex-col lg:flex-row justify-between gap-6 lg:gap-10 border-y border-border py-6">
            <div className="flex items-start gap-4 sm:gap-6 min-w-0">
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
              <div className="space-y-1 text-sm min-w-0 break-words">
                <h3 className="text-base sm:text-lg font-bold tracking-tight">{Business.companyName}</h3>
                <p className="text-muted-foreground font-medium">{Singlebill.WHID?.WHName}</p>
                <p className="text-muted-foreground">{Business.Tel}</p>
                <p className="mt-2 font-semibold text-foreground break-all">
                  {Singlebill.status} / {Singlebill.billReferenceNo}
                </p>
              </div>
            </div>

            <div className="text-left lg:text-right space-y-1 text-sm min-w-0 break-words">
              <h3 className="text-lg sm:text-xl font-bold tracking-tight">{Singlebill.Vendor?.Name?.toUpperCase()}</h3>
              {Singlebill.Vendor?.vendor_tel && (
                <p>
                  <a href={`tel:${Singlebill.Vendor.vendor_tel}`} className="text-primary hover:underline">
                    {Singlebill.Vendor.vendor_tel}
                  </a>
                </p>
              )}
              {Singlebill.Vendor?.email && (
                <p>
                  <a href={`mailto:${Singlebill.Vendor.email}`} className="text-primary hover:underline">
                    {Singlebill.Vendor.email}
                  </a>
                </p>
              )}
              <p className="text-muted-foreground">
                Deliver to {Singlebill.WHID?.WHName?.toUpperCase()} ·{" "}
                {Singlebill.RequestDate ? new Date(Singlebill.RequestDate).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>

          <MerchantRequestPanel request={Singlebill} user={user} />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {user.raiseLpo && isDraft && (
                <Button variant="secondary" size="sm" onClick={() => updateRFP("Pending")} className="gap-2">
                  <LockClosedIcon className="h-4 w-4" />
                  Lock Request
                </Button>
              )}

              {(user.raiseLpo || user.isAdmin) && isDraft && Singlebill.merchantRequest?.origin !== "merchant" && (
                <Button variant="destructive" size="sm" onClick={deleteRequest} disabled={saving === "delete"} className="gap-2">
                  {saving === "delete" ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrashIcon className="h-4 w-4" />}
                  Delete
                </Button>
              )}

              {user.allowInternalTransfers && (isPending || isDeclined) && (
                <Button variant="secondary" size="sm" onClick={() => updateRFP("Draft")} className="gap-2">
                  <PencilIcon className="h-4 w-4" />
                  Set to Draft
                </Button>
              )}

              {user.allowInternalTransfers && isPending && Singlebill.merchantRequest?.state !== "awaiting_merchant" && (
                <Button size="sm" onClick={() => updateRFP("Converted")} className="gap-2">
                  <ClipboardDocumentListIcon className="h-4 w-4" />
                  Convert to Purchase
                </Button>
              )}
            </div>

            {!isDraft && (
              <Button variant="secondary" size="sm" onClick={() => generatePdf({})} className="gap-2 w-full sm:w-auto">
                <PrinterIcon className="h-4 w-4" />
                Print
              </Button>
            )}
          </div>

          {/* Products */}
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
                    <TableHead className="text-center">Price</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Total ({symbol})</TableHead>
                    {canRemove && <TableHead className="w-10" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Singlebill.orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canRemove ? 8 : 7} className="h-20 text-center text-sm text-muted-foreground">
                        {isDraft ? "No products yet. Add them below." : "No products on this request."}
                      </TableCell>
                    </TableRow>
                  )}
                  {Singlebill.orders.map((line) => {
                    const busy = saving === line._id;
                    return (
                    <TableRow key={line._id} className={`hover:bg-muted/40 transition-opacity ${busy ? "opacity-60" : ""}`} title={line.item?.productName}>
                      <TableCell className="text-center font-medium">
                        <Link
                          href={`/${params.auth}/V4/inventory/inventory/${line.item?._id}`}
                          className="text-primary hover:underline text-xs sm:text-sm"
                        >
                          {line.item?.productName}
                        </Link>
                      </TableCell>

                      <TableCell className="text-center">
                        <Image
                          src={line.item?.image || "/preview.png"}
                          width={36}
                          height={36}
                          alt="preview"
                          className="rounded-md mx-auto object-cover"
                        />
                      </TableCell>

                      <TableCell className="text-center text-xs">{line.item?.ADCcode || line.item?.ACDcode}</TableCell>

                      <TableCell className="text-center">
                        {isDraft ? (
                          <Input
                            key={`${line._id}:q:${line.Qty}:${rev}`}
                            type="number"
                            step="any"
                            min={0}
                            disabled={busy}
                            defaultValue={line.Qty || 0}
                            className="w-16 h-8 text-center text-base md:text-xs mx-auto"
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              handleQtyChange(isNaN(val) || val < 0 ? 0 : val, line._id, "Qty");
                            }}
                          />
                        ) : (
                          <span className="text-xs">{line.Qty || 0}</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center">
                        {Business.subscriptionplan === "Standard" && isDraft ? (
                          <Input
                            key={`${line._id}:p:${line.pcs}:${rev}`}
                            type="number"
                            step="any"
                            min={0}
                            disabled={busy}
                            defaultValue={line.pcs || 0}
                            className="w-16 h-8 text-center text-base md:text-xs mx-auto"
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              handleQtyChange(isNaN(val) || val < 0 ? 0 : val, line._id, "Pcs");
                            }}
                          />
                        ) : (
                          <span className="text-xs">{Business.subscriptionplan === "Standard" ? line.pcs || 0 : 0}</span>
                        )}
                      </TableCell>

                      <TableCell className="text-center text-xs">{line.buyingPrice}</TableCell>

                      <TableCell className="text-right font-semibold text-xs whitespace-nowrap">
                        {busy ? <Loader2 className="h-4 w-4 animate-spin ml-auto text-muted-foreground" /> : money(line.total)}
                      </TableCell>

                      {canRemove && (
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Remove this product"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            disabled={busy}
                            onClick={() => removeLineItem(line._id)}
                          >
                            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <TrashIcon className="h-4 w-4" />}
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

          {/* Add product (draft only) */}
          {isDraft && (
            <div className="space-y-2">
              <div className="block md:hidden">
                <label className="text-sm font-medium text-muted-foreground mb-1.5 block">
                  Select from {productList.length} Products
                </label>
                <Select value="" onValueChange={handleProductSelection} disabled={saving === "add"}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={saving === "add" ? "Adding…" : "Choose a product..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {productList.map((product) => (
                      <SelectItem key={product._id} value={product?.ADCcode || product?.ACDcode}>
                        {product?.productName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="hidden md:block">
                <label htmlFor="productDatalist" className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2">
                  Search from {productList.length} Products
                  {saving === "add" && (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Adding…
                    </span>
                  )}
                </label>
                <Input
                  id="productDatalist"
                  type="text"
                  list="productsList"
                  placeholder="Type to search products..."
                  className="max-w-md"
                  onBlur={(e) => {
                    if (e.target.value.trim()) handleProductSelection(e.target.value);
                    e.target.value = "";
                  }}
                />
                <datalist id="productsList">
                  {productList.map((product) => (
                    <option key={product._id} value={product?.ACDcode || product?.ADCcode}>
                      {product?.productName}
                    </option>
                  ))}
                </datalist>
              </div>
            </div>
          )}

          {/* Summary + words */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-muted/30 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Request Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <strong>{money(Singlebill.subTotal || lineSum)}</strong>
                </div>

                <div className="space-y-1.5">
                  <span className="text-muted-foreground">Remark</span>
                  {isDraft ? (
                    <Textarea
                      key={`remarks:${Singlebill.Remarks || ""}:${rev}`}
                      disabled={saving === "Remarks"}
                      defaultValue={Singlebill.Remarks || ""}
                      className="min-h-[60px] text-base md:text-sm"
                      onBlur={(e) => handleQtyChange(e.target.value.trim(), "", "Remarks")}
                    />
                  ) : (
                    <p className="text-xs text-foreground">{Singlebill.Remarks || "—"}</p>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between gap-2 text-base font-bold pt-1">
                  <span>Grand Total</span>
                  <span>{money(Singlebill.grandTotal)}</span>
                </div>
                {isConverted && <p className="text-xs text-muted-foreground">Converted to a purchase order.</p>}
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

          {/* Footer */}
          <div className="pt-6 border-t border-border text-center text-xs text-muted-foreground tracking-wide break-all">
            {Singlebill.billReferenceNo}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
