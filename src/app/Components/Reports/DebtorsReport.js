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
    return list
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
              ${debtorsList.map((cust) => `<option value="${cust._id}">${cust.Username}</option>`).join("")}
            </select>
          </div>
           <div style="flex: 1;">
            <label style="font-size: 12px; font-weight: 600;">Rep</label><br/>
            <select id="salePersonFilter" style="width: 100%; padding: 4px; font-size: 12px; border: 1px solid #cbd5e0; border-radius: 4px;">
              <option value="">All</option>
              ${users.map((user) => `<option value="${user._id}">${user.firstName} ${user.lastName}</option>`).join("")}
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
          // format to 2 decimals then localize
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
            const doc = new jsPDF();
            doc.setFontSize(14);
            doc.text(`Debtors Report as at ${moment().format("YYYY-MM-DD HH:mm:ss")}`, 14, 20);

            doc.setFontSize(12);
            doc.text(
              `Total Debt: ${filtered
                .filter((c) => c.Debt > 0)
                .reduce((acc, curr) => acc + parseFloat(curr.Debt || 0), 0)
                .toLocaleString()}`,
              14,
              28
            );

            const tableData = filtered
              .sort((a, b) => a.Username.trim().localeCompare(b.Username.trim()))
              .map((entry, index) => [
                index + 1,
                entry.Username,
                FilterPriceList(entry.priceList),
                FilterSaLePerson(entry.salesPerson),
                entry.CustomerCode || "",
                entry.phone,
                entry.State || "",
                entry.Debt?.toLocaleString(),
                entry.creditLimit,
                moment(normalizeDate(entry.lastPayDate) || "").format("DD-MM-YYYY"),
                calculateDebtDays(entry.lastPayDate),
              ]);

            autoTable(doc, {
              startY: 34,
              head: [["#", "Name", "PriceList","Rep", "Code", "Phone", "State", "Debt", "Limit", "Last Payment", "Days"]],
              body: tableData,
              styles: { fontSize: 10 },
              theme: "grid",
            });
            doc.save("Debtors_Report.pdf");
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
