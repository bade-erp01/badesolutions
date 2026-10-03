"use client";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
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
import ImageUploader from "@/app/Components/ImageUploade";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isOpen4, setisOpen4] = useState(false);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen2, setIsOpen2] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const link = `/${navigation.auth}/V4/product/product/${Encrypt(Backdata.CopyID)}`;
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
        plsWait("Uploading...");
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
                  Authorization: `Bearer ${Encrypt(businessInfo.tenantId)}`,
                  access: `${Encrypt(userInfo._id)}`,
                  sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
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

  const [headers] = useState({
    "Content-Type": "application/json",
    Authorization: `Bearer ${Encrypt(businessInfo.tenantId)}`,
    access: `${Encrypt(userInfo._id)}`,
    sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
  });

  const [formData, setFormData] = useState({ ...data });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      // Special handling for nested fields like VAT.$numberDecimal
      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        return {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: type === "checkbox" ? checked : value,
          },
        };
      }

      // Normal fields
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
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
        Name: formData.Name,
        category: formData.category,
        image: formData.image,
        Vendor: formData.vendor,
        UMO: formData.UMO,
        color: formData.color,
        Description: formData.Description,
        Sellable: formData.Sellable,
        Manufacturer: formData.Manufacturer,
        VAT: formData.VAT.$numberDecimal,
        Pieces: formData.Pieces,
        Manufacture_code: formData.Manufacture_code,
        Vendor: formData.Vendor,
        Subcategory: formData.Subcategory,
        Nafdac: formData.Nafdac,
        LeadTime: formData.LeadTime,
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
      <div className="p-4 rounded border-0 border-2-black animate__animated animate__fadeInUpBig animate__delay-2s">
        <form className="space-y-5 mx-auto" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h3 className="text-2xl font-semibold tracking-tight">
              {data.Name.charAt(0).toUpperCase() + data.Name.slice(1)}
            </h3>
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
                className="rounded overflow-hidden flex items-center justify-center"
              >
                <Image
                  height={400}
                  width={400}
                  layout="intrinsic"
                  src={data.image || "/preview.png"}
                  alt="Avatar"
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="eager"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  quality={100}
                  priority
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
          {/* <ProductChart
            productId={Backdata._id}
            productName={Backdata.Name}
            umo={Backdata.UMO}
            business={businessInfo}
            user={userInfo}
          /> */}
          <div className="border rounded-lg overflow-hidden">
            <span
              onClick={() => setIsOpen3(!isOpen3)}
              className="w-full px-4 py-3 flex justify-between items-center text-left  font-medium transition"
            >
              <h2 className="text-base/7 font-semibold ">Information</h2>
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
              className={`px-4 py-3  transition-all duration-300 ${
                isOpen3 ? "block" : "hidden"
              }`}
            >
              <div className="border-b bg- border-gray-900/10 pb-12">
                <p className="mt-1 text-sm/6 ">
                  Ensure to provide correct Information.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="Name"
                      className="block text-sm/6 font-medium "
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
                          className="block w-full rounded-md  px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300  focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                        />
                      ) : (
                        <>
                          <h3 className="font-semibold">{formData.Name}</h3>
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
                      className="block text-sm/6 font-medium "
                    >
                      Product Code
                    </label>
                    <div className="mt-2">
                      <h3 className="font-semibold ">
                        {formData.ADCcode || formData.ACDcode}
                      </h3>
                      {/* <input
                        value={formData.ADCcode || formData.ACDcode}
                        id="ADCcode"
                        name="ADCcode"
                        type="text"
                        onChange={handleChange}
                        autoComplete="category-level2"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      /> */}
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="category"
                      className="block text-sm/6 font-medium "
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
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300  focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="Subcategory"
                      className="block text-sm/6 font-medium"
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
                        className="block w-full rounded-md  px-3 py-1.5 text-base outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="BuyingPrice"
                      className="block text-sm/6 font-medium"
                    >
                      Buying Price
                    </label>
                    <div className="mt-2">
                      {user.editPurchasePrice ? (
                        <div className="max-w-md mx-auto p-6  rounded-xl shadow-lg border border-gray-200">
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
                            className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                          <span
                            onClick={() =>
                              UpdateBuyingPrice(BuyingPrice.BuyingPrice)
                            }
                            className="mt-3 inline-block w-full text-center py-2 px-4 rounded-md font-semibold transition-colors duration-200 shadow-md cursor-pointer text-xs
                                      bg-black text-white hover:bg-gray-800
                                      dark:bg-white dark:text-black dark:hover:bg-gray-200"
                          >
                            Update Buying Price
                          </span>
                        </div>
                      ) : (
                        <div className="block w-full rounded-md  px-3 py-1.5 text-base border border-gray-300 sm:text-sm/6">
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
                      className="block text-sm/6 font-medium "
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
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Manufacture_code"
                      className="block text-sm/6 font-medium "
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
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="Pieces"
                      className="block text-sm/6 font-medium "
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
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Vendor"
                      className="block text-sm/6 font-medium "
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
                        className="col-start-1 w-full row-start-1 appearance-none rounded-md  py-1.5 pr-8 pl-3 text-base  outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                      className="block text-sm/6 font-medium "
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
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Nafdac"
                      className="block text-sm/6 font-medium "
                    >
                      Nafdac Reg No:
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.Nafdac}
                        id="Nafdac"
                        name="Nafdac"
                        type="text"
                        onChange={handleChange}
                        autoComplete="Nafdac"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="color"
                      className="block text-sm/6 font-medium "
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
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="LeadTime"
                      className="block text-sm/6 font-medium "
                    >
                      Lead Time
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.LeadTime}
                        id="LeadTime"
                        name="LeadTime"
                        onChange={handleChange}
                        type="number"
                        autoComplete="LeadTime"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  {/* <div className="sm:col-span-2">
                <label
                  htmlFor="Sellable"
                  className="block text-sm font-medium "
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
                  className="block text-sm font-medium "
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
                      className="block text-sm/6 font-medium "
                    >
                      VAT Percentage (%)
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.VAT?.$numberDecimal ?? ""}
                        id="VAT"
                        name="VAT.$numberDecimal" // ← Important: Use dot notation
                        onChange={handleChange}
                        type="number"
                        step="any"
                        autoComplete="VAT"
                        className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                className="w-full px-4 py-3 flex justify-between items-center text-left font-medium transition"
              >
                <h2 className="text-base/7 font-semibold ">
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
                className={`px-4 py-3  transition-all duration-300 ${
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
                className="w-full px-4 py-3 flex justify-between items-center text-left  font-medium transition"
              >
                <h2 className="text-base/7 font-semibold ">
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
                className={`px-4 py-3  transition-all duration-300 ${
                  isOpen2 ? "block" : "hidden"
                }`}
              >
                <div className="mt-10 max-h-96 overflow-y-auto space-y-4">
                  {formData.comments?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {formData.comments.map((comment, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 md:p-6 
                   shadow-sm hover:shadow-md transition-shadow duration-200 
                   bg-white dark:bg-gray-800"
                        >
                          <div className="flex items-center justify-between mb-2 flex-wrap">
                            <div className="flex items-center space-x-3">
                              {/* Avatar/initials */}
                              <div
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gray-100 dark:bg-gray-700 
                            flex items-center justify-center font-semibold 
                            text-sm sm:text-base text-gray-800 dark:text-gray-200"
                              >
                                {comment.comment?.charAt(0) || "U"}
                              </div>
                              <div>
                                {comment.createdAt && (
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                    {new Date(
                                      comment.createdAt,
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center mt-2 sm:mt-0">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg
                                  key={i}
                                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                                    i < comment.rating
                                      ? "text-yellow-400"
                                      : "text-gray-300 dark:text-gray-600"
                                  }`}
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.15c.969 0 1.371 1.24.588 1.81l-3.36 2.44a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.36-2.44a1 1 0 00-1.176 0l-3.36 2.44c-.785.57-1.84-.197-1.54-1.118l1.286-3.95a1 1 0 00-.364-1.118l-3.36-2.44c-.783-.57-.38-1.81.588-1.81h4.15a1 1 0 00.95-.69l1.286-3.95z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                            {comment.comment || `Comment ${index + 1}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      className="text-sm sm:text-base text-gray-500 dark:text-gray-400 text-center py-6 
                  border border-dashed border-gray-300 dark:border-gray-600 rounded-lg 
                  bg-white dark:bg-gray-800"
                    >
                      No reviews available for this product.
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* alt images  */}
            <br />

            {/* ... */}

            <Collapsible
              open={isOpen4}
              onOpenChange={setisOpen4}
              className="border rounded-lg overflow-hidden"
            >
              <CollapsibleTrigger className="w-full px-4 py-3 flex justify-between items-center text-left font-medium hover:bg-muted/50 transition-colors">
                <h2 className="text-base font-semibold">Alternate Images</h2>
                <ChevronDown
                  className={cn(
                    "h-5 w-5 transition-transform duration-300",
                    isOpen4 && "rotate-180",
                  )}
                />
              </CollapsibleTrigger>

              <CollapsibleContent className="px-4 pb-4">
                <div className="mt-4 max-h-96 overflow-y-auto">
                  {formData.AltImage?.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {formData.AltImage.map((item, index) => {
                        const imageUrl =
                          typeof item === "string"
                            ? item
                            : item?.url || item?.image || item?.src || "";

                        if (!imageUrl) return null;

                        return (
                          <Card
                            key={index}
                            className="overflow-hidden group hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-0">
                              <AspectRatio ratio={1}>
                                <img
                                  src={imageUrl}
                                  alt={`Alternate image ${index + 1}`}
                                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "https://via.placeholder.com/300x300?text=Image+Not+Found";
                                  }}
                                />
                              </AspectRatio>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center py-10 border border-dashed rounded-lg text-sm text-muted-foreground">
                      {user.editProduct && (
                        <ImageUploader
                          id={`${formData._id}`}
                          module="AltImage"
                        />
                      )}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h5 className="text-black font-semibold"> Description.</h5>
            <div className="col-span-full">
              <label
                htmlFor="Description"
                className="block text-sm/6 font-medium "
              >
                Write Something Simple and Consise about this product
              </label>
              <div className="">
                <textarea
                  id="Description"
                  name="Description"
                  onChange={handleChange}
                  value={formData.Description}
                  className="w-full h-32 p-3 border border-dashed border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted">
                          <TableRow>
                            <TableHead className="w-12">#</TableHead>
                            <TableHead>Store</TableHead>
                            <TableHead>Inventory Level</TableHead>
                            <TableHead className="w-32">Download</TableHead>
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
                                    href={`/${navigation.auth}/V4/inventory/inventory/${Encrypt(product._id)}`}
                                  >
                                    View Stock Position in{" "}
                                    {log.warehouseName.toLowerCase()}
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
                                        log.warehouseName.substring(0, 4) ||
                                        "store"
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
                <h3 className="text-sm font-semibold  mb-3">
                  Historical Price Change
                </h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader className="bg-muted">
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Message</TableHead>
                            <TableHead>Difference</TableHead>
                            <TableHead>Overall Impact</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {formData.HistoricalPrice?.length > 0 ? (
                            formData.HistoricalPrice.map((log, index) => (
                              <TableRow
                                key={index}
                                className="hover:bg-muted/50"
                              >
                                <TableCell className="text-sm">
                                  {new Date(log.date).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {log.message}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {log.difference}
                                </TableCell>
                                <TableCell className="text-sm">
                                  {log.overallImpact}
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center text-sm text-muted-foreground py-6"
                              >
                                No price history available
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
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

// "use client";
import React, { useRef, useMemo } from "react";
// import moment from "moment";
// import "animate.css";

export function ProductChart({ productId, productName, business, user }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [monthlySalesArray, setMonthlySalesArray] = useState([]);
  const [totalSales, setTotalSales] = useState(0);

  const plotRef = useRef(null);
  const plotlyRef = useRef(null);

  // Fetch Data
  useEffect(() => {
  const fetchProductData = async () => {
    try {
      setLoading(true);
      setError("");

      const currentYear = moment().format("YYYY");
      const url = `${EXPRESS_PRIVATE_URL}/api/SalseandStock?Year=${currentYear}&productId=${productId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch product sales");

      const result = await response.json();

      setMonthlySalesArray(result.monthlySalesArray || []);
      setTotalSales(result.totalSales || 0);
    } catch (err) {
      setError(err.message || "Failed to load product data");
    } finally {
      setLoading(false);
    }
  };

  if (productId) fetchProductData();
}, [productId, business, user]);

  // Render Plotly Chart
  useEffect(() => {
    if (loading || monthlySalesArray.length === 0) return;

    const xValues = monthlySalesArray.map((item) => item.month);
    const yValues = monthlySalesArray.map((item) => item.sold);

    const chartColor = business?.Color || "#16A085";

    const data = [
      {
        x: xValues,
        y: yValues,
        type: "bar",
        marker: { color: chartColor, opacity: 0.9 },
        hovertemplate: "<b>%{x}</b><br>Sales: ₦%{y:,.0f}<extra></extra>",
      },
    ];

    const layout = {
      title: {
        text: `Monthly Sales Trend - ${productName}`,
        font: { size: 18 },
      },
      paper_bgcolor: "transparent",
      plot_bgcolor: "transparent",
      margin: { t: 60, r: 30, b: 60, l: 70 },
      xaxis: { gridcolor: "#eee" },
      yaxis: { gridcolor: "#eee", tickprefix: "₦" },
    };

    (async () => {
      try {
        const Plotly = (await import("plotly.js-dist-min")).default;
        plotlyRef.current = Plotly;
        Plotly.newPlot(plotRef.current, data, layout, { responsive: true });
      } catch (e) {
        console.error("Plotly error:", e);
      }
    })();

    return () => {
      if (plotlyRef.current && plotRef.current) {
        plotlyRef.current.purge(plotRef.current);
      }
    };
  }, [monthlySalesArray, productName, business]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 p-6 rounded-2xl text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate__animated animate__fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-zinc-500 text-sm mt-1">
            Month-on-Month Sales Performance • {moment().format("YYYY")}
          </p>
        </div>

        <div className="dark:bg-zinc-900 px-6 py-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-sm text-zinc-500">
            Total Sales • {moment().format("YYYY")}
          </p>
          <p className="text-lg font-semibold mt-1">
            ₦{totalSales.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center h-96 dark:bg-zinc-900 rounded-3xl border">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-600" />
            <p className="text-sm text-zinc-500">Loading sales data...</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {!loading && (
        <div className="dark:bg-zinc-900 rounded-3xl border-0 p-6">
          <div id="myPlot" ref={plotRef} className="w-full h-[350px]" />
        </div>
      )}
    </div>
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
    const update = formData.PriceLists.find((pl) => pl.Name === cardName);

    if (update.promo === "") {
      setSavingCard(null);
      return ErrorMessage("Discount can't be empty.");
    }

    if (update.promo > 0 && update.PromoDate === null) {
      setSavingCard(null);
      return ErrorMessage("Discount must have an end date.");
    }

    try {
      const request = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/updatePriceLists/${Encrypt(initialData._id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(user.tenantId)}`,
            access: Encrypt(user._id),
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`,
          },
          body: JSON.stringify(update),
        },
      );

      const response = await request.json();
      if (!request.ok) {
        throw new Error(response.error);
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
      {formData?.PriceLists?.length > 0 ? (
        formData?.PriceLists?.map((price, idx) => (
          <Card
            key={idx}
            className="group w-full max-w-xs rounded-sm hover:shadow-md hover:border-border transition-all duration-300 "
          >
            <CardContent className="p-3 space-y-2">
              {/* Header */}
              <div className="flex items-center justify-between gap-2">
                <Badge
                  variant="secondary"
                  title={pricelistSetter(
                    price.Name ?? "Unknown PriceList",
                    Biz,
                  )}
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
                  className="text-xs font-medium "
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
                  className="text-xs font-medium"
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
                  className="text-xs font-medium"
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
                {user.editProduct && (
                  <Button
                    onClick={() => setOpenModal(price.Name)}
                    type="button"
                    disabled={savingCard === price.Name}
                    className="p-2 text-xs rounded"
                  >
                    {savingCard === price.Name ? "Saving..." : "Save Changes"}
                  </Button>
                )}
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
          <p>
            Are you sure you want to save changes for{" "}
            <strong>{openModal}</strong>?
          </p>
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
