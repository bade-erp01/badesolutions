"use client";
import Card from "@/app/Components/Card";
import Image from "next/image";
import { PhotoIcon, } from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import Link from "next/link";
import { useState } from "react";
import moment from "moment";
import currency from "../../../../data/currencies.json";
import axios from "axios";
import { useRouter } from "next/navigation";
import RenewButton from "@/app/Components/Renew"
import {
  Encrypt,
  ErrorMessage,
  plsWait,
  SuccessToast,
} from "../../../../../Functions/Mics";
import {EXPRESS_PRIVATE_URL} from "../../../../../Functions/Functions"

export default function BusinessDatas({ data, userInfo }) {
  const navigation = useRouter();
  const [formData, setFormData] = useState(data);
  const [currencies] = useState(currency);

    // Helper function to truncate text to 10 characters
  const truncate = (str) => (str && str.length > 10 ? str.substring(0, 15) + "..." : str);




  // upload
   const uploadFiles = async (id,moduleList) => {
      try {
        const { value: file } = await Swal.fire({
          title: "Select File",
          input: "file",
          inputAttributes: {
            "accept": "image/*",
            "aria-label": "Upload your File"
          }
        });
        if (file) {
          plsWait('Uploading...⌛')
          const reader = new FileReader();
          reader.onload = async (e) => {
            // Resize image
            const img = new window.Image();
            img.onload = async () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              const maxWidth = 800; // Set your desired max width
              const maxHeight = 600; // Set your desired max height
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
              
              const resizedImage = canvas.toDataURL('image/jpeg', 0.7); // Adjust quality as needed
    
              const request = await fetch(`${EXPRESS_PRIVATE_URL}/api/images/upload?id=${id}&module=${moduleList}`, {
                method: "POST",
                body: JSON.stringify({ image: resizedImage }),
                headers: {
                  'Content-Type': 'application/json',
                },
              });
    
              const response = await request.json();
              if(response.message){
                Swal.fire({
                title: "Your uploaded File",
                imageUrl: resizedImage,
                imageAlt: "The uploaded File"
              });
                location.reload();
              }
    
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      } catch (error) {
        ErrorMessage('Error uploading file:', error.message);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Submitting Business update...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const url = `/api/account/${Encrypt(formData._id)}`;
      // Await axios call directly
      const { data } = await axios.patch(url, formData, config);

      if (data && data.message) {
        SuccessToast(data.message);
        setFormData(data.data);
        navigation.refresh();
      } else {
        throw new Error("Something went wrong");
      }
    } catch (error) {
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  const handlecurrencyChange = (currency) => {
    setFormData((prev) => ({
      ...prev,
      currency,
    }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-5xl mx-3 p-6 bg-[#fafafa] shadow-2xl border-1 space-y-8  text-xs"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h4 className="text-xl font-bold text-gray-800">
          {formData.companyName.charAt(0).toUpperCase() +
            formData.companyName.slice(1)}
          &apos;s Business profile
        </h4>
        <span
          className={`px-5 py-1.5 rounded-full font-semibold text-base tracking-wide shadow-sm border ${
            !formData.isVerified
              ? "bg-red-50 text-red-600 border-red-200"
              : "bg-indigo-50 text-indigo-700 border-indigo-200"
          }`}
        >
          {formData.isVerified ? "Verified Account" : "Not Verified"}
        </span>
      </div>

      {/* Avatar & Attachment */}
      <div className="flex flex-wrap gap-8 items-center py-4">
        {/* Avatar */}
        <div className="flex items-center space-x-6">
          <div className="w-28 h-28 rounded overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-sm border-2 border-gray-300 flex items-center justify-center">
            {formData.companyLogo ? (
              <Image
              width={10}
              height={10}
                src={formData.companyLogo}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-400 text-lg font-semibold">
                No Image
              </span>
            )}
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-1">
              {formData.subscriptionplan} Plan
            </label>
            <span
              onClick={() => {
                uploadFiles(Encrypt(formData._id), "Business");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition"
            >
              <PhotoIcon className="h-5 w-5" />
              <span className="text-sm font-medium">Upload</span>
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-24 border-l border-gray-200 mx-6"></div>

        {/* Attachment */}
        <div className="flex items-center gap-3 bg-white shadow-md p-4 rounded-md">
          <div className="flex-shrink-0 w-10 h-10 overflow-hidden rounded-full border border-gray-300">
            <Image
            height={10}
            width={10}
              src={formData.currency?.currency.Flag}
              alt={`${formData.currency?.currency.CountryName} Flag`}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-semibold text-gray-800">
            {formData.currency?.currency.CountryName}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <Section title="⚙️ Quick Actions">
        <div className="flex flex-wrap gap-4">
          {userInfo.user.isAdmin && formData.isActive && (
            <RenewButton />
          )}

          <Link
            href={`/${data?.companyName
              .toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
              userInfo?.user._id
            )}/Module/Forms/employee`}
            className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-md shadow-md hover:bg-[#18181b] transition font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
            role="button"
            tabIndex={0}
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
                d="M8 17l4 4 4-4m0-5V3m-8 4h8"
              />
            </svg>
            Add user
          </Link>

          {userInfo.user.isAdmin && formData.subscriptionplan === "Basic" && (
            <span
              className="inline-flex items-center gap-2 bg-amber-300 text-black px-5 py-2.5 rounded-md shadow-md hover:bg-amber-500 transition font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
              role="button"
              tabIndex={0}
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
                  d="M8 17l4 4 4-4m0-5V3m-8 4h8"
                />
              </svg>
              Upgrade Plan
            </span>
          )}
        </div>
      </Section>

      {/* Identity */}
      <Section title="Identity">
        <Grid>
          <Input
            label="Business Name"
            readOnly
            disabled
            value={formData.companyName}
          />
          <Input
            label="Tenant Id"
            value={formData.tenantId}
            disabled
            readonly
            type="password"
          />
          <Input
            label="Email"
            name="Email"
            type="email"
            value={formData.email}
            eadonly
            disabled
          />
          <Input label="Phone" readonly disabled value={formData.Tel} />
          <Input
            label="Industry"
            name="industryType"
            value={formData.industryType}
            onChange={handleChange}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Business Type
            </label>
            <select
              name="BusinessType"
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              <option value={formData.BusinessType}>
                {formData.BusinessType || "Choose..."}
              </option>
              <option value="Business">Business</option>
              <option value="Individual">Individual</option>
            </select>
          </div>
        </Grid>
      </Section>

      {/* Contact Info */}
      <Section title="Subscription Info">
        <Grid>
          <Input
            label="Subscription Validity"
            value={formData.subscriptionEndDate}
            type="date"
            disabled
            readOnly
          />
          <Input
            label="Current plan"
            readonly
            disabled
            value={formData.subscriptionplan}
          />
          <Input
            label="Pending user Licenses"
            readonly
            disabled
            value={formData.Pendinglicense}
          />
          <h4 className="text-black font-bold">
            {moment(formData.subscriptionEndDate).isValid() &&
            moment(formData.subscriptionEndDate).isAfter(moment())
              ? `Subscription ends in ${moment(
                  formData.subscriptionEndDate
                ).diff(moment(), "days")} day(s)`
              : "Subscription has expired."}
          </h4>
        </Grid>
      </Section>

      {/* Location */}
      <Section title="Location">
        <Grid columns={3}>
          <Input
            label="City"
            name="companyCity"
            value={formData.companyCity}
            onChange={handleChange}
          />
          <Input
            label="State"
            name="companyState"
            value={formData.companyState}
            onChange={handleChange}
          />
          <Input
            label="Address"
            name="shopAddress"
            value={formData.shopAddress}
            onChange={handleChange}
          />
        </Grid>
      </Section>

      {/* Financials */}
      <Section title="Financials">
        <Grid columns={3}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Country & Currency
            </label>
            <select
              required
              name="currency"
              value={formData.currency?.currency.CountryName}
              onChange={(e) =>
                handlecurrencyChange({
                  currency: currencies.find(
                    (c) => c.CountryName === e.target.value
                  ),
                })
              }
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              {currencies.map((num) => (
                <option key={num.CountryName} value={num.CountryName}>
                  {num.CountryName} {"   "} {num.Symbol}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credit Limit Application
            </label>
            <select
              name="allowCreditLimit"
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              <option value={formData.allowCreditLimit}>
                {formData.allowCreditLimit === ""
                  ? "This dosen't apply to my business"
                  : formData.allowCreditLimit}
              </option>
              <option value=""> This dosen't apply to my business</option>
              <option value="Customer"> Customers</option>
              <option value="Warehouse"> Warehouse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Credit Limit Application
            </label>
            <select
              name="allowCreditLimit"
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              <option value={formData.allowCreditLimit}>
                {formData.allowCreditLimit === ""
                  ? "This dosen't apply to my business"
                  : formData.allowCreditLimit}
              </option>
              <option value=""> This dosen't apply to my business</option>
              <option value="Customer"> Customers</option>
              <option value="Warehouse"> Warehouse</option>
            </select>
          </div>
        </Grid>
      </Section>

      {/* pricelist */}
      <Section title="Pricelists Management">
        <Grid>
          <Input
            label="PriceList 1"
            value={formData.priceList1}
            type="text"
            required
          />
          <Input
            label="PriceList 2"
            type="text"
            required
            value={formData.priceList2}
          />
          {userInfo.business.subscriptionplan === "Standard" && (
          <>
          <Input
            label="PriceList 3"
            type="text"
            required
            value={formData.priceList3}
          />
          <Input
            label="PriceList 4"
            value={formData.priceList4}
            type="text"
            required
          />
          <Input
            label="PriceList 5"
            value={formData.priceList6}
            type="text"
            required
          />
          <Input
            label="PriceList 6"
            value={formData.priceList6}
            type="text"
            required
          />
          <Input
            label="PriceList 7"
            value={formData.priceList7}
           type="text"
            required
          />
          </>
          )}
        </Grid>
      </Section>

      {/* Status Flags */}
      {userInfo.business.subscriptionplan === "Standard" && (
        <Section title="Status Flags">
          <Grid columns={3}>
            <Checkbox
              label={`Send Daily Business Report to ${formData.email.substring(
                0,
                6
              )}***.`}
              name="dailyReport"
              checked={formData.dailyReport}
              onChange={handleChange}
            />
            <Checkbox
              label="Generate and send monthly Statements to my Customers."
              name="monthlyCutStatement"
              checked={formData.monthlyCutStatement}
              onChange={handleChange}
            />
            <Checkbox
              label={
                formData.allowPriceChangeOnInvoice
                  ? "Price Change on Invoice Allowed"
                  : "Block Price Change on Invoice"
              }
              name="allowPriceChangeOnInvoice"
              checked={formData.allowPriceChangeOnInvoice}
              onChange={handleChange}
            />
            <Checkbox
              label={
                formData.allowPriceChangeOnInvoice
                  ? "Product Splitting Allowed"
                  : "Product Splitting Blocked"
              }
              name="allowSkuSplitting"
              checked={formData.allowSkuSplitting}
              onChange={handleChange}
            />
          </Grid>
        </Section>
      )}

      {/* Services */}
      <Section title="🛎 Services">
        <Grid columns={2}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              clear in-App Notifications
            </label>
            <select
              name="clearNotification"
              onChange={handleChange}
              className="mt-1 w-full border border-gray-300 px-3 py-2 rounded-md bg-gray-50 text-gray-800"
            >
              <option value={formData.clearNotification}>
                {formData.clearNotification === ""
                  ? "Leave Forever"
                  : formData.clearNotification}
              </option>
              <option value="">Leave Forever</option>
              <option value="Daily"> Daily</option>
              <option value="Monthly">Monthly </option>
            </select>
          </div>
          <div>
            <Input
              label="Invoice Policy"
              name="invoicePolicy"
              value={formData.invoicePolicy}
              onChange={handleChange}
            />
          </div>
        </Grid>
      </Section>

      {/* Recent Transactions */}
      <Section title="Installed Business Apps">
        <div className="overflow-x-auto p-2">
          {data && data.modules.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {data.modules.map((data) => (
                <Link
                  key={data._id}
                  href={`#`}
                  title={data.Description}
                  className="block w-full h-full"
                  style={{ textDecoration: "none" }}
                >
                  <div className="flex flex-row items-center gap-4 bg-white border border-gray-200 rounded-md shadow-sm px-4 py-3 hover:shadow-md transition duration-200 animate__animated animate__fadeInUp min-h-[80px] w-full h-full">
                    <Image
                      src={data.icon || "/preview.png"}
                      width={60}
                      height={60}
                      alt={truncate(data.Name || "photo")}
                      className="rounded-md object-cover w-16 h-16"
                      priority
                    />

                    <div className="flex flex-col justify-center w-full">
                      <p className="text-base font-semibold text-gray-800 truncate">
                        {truncate(data.Name)}
                      </p>
                      <small className="text-sm w-fit p-1 rounded text-gray-500 mt-1">
                        {truncate("Installed")}
                      </small>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No Module installed.</p>
          )}
        </div>
      </Section>

      {userInfo.user && (
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
