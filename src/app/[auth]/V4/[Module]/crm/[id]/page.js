"use client";

import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import TextToSpeechPlayer from "@/app/Components/TextToSpeech";
import Image from "next/image";
import CustomerSalesLoader from "@/app/Components/CustomerSalesLoader";
import InvoicePaymentForm from "@/app/Components/PaymentWithInv";
import Link from "next/link";
import {
  postPayment,
  pricelistSetter,
  EXPRESS_PRIVATE_URL,
} from "../../../../../../../Functions/Functions";
import api from "@/lib/api";
import { saveCustomerStatementPdf } from "@/lib/pdf/customerStatementPdf";
import { useState } from "react";
import DaySelector from "@/app/Components/Datepicker";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../Functions/Mics";
import moment from "moment";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import AgingReportDownloader from "@/app/Components/Reports/SingleAging";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";

// shadcn components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, PrinterIcon, WalletIcon, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
  // invoice summaries (no order lines); the Sales Pipeline section loads those when opened
  const Sales = data.Bills || [];
  const [salesOpened, setSalesOpened] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil((data.transcations?.length || 0) / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows =
    data.transcations?.slice(indexOfFirstRow, indexOfLastRow) || [];

  const salespers = salesPerson.find(
    (person) => person._id.toString() === cust.salesPerson?.toString(),
  );
  const repName = salespers
    ? `${salespers.firstName} ${salespers.lastName || ""}`
    : "Unknown";

  // ==================== HELPERS ====================
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
      <p className="text-center text-muted-foreground py-10">
        Customer data not found.
      </p>
    );
  }

  // ==================== HANDLERS ====================
  const UpdateCustomerBalance = async (value, field) => {
    try {
      const result = await Swal.fire({
        title: "Confirm Sensitive Operation",
        html: `
          <div class="text-sm space-y-2 text-left">
            <p>You are about to update a customer's financial balance.</p>
            <p>This action is <strong>irreversible</strong> and may affect financial records.</p>
          </div>
        `,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#22c55e",
        cancelButtonColor: "#f97316",
        confirmButtonText: "Yes, Proceed!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) return;

      plsWait("Please wait...This should only take a bit.");

      const response = await api.patch(
        `/api/update/customer/balance/${userInfo.user._id}/${cust._id}/${field}`,
        {
          id: cust._id,
          [field]: value,
        },
      );

      const data = response.data || {};
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
      const res = await api.get(
        `/api/customerReport/${customerId}?Start=${startDate}&End=${endDate}`,
      );

      const TransactionResult = res.data;
      if (!res.ok || TransactionResult.length < 1) {
        throw new Error("No transactions found.");
      }

      Swal.close();

      // The layout lives in src/lib/pdf/customerStatementPdf.js (shared with the Sales Portal).
      await saveCustomerStatementPdf({
        business: userInfo.business,
        cust,
        startDate,
        endDate,
        transactions: TransactionResult,
      });
      SuccessToast("Your report has been saved.");
    } catch (err) {
      ErrorMessage(err.message);
    }
  }

  // Passed to postPayment / InvoicePaymentForm; the session cookie authenticates.
  const config = { headers: {} };

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
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Submitting customer update...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const url = `/api/customer/update/${cust._id}`;
      const r = await api.patch(url, formData);
      if (!r.ok) throw new Error(r.error);
      const data = r.data;

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
      const url = `/api/SalesDraft/${userInfo.user._id}`;
      const r = await api.post(
        url,
        { customer: cust._id, whId: cust.location },
      );
      if (!r.ok) throw new Error(r.error);
      const data = r.data;

      if (data && data.result) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigation.push(
          `/${router.auth}/V4/Sales/Sales/Draft/${data.result}`,
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Invoice Creation Error",
          text: "Could not retrieve invoice ID for redirection.",
        });
      }
    } catch (error) {
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  const updateServiceLocation = async () => {
    try {
      plsWait("Updating service location... Please wait.");
      const url = `/api/customer/update/${cust._id}`;
      const r = await api.patch(
        url,
        { location: formData.location },
      );
      if (!r.ok) throw new Error(r.error);
      const data = r.data;
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

  // Shared Tailwind classes matching shadcn look
  const inputCls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const selectCls =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const btnCls =
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3";
  const btnPrimary = `${btnCls} bg-primary text-primary-foreground hover:bg-primary/90`;
  const btnOutline = `${btnCls} border border-input bg-background hover:bg-accent hover:text-accent-foreground`;
  const btnDestructive = `${btnCls} bg-destructive text-destructive-foreground hover:bg-destructive/90`;
  const btnGreen = `${btnCls} bg-green-600 text-white hover:bg-green-700`;
  const labelCls = "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
  const cardCls = "rounded-lg border bg-card text-card-foreground shadow-sm";
  const badgeCls =
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full min-w-0 space-y-6 p-3 sm:p-5 text-sm overflow-x-hidden"
    >
      {/* Top Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="wrap-break-word text-xl font-semibold text-foreground sm:text-2xl">
            {cust.Username || "Customer"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Registration Date:{" "}
            {moment(cust.createdAt).format("dddd DD MMMM YYYY [at] hh:mm A")}
          </p>
        </div>
        <span
          className={`${badgeCls} w-fit text-sm px-4 py-1.5 ${
            cust.Debt < 0
              ? "border-transparent bg-primary text-primary-foreground"
              : "border-transparent bg-destructive text-destructive-foreground"
          }`}
        >
          ₦
          {cust.Debt?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {/* Avatar + Attachment */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0">
            {cust.image ? (
              <Image
                width={96}
                height={96}
                src={cust.image}
                alt="Avatar"
                className="w-full h-full object-cover"
                priority
              />
            ) : (
              <span className="text-xs text-muted-foreground">No Image</span>
            )}
          </div>
          <div className="space-y-1.5 min-w-0">
            <label className={labelCls}>Profile Image</label>
            <input
              type="file"
              name="Image"
              accept="image/*"
              onChange={handleChange}
              className={`${inputCls} cursor-pointer`}
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={cardCls}>
        <div className="flex flex-col space-y-1.5 p-6 pb-3">
          <h3 className="text-base font-semibold leading-none tracking-tight">
            Quick Actions
          </h3>
        </div>
        <div className="p-6 pt-0">
          <div className="flex flex-wrap gap-2">
            {userInfo.user.raiseInvoice &&
              !cust.blocked &&
              cust.location &&
              cust.priceList && (
                <button
                  type="button"
                  onClick={handleCreateInvoice}
                  className={btnPrimary}
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </button>
              )}

            <button
              type="button"
              onClick={() => GenerateSummary(cust._id)}
              className={btnOutline}
            >
              <PrinterIcon className="w-4 h-4" />
              Print Statement
            </button>

            {userInfo.user.postPayment && !cust.blocked && cust.BankJournal && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    postPayment(
                      cust._id,
                      `${userInfo.user.firstName} ${userInfo.user.lastName}`,
                      config,
                    )
                  }
                  className={btnOutline}
                >
                  <WalletIcon className="w-4 h-4" />
                  Register Down Payment
                </button>

                {userInfo.business.subscriptionplan === "Standard" && (
                  <InvoicePaymentForm
                    customerId={cust._id}
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

            {userInfo.business.subscriptionplan === "Standard" && (
              <AgingReportDownloader
                customer={cust}
                invoices={Sales}
                payments={data.transcations}
                Rep={repName}
              />
            )}

            <TextToSpeechPlayer text={getCustomerSummary(cust)} />

            {cust.phone && (
              <Link
                href={`https://wa.me/${cust.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://img.icons8.com/color/48/whatsapp.png"
                  alt="WhatsApp"
                  width={28}
                  height={28}
                  className="w-7 h-7"
                />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Dashboard Stats */}
      <DashboardStats
        cust={cust}
        todaysSale={Sales.filter((b) => b.billStatus !== "Cancelled").reduce(
          (acc, item) => acc + Number(item.grandTotal || 0),
          0,
        )}
      />

      {/* Sales Insight */}
      <div className={cardCls}>
        <div className="flex flex-col space-y-1.5 p-6">
          <h3 className="text-base font-semibold leading-none tracking-tight">
            Month-on-Month Sales Insight for {cust.Username}
          </h3>
        </div>
        <div className="p-6 pt-0">
          <GenerealSalesMargin yearlysales={Sales} warehouses={[]} />
        </div>
      </div>

      {/* ========== SECTIONS ========== */}
      <div className="w-full min-w-0 space-y-3">
        {/* FORM — pure HTML details */}
        <details className="group border rounded-lg px-4 min-w-0 open:bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-semibold select-none [&::-webkit-details-marker]:hidden">
            <span>Form</span>
            <svg
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>

          <div className="pb-4 space-y-6">
            {/* Identity */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Identity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Business Name</label>
                  <input
                    name="Username"
                    value={formData.Username || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Customer Code</label>
                  <input
                    name="CustomerCode"
                    value={formData.CustomerCode || ""}
                    disabled
                    readOnly
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Tax Identification Number</label>
                  <input
                    name="TIN"
                    value={formData.TIN || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Industry</label>
                  <input
                    name="industryType"
                    value={formData.industryType || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0 sm:col-span-2">
                  <label className={labelCls}>Customer Type</label>
                  <select
                    name="customerType"
                    value={formData.customerType || ""}
                    onChange={handleChange}
                    className={`${selectCls} max-w-xs`}
                  >
                    <option value="">Select type</option>
                    <option value="Business">Business</option>
                    <option value="Individual">Individual</option>
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Contact Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Email</label>
                  <input
                    name="Email"
                    type="email"
                    value={formData.Email || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Phone</label>
                  <input
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Contact Person</label>
                  <input
                    name="contactPerson"
                    value={formData.contactPerson || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Location */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Location
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Country</label>
                  <input
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>State</label>
                  <select
                    name="state"
                    value={formData.state || formData.State || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select state</option>
                    {States.map((s, i) => (
                      <option key={i} value={s.value || s}>
                        {s.label || s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Address</label>
                  <input
                    name="billingAddress"
                    value={formData.billingAddress || formData.street || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Region</label>
                  <input
                    name="Region"
                    value={formData.Region || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Merchandiser</label>
                  <input
                    name="merchandiser"
                    value={formData.merchandiser || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Latitude</label>
                  <input
                    name="latitude"
                    value={formData.latitude || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Longitude</label>
                  <input
                    name="longitude"
                    value={formData.longitude || ""}
                    onChange={handleChange}
                    className={inputCls}
                  />
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Financials */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Financials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userInfo.user.isAdmin ? (
                  <div className={`${cardCls} p-4 space-y-3 w-full min-w-0`}>
                    <label className={labelCls}>
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
                      step="any"
                      value={BalanceData.Debt}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value) || 0;
                        setBalanceData((prev) => ({ ...prev, Debt: parsed }));
                      }}
                      className={inputCls}
                    />
                    <button
                      type="button"
                      className={`${btnDestructive} w-full`}
                      onClick={() =>
                        UpdateCustomerBalance(BalanceData.Debt, "Debt")
                      }
                    >
                      Update Balance
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 min-w-0">
                    <label className={labelCls}>
                      {cust.lastPayDate &&
                      cust.Debt > 0 &&
                      moment(cust.lastPayDate).isValid()
                        ? `Debt incurred: ${moment().diff(
                            moment(cust.lastPayDate),
                            "days",
                          )} day(s) ago`
                        : "Not in Debt"}
                    </label>
                    <div className="px-3 py-2 border rounded-md bg-muted/50 font-medium">
                      {formData.Debt?.toLocaleString()}
                    </div>
                  </div>
                )}

                {cust.isVerified && (
                  <>
                    {userInfo.user.EditCreditLimit ? (
                      <div className={`${cardCls} p-4 space-y-3 w-full min-w-0`}>
                        <label className={labelCls}>Credit Limit</label>
                        <input
                          type="number"
                          step="any"
                          min={0}
                          defaultValue={formData.creditLimit}
                          onBlur={(e) => {
                            const parsed = parseFloat(e.target.value) || 0;
                            if (parsed < 0) {
                              ErrorMessage("Value less than 0 is not allowed");
                              e.target.value = 0;
                              return;
                            }
                            setcreditLimit(parsed);
                          }}
                          className={inputCls}
                        />
                        <button
                          type="button"
                          className={`${btnGreen} w-full`}
                          onClick={() =>
                            UpdateCustomerBalance(creditLimit, "creditLimit")
                          }
                        >
                          Update Credit Limit
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-1.5 min-w-0">
                        <label className={labelCls}>Credit Limit</label>
                        <div className="px-3 py-2 border rounded-md bg-muted/50 font-medium">
                          {formData.creditLimit?.toLocaleString()}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 min-w-0">
                      <label className={labelCls}>Credit Rating</label>
                      <input
                        name="creditRating"
                        type="number"
                        min={0}
                        max={5}
                        value={formData.creditRating || 0}
                        onChange={handleChange}
                        className={inputCls}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>PriceList</label>
                  <select
                    name="priceList"
                    value={formData.priceList || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select pricelist</option>
                    <option value={cust.priceList}>
                      {pricelistSetter(cust.priceList, userInfo.business)}
                    </option>
                    {PriceList?.data?.map((pl) => (
                      <option key={pl._id} value={pl.Name}>
                        {pricelistSetter(pl.Name, userInfo.business)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Payment Terms</label>
                  <select
                    name="paymentTerms"
                    value={formData.paymentTerms || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select terms</option>
                    <option value="Cash on Delivery">Cash on Delivery</option>
                    <option value="Credit customer">Credit customer</option>
                    <option value="Payment before delivery">
                      Payment before delivery
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Journal</label>
                  <select
                    name="BankJournal"
                    value={formData.BankJournal || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select journal</option>
                    {data.Accounts?.map((acc) => (
                      <option key={acc._id} value={acc._id}>
                        {acc.NAME}
                        {acc._id === cust.BankJournal ? " [CURRENT]" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="border-border" />

            {/* Status Flags */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Status Flags
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cust.Email && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="NewsFeedSubscription"
                      checked={!!formData.NewsFeedSubscription}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                    />
                    <span className={labelCls}>Send quarterly statement</span>
                  </label>
                )}
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isVerified"
                    checked={!!formData.isVerified}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className={labelCls}>Verified</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="blocked"
                    checked={!!formData.blocked}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <span className={labelCls}>
                    {formData.blocked ? "Unblock Customer" : "Block Customer"}
                  </span>
                </label>
              </div>
            </div>

            <hr className="border-border" />

            {/* Services */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Sales Person</label>
                  <select
                    name="salesPerson"
                    value={formData.salesPerson || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select sales person</option>
                    {salesPerson.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Manager</label>
                  <select
                    name="accountManager"
                    value={formData.accountManager || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select manager</option>
                    {salesPerson.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.firstName} {p.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Service Warehouse</label>
                  <select
                    name="location"
                    value={formData.location || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select warehouse</option>
                    {data.wh?.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.WHName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Preferred Shipping Method</label>
                  <select
                    name="preferredShippingMethod"
                    value={formData.preferredShippingMethod || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select method</option>
                    <option value="Air">Air</option>
                    <option value="Sea">Sea</option>
                    <option value="Land">Land</option>
                  </select>
                </div>

                {userInfo.user._id === cust.accountManager &&
                  userInfo.business.subscriptionplan === "Standard" && (
                    <div className="space-y-1.5 min-w-0">
                      <label className={labelCls}>
                        Assign days for sale rep visit
                      </label>
                      <DaySelector
                        useCase="RouteDays"
                        userData={userInfo}
                        baseUrl={EXPRESS_PRIVATE_URL}
                        id={cust._id}
                      />
                    </div>
                  )}

                <div className="space-y-1.5 min-w-0">
                  <label className={labelCls}>Subscription Plan</label>
                  <select
                    name="Subscription"
                    value={formData.Subscription?._id || formData.Subscription || ""}
                    onChange={handleChange}
                    className={selectCls}
                  >
                    <option value="">Select plan</option>
                    {data?.Subscription?.map((sub) => (
                      <option key={sub._id} value={sub._id}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </details>

        {/* LEDGER — only place that keeps shadcn components */}
        <Accordion type="multiple" className="w-full min-w-0">
          <AccordionItem value="ledger" className="border rounded-lg px-4 min-w-0">
            <AccordionTrigger className="text-base font-semibold hover:no-underline">
              Ledger
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-4">
              <Card className="border-0 shadow-none">
                <CardHeader className="p-3">
                  <CardTitle className="text-lg">Transaction History</CardTitle>
                  <CardDescription>
                    {cust.Username} account transactions and balances
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {data?.transcations?.length > 0 ? (
                    <>
                      <div className="overflow-x-auto rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
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
                              <TableRow key={idx}>
                                <TableCell
                                  className="max-w-[180px] truncate font-medium"
                                  title={tx.ReferenceNo}
                                >
                                  {tx.ReferenceNo.length > 35
                                    ? `${tx.ReferenceNo.substring(0, 35)}...`
                                    : tx.ReferenceNo}
                                </TableCell>
                                <TableCell>
                                  {moment(tx.Date).format("MMM D, YYYY")}
                                </TableCell>
                                <TableCell>
                                  {tx.CreditAmount > 0 ? (
                                    <Badge
                                      variant="secondary"
                                      className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                    >
                                      CR: {tx.CreditAmount?.toLocaleString()}
                                    </Badge>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell>
                                  {tx.DebitAmount > 0 ? (
                                    <Badge
                                      variant="destructive"
                                      className="bg-rose-500/10 text-rose-700 dark:text-rose-400"
                                    >
                                      DR: {tx.DebitAmount?.toLocaleString()}
                                    </Badge>
                                  ) : (
                                    "—"
                                  )}
                                </TableCell>
                                <TableCell
                                  className={`text-right font-bold ${
                                    tx.Balance < 0
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : ""
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

                      {cust.Debt < 0 ? (
                        <Alert className="border-purple-300 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
                          <AlertCircle className="h-4 w-4 text-purple-700 dark:text-purple-400" />
                          <AlertTitle>Business Debt Notice</AlertTitle>
                          <AlertDescription>
                            <strong>{userInfo.business.companyName}</strong> owes{" "}
                            <strong>{cust.Username}</strong>{" "}
                            <strong>{cust.Debt?.toLocaleString()}</strong>.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800">
                          <AlertCircle className="h-4 w-4 text-yellow-700 dark:text-yellow-400" />
                          <AlertTitle>Outstanding Debt</AlertTitle>
                          <AlertDescription>
                            <strong>{cust.Username}</strong> owes your business{" "}
                            <strong>{cust.Debt?.toLocaleString()}</strong>.
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm text-muted-foreground">
                          Page {currentPage} of {totalPages || 1}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            onClick={() =>
                              setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                          >
                            Previous
                          </Button>
                          <Button
                            size="sm"
                            type="button"
                            onClick={() =>
                              setCurrentPage((p) =>
                                Math.min(p + 1, totalPages),
                              )
                            }
                            disabled={
                              currentPage === totalPages || totalPages === 0
                            }
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                      <p className="text-sm text-muted-foreground italic">
                        No recent transactions found.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* GEO — pure HTML details */}
        <details className="group border rounded-lg px-4 min-w-0 open:bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-semibold select-none [&::-webkit-details-marker]:hidden">
            <span>Geo‑coordinates</span>
            <svg
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="pb-4">
            <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden border">
              {cust.latitude && cust.longitude ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(cust.latitude)},${encodeURIComponent(cust.longitude)}&z=15&output=embed`}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <iframe
                  title="Customer Location"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(cust.state)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full"
                  loading="lazy"
                />
              )}
            </div>
          </div>
        </details>

        {/* SALES PIPELINE — order lines load the first time it is opened */}
        <details
          className="group border rounded-lg px-4 min-w-0 open:bg-card"
          onToggle={(e) => e.currentTarget.open && setSalesOpened(true)}
        >
          <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-semibold select-none [&::-webkit-details-marker]:hidden">
            <span>Sales Pipeline</span>
            <svg
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="pb-4">
            {salesOpened && (
              <CustomerSalesLoader
                customerParamId={router.id}
                customer={cust}
                business={userInfo.business}
                Rep={salesPerson}
              />
            )}
          </div>
        </details>

        {/* SUPPORT TICKETS — pure HTML details */}
        <details className="group border rounded-lg px-4 min-w-0 open:bg-card">
          <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-semibold select-none [&::-webkit-details-marker]:hidden">
            <span>{data.SupportTicket?.length || 0} Support Tickets</span>
            <svg
              className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </summary>
          <div className="pb-4 max-h-80 overflow-y-auto space-y-3">
            {data.SupportTicket?.length > 0 ? (
              data.SupportTicket.map((ticket, index) => (
                <div key={index} className={`${cardCls} p-3`}>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`${badgeCls} border-transparent bg-secondary text-secondary-foreground`}
                      >
                        {ticket.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {ticket.TicketId}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs font-medium">{ticket.SLA}</span>
                  </div>
                  <p className="text-sm whitespace-pre-line">{ticket.comment}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                No support tickets.
              </div>
            )}
          </div>
        </details>
      </div>

      {/* Save Buttons */}
      {userInfo.user.editCustomer && (
        <button type="submit" className={btnGreen}>
          Save Changes
        </button>
      )}

      {userInfo.user.raiseInvoice && !userInfo.user.editCustomer && (
        <button
          type="button"
          onClick={updateServiceLocation}
          className={btnGreen}
        >
          Save Changes
        </button>
      )}

      <p className="text-sm italic text-muted-foreground">
        Last updated:{" "}
        {moment(cust.updatedAt).format("dddd DD MMMM YYYY [at] hh:mm A")}
      </p>
    </form>
  );
}

// ==================== DASHBOARD STATS ====================
function DashboardStats({ todaysSale, cust }) {
  const daysAwayFromToday = (targetDate) => {
    const today = moment().startOf("day");
    const target = moment(targetDate).startOf("day");
    return target.diff(today, "days");
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <Badge
            variant="outline"
            className="w-fit bg-green-500/10 text-green-700 dark:text-green-400"
          >
            Total sales transaction
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">
            ₦{formatNumberShort(todaysSale || 0)}
          </p>
        </CardContent>
      </Card>

      {cust.lastPayDate && (
        <Card>
          <CardHeader className="pb-2">
            <Badge variant="outline" className="w-fit">
              Last transaction Date
            </Badge>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="text-base font-bold">
              {daysAwayFromToday(cust.lastPayDate) === 0
                ? "Today"
                : `${Math.abs(daysAwayFromToday(cust.lastPayDate))} day(s) ago`}
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <Badge variant="outline" className="w-fit">
            Current Balance
          </Badge>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-bold">₦{formatNumberShort(cust.Debt)}</p>
        </CardContent>
      </Card>
    </div>
  );
}

const formatNumberShort = (num) => {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(3) + " B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(3) + " M";
  if (num >= 1_000) return (num / 1_000).toFixed(3) + " K";
  return num?.toString() || "0";
};