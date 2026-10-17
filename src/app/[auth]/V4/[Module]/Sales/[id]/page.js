"use client";

import { mutate } from "swr";
import QRCode from "qrcode";
import DeliveryModal from "@/app/Components/Delivery";
import { React, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import {
  Dencrypt,
  totalInWords,
} from "../../../../../../../Functions/Functions";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../../../Functions/Mics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "@/lib/api";
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
import { safeUrl } from "@/lib/security/safeUrl";

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
    plsWait(
      "Setting things up, Ensure your printer is connected ⌛..."
    );

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10;

    // =========================================================
    // DYNAMIC COLOR THEME
    // Order + Invoice = GREEN
    // Everything else = RED
    // =========================================================

    const status = String(bill?.billStatus || "")
      .trim()
      .toLowerCase();

    const isGreenTheme =
      status === "order" ||
      status === "invoice";

    const theme = isGreenTheme
      ? {
          PRIMARY: [34, 197, 94],
          DARK_PRIMARY: [22, 163, 74],
          LIGHT_PRIMARY: [220, 252, 231],
          PALE_PRIMARY: [240, 253, 244],
        }
      : {
          PRIMARY: [239, 68, 68],
          DARK_PRIMARY: [220, 38, 38],
          LIGHT_PRIMARY: [254, 226, 226],
          PALE_PRIMARY: [254, 242, 242],
        };

    const {
      PRIMARY,
      DARK_PRIMARY,
      LIGHT_PRIMARY,
      PALE_PRIMARY,
    } = theme;

    // =========================================================
    // GENERAL COLORS
    // =========================================================

    const DARK = [31, 41, 55];
    const GREY = [100, 116, 139];
    const LIGHT_GREY = [226, 232, 240];
    const WHITE = [255, 255, 255];

    // =========================================================
    // HELPERS
    // =========================================================

    const safeNumber = (value) => {
      const number = Number(value);

      return Number.isFinite(number)
        ? number
        : 0;
    };

    const money = (value) =>
      safeNumber(value).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    const drawLine = (
      y,
      x1 = margin,
      x2 = pageWidth - margin
    ) => {
      doc.setDrawColor(...LIGHT_GREY);
      doc.setLineWidth(0.25);
      doc.line(x1, y, x2, y);
    };

    const drawLabel = (text, x, y) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(...GREY);

      doc.text(
        String(text).toUpperCase(),
        x,
        y
      );
    };

    let currentY = margin;

    // =========================================================
    // COMPANY LOGO
    // =========================================================

    let logoWidth = 0;

    if (business?.companyLogo) {
      try {
        const logo = await loadImageAsDataURL(
          business.companyLogo
        );

        doc.addImage(
          logo,
          "JPEG",
          margin,
          10,
          28,
          22,
          undefined,
          "FAST"
        );

        logoWidth = 34;
      } catch (error) {
        console.warn(
          "Logo failed to load",
          error
        );
      }
    }

    // =========================================================
    // COMPANY INFORMATION
    // =========================================================

    const companyX =
      margin + logoWidth;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...DARK);

    doc.text(
      business?.companyName || "",
      companyX,
      15
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);

    const companyAddress = [
      business?.shopAddress,
      business?.companyCity,
      business?.companyState,
    ]
      .filter(Boolean)
      .join(", ");

    if (companyAddress) {
      doc.text(
        companyAddress,
        companyX,
        20
      );
    }

    if (business?.email) {
      doc.text(
        business.email,
        companyX,
        24.5
      );
    }

    if (business?.Tel) {
      doc.text(
        `Tel: ${business.Tel}`,
        companyX,
        29
      );
    }

    // =========================================================
    // DOCUMENT STATUS
    // =========================================================

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(...PRIMARY);

    doc.text(
      `${
        bill?.billStatus
          ?.slice(0, 3)
          .toUpperCase() || "INV"
      }`,
      pageWidth - margin,
      15,
      {
        align: "right",
      }
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);

    doc.text(
      `Ref: ${
        bill?.billReferenceNo || "N/A"
      }`,
      pageWidth - margin,
      21,
      {
        align: "right",
      }
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GREY);

    doc.text(
      `Print Date: ${moment().format(
        "DD MMM YYYY"
      )}`,
      pageWidth - margin,
      26,
      {
        align: "right",
      }
    );

    // =========================================================
    // HEADER DIVIDER
    // =========================================================

    doc.setDrawColor(...PRIMARY);
    doc.setLineWidth(0.8);

    doc.line(
      margin,
      37,
      pageWidth - margin,
      37
    );

    currentY = 46;

    // =========================================================
    // BILL TO
    // =========================================================

    drawLabel(
      "Bill To",
      margin,
      currentY
    );

    currentY += 6;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...DARK);

    doc.text(
      bill?.customerName
        ?.toUpperCase() || "",
      margin,
      currentY
    );

    currentY += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...GREY);

    if (customer?.billingAddress) {
      doc.text(
        customer.billingAddress,
        margin,
        currentY
      );

      currentY += 4;
    }

    if (customer?.phone) {
      doc.text(
        `Phone: ${customer.phone}`,
        margin,
        currentY
      );

      currentY += 4;
    }

    doc.text(
      `Contact Person: ${
        customer?.contactPerson ||
        bill?.customerName ||
        "N/A"
      }`,
      margin,
      currentY
    );

    // =========================================================
    // DOCUMENT INFORMATION
    // =========================================================

    const infoX = pageWidth - 85;
    const infoY = 46;

    drawLabel(
      "Document Information",
      infoX,
      infoY
    );

    autoTable(doc, {
      startY: infoY + 3,

      tableWidth: 75,

      margin: {
        left: infoX,
      },

      head: [],

      body: [
        [
          "Waybill No.",
          bill?.WayBillNo || "N/A",
        ],
        [
          "Order Date",
          bill?.startDate || "N/A",
        ],
        [
          "Invoice Date",
          bill?.DELIVERYDATE
            ? moment(
                bill.DELIVERYDATE
              ).format("DD MMM YYYY")
            : "N/A",
        ],
      ],

      theme: "plain",

      styles: {
        font: "helvetica",
        fontSize: 7,
        textColor: DARK,
        cellPadding: 1.5,
      },

      columnStyles: {
        0: {
          cellWidth: 30,
          fontStyle: "bold",
          textColor: GREY,
        },

        1: {
          cellWidth: 45,
          halign: "right",
        },
      },
    });

    currentY = Math.max(
      currentY + 8,
      doc.lastAutoTable.finalY + 8
    );

    // =========================================================
    // ORDER ITEMS
    // =========================================================

    const orders = Array.isArray(
      bill?.orders
    )
      ? bill.orders.filter(
          (entry) =>
            safeNumber(entry?.Qty) > 0 ||
            safeNumber(entry?.pcsReq) > 0
        )
      : [];

    autoTable(doc, {
      startY: currentY,

      margin: {
        left: margin,
        right: margin,
      },

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

      body: orders.map((ord, i) => [
        i + 1,

        `${ord?.item?.Name || "N/A"}${
          ord?.item?.Pieces
            ? ` - [${ord.item.Pieces} pcs]`
            : ""
        }`,

        ord?.item?.ACDcode ||
          ord?.item?.ADCcode ||
          "N/A",

        money(ord?.priceListPrice),

        money(ord?.promotionData),

        safeNumber(ord?.Qty),

        safeNumber(ord?.pcsReq),

        ord?.vat > 0
          ? money(
              ord?.item?.VAT
                ?.$numberDecimal ??
                ord?.item?.VAT ??
                0
            )
          : "0.00",

        money(ord?.total),
      ]),

      theme: "grid",

      styles: {
        font: "helvetica",
        fontSize: 6.8,
        textColor: DARK,
        lineColor: LIGHT_GREY,
        lineWidth: 0.2,
        cellPadding: 2,
        valign: "middle",
      },

      headStyles: {
        fillColor: PRIMARY,
        textColor: WHITE,
        font: "helvetica",
        fontStyle: "bold",
        fontSize: 6.5,
        halign: "center",
        valign: "middle",
        cellPadding: 2.5,
      },

      alternateRowStyles: {
        fillColor: PALE_PRIMARY,
      },

      columnStyles: {
        0: {
          cellWidth: 8,
          halign: "center",
        },

        1: {
          cellWidth: 47,
          fontStyle: "bold",
        },

        2: {
          cellWidth: 20,
          halign: "center",
        },

        3: {
          cellWidth: 19,
          halign: "right",
        },

        4: {
          cellWidth: 18,
          halign: "right",
        },

        5: {
          cellWidth: 13,
          halign: "center",
        },

        6: {
          cellWidth: 13,
          halign: "center",
        },

        7: {
          cellWidth: 17,
          halign: "right",
        },

        8: {
          cellWidth: 23,
          halign: "right",
          fontStyle: "bold",
          textColor: DARK_PRIMARY,
        },
      },

      didParseCell: (data) => {
        if (
          data.section === "body" &&
          data.column.index === 8
        ) {
          data.cell.styles.textColor =
            DARK_PRIMARY;

          data.cell.styles.fontStyle =
            "bold";
        }
      },
    });

    currentY =
      doc.lastAutoTable.finalY + 8;

    // =========================================================
    // PAYMENT SUMMARY
    // =========================================================

    const summaryWidth = 78;

    const summaryX =
      pageWidth -
      margin -
      summaryWidth;

    if (
      currentY >
      pageHeight - 85
    ) {
      doc.addPage();

      currentY = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...DARK);

    doc.text(
      "PAYMENT SUMMARY",
      summaryX,
      currentY
    );

    currentY += 4;

    doc.setDrawColor(...PRIMARY);
    doc.setLineWidth(0.5);

    doc.line(
      summaryX,
      currentY,
      pageWidth - margin,
      currentY
    );

    currentY += 6;

    // =========================================================
    // SUMMARY ROW
    // =========================================================

    const summaryRow = (
      label,
      value,
      emphasized = false
    ) => {
      doc.setFont(
        "helvetica",
        emphasized
          ? "bold"
          : "normal"
      );

      doc.setFontSize(
        emphasized ? 8 : 7.2
      );

      doc.setTextColor(
        ...(emphasized
          ? DARK
          : GREY)
      );

      doc.text(
        label,
        summaryX,
        currentY
      );

      doc.text(
        value,
        pageWidth - margin,
        currentY,
        {
          align: "right",
        }
      );

      currentY +=
        emphasized ? 7 : 5.5;
    };

    summaryRow(
      "Tax Rate",
      `${safeNumber(
        bill?.taxRate
      ).toFixed(2)}%`
    );

    summaryRow(
      "Subtotal",
      money(bill?.subTotal)
    );

    summaryRow(
      "Discount",
      money(bill?.discount)
    );

    currentY += 1;

    // =========================================================
    // TOTAL DUE
    // =========================================================

    doc.setFillColor(
      ...LIGHT_PRIMARY
    );

    doc.roundedRect(
      summaryX - 2,
      currentY - 2,
      summaryWidth + 2,
      13,
      1.5,
      1.5,
      "F"
    );

    doc.setTextColor(
      ...DARK_PRIMARY
    );

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(8);

    doc.text(
      "TOTAL DUE",
      summaryX + 3,
      currentY + 6
    );

    doc.setFontSize(9);

    doc.text(
      money(bill?.grandTotal),
      pageWidth - margin - 3,
      currentY + 6,
      {
        align: "right",
      }
    );

    currentY += 21;

    // =========================================================
    // AMOUNT IN WORDS
    // =========================================================

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(6.8);

    doc.setTextColor(...GREY);

    doc.text(
      "AMOUNT IN WORDS",
      margin,
      currentY
    );

    currentY += 5;

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(7.2);

    doc.setTextColor(...DARK);

    const amountWords =
      totalInWords(
        bill?.grandTotal,
        business?.currency?.currency
      );

    const amountLines =
      doc.splitTextToSize(
        amountWords || "N/A",
        pageWidth - 20
      );

    doc.text(
      amountLines,
      margin,
      currentY
    );

    currentY +=
      amountLines.length * 4 + 7;

    // =========================================================
    // TERMS & CONDITIONS
    // =========================================================

    if (business?.invoicePolicy) {
      const policyLines =
        doc.splitTextToSize(
          business.invoicePolicy,
          pageWidth - 30
        );

      const policyHeight =
        policyLines.length * 4 + 10;

      if (
        currentY + policyHeight >
        pageHeight - 65
      ) {
        doc.addPage();

        currentY = 20;
      }

      doc.setFillColor(
        ...PALE_PRIMARY
      );

      doc.setDrawColor(
        ...LIGHT_GREY
      );

      doc.roundedRect(
        margin,
        currentY,
        pageWidth - 20,
        policyHeight,
        2,
        2,
        "FD"
      );

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setFontSize(6.8);

      doc.setTextColor(
        ...DARK_PRIMARY
      );

      doc.text(
        "TERMS & CONDITIONS",
        margin + 5,
        currentY + 6
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(6.8);

      doc.setTextColor(...GREY);

      doc.text(
        policyLines,
        margin + 5,
        currentY + 11
      );

      currentY +=
        policyHeight + 8;
    }

    // =========================================================
    // SIGNATURES
    // =========================================================

    if (
      currentY >
      pageHeight - 55
    ) {
      doc.addPage();

      currentY = 25;
    }

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(7);

    doc.setTextColor(...GREY);

    doc.text(
      "AUTHORIZED SIGNATURES",
      margin,
      currentY
    );

    currentY += 10;

    const signatureWidth = 72;

    const rightSignatureX =
      pageWidth -
      margin -
      signatureWidth;

    doc.setDrawColor(...DARK);

    doc.setLineWidth(0.3);

    doc.line(
      margin,
      currentY,
      margin + signatureWidth,
      currentY
    );

    doc.line(
      rightSignatureX,
      currentY,
      pageWidth - margin,
      currentY
    );

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(6.8);

    doc.setTextColor(...GREY);

    doc.text(
      business?.companyName ||
        "Authorized Representative",
      margin,
      currentY + 5
    );

    doc.text(
      "Customer Signature & Date",
      rightSignatureX,
      currentY + 5
    );

    // =========================================================
    // FOOTER / PAGE NUMBERS
    // =========================================================

    const totalPages =
      doc.internal.getNumberOfPages();

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      doc.setPage(i);

      doc.setDrawColor(
        ...LIGHT_GREY
      );

      doc.setLineWidth(0.25);

      doc.line(
        margin,
        pageHeight - 15,
        pageWidth - margin,
        pageHeight - 15
      );

      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setFontSize(6.2);

      doc.setTextColor(...GREY);

      doc.text(
        `${
          business?.companyName ||
          "Business"
        } • ${
          bill?.billReferenceNo ||
          ""
        }`,
        margin,
        pageHeight - 9
      );

      doc.text(
        `Page ${i} of ${totalPages}`,
        pageWidth - margin,
        pageHeight - 9,
        {
          align: "right",
        }
      );
    }

    // =========================================================
    // OPEN / PRINT PDF
    // =========================================================

    const blob = doc.output("blob");

    const url =
      URL.createObjectURL(blob);

    const win = window.open(
      url,
      "_blank"
    );

    if (win) {
      win.onload = () => {
        Swal.close();

        setTimeout(() => {
          win.print();
        }, 300);
      };
    } else {
      doc.save(
        `${
          bill?.customerName ||
          "invoice"
        }.pdf`
      );

      Swal.close();
    }

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000);
  } catch (error) {
    Swal.close();

    console.error(
      "Error generating PDF:",
      error
    );
  }
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

      const url = `/api/Recalled/Cart/Update?user=${userInfo.user._id}`;

      const response = await api.put(url, { lineId, value, toUpdate, billId, storeId });

      const data = response.data || {};

      if (data.message) {
        SuccessToast(data.message);
        setSinglebill(Dencrypt(data.Updatedinvoice));
      } else {
        throw new Error(data.error || response.error || "An unknown error occurred.");
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
      const Biller = userInfo.user._id;
      const url = `/api/Redo/invoice/${Singlebill._id}?Biller=${Biller}`;

      const r = await api.post(url, {});
      if (!r.ok) throw new Error(r.error);
      const data = r.data;

      if (data && data.result) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        Router.push(
          `/${path.auth}/V4/Sales/Sales/Draft/${data.result}`,
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
      ErrorMessage(error.message);
    }
  };

  const printWayBill = async (business, customer, bill, userInfo) => {
  try {
    plsWait("Preparing waybill… Ensure your printer is connected.");
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    // ── helpers ──────────────────────────────────────────────
    const setNormal = (size = 9) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.setTextColor(33, 33, 33);
    };
    const setBold = (size = 9) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(size);
      doc.setTextColor(33, 33, 33);
    };
    const setMuted = (size = 8) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(size);
      doc.setTextColor(100, 100, 100);
    };
    const hLine = (atY) => {
      doc.setDrawColor(210, 210, 210);
      doc.setLineWidth(0.3);
      doc.line(margin, atY, pageWidth - margin, atY);
    };

    // ── HEADER: Logo (left) + Company (right) ────────────────
    const headerTop = y;
    let logoBottom = headerTop;

    if (business?.companyLogo) {
      try {
        const logoDataURL = await loadImageAsDataURL(business.companyLogo);
        const logoW = 28;
        const logoH = 21;
        doc.addImage(logoDataURL, "JPEG", margin, headerTop, logoW, logoH);
        logoBottom = headerTop + logoH;
      } catch (imgErr) {
        console.warn("Logo failed to load:", imgErr.message);
      }
    }

    const rightX = pageWidth - margin;
    setBold(14);
    doc.text(business?.companyName || "Company", rightX, headerTop + 5, {
      align: "right",
    });

    setMuted(8);
    const addressParts = [
      business?.shopAddress,
      [business?.companyCity, business?.companyState].filter(Boolean).join(", "),
    ]
      .filter(Boolean)
      .join(" · ");
    const addressLines = doc.splitTextToSize(addressParts, contentWidth * 0.55);
    doc.text(addressLines, rightX, headerTop + 11, { align: "right" });

    let companyInfoY = headerTop + 11 + addressLines.length * 3.5;
    doc.text(
      [business?.email, business?.Tel ? `(${business.Tel})` : ""]
        .filter(Boolean)
        .join("  ·  "),
      rightX,
      companyInfoY,
      { align: "right" },
    );
    companyInfoY += 4;
    setMuted(7.5);
    doc.text(`Raised by: ${bill?.RaiseBy || "—"}`, rightX, companyInfoY, {
      align: "right",
    });

    y = Math.max(logoBottom, companyInfoY) + 8;
    hLine(y);
    y += 8;

    // ── TITLE + WAYBILL NO ───────────────────────────────────
    setBold(16);
    doc.setTextColor(0, 70, 140);
    doc.text("WAYBILL", margin, y);

    setBold(11);
    doc.setTextColor(33, 33, 33);
    doc.text(bill?.WayBillNo || "—", rightX, y, { align: "right" });

    y += 6;
    hLine(y);
    y += 8;

    // ── CUSTOMER (left) + META (right) ───────────────────────
    const colLeftW = contentWidth * 0.52;
    const colRightW = contentWidth * 0.42;
    const rightColX = pageWidth - margin - colRightW;

    setMuted(7);
    doc.text("DELIVER TO", margin, y);
    setBold(11);
    doc.text(
      (bill?.customerName || customer?.Username || "Customer").toUpperCase(),
      margin,
      y + 5,
    );

    setNormal(8);
    let custY = y + 10;
    const billingLines = doc.splitTextToSize(
      customer?.billingAddress || customer?.shopAddress || "N/A",
      colLeftW,
    );
    doc.text(billingLines, margin, custY);
    custY += billingLines.length * 3.6 + 1;

    doc.text(`Phone: ${customer?.phone || customer?.Tel || "N/A"}`, margin, custY);
    custY += 4;
    doc.text(
      `Contact: ${customer?.contactPerson || bill?.customerName || "N/A"}`,
      margin,
      custY,
    );
    custY += 4;
    setMuted(7.5);
    doc.text(`Printed: ${moment().format("DD MMM YYYY, HH:mm")}`, margin, custY);

    autoTable(doc, {
      startY: y - 2,
      margin: { left: rightColX, right: margin },
      tableWidth: colRightW,
      body: [
        [
          { content: "Status Ref", styles: { fontStyle: "bold" } },
          `${(bill?.billStatus || "INV").slice(0, 3).toUpperCase()}/${bill?.billReferenceNo || "—"}`,
        ],
        [
          { content: "Order Date", styles: { fontStyle: "bold" } },
          bill?.startDate
            ? moment(bill.startDate).format("DD MMM YYYY")
            : "—",
        ],
        [
          { content: "Delivery Date", styles: { fontStyle: "bold" } },
          bill?.DELIVERYDATE
            ? moment(bill.DELIVERYDATE).format("DD MMM YYYY")
            : "—",
        ],
        [
          { content: "Status", styles: { fontStyle: "bold" } },
          bill?.billStatus || "—",
        ],
      ],
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: { top: 1.5, bottom: 1.5, left: 2, right: 2 },
        textColor: [40, 40, 40],
      },
      columnStyles: {
        0: { cellWidth: colRightW * 0.42, textColor: [90, 90, 90] },
        1: { cellWidth: colRightW * 0.58, halign: "right" },
      },
    });

    y = Math.max(custY, doc.lastAutoTable.finalY) + 8;

    // ── ITEMS TABLE ──────────────────────────────────────────
    const orderRows = (bill?.orders || [])
      .filter((entry) => Number(entry.Qty) > 0 || Number(entry.pcsReq) > 0)
      .map((ord, i) => [
        String(i + 1),
        ord.item?.Name || "—",
        ord.item?.ADCcode || ord.item?.ACDcode || "—",
        String(ord.Qty ?? 0),
        String(ord.pcsReq ?? 0),
      ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["#", "Product", "Code", "Cases", "Pcs"]],
      body:
        orderRows.length > 0
          ? orderRows
          : [["—", "No items", "—", "—", "—"]],
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        valign: "middle",
        lineColor: [220, 220, 220],
        lineWidth: 0.2,
        textColor: [40, 40, 40],
      },
      headStyles: {
        fillColor: [0, 82, 155],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 8,
        cellPadding: 3,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 28, halign: "center" },
        3: { cellWidth: 18, halign: "center" },
        4: { cellWidth: 16, halign: "center" },
      },
      didDrawPage: (data) => {
        const ph = doc.internal.pageSize.getHeight();
        const pw = doc.internal.pageSize.getWidth();
        const pageNo = doc.internal.getCurrentPageInfo().pageNumber;

        doc.setDrawColor(210, 210, 210);
        doc.setLineWidth(0.3);
        doc.line(margin, ph - 16, pw - margin, ph - 16);

        // Invoice policy (left)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(
          business?.invoicePolicy || "Thank you for your business.",
          margin,
          ph - 11,
          { maxWidth: pw * 0.45 },
        );

        // Branding (center)
        doc.setFont("helvetica", "bold");
        doc.setFontSize(7.5);
        doc.setTextColor(0, 82, 155);
        doc.text("Powered by badesolutions.com.ng", pw / 2, ph - 11, {
          align: "center",
        });

        // Page number (right)
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7);
        doc.setTextColor(120, 120, 120);
        doc.text(`Page ${pageNo}`, pw - margin, ph - 11, { align: "right" });
      },
    });

    y = doc.lastAutoTable.finalY + 10;

    // ── ACKNOWLEDGEMENT / SIGNATURES ─────────────────────────
    const sigBlockHeight = 62;
    if (y + sigBlockHeight > pageHeight - 22) {
      doc.addPage();
      y = margin + 4;
    }

    setBold(9);
    doc.setTextColor(0, 70, 140);
    doc.text("ACKNOWLEDGEMENT", margin, y);
    y += 3;
    hLine(y);
    y += 6;

    const sigRows = [
      ["Approved By (Sign & Date)", ""],
      ["Supplied By (Sign & Date)", ""],
      ["Checked By (Sign & Date)", ""],
      [
        "Driver Name / Sign & Date",
        bill?.DriverName ? `${bill.DriverName}` : "",
      ],
      [
        "Vehicle Number",
        bill?.vehicleNumber ? String(bill.vehicleNumber) : "",
      ],
      ["Customer Sign & Date", ""],
      [
        "Comment",
        bill?.DeliveryComment ? String(bill.DeliveryComment) : "",
      ],
    ];

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      body: sigRows.map(([label, value]) => [
        {
          content: label,
          styles: { fontStyle: "bold", textColor: [70, 70, 70] },
        },
        {
          content: value || "________________________________",
          styles: { textColor: value ? [33, 33, 33] : [160, 160, 160] },
        },
      ]),
      theme: "plain",
      styles: {
        fontSize: 8,
        cellPadding: { top: 3.2, bottom: 3.2, left: 2, right: 2 },
        lineColor: [230, 230, 230],
        lineWidth: 0.2,
        valign: "middle",
      },
      columnStyles: {
        0: { cellWidth: contentWidth * 0.38 },
        1: { cellWidth: contentWidth * 0.62 },
      },
      didParseCell: (data) => {
        if (data.section === "body") {
          data.cell.styles.lineWidth = {
            bottom: 0.25,
            top: 0,
            left: 0,
            right: 0,
          };
          data.cell.styles.lineColor = [220, 220, 220];
        }
      },
    });

    // ── Output ───────────────────────────────────────────────
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    const win = window.open(url, "_blank");

    if (win) {
      win.onload = () => {
        Swal.close();
        win.focus();
        win.print();
      };
    } else {
      doc.save(`${bill?.WayBillNo || bill?.customerName || "waybill"}.pdf`);
      Swal.close();
    }
  } catch (error) {
    console.error("Error generating Waybill:", error);
    ErrorMessage?.(error?.message || "Failed to generate waybill");
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
      const res = await api.post(
        `/api/Recalled/invoice/${orderId}?option=${option}`,
        { id: orderId, ops: opCode }, // ops code in the body, never the URL
        {
          headers: {
            "idempotency-key": `recalled-${option}-${Singlebill._id}`,
          },
        },
      );

      const result = res.data || {};

      if (res.ok) {
        SuccessToast(result.message);

        if (result.Updatedinvoice) {
          setSinglebill(Dencrypt(result.Updatedinvoice));
        }

        Router.refresh();
      } else {
        throw new Error(result.error || res.error || "Request failed");
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
      const res = await api.patch(
        `/api/SingleReturn/${orderId}?option=${option}`,
        { id: orderId, ops: opCode }, // ops code in the body, never the URL
      );

      const result = res.data || {};

      if (res.ok) {
        SuccessToast(result.message);

        if (result.Updatedinvoice) {
          setSinglebill(Dencrypt(result.Updatedinvoice));
        }
      } else {
        throw new Error(result.error || res.error || "Request failed");
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
      const res = await api.patch(
        `/api/REQToDRAFT/${orderId}?option=${option}`,
        { id: orderId, ops: opCode }, // ops code in the body, never the URL
        {
          headers: {
            "idempotency-key": `Requisitions-${orderId}`,
          },
        },
      );

      const result = res.data || {};

      if (res.ok) {
        SuccessToast(result.message);
        Router.push(
          `/${path.auth}/V4/${path.Module}/${path.Module}/Draft/${orderId}`,
        );
      } else {
        throw new Error(result.error || res.error || "Request failed");
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
            <div className="text-sm space-y-1 min-w-0 break-words">
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
                  <span className="hidden sm:inline">
                    Cancel {Singlebill.billStatus}/{Singlebill.billReferenceNo}
                  </span>
                  <span className="sm:hidden">Cancel</span>
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
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
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
                      className="w-full px-2 py-1.5 border border-border rounded text-center bg-background text-base sm:text-sm"
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
                        className="w-full px-2 py-1.5 border border-border rounded text-center bg-background text-base sm:text-sm"
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
                        href={safeUrl(Singlebill.deliveryOption?.receipt)}
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