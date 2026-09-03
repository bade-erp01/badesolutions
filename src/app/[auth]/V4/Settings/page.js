"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Settings as SettingsIcon,
  UserPlus,
  Search,
  Edit3,
  Loader2,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import moment from "moment";
import { ExternalLink } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { ErrorMessage, SuccessToast, plsWait } from "../../../../../Functions/Mics"
import { Encrypt, Dencrypt ,EXPRESS_PRIVATE_URL} from "../../../../../Functions/Functions";
import { useUser } from "@/components/UserProvider";

export default function SettingsPage({
  userList,
  userData,
  businessInfo,
  baseUrl,
}) {
  const [activeTab, setActiveTab] = useState("general");
  const [users] = useState(userList.data.filter((user) => user.isDev !== true));
  const [dashboardPrefs, setDashboardPrefs] = useState({
    compactMode: false,
    showProgressOnCards: true,
    enableAutoRefresh: true,
  });
  

  const [notifications, setNotifications] = useState({
    email: true,
    WhatsApp: true,
    inApp: true,
    dailySummary: true,
    issueAlerts: true,
    escalation: true,
  });

  const updateNotification = (key, value) => {
    setNotifications((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Settings Content */}
        <div className="flex-1 overflow-auto">
          <div className="">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="mt-2 text-muted-foreground">
                Manage dashboard preferences and system configuration.
              </p>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="h-auto flex-wrap">
                <TabsTrigger value="general">Business Account</TabsTrigger>
                <TabsTrigger value="users">User and Permission</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                <TabsTrigger value="App">App Store</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* General Tab */}
            {activeTab === "general" && (
              <div>
                <CompanyProfileForm data={businessInfo} userData={userData} />
              </div>
            )}

            {/* Users & Permissions Tab */}
            {activeTab === "users" && <UsersPermissionsPage users={users} />}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <NotificationSettings data={businessInfo} />
            )}

            {/* Audit Logs Tab */}
            {activeTab === "audit" && (
              <Card>
                <CardHeader>
                  <CardTitle>Audit Logs</CardTitle>
                  <CardDescription>
                    System activity and changes history.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-12">
                    Audit logs will be displayed here.
                  </p>
                </CardContent>
              </Card>
            )}

            {activeTab === "App" && (
              <Card className="mt-3">
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
      </div>
    </div>
  );
}

// ====================== USERS & PERMISSIONS PAGE ======================

export function UsersPermissionsPage({ users }) {
  const [usersList, setUsersList] = useState(users || []);
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

  // Optimized filtering + sorting (non-mutating)
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

  // Reset to page 1 when filters change
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

      const req = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/createUser/${Encrypt(currentUser.user.user._id)}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(currentUser.user.business.tenantId)}`,
            access: `${Encrypt(currentUser.user.user._id)}`,
            sessionKey: `Bearer ${Encrypt(currentUser.user.SessionId)}`,
          },
        }
      );

      const res = await req.json();

      if (!req.ok) {
        throw new Error(res?.message || "Failed to create user");
      }

      // Optimistically add the new user
      const createdUser = res?.data || res?.user || {
        ...payload,
        _id: res?._id || Date.now().toString(),
        status: "Active",
      };

      resetForm();
      SuccessToast("User created successfully");
      setIsModalOpen(false);
      router.refresh();
      // router.push(`/${Path.auth}/V4/users/users/${createdUser.user}`);
    } catch (error) {
      ErrorMessage(error.message || "Something went wrong while creating the user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getUserId = (user) => user._id || user.id;

  return (
    <div className="flex overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold">User Management</h1>
              <p className="text-muted-foreground mt-1">
                Manage user accounts, roles, and access permissions
              </p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add New User
            </Button>
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name or email..."
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
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
                              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                            >
                              {user.Email}
                            </a>
                          </td>
                          <td className="py-4 px-4 sm:px-6">
                            <Badge
                              variant={
                                user.status?.toLowerCase() === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {user.status || "—"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 sm:px-6 text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="cursor-pointer"
                              onClick={() =>
                                router.push(
                                  `/${Path.auth}/V4/users/users/${Encrypt(
                                    getUserId(user)
                                  )}`
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, filteredUsers.length)} of{" "}
                    {filteredUsers.length} users
                  </div>

                  <div className="flex items-center gap-2">
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
                              <span className="px-1 text-muted-foreground">
                                …
                              </span>
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
                        setCurrentPage((prev) =>
                          Math.min(prev + 1, totalPages)
                        )
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
        </div>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background text-foreground rounded-2xl w-full max-w-lg max-h-[90vh] overflow-hidden border shadow-xl">
            <div className="flex items-center justify-between p-6 border-b">
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
              className="p-6 space-y-5 overflow-auto max-h-[calc(90vh-80px)]"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    required
                    value={newUser.firstName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, firstName: e.target.value })
                    }
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    required
                    value={newUser.lastName}
                    onChange={(e) =>
                      setNewUser({ ...newUser, lastName: e.target.value })
                    }
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telephone">Telephone</Label>
                <Input
                  id="telephone"
                  type="tel"
                  value={newUser.telephone}
                  onChange={(e) =>
                    setNewUser({ ...newUser, telephone: e.target.value })
                  }
                  placeholder="+234 901 234 5678"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input
                  id="dob"
                  type="date"
                  value={newUser.DOB}
                  onChange={(e) =>
                    setNewUser({ ...newUser, DOB: e.target.value })
                  }
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

import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CompanyProfileForm = ({ data, userData }) => {
  const [formData, setFormData] = useState(data);
  const [modules] = useState(data.modules);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Updated Data:", formData);
    // Add your save logic here (API call, etc.)
    alert("Company profile updated successfully!");
  };

  return (
    <div className="space-y-4 mt-3 overflow-hidden">
      <form onSubmit={handleSubmit} className=" overflow-hidden">
        {/* Header */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage
                src={formData.companyLogo}
                alt={formData.companyName}
              />
              <AvatarFallback className="text-2xl">
                {formData.companyName?.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-3xl">{formData.companyName}</CardTitle>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">✓ Verified</Badge>
                <Badge variant="default">Active</Badge>
              </div>
            </div>
            <Button type="submit" size="lg">
              Save Changes
            </Button>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 m-3">
          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="Tel">Phone Number</Label>
                  <Input
                    id="Tel"
                    name="Tel"
                    value={formData.Tel}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shopAddress">Shop Address</Label>
                <Textarea
                  id="shopAddress"
                  name="shopAddress"
                  value={formData.shopAddress}
                  onChange={handleChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyCity">City</Label>
                  <Input
                    id="companyCity"
                    name="companyCity"
                    value={formData.companyCity}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyState">State</Label>
                  <Input
                    id="companyState"
                    name="companyState"
                    value={formData.companyState}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="BusinessType">Business Type</Label>
                <Select
                  value={formData.BusinessType}
                  onValueChange={(value) =>
                    handleSelectChange("BusinessType", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Business">Business</SelectItem>
                    <SelectItem value="Individual">Individual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industryType">Industry</Label>
                <Input
                  id="industryType"
                  name="industryType"
                  value={formData.industryType}
                  onChange={handleChange}
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
                <div className="grid grid-cols-1 gap-6">
                  {/* Allow Price Change */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label
                        htmlFor="allowPriceChangeOnInvoice"
                        className="text-base cursor-pointer"
                      >
                        Price Change on Invoice
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.allowPriceChangeOnInvoice
                          ? "Allowed"
                          : "Blocked"}
                      </p>
                    </div>
                    <Switch
                      id="allowPriceChangeOnInvoice"
                      checked={formData.allowPriceChangeOnInvoice}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          allowPriceChangeOnInvoice: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  {/* Allow SKU Splitting */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label
                        htmlFor="allowSkuSplitting"
                        className="text-base cursor-pointer"
                      >
                        Product SKU Splitting
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.allowSkuSplitting ? "Allowed" : "Blocked"}
                      </p>
                    </div>
                    <Switch
                      id="allowSkuSplitting"
                      checked={formData.allowSkuSplitting}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          allowSkuSplitting: checked,
                        }))
                      }
                    />
                  </div>

                  <Separator />

                  {/* Invoice Restriction */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label
                        htmlFor="InvoiceRestriction"
                        className="text-base cursor-pointer"
                      >
                        Invoice Restriction
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.InvoiceRestriction
                          ? "No restriction on Draft Sales"
                          : "Apply restriction after 24 hours"}
                      </p>
                    </div>
                    <Switch
                      id="InvoiceRestriction"
                      checked={formData.InvoiceRestriction}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({
                          ...prev,
                          InvoiceRestriction: checked,
                        }))
                      }
                    />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Label htmlFor="allowCreditLimit">
                      Credit Limit Application
                    </Label>
                    <Select
                      value={formData.allowCreditLimit || ""}
                      onValueChange={(value) =>
                        handleSelectChange("allowCreditLimit", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select credit option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">
                          This doesn&apos;t apply to my business
                        </SelectItem>
                        <SelectItem value="Customer">Customers</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Info (Read Only) */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <Badge variant="outline">
                {moment(formData.subscriptionEndDate).isValid() &&
                moment(formData.subscriptionEndDate).isAfter(moment())
                  ? `Subscription ends in ${moment(
                      formData.subscriptionEndDate,
                    ).diff(moment(), "days")} day(s)`
                  : "Subscription has expired."}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="font-semibold text-lg">
                    {formData.subscriptionplan}
                  </p>
                </div>
                <Badge variant="outline">
                  Expires: {formData.subscriptionEndDate}
                </Badge>
              </div>
              <Separator />
              <div className="flex justify-between">
                <div>Amount: {formData.SubcriptionAmount}</div>
                <div>Pending License: {formData.Pendinglicense}</div>
              </div>
              <Separator />
              <div className="flex justify-between">
                <div>Notifications Token</div>
                <div className="text-md font-bold">0</div>
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle>🛎 Services</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="clearNotification">
                  Clear In-App Notifications
                </Label>
                <Select
                  value={formData.clearNotification || ""}
                  onValueChange={(value) =>
                    handleSelectChange("clearNotification", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select notification policy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Leave Forever</SelectItem>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoicePolicy">Invoice Policy</Label>
                <Input
                  id="invoicePolicy"
                  name="invoicePolicy"
                  value={formData.invoicePolicy}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modules - Display Only */}
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
                <Card key={index} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="font-semibold">{module.Name}</div>
                      <Badge variant={"default"}>Installed</Badge>
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

        {/* Invoice Policy */}
        {/* <Card>
          <CardHeader>
            <CardTitle>Invoice Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="invoicePolicy">Invoice Footer Message</Label>
              <Textarea
                id="invoicePolicy"
                name="invoicePolicy"
                rows={3}
                value={formData.invoicePolicy}
                onChange={handleChange}
              />
            </div>
          </CardContent>
        </Card> */}
      </form>
    </div>
  );
};

const NotificationSettings = ({ data, onSubmit }) => {
  const [settings, setSettings] = React.useState({
    dailyReport: data?.dailyReport || false,
    monthlyCutStatement: data?.monthlyCutStatement || false,
  });

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(settings);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mt-3">
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
          {/* Daily Business Report */}
          <div className="flex items-center justify-between py-1">
            <div className="space-y-1">
              <Label htmlFor="dailyReport" className="text-base cursor-pointer">
                Daily Business Report
              </Label>
              <p className="text-sm text-muted-foreground">
                Send report to {data.email?.substring(0, 6)}***
              </p>
            </div>
            <Switch
              id="dailyReport"
              checked={settings.dailyReport}
              onCheckedChange={() => handleToggle("dailyReport")}
            />
          </div>

          <Separator />

          {/* Monthly Customer Statements */}
          <div className="flex items-center justify-between py-1">
            <div className="space-y-1">
              <Label
                htmlFor="monthlyCutStatement"
                className="text-base cursor-pointer"
              >
                Monthly Customer Statements
              </Label>
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

          {/* Additional Cost Notice */}
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
          <Button type="submit" className="">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </form>
  );
};
