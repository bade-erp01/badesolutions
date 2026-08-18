"use client";

import { useParams } from "next/navigation";
import Swal from "sweetalert2";
import TextToSpeechPlayer from "@/app/Components/TextToSpeech";
import Image from "next/image";
import CustomerSales from "@/app/Components/CustomerSales";
import autoTable from "jspdf-autotable";
import InvoicePaymentForm from "@/app/Components/PaymentWithInv";
import Link from "next/link";
import {
  postPayment,
  pricelistSetter,
  EXPRESS_PRIVATE_URL,
  Dencrypt,
} from "../../../../../../../Functions/Functions";
import { useState } from "react";
import DaySelector from "@/app/Components/Datepicker";
import BackButton from "@/app/Components/BackBotton";
import { Printer } from "lucide-react";
import {
  plsWait,
  Encrypt,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../Functions/Mics";
import axios from "axios";
import moment from "moment";
import { useRouter } from "next/navigation";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import { useEffect } from "react";
import AgingReportDownloader from "@/app/Components/Reports/SingleAging";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { PrinterIcon, WalletIcon, FileText, Plus } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function CustomerForm({
  userInfo,
  data,
  cust,
  salesPerson,
  PriceList,
}) {
  const router = useParams();
  const navigation = useRouter();
  const [States] = useState(data.AllStates || []);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setisOpen2] = useState(false);
  const [isOpen3, setisOpen3] = useState(false);
  const [isOpen4, setisOpen4] = useState(false);
  const [isOpen5, setisOpen5] = useState(false);
  const [BalanceData, setBalanceData] = useState({
    Debt: Number(cust.Debt),
  });
  const [creditLimit, setcreditLimit] = useState(Number(cust.creditLimit));

  const [formData, setFormData] = useState({
    bankJournal: "",
    ...cust,
  });
  const [preview, setPreview] = useState(cust.Image);
  const [attachment, setAttachment] = useState(null);
  const Sales = data.Bills || [];

  // for pagintaion
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(data.transcations.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = data.transcations.slice(indexOfFirstRow, indexOfLastRow);

  const salespers = salesPerson.find(
    (person) => person._id.toString() === cust.salesPerson?.toString(),
  );
  const repName = salespers
    ? `${salespers.firstName} ${salespers.lastName || ""}`
    : "Unknown";

  // for tts
  function getCustomerSummary(customer) {
    if (!customer) return "Invalid customer data.";

    const {
      Username,
      totalDebt = customer.Debt || 0,
      lastPayDate,
      purchaseHistory = customer.SandS || [],
    } = customer;

    const isOwing = totalDebt > 0;

    const formattedDate = lastPayDate
      ? new Date(lastPayDate).toLocaleDateString("en-NG", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      : "No payment recorded";

    let advice = "";

    if (!lastPayDate) {
      advice =
        "No payment history detected. Consider initiating engagement with a welcome offer, starter bundle, or introductory discount to build trust.";
    } else if (isOwing && totalDebt > 100000) {
      advice =
        "Customer has a high outstanding balance. Recommend a structured repayment plan, possibly with milestone-based incentives to encourage timely settlement.";
    } else if (isOwing && totalDebt > 50000) {
      advice =
        "Customer owes a significant amount. A loyalty-based discount or flexible payment option may improve recovery and retention.";
    } else if (isOwing && totalDebt <= 5000) {
      advice =
        "Minor outstanding balance. A gentle reminder or automated nudge may suffice to prompt payment.";
    } else if (!isOwing && purchaseHistory.length >= 5) {
      advice =
        "Customer demonstrates strong purchasing behavior. Consider offering exclusive access to premium products, early-bird promotions, or a referral incentive.";
    } else if (!isOwing && purchaseHistory.length >= 3) {
      advice =
        "Customer is consistent and reliable. Upselling complementary products or bundling services could enhance value and increase average order size.";
    } else if (!isOwing && purchaseHistory.length === 1) {
      advice =
        "Customer has made a single purchase. Follow up with a personalized recommendation or limited-time offer to encourage repeat business.";
    } else {
      advice =
        "Maintain regular communication, and consider seasonal campaigns or loyalty perks to deepen engagement.";
    }

    return `
     Customer Profile: ${Username}

     Account Summary:
    - Current Balance: ₦${totalDebt?.toLocaleString()}.
    - Last Payment Date: ${formattedDate},

    Strategic Insight:
    ${advice}
    `;
  }

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
    return moment(value).isValid()
      ? moment(value).format("YYYY-MM-DD HH:mm:ss")
      : null;
  }

  const calculateDebtDays = (lastPayDate) => {
    const normalized = normalizeDate(lastPayDate);
    if (!normalized) return null;
    const today = moment();
    const lastPayment = moment(normalized);
    return today.diff(lastPayment, "days");
  };

  if (!cust) {
    return <p className="text-center">Customer data not found.</p>;
  }

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print this document");
      return;
    }

    printWindow.document.write(`
<html>
<head>
<title>Letter of Allocation</title>

<style>
@page{
    size:A4;
    margin:20mm;
}

body{
    font-family:Arial, Helvetica, sans-serif;
    color:#222;
    line-height:1.7;
    padding:20px;
}

.watermark{
    position:fixed;
    top:45%;
    left:50%;
    transform:translate(-50%,-50%) rotate(-35deg);
    font-size:85px;
    color:rgba(0,0,0,.06);
    font-weight:bold;
    white-space:nowrap;
    z-index:-1;
}

.header{
    text-align:center;
    border-bottom:3px solid #000;
    padding-bottom:20px;
    margin-bottom:30px;
}

.header h1{
    margin:0;
    font-size:32px;
}

.info{
    margin-bottom:25px;
}

.info p{
    margin:4px 0;
}

.property{
    border:2px solid #000;
    background:#f8f8f8;
    padding:20px;
    margin:30px 0;
}

.property h2{
    margin-top:0;
}

.signature{
    margin-top:80px;
    display:flex;
    justify-content:space-between;
}

.sign{
    width:260px;
    border-top:1px solid #000;
    text-align:center;
    padding-top:8px;
}

.footer{
    margin-top:60px;
    border-top:1px dashed #999;
    padding-top:15px;
    text-align:center;
    font-size:13px;
}
</style>

</head>

<body>

<div class="watermark">
ABC ESTATES
</div>

<div class="header">
<h1>LETTER OF ALLOCATION</h1>
<p><strong>Reference No:</strong> LOA/2026/00125</p>
</div>

<div class="info">
<p><strong>Date:</strong> 31 July 2026</p>
<p><strong>Allottee:</strong> Mr. John Doe</p>
<p><strong>Address:</strong> Plot 15, Admiralty Way, Lekki, Lagos.</p>
</div>

<p>Dear Sir/Madam,</p>

<h3>RE: LETTER OF ALLOCATION OF PROPERTY</h3>

<p>
We are pleased to inform you that following your successful application
and fulfillment of all necessary financial obligations, you have been
allocated the property described below.
</p>

<div class="property">

<h2>Allocated Property</h2>

<p><strong>Estate:</strong> Green Valley Estate</p>

<p><strong>Plot Number:</strong> Plot 42</p>

<p><strong>Block:</strong> Block C</p>

<p><strong>Property Type:</strong> Residential Plot</p>

<p><strong>Plot Size:</strong> 600 Square Metres</p>

<p><strong>Location:</strong> Green Valley Estate, Abuja, Nigeria.</p>

</div>

<p>
This allocation is made subject to the Terms and Conditions governing
ownership within the Estate. You are expected to commence development
within the stipulated period in accordance with the Estate Development
Guidelines and all applicable laws.
</p>

<p>
Kindly preserve this Letter of Allocation as it forms part of the
official documentation relating to your ownership of the above-mentioned
property.
</p>

<p>
Congratulations on your successful allocation. We appreciate your
confidence in our organization and look forward to serving you.
</p>

<div class="signature">

<div class="sign">
Authorized Signatory
</div>

<div class="sign">
Managing Director
</div>

</div>

<div class="footer">

<strong>ABC ESTATES LIMITED</strong><br>

Corporate Headquarters<br>

No. 10 Estate Avenue, Central Business District, Abuja, Nigeria.<br>

Email: info@abcestates.com | Tel: +234 800 000 0000

</div>

</body>

</html>
`);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 600);
  };

  // update customer balance
  const UpdateCustomerBalance = async (value, field) => {
    try {
      const result = await Swal.fire({
        title:
          "<strong class='text-xl font-semibold'>Confirm Sensitive Operation</strong>",
        html: `
        <div class="text-sm  space-y-2 text-left">
          <p>You are about to <span class="font-medium text-gray-900">update a customer's financial balance</span>.</p>
          <p>This action is <span class="text-red-600 font-semibold">irreversible</span> and may affect financial records.</p>
          <p>Please verify the amount and customer details before proceeding.</p>
        </div>
      `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#22c55e", // Tailwind green-500
        cancelButtonColor: "#f97316", // Tailwind orange-500
        confirmButtonText:
          "<span class='text-white font-medium'><i class='fas fa-check-circle mr-1'></i> Yes, Proceed!</span>",
        cancelButtonText:
          "<span class='text-white font-medium'><i class='fas fa-times-circle mr-1'></i> Cancel</span>",
        // backdrop: `
        //   rgba(0,0,0,0.4)
        //   url("https://cdn.jsdelivr.net/gh/sweetalert2/sweetalert2@11/assets/swal2-logo.png")
        //   left top
        //   no-repeat
        // `,
        customClass: {
          popup: "rounded-lg shadow-lg",
          confirmButton: "bg-green-500 hover:bg-green-600 px-4 py-2 rounded",
          cancelButton: "bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded",
        },
      });

      if (!result.isConfirmed) return;

      plsWait("Please wait...This should only take a bit.");

      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/update/customer/balance/${Encrypt(
          userInfo.user._id,
        )}/${Encrypt(cust._id)}/${field}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
            access: `${Encrypt(userInfo.user._id)}`,
            sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
          },
          body: JSON.stringify({
            id: Encrypt(cust._id),
            Debt: value,
            creditLimit: value,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        SuccessToast(data.message);
        navigation.refresh();
      } else {
        throw new Error(data.error || "Update Failed");
      }
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  let jsPDF;
  if (typeof window !== "undefined") {
    jsPDF = require("jspdf").jsPDF;
  }

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
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Semi-transparent white
        ctx.globalAlpha = 0.5; // Semi-transparent watermark
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 10); // Centered horizontally, 10px from bottom

        // Convert to PNG
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Image loading failed"));
      img.src = src;
    });
  };

  async function GenerateSummary(customerId) {
    const { value: formValues } = await Swal.fire({
      title: "Generate Statement",
      html: `
      <input id="report-start" type="date" class="swal2-input" placeholder="Start Date"/>
      <input id="report-end" type="date" class="swal2-input" placeholder="End Date"/>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Generate",
      preConfirm: () => {
        const startDate = document.getElementById("report-start").value;
        const endDate = document.getElementById("report-end").value;
        if (!startDate || !endDate) {
          Swal.showValidationMessage("Please select both dates");
        }
        return { startDate, endDate };
      },
    });

    if (!formValues) return;

    Swal.fire({
      title: "Fetching report…",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const { startDate, endDate } = formValues;
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/customerReport/${customerId}?Start=${startDate}&End=${endDate}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
            access: `${Encrypt(userInfo.user._id)}`,
            sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
          },
          cache: "no-store", // Optional: disables caching for fresh data
        },
      );

      const TransactionResult = await res.json();

      if (!res.ok || TransactionResult.length < 1) {
        throw new Error(data.error || "No transactions found.");
      }

      Swal.close();

      // 🖼️ Load and watermark image
      const imageDataURL = await loadImageAsDataURL(
        userInfo.business.companyLogo,
        "B.A.D.E",
      );

      const doc = new jsPDF();

      // 🖋️ Header setup
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Transaction Statement`, 20, 20);

      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text(`Customer: ${cust.Username}`, 20, 30);
      doc.text(`Period: ${startDate} to ${endDate}`, 20, 35);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text(
        `Current Balance: ${cust.Debt?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        20,
        42,
      );

      // 🖼️ Logo
      doc.addImage(imageDataURL, "PNG", 150, 10, 35, 35);

      // 📊 Table data
      const headers = [["#", "Reference No", "Date", "CR", "DR", "Balance"]];
      const rows = TransactionResult.map((tx, i) => [
        i + 1,
        tx.ReferenceNo.toUpperCase(),
        `${moment(new Date(tx.Date)).format("YYYY-MM-DD")}`,
        `${tx.CreditAmount?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        `${tx.DebitAmount?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        `${tx.Balance?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      ]);

      // ➕ Add final "Current Balance" row
      rows.push([
        "", // Empty index
        "Current Balance",
        "", // Empty CR
        "", // Empty DR
        "",
        `${cust.Debt?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
      ]);

      // 📋 Table with page footer and styled final row
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 50,
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
        margin: { top: 50 },

        // 🎨 Highlight the last row
        didParseCell: function (data) {
          const isLastRow = data.row.index === rows.length - 1;
          if (isLastRow) {
            data.cell.styles.fontStyle = "bold";
            data.cell.styles.fillColor = [230, 240, 255];
            data.cell.styles.textColor = [0, 0, 102];
          }
        },

        // 📄 Footer with timestamp and branding
        didDrawPage: function (data) {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          const pageWidth = pageSize.width || pageSize.getWidth();
          const pageNumber = doc.internal.getNumberOfPages();

          doc.setFontSize(7);
          doc.text(
            `Generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}`,
            20,
            pageHeight - 10,
          );
          doc.text(
            `visit: badesolutions.com.ng`,
            pageWidth - 60,
            pageHeight - 10,
          );
          doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, {
            align: "center",
          });
        },
      });

      // 💾 Save the document
      doc.save(`${startDate}-${endDate}-Statement-${cust.Username}.pdf`);

      SuccessToast("Your report has been saved.");
    } catch (err) {
      ErrorMessage(err.message);
    }
  }

  // Use a single config object for axios
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
      access: `${Encrypt(userInfo.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
    },
  };

  // Initialize form data (bankJournal may not exist on cust)

  // Prepare monthly sales data from data.SandS (array of invoices)
  // Prepare monthly sales data for Jan-Dec (month-on-month)
  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthLabel = new Date(0, i)?.toLocaleString("default", {
      month: "short",
    }); // "Jan", "Feb", etc.
    // Sum all grandTotal for this month
    const total = Array.isArray(data.SandS)
      ? data.SandS.reduce((sum, item) => {
          const dateStr = item.createdAt || item.startDate;
          if (dateStr) {
            const d = new Date(dateStr);
            if (d.getMonth() + 1 === monthNum) {
              return sum + (item.grandTotal || 0);
            }
          }
          return sum;
        }, 0)
      : 0;
    return { month: monthLabel, amount: total };
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "file") {
      if (name === "Image") {
        const file = files[0];
        if (file) {
          setPreview(URL.createObjectURL(file));
          setFormData((prev) => ({ ...prev, Image: file }));
        }
      }
      if (name === "attachment") {
        setAttachment(files[0]);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // console.log("Submitting customer update:", formData, attachment);
    // TODO: POST/PATCH to API using FormData for files
    try {
      plsWait("Submitting customer update...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const url = `${EXPRESS_PRIVATE_URL}/api/customer/update/${Encrypt(
        cust._id,
      )}`;
      // Await axios call directly
      const { data } = await axios.patch(url, formData, config);

      if (data && data.message) {
        SuccessToast(data.message);
        navigation.refresh();
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  const handleCreateInvoice = async () => {
    plsWait(
      "Hold tight — we’re preparing everything for you. This won’t take long ⏳ Please don’t refresh or leave this page.",
    );

    try {
      // Use destructuring for required IDs
      const user = userInfo;

      // Avoid unnecessary template literals
      const url = `${EXPRESS_PRIVATE_URL}/api/SalesDraft/${Encrypt(user.user._id)}`;

      // Await axios call directly
      const { data } = await axios.post(
        url,
        { customer: cust._id, whId: cust.location },
        config,
      );

      // Handle response (redirect or update UI as needed)
      // Redirect to the new invoice page
      if (data && data.result) {
        // Simulate a delay for the sake of example
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigation.push(
          `/${router.auth}/V4/Sales/Sales/Draft/${Encrypt(data.result)}`,
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
      // Prefer error.message fallback
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  const updateServiceLocation = async () => {
    try {
      plsWait(
        "Updating service location... Please wait This may take a moment.",
      );
      const url = `${EXPRESS_PRIVATE_URL}/api/customer/update/${Encrypt(cust._id)}`;
      const { data } = await axios.patch(
        url,
        { location: formData.location },
        config,
      );
      if (data && data.message) {
        SuccessToast(data.message);
        navigation.refresh();
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-full shadow-2xl border-0 space-y-8 text-xs items-center p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-smitalic">
            Registration Date:{" "}
            {moment(cust.createdAt).format("dddd DD MMMM YYYY [at] hh:mm A")}
          </span>
        </div>
        <span
          className={`px-5 py-1.5 rounded-full font-semibold text-base tracking-wide shadow-sm border ${
            cust.Debt < 0
              ? "text-md text-green-700 bg-green-100 border border-green-600 rounded-full px-4 py-2"
              : "text-md text-red-700 bg-red-100 border border-red-300 rounded-full px-4 py-2"
          }`}
        >
          {cust.Debt?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* Avatar & Attachment */}
      <div className="flex flex-wrap gap-8 items-center py-4">
        {/* Avatar */}
        <div className="flex items-center space-x-6">
          <div className="w-28 h-28 rounded overflow-hiddenshadow-sm border-2 flex items-center justify-center bg-gray-700/60">
            {cust.image ? (
              <Image
                width={40}
                height={40}
                src={
                  cust.image ||
                  "https://img.icons8.com/glyph-neue/64/gender-neutral-user.png"
                }
                loading="eager"
                quality={100}
                alt="Avatar"
                className="w-full h-full object-cover "
              />
            ) : (
              <span className="text-lg font-semibold">No Image</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Profile Image
            </label>
            <input
              type="file"
              name="Image"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-24 border-l border-gray-200 mx-6"></div>

        {/* Attachment */}
        <div className="flex-1 min-w-[220px] hidden lg:block">
          <label className="block text-sm font-medium mb-1">
            Attach Document
          </label>
          <input
            type="file"
            name="attachment"
            onChange={handleChange}
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {attachment && (
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <svg
                className="w-4 h-4 text-green-500 inline"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>
                Selected: <strong>{attachment.name}</strong>
              </span>
            </p>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Section title="⚙️ Quick Actions">
        <div className="flex flex-wrap gap-3">
          {/* Create Invoice */}
          {userInfo.user.raiseInvoice &&
            !cust.blocked &&
            cust.location &&
            cust.priceList && (
              <Button
                onClick={handleCreateInvoice}
                variant="default"
                size="sm"
                type="button"
                className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Invoice
              </Button>
            )}

          {/* Print Statement */}
          <Button
            onClick={() => GenerateSummary(Encrypt(cust._id))}
            variant="outline"
            type="button"
            size="sm"
            className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <PrinterIcon className="w-4 h-4" />
            Print Statement
          </Button>

          {/* {userInfo.user.isDev && (
            <Button
              size="sm"
              variant="outline"
              className="gap-2 p-2"
              onClick={handlePrint}
              type="button"
            >
              <Printer className="w-5 h-5" />
              Print Allocation Letter
            </Button>
          )} */}

          {/* Register Down Payment */}
          {userInfo.user.postPayment && !cust.blocked && cust.BankJournal && (
            <>
              <Button
                onClick={() =>
                  postPayment(
                    Encrypt(cust._id),
                    `${userInfo.user.firstName} ${userInfo.user.lastName}`,
                    config,
                  )
                }
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
              >
                <WalletIcon className="w-4 h-4" />
                Register Down Payment
              </Button>

              {/* Invoice Payment Form - Only Standard Plan */}
              {userInfo.business.subscriptionplan === "Standard" && (
                <InvoicePaymentForm
                  customerId={Encrypt(cust._id)}
                  user={`${userInfo.user.firstName} ${userInfo.user.lastName}`}
                  config={config}
                  invoices={Sales.filter(
                    (inv) =>
                      inv.billStatus !== "Cancelled" &&
                      inv.paymentMethod < inv.grandTotal,
                  )}
                  baseUrl={EXPRESS_PRIVATE_URL}
                />
              )}
            </>
          )}

          {/* Aging Report */}
          {userInfo.business.subscriptionplan === "Standard" && (
            <AgingReportDownloader
              customer={cust}
              invoices={Sales}
              payments={data.transcations}
              Rep={repName}
            />
          )}

          {/* Text to Speech */}
          <TextToSpeechPlayer text={`${getCustomerSummary(cust)}`} />

          {cust.phone && ( 
            <Link
              href={`https://wa.me/${cust.phone.replace(/\D/g, "")}`}
              target="_blank"
              title={`chat with ${cust.Username} on whatsApp.`}
              rel="noopener noreferrer"
              className="flex items-center gap-2 transition-all"
            >
              <img
                src="https://img.icons8.com/color/48/whatsapp.png"
                alt="WhatsApp"
                width={30}
                height={30}
                className="w-7 h-7"
                priority
                quality={75}
              />
            </Link>
          )} 
        </div>
      </Section>

      {/* dashboard*/}
      <Section
        title={`🗿 Quick view for ${cust.Username}.`}
        className="lg:col-span-2"
      >
        <div className="">
          <DashboardStats
            cust={cust}
            todaysSale={data.SandS.reduce(
              (acc, item) => acc + Number(item.grandTotal || 0),
              0,
            )}
          />
        </div>
      </Section>

      {/* Sales Insight */}
      <Section
        title={`Month-on-Month Sales Insight for ${cust.Username}.`}
        className="lg:col-span-2"
      >
        <div className="">
          <GenerealSalesMargin yearlysales={data.SandS} warehouses={[]} />
        </div>
      </Section>

      <div className="border rounded-lg overflow-hidden ">
        <span
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex justify-between items-center text-left font-medium transition"
        >
          <h2 className="text-base/7 font-semibold">Form</h2>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
        <div
          className={` transition-all duration-300 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <div className="p-3">
            {/* Identity */}
            <Section title="Identity">
              <Grid>
                <Input
                  label="Business Name"
                  name="Username"
                  value={formData.Username}
                  onChange={handleChange}
                />
                <Input
                  label="Customer Code"
                  name="CustomerCode"
                  value={formData.CustomerCode}
                  onChange={handleChange}
                  disabled
                  readonly
                />
                <Input
                  label="Tax Identification Number"
                  name="TIN"
                  value={formData.TIN}
                  onChange={handleChange}
                />
                <Input
                  label="Industry"
                  name="industryType"
                  value={formData.industryType}
                  onChange={handleChange}
                />
                <div>
                  <label className="block text-sm font-medium">
                    Customer Type
                  </label>
                  <select
                    name="customerType"
                    value={formData.customerType || ""}
                    onChange={handleChange}
                    className="mt-1 w-full border text-gray-300 border-gray-300 px-3 py-2 rounded-md"
                  >
                    <option className="text-red-600" value={cust.customerType}>
                      {cust.customerType || "Choose..."}
                    </option>
                    <option value="Business">Business</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </Grid>
            </Section>

            {/* Contact Info */}
            <Section title="Contact Info">
              <Grid>
                <Input
                  label="Email"
                  name="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleChange}
                />
                <Input
                  label="Phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <Input
                  label="Contact Person"
                  name="contactPerson"
                  type="text"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </Grid>
            </Section>

            {/* Location */}
            <Section title="Location">
              <Grid columns={3}>
                <Input
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />

                <Select
                  label="State"
                  name="state"
                  value={formData.state || formData.State}
                  onChange={handleChange}
                  options={States}
                />
                <Input
                  label="Address"
                  name="billingAddress"
                  value={formData.billingAddress || formData.street}
                  onChange={handleChange}
                />
                <Input
                  label="Region"
                  name="Region"
                  value={formData.Region}
                  onChange={handleChange}
                />
                <Input
                  label="merchandiser"
                  name="merchandiser"
                  value={formData.merchandiser}
                  onChange={handleChange}
                />
                <Input
                  label="latitude"
                  name="latitude"
                  value={formData.latitude || ""}
                  onChange={handleChange}
                />
                <Input
                  label="longitude"
                  name="longitude"
                  value={formData.longitude || ""}
                  onChange={handleChange}
                />
              </Grid>
            </Section>

            {/* Financials */}
            <Section
              title="Financials"
              subtitle="(Manage credit, debt, and payment settings)"
            >
              <Grid columns={3}>
                {userInfo.user.isAdmin ? (
                  <div className="mb-2 ">
                    <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-gray-200">
                      <label className="block text-sm font-semibold  tracking-wide">
                        {cust.lastPayDate &&
                        cust.Debt > 0 &&
                        moment(cust.lastPayDate).isValid()
                          ? `Debt incurred: ${moment().diff(
                              moment(cust.lastPayDate),
                              "days",
                            )} day(s) ago`
                          : "Not in Debt"}
                      </label>
                      <input
                        type="number"
                        step={`any`}
                        value={BalanceData.Debt}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/,/g, "");
                          const parsed = parseFloat(raw) || 0;
                          setBalanceData((prev) => ({
                            ...prev,
                            Debt: parsed,
                          }));
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md  shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                      />

                      <span
                        onClick={() =>
                          UpdateCustomerBalance(BalanceData.Debt, "Debt")
                        }
                        className="mt-5 inline-block w-full text-center py-2 px-4 rounded-md font-semibold bg-red-600 hover:bg-red-800 transition-colors duration-200 shadow-md cursor-pointer"
                      >
                        Update Balance
                      </span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-2">
                      <label className="block text-sm font-semibold tracking-wide">
                        {cust.lastPayDate &&
                        cust.Debt > 0 &&
                        moment(cust.lastPayDate).isValid()
                          ? `Debt incurred: ${moment().diff(
                              moment(cust.lastPayDate),
                              "days",
                            )} day(s) ago`
                          : "Not in Debt"}
                      </label>

                      <div className="w-full px-4 py-2 border border-gray-200 rounded-lg  shadow-inner font-medium text-base tracking-wide">
                        {formData.Debt?.toLocaleString()}
                      </div>
                    </div>
                  </>
                )}

                {cust.isVerified && (
                  <>
                    {userInfo.user.EditCreditLimit ? (
                      <div className="mb-2 ">
                        <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg border border-gray-200">
                          <label className="block text-sm font-semibold tracking-wide">
                            Credit Limit
                          </label>
                          <input
                            type="number"
                            step={`any`}
                            min={0}
                            defaultValue={formData.creditLimit}
                            onBlur={(e) => {
                              const raw = e.target.value
                                .replace(/,/g, "")
                                .trim();
                              let parsed = parseFloat(raw) || 0;

                              // Ensure non-negative
                              if (e.target.value < 0) {
                                ErrorMessage(
                                  "Value less than 0 is not allowed",
                                );
                                return (e.target.value = 0);
                              }

                              setcreditLimit((prev) => ({
                                ...prev,
                                creditLimit: parsed,
                              }));
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-mdshadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                          />

                          <span
                            onClick={() =>
                              UpdateCustomerBalance(creditLimit, "creditLimit")
                            }
                            className="mt-5 inline-block w-full text-center py-2 px-4 rounded-md font-semibold bg-green-500 hover:bg-green-600 transition-colors duration-200 shadow-md cursor-pointer"
                          >
                            Update credit Limit
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mb-2">
                          <label className="block text-sm font-semibold tracking-wide">
                            Credit Limit
                          </label>

                          <div className="w-full px-4 py-2 border border-gray-200 rounded-lg  shadow-inner font-medium text-base tracking-wide">
                            {formData.creditLimit?.toLocaleString()}
                          </div>
                        </div>
                      </>
                    )}

                    <Input
                      label="Credit Rating"
                      name="creditRating"
                      type="number"
                      value={formData.creditRating || 0}
                      min={0}
                      max={5}
                      onChange={handleChange}
                    />
                  </>
                )}
                <div>
                  <label className="block text-sm font-medium">PriceList</label>
                  <select
                    required
                    name="priceList"
                    value={formData.priceList || ""}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md"
                  >
                    {/* Default option from customer */}
                    <option value={cust.priceList}>
                      {pricelistSetter(cust.priceList, userInfo.business)}
                    </option>

                    {/* Dynamic options based on subscription plan */}
                    {PriceList?.data?.map((pl) => (
                      <option key={pl._id} value={pl.Name}>
                        {pricelistSetter(pl.Name, userInfo.business)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium ">
                    {" "}
                    Payment Terms
                  </label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms || ""}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md"
                  >
                    <option
                      value={cust.paymentTerms}
                      className="italic bg-gray-200"
                    >
                      {cust.paymentTerms || "Select one"}
                    </option>
                    <option value="Cash on Delivery">Cash on Delivery </option>
                    <option value="Credit customer">Credit customer</option>
                    <option value="Payment before delivery">
                      Payment before delivery
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Journal</label>
                  <select
                    required
                    name="BankJournal"
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md"
                  >
                    {(() => {
                      const bankJournal = data.Accounts.find(
                        (person) => person._id === cust.BankJournal,
                      );

                      if (bankJournal) {
                        return (
                          <option defaultValue={bankJournal._id}>
                            {bankJournal.NAME} [CURRENT]
                          </option>
                        );
                      } else {
                        return <option value="">Select one</option>;
                      }
                    })()}

                    {data.Accounts.map((num) => (
                      <option key={num} value={num._id}>
                        {num.NAME}
                      </option>
                    ))}
                  </select>
                </div>
              </Grid>
            </Section>

            {/* Status Flags */}
            <Section title="Status Flags">
              <Grid columns={3}>
                {cust.Email && (
                  <Checkbox
                    label="Send quarterly transaction statement"
                    name="NewsFeedSubscription"
                    checked={formData.NewsFeedSubscription}
                    onChange={handleChange}
                  />
                )}
                <Checkbox
                  label="Verified"
                  name="isVerified"
                  checked={formData.isVerified}
                  onChange={handleChange}
                />
                <Checkbox
                  label={
                    formData.blocked ? "Unblock Customer" : "Block Customer"
                  }
                  name="blocked"
                  checked={formData.blocked}
                  onChange={handleChange}
                />
              </Grid>
            </Section>

            {/* Services */}
            <Section title="🛎 Services">
              <Grid columns={2}>
                <div>
                  <label className="block text-sm font-medium">
                    Sales Person
                  </label>
                  <select
                    name="salesPerson"
                    required
                    value={formData.salesPerson || ""}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md"
                  >
                    {/* Show the current sales person as the first option if available */}
                    {(() => {
                      const salespers = salesPerson.find(
                        (person) => person._id === cust.salesPerson,
                      );
                      if (salespers) {
                        return (
                          <option value={salespers._id}>
                            {salespers.firstName}{" "}
                            {salespers.lastName || "Select one"}
                          </option>
                        );
                      } else {
                        return <option value="">Select one</option>;
                      }
                    })()}

                    {/* List all employees except the current sales person to avoid duplicate */}
                    {salesPerson
                      .filter((num) => num._id !== cust.salesPerson)
                      .map((num) => (
                        <option key={num._id} value={num._id}>
                          {num.firstName} {num.lastName}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Manager</label>
                  <select
                    name="accountManager"
                    value={formData.accountManager || ""}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md "
                  >
                    {/* Show the current sales person as the first option if available */}
                    {(() => {
                      const Manager = salesPerson.find(
                        (person) => person._id === cust.accountManager,
                      );
                      if (Manager) {
                        return (
                          <option value={Manager._id}>
                            {Manager.firstName}{" "}
                            {Manager.lastName || "Select one"}
                          </option>
                        );
                      } else {
                        return <option value="">Select one</option>;
                      }
                    })()}

                    {/* List all employees except the current sales person to avoid duplicate */}
                    {salesPerson
                      .filter((num) => num._id !== cust.accountManager)
                      .map((num) => (
                        <option key={num._id} value={num._id}>
                          {num.firstName} {num.lastName}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">
                    Service Warehouse
                  </label>
                  <select
                    name="location"
                    value={formData.location || ""}
                    required
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md"
                  >
                    {/* Show the current Service Warehouse */}
                    {(() => {
                      const location = data.wh.find(
                        (location) => location._id === cust.location,
                      );
                      if (location) {
                        return (
                          <option value={location._id}>
                            {location.WHName || "Select one"}
                          </option>
                        );
                      } else {
                        return <option value="">Select one</option>;
                      }
                    })()}

                    {/* List all employees except the current sales person to avoid duplicate */}
                    {data.wh
                      .filter((num) => num._id !== cust.location)
                      .map((num) => (
                        <option key={num._id} value={num._id}>
                          {num.WHName}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium">
                    preferred Shipping Method
                  </label>
                  <select
                    name="preferredShippingMethod"
                    value={formData.preferredShippingMethod || ""}
                    onChange={handleChange}
                    className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md"
                  >
                    <option value={cust.preferredShippingMethod}>
                      {cust.preferredShippingMethod || "Select one"}
                    </option>
                    <option value="Air">Air</option>
                    <option value="Sea">Sea</option>
                    <option value="Land">Land</option>
                  </select>
                </div>
                {userInfo.user._id === cust.accountManager &&
                  userInfo.business.subscriptionplan === "Standard" && (
                    <div>
                      <label className="block text-sm font-medium">
                        Assign days /day for sale rep visit
                      </label>
                      <DaySelector
                        useCase="RouteDays"
                        userData={userInfo}
                        baseUrl={EXPRESS_PRIVATE_URL}
                        id={cust._id}
                      />
                    </div>
                  )}

                <div>
                  <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Assign Subscription plan
                  </label>
                  <select
                    name="preferredShippingMethod"
                    value={formData.Subscription?._id || ""}
                    onChange={handleChange}
                    className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900
                                focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                                dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100
                                dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  >
                    <option
                      value=""
                      className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                    >
                      {cust.Subscription?.title || "Select one"}
                    </option>

                    {data?.Subscription?.map((sub) => (
                      <option
                        key={sub._id}
                        value={sub._id}
                        className="bg-white text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      >
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>
              </Grid>
            </Section>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden ">
        <span
          onClick={() => setisOpen2(!isOpen2)}
          className="w-full px-4 py-3 flex justify-between items-center text-left font-medium transition"
        >
          <h2 className="text-base/7 font-semibold">Ledger</h2>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              isOpen2 ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
        <div
          className={`w-full px-4 py-3 transition-all duration-300 ${
            isOpen2 ? "block" : "hidden"
          }`}
        >
          {/* Recent Transactions */}
          <Section title="">
            <Card className="border-0">
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">
                    Transaction History
                  </CardTitle>

                  <CardDescription>
                    {cust.Username} account transactions and balances
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent>
                {data && data.transcations.length > 0 ? (
                  <>
                    {/* TABLE */}
                    <div className="overflow-hidden rounded-2xl border">
                      <Table className="border-0">
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead>Ref No</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Credit</TableHead>
                            <TableHead>Debit</TableHead>
                            <TableHead className="text-right">
                              Balance
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {currentRows.map((tx, idx) => (
                            <TableRow
                              key={idx}
                              className="hover:bg-muted/40 transition-colors"
                            >
                              {/* REF */}
                              <TableCell
                                className="max-w-[250px] truncate font-medium"
                                title={tx.ReferenceNo}
                              >
                                {tx.ReferenceNo.length > 50
                                  ? `${tx.ReferenceNo.substring(0, 50)}...`
                                  : tx.ReferenceNo}
                              </TableCell>

                              {/* DATE */}
                              <TableCell>
                                {moment(tx.Date).format("MMM D, YYYY")}
                              </TableCell>

                              {/* CREDIT */}
                              <TableCell>
                                {tx.CreditAmount > 0 ? (
                                  <Badge
                                    variant="secondary"
                                    className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                                  >
                                    CR: {tx.CreditAmount?.toLocaleString()}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>

                              {/* DEBIT */}
                              <TableCell>
                                {tx.DebitAmount > 0 ? (
                                  <Badge
                                    variant="destructive"
                                    className="bg-rose-500/10 text-black hover:bg-rose-500/20"
                                  >
                                    DR: {tx.DebitAmount?.toLocaleString()}
                                  </Badge>
                                ) : (
                                  "-"
                                )}
                              </TableCell>

                              {/* BALANCE */}
                              <TableCell
                                className={`text-right text-sm font-bold ${
                                  tx.Balance < 0
                                    ? "text-emerald-600"
                                    : "text-foreground"
                                }`}
                              >
                                {tx.Balance?.toLocaleString()}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <ExcelDownloadBtn
                      data={data?.transcations || []}
                      page={`${cust.Username.substring(0, 8)} transaction`}
                    />
                    {/* ALERT */}
                    <div className="mt-6">
                      {cust.Debt < 0 ? (
                        <Alert className="border-purple-300 bg-purple-50">
                          <AlertCircle className="h-4 w-4 text-purple-700" />

                          <AlertTitle className="text-purple-800">
                            Business Debt Notice
                          </AlertTitle>

                          <AlertDescription className="text-purple-700">
                            Kindly note that{" "}
                            <strong>{userInfo.business.companyName}</strong>{" "}
                            owes <strong>{cust.Username}</strong>{" "}
                            <strong>{cust.Debt?.toLocaleString()}</strong>.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-yellow-300 bg-yellow-50">
                          <AlertCircle className="h-4 w-4 text-yellow-700" />

                          <AlertTitle className="text-yellow-800">
                            Outstanding Debt
                          </AlertTitle>

                          <AlertDescription className="text-yellow-700">
                            Kindly note that <strong>{cust.Username}</strong>{" "}
                            owes your business{" "}
                            <strong>{cust.Debt?.toLocaleString()}</strong>.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    {/* PAGINATION */}
                    <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-muted-foreground">
                        Page {currentPage} of {totalPages}
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          type="button"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          Previous
                        </Button>

                        <Button
                          size="sm"
                          type="button"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-2xl border border-dashed">
                    <p className="text-sm italic text-muted-foreground">
                      No recent transactions found.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </Section>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden ">
        <span
          onClick={() => setisOpen3(!isOpen3)}
          className="w-full px-4 py-3 flex justify-between items-center text-left font-medium transition"
        >
          <h2 className="text-base/7 font-semibold">Geo‑coordinates</h2>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              isOpen3 ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
        <div
          className={`px-4 py-3 transition-all duration-300 ${
            isOpen3 ? "block" : "hidden"
          }`}
        >
          {/* Activity Log */}
          <Section title="">
            <div className="rounded-lg p-4 overflow-x-auto">
              {/* display shop location on google maps here */}
              <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
                {cust.latitude && cust.longitude ? (
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.google.com/maps?q=${cust.latitude},${cust.longitude}&z=15&output=embed`}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <iframe
                    title="Customer Location"
                    src={`https://maps.google.com/maps?q=${cust.state}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full"
                    loading="lazy"
                  />
                )}
              </div>
            </div>
          </Section>
        </div>
      </div>

      {/* table for invoices */}
      <div className="border rounded-lg overflow-hidden">
        <span
          onClick={() => setisOpen4(!isOpen4)}
          className="w-full px-4 py-3 flex justify-between items-center text-left font-medium transition"
        >
          <h2 className="text-base/7 font-semibold">Sales Pipeline</h2>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              isOpen4 ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
        <div
          className={`px-4 py-3 transition-all duration-300 ${
            isOpen4 ? "block" : "hidden"
          }`}
        >
          <Section title="">
            <CustomerSales
              Sales={Sales}
              customer={cust}
              business={userInfo.business}
              Rep={salesPerson}
            />
          </Section>
        </div>
      </div>

      {/* help desk */}
      <div className="border rounded-lg overflow-hidden">
        <span
          onClick={() => setisOpen5(!isOpen5)}
          className="w-full px-4 py-3 flex justify-between items-center text-left font-medium transition"
        >
          <h2 className="text-base/7 font-semibold">
            {data.SupportTicket?.length} Support Tickets
          </h2>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              isOpen5 ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </span>
        <div
          className={`px-4 py-3 transition-all duration-300 ${
            isOpen5 ? "block" : "hidden"
          }`}
        >
          <div
            className="mt-5 max-h-96 overflow-y-auto space-y-4 p-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#4B5563 transparent",
            }}
          >
            {data.SupportTicket?.length > 0 ? (
              data.SupportTicket.map((ticket, index) => (
                <div
                  key={index}
                  className="text-xs border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      {/* Avatar/initials */}
                      <div className="p-2 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {ticket.status}
                      </div>
                      <p className="text-xs ">{ticket.TicketId}</p>
                      <p className="text-xs">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                      <div>
                        {ticket.attachments?.length > 0 && (
                          <p className="text-xs">
                            {ticket.attachments.length} attachement
                          </p>
                        )}
                      </div>
                    </div>
                    {/* sla level */}
                    <div className="flex items-center">
                      <div>{ticket.SLA}</div>
                    </div>
                  </div>
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {ticket.comment}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-sm  text-center py-6 border border-dashed border-gray-300 rounded-lg">
                No new support ticket.
              </div>
            )}
          </div>
        </div>
      </div>

      {userInfo.user.editCustomer && (
        <div className="pt-4">
          <button
            type="submit"
            className="bg-green-600 px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
          >
            Save Changes
          </button>
        </div>
      )}

      {/* for invoicer to update only service location of customer  */}
      {userInfo.user.raiseInvoice && !userInfo.user.editCustomer && (
        <div className="pt-4">
          <span
            onClick={updateServiceLocation}
            className="bg-green-600 px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
          >
            Save Changes
          </span>
        </div>
      )}

      <span className="text-sm italic">
        Last updated:{" "}
        {moment(cust.updatedAt).format("dddd DD MMMM YYYY [at] hh:mm A")}
      </span>
    </form>
  );
}

// Reusable UI Components

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function Grid({ children, columns = 2 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
      {children}
    </div>
  );
}

function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  disabled = false,
  readonly = false,
}) {
  return (
    <div>
      <label className="block text-sm font-medium ">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readonly}
        className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md"
      />
    </div>
  );
}

function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  disabled = false,
  readonly = false,
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readonly}
        className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <option value={value}>-- {value} --</option>
        {options.map((opt, index) => (
          <option key={index} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
}

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

function Checkbox({ label, name, checked, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={name}
        checked={!!checked}
        onCheckedChange={(value) => {
          // Mimic native checkbox onChange so your existing handleChange still works
          onChange({
            target: {
              name,
              value,
              type: "checkbox",
              checked: value,
            },
          });
        }}
      />
      <Label htmlFor={name} className="text-sm cursor-pointer">
        {label}
      </Label>
    </div>
  );
}

export function DashboardStats({ todaysSale, cust }) {
  // utility function to calculate days away from today for last transaction date and change badge color accordingly
  const daysAwayFromToday = (targetDate) => {
    // targetDate can be a string like "2026-06-15" or a Date object
    const today = moment().startOf("day"); // normalize to midnight
    const target = moment(targetDate).startOf("day");

    // Difference in days (positive = future, negative = past)
    const diff = target.diff(today, "days");

    return diff;
  };

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <Card>
        <CardHeader>
          <CardTitle>
            <Badge variant="outline" className="bg-green-500/10 text-green-700">
              Total sales transaction
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="my-2" />
          <p className="text-lg font-bold">
            ₦{formatNumberShort(todaysSale || 0)}
          </p>
        </CardContent>
      </Card>

      {cust.lastPayDate !== "" && (
        <Card>
          <CardHeader>
            <CardTitle>
              <Badge variant="outline" className="">
                Last transaction Date
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Separator className="my-2" />
            <Badge variant="secondary" className="text-lg font-bold">
              {daysAwayFromToday(cust.lastPayDate) == 0
                ? `Today`
                : `${Math.abs(daysAwayFromToday(cust.lastPayDate))} day(s) ago`}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Another metric (optional) */}
      <Card>
        <CardHeader>
          <CardTitle>
            <Badge variant="outline" className="">
              Current Balance
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Separator className="my-2" />
          <p className="text-lg font-bold">₦{formatNumberShort(cust.Debt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}

const formatNumberShort = (num) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(3) + " B"; // billions
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(3) + " M"; // millions
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(3) + " K"; // thousands
  }
  return num.toString();
};
