"use client";

import Image from "next/image";
import { PhotoIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import TermsAndConditionsLink from "@/app/Components/TermsAndCondition";
import Swal from "sweetalert2";
import Link from "next/link";
import { useState } from "react";
import moment from "moment";
import currency from "../../../../data/currencies.json";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  ErrorMessage,
  plsWait,
  SuccessToast,
} from "../../../../../Functions/Mics";
import { Encrypt, Dencrypt, pricelistSetter } from "../../../../../Functions/Functions";
import { Badge } from "@/components/ui/badge";

// shadcn/ui imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function BusinessDatas({ data, userInfo, baseUrl }) {
  const navigation = useRouter();
  const [formData, setFormData] = useState(data);
  const [currencies] = useState(currency);

  // Helper function to truncate text to 10 characters
  const truncate = (str) =>
    str && str.length > 10 ? str.substring(0, 15) + "..." : str;

  // upload
  const uploadFiles = async (id, moduleList) => {
    try {
      const { value: file } = await Swal.fire({
        title: "Select File",
        input: "file",
        inputAttributes: {
          accept: "image/*",
          "aria-label": "Upload your File",
        },
      });
      if (file) {
        plsWait("Uploading...⌛");
        const reader = new FileReader();
        reader.onload = async (e) => {
          // Resize image
          const img = new window.Image();
          img.onload = async () => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const maxWidth = 800;
            const maxHeight = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height *= maxWidth / width;
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width *= maxHeight / height;
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const resizedImage = canvas.toDataURL("image/jpeg", 0.7);

            const request = await fetch(
              `${baseUrl}/api/images/upload?id=${id}&module=${moduleList}`,
              {
                method: "POST",
                body: JSON.stringify({ image: resizedImage }),
                headers: {
                  "Content-Type": "application/json",
                  dbConnect: `Bearer ${userInfo.business.rustyRoof}`,
                  access: `${Encrypt(userInfo.user._id)}`,
                },
              },
            );

            const response = await request.json();
            if (response.message) {
              Swal.fire({
                title: "Your uploaded File",
                imageUrl: resizedImage,
                imageAlt: "The uploaded File",
              });
              location.reload();
            }
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      ErrorMessage("Error uploading file:", error.message);
    }
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
      access: `${Encrypt(userInfo.user._id)}`,
      sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Submitting Business update...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const url = `${baseUrl}/api/account/${Encrypt(formData._id)}`;
      const { data: responseData } = await axios.patch(url, formData, config);

      if (responseData && responseData.message) {
        SuccessToast(responseData.message);
        setFormData(Dencrypt(responseData.data));
        navigation.refresh();
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  const handlecurrencyChange = (currencyObj) => {
    setFormData((prev) => ({
      ...prev,
      currency: currencyObj,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-full p-6 bg-background shadow-2xl border rounded-xl space-y-8 text-sm m-2"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Business Profile
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your business information and settings
          </p>
        </div>

        <Badge
          variant={formData.isVerified ? "default" : "destructive"}
          className="text-base px-6 py-1.5 font-semibold"
        >
          {formData.isVerified ? "Verified Account" : "Not Verified"}
        </Badge>
      </div>

      {/* Avatar & Quick Links */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-8 items-center">
            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-muted border-4 border-border shadow-sm flex items-center justify-center">
                {formData.companyLogo ? (
                  <Image
                    width={200}
                    height={200}
                    quality={90}
                    src={formData.companyLogo}
                    priority
                    alt="Business Logo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl text-muted-foreground font-semibold">
                    {formData.companyName?.charAt(0) || "B"}
                  </div>
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => uploadFiles(Encrypt(formData._id), "Business")}
                className="flex items-center gap-2"
              >
                <PhotoIcon className="h-5 w-5" />
                Upload Logo
              </Button>
            </div>

            <div className="hidden md:block h-24 border-l border-border mx-6" />

            {/* Add User Button */}
            <Link
              href={`/${data?.companyName
                .toLowerCase()
                .replace(/\s+/g, "-")
                .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                userInfo?.user._id,
              )}/Module/Forms/employee`}
            >
              <Button
                className="flex items-center gap-2 text-base h-12 px-6"
                size="lg"
              >
                <UserPlusIcon className="h-5 w-5" />
                Add User
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            ⚙️ Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {userInfo.user.isAdmin && formData.isActive && (
              <TermsAndConditionsLink BusinessPlan={data.subscriptionplan} />
            )}

            {userInfo.user.isAdmin && formData.subscriptionplan === "Basic" && (
              <Button variant="outline" className="flex items-center gap-2">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 17l4 4 4-4m0-5V3m-8 4h8"
                  />
                </svg>
                Upgrade Plan
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Identity */}
      <Card>
        <CardHeader>
          <CardTitle>Identity</CardTitle>
          <CardDescription>Core business identification details</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Business Name</Label>
            <Input value={formData.companyName} disabled />
          </div>
          <div className="space-y-2">
            <Label>Tenant ID</Label>
            <Input value={formData.tenantId} type="password" disabled />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={formData.email} type="email" disabled />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input value={formData.Tel} disabled />
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
          <div className="space-y-2">
            <Label htmlFor="BusinessType">Business Type</Label>
            <Select
              value={formData.BusinessType}
              onValueChange={(value) => handleSelectChange("BusinessType", value)}
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
        </CardContent>
      </Card>

      {/* Subscription Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Info</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Subscription Validity</Label>
            <Input
              value={formData.subscriptionEndDate}
              type="date"
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label>Current Plan</Label>
            <Input value={formData.subscriptionplan} disabled />
          </div>
          <div className="space-y-2">
            <Label>Pending User Licenses</Label>
            <Input value={formData.Pendinglicense} disabled />
          </div>
          <div className="pt-2">
            <p className="text-sm font-medium text-foreground">
              {moment(formData.subscriptionEndDate).isValid() &&
              moment(formData.subscriptionEndDate).isAfter(moment())
                ? `Subscription ends in ${moment(
                    formData.subscriptionEndDate,
                  ).diff(moment(), "days")} day(s)`
                : "Subscription has expired."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
          <div className="space-y-2">
            <Label htmlFor="shopAddress">Address</Label>
            <Input
              id="shopAddress"
              name="shopAddress"
              value={formData.shopAddress}
              onChange={handleChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Financials */}
      <Card>
        <CardHeader>
          <CardTitle>Financials</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="currency">Country & Currency</Label>
            <Select
              value={formData.currency?.currency?.CountryName || ""}
              onValueChange={(value) => {
                const selected = currencies.find(
                  (c) => c.CountryName === value
                );
                if (selected) handlecurrencyChange(selected);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((num) => (
                  <SelectItem key={num.CountryName} value={num.CountryName}>
                    {num.CountryName} • {num.Symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allowCreditLimit">Credit Limit Application</Label>
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
                <SelectItem value="">This doesn&apos;t apply to my business</SelectItem>
                <SelectItem value="Customer">Customers</SelectItem>
                <SelectItem value="Warehouse">Warehouse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Status Flags */}
      {userInfo.business.subscriptionplan === "Standard" && (
        <Card>
          <CardHeader>
            <CardTitle>Status Flags</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-3">
              <Checkbox
                id="dailyReport"
                checked={formData.dailyReport}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, dailyReport: checked }))
                }
              />
              <Label htmlFor="dailyReport" className="cursor-pointer">
                Send Daily Business Report to {formData.email?.substring(0, 6)}
                ***
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="monthlyCutStatement"
                checked={formData.monthlyCutStatement}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, monthlyCutStatement: checked }))
                }
              />
              <Label htmlFor="monthlyCutStatement" className="cursor-pointer">
                Generate and send monthly Statements to my Customers
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="allowPriceChangeOnInvoice"
                checked={formData.allowPriceChangeOnInvoice}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, allowPriceChangeOnInvoice: checked }))
                }
              />
              <Label htmlFor="allowPriceChangeOnInvoice" className="cursor-pointer">
                {formData.allowPriceChangeOnInvoice
                  ? "Price Change on Invoice Allowed"
                  : "Block Price Change on Invoice"}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="allowSkuSplitting"
                checked={formData.allowSkuSplitting}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, allowSkuSplitting: checked }))
                }
              />
              <Label htmlFor="allowSkuSplitting" className="cursor-pointer">
                {formData.allowSkuSplitting
                  ? "Product Splitting Allowed"
                  : "Product Splitting Blocked"}
              </Label>
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="InvoiceRestriction"
                checked={formData.InvoiceRestriction}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, InvoiceRestriction: checked }))
                }
              />
              <Label htmlFor="InvoiceRestriction" className="cursor-pointer">
                {formData.InvoiceRestriction
                  ? "Do not apply Restriction on Draft sales"
                  : "Apply Restriction on Draft sales After 24Hrs"}
              </Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services */}
      <Card>
        <CardHeader>
          <CardTitle>🛎 Services</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="clearNotification">Clear In-App Notifications</Label>
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

      {/* Installed Business Apps */}
      <Card>
        <CardHeader>
          <CardTitle>Installed Business Apps</CardTitle>
        </CardHeader>
        <CardContent>
          {data && data.modules?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.modules.map((mod) => (
                <Link
                  key={mod._id}
                  href="#"
                  className="block group"
                >
                  <div className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:shadow-md transition-all duration-200 h-full">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={mod.icon || "/preview.png"}
                        width={64}
                        height={64}
                        alt={mod.Name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                        {truncate(mod.Name)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Installed</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic py-8 text-center">
              No modules installed yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit */}
      {userInfo.user.isAdmin && (
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            size="lg"
            className="px-10 text-base font-medium"
          >
            Save Changes
          </Button>
        </div>
      )}
    </form>
  );
}