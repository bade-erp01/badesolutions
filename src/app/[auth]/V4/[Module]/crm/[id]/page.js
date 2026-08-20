"use client";

import { useParams, useRouter } from "next/navigation";
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
} from "../../../../../../../Functions/Functions";
import { useState } from "react";
import DaySelector from "@/app/Components/Datepicker";
import {
  plsWait,
  Encrypt,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../Functions/Mics";
import axios from "axios";
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
  const Sales = data.Bills || [];

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
        ctx.drawImage(img, 0, 0);
        ctx.font = "italic bold 16px 'Courier New'";
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.globalAlpha = 0.5;
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 10);
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
          cache: "no-store",
        },
      );

      const TransactionResult = await res.json();
      if (!res.ok || TransactionResult.length < 1) {
        throw new Error("No transactions found.");
      }

      Swal.close();

      const imageDataURL = await loadImageAsDataURL(
        userInfo.business.companyLogo,
        "B.A.D.E",
      );

      const doc = new jsPDF();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`Transaction Statement`, 20, 20);
      doc.text(`Customer: ${cust.Username}`, 20, 30);
      doc.text(`Period: ${startDate} to ${endDate}`, 20, 35);
      doc.setFontSize(8);
      doc.text(
        `Current Balance: ${cust.Debt?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`,
        20,
        42,
      );
      doc.addImage(imageDataURL, "PNG", 150, 10, 35, 35);

      const headers = [["#", "Reference No", "Date", "CR", "DR", "Balance"]];
      const rows = TransactionResult.map((tx, i) => [
        i + 1,
        tx.ReferenceNo.toUpperCase(),
        moment(new Date(tx.Date)).format("YYYY-MM-DD"),
        tx.CreditAmount?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        tx.DebitAmount?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        tx.Balance?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      ]);

      rows.push([
        "",
        "Current Balance",
        "",
        "",
        "",
        cust.Debt?.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      ]);

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

      doc.save(`${startDate}-${endDate}-Statement-${cust.Username}.pdf`);
      SuccessToast("Your report has been saved.");
    } catch (err) {
      ErrorMessage(err.message);
    }
  }

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
      access: `${Encrypt(userInfo.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
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

  // Helper for Select components (shadcn)
  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Submitting customer update...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const url = `${EXPRESS_PRIVATE_URL}/api/customer/update/${Encrypt(
        cust._id,
      )}`;
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
      const url = `${EXPRESS_PRIVATE_URL}/api/SalesDraft/${Encrypt(
        userInfo.user._id,
      )}`;
      const { data } = await axios.post(
        url,
        { customer: cust._id, whId: cust.location },
        config,
      );

      if (data && data.result) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        navigation.push(
          `/${router.auth}/V4/Sales/Sales/Draft/${Encrypt(data.result)}`,
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
      const url = `${EXPRESS_PRIVATE_URL}/api/customer/update/${Encrypt(
        cust._id,
      )}`;
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
      className="w-full space-y-6 p-3 sm:p-5 text-sm"
    >
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-muted-foreground italic">
          Registration Date:{" "}
          {moment(cust.createdAt).format("dddd DD MMMM YYYY [at] hh:mm A")}
        </p>
        <Badge
          variant={cust.Debt < 0 ? "default" : "destructive"}
          className="w-fit text-sm px-4 py-1.5"
        >
          ₦
          {cust.Debt?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Badge>
      </div>

      {/* Avatar + Attachment */}
      <div className="flex flex-col sm:flex-row gap-6 items-start">
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 rounded-lg overflow-hidden border border-border bg-muted flex items-center justify-center">
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
          <div className="space-y-1.5">
            <Label>Profile Image</Label>
            <Input
              type="file"
              name="Image"
              accept="image/*"
              onChange={handleChange}
              className="cursor-pointer"
            />
          </div>
        </div>

        {/* <div className="hidden lg:block flex-1 space-y-1.5">
          <Label>Attach Document</Label>
          <Input
            type="file"
            name="attachment"
            onChange={handleChange}
            className="cursor-pointer"
          />
          {attachment && (
            <p className="text-xs text-muted-foreground">
              Selected: <strong>{attachment.name}</strong>
            </p>
          )}
        </div> */}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {userInfo.user.raiseInvoice &&
              !cust.blocked &&
              cust.location &&
              cust.priceList && (
                <Button
                  onClick={handleCreateInvoice}
                  size="sm"
                  type="button"
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Invoice
                </Button>
              )}

            <Button
              onClick={() => GenerateSummary(Encrypt(cust._id))}
              variant="outline"
              size="sm"
              type="button"
              className="gap-2"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Statement
            </Button>

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
                  variant="outline"
                  size="sm"
                  type="button"
                  className="gap-2"
                >
                  <WalletIcon className="w-4 h-4" />
                  Register Down Payment
                </Button>

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
        </CardContent>
      </Card>

      {/* Dashboard Stats */}
      <DashboardStats
        cust={cust}
        todaysSale={data.SandS?.reduce(
          (acc, item) => acc + Number(item.grandTotal || 0),
          0,
        )}
      />

      {/* Sales Insight */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Month-on-Month Sales Insight for {cust.Username}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GenerealSalesMargin yearlysales={data.SandS} warehouses={[]} />
        </CardContent>
      </Card>

      {/* ========== MAIN ACCORDION ========== */}
      <Accordion type="multiple" className="w-full space-y-3">
        {/* FORM */}
        <AccordionItem value="form" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Form
          </AccordionTrigger>
          <AccordionContent className="space-y-6 pt-2 pb-4">
            {/* Identity */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Identity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Business Name</Label>
                  <Input
                    name="Username"
                    value={formData.Username || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Customer Code</Label>
                  <Input
                    name="CustomerCode"
                    value={formData.CustomerCode || ""}
                    disabled
                    readOnly
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Tax Identification Number</Label>
                  <Input
                    name="TIN"
                    value={formData.TIN || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Industry</Label>
                  <Input
                    name="industryType"
                    value={formData.industryType || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Customer Type</Label>
                  <Select
                    value={formData.customerType || ""}
                    onValueChange={(val) =>
                      handleSelectChange("customerType", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business">Business</SelectItem>
                      <SelectItem value="Individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Contact */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Contact Info
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    name="Email"
                    type="email"
                    value={formData.Email || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Phone</Label>
                  <Input
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Contact Person</Label>
                  <Input
                    name="contactPerson"
                    value={formData.contactPerson || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Location
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Input
                    name="country"
                    value={formData.country || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <Select
                    value={formData.state || formData.State || ""}
                    onValueChange={(val) => handleSelectChange("state", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {States.map((s, i) => (
                        <SelectItem key={i} value={s.value || s}>
                          {s.label || s}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Address</Label>
                  <Input
                    name="billingAddress"
                    value={formData.billingAddress || formData.street || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Region</Label>
                  <Input
                    name="Region"
                    value={formData.Region || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Merchandiser</Label>
                  <Input
                    name="merchandiser"
                    value={formData.merchandiser || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Latitude</Label>
                  <Input
                    name="latitude"
                    value={formData.latitude || ""}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Longitude</Label>
                  <Input
                    name="longitude"
                    value={formData.longitude || ""}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Financials */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Financials
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Debt */}
                {userInfo.user.isAdmin ? (
                  <Card className="p-4 space-y-3">
                    <Label>
                      {cust.lastPayDate &&
                      cust.Debt > 0 &&
                      moment(cust.lastPayDate).isValid()
                        ? `Debt incurred: ${moment().diff(
                            moment(cust.lastPayDate),
                            "days",
                          )} day(s) ago`
                        : "Not in Debt"}
                    </Label>
                    <Input
                      type="number"
                      step="any"
                      value={BalanceData.Debt}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value) || 0;
                        setBalanceData((prev) => ({ ...prev, Debt: parsed }));
                      }}
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      className="w-full"
                      onClick={() =>
                        UpdateCustomerBalance(BalanceData.Debt, "Debt")
                      }
                    >
                      Update Balance
                    </Button>
                  </Card>
                ) : (
                  <div className="space-y-1.5">
                    <Label>
                      {cust.lastPayDate &&
                      cust.Debt > 0 &&
                      moment(cust.lastPayDate).isValid()
                        ? `Debt incurred: ${moment().diff(
                            moment(cust.lastPayDate),
                            "days",
                          )} day(s) ago`
                        : "Not in Debt"}
                    </Label>
                    <div className="px-3 py-2 border rounded-md bg-muted/50 font-medium">
                      {formData.Debt?.toLocaleString()}
                    </div>
                  </div>
                )}

                {/* Credit Limit */}
                {cust.isVerified && (
                  <>
                    {userInfo.user.EditCreditLimit ? (
                      <Card className="p-4 space-y-3">
                        <Label>Credit Limit</Label>
                        <Input
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
                        />
                        <Button
                          type="button"
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() =>
                            UpdateCustomerBalance(creditLimit, "creditLimit")
                          }
                        >
                          Update Credit Limit
                        </Button>
                      </Card>
                    ) : (
                      <div className="space-y-1.5">
                        <Label>Credit Limit</Label>
                        <div className="px-3 py-2 border rounded-md bg-muted/50 font-medium">
                          {formData.creditLimit?.toLocaleString()}
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5">
                      <Label>Credit Rating</Label>
                      <Input
                        name="creditRating"
                        type="number"
                        min={0}
                        max={5}
                        value={formData.creditRating || 0}
                        onChange={handleChange}
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <Label>PriceList</Label>
                  <Select
                    value={formData.priceList || ""}
                    onValueChange={(val) => handleSelectChange("priceList", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select pricelist" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={cust.priceList}>
                        {pricelistSetter(cust.priceList, userInfo.business)}
                      </SelectItem>
                      {PriceList?.data?.map((pl) => (
                        <SelectItem key={pl._id} value={pl.Name}>
                          {pricelistSetter(pl.Name, userInfo.business)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Payment Terms</Label>
                  <Select
                    value={formData.paymentTerms || ""}
                    onValueChange={(val) =>
                      handleSelectChange("paymentTerms", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cash on Delivery">
                        Cash on Delivery
                      </SelectItem>
                      <SelectItem value="Credit customer">
                        Credit customer
                      </SelectItem>
                      <SelectItem value="Payment before delivery">
                        Payment before delivery
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Journal</Label>
                  <Select
                    value={formData.BankJournal || ""}
                    onValueChange={(val) =>
                      handleSelectChange("BankJournal", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select journal" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.Accounts?.map((acc) => (
                        <SelectItem key={acc._id} value={acc._id}>
                          {acc.NAME}
                          {acc._id === cust.BankJournal ? " [CURRENT]" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Status Flags */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Status Flags
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {cust.Email && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="NewsFeedSubscription"
                      checked={!!formData.NewsFeedSubscription}
                      onCheckedChange={(val) =>
                        handleSelectChange("NewsFeedSubscription", val)
                      }
                    />
                    <Label htmlFor="NewsFeedSubscription">
                      Send quarterly statement
                    </Label>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVerified"
                    checked={!!formData.isVerified}
                    onCheckedChange={(val) =>
                      handleSelectChange("isVerified", val)
                    }
                  />
                  <Label htmlFor="isVerified">Verified</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="blocked"
                    checked={!!formData.blocked}
                    onCheckedChange={(val) =>
                      handleSelectChange("blocked", val)
                    }
                  />
                  <Label htmlFor="blocked">
                    {formData.blocked ? "Unblock Customer" : "Block Customer"}
                  </Label>
                </div>
              </div>
            </div>

            <Separator />

            {/* Services */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground">
                Services
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Sales Person</Label>
                  <Select
                    value={formData.salesPerson || ""}
                    onValueChange={(val) =>
                      handleSelectChange("salesPerson", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sales person" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesPerson.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Manager</Label>
                  <Select
                    value={formData.accountManager || ""}
                    onValueChange={(val) =>
                      handleSelectChange("accountManager", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {salesPerson.map((p) => (
                        <SelectItem key={p._id} value={p._id}>
                          {p.firstName} {p.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Service Warehouse</Label>
                  <Select
                    value={formData.location || ""}
                    onValueChange={(val) => handleSelectChange("location", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {data.wh?.map((w) => (
                        <SelectItem key={w._id} value={w._id}>
                          {w.WHName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Preferred Shipping Method</Label>
                  <Select
                    value={formData.preferredShippingMethod || ""}
                    onValueChange={(val) =>
                      handleSelectChange("preferredShippingMethod", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Air">Air</SelectItem>
                      <SelectItem value="Sea">Sea</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {userInfo.user._id === cust.accountManager &&
                  userInfo.business.subscriptionplan === "Standard" && (
                    <div className="space-y-1.5">
                      <Label>Assign days for sale rep visit</Label>
                      <DaySelector
                        useCase="RouteDays"
                        userData={userInfo}
                        baseUrl={EXPRESS_PRIVATE_URL}
                        id={cust._id}
                      />
                    </div>
                  )}

                <div className="space-y-1.5">
                  <Label>Subscription Plan</Label>
                  <Select
                    value={formData.Subscription?._id || ""}
                    onValueChange={(val) =>
                      handleSelectChange("Subscription", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {data?.Subscription?.map((sub) => (
                        <SelectItem key={sub._id} value={sub._id}>
                          {sub.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* LEDGER */}
        <AccordionItem value="ledger" className="border rounded-lg px-4">
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

        {/* GEO */}
        <AccordionItem value="geo" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Geo‑coordinates
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="w-full h-64 sm:h-80 rounded-lg overflow-hidden border">
              {cust.latitude && cust.longitude ? (
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.google.com/maps?q=${cust.latitude},${cust.longitude}&z=15&output=embed`}
                  allowFullScreen
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
          </AccordionContent>
        </AccordionItem>

        {/* SALES PIPELINE */}
        <AccordionItem value="pipeline" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            Sales Pipeline
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <CustomerSales
              Sales={Sales}
              customer={cust}
              business={userInfo.business}
              Rep={salesPerson}
            />
          </AccordionContent>
        </AccordionItem>

        {/* SUPPORT TICKETS */}
        <AccordionItem value="tickets" className="border rounded-lg px-4">
          <AccordionTrigger className="text-base font-semibold hover:no-underline">
            {data.SupportTicket?.length || 0} Support Tickets
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-4">
            <div className="max-h-80 overflow-y-auto space-y-3">
              {data.SupportTicket?.length > 0 ? (
                data.SupportTicket.map((ticket, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary">{ticket.status}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {ticket.TicketId}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <span className="text-xs font-medium">{ticket.SLA}</span>
                    </div>
                    <p className="text-sm whitespace-pre-line">
                      {ticket.comment}
                    </p>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground text-sm">
                  No support tickets.
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Save Buttons */}
      {userInfo.user.editCustomer && (
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          Save Changes
        </Button>
      )}

      {userInfo.user.raiseInvoice && !userInfo.user.editCustomer && (
        <Button
          type="button"
          onClick={updateServiceLocation}
          className="bg-green-600 hover:bg-green-700"
        >
          Save Changes
        </Button>
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