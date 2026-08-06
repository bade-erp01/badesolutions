"use client";

import { useState } from "react";
import { Dencrypt, totalInWords } from "../../../../Functions/Functions";
import { PrinterIcon, TruckIcon } from "@heroicons/react/24/solid";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { plsWait } from "../../../../Functions/Mics";
import Swal from "sweetalert2";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";

// Delivery Modal
import DeliveryModal from "@/app/Components/Delivery";

// Helper to load image as data URL
async function loadImageAsDataURL(url) {
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export default function InvoicePage({ invoice }) {
  const [data] = useState(Dencrypt(invoice.data));
  const [inv] = useState(data.Bill || {});
  const [biz] = useState(data.biz || {});
  const [user] = useState(data.StoreKeeper || {});

  // Controlled state for Delivery Modal
  const [isDeliveryOpen, setIsDeliveryOpen] = useState(false);

  // ========== Waybill PDF ==========
  const printWayBill = async (biz, customer, bill) => {
    try {
      plsWait("⌛");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      let currentY = margin;

      // Logo
      if (biz.companyLogo) {
        try {
          const logoDataURL = await loadImageAsDataURL(biz.companyLogo);
          const logoWidth = pageWidth * 0.2;
          const logoHeight = logoWidth * 0.75;
          doc.addImage(
            logoDataURL,
            "JPEG",
            margin,
            currentY,
            logoWidth,
            logoHeight,
          );
        } catch (imgErr) {
          console.warn("Logo failed to load:", imgErr.message);
        }
      }

      // Business Info
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(biz.companyName || "", pageWidth - margin, currentY + 5, {
        align: "right",
      });

      doc.setFontSize(10);
      const address = `${biz.shopAddress || ""} ${biz.companyCity || ""} ${biz.companyState || ""}`;
      const wrappedAddress = doc.splitTextToSize(
        address.toLowerCase(),
        pageWidth * 0.5,
      );
      doc.text(wrappedAddress, pageWidth - margin, currentY + 12, {
        align: "right",
      });
      doc.text(`${biz.email || ""}`, pageWidth - margin, currentY + 20, {
        align: "right",
      });
      doc.text(`(${biz.Tel || ""})`, pageWidth - margin, currentY + 26, {
        align: "right",
      });
      doc.text(
        `Invoiced By: ${bill.RaiseBy || ""}`,
        pageWidth - margin,
        currentY + 32,
        {
          align: "right",
        },
      );

      currentY += 50;

      // QR Code
      const qrDataURL = await QRCode.toDataURL("https://badesolutions.com.ng");
      doc.addImage(qrDataURL, "PNG", pageWidth - margin - 30, currentY, 30, 30);

      // Customer Info
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(`${bill.WayBillNo || ""}`, margin, currentY);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.text(
        `${bill.customerName?.toUpperCase() || ""}`,
        margin,
        currentY + 8,
      );

      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(`${customer?.billingAddress || "N/A"}`, 10, currentY + 16);
      doc.text(`${customer?.phone || "N/A"}`, 10, currentY + 22);
      doc.text(
        `Contact Person: ${customer?.contactPerson || bill.customerName || "N/A"}`,
        10,
        currentY + 28,
      );
      doc.text(
        `Download Date: ${moment().format("YYYY-MM-DD")}`,
        10,
        currentY + 34,
      );

      // Metadata Table
      autoTable(doc, {
        startY: currentY + 42,
        tableWidth: 80,
        margin: { left: pageWidth - pageWidth * 0.4 - margin },
        body: [
          [
            `${bill.billStatus} No:`,
            `${bill.billStatus?.slice(0, 3).toUpperCase()}/${bill.billReferenceNo}`,
          ],
        ],
        theme: "plain",
        styles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });

      // Orders Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [["#", "Product", "Code", "Case", "Pcs"]],
        body: bill.orders
          .filter((entry) => entry.Qty > 0 || entry.pcsReq > 0)
          .map((ord, i) => [
            i + 1,
            ord.item?.Name,
            ord.item?.ADCcode || ord.item?.ACDcode || "N/A",
            ord.Qty,
            ord.pcsReq || 0,
          ]),
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 3,
          halign: "left",
          valign: "middle",
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: function (data) {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          const pageWidth = pageSize.width || pageSize.getWidth();
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;

          doc.setFontSize(7);
          doc.text(`${biz.invoicePolicy || ""}`, margin, pageHeight - 10);
          doc.text(`Page ${pageNumber}`, pageWidth - 60, pageHeight - 10);
        },
      });

      // Signature Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        margin: { left: margin },
        body: [
          [{ content: "Approved By Sign & Date:", colSpan: 2 }],
          [{ content: "Supplied By Sign & Date:", colSpan: 2 }],
          [{ content: "Checked By:", colSpan: 2 }],
          [
            {
              content: `Driver Name, Sign & Date: _${bill.DriverName || ""},___________________________`,
              colSpan: 2,
            },
          ],
          [
            {
              content: `Vehicle Number: ______________${bill.vehicleNumber || ""}____________`,
              colSpan: 2,
            },
          ],
          [
            {
              content: `Customer Sign & Date: ____________________________________________`,
              colSpan: 2,
            },
          ],
          [{ content: `Comment: ${bill.DeliveryComment || ""}`, colSpan: 2 }],
        ],
        theme: "striped",
        styles: {
          fontSize: 7,
          cellPadding: 4,
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
        },
      });

      // Open / Print
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");

      if (win) {
        win.onload = () => {
          Swal.close();
          win.print();
        };
      } else {
        doc.save(`${bill.customerName || "waybill"}.pdf`);
        Swal.close();
      }
    } catch (error) {
      console.error("Error generating Waybill:", error);
      Swal.close();
    }
  };

  // ========== Full Invoice PDF ==========
  const generatePdf = async (biz, customer, bill) => {
    try {
      plsWait("⌛");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let currentY = margin;

      // Logo
      if (biz.companyLogo) {
        try {
          const logo = await loadImageAsDataURL(biz.companyLogo);
          doc.addImage(logo, "JPEG", 10, 12, 30, 30);
        } catch {
          console.warn("Logo failed to load");
        }
      }

      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text(biz.companyName || "", pageWidth - 10, 12, { align: "right" });

      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(
        `${biz.shopAddress || ""} ${biz.companyState || ""}, ${biz.companyCity || ""}`,
        pageWidth - 10,
        20,
        { align: "right" },
      );
      doc.text(biz.email || "", pageWidth - 10, 26, { align: "right" });
      doc.text(`Tel: ${biz.Tel || "N/A"}`, pageWidth - 10, 32, {
        align: "right",
      });

      currentY = 50;

      // Invoice Number
      doc.setFontSize(17).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text(
        `${bill.billStatus?.slice(0, 3).toUpperCase()}/${bill.billReferenceNo}`,
        10,
        currentY,
      );
      currentY += 10;

      // Customer Info
      doc.setFont("helvetica", "bold").setTextColor(0, 0, 0).setFontSize(13);
      doc.text(`${bill.customerName?.toUpperCase() || ""}`, 10, currentY);

      doc.setFontSize(7).setTextColor(0, 0, 0);
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

      // Metadata
      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          ["Waybill No:", bill.WayBillNo || ""],
          ["Order Date:", bill.startDate || ""],
          [
            "Invoice Date:",
            bill.DELIVERYDATE
              ? moment(bill.DELIVERYDATE).format("YYYY-MM-DD")
              : "",
          ],
        ],
        theme: "plain",
        styles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // Items Table
      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "#",
            "Product",
            "Code",
            "Price",
            "Promo",
            "Case",
            "Pcs",
            "VAT",
            "Total",
          ],
        ],
        body: bill.orders
          .filter((entry) => entry.Qty > 0 || entry.pcsReq > 0)
          .map((ord, i) => [
            i + 1,
            `${ord.item?.Name} - [${ord.item?.Pieces || 0} pcs]`,
            ord.item?.ACDcode || "N/A",
            Number(ord.priceListPrice || 0).toFixed(2),
            ord.promotionData || 0,
            ord.Qty,
            ord.pcsReq || 0,
            ord.vat > 0 ? ord.item?.VAT?.$numberDecimal || 0 : 0,
            Number(ord.total || 0).toFixed(2),
          ]),
        theme: "grid",
        styles: { fontSize: 7 },
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // Summary
      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          ["Tax Rate", `${Number(bill.taxRate || 0).toFixed(2)} (inc in sub.)`],
          ["Subtotal", Number(bill.subTotal || 0).toFixed(2)],
          ["Discount", Number(bill.discount || 0).toFixed(2)],
          ["Total Due", Number(bill.grandTotal || 0).toFixed(2)],
        ],
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });

      currentY = doc.lastAutoTable.finalY + 10;

      // Amount in words + signatures
      doc.setFontSize(7);
      doc.text(
        `${totalInWords(bill.grandTotal, biz.currency?.currency)}`,
        margin,
        currentY,
      );
      currentY += 10;
      doc.text("Authorized Signatures", margin, currentY);
      currentY += 10;
      doc.text(
        `${(biz.companyName || "").toLowerCase()} _______________________________`,
        margin,
        currentY,
      );
      currentY += 10;
      doc.text(
        "Customer Sign & Date _______________________________",
        margin,
        currentY,
      );
      currentY += 10;

      if (biz.invoicePolicy) {
        doc.text(biz.invoicePolicy, margin, currentY);
        currentY += 10;
      }

      // Footer
      doc.setFontSize(9);
      doc.text(`StoreKeepers Copy`, margin, pageHeight - 20);

      // Page numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pageHeight - 10,
          {
            align: "right",
          },
        );
      }

      // Open / Print
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
      console.error("Error generating PDF:", error);
      Swal.close();
    }
  };

  // ========== UI ==========
  return (
    <div className="flex flex-col min-h-screen m-6">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl text-blue-600">
                {inv.billStatus?.slice(0, 3).toUpperCase()}/
                {inv.billReferenceNo}
              </CardTitle>
              <CardDescription className="mt-1 space-y-1">
                <p>
                  Customer:{" "}
                  <span className="font-medium text-foreground">
                    {inv.customerName}
                  </span>
                </p>
                <p>
                  Order Date:{" "}
                  <span className="font-medium text-foreground">
                    {inv.startDate
                      ? new Date(inv.startDate).toLocaleDateString()
                      : "N/A"}
                  </span>
                </p>
                <p>
                  Invoicer:{" "}
                  <span className="font-medium text-foreground">
                    {inv.RaiseBy}
                  </span>
                </p>
              </CardDescription>
            </div>

            <Badge variant="secondary" className="text-base px-3 py-1">
              ₦
              {Number(inv.grandTotal || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Orders Accordion */}
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="orders">
              <AccordionTrigger className="font-semibold">
                View Orders [{inv.orders?.length || 0} items]
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {inv.orders?.map((order, i) => (
                    <div key={i} className="rounded-lg border bg-muted/40 p-4">
                      <h4 className="font-medium">{order.item?.Name}</h4>
                      <div className="mt-1 grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <span>Case: {order.Qty}</span>
                        <span>Pieces: {order.pcsReq || 0}</span>
                        <span className="font-medium text-foreground">
                          ₦{Number(order.total || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Separator />

          {/* Conditional Content */}
          {inv.billStatus === "Order" ? (
            // <DeliveryModal
            //   open={isDeliveryOpen}
            //   onOpenChange={setIsDeliveryOpen}
            //   id={inv._id}
            //   user={user}
            //   business={biz}
            // />
            ""
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Delivery Date</Label>
                  <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
                    {inv.DELIVERYDATE
                      ? new Date(inv.DELIVERYDATE).toLocaleString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "N/A"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Delivery Fee</Label>
                  <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
                    ₦{Number(inv.shippingFee || 0).toLocaleString()}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Driver Name</Label>
                  <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
                    {inv.DriverName || "N/A"}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label>Driver Contact</Label>
                  <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
                    {inv.DriverNumber || "N/A"}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Vehicle Plate Number</Label>
                <div className="rounded-md border bg-muted/50 px-3 py-2.5 text-sm uppercase">
                  {inv.vehicleNumber || "N/A"}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Delivery Remarks</Label>
                <div className="min-h-[80px] rounded-md border bg-muted/50 px-3 py-2.5 text-sm">
                  {inv.DeliveryComment || "—"}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="default"
              onClick={() => generatePdf(biz, inv.customer, inv)}
            >
              <PrinterIcon className="h-7 w-7" />
              Print {inv.billStatus}
            </Button>
            {/* Print Buttons (Invoice only) */}
            {inv.billStatus === "Invoice" && (
              <Button
                size="lg"
                variant="secondary"
                onClick={() => printWayBill(biz, inv.customer, inv)}
              >
                <PrinterIcon className="mr-2 h-5 w-5" />
                Print WB/{inv.WayBillNo}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
