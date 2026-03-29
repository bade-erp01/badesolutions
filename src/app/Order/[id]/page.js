"use client";
import { useState } from "react";
import { Dencrypt,totalInWords } from "../../../../Functions/Functions";
import { showDeliveryModal } from "@/app/Components/Delivery";
import { PrinterIcon, TruckIcon } from "@heroicons/react/24/solid";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { plsWait } from "../../../../Functions/Mics";
import Swal from "sweetalert2";

export default function InvoicePage({ invoice }) {
  const [data] = useState(Dencrypt(invoice.data));
  const [inv] = useState(data.Bill || {});
  const [biz] = useState(data.biz || {});
  const [user] = useState(data.StoreKeeper || {});

  // download functions
  const printWayBill = async (biz, customer, bill, user) => {
    try {
      plsWait("⌛");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      let currentY = margin;

      //  Logo
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

      //  Business Info
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(biz.companyName, pageWidth - margin, currentY + 5, {
        align: "right",
      });
      doc.setFontSize(10);
      const address = `${biz.shopAddress} ${biz.companyCity} ${biz.companyState}`;
      const wrappedAddress = doc.splitTextToSize(
        address.toLowerCase(),
        pageWidth * 0.5,
      );
      doc.text(wrappedAddress, pageWidth - margin, currentY + 12, {
        align: "right",
      });
      doc.text(`${biz.email}`, pageWidth - margin, currentY + 20, {
        align: "right",
      });
      doc.text(`(${biz.Tel})`, pageWidth - margin, currentY + 26, {
        align: "right",
      });
      doc.text(
        `Invoiced By: ${bill.RaiseBy}`,
        pageWidth - margin,
        currentY + 32,
        { align: "right" },
      );

      currentY += 50;

      //  QR Code
      const qrDataURL = await QRCode.toDataURL("https://badesolutions.com.ng");
      doc.addImage(qrDataURL, "PNG", pageWidth - margin - 30, currentY, 30, 30);

      // Customer Info
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(`${bill.WayBillNo}`, margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.text(
        `${bill.customerName?.toUpperCase() || ""}`,
        margin,
        currentY + 8,
      );
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

      // 📋 Metadata Table
      autoTable(doc, {
        startY: currentY + 30,
        tableWidth: 80,
        margin: { left: pageWidth - pageWidth * 0.4 - margin },
        body: [
          [
            `${bill.billStatus} No:`,
            `${bill.billStatus?.slice(0, 3).toUpperCase()}/${
              bill.billReferenceNo
            }`,
          ],
        ],
        theme: "plain",
        styles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });

      //  Invoice Table with Pagination
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
          halign: "start",
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
          doc.text(`${biz.invoicePolicy}`, margin, pageHeight - 10);
          doc.text(`Page ${pageNumber}`, pageWidth - 60, pageHeight - 10);
        },
      });

      // Summary Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        margin: { left: margin },
        body: [
          [{ content: "Approved By Sign & Date:", colSpan: 2 }],
          [{ content: "Supplied By Sign & Date:", colSpan: 2 }],
          [{ content: "Checked By:", colSpan: 2 }],
          [
            {
              content: `Driver Name, Sign & Date: _${bill.DriverName},___________________________`,
              colSpan: 2,
            },
          ],
          [
            {
              content: `Vehicle Number: ______________${bill.vehicleNumber}____________`,
              colSpan: 2,
            },
          ],
          [
            {
              content: `Customer Sign & Date: ____________________________________________`,
              colSpan: 2,
            },
          ],
          [{ content: `Comment: ${bill.DeliveryComment}`, colSpan: 2 }],
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

      // Preview or Save
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
      console.error("Error generating Waybill:", error);
    } finally {
      Swal.close();
    }
  };

  //  Full PDF generator
  const generatePdf = async (biz, customer, bill) => {
    try {
      plsWait("⌛");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let currentY = margin;

      //  Logo
      if (biz.companyLogo) {
        try {
          const logo = await loadImageAsDataURL(biz.companyLogo);
          doc.addImage(logo, "JPEG", 10, 12, 30, 30);
        } catch (err) {
          console.warn("Logo failed to load");
        }
      }

      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text(biz.companyName || "", pageWidth - 10, 12, {
        align: "right",
      });

      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(
        `${biz.shopAddress || ""} ${biz.companyState || ""}, ${
          biz.companyCity || ""
        }`,
        pageWidth - 10,
        20,
        { align: "right" },
      );
      doc.text(biz.email || "", pageWidth - 10, 26, { align: "right" });
      doc.text(`Tel: ${biz.Tel || "N/A"}`, pageWidth - 10, 32, {
        align: "right",
      });

      currentY = 50;

      // Customer Info + 🔳 QR Code in same row
      doc.setFontSize(17).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text(
        `${bill.billStatus?.slice(0, 3).toUpperCase()}/${bill.billReferenceNo}`,
        10,
        currentY,
      );
      currentY += 10;

      // Left Column: Customer Info
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

      currentY += 2;

      //  Bill Metadata
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
            moment(bill.DELIVERYDATE).format("YYYY-MM-DD") || "",
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

      //  Invoice Table
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
            `${ord.item?.Name} - [${ord.item?.Pieces} pcs]`,
            ord.item?.ACDcode || "N/A",
            ord.priceListPrice?.toFixed(2) || 0,
            ord.promotionData || 0,
            ord.Qty,
            ord.pcsReq || 0,
            ord.vat > 0 ? ord.item?.VAT?.$numberDecimal : 0,
            ord.total?.toFixed(2) || 0,
          ]),
        theme: "grid",
        styles: { fontSize: 7 },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      //  Summary Table
      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          ["Tax Rate", `${bill.taxRate.toFixed(2) || 0} (inc in sub.)`],
          ["Subtotal", bill.subTotal.toFixed(2) || 0],
          ["Discount", bill.discount.toFixed(2) || 0],
          ["Total Due", bill.grandTotal.toFixed(2) || 0],
        ],
        theme: "grid",
        styles: { fontSize: 7, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      //  Signatures
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
        `${biz.companyName.toLowerCase()} _______________________________`,
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

      //  Footer
      doc.setFontSize(9);
      doc.text(`StoreKeepers Copy`, margin, pageHeight - 20);

      //  Page Numbers
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

      //  Preview or Save
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
      console.error("Error generating PDF:", error);
    }
  };

 return (
  <div className="flex flex-col min-h-screen overflow-hidden m-6 bg-gray-100 p-6 rounded-lg shadow-sm">
    {/* Header */}
    <nav className="mb-6 border-b border-gray-300 pb-4">
      <h4 className="text-blue-600 text-xl font-bold">
        {inv.billStatus.slice(0, 3).toUpperCase()}/{inv.billReferenceNo}
      </h4>
      <p className="text-sm text-gray-600 mt-1">
        Customer: <span className="font-semibold">{inv.customerName}</span>
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Order Date:{" "}
        <span className="font-semibold">
          {new Date(inv.startDate).toLocaleDateString()}
        </span>
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Invoicer: <span className="font-semibold">{inv.RaiseBy}</span>
      </p>
      <p className="text-sm text-gray-600 mt-1">
        Total Amount:{" "}
        <span className="font-semibold">
          ₦
          {inv.grandTotal.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </p>
    </nav>

    {/* Orders */}
    <details className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm">
      <summary className="cursor-pointer font-semibold text-gray-800">
        View Orders [{inv.orders.length} items]
      </summary>
      <ul className="space-y-4 mt-3">
        {inv.orders.map((order, i) => (
          <li
            key={i}
            className="border border-gray-200 rounded-lg p-4 bg-gray-50 shadow-sm"
          >
            <h5 className="font-semibold text-gray-800">{order.item.Name}</h5>
            <p className="text-sm text-gray-600">Case: {order.Qty}</p>
            <p className="text-sm text-gray-600">Pieces: {order.pcsReq}</p>
            <p className="text-md text-gray-600 font-semibold">
              Price: ₦{order.total}
            </p>
          </li>
        ))}
      </ul>
    </details>

    {/* Actions */}
    {inv.billStatus === "Order" ? (
      <button
        title={`Convert ${inv.billStatus} to Invoice and Generate WayBill`}
        onClick={() => showDeliveryModal(inv, user, biz)}
        className="mt-6 inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-700 text-gray-100 font-semibold border border-gray-300 hover:shadow-lg hover:border-gray-400 hover:text-white transition duration-200 ease-in-out"
      >
        <TruckIcon className="w-5 h-5 text-gray-100" />
        <span>Generate WayBill</span>
      </button>
    ) : (
      <>
        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Delivery Date *
            </label>
            <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50">
              {new Date(inv.DELIVERYDATE).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Delivery Fee *
            </label>
            <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50">
              ₦{inv.shippingFee}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Driver Name *
            </label>
            <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50">
              {inv.DriverName}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              Driver Contact *
            </label>
            <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50">
              {inv.DriverNumber}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Vehicle Plate Number *
          </label>
          <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 uppercase">
            {inv.vehicleNumber}
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Delivery Remarks
          </label>
          <div className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-gray-50 h-20">
            {inv.DeliveryComment}
          </div>
        </div>
      </>
    )}

    {inv.billStatus === "Invoice" && (
      <div className="flex gap-4 mt-6">
        <button
          title={`Download and Print ${inv.billStatus}`}
          onClick={() => generatePdf(biz, inv.customer, inv)}
          className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-700 text-gray-100 font-semibold border border-gray-300 hover:shadow-lg hover:border-gray-400 hover:text-white transition duration-200 ease-in-out"
        >
          <PrinterIcon className="w-5 h-5 text-gray-100" />
          <span>Print {inv.billStatus}</span>
        </button>

        <button
          title={`Print WayBill ${inv.billStatus}`}
          onClick={() => printWayBill(biz, inv.customer, inv)}
          className="inline-flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-700 text-gray-100 font-semibold border border-gray-300 hover:shadow-lg hover:border-gray-400 hover:text-white transition duration-200 ease-in-out"
        >
          <PrinterIcon className="w-5 h-5 text-gray-100" />
          <span>Print WB/{inv.WayBillNo}</span>
        </button>
      </div>
    )}
  </div>
);

}
