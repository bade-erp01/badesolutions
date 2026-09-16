"use client";

import { mutate } from "swr";
import QRCode from "qrcode";
import DeliveryModal from "@/app/Components/Delivery";
import { React, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import {
  Encrypt,
  Dencrypt,
  totalInWords,
  EXPRESS_PRIVATE_URL,
} from "../../../../../../../Functions/Functions";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../../../Functions/Mics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios";
import moment from "moment";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowPathRoundedSquareIcon,
  PrinterIcon,
  ArrowUturnLeftIcon,
  AdjustmentsVerticalIcon,
  TruckIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { pricelistSetter } from "../../../../../../../Functions/Functions";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function InvoicePage({
  userInfo,
  SinglebillItem,
  customerList,
  Inventory
}) {
  const Router = useRouter();
  const path = useParams();
  const [cust] = useState(customerList);
  const [InventoryItem] = useState(Inventory)
  const [Singlebill, setSinglebill] = useState(SinglebillItem);
  const isCancelled = Singlebill.billStatus?.toUpperCase() === "CANCELLED";

  //  Safe image loader as Data URL
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

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount || 0);

  //  Full PDF generator (unchanged)
  const generatePdf = async (business, customer, bill) => {
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
        `${business.shopAddress || ""} ${business.companyState || ""}, ${
          business.companyCity || ""
        }`,
        pageWidth - 10,
        20,
        { align: "right" },
      );
      doc.text(business.email || "", pageWidth - 10, 26, { align: "right" });
      doc.text(`Tel: ${business.Tel || "N/A"}`, pageWidth - 10, 32, {
        align: "right",
      });

      currentY = 50;

      doc.setFontSize(17).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text(
        `${bill.billStatus?.slice(0, 3).toUpperCase()}/${bill.billReferenceNo}`,
        10,
        currentY,
      );
      currentY += 10;

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

      doc.setFontSize(7);
      doc.text(
        `${totalInWords(bill.grandTotal, business.currency?.currency)}`,
        margin,
        currentY,
      );
      currentY += 10;
      doc.text("Authorized Signatures", margin, currentY);
      currentY += 10;
      doc.text(
        `${business.companyName.toLowerCase()} _______________________________`,
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
      if (business.invoicePolicy) {
        doc.text(business.invoicePolicy, margin, currentY);
        currentY += 10;
      }

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
      console.error("Error generating PDF:", error);
    }
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
      access: `${Encrypt(userInfo.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
    },
  };

  const handleQtyChange = async (
    lineId,
    value,
    toUpdate,
    billId,
    storeId,
    companyName,
  ) => {
    try {
      plsWait("Updating cart...");

      const url = `${EXPRESS_PRIVATE_URL}/api/Recalled/Cart/Update?user=${Encrypt(
        userInfo.user._id,
      )}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
          access: `${Encrypt(userInfo.user._id)}`,
          sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
        },
        body: JSON.stringify({ lineId, value, toUpdate, billId, storeId }),
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);
        setSinglebill(Dencrypt(data.Updatedinvoice));
      } else {
        throw new Error(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      ErrorMessage(err.message);
      Router.refresh();
    }
  };

  const Rebill = async () => {
    plsWait(
      "Hold tight — we’re preparing everything for you. This won’t take long ⏳ Please don’t refresh or leave this page. Also note that this Bill will carry a new Reference.",
    );

    try {
      const Biller = Encrypt(userInfo.user._id);
      const url = `${EXPRESS_PRIVATE_URL}/api/Redo/invoice/${Encrypt(
        Singlebill._id,
      )}?Biller=${Biller}`;

      const { data } = await axios.post(url, {}, config);

      if (data && data.result) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        Router.push(
          `/${path.auth}/V4/Sales/Sales/Draft/${Encrypt(
            data.result,
          )}`,
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Invoice Creation Error",
          text: "Could not retrieve invoice ID for redirection.",
          confirmButtonText: "Close",
        });
      }
    } catch (error) {
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  const printWayBill = async (business, customer, bill, userInfo) => {
    try {
      plsWait("Setting things up, Ensure your printer is connected⌛...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      let currentY = margin;

      if (business.companyLogo) {
        try {
          const logoDataURL = await loadImageAsDataURL(business.companyLogo);
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

      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(business.companyName, pageWidth - margin, currentY + 5, {
        align: "right",
      });
      doc.setFontSize(10);
      const address = `${business.shopAddress} ${business.companyCity} ${business.companyState}`;
      const wrappedAddress = doc.splitTextToSize(
        address.toLowerCase(),
        pageWidth * 0.5,
      );
      doc.text(wrappedAddress, pageWidth - margin, currentY + 12, {
        align: "right",
      });
      doc.text(`${business.email}`, pageWidth - margin, currentY + 20, {
        align: "right",
      });
      doc.text(`(${business.Tel})`, pageWidth - margin, currentY + 26, {
        align: "right",
      });
      doc.text(
        `Invoiced By: ${bill.RaiseBy}`,
        pageWidth - margin,
        currentY + 32,
        { align: "right" },
      );

      currentY += 50;

      const qrDataURL = await QRCode.toDataURL("https://badesolutions.com.ng");
      doc.addImage(qrDataURL, "PNG", pageWidth - margin - 30, currentY, 30, 30);

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
          doc.text(`${business.invoicePolicy}`, margin, pageHeight - 10);
          doc.text(`Page ${pageNumber}`, pageWidth - 60, pageHeight - 10);
        },
      });

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

  const ActionBtn = async (orderId, option) => {
    const confirmed = await Swal.fire({
      title: "Confirm Action?",
      text:
        option === "Approved"
          ? "Proceed with approval will lead to inventory update and this action cannot be undone."
          : "Are you sure you want to decline this invoice?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (!confirmed.isConfirmed) return;

    const { value: opCode } = await Swal.fire({
      title: "Security Check point",
      input: "password",
      inputLabel: "Enter Ops Code to proceed",
      inputPlaceholder: "Input your security code",
      showCancelButton: true,
      confirmButtonText: "Submit",
    });

    if (!opCode) {
      Swal.fire("Cancelled", "Operation was cancelled.", "info");
      return;
    }

    try {
      plsWait("Processing Request...");
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/Recalled/invoice/${Encrypt(
          orderId,
        )}?user=${Encrypt(userInfo.user._id)}&ops=${Encrypt(
          opCode,
        )}&option=${option}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
            access: `${Encrypt(userInfo.user._id)}`,
            "idempotency-key": `recalled-${option}-${Singlebill._id}`,
            sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
          },
          body: JSON.stringify({ id: Encrypt(orderId) }),
        },
      );

      const result = await res.json();

      if (res.ok) {
        SuccessToast(result.message);

        if (result.Updatedinvoice) {
          setSinglebill(Dencrypt(result.Updatedinvoice));
        }

        Router.refresh();
      } else {
        throw new Error(result.error || "Request failed");
      }
    } catch (err) {
      ErrorMessage(
        err.message || "An error occurred while processing request.",
      );
      Router.refresh();
    }
  };

  const cancelSales = async (orderId, option) => {
    const confirmed = await Swal.fire({
      title: "Confirm Action?",
      text: "Are you sure you want to proceed with this action?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (!confirmed.isConfirmed) return;

    const { value: opCode } = await Swal.fire({
      title: "Security Check point",
      input: "password",
      inputLabel: "Enter Ops Code to proceed",
      inputPlaceholder: "Input your security code",
      showCancelButton: true,
      confirmButtonText: "Submit",
    });

    if (!opCode) {
      Swal.fire("Cancelled", "Operation was cancelled.", "info");
      return;
    }

    try {
      plsWait("Processing Request...");
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/SingleReturn/${Encrypt(
          orderId,
        )}?user=${Encrypt(userInfo.user._id)}&ops=${Encrypt(
          opCode,
        )}&option=${option}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
            access: `${Encrypt(userInfo.user._id)}`,
            sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
          },
          body: JSON.stringify({ id: Encrypt(orderId) }),
        },
      );

      const result = await res.json();

      if (res.ok) {
        SuccessToast(result.message);

        if (result.Updatedinvoice) {
          setSinglebill(Dencrypt(result.Updatedinvoice));
        }
      } else {
        throw new Error(result.error || "Request failed");
      }
    } catch (err) {
      ErrorMessage(
        err.message || "An error occurred while processing request.",
      );
      Router.refresh();
    }
  };

  const REQToDRAFT = async (orderId, option) => {
    const confirmed = await Swal.fire({
      title: "Confirm Action?",
      text: "Are you sure you want to proceed with this action?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (!confirmed.isConfirmed) return;

    const { value: opCode } = await Swal.fire({
      title: "Security Check point",
      input: "password",
      inputLabel: "Enter Ops Code to proceed",
      inputPlaceholder: "Input your security code",
      showCancelButton: true,
      confirmButtonText: "Submit",
    });

    if (!opCode) {
      Swal.fire("Cancelled", "Operation was cancelled.", "info");
      return;
    }

    try {
      plsWait("Processing Request...");
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/REQToDRAFT/${Encrypt(
          orderId,
        )}?user=${Encrypt(userInfo.user._id)}&ops=${Encrypt(
          opCode,
        )}&option=${option}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
            access: `${Encrypt(userInfo.user._id)}`,
            sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
            "idempotency-key": `Requisitions-${orderId}`,
          },
          body: JSON.stringify({ id: Encrypt(orderId) }),
        },
      );

      const result = await res.json();

      if (res.ok) {
        SuccessToast(result.message);
        Router.push(
          `/${path.auth}/V4/${path.Module}/${path.Module}/Draft/${Encrypt(
            orderId,
          )}`,
        );
      } else {
        throw new Error(result.error || "Request failed");
      }
    } catch (err) {
      ErrorMessage(
        err.message || "An error occurred while processing request.",
      );
      Router.refresh();
    }
  };


  // get current inventroy value for requisition orders
  const getInventoryValue = (id) => {
    try {
      const product = InventoryItem.find((p) => p.storeId === id || p.storeId?.toString() === id?.toString())

      if (!product) return "N/A"

      return `C:${product.Case ?? 0} P:${product.pcs ?? 0}`
    } catch (err) {
      return "N/A"
    }
  }

  return (
    <>
      <div className="text-xs px-3 sm:px-6 py-6 sm:py-10 bg-card text-card-foreground animate__animated animate__fadeIn invoicecontainer border border-border rounded-lg">
        {/* ========== TOP HEADER ========== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 sm:mb-8">
          <h1
            className={`font-bold text-base sm:text-lg ${
              isCancelled
                ? "text-red-600 dark:text-red-400"
                : "text-foreground"
            }`}
          >
            {Singlebill.billStatus.toUpperCase()} / {Singlebill.billReferenceNo}{" "}
            / {Singlebill.invoicelocation}
          </h1>
          <div className="text-left sm:text-right">
            <span className="text-xs text-muted-foreground tracking-tight">
              Created on:{" "}
              {moment(Singlebill.createdAt).format(
                "dddd DD MMMM YYYY [at] hh:mm A",
              )}
            </span>
          </div>
        </div>

        {/* ========== COMPANY + CUSTOMER INFO ========== */}
        <div className="flex flex-col lg:flex-row justify-between gap-8 border-t border-b border-border py-6 sm:py-8 mb-6">
          {/* Left - Business Info */}
          <div className="flex items-start gap-4 sm:gap-6">
            <Image
              src={userInfo.business.companyLogo}
              width={90}
              height={90}
              alt="logo"
              loading="eager"
              priority
              quality={100}
              className="rounded-md shrink-0"
            />
            <div className="text-sm space-y-1">
              <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight">
                {userInfo.business.companyName}
              </h3>
              <p className="text-muted-foreground">{userInfo.business.email}</p>
              <p className="text-muted-foreground">{userInfo.business.Tel}</p>
              <p className="text-muted-foreground">
                {userInfo.business.shopAddress?.slice(0, 40)}...
              </p>
              <p className="text-muted-foreground">
                {userInfo.business.CompanyCity}
              </p>

              <h2
                className={`mt-3 font-bold text-sm sm:text-base ${
                  isCancelled
                    ? "text-red-600 dark:text-red-400"
                    : "text-foreground"
                }`}
              >
                {Singlebill.billStatus.toUpperCase()} /{" "}
                {Singlebill.billReferenceNo} / {Singlebill.invoicelocation}
              </h2>

              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="secondary"
                  className="text-sm font-semibold px-2 py-0.5"
                >
                  {Singlebill.WayBillNo}
                </Badge>
                <Badge
                  variant="secondary"
                  className="lowercase text-sm font-semibold px-2 py-0.5"
                >
                  Store: {Singlebill.whId?.WHName}
                </Badge>
              </div>
            </div>
          </div>

          {/* Right - Customer Info */}
          <div className="text-left lg:text-right text-sm space-y-1 min-w-0 lg:min-w-[220px]">
            <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              {Singlebill.customer?.Username?.toUpperCase()}
            </h3>

            <p className="text-muted-foreground">
              {Singlebill.customer?.billingAddress?.slice(0, 40)}
            </p>

            <p>
              <a
                href={`tel:${Singlebill.customer.phone}`}
                className="hover:underline text-indigo-600 dark:text-indigo-400"
              >
                {Singlebill.customer.phone}
              </a>
            </p>

            <p>
              <a
                href={`mailto:${Singlebill.customer.Email}`}
                className="hover:underline text-indigo-600 dark:text-indigo-400"
              >
                {Singlebill.customer.Email}
              </a>
            </p>

            <p className="text-muted-foreground">
              {new Date(Singlebill.startDate).toLocaleDateString()}
            </p>

            <Badge
              variant="secondary"
              className="lowercase text-sm font-semibold px-2 py-0.5 mt-1"
            >
              Billed at:{" "}
              {pricelistSetter(Singlebill.priceList, userInfo.business)}
            </Badge>
          </div>
        </div>

        {/* ========== ACTION BUTTONS ========== */}
        <div className="flex flex-wrap gap-2 mb-6 justify-start sm:justify-end">
          {(Singlebill.billStatus?.toUpperCase() === "INVOICE" ||
            (Singlebill.billStatus?.toUpperCase() === "ORDER" &&
              Singlebill.billStatus?.toUpperCase() !== "RECALLED")) &&
            userInfo.user.cancelInvoice && (
              <>
                <button
                  title={`Cancel and return SKU in ${Singlebill.billStatus}`}
                  onClick={() => cancelSales(Singlebill._id)}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold text-xs sm:text-sm transition"
                >
                  <ArrowUturnLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden xs:inline">
                    Cancel {Singlebill.billStatus}/{Singlebill.billReferenceNo}
                  </span>
                  <span className="xs:hidden">Cancel</span>
                </button>

                {userInfo.user.cancelInvoice &&
                  userInfo.business.subscriptionplan === "Standard" &&
                  !Singlebill.memoId && (
                    <button
                      title={`Return line item(s) in ${Singlebill.billStatus}`}
                      onClick={() => cancelSales(Singlebill._id, "Recalled")}
                      className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs sm:text-sm border border-border transition"
                    >
                      <AdjustmentsVerticalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Generate CN / Return</span>
                    </button>
                  )}
              </>
            )}

          {Singlebill.billStatus?.toUpperCase() === "ORDER" && (
            <DeliveryModal
              id={Singlebill._id}
              user={userInfo.user}
              business={userInfo.business}
            />
          )}

          {((userInfo.user._id === Singlebill.invoicerId &&
            Singlebill.billStatus?.toUpperCase() === "RECALLED") ||
            (userInfo.user.cancelInvoice &&
              Singlebill.billStatus?.toUpperCase() === "RECALLED")) && (
            <button
              title={`Lock ${Singlebill.billStatus}`}
              onClick={() => cancelSales(Singlebill._id, "Locked")}
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs sm:text-sm border border-border transition"
            >
              <LockClosedIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Lock Updates</span>
            </button>
          )}

          {userInfo.user.raiseInvoice &&
            Singlebill.billStatus === "Requisition" && (
              <button
                title="Revert this requisition back to draft for editing"
                onClick={() => REQToDRAFT(Singlebill._id, "Draft")}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm transition"
              >
                <ArrowUturnLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Revert to Draft</span>
              </button>
            )}

          {userInfo.user.cancelInvoice &&
            Singlebill.billStatus?.toUpperCase() === "LOCKED" && (
              <>
                <button
                  title={`Approve ${Singlebill.billStatus} Adjustment`}
                  onClick={() => ActionBtn(Singlebill._id, "Approved")}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs sm:text-sm border border-border transition"
                >
                  <ShieldCheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Approve Adjustment</span>
                </button>

                <button
                  title={`Decline ${Singlebill.billStatus} Adjustment`}
                  onClick={() => ActionBtn(Singlebill._id, "Declined")}
                  className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm transition"
                >
                  <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Decline Updates</span>
                </button>
              </>
            )}

          {Singlebill.billStatus?.toUpperCase() === "INVOICE" && (
            <button
              title={`Print WayBill ${Singlebill.billStatus}`}
              onClick={() => {
                printWayBill(
                  userInfo.business,
                  Singlebill.customer,
                  Singlebill,
                );
              }}
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs sm:text-sm border border-border transition"
            >
              <PrinterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Print WB/{Singlebill.WayBillNo}</span>
            </button>
          )}

          {userInfo.business.subscriptionplan === "Standard" &&
            userInfo.user.raiseInvoice &&
            !Singlebill.reBilled &&
            Singlebill.billStatus?.toUpperCase() === "CANCELLED" && (
              <button
                title={`Re-Bill ${Singlebill.billReferenceNo}`}
                onClick={Rebill}
                className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-green-200 dark:bg-green-900/40 text-green-800 dark:text-green-300 hover:bg-green-600 hover:text-white font-semibold text-xs sm:text-sm transition"
              >
                <ArrowPathRoundedSquareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Recycle</span>
              </button>
            )}

          {Singlebill.billStatus?.toUpperCase() !== "PROCESSING" && (
            <button
              title={`Download and Print ${Singlebill.billStatus}`}
              onClick={() =>
                generatePdf(
                  userInfo.business,
                  Singlebill.customer,
                  Singlebill,
                )
              }
              className="inline-flex items-center gap-2 px-3 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 font-semibold text-xs sm:text-sm border border-border transition"
            >
              <PrinterIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Print {Singlebill.billStatus}</span>
            </button>
          )}
        </div>

        {/* ========== PRODUCT TABLE (Desktop) ========== */}
        <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card mb-8 text-xs">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
              <tr>
                {[
                  "#",
                  "Product",
                  "Photo",
                   Singlebill.billStatus === "Requisition" ? "Inventory" : "Trace",
                  "Code",
                  "Case",
                  "Pcs",
                  "P/RTC",
                  "P/RTP",
                  "Price",
                  "Promo",
                  "VAT",
                  `Total (${userInfo.business.currency?.currency.Symbol})`,
                ].map((th, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 font-semibold whitespace-nowrap text-center"
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-foreground">
              {Singlebill.orders?.map((bill, index) => (
                <tr
                  key={bill._id}
                  className="border-t border-border hover:bg-muted/40 transition"
                >
                  <td className="px-4 py-2 text-center text-xs">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-center text-xs">
                    {bill.item.Name}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Image
                      src={
                        bill.item.image || bill.item.QrCode || "/preview.png"
                      }
                      width={38}
                      height={38}
                      alt="preview"
                      className="rounded-md mx-auto"
                    />
                  </td>
                 <td className="px-4 py-2 text-center text-xs">
                    {Singlebill.billStatus === "Requisition" ? (
                      // Inventory column
                      <Badge variant="outline">
                        {getInventoryValue(bill.storeProductId)}
                      </Badge>
                    ) : (
                      // Trace column
                      <Badge
                        variant={
                          bill.returnId === "WH/IN"
                            ? "secondary"
                            : bill.returnId === "WH/OUT"
                              ? "default"
                              : "outline"
                        }
                      >
                        {bill.returnId === "WH/IN"
                          ? "Returned"
                          : bill.returnId === "WH/OUT"
                            ? "Issued Out"
                            : "N/A"}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {bill.item.ADCcode || bill.item.ACDcode}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">{bill.Qty}</td>
                  <td className="px-4 py-2 text-center text-xs">
                    {bill.pcsReq || 0}
                  </td>
                  <td
                    className="px-4 py-2 text-center text-xs"
                    title="Returned Case"
                  >
                    {(userInfo.user._id === Singlebill.invoicerId &&
                      Singlebill.billStatus.toLowerCase() === "recalled") ||
                    (userInfo.user.cancelInvoice &&
                      Singlebill.billStatus?.toUpperCase() === "RECALLED") ? (
                      <input
                        type="number"
                        defaultValue={bill.RCRT || 0}
                        min={0}
                        onBlur={(e) => {
                          let val = e.target.value;
                          if (val < 0) return;
                          handleQtyChange(
                            bill._id,
                            val,
                            "Qty",
                            Singlebill._id,
                            bill.storeProductId,
                            userInfo.business.companyName,
                          );
                        }}
                        className="w-16 px-2 py-1 border border-border rounded text-center bg-background"
                      />
                    ) : (
                      bill.RCRT
                    )}
                  </td>
                  <td
                    className="px-4 py-2 text-center text-xs"
                    title="Returned Pcs"
                  >
                    {(userInfo.business.allowSkuSplitting &&
                      userInfo.user._id === Singlebill.invoicerId &&
                      Singlebill.billStatus.toLowerCase() === "recalled") ||
                    (userInfo.user.cancelInvoice &&
                      Singlebill.billStatus?.toUpperCase() === "RECALLED") ? (
                      <input
                        type="number"
                        defaultValue={bill.RPCS || 0}
                        className="w-16 px-2 py-1 border border-border rounded text-center bg-background"
                        onBlur={(e) => {
                          let val = e.target.value;
                          if (val < 0) return;
                          handleQtyChange(
                            bill._id,
                            val,
                            "pcs",
                            Singlebill._id,
                            bill.storeProductId,
                            userInfo.business.companyName,
                          );
                        }}
                      />
                    ) : (
                      bill.RPCS || 0
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.priceListPrice?.toFixed(2) || 0}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.promotionData?.toFixed(2) || 0}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {bill.vat > 0 && bill.item.VAT
                      ? bill.item.VAT.$numberDecimal
                      : 0}
                  </td>
                  <td className="px-4 py-2 font-bold text-right text-xs">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.total?.toFixed(2) || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ========== PRODUCT CARDS (Mobile) ========== */}
        <div className="md:hidden space-y-4 mb-8">
          {Singlebill.orders?.map((bill, index) => (
            <div
              key={bill._id}
              className="border border-border rounded-lg bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image
                    src={bill.item.image || bill.item.QrCode || "/preview.png"}
                    width={48}
                    height={48}
                    alt="preview"
                    className="rounded-md shrink-0"
                  />
                  <div>
                    <p className="font-medium text-sm leading-tight">
                      {bill.item.Name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {bill.item.ADCcode || bill.item.ACDcode}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">#{index + 1}</span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Case</p>
                  <p className="font-medium">{bill.Qty}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pcs</p>
                  <p className="font-medium">{bill.pcsReq || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-medium">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.priceListPrice?.toFixed(2) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Promo</p>
                  <p className="font-medium">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.promotionData?.toFixed(2) || 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">VAT</p>
                  <p className="font-medium">
                    {bill.vat > 0 && bill.item.VAT
                      ? bill.item.VAT.$numberDecimal
                      : 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-bold">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.total?.toFixed(2) || 0}
                  </p>
                </div>
              </div>

              {/* Editable returned quantities on mobile */}
              {((userInfo.user._id === Singlebill.invoicerId &&
                Singlebill.billStatus.toLowerCase() === "recalled") ||
                (userInfo.user.cancelInvoice &&
                  Singlebill.billStatus?.toUpperCase() === "RECALLED")) && (
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Returned Case
                    </p>
                    <input
                      type="number"
                      defaultValue={bill.RCRT || 0}
                      min={0}
                      onBlur={(e) => {
                        let val = e.target.value;
                        if (val < 0) return;
                        handleQtyChange(
                          bill._id,
                          val,
                          "Qty",
                          Singlebill._id,
                          bill.storeProductId,
                          userInfo.business.companyName,
                        );
                      }}
                      className="w-full px-2 py-1.5 border border-border rounded text-center bg-background text-sm"
                    />
                  </div>
                  {userInfo.business.allowSkuSplitting && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Returned Pcs
                      </p>
                      <input
                        type="number"
                        defaultValue={bill.RPCS || 0}
                        onBlur={(e) => {
                          let val = e.target.value;
                          if (val < 0) return;
                          handleQtyChange(
                            bill._id,
                            val,
                            "pcs",
                            Singlebill._id,
                            bill.storeProductId,
                            userInfo.business.companyName,
                          );
                        }}
                        className="w-full px-2 py-1.5 border border-border rounded text-center bg-background text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ========== SUMMARY SECTION ========== */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 text-sm">
          <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6">
            <h3 className="text-base sm:text-lg font-bold mb-4 text-foreground border-b border-border pb-2">
              Summary
            </h3>
            <div className="space-y-2 text-foreground">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <strong>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.subTotal?.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Discount:</span>
                <strong>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.discount?.toFixed(2) || 0}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Rate:</span>
                <strong>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.taxRate.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping Fee:</span>
                <strong>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.shippingFee.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold mt-4 border-t border-border pt-3">
                <span>Grand Total:</span>
                <span>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.grandTotal?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Words + Delivery */}
          <div className="bg-card rounded-xl border border-border shadow-sm p-5 sm:p-6 text-foreground flex flex-col justify-between">
            <div>
              <h3 className="text-base sm:text-lg font-bold mb-4">
                Total In Words
              </h3>
              <p className="italic text-sm sm:text-base text-orange-600 dark:text-orange-400 mb-6">
                {totalInWords(
                  Singlebill.grandTotal,
                  userInfo.business.currency.currency,
                )}
              </p>

              {Singlebill.deliveryOption && (
                <div className="border-t border-border pt-5 space-y-3">
                  <h4 className="text-sm font-semibold text-foreground mb-3">
                    Delivery Information
                  </h4>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Method</span>
                    <span className="font-medium capitalize">
                      {Singlebill.deliveryOption?.shippingMethod === "pickup"
                        ? "Store Pickup"
                        : Singlebill.deliveryOption?.shippingMethod || "—"}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping Fee</span>
                    <span className="font-medium">
                      {Singlebill.deliveryOption?.shippingFee > 0
                        ? formatPrice(Singlebill.deliveryOption?.shippingFee)
                        : "Free"}
                    </span>
                  </div>

                  {Singlebill.deliveryOption.paymentMethod && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Payment</span>
                      <span className="font-medium">
                        {Singlebill.deliveryOption.paymentMethod === "cod"
                          ? "Cash on Delivery"
                          : Singlebill.deliveryOption?.paymentMethod ===
                              "transfer"
                            ? "Bank Transfer"
                            : Singlebill.deliveryOption.paymentMethod}
                      </span>
                    </div>
                  )}

                  {Singlebill.deliveryOption?.address && (
                    <div className="pt-2">
                      <p className="text-muted-foreground text-sm mb-1">
                        Delivery Address
                      </p>
                      <p className="text-sm font-medium leading-relaxed">
                        {Singlebill.deliveryOption?.address}
                      </p>
                    </div>
                  )}

                  {Singlebill.deliveryOption?.receipt && (
                    <div className="pt-2">
                      <p className="text-muted-foreground text-sm mb-1">
                        Payment Receipt
                      </p>
                      <Link
                        href={Singlebill.deliveryOption?.receipt}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-orange-600 dark:text-orange-400 hover:underline font-medium"
                      >
                        View Payment Receipt
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== SIGNATURE & T&C ========== */}
        <div className="mt-10 sm:mt-12 flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-md">
            <h4 className="font-semibold text-foreground mb-2">
              Terms & Conditions
            </h4>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {userInfo.business.invoicePolicy}
            </p>
          </div>
          <div className="text-left md:text-right">
            <h4 className="font-semibold text-foreground mb-2">Issued by</h4>
            <p className="text-sm font-medium">{Singlebill.RaiseBy}</p>
          </div>
        </div>

        {/* ========== FOOTER ========== */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-border text-center text-sm text-muted-foreground tracking-wide">
          {Singlebill.billStatus.toUpperCase()} / {Singlebill.billReferenceNo} /{" "}
          {Singlebill.invoicelocation}
        </div>
      </div>
    </>
  );
}