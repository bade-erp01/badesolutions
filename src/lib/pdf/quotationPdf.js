// The quotation PDF for a draft sales order (requisition). Used by the ERP's
// draft page (V4/[Module]/Sales/Draft/[id]) and the Sales Portal's requisition
// page, so both print exactly the same document.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import QRCode from "qrcode";
import moment from "moment";
import { totalInWords } from "../../../Functions/Functions";
import { loadImageAsDataURL, openPdfForPrint } from "./common";

// Builds the quotation and returns the jsPDF document.
// business: the signed-in user's business; customer: bill.customer;
// billData: the bill from /api/Invoice/:id (orders, totals, customerName).
export async function buildQuotationPdf(
  business,
  customer,
  billData,
  { loadImage = loadImageAsDataURL } = {},
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const BLACK = [25, 25, 25];
  const DARK = [45, 45, 45];
  const GREY = [105, 105, 105];
  const LIGHT_GREY = [225, 225, 225];
  const VERY_LIGHT = [248, 248, 248];
  const WHITE = [255, 255, 255];

  const safeNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : 0;
  };

  const money = (value) => {
    return safeNumber(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const drawLine = (y, x1 = 10, x2 = pageWidth - 10) => {
    doc.setDrawColor(...LIGHT_GREY);
    doc.setLineWidth(0.25);
    doc.line(x1, y, x2, y);
  };

  let logoWidth = 0;

  if (business.companyLogo) {
    try {
      const logo = await loadImage(business.companyLogo);

      doc.addImage(logo, "JPEG", 10, 10, 28, 20, undefined, "FAST");

      logoWidth = 34;
    } catch {
      console.warn("Logo failed to load");
    }
  }

  const companyX = 10 + logoWidth;

  doc.setTextColor(...BLACK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);

  doc.text(business.companyName || "", companyX, 15);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);

  const address = [business.shopAddress, business.companyCity, business.companyState]
    .filter(Boolean)
    .join(", ");

  if (address) {
    doc.text(address, companyX, 20);
  }

  if (business.email) {
    doc.text(business.email, companyX, 24.5);
  }

  if (business.Tel) {
    doc.text(`Tel: ${business.Tel}`, companyX, 29);
  }

  drawLine(39);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...BLACK);

  doc.text("QUOTATION", 10, 47);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);

  doc.text(`Print Date: ${moment().format("DD MMM YYYY")}`, 10, 53);

  let currentY = 63;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);

  doc.text("QUOTATION FOR", 10, currentY);

  currentY += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...BLACK);

  doc.text(
    (billData?.customerName || customer?.companyName || "").toUpperCase(),
    10,
    currentY,
  );

  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...GREY);

  if (customer?.billingAddress) {
    doc.text(customer.billingAddress, 10, currentY);

    currentY += 4;
  }

  if (customer?.phone) {
    doc.text(`Phone: ${customer.phone}`, 10, currentY);

    currentY += 4;
  }

  doc.text(
    `Contact: ${customer?.contactPerson || billData?.customerName || "N/A"}`,
    10,
    currentY,
  );

  try {
    const qrDataURL = await QRCode.toDataURL("https://badesolutions.com.ng", {
      margin: 1,
      width: 150,
    });

    doc.addImage(qrDataURL, "PNG", pageWidth - 38, 43, 26, 26);
  } catch {
    console.warn("QR code failed");
  }

  currentY = 87;

  autoTable(doc, {
    startY: currentY,
    margin: {
      left: 10,
      right: 10,
    },
    head: [["#", "PRODUCT / DESCRIPTION", "CODE", "PRICE", "PROMO", "CASE", "PCS", "VAT", "TOTAL"]],
    body: (billData.orders || []).map((ord, index) => [
      index + 1,
      ord.item?.Name || "N/A",
      ord.item?.ACDcode || ord.item?.ADCcode || "N/A",
      money(ord.priceListPrice),
      money(ord.promotionData),
      safeNumber(ord.Qty),
      safeNumber(ord.pcsReq),
      money(ord.item?.VAT?.$numberDecimal ?? ord.item?.VAT ?? 0),
      money(ord.total),
    ]),
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 7,
      textColor: DARK,
      lineColor: [215, 215, 215],
      lineWidth: 0.2,
      cellPadding: 2.2,
      valign: "middle",
    },
    headStyles: {
      fillColor: BLACK,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 6.5,
      halign: "center",
      valign: "middle",
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: VERY_LIGHT,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: "center" },
      1: { cellWidth: 45, fontStyle: "bold" },
      2: { cellWidth: 22, halign: "center" },
      3: { cellWidth: 20, halign: "right" },
      4: { cellWidth: 19, halign: "right" },
      5: { cellWidth: 13, halign: "center" },
      6: { cellWidth: 13, halign: "center" },
      7: { cellWidth: 18, halign: "right" },
      8: { cellWidth: 24, halign: "right", fontStyle: "bold" },
    },
  });

  currentY = doc.lastAutoTable.finalY + 8;

  const summaryWidth = 78;
  const summaryX = pageWidth - 10 - summaryWidth;

  if (currentY > pageHeight - 90) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...BLACK);

  doc.text("QUOTATION SUMMARY", summaryX, currentY);

  currentY += 4;

  drawLine(currentY, summaryX, pageWidth - 10);

  currentY += 6;

  const taxRate = safeNumber(billData.taxRate);
  const subtotal = safeNumber(billData.subTotal);
  const discount = safeNumber(billData.discount);
  const grandTotal = safeNumber(billData.grandTotal);

  const summaryRow = (label, value, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 8 : 7.5);
    doc.setTextColor(...(bold ? BLACK : GREY));

    doc.text(label, summaryX, currentY);
    doc.text(value, pageWidth - 10, currentY, { align: "right" });

    currentY += bold ? 7 : 5.5;
  };

  summaryRow("Tax Rate", `${taxRate.toFixed(2)}%`);
  summaryRow("Subtotal", money(subtotal));
  summaryRow("Discount", money(discount));

  doc.setFillColor(...BLACK);

  doc.roundedRect(summaryX - 2, currentY - 2, summaryWidth + 2, 12, 1.5, 1.5, "F");

  doc.setTextColor(...WHITE);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);

  doc.text("TOTAL QUOTATION", summaryX + 2, currentY + 5.5);
  doc.text(money(grandTotal), pageWidth - 12, currentY + 5.5, { align: "right" });

  currentY += 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);

  doc.text("AMOUNT IN WORDS", 10, currentY);

  currentY += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...DARK);

  const amountWords = totalInWords(grandTotal, business.currency?.currency);

  const words = doc.splitTextToSize(amountWords || "N/A", pageWidth - 20);

  doc.text(words, 10, currentY);

  currentY += words.length * 4 + 8;

  if (business.invoicePolicy) {
    const policyLines = doc.splitTextToSize(business.invoicePolicy, pageWidth - 28);

    const policyHeight = policyLines.length * 4 + 10;

    doc.setFillColor(...VERY_LIGHT);

    doc.roundedRect(10, currentY, pageWidth - 20, policyHeight, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...BLACK);

    doc.text("TERMS / QUOTATION POLICY", 15, currentY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...GREY);

    doc.text(policyLines, 15, currentY + 11);

    currentY += policyHeight + 8;
  }

  if (currentY > pageHeight - 55) {
    doc.addPage();
    currentY = 25;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);

  doc.text("AUTHORIZATION", 10, currentY);

  currentY += 9;

  const signatureWidth = 75;

  doc.setDrawColor(...DARK);
  doc.setLineWidth(0.3);

  doc.line(10, currentY + 12, 10 + signatureWidth, currentY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...GREY);

  doc.text(business.companyName || "Authorized Representative", 10, currentY + 17);

  const customerSignatureX = pageWidth - 10 - signatureWidth;

  doc.line(customerSignatureX, currentY + 12, pageWidth - 10, currentY + 12);

  doc.text("Customer Signature & Date", customerSignatureX, currentY + 17);

  const totalPages = doc.internal.getNumberOfPages();

  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);

    doc.setDrawColor(...LIGHT_GREY);
    doc.setLineWidth(0.25);

    doc.line(10, pageHeight - 16, pageWidth - 10, pageHeight - 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.setTextColor(...GREY);

    doc.text(`Quotation generated by ${business.companyName || "Business"}`, 10, pageHeight - 10);

    doc.text(`Page ${page} of ${totalPages}`, pageWidth - 10, pageHeight - 10, {
      align: "right",
    });
  }

  return doc;
}

// Builds the quotation, opens it in a new tab and starts printing (or
// downloads it when pop-ups are blocked). `onOpen` runs once it is shown.
export async function printQuotationPdf(business, customer, billData, { onOpen } = {}) {
  const doc = await buildQuotationPdf(business, customer, billData);

  openPdfForPrint(doc, `${billData.customerName || "quotation"}-quotation.pdf`, onOpen);
}
