"use client";

import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import TextToSpeechPlayer from "@/app/Components/TextToSpeech";
import CustomerSales from "@/app/Components/CustomerSales";
import autoTable from "jspdf-autotable";
import {
  postPayment,
  EXPRESS_PRIVATE_URL,
  Dencrypt,
} from "../../../../../Functions/Functions";
import { useState, useEffect, useRef } from "react";
import {
  PrinterIcon,
  WalletIcon,
  QuestionMarkCircleIcon,
  CameraIcon,
  PaperClipIcon,
} from "@heroicons/react/24/outline";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";

import {
  plsWait,
  Encrypt,
  ErrorMessage,
  SuccessToast,
} from "../../../../../Functions/Mics";
import axios from "axios";
import moment from "moment";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import Link from "next/link";

export default function CustomerForm({ userInfo, data, cust, salesPerson }) {
  const router = useParams();
  const navigation = useRouter();
  const [States] = useState(data.AllStates || []);
  const [isOpen, setIsOpen] = useState(false);
  const [isOpen2, setisOpen2] = useState(false);
  const [isOpen3, setisOpen3] = useState(false);
  const [isOpen4, setisOpen4] = useState(false);

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

  if (!cust) {
    return (
      <p className="text-center text-gray-500">Customer data not found.</p>
    );
  }

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
          },
          cache: "no-store", // Optional: disables caching for fresh data
        },
      );

      const TransactionResult = await res.json();

      if (!res.ok || TransactionResult.length < 1) {
        throw new Error(data.error || "No transactions found.");
      }

      Swal.close();

      // Load and watermark image
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

      //  Logo
      doc.addImage(imageDataURL, "PNG", 150, 10, 35, 35);

      //  Table data
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
      const url = `${EXPRESS_PRIVATE_URL}/api/Sales_Portal/requisition/new/${Encrypt(user.user._id)}`;

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
        navigation.push(`/SalesPortal/Requisitions/${Encrypt(data.result)}`);
      } else {
        Swal.fire({
          icon: "error",
          title: "Invoice Creation Error",
          text: "Something went wrong.",
          confirmButtonText: "Close",
        });
      }
    } catch (error) {
      // Prefer error.message fallback
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-full p-6 bg-[#fafafa] shadow-2xl border space-y-8 text-xs border-2 mr-3 ml-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-sm text-gray-600 italic">
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

      {/* Quick Actions */}
      <Section title="⚙️ Quick Actions">
        <div className="flex flex-wrap gap-4">
          {userInfo.user.raiseInvoice &&
            !cust.blocked &&
            cust.location &&
            cust.priceList && (
              <span
                onClick={handleCreateInvoice}
                className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Create Invoice"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 14h6m-6-4h6M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs">Sell to Customer</span>
              </span>
            )}

          <MyComponent cust={cust} userInfo={userInfo} />

          <span
            onClick={() => GenerateSummary(Encrypt(cust._id))}
            className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Print Statement"
          >
            <PrinterIcon className="h-5 w-5 text-white" />
            <span className="text-xs">Print Statement</span>
          </span>

          <TextareaButton user={userInfo.user} cust={cust._id} />

          {userInfo.user.postPayment && !cust.blocked && cust.BankJournal && (
            <>
              <span
                onClick={() =>
                  postPayment(
                    Encrypt(cust._id),
                    `${userInfo.user.firstName} ${userInfo.user.lastName}`,
                    config,
                  )
                }
                className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400"
                aria-label="Register Payment"
              >
                <WalletIcon className="h-5 w-5 text-white" />
                <span className="text-xs">Register Payment</span>
              </span>
            </>
          )}

          <TextToSpeechPlayer text={`${getCustomerSummary(cust)}`} />
        </div>
      </Section>

      {/* Sales Insight */}
      <Section title={``} className="lg:col-span-2">
        <div className="">
          <GenerealSalesMargin yearlysales={data.SandS} warehouses={[]} />
        </div>
      </Section>

      <div className="border rounded-lg overflow-hidden ">
        <span
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
        >
          <h2 className="text-base/7 font-semibold text-gray-900">Form</h2>
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
          className={`px-4 py-3 text-gray-600 transition-all duration-300 ${
            isOpen ? "block" : "hidden"
          }`}
        >
          <div className="bg-gray-50 p-3">
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

                <Selects
                  label="State"
                  name="state"
                  value={formData.state}
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
                <div className="flex flex-col items-start gap-2">
                  <Label htmlFor="gps-button">
                    Ensure you are in {cust.Username}'s Location before using
                    this feature.
                  </Label>
                  <Link
                    variant="default"
                    className="flex items-center gap-2 p-3 rounded-md transition bg-gray-600 w-full text-white"
                    href={`https://www.gps-coordinates.net/my-location`}
                    target="blank"
                  >
                    Get My Geo‑coordinates
                  </Link>
                </div>
              </Grid>
            </Section>

            {/* Financials */}
            <Section
              title="Financials"
              subtitle="(Manage credit, debt, and payment settings)"
            >
              <Grid columns={3}>
                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700 tracking-wide">
                    {cust.lastPayDate &&
                    cust.Debt > 0 &&
                    moment(cust.lastPayDate).isValid()
                      ? `Debt incurred: ${moment().diff(
                          moment(cust.lastPayDate),
                          "days",
                        )} day(s) ago`
                      : "Not in Debt"}
                  </label>

                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 shadow-inner font-medium text-base tracking-wide">
                    {formData.Debt?.toLocaleString()}
                  </div>
                </div>

                <div className="mb-2">
                  <label className="block text-sm font-semibold text-gray-700 tracking-wide">
                    Credit Limit
                  </label>

                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 shadow-inner font-medium text-base tracking-wide">
                    {formData.creditLimit?.toLocaleString()}
                  </div>
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
              </Grid>
            </Section>

            {/* Services */}
            <Section title="🛎 Services">
              <Grid columns={2}>
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
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden ">
        <span
          onClick={() => setisOpen2(!isOpen2)}
          className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
        >
          <h2 className="text-base/7 font-semibold text-gray-900">Ledger</h2>
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
          className={`px-4 py-3 text-gray-600 transition-all duration-300 ${
            isOpen2 ? "block" : "hidden"
          }`}
        >
          {/* Recent Transactions */}
          <Section title="">
            <div className="bg-gray-50 rounded-lg p-4 shadow overflow-x-auto">
              {data && data.transcations.length > 0 ? (
                <div className="overflow-x-auto">
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
                    <tbody className="divide-y divide-gray-200 text-xs">
                      {currentRows.map((tx, idx) => (
                        <tr key={idx} title={tx.ReferenceNo}>
                          <td className="px-2 py-1">
                            {tx.ReferenceNo.length > 50
                              ? `${tx.ReferenceNo?.substring(0, 50)}...`
                              : tx.ReferenceNo}
                          </td>
                          <td className="px-2 py-1">
                            {moment(tx.Date).format("MMM D, YYYY")}
                          </td>
                          <td className="px-2 py-1">
                            <span
                              className={`inline-block px-2 py-0.5  text-black ${
                                tx.CreditAmount > 0
                                  ? " text-xs rounded-full bg-green-500/30"
                                  : ""
                              }`}
                            >
                              CR: {tx.CreditAmount?.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span
                              className={`inline-block px-2 py-0.5  text-black ${
                                tx.DebitAmount > 0
                                  ? " text-xs rounded-full bg-red-500/30"
                                  : ""
                              }`}
                            >
                              DR: {tx.DebitAmount?.toLocaleString()}
                            </span>
                          </td>
                          <td
                            className={`px-2 py-1 ${
                              tx.Balance < 0 ? "text-green-700" : "text-black"
                            } font-bold text-sm`}
                          >
                            {tx.Balance?.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <caption>
                      <div className="space-y-2 mt-2">
                        {cust.Debt < 0 ? (
                          <p className="text-sm text-yellow-700 bg-purple-300 border border-purple-600 rounded-md px-4 py-2">
                            💡 Kindly Note that {userInfo.business.companyName}{" "}
                            owes {cust.Username} <strong>{cust.Debt}</strong>.
                          </p>
                        ) : (
                          <p className="text-sm text-red-700 bg-yellow-100 border border-red-300 rounded-md px-4 py-2">
                            ⚠️ Kindly Note that {cust.Username} owes your
                            Business <strong>{cust.Debt}</strong>.
                          </p>
                        )}
                      </div>
                    </caption>
                    <tfoot>
                      <tr>
                        <td colSpan="5" className="px-2 py-1 text-white">
                          <ExcelDownloadBtn
                            data={data.transcations}
                            page={`${cust.Username.substring(
                              0,
                              8,
                            )} transaction`}
                          />
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mt-4 text-sm">
                    <span
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 bg-gray-400 rounded disabled:opacity-50"
                    >
                      Previous
                    </span>

                    <span className="text-xs text-black font-bold">
                      Page {currentPage} of {totalPages}
                    </span>

                    <span
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 bg-gray-500 rounded disabled:opacity-50"
                    >
                      Next
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 italic">
                  No recent transactions found.
                </p>
              )}
            </div>
          </Section>
        </div>
      </div>
      <div className="border rounded-lg overflow-hidden ">
        <span
          onClick={() => setisOpen3(!isOpen3)}
          className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
        >
          <h2 className="text-base/7 font-semibold text-gray-900">
            Geo‑coordinates
          </h2>
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
          className={`px-4 py-3 text-gray-600 transition-all duration-300 ${
            isOpen3 ? "block" : "hidden"
          }`}
        >
          {/* Activity Log */}
          <Section title="">
            <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
              {/* display shop location on google maps here */}
              <div className="w-full h-96 rounded-lg overflow-hidden shadow-md">
                {cust.latitude && cust.longitude ? (
                  <iframe
                    title="Customer Location"
                    src={`https://www.google.com/maps?q=${cust.latitude},${cust.longitude}&z=15&output=embed`}
                    className="w-full h-full"
                    loading="lazy"
                  ></iframe>
                ) : (
                  <iframe
                    title="Customer Location"
                    src={`https://maps.google.com/maps?q=${cust.state}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                    className="w-full h-full"
                    loading="lazy"
                  ></iframe>
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
          className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
        >
          <h2 className="text-base/7 font-semibold text-gray-900">
            Sales Pipeline
          </h2>
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
          className={`px-4 py-3 text-gray-600 transition-all duration-300 ${
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

      <span className="text-sm text-gray-600 italic">
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

function Selects({
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
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        readOnly={readonly}
        className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

export function TextareaButton({ user, cust }) {
  const [photo, setPhoto] = useState([]);
  const [message, setMessage] = useState("");
  const [SLA, setSLA] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const maxWords = 200;
  const wordCount = message.trim().split(/\s+/).filter(Boolean).length;

  const fileInputRef = useRef(null);

  // Upload docs
  const processAndUploadFile = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const img = new window.Image();
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const maxWidth = 800;
            const maxHeight = 600;
            let { width, height } = img;

            if (width > height && width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            } else if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const resizedImage = canvas.toDataURL("image/jpeg", 0.7);

            const request = await fetch(
              `${EXPRESS_PRIVATE_URL}/api/attachement`,
              {
                method: "POST",
                body: JSON.stringify({ image: resizedImage }),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${Encrypt(user.tenantId)}`,
                  access: `${Encrypt(user._id)}`,
                },
              },
            );

            const response = await request.json();
            resolve({ success: !!response.message });
            setPhoto((prev) => [
              ...prev,
              ...response.data.map((url) => ({
                _id: uuidv4(),
                url,
              })),
            ]);
          };
          img.src = e.target.result;
        } catch (error) {
          resolve({ success: false });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    const maxSize = 1024 * 1024; // 1MB

    const validFiles = files.filter((file) => {
      if (file.size > maxSize) {
        ErrorMessage(`File "${file.name}" exceeds 1MB limit.`);
        return false;
      }
      if (file.type === "application/pdf") {
        ErrorMessage(`PDF files are not allowed: "${file.name}".`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      plsWait("Uploading...");
      const results = await Promise.allSettled(
        validFiles.map((file) => processAndUploadFile(file)),
      );

      const successfulUploads = results.filter(
        (r) => r.status === "fulfilled" && r.value.success,
      ).length;
      const failedUploads = results.length - successfulUploads;

      SuccessToast(
        `Successfully uploaded ${successfulUploads} file(s). Failed: ${failedUploads}`,
      );
    }
  };

  const handleSend = async () => {
    if (wordCount === 0) return;
    setLoading(true);

    try {
      plsWait("Creating new ticket...");
      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/tickets/${Encrypt(cust)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(user.tenantId)}`,
            access: `${Encrypt(user._id)}`,
          },
          body: JSON.stringify({
            message,
            attachments: photo,
            SLA,
          }),
        },
      );

      const result = await response.json();
      if (result.message) {
        SuccessToast(result.message);
        setMessage("");
        setSLA("");
        setPhoto([]);
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      ErrorMessage(err.message || "Error submitting ticket:");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400">
          <QuestionMarkCircleIcon className="h-6 w-6 text-white" />
          Open a support ticket
        </Button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-sm">
        <DialogHeader>
          <DialogTitle>New Ticket</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <Textarea
            placeholder="Type your message here (max 200 words)."
            value={message}
            onChange={(e) => {
              const text = e.target.value;
              const words = text.trim().split(/\s+/).filter(Boolean);
              if (words.length <= maxWords) {
                setMessage(text);
              }
            }}
          />
          <p className="text-xs text-gray-500">
            {wordCount}/{maxWords} words
          </p>

          <Select value={SLA} onValueChange={(val) => setSLA(val)}>
            <SelectTrigger className="w-full bg-white/50">
              <SelectValue placeholder="-- Choose Priority Level --" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Low">Low</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="High">High</SelectItem>
            </SelectContent>
          </Select>

          {/* Hidden file input */}
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          <Button
            type="button"
            className="inline-flex items-center justify-center bg-gray-600 border-2 px-3 py-3 rounded-lg text-white font-semibold hover:shadow-xl w-full transition duration-200 ease-in-out text-xs"
            onClick={() => fileInputRef.current?.click()}
          >
            <PaperClipIcon className="h-6 w-6 text-white" />
            <span className="ml-2">Upload attachments</span>
          </Button>

          <Button onClick={handleSend} disabled={wordCount === 0 || loading}>
            {loading ? "Creating ticket..." : "Create ticket"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



export function MyComponent({ cust, userInfo }) {
  const router = useRouter();
  const handleCreateInvoice = async () => {
    try {
      plsWait("Generating stock card...");
      const response = await fetch(`${EXPRESS_PRIVATE_URL}/api/Sales_Portal/stock/position/new`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userInfo.user.tenantId)}`,
          access: `${Encrypt(userInfo.user._id)}`,
        },
        body: JSON.stringify({ leadId:Encrypt(cust._id)}),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      SuccessToast("Redirecting!");
      router.push(`/SalesPortal/Reports/${Encrypt(data.invoiceId)}`);
    } catch (error) {
      ErrorToast("Error creating new template for stock card");
      router.refresh()
    }
  };

  return (
    <span
      onClick={handleCreateInvoice}
      className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
      aria-label="Create Invoice"
    >
      <CameraIcon className="h-5 w-5 text-white" />
      <span className="text-xs">Capture stock level</span>
    </span>
  );
}


