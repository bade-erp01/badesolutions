"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Swal from "sweetalert2";
import Link from "next/link";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../Functions/Mics";
import axios from "axios";
import moment from "moment";
import { useEffect, Suspense } from "react";
import Plotly from "plotly.js-dist-min";
import {
  Encrypt,
  EXPRESS_PRIVATE_URL,
  pricelistSetter,
} from "../../../../../../../Functions/Functions";
import { driver } from "driver.js";
import "driver.js/dist/driver.css"; // Make sure the CSS is imported!
import { useState } from "react";
import CreateFocButton from "@/app/Components/CreatefocButton";
import DeleteButton from "@/app/Components/DeleteProduct";
import AutoreplenishReminder from "@/app/Components/AutoreplenishReminder";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import Image from "next/image";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import { Card, CardContent,CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";



export default function SingleProductpage({
  userInfo,
  businessInfo,
  Backdata,
  vendor,
  storeProducts,
}) {
  const [user] = useState(userInfo);
  const [data] = useState(Backdata);
  const [StoreProduct] = useState(storeProducts);
  const navigation = useParams();
  const router = useRouter();
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const link = `/${navigation.auth}/${
    navigation.Tenant
  }/product/product/${Encrypt(Backdata.CopyID)}?Modules=product`;
  const [BuyingPrice, setBuyingPrice] = useState({
    BuyingPrice:
      Number(Backdata?.BuyingPrice) || Number(Backdata?.vendor_Price) || 0,
  });

  
  
  useProductEditTour(Backdata.Name); // for driver
  
  const uploadFiles = async (id, module) => {
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

            const resizedImage = canvas.toDataURL("image/jpeg", 0.7); // Adjust quality as needed

            const request = await fetch(
              `${EXPRESS_PRIVATE_URL}/api/images/upload?id=${id}&module=${module}`,
              {
                method: "POST",
                body: JSON.stringify({ image: resizedImage }),
                headers: {
                  "Content-Type": "application/json",
                  dbConnect: `Bearer ${business.rustyRoof}`,
                  access: `${Encrypt(user._id)}`,
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
      ErrorMessage("Error uploading file:", error);
    }
  };

  const [headers] = useState({
    "Content-Type": "application/json",
    Authorization: `Bearer ${Encrypt(businessInfo.tenantId)}`,
    access: `${Encrypt(userInfo._id)}`,
    sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`
  });

  const [formData, setFormData] = useState({ ...data });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // update vendor prce
  const UpdateBuyingPrice = async (value) => {
    try {
      plsWait("Updating Buying price...");

      const priceValue = parseFloat(value);
      if (isNaN(priceValue) || priceValue <= 0) {
        throw new Error("Please enter a valid buying price greater than zero.");
      }

      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/${Encrypt(Backdata._id)}/BuyingPrice_change`,
        {
          method: "PATCH",
          headers: headers, // Use the state-defined headers
          body: JSON.stringify({
            productId: Backdata._id,
            updatedBuyingPrice: priceValue,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.message) {
        SuccessToast(data.message);
        location.reload();
      } else {
        throw new Error(data.error || "Failed to update buying price.");
      }
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      plsWait("Updating Product...");
      const form = {
          Name:formData.Name,
          category:formData.category,
          image:formData.image,
          Vendor:formData.vendor,
          UMO:formData.UMO,
          color:formData.color,
          Description:formData.Description,
          Sellable:formData.Sellable,
          Manufacturer:formData.Manufacturer,
          VAT:formData.VAT.$numberDecimal,
          Pieces:formData.Pieces,
          Manufacture_code:formData.Manufacturer,
          Vendor:formData.Vendor
        };
      const { data } = await axios.patch(
        `${EXPRESS_PRIVATE_URL}/api/Products/${Encrypt(Backdata._id)}/edit`,
        form,
        { headers },
      );

      if (data && data.result) {
        SuccessToast(data.result);
        router.refresh();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={`${data.Name}`} />}>
      <div className="m-5 p-4 rounded shadow-2xl border-lg border-2-black bg-white animate__animated animate__fadeInUpBig animate__delay-2s">
        <form className="space-y-5 mx-auto" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl font-bold text-gray-800">
              {data.Name.charAt(0).toUpperCase() + data.Name.slice(1)}&apos;
            </h4>
            <Badge
              variant="secondary"
              className="max-w-[140px] truncate lowercase text-sm font-semibold px-2 py-0.5"
            >
              {formData.ADCcode || formData.ACDcode}
            </Badge>
          </div>

          {/* Avatar & Attachment */}
          <div className="flex flex-wrap gap-8 items-center py-4">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div
                onClick={() => {
                  uploadFiles(Encrypt(data._id), "product");
                }}
                className="w-28 h-28 rounded overflow-hidden flex items-center justify-center"
              >
                <Image
                  height={70}
                  width={70}
                  src={data.image || "/preview.png"}
                  alt="Avatar"
                  className="w-full h-full object-cover shadow-lg drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]"
                  loading="eager"
                  priority={true}
                  quality={100}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="hidden md:block h-24 border-l border-gray-200 mx-6"></div>

            {/* qrcode */}
            {data.QrCode && (
              <div
                id="qrcode"
                className="w-28 h-28 rounded overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-sm border-2 border-gray-300 flex items-center justify-center"
              >
                <Image
                  width={10}
                  height={10}
                  src={data.QrCode || ""}
                  alt="QrCode"
                  className="w-full h-full object-cover"
                  loading="eager"
                  priority={true}
                  quality={100}
                />
              </div>
            )}
          </div>

          {/* Sales Insight */}
          <ProductChart
            productId={Backdata._id}
            productName={Backdata.Name}
            umo={Backdata.UMO}
            business={businessInfo}
            user={userInfo}
          />
          <div className="border rounded-lg overflow-hidden">
            <span
              onClick={() => setIsOpen3(!isOpen3)}
              className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
            >
              <h2 className="text-base/7 font-semibold text-gray-900">
                Information
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
              <div className="border-b bg- border-gray-900/10 pb-12">
                <p className="mt-1 text-sm/6 text-gray-600">
                  Ensure to provide correct Information.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="Name"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Name
                    </label>
                    <div className="mt-2">
                      {!Backdata.FOCID && !Backdata.isAservice ? (
                        <input
                          id="Name"
                          name="Name"
                          type="text"
                          value={formData.Name}
                          required
                          onChange={handleChange}
                          autoComplete="Name-name"
                          className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      ) : (
                        <>
                          <h3 className="font-semibold text-gray-900">
                            {formData.Name}
                          </h3>
                          <small title="Free of charge Product [FOC]">
                            {formData.CopyID && Backdata.isAservice && (
                              <Link href={`${link}`} className="text-blue-700 ">
                                View alternate Product for {formData.Name}
                              </Link>
                            )}
                          </small>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-3">
                    <label
                      htmlFor="ADCcode"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Product Code
                    </label>
                    <div className="mt-2">
                      <h3 className="font-semibold text-gray-900">
                        {formData.ADCcode || formData.ACDcode}
                      </h3>
                      {/* <input
                        value={formData.ADCcode || formData.ACDcode}
                        id="ADCcode"
                        name="ADCcode"
                        type="text"
                        onChange={handleChange}
                        autoComplete="category-level2"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      /> */}
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="category"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Product category
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.category}
                        id="category"
                        name="category"
                        type="text"
                        onChange={handleChange}
                        autoComplete="category-level2"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="Subcategory"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Product Sub-Category
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.Subcategory}
                        id="Subcategory"
                        name="Subcategory"
                        type="text"
                        onChange={handleChange}
                        autoComplete="Subcategory-level2"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="BuyingPrice"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Buying Price
                    </label>
                    <div className="mt-2">
                      {user.editPurchasePrice ? (
                        <div className="max-w-md mx-auto p-6 bg-gradient-to-br from-white to-gray-200 rounded-xl shadow-lg border border-gray-200">
                          <input
                            value={BuyingPrice.BuyingPrice}
                            required
                            id="BuyingPrice"
                            name="BuyingPrice"
                            type="number"
                            step="any"
                            onChange={(e) => {
                              const raw = e.target.value.replace(/,/g, "");
                              const parsed = parseFloat(raw) || 0;
                              setBuyingPrice((prev) => ({
                                ...prev,
                                BuyingPrice: parsed,
                              }));
                            }}
                            autoComplete="address-level1"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                          <span
                            onClick={() =>
                              UpdateBuyingPrice(BuyingPrice.BuyingPrice)
                            }
                            className="mt-3 inline-block w-full text-center py-2 px-4 rounded-md text-white font-semibold bg-gray-600 hover:bg-gray-800 transition-colors duration-200 shadow-md cursor-pointer text-xs"
                          >
                            Update Buying Price
                          </span>
                        </div>
                      ) : (
                        <div className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-700 border border-gray-300 sm:text-sm/6">
                          {BuyingPrice.BuyingPrice?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Manufacturer"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Manufacturer
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.Manufacturer}
                        id="Manufacturer"
                        name="Manufacturer"
                        type="text"
                        onChange={handleChange}
                        autoComplete="postal-code"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Manufacture_code"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Bar Code
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.Manufacture_code}
                        id="Manufacture_code"
                        name="Manufacture_code"
                        type="text"
                        onChange={handleChange}
                        autoComplete="Manufacture_code"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="Pieces"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Define Pieces in {formData.UMO || "Case"}
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.Pieces}
                        id="Pieces"
                        required
                        name="Pieces"
                        onChange={handleChange}
                        type="number"
                        autoComplete="Pieces-level2"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Vendor"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Vendor
                    </label>
                    <div className="mt-2">
                      <select
                        id="Vendor"
                        name="Vendor"
                        required
                        onChange={handleChange}
                        autoComplete="stateOfOrigin"
                        className="col-start-1 w-full row-start-1 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      >
                        {/* <option  value={formData.Vendor}> {formData.Vendor}</option> */}
                        {(() => {
                          const Selectedvendor = vendor.find(
                            (person) => person._id === formData.Vendor,
                          );

                          if (Selectedvendor) {
                            return (
                              <option defaultValue={Selectedvendor._id}>
                                {Selectedvendor.Name} [CURRENT]
                              </option>
                            );
                          } else {
                            return <option value="">Select one</option>;
                          }
                        })()}

                        {vendor.map((Vend) => (
                          <option key={Vend._id} value={Vend._id}>
                            {Vend.Name}
                          </option>
                        ))}
                      </select>
                      <ChevronDownIcon
                        aria-hidden="true"
                        className="pointer-events-auto col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="UMO"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Standard Unit of Measure
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.UMO}
                        id="UMO"
                        name="UMO"
                        type="text"
                        onChange={handleChange}
                        autoComplete="workTelephone"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="color"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Color
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.color}
                        id="color"
                        name="color"
                        onChange={handleChange}
                        type="color"
                        autoComplete="address-level2"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  {/* <div className="sm:col-span-2">
                <label
                  htmlFor="Sellable"
                  className="block text-sm font-medium text-gray-900"
                >
                  I want to Sell this product on BADE ERP?
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    checked={formData.Sellable === "true" ? true : false }
                    onChange={handleChange}
                    id="Sellable"
                    name="Sellable"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div> */}

                  {/* <div className="sm:col-span-2">
                <label
                  htmlFor="Ecom_sale"
                  className="block text-sm font-medium text-gray-900"
                >
                  I want to Sell this product on BADE E-commerce?
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    checked={formData.Ecom_sale || false}
                    onChange={handleChange}
                    id="Ecom_sale"
                    name="Ecom_sale"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div> */}

                  <div id="others" className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="VAT"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      VAT Percentage (%)
                    </label>
                    <div className="mt-2">
                      <input
                        value={Number(formData.VAT.$numberDecimal)}
                        id="VAT"
                        name="VAT"
                        onChange={handleChange}
                        type="number"
                        step="any"
                        autoComplete="VAT"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <br />

            <div className="border rounded-lg overflow-hidden">
              <span
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
              >
                <h2 className="text-base/7 font-semibold text-gray-900">
                  Rates & Discounts
                </h2>
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
                {/* pricelist display */}

                <ProductPriceList
                  initialData={data}
                  Biz={businessInfo}
                  user={userInfo}
                />
              </div>
            </div>
            <br />
            <div className="border rounded-lg overflow-hidden">
              <span
                onClick={() => setIsOpen2(!isOpen2)}
                className="w-full px-4 py-3 flex justify-between items-center text-left text-gray-800 font-medium hover:bg-gray-100 transition"
              >
                <h2 className="text-base/7 font-semibold text-gray-900">
                  Reviews / Ratings
                </h2>
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
                <div className="mt-10 max-h-96 overflow-y-auto space-y-4">
                  {formData.comments?.length > 0 ? (
                    formData.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            {/* Avatar/initials */}
                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-semibold">
                              {comment.comment?.charAt(0) || "U"}
                            </div>
                            <div>
                              {comment.createdAt && (
                                <p className="text-xs text-gray-500">
                                  {new Date(
                                    comment.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          </div>
                          {/* Rating stars */}
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg
                                key={i}
                                className={`h-4 w-4 ${
                                  i < comment.rating
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.176 0l-3.36 2.44c-.785.57-1.84-.197-1.54-1.118l1.286-3.95a1 1 0 00-.364-1.118l-3.36-2.44c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.95z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {comment.comment || `Comment ${index + 1}`}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-gray-500 text-center py-6 border border-dashed border-gray-300 rounded-lg">
                      No reviews available for this product.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h5 className="text-black font-semibold"> Description.</h5>
            <div className="col-span-full">
              <label
                htmlFor="Description"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Write Something Simple and Consise about this product
              </label>
              <div className="">
                <textarea
                  id="Description"
                  name="Description"
                  onChange={handleChange}
                  value={formData.Description}
                  className="w-full text-black h-32 p-3 border border-dashed border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your text here..."
                />
              </div>

              {/* /* only show table if storeProduct is more than 0 */} 
                      {StoreProduct.length > 0 && (
                      <Card className="border shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg font-semibold">
                          {data.Name} In Store Inventory
                          </CardTitle>

                          <CardDescription>
                          Warehouse inventory distribution and monitoring
                          </CardDescription>
                        </div>

                        <Badge variant="secondary">
                          {StoreProduct.reduce(
                          (acc, item) => acc + item.products.length,
                          0,
                          )}{" "}
                          Stores
                        </Badge>
                        </CardHeader>

                        <CardContent>
                        <div className="rounded-xl border overflow-hidden">
                          <Table>
                          <TableHeader className="bg-muted/50">
                            <TableRow>
                            <TableHead className="w-[60px]">#</TableHead>

                            <TableHead>Store</TableHead>

                            <TableHead>Inventory Level</TableHead>

                            <TableHead className="w-[140px]">
                              Download
                            </TableHead>

                            {userInfo?.isAdmin && (
                              <TableHead className="w-[140px]">
                              Monitor
                              </TableHead>
                            )}
                            </TableRow>
                          </TableHeader>

                          <TableBody>
                            {StoreProduct?.map((log, index) =>
                            log.products.map((product, pIndex) => (
                              <TableRow
                              key={`${index}-${pIndex}`}
                              className="hover:bg-muted/40 transition-colors"
                              >
                              <TableCell className="font-medium">
                                {index + 1}
                              </TableCell>

                              <TableCell>
                                <Link
                                className="font-medium text-indigo-700 hover:underline visited:text-purple-600"
                                href={`/${navigation.auth}/${
                                  navigation.Tenant
                                }/inventory/inventory/${Encrypt(
                                  product._id,
                                )}?Modules=inventory`}
                                >
                                View Stock Position in {log.warehouseName.toLowerCase()}
                                </Link>
                              </TableCell>

                              <TableCell>
                                <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="outline"
                                  className="rounded-full"
                                >
                                  Case: {product.currentQty}
                                </Badge>

                                <Badge
                                  variant="secondary"
                                  className="rounded-full"
                                >
                                  Pcs: {product.pcs}
                                </Badge>
                                </div>
                              </TableCell>

                              <TableCell className="max-w-[140px]">
                                <div className="flex flex-wrap break-words whitespace-normal">
                                <ExcelDownloadBtn
                                  data={[
                                  {
                                    Store: log.warehouseName,

                                    Product: product.productName,

                                    Qty: `Case:${product.currentQty}, Pcs:${product.pcs}`,
                                  },
                                  ]}
                                  page={`${
                                  log.warehouseName.substring(0, 4) || "store"
                                  }`}
                                />
                                </div>
                              </TableCell>
                              {userInfo?.isAdmin && (
                                <TableCell className="w-40">
                                <AutoreplenishReminder
                                  storeProduct={product}
                                  business={businessInfo}
                                  user={userInfo}
                                  baseUrl={EXPRESS_PRIVATE_URL}
                                />
                                </TableCell>
                              )}
                              </TableRow>
                            )),
                            )}
                          </TableBody>
                          </Table>
                        </div>
                        </CardContent>
                      </Card>
                      )}

                      {/* Price change */}
              <div className="mt-10">
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Historical Price Change
                </h3>
                <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50 text-xs text-gray-700">
                  <table className="min-w-full table-auto">
                    <thead>
                      <tr className="text-left text-gray-600 border-b border-gray-300">
                        <th className="py-2 px-3">Date</th>
                        <th className="py-2 px-3">Message</th>
                        <th className="py-2 px-3">Difference</th>
                        <th className="py-2 px-3">Overall Impact</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.HistoricalPrice?.map(
                        (log, index) => (
                          <tr
                            key={index}
                            className="border-b border-gray-200 hover:bg-gray-100"
                          >
                            <td className="py-2 px-3">
                              {new Date(log.date).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3">{log.message}</td>
                            <td className="py-2 px-3">{log.difference}</td>
                            <td className="py-2 px-3">{log.overallImpact}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
                {businessInfo.subscriptionplan === "Standard" &&
                  user.isAdmin &&
                  !Backdata.FOCID &&
                  !Backdata.isAservice && (
                    <CreateFocButton
                      productId={Backdata._id}
                      business={businessInfo}
                      user={user}
                    />
                  )}

                {user.isAdmin &&
                  !Backdata.FOCID &&
                  !Backdata.isAservice &&
                  Backdata.TotalSale < 1 && (
                    <DeleteButton
                      productId={Backdata._id}
                      business={businessInfo}
                      user={user}
                    />
                  )}

                {user.editProduct && (
                  <button
                    type="submit"
                    className="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-gray-500 focus-visible:outline-gray-600 transition"
                  >
                    Update {formData.Name}
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </Suspense>
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

function ProductChart({ productId, productName, umo, business, user }) {
  const [loading, setLoading] = useState(true);
  const [monthlySalesArray, setMonthlySalesArray] = useState([]);
  const [errormssg, setErrorMssg] = useState("");
  const [tottalSales, setTotalSales] = useState();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const currentYear = moment().format("YYYY");
        const url = `${EXPRESS_PRIVATE_URL}/api/SalseandStock?Year=${currentYear}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(business.tenantId)}`,
            access: `${Encrypt(user._id)}`,
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`
          },
          next: {
            revalidate: 120,
            cache: "force-cache",
          },
        });

        const result = await response.json();
        if (!result?.invoice) return;

        const data = result.invoice.flatMap((invoice) =>
          invoice.orders.map((order) => ({
            sold: order.total,
            InvoiceDate: invoice.startDate,
            _id: order.item._id,
          })),
        );

        const productSales = data.filter((item) => item._id === productId);

        const monthlySales = productSales.reduce((acc, curr) => {
          const month = moment(curr.InvoiceDate).format("MM");
          acc[month] = acc[month] || { sold: 0 };
          acc[month].sold += curr.sold;
          return acc;
        }, {});

        for (let i = 1; i <= 12; i++) {
          const monthStr = i.toString().padStart(2, "0");
          if (!monthlySales[monthStr]) {
            monthlySales[monthStr] = { sold: 0 };
          }
        }

        const formattedArray = Object.entries(monthlySales)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setMonthlySalesArray(formattedArray);
      } catch (err) {
        setErrorMssg("❌" + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData(); // Initial fetch

    // const intervalId = setInterval(fetchProductData, 120000); // Repeat every 2 min

    // return () => clearInterval(intervalId); // Cleanup on unmount
  }, [productId, productName, umo, business]);

  useEffect(() => {
    if (!loading && monthlySalesArray.length > 0) {
      const NDxArray = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const NDyArray = monthlySalesArray.map((item) => item.sold);
      const totalSales = NDyArray.reduce((sum, val) => sum + val, 0).toFixed(1);

      const chartTitle = `estimated net sales of ${
        business.currency?.currency?.Symbol
      }${totalSales} for ${moment().format("YYYY")}`;
      const chartColor = business?.Color || "#1e2939";

      const dataPlot = [
        {
          x: NDxArray,
          y: NDyArray,
          type: "scabarter",
          mode: "lines+markers",
          marker: { color: chartColor },
        },
      ];
      setTotalSales(chartTitle);

      const layoutPlot = { title: chartTitle };

      Plotly.newPlot("myPlot", dataPlot, layoutPlot);
    }
  }, [loading, monthlySalesArray, business]);

  return (
    <>
      {/* Show error if exists */}
      {errormssg ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-red-500 text-lg font-semibold">{errormssg}</div>
        </div>
      ) : // No error: show loading spinner or chart
      loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div id="code">
          <h5 className="text-lg font-semibold text-gray-700 mb-1">
            📈 Month-on-Month Sales Insight for {productName},{tottalSales}
            <br />
            <hr />
            <br />
            <i className="text-gray-500 text-sm">
              Last updated: {moment().format("YYYY-MM-DD HH:mm:ss")}
            </i>
          </h5>
          <div
            id="myPlot"
            className=""
            style={{ width: "100%", height: "400px" }}
          />
        </div>
      )}
    </>
  );
}

function useProductEditTour(product) {
  useEffect(() => {
    if (typeof window === "undefined") return; // Prevent SSR crash

    const ProductTour = localStorage.getItem("ProductTour");

    if (!ProductTour && product) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("ProductTour", "ProductTour");

        const driverObj = driver({
          showProgress: true,
          popoverClass: "driverjs-theme",
          steps: [
            {
              element: "#code",
              popover: {
                title: "Product sales Insight",
                description: `Get real-time analytics insight on ${product} estimated sales for the current year.`,
                side: "left",
                align: "start",
              },
            },
            {
              element: "#qrcode",
              popover: {
                title: "QR-CODE",
                description:
                  "Scan the QR code to view product on another device.",
                side: "right",
                align: "end",
              },
            },
            {
              element: "#others",
              popover: {
                title: "VAT & Others",
                description:
                  "Manage VAT and other applicable charges on the product.",
                side: "left",
                align: "start",
              },
            },
          ],
        });

        driverObj.drive();
      }, 60000); // ⏳ Delay for 1 minute (60000 ms)

      // Cleanup in case the component unmounts before timeout
      return () => clearTimeout(timeoutId);
    }
  }, [product]);
}

// diplay pricelist
export function ProductPriceList({ initialData, Biz, user }) {
  const [formData, setformData] = useState(initialData);
  const [openModal, setOpenModal] = useState(null); // track which card’s modal is open
  const [savingCard, setSavingCard] = useState(null); // track which card is saving
  const router = useRouter();


  const handleChange = (e) => {
    const { name, value } = e.target;

    setformData((prev) => {
      if (!prev || !Array.isArray(prev.PriceLists)) return prev;

      const updatedPriceLists = prev.PriceLists.map((price) => {
        if (name.startsWith("vat-")) {
          const key = name.replace("vat-", "");
          return price.Name === key ? { ...price, vat: Boolean(value) } : price;
        }
        if (name.startsWith("promo-")) {
          const key = name.replace("promo-", "");
          return price.Name === key ? { ...price, promo: value } : price;
        }
        if (name.startsWith("promoDate-")) {
          const key = name.replace("promoDate-", "");
          return price.Name === key ? { ...price, PromoDate: value } : price;
        }
        return price.Name === name ? { ...price, price: value } : price;
      });

      return {
        ...prev,
        PriceLists: updatedPriceLists,
      };
    });
  };

  const handleSave = async (cardName) => {
    setSavingCard(cardName);
    // find the pricelist that was updated and send to server
    const update = formData.PriceLists.find(
      (pl) => pl.Name === cardName,
    );

    if(update.promo === ""){
     setSavingCard(null)
     return ErrorMessage("Discount can't be empty.")
    }

    if(update.promo > 0 && update.PromoDate === null){
     setSavingCard(null)
     return ErrorMessage("Discount must have an end date.")
    }

    try {
      const request = await fetch(`${EXPRESS_PRIVATE_URL}/api/updatePriceLists/${Encrypt(initialData._id)}`, {
        method: "PATCH",
        headers: {
           "Content-Type": "application/json",
            Authorization:`Bearer ${Encrypt(user.tenantId)}`,
            access: Encrypt(user._id),
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`
          },
        body: JSON.stringify(update),
      });

      const response = await request.json()
      if(!request.ok){
        throw new Error(response.error)
      }

      SuccessToast(response.message);
      setSavingCard(null);
      router.refresh();
    } catch (err) {
      ErrorMessage(err.message);
      setSavingCard(null); // re-enable if error
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
      {formData.PriceLists.length > 0 ? (
        formData.PriceLists.map((price, idx) => (
          <Card
            key={idx}
            className="group w-full max-w-xs rounded-sm hover:shadow-md hover:border-border transition-all duration-300 bg-white"
          >
            <CardContent className="p-3 space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="secondary"
                  title={pricelistSetter(price.Name ?? "Unknown PriceList", Biz)}
                  className="max-w-[140px] truncate lowercase text-xs font-semibold px-2 py-0.5"
                >
                  {pricelistSetter(price.Name ?? "Unknown PriceList", Biz)}
                </Badge>

                <p className="text-xs text-muted-foreground truncate">
                  {price.vat
                    ? `${formData.VAT.$numberDecimal}% VAT applied`
                    : "VAT not applied"}
                </p>
              </div>

              {/* Base Price */}
              <div className="space-y-1">
                <Label
                  htmlFor={`price-${price.Name}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Base price
                </Label>
                <Input
                  id={`price-${price.Name}`}
                  name={price.Name}
                  type="number"
                  step="any"
                  value={price.price || ""}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-8 w-30 text-sm"
                />
              </div>

              {/* Promo */}
              <div className="space-y-1">
                <Label
                  htmlFor={`promo-${price.Name}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Discounts
                </Label>
                <Input
                  id={`promo-${price.Name}`}
                  name={`promo-${price.Name}`}
                  type="number"
                  step="any"
                  value={price.promo}
                  onChange={handleChange}
                  placeholder="0.00"
                  className="h-8 w-30 text-sm"
                />
              </div>

              {/* Promo Date */}
              <div className="space-y-1">
                <Label
                  htmlFor={`promoDate-${price.Name}`}
                  className="text-xs font-medium text-muted-foreground"
                >
                  Discounts ends
                </Label>
                <Input
                  id={`promoDate-${price.Name}`}
                  name={`promoDate-${price.Name}`}
                  type="date"
                  value={moment(price.PromoDate).format("YYYY-MM-DD")}
                  onChange={handleChange}
                  className="h-8 w-30 text-xs"
                />
              </div>

              <div className="pt-1 border-t" />

              {/* Footer VAT Notice */}
              <div className="flex items-center justify-between gap-2">
                <Label
                  htmlFor={`vat-${price.Name}`}
                  className="text-[10px] text-muted-foreground cursor-pointer"
                >
                  <Checkbox
                    id={`vat-${price.Name}`}
                    name={`vat-${price.Name}`}
                    checked={price.vat || false}
                    onCheckedChange={(checked) =>
                      handleChange({
                        target: { name: `vat-${price.Name}`, value: checked },
                      })
                    }
                    className="h-4 w-4"
                  />
                  Apply {formData.VAT.$numberDecimal}% VAT
                </Label>
                {user.editProduct && (<Button
                  onClick={() => setOpenModal(price.Name)}
                  type="button"
                  disabled={savingCard === price.Name}
                  className="bg-black text-white p-2 text-xs rounded"
                >
                  {savingCard === price.Name ? "Saving..." : "Save Changes"}
                </Button>)}
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <p className="font-italics text-xs">Nothing to show</p>
      )}

      {/* Confirmation Modal */}
      <Dialog open={!!openModal} onOpenChange={() => setOpenModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to save changes for <strong>{openModal}</strong>?</p>
          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setOpenModal(null)}
              disabled={savingCard === openModal}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setOpenModal(null);
                handleSave(openModal);
              }}
              disabled={savingCard === openModal}
              className="bg-green-600 text-white"
            >
              Yes, Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}