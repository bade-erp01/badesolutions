"use client";

import { useParams } from 'next/navigation';
import Swal from "sweetalert2";
import withReactContent from 'sweetalert2-react-content';
import TextToSpeechPlayer from "@/app/Components/TextToSpeech";
import Image from "next/image"
import autoTable from "jspdf-autotable";
import {
  postPayment,
  // GenerateSummary,
  EXPRESS_PRIVATE_URL,
  Dencrypt,
} from "../../../../../../../Functions/Functions";
import { useState } from "react";
import { Line } from "react-chartjs-2";
import {  PrinterIcon,CalendarDaysIcon,BanknotesIcon } from "@heroicons/react/24/outline";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { plsWait, Encrypt,ErrorMessage,SuccessToast } from "../../../../../../../Functions/Mics";
import axios from "axios";
import moment from "moment";
import {useRouter} from 'next/navigation'
import ExcelDownloadBtn from '@/app/Components/ExcelDownloadBtn';
import {useEffect} from 'react'
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

export default function CustomerForm({ userInfo, data, cust,}) {
  const router = useParams();
  const navigation = useRouter()
  const [BalanceData, setBalanceData] = useState({
    Debt: Number(cust.Debt)
  });
  const [formData, setFormData] = useState({
    bankJournal: "",
    ...cust,
  });
  const [preview, setPreview] = useState(cust.Image );
  const [attachment, setAttachment] = useState(null);

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

     Available Actions:
    - Update customer details  
    - Create invoices  
    - Print account statements  
    - Schedule activities  
    - View sales trends  
    - Review ledger activities  
    - Register payments  

     Account Summary:
    - Current Balance: ₦${totalDebt.toLocaleString()}
    - Currently Owing: ${isOwing ? "Yes" : "No"}
    - Last Payment Date: ${formattedDate}

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
}


  if (!cust) {
    return (
      <p className="text-center text-gray-500">Customer data not found.</p>
    );
  }


  // update customer balance
const UpdateCustomerBalance = async (value) => {
  try {
    const result = await Swal.fire({
      title: "<strong class='text-xl font-semibold text-gray-800'>Confirm Sensitive Operation</strong>",
      html: `
        <div class="text-sm text-gray-700 space-y-2 text-left">
          <p>You are about to <span class="font-medium text-gray-900">update a customer's financial balance</span>.</p>
          <p>This action is <span class="text-red-600 font-semibold">irreversible</span> and may affect financial records.</p>
          <p>Please verify the amount and customer details before proceeding.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#22c55e", // Tailwind green-500
      cancelButtonColor: "#f97316",  // Tailwind orange-500
      confirmButtonText: "<span class='text-white font-medium'><i class='fas fa-check-circle mr-1'></i> Yes, Proceed!</span>",
      cancelButtonText: "<span class='text-white font-medium'><i class='fas fa-times-circle mr-1'></i> Cancel</span>",
      // backdrop: `
      //   rgba(0,0,0,0.4)
      //   url("https://cdn.jsdelivr.net/gh/sweetalert2/sweetalert2@11/assets/swal2-logo.png")
      //   left top
      //   no-repeat
      // `,
      customClass: {
        popup: 'rounded-lg shadow-lg',
        confirmButton: 'bg-green-500 hover:bg-green-600 px-4 py-2 rounded',
        cancelButton: 'bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded'
      }
    });

    if (!result.isConfirmed) return;

    plsWait('Please wait...This should only take a bit.');

    const response = await fetch(`${EXPRESS_PRIVATE_URL}/api/update/customer/balance/${Encrypt(userInfo.user._id)}/${cust._id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cust._id, Debt: value }),
    });

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


  // sheduleActivity
  // components/ScheduleActivityAlert.js

const MySwal = withReactContent(Swal);

  const scheduleActivity = async () => {
  MySwal.fire({
    title: '<span class="text-xl font-semibold text-gray-800">Schedule an Activity</span>',
    html: `
      <div class="flex flex-col gap-4 text-left text-gray-700">
        <label for="swal-select1" class="text-sm font-medium">Activity</label>
        <select id="swal-select1" class="swal2-input bg-gray-100 border border-gray-300 rounded-md px-3 py-2">
          <option value="" disabled selected>Select Activity</option>
          <option value="Meeting">Meeting</option>
          <option value="Call">Call</option>
          <option value="Visitation">Visitation</option>
          <option value="Raise Bill">Raise Bill</option>
          <option value="Collect Payment">Collect Payment</option>
          <option value="Send Invoice">Send Invoice</option>
          <option value="Others">Others</option>
        </select>

        <label for="swal-assign" class="text-sm font-medium">Assign To</label>
        <select id="swal-assign" class="swal2-input bg-gray-100 border border-gray-300 rounded-md px-3 py-2">
          <option value="" disabled selected>Select assignee</option>
          ${data.employees.map(
            (employee) => `<option value="${employee._id}">${employee.firstName} ${employee.lastName}</option>`
          ).join('')}
        </select>

        <label for="swal-input3" class="text-sm font-medium">Date & Time</label>
        <input type="datetime-local" id="swal-input3" class="swal2-input bg-gray-100 border border-gray-300 rounded-md px-3 py-2" />

        <label for="swal-textarea" class="text-sm font-medium">Additional Notes</label>
        <textarea id="swal-textarea" class="swal2-textarea bg-gray-100 border border-gray-300 rounded-md px-3 py-2" placeholder="Additional Notes"></textarea>
      </div>
    `,
    customClass: {
      popup: 'p-6',
      confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition',
      cancelButton: 'bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400 transition'
    },
    showCancelButton: true,
    confirmButtonText: 'Schedule',
    preConfirm: () => {
      const activity = document.getElementById('swal-select1').value;
      const assignTo = document.getElementById('swal-assign').value;
      const datetime = document.getElementById('swal-input3').value;
      const notes = document.getElementById('swal-textarea').value;

      if (!activity || !assignTo || !datetime || !notes.trim()) {
        Swal.showValidationMessage('Please fill out all fields before scheduling.');
        return false;
      }

      return { activity, assignTo, datetime, notes };
    }
  }).then((result) => {
    if (result.isConfirmed) {
      // 💾 Push to database or trigger backend logic
      axios.put(`/api/crm/${Encrypt(cust._id)}`, {
        ...result.value,
        customerId: Encrypt(cust._id),
        tenantId: Encrypt(userInfo.business.tenantId),
        raisedBy: userInfo.user.firstName + " " + userInfo.user.lastName,
      }).then((data) => {
        SuccessToast(data.data.message)
        navigation.refresh()
      }).catch((error) => {
        ErrorMessage('Failed to schedule activity.');
      });
    }
  });
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
    title: 'Generate Statement',
    html: `
      <input id="report-start" type="date" class="swal2-input" placeholder="Start Date"/>
      <input id="report-end" type="date" class="swal2-input" placeholder="End Date"/>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Generate',
    preConfirm: () => {
      const startDate = document.getElementById('report-start').value;
      const endDate = document.getElementById('report-end').value;
      if (!startDate || !endDate) {
        Swal.showValidationMessage('Please select both dates');
      }
      return { startDate, endDate };
    }
  });

  if (!formValues) return;

  Swal.fire({ title: 'Fetching report…', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

  try {
    const { startDate, endDate } = formValues;
    const res = await fetch(`/api/crm/${customerId}?Start=${startDate}&End=${endDate}`);
    const data = await res.json();

    if (!res.ok || !data.transcations) {
      throw new Error(data.error || 'No transactions found.');
    }

    Swal.close();

    // 🖼️ Load and watermark image
      const imageDataURL = await loadImageAsDataURL(userInfo.business.companyLogo, "B.A.D.E");

      const doc = new jsPDF();

      // 🖋️ Header setup
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text(`Transaction Statement`, 20, 20);

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Customer: ${cust.Username}`, 20, 30);
      doc.text(`Period: ${startDate} to ${endDate}`, 20, 37);

      // 🖼️ Logo
      doc.addImage(imageDataURL, 'PNG', 150, 10, 35, 35);

      // 📊 Table data
      const headers = [['#', 'Reference No', 'CR', 'DR', 'Balance']];
      const rows = data.transcations.map((tx, i) => [
        i + 1,
        tx.ReferenceNo.toUpperCase(),
        `${tx.CreditAmount.toFixed(2)}`,
        `${tx.DebitAmount.toFixed(2)}`,
        `${tx.Balance.toFixed(2)}`
      ]);

      // ➕ Add final "Current Balance" row
      rows.push([
        '', // Empty index
        'Current Balance',
        '', // Empty CR
        '', // Empty DR
        `${cust.Debt.toFixed(2)}`
      ]);

      // 📋 Table with page footer and styled final row
      autoTable(doc, {
        head: headers,
        body: rows,
        startY: 50,
        theme: 'grid',
        styles: {
          fontSize: 10,
          cellPadding: 3,
          halign: 'start',
          valign: 'middle',
          lineColor: [200, 200, 200],
          lineWidth: 0.2
        },
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: 255,
          fontStyle: 'bold'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        margin: { top: 50 },

        // 🎨 Highlight the last row
        didParseCell: function (data) {
          const isLastRow = data.row.index === rows.length - 1;
          if (isLastRow) {
            data.cell.styles.fontStyle = 'bold';
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

          doc.setFontSize(9);
          doc.text(`Generated on: ${moment().format("YYYY-MM-DD HH:mm:ss")}`, 20, pageHeight - 10);
          doc.text(`visit: badesolutions.com.ng`, pageWidth - 60, pageHeight - 10);
          doc.text(`Page ${pageNumber}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
        }
      });

      // 💾 Save the document
      doc.save(`${startDate}-${endDate}-Statement-${cust.Username}.pdf`);

    SuccessToast('Your report has been saved.')

  } catch (err) {
    ErrorMessage(err.message)
  }
}

    // Use a single config object for axios
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userInfo.business.tenantId}`,
          "X-Requested-With": "XMLHttpRequest",
        },
      };

  // Initialize form data (bankJournal may not exist on cust)


  // Prepare monthly sales data from data.SandS (array of invoices)
  // Prepare monthly sales data for Jan-Dec (month-on-month)
  const monthlySales = Array.from({ length: 12 }, (_, i) => {
    const monthNum = i + 1;
    const monthLabel = new Date(0, i).toLocaleString("default", {
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

    const chartData = {
      labels: monthlySales.map((e) => e.month),
      datasets: [
        {
          label: `${moment().format("YYYY")} Sales`,
          data: monthlySales.map((e) => e.amount),
          backgroundColor: "rgba(8, 8, 8, 0.7)",
          borderColor: "rgb(13, 14, 13)",
          borderWidth: 2,
          fill: false, // Optional: disables area fill under the line
          tension: 0.4, // Curves the line between points
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#fff", // Customize legend text color
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: `${moment().format("YYYY")} Monthly Sales Overview`,
        color: "#130c0cff",
        font: {
          size: 16,
          weight: "bold",
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        enabled: true,
        callbacks: {
          label: function (context) {
            return `${context.parsed.y.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#ccc",
        },
        grid: {
          display: false,
        },
        
      },
      y: {
        ticks: {
          color: "#ccc",
          callback: function (value) {
            return `${value.toLocaleString()}`;
          },
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

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
    try{
      plsWait("Submitting customer update...")
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const url = `${EXPRESS_PRIVATE_URL}/${userInfo.business.companyName}/customer/update/${Encrypt(cust._id)}`
      // Await axios call directly
      const { data } = await axios.patch(
        url,
       formData,
       config
      );


       if (data && data.message) {
         SuccessToast(data.message)
         navigation.refresh()
       }else{
        throw new Error('Something went wrong')
       }

    }catch(error){
       ErrorMessage(error?.response?.data?.error || error.message,)
    }
  };


  

  const handleCreateInvoice = async () => {
    plsWait(
      "Hold tight — we’re preparing everything for you. This won’t take long ⏳ Please don’t refresh or leave this page."
    );

    try {
      // Use destructuring for required IDs
      const { user } = userInfo;
      const { _id: customerId, location: whId } = cust;

      // Avoid unnecessary template literals
      const url = `${EXPRESS_PRIVATE_URL}/api/SalesDraft/${user._id}`;

      // Await axios call directly
      const { data } = await axios.post(
        url,
        { customer: customerId, whId },
        config
      );

      // Handle response (redirect or update UI as needed)
      // Redirect to the new invoice page
      if (data && data.result) {
        // Simulate a delay for the sake of example
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigation.push(`/${router.auth}/${router.Tenant}/${router.module}/Forms/invoice/${Encrypt(data.result)}`)

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
      ErrorMessage(error?.response?.data?.error || error.message,)
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-auto p-6 bg-[#fafafa] shadow-2xl border-1 space-y-8"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h4 className="text-xl font-bold text-gray-800">
          {cust.Username.charAt(0).toUpperCase() + cust.Username.slice(1)}&apos;s profile
        </h4>
        <span
          className={`px-5 py-1.5 rounded-full font-semibold text-base tracking-wide shadow-sm border ${
            cust.category === "Lead"
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-indigo-50 text-indigo-700 border-indigo-200"
          }`}
        >
          {cust.category}
        </span>
      </div>

      {/* Avatar & Attachment */}
      <div className="flex flex-wrap gap-8 items-center py-4">
        {/* Avatar */}
        <div className="flex items-center space-x-6">
          <div className="w-28 h-28 rounded overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-sm border-2 border-gray-300 flex items-center justify-center">
            {cust.image ? (
              <Image
              width={40}
              height={40}
                src={cust.image || 'https://img.icons8.com/glyph-neue/64/gender-neutral-user.png'}
                loading="eager"
                quality={100}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-lg font-semibold">No Image</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Image
            </label>
            <input
              type="file"
              name="Image"
              accept="image/*"
              onChange={handleChange}
              className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-24 border-l border-gray-200 mx-6"></div>

        {/* Attachment */}
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attach Document
          </label>
          <input
            type="file"
            name="attachment"
            onChange={handleChange}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {attachment && (
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500 inline" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
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
        <div className="flex flex-wrap gap-4">
          {userInfo.user.raiseInvoice && !cust.blocked && cust.location && cust.priceList && (
            <span
              onClick={handleCreateInvoice}
              className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Create Invoice"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 14h6m-6-4h6M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold">Create Invoice</span>
            </span>
          )}

          <span
            onClick={() => GenerateSummary(Encrypt(cust._id))}
            className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Print Statement"
          >
            <PrinterIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold">Print Statement</span>
          </span>

          <span
            onClick={() => scheduleActivity(Encrypt(cust._id))}
            className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Schedule Activity"
          >
           <CalendarDaysIcon className="h-5 w-5 text-white" />
            <span className="text-sm font-semibold">Schedule Activity</span>
          </span>

          {userInfo.user.postPayment && !cust.blocked && cust.BankJournal && (
            <span
              onClick={() => postPayment(Encrypt(cust._id), `${userInfo.user.firstName} ${userInfo.user.lastName}`, config)}
              className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-400"
              aria-label="Register Payment"
            >
              <BanknotesIcon className="h-5 w-5 text-white" />
              <span className="text-sm font-semibold">Register Payment</span>
            </span>
          )}

          <TextToSpeechPlayer text={`${getCustomerSummary(cust)}`} />
        </div>
      </Section>

      {/* Identity */}
      <Section title="Identity">
        <Grid>
          <Input
            label="Name"
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
            <label className="block text-sm font-medium text-gray-700">
              Customer Type
            </label>
            <select
              name="customerType"
              value={formData.customerType || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              <option value={cust.customerType}>
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
            name="ContactPerson"
            type="text"
            value={formData.ContactPerson}
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
          <Input
            label="State"
            name="State"
            value={formData.state}
            onChange={handleChange}
          />
          <Input
            label="Address"
            name="billingAddress"
            value={formData.billingAddress}
            onChange={handleChange}
          />
        </Grid>
      </Section>

      {/* Financials */}
        <Section title="Financials" subtitle="(Manage credit, debt, and payment settings)">
          <Grid columns={3}>

          {userInfo.user.isAdmin ? (
            <div className="mb-2 ">
          <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-white to-gray-200 rounded-xl shadow-lg border border-gray-200">
            <input
              type="number"
              step={`any`}
              value={BalanceData.Debt}
              onChange={(e) => {
                  const raw = e.target.value.replace(/,/g, '');
                  const parsed = parseFloat(raw) || 0;
                  setBalanceData((prev) => ({
                    ...prev,
                    Debt: parsed,
                  }));
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
              />

                <span
                  onClick={() => UpdateCustomerBalance(BalanceData.Debt)}
                  className="mt-5 inline-block w-full text-center py-2 px-4 rounded-md text-white font-semibold bg-purple-600 hover:bg-purple-800 transition-colors duration-200 shadow-md cursor-pointer"
                >
                  Update Balance
                </span>
            </div>
              </div>
            ) : (
             <>
              <div className="mb-2">
                <label className="block text-sm font-semibold text-gray-700 tracking-wide">
                  {cust.lastPayDate && cust.Debt > 0 && moment(cust.lastPayDate).isValid()
                    ? `🕒 Debt incurred: ${moment().diff(moment(cust.lastPayDate), "days")} day(s) ago`
                    : "✅ Not in Debt"}
                </label>

              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 shadow-inner font-medium text-base tracking-wide">
                {formData.Debt.toLocaleString()}
              </div>
            </div>
            </>
            )}

            
          {cust.isVerified && (
            <>
            <Input
            label="Credit Limit"
            name="creditLimit"
            type="number"
            value={formData.creditLimit}
            onChange={handleChange}
          />
          <Input
            label="Credit Rating"
            name="creditRating"
            type="number"
            value={formData.creditRating}
            min={0}
            max={5}
            onChange={handleChange}
          />
          </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              PriceList
            </label>
            <select
              required
              name="priceList"
              value={formData.priceList || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              {/* Default option from customer */}
              <option value={cust.priceList}>{cust.priceList}</option>

              {/* Dynamic options based on subscription plan */}
              {userInfo.business.subscriptionplan === "Basic" ? (
               <>
               <option value="Pricelist1" title={`Basic Tier`}>{userInfo.business.priceList1}</option>
               <option value="Pricelist2" title={`Basic Tier`}>{userInfo.business.priceList2}</option>
               </>
              ):(
                <>
                <option value="Pricelist1" title={`Standard Tier`}>{userInfo.business.priceList1}</option>
                <option value="Pricelist2" title={`Standard Tier`}>{userInfo.business.priceList2}</option>
                <option value="Pricelist3" title={`Standard Tier`}>{userInfo.business.priceList3}</option>
                <option value="Pricelist4" title={`Standard Tier`}>{userInfo.business.priceList4}</option>
                <option value="Pricelist5" title={`Standard Tier`}>{userInfo.business.priceList5}</option>
                <option value="Pricelist6" title={`Standard Tier`}>{userInfo.business.priceList6}</option>
                <option value="Pricelist7" title={`Standard Tier`}>{userInfo.business.priceList7}</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              {" "}
              Payment Terms
            </label>
            <select
              name="paymentTerms"
              value={formData.paymentTerms || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              <option value={cust.paymentTerms}>
                {cust.paymentTerms || "Select one"}
              </option>
              <option value="Cash on Delivery">Cash on Delivery </option>
              <option value="Credit customer">Credit customer</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Journal
            </label>
            <select
            required
              name="BankJournal"
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >

              {(() => {
                const bankJournal = data.Accounts.find(
                  (person) => person._id === cust.BankJournal
                );

                if (bankJournal) {
                  return (
                    <option defaultValue={bankJournal._id}>
                      {bankJournal.NAME } [CURRENT]
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
          <Checkbox
            label="Subscribed to Newsfeed"
            name="NewsFeedSubscription"
            checked={formData.NewsFeedSubscription}
            onChange={handleChange}
          />
          <Checkbox
            label="Verified"
            name="isVerified"
            checked={formData.isVerified}
            onChange={handleChange}
          />
          <Checkbox
            label={formData.blocked ? "Unblock Customer" : "Block Customer"}
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
            <label className="block text-sm font-medium text-gray-700">
              Sales Person
            </label>
            <select
              name="salesPerson"
              required
              value={formData.salesPerson || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              {/* Show the current sales person as the first option if available */}
              {(() => {
                const salespers = data.employees.find(
                  (person) => person._id === cust.salesPerson
                );
                if (salespers) {
                  return (
                    <option value={salespers._id}>
                      {salespers.firstName} {salespers.lastName || "Select one"}
                    </option>
                  );
                } else {
                  return <option value="">Select one</option>;
                }
              })()}

              {/* List all employees except the current sales person to avoid duplicate */}
              {data.employees
                .filter((num) => num._id !== cust.salesPerson)
                .map((num) => (
                  <option key={num._id} value={num._id}>
                    {num.firstName} {num.lastName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Manager
            </label>
            <select
              name="accountManager"
              value={formData.accountManager || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              {/* Show the current sales person as the first option if available */}
              {(() => {
                const Manager = data.employees.find(
                  (person) => person._id === cust.accountManager
                );
                if (Manager) {
                  return (
                    <option value={Manager._id}>
                      {Manager.firstName} {Manager.lastName || "Select one"}
                    </option>
                  );
                } else {
                  return <option value="">Select one</option>;
                }
              })()}

              {/* List all employees except the current sales person to avoid duplicate */}
              {data.employees
                .filter((num) => num._id !== cust.accountManager)
                .map((num) => (
                  <option key={num._id} value={num._id}>
                    {num.firstName} {num.lastName}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Service Warehouse
            </label>
            <select
              name="location"
              value={formData.location || ""}
              required
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              {/* Show the current sales person as the first option if available */}
              {(() => {
                const location = data.wh.find(
                  (location) => location._id === cust.location
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
            <label className="block text-sm font-medium text-gray-700">
              preferred Shipping Method
            </label>
            <select
              name="preferredShippingMethod"
              value={formData.preferredShippingMethod || ""}
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              <option value={cust.preferredShippingMethod}>
                {cust.preferredShippingMethod || "Select one"}
              </option>
              <option value="Air">Air</option>
              <option value="Sea">Sea</option>
              <option value="Land">Land</option>
            </select>
          </div>
        </Grid>
      </Section>

      {/* Sales Insight */}
      <Section title="📈 Month-on-Month Sales Insight">
        <div className="bg-white rounded-lg p-4 shadow" style={{ height: "250px" }}>
          <Line data={chartData} options={chartOptions} />
        </div>
      </Section>

      {/* Recent Transactions */}
      <Section title="🧾 Recent Transactions">
        <div className="bg-gray-50 rounded-lg p-4 shadow overflow-x-auto">
          {data && data.transcations.length > 0 ? (
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-2 py-1">Ref No</th>
                  <th className="px-2 py-1">Date</th>
                  <th className="px-2 py-1">Credit</th>
                  <th className="px-2 py-1">Debit</th>
                  <th className="px-2 py-1">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.transcations.map((tx, idx) => (
                  <tr key={idx} title={tx.ReferenceNo}>
                    <td className="px-2 py-1">
                     {tx.ReferenceNo.length > 50
                      ? `${tx.ReferenceNo.substring(0, 50)}...`
                      : tx.ReferenceNo}
                    </td>
                    <td className="px-2 py-1">
                      {moment(tx.Date).format('MMM D, YYYY')}
                    </td>
                    <td className="px-2 py-1">CR: {tx.CreditAmount.toLocaleString()}</td>
                    <td className="px-2 py-1">DR: {tx.DebitAmount.toLocaleString()}</td>
                    <td className={`px-2 py-1 ${tx.Balance < 0 ? 'text-green-700' : 'text-black'} font-semibold`}>
                      {tx.Balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <caption>
                <div className="space-y-2">
                  {cust.Debt < 0 ? (
                    <p className="text-sm text-yellow-700 bg-purple-300 border border-purple-600 rounded-md px-4 py-2">
                      💡 Kindly Note that {userInfo.business.companyName} owes {cust.Username} <strong>{cust.Debt}</strong>.
                    </p>
                  ) : (
                    <p className="text-sm text-red-700 bg-yellow-100 border border-red-300 rounded-md px-4 py-2">
                      ⚠️ Kindly Note that {cust.Username} owes your Business <strong>{cust.Debt}</strong>.
                    </p>
                  )}
                </div>
              </caption>
              <tfoot>
                <tr>
                  <td colSpan="5" className="px-2 py-1 text-white">
                    <ExcelDownloadBtn data={data.transcations} page={`${cust.Username} transaction`} />
                  </td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-gray-500 italic">
              No recent transactions found.
            </p>
          )}
        </div>
      </Section>
      {/* Activity Log */}
      <Section title="📅 Task Logs">
        <div className="bg-gray-50 rounded-lg p-4 shadow overflow-x-auto">
          {cust && cust.ActivityLog?.length > 0 ? (
            <table className="min-w-full text-sm text-gray-700">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-2 py-1">Created By</th>
                  <th className="px-2 py-1">Activity</th>
                  <th className="px-2 py-1">Assigned To</th>
                  <th className="px-2 py-1">Date & Time</th>
                  <th className="px-2 py-1">Notes</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cust.ActivityLog?.map((activity, idx) => (
                  <tr key={idx}>
                    <td className="px-2 py-1">{activity.raisedBy}</td>
                    <td className="px-2 py-1">{activity.activity}</td>
                   <td className="px-2 py-1">
                    {
                      (() => {
                        const assignedId = Dencrypt(activity.assignTo);
                        const employee = data.employees.find(emp => emp._id === assignedId);
                        return employee ? `${employee.firstName} ${employee.lastName}` : 'Unassigned';
                      })()
                    }
                  </td>
                    <td className="px-2 py-1">
                      {moment(activity.datetime).format('MMM D, YYYY h:mm A')}
                    </td>
                    <td className="px-2 py-1">{activity.notes}</td>
                     <td className="px-2 py-1 flex gap-3 items-center">
                    <button aria-label="Mark as Done" title='Mark as Done' className="text-blue-600 hover:text-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>

                    {/* Delete button */}
                    <button aria-label="Delete" title='Delete' className="text-red-600 hover:text-red-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    {/* Remind Me button */}
                    <button aria-label="Remind Me" title='Remind Me' className="text-green-600 hover:text-green-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3M12 6a9 9 0 100 18 9 9 0 000-18z" />
                      </svg>
                    </button>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 italic">
              No activities logged yet.
            </p>
          )}
        </div>
      </Section>

      {userInfo.user.editCustomer && (
        
        <div className="pt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-lg shadow hover:bg-green-700 transition"
        >
          Save Changes
        </button>
      </div>
      )}
      
    </form>
  );
}

// Reusable UI Components

function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
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
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readonly}
        className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
      />
    </div>
  );
}

function Checkbox({ label, name, checked, onChange }) {
  return (
    <div className="flex items-center space-x-2">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-gray-300 rounded text-orange-600"
      />
      <label className="text-sm text-gray-700">{label}</label>
    </div>
  );
}
