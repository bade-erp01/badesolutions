// The customer transaction statement PDF. Used by the ERP's customer page
// (V4/[Module]/crm/[id]) and the Sales Portal's customer page, so both
// produce exactly the same document.

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import { loadImageAsDataURL } from "./common";

const fmt = (n) =>
  n?.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// Builds the statement and returns the jsPDF document.
// transactions: the rows from /api/customerReport/:id?Start=&End=.
export async function buildCustomerStatementPdf(
  { business, cust, startDate, endDate, transactions },
  { loadImage = loadImageAsDataURL } = {},
) {
  let imageDataURL = null;
  if (business?.companyLogo) {
    try {
      imageDataURL = await loadImage(business.companyLogo, "B.A.D.E");
    } catch {
      // statement without the logo
    }
  }

  const doc = new jsPDF();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Transaction Statement`, 20, 20);
  doc.text(`Customer: ${cust.Username}`, 20, 30);
  doc.text(`Period: ${startDate} to ${endDate}`, 20, 35);
  doc.setFontSize(8);
  doc.text(`Current Balance: ${fmt(cust.Debt)}`, 20, 42);
  if (imageDataURL) doc.addImage(imageDataURL, "PNG", 150, 10, 35, 35);

  const headers = [["#", "Reference No", "Date", "CR", "DR", "Balance"]];
  const rows = transactions.map((tx, i) => [
    i + 1,
    String(tx.ReferenceNo ?? "").toUpperCase(),
    moment(new Date(tx.Date)).format("YYYY-MM-DD"),
    fmt(tx.CreditAmount),
    fmt(tx.DebitAmount),
    fmt(tx.Balance),
  ]);

  rows.push(["", "Current Balance", "", "", "", fmt(cust.Debt)]);

  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 50,
    theme: "grid",
    styles: { fontSize: 7, cellPadding: 3 },
    headStyles: {
      fillColor: [0, 102, 204],
      textColor: 255,
      fontStyle: "bold",
    },
    didParseCell: function (data) {
      if (data.row.index === rows.length - 1) {
        data.cell.styles.fontStyle = "bold";
        data.cell.styles.fillColor = [230, 240, 255];
      }
    },
  });

  return doc;
}

// Builds the statement and downloads it.
export async function saveCustomerStatementPdf(input) {
  const doc = await buildCustomerStatementPdf(input);
  doc.save(`${input.startDate}-${input.endDate}-Statement-${input.cust.Username}.pdf`);
}
