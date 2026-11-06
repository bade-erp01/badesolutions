"use client";

import React, { useState, useEffect, useMemo } from "react";
import { subscriptionLabel } from "@/lib/subscription";
import {
  UserPlus,
  Search,
  Edit3,
  Loader2,
  X,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import moment from "moment";
import { useRouter, useParams } from "next/navigation";
import {
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../Functions/Mics";
import api from "@/lib/api";
import BuyLicencesButton from "@/app/Components/BuyLicencesButton";
import AddOnsBilling from "@/app/Components/AddOnsBilling";
import { useUser } from "@/components/UserProvider";
import { safeUrl } from "@/lib/security/safeUrl";
import DeliveryFees from "./DeliveryFees";
import CancellationReasons from "./CancellationReasons";
import PriceLists from "./PriceLists";
import EmailSending from "./EmailSending";
import NrsEInvoice from "./NrsEInvoice";

/* Shared Tailwind classes */
const inputCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const selectCls =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const textareaCls =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
const labelCls =
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
const badgeCls =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors";
const tabBtnCls =
  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

export default function SettingsPage({
  userList,
  userData,
  businessInfo,
  baseUrl,
  auditLogs = [],
  customerList,
  storeList,
}) {
  const [activeTab, setActiveTab] = useState("general");
  // Determine user role
  const isAdmin = userData?.user?.isAdmin === true;
  const isHRM = userData?.user?.isHRM === true;
  // ?tab=email (e.g. from the "your email account isn't sending" notification) opens that tab
  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    if (tab && ["general", "users", "notifications", "delivery", "cancellations", "pricelists", "email", "nrs", "audit", "App"].includes(tab)) setActiveTab(tab);
  }, []);
  const [users] = useState(
    userList?.data?.filter((user) => user.isDev !== true) || [],
  );

  // Tabs visibility logic
  let tabs = [];
  if (isAdmin) {
    tabs = [
      { id: "general", label: "Business Account" },
      { id: "users", label: "User and Permission" },
      { id: "notifications", label: "Notifications" },
      { id: "delivery", label: "Delivery Fees" },
      { id: "cancellations", label: "Cancellation Reasons" },
      { id: "pricelists", label: "Price Lists" },
      { id: "email", label: "Email Sending" },
      { id: "nrs", label: "NRS E-Invoice" },
      { id: "audit", label: "Audit Logs" },
      { id: "App", label: "App Store" },
    ];
  } else if (isHRM) {
    tabs = [
      { id: "users", label: "User and Permission" },
    ];
  }

  const logs =
    auditLogs?.length > 0
      ? auditLogs
      : businessInfo?.AuditLog ||
        businessInfo?.auditLogs ||
        businessInfo?.logs ||
        [];

  return (
    <div className="w-full min-w-0">
      <div className="space-y-6 max-w-[1600px]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-2 text-muted-foreground">
            Manage dashboard preferences and system configuration.
          </p>
        </div>

        <div className="inline-flex h-auto flex-wrap items-center justify-center rounded-md bg-muted p-1 text-muted-foreground gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`${tabBtnCls} ${
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "hover:bg-background/50 hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Render tab content only if user has access */}
        {activeTab === "general" && isAdmin && (
          <CompanyProfileForm
            data={businessInfo}
            userData={userData}
            customerList={customerList}
            storeList={storeList}
          />
        )}
        {activeTab === "users" && (isAdmin || isHRM) && <UsersPermissionsPage users={users} />}
        {activeTab === "notifications" && isAdmin && (
          <NotificationSettings data={businessInfo} userData={userData} />
        )}
        {activeTab === "delivery" && isAdmin && <DeliveryFees isAdmin={userData?.user?.isAdmin === true} />}
        {activeTab === "cancellations" && isAdmin && <CancellationReasons isAdmin={isAdmin} />}
        {activeTab === "pricelists" && isAdmin && <PriceLists business={businessInfo} />}
        {activeTab === "email" && isAdmin && (
          <EmailSending
            isAdmin={userData?.user?.isAdmin === true}
            adminEmail={userData?.user?.Email}
            companyName={businessInfo?.companyName}
          />
        )}
        {activeTab === "nrs" && isAdmin && (
          <NrsEInvoice isAdmin={userData?.user?.isAdmin === true} />
        )}
        {activeTab === "audit" && isAdmin && <AuditLogsPanel logs={logs} />}
        {activeTab === "App" && isAdmin && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Button asChild>
                <Link
                  href="/auth/Apps"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  Go to App Store
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

/* ========================================================================
   COMPANY PROFILE FORM
   ======================================================================== */
function CompanyProfileForm({ data, userData, customerList, storeList }) {
  const router = useRouter();
  const [formData, setFormData] = useState(data || {});
  const [modules] = useState(data?.modules || []);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely extract arrays (handles both { data: [] } and plain arrays)
  const customers = Array.isArray(customerList)
    ? customerList
    : customerList?.data || [];

  const stores = Array.isArray(storeList)
    ? storeList
    : storeList?.data || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData?._id) {
      ErrorMessage("Business ID missing");
      return;
    }

    setIsSubmitting(true);
    plsWait("Saving company profile...");

    try {
      const payload = {
        email: formData.email,
        Tel: formData.Tel,
        shopAddress: formData.shopAddress || "",
        companyCity: formData.companyCity || "",
        companyState: formData.companyState || "",
        BusinessType: formData.BusinessType || "",
        industryType: formData.industryType || "",
        website: formData.website || "",
        invoicePolicy: formData.invoicePolicy || "",
        allowPriceChangeOnInvoice: !!formData.allowPriceChangeOnInvoice,
        allowSkuSplitting: !!formData.allowSkuSplitting,
        InvoiceRestriction: !!formData.InvoiceRestriction,
        allowCreditLimit: formData.allowCreditLimit || "",
        clearNotification: formData.clearNotification || "",
        EcommerceStore: formData.EcommerceStore || "",
        posBiller: formData.posBiller || "",
      };

      const res = await api.patch(`/api/account/${formData._id}`, payload);

      const result = res.data;

      if (!res.ok) {
        throw new Error(result?.error || result?.message || (res.status === 0 ? res.error : "Update failed"));
      }

      SuccessToast(result?.message || "Company profile updated successfully");
      router.refresh();
    } catch (err) {
      ErrorMessage(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header Card */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border bg-muted flex items-center justify-center shrink-0">
            {formData.companyLogo ? (
              <img
                src={formData.companyLogo}
                alt={formData.companyName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-2xl font-semibold text-muted-foreground">
                {formData.companyName?.substring(0, 2)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight truncate">
              {formData.companyName}
            </h2>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.isVerified && (
                <span
                  className={`${badgeCls} border-transparent bg-secondary text-secondary-foreground`}
                >
                  ✓ Verified
                </span>
              )}
              {formData.isActive && (
                <span
                  className={`${badgeCls} border-transparent bg-primary text-primary-foreground`}
                >
                  Active
                </span>
              )}
            </div>
          </div>
          <Button
            type="submit"
            size="lg"
            className="shrink-0"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className={labelCls}>Company Name</label>
              <div className="px-3 py-2 border rounded-md bg-muted/50 font-medium">
                {formData.companyName || "—"}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="email" className={labelCls}>
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="Tel" className={labelCls}>
                  Phone Number
                </label>
                <input
                  id="Tel"
                  name="Tel"
                  value={formData.Tel || ""}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="shopAddress" className={labelCls}>
                Shop Address
              </label>
              <textarea
                id="shopAddress"
                name="shopAddress"
                value={formData.shopAddress || ""}
                onChange={handleChange}
                className={textareaCls}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="companyCity" className={labelCls}>
                  City
                </label>
                <input
                  id="companyCity"
                  name="companyCity"
                  value={formData.companyCity || ""}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="companyState" className={labelCls}>
                  State
                </label>
                <input
                  id="companyState"
                  name="companyState"
                  value={formData.companyState || ""}
                  onChange={handleChange}
                  className={inputCls}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="BusinessType" className={labelCls}>
                Business Type
              </label>
              <select
                id="BusinessType"
                name="BusinessType"
                value={formData.BusinessType || ""}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="">Select business type</option>
                <option value="Business">Business</option>
                <option value="Individual">Individual</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="industryType" className={labelCls}>
                Industry
              </label>
              <input
                id="industryType"
                name="industryType"
                value={formData.industryType || ""}
                onChange={handleChange}
                className={inputCls}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="website" className={labelCls}>
                Website
              </label>
              <input
                id="website"
                name="website"
                value={formData.website || ""}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </CardContent>
        </Card>

        {/* Status Flags */}
        {formData.subscriptionplan === "Standard" && (
          <Card>
            <CardHeader>
              <CardTitle>Status Flags</CardTitle>
              <CardDescription>
                Configure business rules and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <label
                    htmlFor="allowPriceChangeOnInvoice"
                    className="text-base cursor-pointer font-medium"
                  >
                    Price Change on Invoice
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {formData.allowPriceChangeOnInvoice
                      ? "Allowed"
                      : "Blocked"}
                  </p>
                </div>
                <Switch
                  id="allowPriceChangeOnInvoice"
                  checked={!!formData.allowPriceChangeOnInvoice}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowPriceChangeOnInvoice: checked,
                    }))
                  }
                />
              </div>

              <hr className="border-border" />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <label
                    htmlFor="allowSkuSplitting"
                    className="text-base cursor-pointer font-medium"
                  >
                    Product SKU Splitting
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {formData.allowSkuSplitting ? "Allowed" : "Blocked"}
                  </p>
                </div>
                <Switch
                  id="allowSkuSplitting"
                  checked={!!formData.allowSkuSplitting}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      allowSkuSplitting: checked,
                    }))
                  }
                />
              </div>

              <hr className="border-border" />

              <div className="flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <label
                    htmlFor="InvoiceRestriction"
                    className="text-base cursor-pointer font-medium"
                  >
                    Invoice Restriction
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {formData.InvoiceRestriction
                      ? "No restriction on Draft Sales"
                      : "Apply restriction after 24 hours"}
                  </p>
                </div>
                <Switch
                  id="InvoiceRestriction"
                  checked={!!formData.InvoiceRestriction}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      InvoiceRestriction: checked,
                    }))
                  }
                />
              </div>

              <hr className="border-border" />

              <div className="space-y-2">
                <label htmlFor="allowCreditLimit" className={labelCls}>
                  Credit Limit Application
                </label>
                <select
                  id="allowCreditLimit"
                  name="allowCreditLimit"
                  value={formData.allowCreditLimit || ""}
                  onChange={handleChange}
                  className={selectCls}
                >
                  <option value="">
                    This doesn&apos;t apply to my business
                  </option>
                  <option value="Customer">Customers</option>
                  <option value="Warehouse">Warehouse</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="EcommerceStore" className={labelCls}>
                  E-commerce Store
                </label>
                <select
                  id="EcommerceStore"
                  name="EcommerceStore"
                  value={formData.EcommerceStore || ""}
                  onChange={handleChange}
                  className={selectCls}
                >
                  <option value="">Select a warehouse</option>
                  {stores.map((store) => (
                    <option key={store._id} value={store._id}>
                      {store.WHName || store.name || "Unnamed Store"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="posBiller" className={labelCls}>
                  P.O.S Biller
                </label>
                <select
                  id="posBiller"
                  name="posBiller"
                  value={formData.posBiller || ""}
                  onChange={handleChange}
                  className={selectCls}
                >
                  <option value="">Choose from customer list</option>
                  {customers.map((customer) => (
                    <option key={customer._id} value={customer._id}>
                      {customer.Username ||
                        customer.customerName ||
                        customer.name ||
                        "Unnamed Customer"}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Subscription Details — read only */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
            <span className={`${badgeCls} border text-foreground`}>
              {subscriptionLabel(formData.subscriptionEndDate) || "Subscription has expired."}
            </span>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex flex-wrap justify-between items-start gap-2">
              <div>
                <p className="text-sm text-muted-foreground">Plan</p>
                <p className="font-semibold text-lg">
                  {formData.subscriptionplan}
                </p>
              </div>
              <span className={`${badgeCls} border text-foreground`}>
                Expires: {formData.subscriptionEndDate || "—"}
              </span>
            </div>
            <hr className="border-border" />
            <div className="flex flex-wrap justify-between gap-2 text-sm">
              <div>
                Amount: ₦
                {Number(formData.SubcriptionAmount || 0).toLocaleString()}
              </div>
              <div className="flex items-center gap-3">
                <span>Pending License: {formData.Pendinglicense}</span>
                <BuyLicencesButton plan={formData.subscriptionplan} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly apps and SMS credit (shown to admins of businesses on add-on billing) */}
        <AddOnsBilling />

        {/* Services */}
        <Card>
          <CardHeader>
            <CardTitle>🛎 Services</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="clearNotification" className={labelCls}>
                Clear In-App Notifications
              </label>
              <select
                id="clearNotification"
                name="clearNotification"
                value={formData.clearNotification || ""}
                onChange={handleChange}
                className={selectCls}
              >
                <option value="">Leave Forever</option>
                <option value="Daily">Daily</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="invoicePolicy" className={labelCls}>
                Invoice Policy
              </label>
              <input
                id="invoicePolicy"
                name="invoicePolicy"
                value={formData.invoicePolicy || ""}
                onChange={handleChange}
                className={inputCls}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modules */}
      <Card>
        <CardHeader>
          <CardTitle>Modules</CardTitle>
          <CardDescription>
            System modules and installation status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((module, index) => (
              <Card key={module._id || index} className="border">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="font-semibold min-w-0 break-words">{module.Name}</div>
                    <span
                      className={`${badgeCls} border-transparent ${
                        module.installed
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground"
                      }`}
                    >
                      Installed
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {module.Description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </form>
  );
}

/* ========================================================================
   AUDIT LOGS
   ======================================================================== */
function AuditLogsPanel({ logs = [] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return logs;
    return logs.filter(
      (log) =>
        (log.logMsg || "").toLowerCase().includes(q) ||
        (log.reason || "").toLowerCase().includes(q) ||
        (log.url || "").toLowerCase().includes(q),
    );
  }, [logs, search]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>
          System activity and changes history.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${inputCls} pl-10`}
          />
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            {logs.length === 0
              ? "No audit logs available."
              : "No logs match your search."}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Message</th>
                  <th className="text-left py-3 px-4 font-medium">Reason</th>
                  <th className="text-left py-3 px-4 font-medium">URL</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log, i) => (
                  <tr
                    key={i}
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                      {log.date
                        ? moment(log.date).format("DD MMM YYYY, hh:mm A")
                        : "—"}
                    </td>
                    <td className="py-3 px-4 font-medium max-w-[280px]">
                      {log.logMsg || "—"}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-[200px]">
                      {log.reason || "—"}
                    </td>
                    <td className="py-3 px-4">
                      {log.url ? (
                        <a
                          href={safeUrl(log.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {log.url}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ========================================================================
   USERS & PERMISSIONS
   ======================================================================== */
function UsersPermissionsPage({ users }) {
  const [usersList] = useState(users || []);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const Path = useParams();
  const currentUser = useUser();
  const pageSize = 10;

  const [newUser, setNewUser] = useState({
    firstName: "",
    lastName: "",
    Email: "",
    telephone: "",
    DOB: "",
  });

  const filteredUsers = useMemo(() => {
    return [...usersList]
      .sort((a, b) => {
        const nameA = (a.firstName || "").toLowerCase();
        const nameB = (b.firstName || "").toLowerCase();
        return nameA.localeCompare(nameB);
      })
      .filter((user) => {
        const search = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !search ||
          (user.firstName || "").toLowerCase().includes(search) ||
          (user.lastName || "").toLowerCase().includes(search) ||
          (user.Email || "").toLowerCase().includes(search);
        const matchesStatus =
          selectedStatus === "All" ||
          (user.status || "").toLowerCase() === selectedStatus.toLowerCase();
        return matchesSearch && matchesStatus;
      });
  }, [usersList, searchTerm, selectedStatus]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus]);

  const resetForm = () => {
    setNewUser({
      firstName: "",
      lastName: "",
      Email: "",
      telephone: "",
      DOB: "",
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUser.firstName.trim() || !newUser.Email.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        Email: newUser.Email.trim(),
        telephone: newUser.telephone.trim(),
        DOB: newUser.DOB,
      };

      const req = await api.post(
        `/api/createUser/${currentUser.user.user._id}`,
        payload,
      );

      const res = req.data;
      if (!req.ok) {
        throw new Error(res?.message || (req.status === 0 ? req.error : "Failed to create user"));
      }

      resetForm();
      SuccessToast("User created successfully");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      ErrorMessage(
        error.message || "Something went wrong while creating the user",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserId = (user) => user._id || user.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">User Management</h2>
          <p className="text-muted-foreground mt-1">
            Manage user accounts, roles, and access permissions
          </p>
        </div>
        {(currentUser?.user.isAdmin) && (
          <Button onClick={() => setIsModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search users by name or email..."
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`${inputCls} pl-10`}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className={`${selectCls} w-full sm:w-48`}
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            All Users • {filteredUsers.length} result
            {filteredUsers.length !== 1 ? "s" : ""}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 sm:px-6 font-medium">
                    User
                  </th>
                  <th className="text-left py-4 px-4 sm:px-6 font-medium">
                    Status
                  </th>
                  <th className="text-right py-4 px-4 sm:px-6 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((user) => (
                    <tr
                      key={getUserId(user)}
                      className="border-b hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4 sm:px-6">
                        <div className="font-medium">
                          {user.firstName} {user.lastName}
                        </div>
                        <a
                          href={`mailto:${user.Email}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                        >
                          {user.Email}
                        </a>
                      </td>
                      <td className="py-4 px-4 sm:px-6">
                        <span
                          className={`${badgeCls} ${
                            user.status?.toLowerCase() === "active"
                              ? "border-transparent bg-primary text-primary-foreground"
                              : "border-transparent bg-secondary text-secondary-foreground"
                          }`}
                        >
                          {user.status || "—"}
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer"
                          onClick={() =>
                            router.push(
                              `/${Path.auth}/V4/users/users/${getUserId(user)}`,
                            )
                          }
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="text-center py-12 text-muted-foreground"
                    >
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * pageSize + 1} to{" "}
                {Math.min(currentPage * pageSize, filteredUsers.length)} of{" "}
                {filteredUsers.length} users
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => {
                      if (totalPages <= 5) return true;
                      return (
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                      );
                    })
                    .map((page, index, arr) => (
                      <div key={page} className="flex items-center">
                        {index > 0 && arr[index - 1] !== page - 1 && (
                          <span className="px-1 text-muted-foreground">…</span>
                        )}
                        <Button
                          variant={
                            currentPage === page ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </div>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background text-foreground rounded-2xl w-full max-w-lg max-h-[90dvh] overflow-hidden border shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b shrink-0">
              <div className="flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-semibold">Add New User</h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <form
              onSubmit={handleAddUser}
              className="p-4 sm:p-6 space-y-5 overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="firstName" className={labelCls}>
                    First Name
                  </label>
                  <input
                    id="firstName"
                    required
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    placeholder="John"
                    className={inputCls}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className={labelCls}>
                    Last Name
                  </label>
                  <input
                    id="lastName"
                    required
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    placeholder="Doe"
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className={labelCls}>
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={newUser.Email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, Email: e.target.value })
                  }
                  placeholder={
                    currentUser?.user?.business?.email || "user@example.com"
                  }
                  className={inputCls}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="telephone" className={labelCls}>
                  Telephone
                </label>
                <input
                  id="telephone"
                  type="tel"
                  value={newUser.telephone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, telephone: e.target.value })
                  }
                  placeholder="+234 901 234 5678"
                  className={inputCls}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="dob" className={labelCls}>
                  Date of Birth
                </label>
                <input
                  id="dob"
                  type="date"
                  value={newUser.DOB}
                  onChange={(e) =>
                    setNewUser({ ...newUser, DOB: e.target.value })
                  }
                  className={inputCls}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create User"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ========================================================================
   NOTIFICATION SETTINGS
   ======================================================================== */
function NotificationSettings({ data, userData, onSubmit }) {
  const router = useRouter();
  const [settings, setSettings] = useState({
    dailyReport: data?.dailyReport || false,
    monthlyCutStatement: data?.monthlyCutStatement || false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data?._id) {
      ErrorMessage("Business ID missing");
      return;
    }

    setIsSubmitting(true);
    plsWait("Saving notification settings...");

    try {
      const payload = {
        dailyReport: settings.dailyReport,
        monthlyCutStatement: settings.monthlyCutStatement,
      };

      const res = await api.patch(`/api/account/${data._id}`, payload);

      const result = res.data;

      if (!res.ok) {
        throw new Error(result?.error || result?.message || (res.status === 0 ? res.error : "Update failed"));
      }

      SuccessToast(result?.message || "Notification settings saved");
      if (onSubmit) onSubmit(settings);
      router.refresh();
    } catch (err) {
      ErrorMessage(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>
            Enable services below.{" "}
            <span className="text-amber-600 font-medium">
              Each activated service incurs additional cost.
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between gap-4 py-1">
            <div className="space-y-1 min-w-0">
              <label
                htmlFor="dailyReport"
                className="text-base cursor-pointer font-medium"
              >
                Daily Business Report
              </label>
              <p className="text-sm text-muted-foreground">
                Send report to {data?.email?.substring(0, 6)}***
              </p>
            </div>
            <Switch
              id="dailyReport"
              checked={settings.dailyReport}
              onCheckedChange={() => handleToggle("dailyReport")}
            />
          </div>

          <hr className="border-border" />

          <div className="flex items-center justify-between gap-4 py-1">
            <div className="space-y-1 min-w-0">
              <label
                htmlFor="monthlyCutStatement"
                className="text-base cursor-pointer font-medium"
              >
                Monthly Customer Statements
              </label>
              <p className="text-sm text-muted-foreground">
                Generate and send statements automatically
              </p>
            </div>
            <Switch
              id="monthlyCutStatement"
              checked={settings.monthlyCutStatement}
              onCheckedChange={() => handleToggle("monthlyCutStatement")}
            />
          </div>

          <div className="mt-6 pt-4 border-t border-border bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
            <div className="flex gap-3">
              <div className="text-amber-600 mt-0.5 text-lg">⚠️</div>
              <div className="text-sm">
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  Additional Cost Notice
                </p>
                <p className="text-amber-600/80 dark:text-amber-500">
                  Each service you turn on may attract extra charges depending
                  on your current subscription plan. You will be notified before
                  any billing occurs.
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardContent className="pt-0 pb-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}