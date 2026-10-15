import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";

// Amounts may arrive as numbers, numeric strings ("1,200.50") or Mongo
// Decimal128 JSON ({ $numberDecimal: "1200.5" }).
export function toNumber(value) {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "object" && "$numberDecimal" in value) {
    return toNumber(value.$numberDecimal);
  }
  const n = parseFloat(String(value).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const amountFormatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// "-₦1,234.50" — sign before the symbol, always two decimals.
export function formatAmount(value, symbol = "") {
  const n = toNumber(value);
  const sign = n < 0 ? "-" : "";
  return `${sign}${symbol}${amountFormatter.format(Math.abs(n))}`;
}

// jsPDF's built-in fonts can't draw most currency symbols (₦, ₵, ₹ …), so the
// PDF labels the column with an ISO code instead.
const SYMBOL_TO_CODE = {
  "₦": "NGN",
  $: "USD",
  "US$": "USD",
  "€": "EUR",
  "£": "GBP",
  "₵": "GHS",
  "GH₵": "GHS",
  KSh: "KES",
  R: "ZAR",
  "¥": "JPY",
  "₹": "INR",
  CFA: "XOF",
};

function currencyLabel(symbol) {
  if (!symbol) return "";
  if (SYMBOL_TO_CODE[symbol]) return SYMBOL_TO_CODE[symbol];
  // Plain-ASCII symbols render fine as they are.
  return /^[\x20-\x7E]+$/.test(symbol) ? symbol : "";
}

function loadImage(src, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    const timer = setTimeout(() => reject(new Error("logo timed out")), timeoutMs);
    img.crossOrigin = "anonymous";
    img.onload = () => {
      clearTimeout(timer);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d").drawImage(img, 0, 0);
      resolve({ dataUrl: canvas.toDataURL("image/png"), width: img.width, height: img.height });
    };
    img.onerror = () => {
      clearTimeout(timer);
      reject(new Error("logo failed to load"));
    };
    img.src = src;
  });
}

/**
 * Builds and downloads a one-month income statement.
 * @param {object} args
 * @param {object} args.totals   snapshot.totals from /api/Generate/profitandLoss
 * @param {number} args.year
 * @param {number} args.monthIndex 0-11
 * @param {object} args.business userData.business
 * @param {string} args.currencySymbol
 */
export async function downloadIncomeStatement({
  totals = {},
  year,
  monthIndex,
  business = {},
  currencySymbol = "",
}) {
  const period = moment({ year, month: monthIndex, day: 1 });
  const code = currencyLabel(currencySymbol);
  const amt = (v) => formatAmount(v, "");

  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;

  // Header
  let textX = margin;
  if (business.companyLogo) {
    try {
      const logo = await loadImage(business.companyLogo);
      const h = 18;
      const w = Math.min(40, (logo.width / logo.height) * h);
      doc.addImage(logo.dataUrl, "PNG", margin, 12, w, h);
      textX = margin + w + 6;
    } catch (err) {
      console.warn("Income statement: logo skipped:", err.message);
    }
  }

  doc.setFont("helvetica", "bold").setFontSize(15).setTextColor(17, 24, 39);
  doc.text(business.companyName || "", textX, 18);

  const address = [business.shopAddress, business.companyCity, business.companyState]
    .filter(Boolean)
    .join(", ");
  doc.setFont("helvetica", "normal").setFontSize(9).setTextColor(107, 114, 128);
  if (address) doc.text(address, textX, 24);

  doc.setFont("helvetica", "bold").setFontSize(13).setTextColor(17, 24, 39);
  doc.text("Income Statement", margin, 42);
  doc.setFont("helvetica", "normal").setFontSize(10).setTextColor(75, 85, 99);
  doc.text(`For the month ended ${period.clone().endOf("month").format("D MMMM YYYY")}`, margin, 48);

  // Body
  const t = totals;
  const section = (label) => ({ label, section: true });
  const line = (label, value, opts = {}) => ({ label, value, ...opts });

  const lines = [
    line("Revenue", t.revenue),
    line("Less: Sales returns", t.salesReturns, { indent: true }),
    section("Cost of goods sold"),
    line("Opening inventory", t.OpeningInvntry, { indent: true }),
    line("Add: Net purchases", t.netPurchase, { indent: true }),
    line("Add: Goods in transit", t.gitTotal, { indent: true }),
    line("Cost of goods available for sale", t.COGAS, { indent: true, subtotal: true }),
    line("Less: Closing inventory", t.closingInvntry, { indent: true }),
    line("Cost of goods sold", t.COGS, { subtotal: true }),
    line("Gross profit", t.grossProfit, { total: true }),
    line("Operating expenses", t.operatingExpenses),
    line("EBIT", t.ebit, { total: true }),
    line("Other income", t.otherIncome),
    line("Interest", t.interest),
    line("Taxes", t.taxes),
    line("Net profit", t.netIncome, { grand: true }),
  ];

  autoTable(doc, {
    startY: 56,
    margin: { left: margin, right: margin },
    head: [["", code ? `Amount (${code})` : "Amount"]],
    body: lines.map((l) => [
      { content: l.indent ? `    ${l.label}` : l.label, styles: {} },
      { content: l.section ? "" : amt(l.value) },
    ]),
    theme: "plain",
    styles: { font: "helvetica", fontSize: 10, cellPadding: { top: 2.2, bottom: 2.2, left: 2, right: 2 }, textColor: [31, 41, 55] },
    headStyles: { fontStyle: "bold", textColor: [17, 24, 39], fillColor: [243, 244, 246] },
    columnStyles: { 1: { halign: "right", cellWidth: 55 } },
    didParseCell: (data) => {
      if (data.section !== "body") return;
      const l = lines[data.row.index];
      if (l.section) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.textColor = [75, 85, 99];
      }
      if (l.subtotal || l.total || l.grand) data.cell.styles.fontStyle = "bold";
      if (l.total || l.grand) data.cell.styles.fillColor = [249, 250, 251];
      if (l.grand) {
        data.cell.styles.fontSize = 11.5;
        if (data.column.index === 1 && toNumber(l.value) < 0) {
          data.cell.styles.textColor = [185, 28, 28];
        }
      }
    },
    didDrawCell: (data) => {
      if (data.section !== "body") return;
      const l = lines[data.row.index];
      const { x, y, width, height } = data.cell;
      doc.setDrawColor(209, 213, 219).setLineWidth(0.2);
      if (l.subtotal || l.total) doc.line(x, y, x + width, y);
      if (l.grand) {
        doc.setDrawColor(17, 24, 39).setLineWidth(0.3);
        doc.line(x, y, x + width, y);
        // Double rule under the bottom line.
        doc.line(x, y + height, x + width, y + height);
        doc.line(x, y + height + 0.8, x + width, y + height + 0.8);
      }
    },
  });

  // Footer on every page
  const pages = doc.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.getHeight();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal").setFontSize(8).setTextColor(156, 163, 175);
    doc.text(`Generated ${moment().format("D MMM YYYY, HH:mm")} - B.A.D.E ERP`, margin, pageHeight - 10);
    doc.text(`Page ${i} of ${pages}`, pageWidth - margin, pageHeight - 10, { align: "right" });
  }

  const slug = (business.companyName || "Company").trim().replace(/[^A-Za-z0-9]+/g, "-");
  doc.save(`Income-Statement_${slug}_${period.format("YYYY-MM")}.pdf`);
}
