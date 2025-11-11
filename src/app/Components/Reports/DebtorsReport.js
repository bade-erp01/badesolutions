"use client";
import Swal from "sweetalert2";
import moment from "moment";
import { useState } from "react";
import { downloadExcel } from "../../../../Functions/Functions";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function DebtorsReportModal({ data, business, users }) {
  const [debtorsList] = useState((data || []).filter((customer) => customer.Debt > 0));

  // get salesperson
  const FilterSaLePerson = (id) => {
    try {
      const SP = users.find((user) => user._id === id);
      return `${SP.firstName} ${SP.lastName}` || "N/A";
    } catch (err) {
      return "N/A";
    }
  };

  // get pricelist
  const FilterPriceList = (pricelist) => {
    try {
      switch (pricelist) {
        case "Pricelist1":
          return business.priceList1;
        case "Pricelist2":
          return business.priceList2;
        case "Pricelist3":
          return business.priceList3;
        case "Pricelist4":
          return business.priceList4;
        case "Pricelist5":
          return business.priceList5;
        case "Pricelist6":
          return business.priceList6;
        case "Pricelist7":
          return business.priceList7;
        default:
          return "N/A";
      }
    } catch (err) {
      return "N/A";
    }
  };

  function normalizeDate(value) {
    if (!value) return null;
    const isSerial = typeof value === "number" || /^\d+(\.\d+)?$/.test(value);
    if (isSerial) {
      const serial = parseFloat(value);
      const baseDate = moment("1899-12-30");
      const days = Math.floor(serial);
      const timeFraction = serial - days;
      const date = baseDate.clone().add(days, "days");
      const time = moment.duration(timeFraction * 24, "hours");
      return date.add(time).format("YYYY-MM-DD HH:mm:ss");
    }
    return moment(value).isValid() ? moment(value).format("YYYY-MM-DD HH:mm:ss") : "Invalid date";
  }

  const calculateDebtDays = (lastPayDate) => {
    if (!lastPayDate) return "N/A";
    const today = moment();
    const normalized = normalizeDate(lastPayDate);
    const lastPayment = moment(normalized);
    return today.diff(lastPayment, "days");
  };

  const generateTableRows = (list) => {
    return list.sort((a, b) => a.Username.trim().localeCompare(b.Username.trim()))
      .map(
        (item, index) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 4px;">${index + 1}</td>
          <td style="padding: 4px;">${item.Username}</td>
          <td style="padding: 4px;">${FilterPriceList(item.priceList)}</td>
          <td style="padding: 4px;">${item.CustomerCode || ""}</td>
          <td style="padding: 4px;">${FilterSaLePerson(item.salesPerson)}</td>
          <td style="padding: 4px;">${item.phone}</td>
          <td style="padding: 4px;">${(item.Debt || 0).toLocaleString()}</td>
          <td style="padding: 4px;">${item.creditLimit}</td>
          <td style="padding: 4px;">${normalizeDate(item.lastPayDate)}</td>
          <td style="padding: 4px;">${calculateDebtDays(item.lastPayDate)}</td>
        </tr>
      `
      )
      .join("");
  };

  const showModal = () => {
    Swal.fire({
      title: "Debtors Report",
      html: `
        <div style="margin-bottom: 10px; display: flex; gap: 10px;">
          <div style="flex: 1;">
            <label style="font-size: 12px; font-weight: 600;">Debtors</label><br/>
            <select id="customerFilter" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
              <option value="">All</option>
              ${debtorsList.sort((a, b) => a.Username.trim().localeCompare(b.Username.trim())).map((cust) => `<option value="${cust._id}">${cust.Username}</option>`).join("")}
            </select>
          </div>
           <div style="flex: 1;">
            <label style="font-size: 12px; font-weight: 600;">Rep</label><br/>
            <select id="salePersonFilter" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
              <option value="">All</option>
              ${users.sort((a, b) => a.firstName.trim().localeCompare(b.firstName.trim())).map((user) => `<option value="${user._id}">${user.firstName} ${user.lastName}</option>`).join("")}
            </select>
          </div>
          <div style="flex: 1;">
            <label style="font-size: 12px; font-weight: 600;">Debt Days</label><br/>
            <select id="debtDaysFilter" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
              <option value="">All</option>
              <option value="0-30">Current (0–30 days)</option>
              <option value="31-60">31–60 Days</option>
              <option value="61-90">61–90 Days</option>
              <option value="90+">Over 90 Days</option>
            </select>
          </div>
           <div style="flex: 1;">
            <label style="font-weight: 600; font-size: 12px;">PriceList</label><br/>
            <select id="PriceList" style="padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px; width: 100%;">
             <option value="">All</option>
             <option value="Pricelist1">${business.priceList1}</option>
             <option value="Pricelist2">${business.priceList2}</option>
             <option value="Pricelist3">${business.priceList3}</option>
             <option value="Pricelist4">${business.priceList4}</option>
             <option value="Pricelist5">${business.priceList5}</option>
             <option value="Pricelist6">${business.priceList6}</option>
             <option value="Pricelist7">${business.priceList7}</option>
            </select>
          </div>
        </div>
        <div style="overflow-x: auto; max-height: 280px;">
          <table style="width:100%; border-collapse: collapse; font-size: 12px;">
            <thead style="background-color: #edf2f7;">
              <tr>
                <th style="padding: 4px;">#</th>
                <th style="padding: 4px;">Customer</th>
                <th style="padding: 4px;">PriceList</th>
                <th style="padding: 4px;">Code</th>
                <th style="padding: 4px;">Rep</th>
                <th style="padding: 4px;">Phone</th>
                <th style="padding: 4px;">Debt</th>
                <th style="padding: 4px;">Credit Limit</th>
                <th style="padding: 4px;">Last Payment</th>
                <th style="padding: 4px;">Debt Days</th>
              </tr>
            </thead>
            <tbody id="debtorsTableBody"></tbody>
            <tfoot>
              <tr style="background-color: #f0f0f0; font-weight: bold;">
                <td colspan="5">Total Debt</td>
                <td id="totalDebtCell"></td>
                <td colspan="4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <div style="margin-top: 12px; text-align: right;">
          <button id="downloadDebtorsExcel" style="background-color: #2b6cb0; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px;">
            Download Excel
          </button>
          <button id="downloadDebtorsPDF" style="background-color: #e53e3e; color: white; padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 13px; margin-left: 10px;">
            Download PDF
          </button>
        </div>
      `,
      width: "80%",
      showConfirmButton: false,
      didOpen: () => {
        const tableBody = document.getElementById("debtorsTableBody");
        const totalDebtCell = document.getElementById("totalDebtCell");

        const applyFilters = () => {
          const selectedCustomer = document.getElementById("customerFilter").value;
          const selectedDebtRange = document.getElementById("debtDaysFilter").value;
          const selectedSalePerson = document.getElementById("salePersonFilter").value;
          const selectedPriceList = document.getElementById("PriceList").value;

          const filtered = debtorsList.filter((cust) => {
            const debtDays = calculateDebtDays(cust.lastPayDate);

            const matchCustomer = !selectedCustomer || cust._id === selectedCustomer;
            const matchSalePerson = !selectedSalePerson || cust.salesPerson === selectedSalePerson;
            const matchPriceList = !selectedPriceList || cust.priceList === selectedPriceList;

            const debtRanges = {
              "0-30": (days) => days >= 0 && days <= 30,
              "31-60": (days) => days > 30 && days <= 60,
              "61-90": (days) => days > 60 && days <= 90,
              "90+": (days) => days > 90,
            };

            const matchDebtDays = selectedDebtRange
              ? debtRanges[selectedDebtRange]?.(debtDays) ?? true
              : true;

            return matchCustomer && matchSalePerson && matchDebtDays && matchPriceList;
          });

          tableBody.innerHTML = generateTableRows(filtered);

          const totalDebt = filtered.reduce((sum, cust) => sum + parseFloat(cust.Debt || 0), 0);
          totalDebtCell.textContent = Number(totalDebt.toFixed(2)).toLocaleString();

          // Excel download uses the current filtered list
          document.getElementById("downloadDebtorsExcel").onclick = () => {
            const clean = filtered.map((entry) => ({
              Customer: entry.Username,
              PriceList: FilterPriceList(entry.priceList),
              Rep: FilterSaLePerson(entry.salesPerson),
              Code: entry.CustomerCode,
              Phone: entry.phone,
              State: entry.State,
              Email: entry.Email,
              Debt: entry.Debt?.toLocaleString(),
              "Credit Limit": entry.creditLimit,
              "Last Payment": normalizeDate(entry.lastPayDate),
              "Debt Days": calculateDebtDays(entry.lastPayDate),
              "Contact Person": entry.ContactPerson,
            }));
            clean.push({ Customer: "TOTAL", Debt: totalDebt.toFixed(2) });

            const excelBtn = downloadExcel(clean, `Debtors Report`);
            if (excelBtn instanceof HTMLElement) {
              excelBtn.click();
            }
          };

          // PDF download uses the current filtered list (create new doc each time)
            document.getElementById("downloadDebtorsPDF").onclick = () => {
            // create landscape A4 PDF for better table width
            const doc = new jsPDF("landscape", "pt", "a4");
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = { top: 70, left: 40, right: 40, bottom: 40 };
            const usableWidth = pageWidth - margin.left - margin.right;
            const centerX = pageWidth / 2;

            // header: business name, title, timestamp, optional logo
            doc.setFontSize(16);
            doc.setTextColor("#2c3e50");
            const businessName = business?.companyName || "Business";
            // center business name
            doc.text(businessName, centerX, 36, { align: "center" });

            doc.setFontSize(12);
            doc.setTextColor("#34495e");
            doc.text(`Debtors Report`, centerX, 54, { align: "center" });

            doc.setFontSize(10);
            doc.setTextColor("#6b7280");
            const genText = `Generated: ${moment().format("YYYY-MM-DD HH:mm:ss")}`;
            // right aligned timestamp within margins
            doc.text(genText, pageWidth - margin.right, 30, { align: "right" });

            // try to draw logo if provided as data URL (place it within top-right margin but inside usable area)
            try {
              const logoData = business?.companyLogo;
              if (logoData && typeof logoData === "string" && logoData.startsWith("data:image")) {
              const imgTypeMatch = logoData.match(/^data:image\/(png|jpeg|jpg)/i);
              const imgType = imgTypeMatch ? imgTypeMatch[1].toUpperCase() : "PNG";
              const logoW = 60;
              const logoH = 30;
              const logoX = pageWidth - margin.right - logoW;
              const logoY = 8;
              doc.addImage(logoData, imgType, logoX, logoY, logoW, logoH);
              }
            } catch (err) {
              // ignore logo errors
            }

            // Prepare table data
            const tableData = filtered
              .sort((a, b) => a.Username.trim().localeCompare(b.Username.trim()))
              .map((entry, index) => [
              index + 1,
              entry.Username,
              FilterPriceList(entry.priceList),
              FilterSaLePerson(entry.salesPerson),
              entry.CustomerCode || "",
              entry.phone || "",
              entry.State || "",
              Number(parseFloat(entry.Debt || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              Number(entry.creditLimit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
              moment(normalizeDate(entry.lastPayDate) || "").isValid()
                ? moment(normalizeDate(entry.lastPayDate)).format("DD-MM-YYYY")
                : "",
              calculateDebtDays(entry.lastPayDate),
              ]);

            // column headers
            const head = [["#", "Customer", "PriceList", "Rep", "Code", "Phone", "State", "Debt", "Credit Limit", "Last Payment", "Days"]];

            // generate a formatted total string
            const totalDebtFormatted = Number(totalDebt.toFixed(2)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // draw table with better styling and margins so it stays inside page
            autoTable(doc, {
              startY: margin.top,
              margin: { left: margin.left, right: margin.right, top: margin.top, bottom: margin.bottom },
              head,
              body: tableData,
              styles: {
              fontSize: 9,
              cellPadding: 6,
              overflow: "linebreak",
              valign: "middle",
              },
              headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              halign: "center",
              },
              alternateRowStyles: { fillColor: [245, 247, 250] },
              columnStyles: {
              0: { cellWidth: 30, halign: "center" },   // #
              1: { cellWidth: 100 },                     // Customer
              2: { cellWidth: 50 },                      // PriceList
              3: { cellWidth: 100 },                     // Rep
              4: { cellWidth: 50 },                      // Code
              5: { cellWidth: 70 },                      // Phone
              6: { cellWidth: 50 },                      // State
              7: { cellWidth: 80, halign: "right" },     // Debt
              8: { cellWidth: 80, halign: "right" },     // Credit Limit
              9: { cellWidth: 80, halign: "center" },    // Last Payment
              10: { cellWidth: 50, halign: "center" },   // Days
              },
              // ensure table width does not exceed usable area
              tableWidth: usableWidth,
              theme: "striped",
              didDrawPage: (dataArg) => {
              // footer with page number
              const pageCount = doc.internal.getNumberOfPages();
              const pageNumber = dataArg.pageNumber || pageCount;
              const pageStr = "Page " + pageNumber + " / " + pageCount;
              doc.setFontSize(9);
              doc.setTextColor("#7f8c8d");
              doc.text(pageStr, pageWidth - margin.right, pageHeight - 10, { align: "right" });

              // if last page, place total debt below the table (inside margins)
              const isLastPage = pageNumber === pageCount;
              if (isLastPage) {
                const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : dataArg.cursor?.y || dataArg.startY;
                const yPos = Math.min(finalY + 10, pageHeight - margin.bottom - 5);
                doc.setFontSize(11);
                doc.setTextColor("#2c3e50");
                doc.text(`Total Debt: ${totalDebtFormatted}`, margin.left, yPos);
              }
              },
            });

            // save PDF
            doc.save(`Debtors_Report_${moment().format("YYYYMMDD_HHmmss")}.pdf`);
            };
        };

        // Attach filter listeners for all filters so table updates whenever any filter changes
        ["customerFilter", "debtDaysFilter", "salePersonFilter", "PriceList"].forEach((id) => {
          const el = document.getElementById(id);
          if (el) el.addEventListener("change", applyFilters);
        });

        // Initial render
        applyFilters();
      },
    });
  };

  return (
    <button
      onClick={showModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <ArrowTrendingUpIcon className="w-4 h-4 inline-block" />
      Generate Debtors Report
    </button>
  );
}
