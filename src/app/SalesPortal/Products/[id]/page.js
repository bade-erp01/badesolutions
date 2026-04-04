"use client";
import { useRouter } from "next/navigation";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../Functions/Mics";
import axios from "axios";
import moment from "moment";
import { useEffect, Suspense } from "react";
import Plotly from "plotly.js-dist-min";
import {
  Encrypt,
  EXPRESS_PRIVATE_URL,
} from "../../../../../Functions/Functions";
import { driver } from "driver.js";
import "driver.js/dist/driver.css"; // Make sure the CSS is imported!
import { useState } from "react";
import Image from "next/image";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";

export default function SingleProductpage({
  userInfo,
  businessInfo,
  Backdata,
}) {
  const [data] = useState(Backdata);
  const router = useRouter();
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
 

  useProductEditTour(Backdata.Name); // for driver


  const [headers] = useState({
    "Content-Type": "application/json",
    Authorization: `Bearer ${Encrypt(businessInfo.tenantId)}`,
    access: `${Encrypt(userInfo._id)}`,
  });

  const [formData] = useState({ ...data });

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={`${data.Name}`} />}>
      <div className="m-5 p-4 rounded shadow-2xl border-lg border-2-black bg-white animate__animated animate__fadeInUpBig animate__delay-2s">
        <form className="space-y-5 mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <span
              className={`px-5 py-1.5 rounded-full font-small font-semibold tracking-wide shadow-sm border bg-indigo-50 text-gray-700 border-indigo-200`}
            >
              {formData.ADCcode || formData.ACDcode}
            </span>
          </div>

          {/* Avatar & Attachment */}
          <div className="flex flex-wrap gap-8 items-center py-4">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="w-28 h-28 rounded overflow-hidden flex items-center justify-center">
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
                Product Information
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
                
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label
                      htmlFor="Name"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Name
                    </label>
                    <div className="mt-2">
                      <h3 className="font-semibold text-gray-900">{formData.Name}</h3>
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
                      <h3 className="font-semibold text-gray-900">{formData.category}</h3>
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
                        
                        autoComplete="Subcategory-level2"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
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
                        type="number"
                        autoComplete="Pieces-level2"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="UMO"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      Unit of Measure
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.UMO}
                        id="UMO"
                        name="UMO"
                        type="text"
                        
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
                        
                        type="color"
                        autoComplete="address-level2"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div id="others" className="sm:col-span-2 sm:col-start-1">
                    <label
                      htmlFor="VAT"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      VAT Percentage (%)
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.VAT.$numberDecimal}
                        id="VAT"
                        name="VAT"
                        
                        type="number"
                        step="any"
                        autoComplete="VAT"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Pricelist1"
                      className="block text-sm font-medium text-gray-900"
                    >
                      {businessInfo.priceList1} Price
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.Pricelist1}
                        id="Pricelist1"
                        name="Pricelist1"
                        type="number"
                        step="any"
                        
                        autoComplete="Pricelist-level1"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 sm:text-sm"
                      />
                    </div>
                    <label
                      htmlFor="VatpriceList1"
                      className="block font-medium text-gray-900  items-start justify-start text-start text-xs"
                    >
                      <input
                        checked={formData.VatpriceList1 || false}
                        
                        id="VatpriceList1"
                        name="VatpriceList1"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                      />{" "}
                      Apply {data.VAT.$numberDecimal}% Vat on{" "}
                      {businessInfo.priceList1}?
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Pricelist2"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      {businessInfo.priceList2} Price
                    </label>
                    <div className="mt-2">
                      <input
                        value={formData.Pricelist2}
                        
                        id="Pricelist2"
                        name="Pricelist2"
                        type="number"
                        step="any"
                        autoComplete="Pricelist2-code"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                    <label
                      htmlFor="VatpriceList2"
                      className="block font-medium text-gray-900  items-start justify-start text-start text-xs"
                    >
                      <input
                        checked={formData.VatpriceList2 || false}
                        
                        id="VatpriceList2"
                        name="VatpriceList2"
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                      />{" "}
                      Apply {data.VAT.$numberDecimal}% Vat on{" "}
                      {businessInfo.priceList2}?
                    </label>
                  </div>

                  {businessInfo.subscriptionplan === "Standard" && (
                    <>
                      <div className="sm:col-span-2 sm:col-start-1">
                        <label
                          htmlFor="Pricelist3"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList3} Price
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist3}
                            id="Pricelist3"
                            name="Pricelist3"
                            
                            type="number"
                            step="any"
                            autoComplete="Pricelist-level2"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="VatpriceList3"
                          className="block font-medium text-gray-900  items-start justify-start text-start text-xs"
                        >
                          <input
                            checked={formData.VatpriceList3 || false}
                            
                            id="VatpriceList3"
                            name="VatpriceList3"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                          />{" "}
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList3}?
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist4"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList4} Price
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist4}
                            id="Pricelist4"
                            name="Pricelist4"
                            type="number"
                            step="any"
                            
                            autoComplete="Pricelist1-level1"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="VatpriceList4"
                          className="block font-medium text-gray-900  items-start justify-start text-start text-xs"
                        >
                          <input
                            checked={formData.VatpriceList4 || false}
                            
                            id="VatpriceList4"
                            name="VatpriceList4"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                          />{" "}
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList4}?
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist5"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList5} Price
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist5}
                            
                            id="Pricelist5"
                            name="Pricelist5"
                            type="number"
                            step="any"
                            autoComplete="Pricelist1-code"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="VatpriceList5"
                          className="block font-medium text-gray-900  items-start justify-start text-start text-xs"
                        >
                          <input
                            checked={formData.VatpriceList5 || false}
                            id="VatpriceList5"
                            name="VatpriceList5"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                          />{" "}
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList5}?
                        </label>
                      </div>

                      <div className="sm:col-span-2 sm:col-start-1">
                        <label
                          htmlFor="Pricelist6"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList6} Price
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist6}
                            id="Pricelist6"
                            name="Pricelist6"
                            step="any"
                            type="number"
                            autoComplete="Pricelist1-level2"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="VatpriceList6"
                          className="block font-medium text-gray-900  items-start justify-start text-start text-xs"
                        >
                          <input
                            checked={formData.VatpriceList6 || false}
                            id="VatpriceList6"
                            name="VatpriceList6"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                          />{" "}
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList6}?
                        </label>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist7"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList7} Price
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist7}
                            id="Pricelist7"
                            name="Pricelist7"
                            type="number"
                            step="any"
                            
                            autoComplete="Pricelist1-level1"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="VatpriceList7"
                          className="block font-medium text-gray-900  items-start justify-start text-start text-xs"
                        >
                          <input
                            checked={formData.VatpriceList7 || false}
                            
                            id="VatpriceList7"
                            name="VatpriceList7"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 mt-1"
                          />{" "}
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList7}?
                        </label>
                      </div>
                    </>
                  )}
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
                  Promo Section
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
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                  {/* promo section */}
                  <div className="sm:col-span-2">
                    {/* Label for Promo */}
                    <label
                      htmlFor="Pricelist1Promo"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      {businessInfo.priceList1} Promo
                    </label>

                    {/* Promo input */}
                    <div className="mt-2">
                      <input
                        value={formData.Pricelist1Promo}
                        id="Pricelist1Promo"
                        name="Pricelist1Promo"
                        type="number"
                        step="any"
                        
                        autoComplete="Pricelist1-level1"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 
                 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 
                 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>

                    {/* End Date label */}
                    <label
                      htmlFor="Pricelist1PromoDate"
                      className="block text-sm/6 font-medium text-gray-900 mt-4"
                    >
                      {businessInfo.priceList1} Promo End Date
                    </label>

                    {/* End Date input */}
                    <div className="mt-2">
                      <input
                        value={moment(formData.Pricelist1PromoDate).format('YYYY-MM-DD')}
                        id="Pricelist1PromoDate"
                        name="Pricelist1PromoDate"
                        type="date"
                        
                        autoComplete="Pricelist1PromoDate"
                        min={new Date().toISOString().split("T")[0]}
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 
                 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 
                 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    {/* Label for Pricelist2 Promo */}
                    <label
                      htmlFor="Pricelist2Promo"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      {businessInfo.priceList2} Promo
                    </label>

                    {/* Promo input */}
                    <div className="mt-2">
                      <input
                        value={formData.Pricelist2Promo}
                        id="Pricelist2Promo"
                        name="Pricelist2Promo"
                        type="number"
                        step="any"
                        min={0}
                        
                        autoComplete="Pricelist2Promo"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 
                 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 
                 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>

                    {/* End Date label */}
                    <label
                      htmlFor="Pricelist2PromoDate"
                      className="block text-sm/6 font-medium text-gray-900 mt-4"
                    >
                     {businessInfo.priceList2} Promo End Date
                    </label>

                    {/* End Date input */}
                    <div className="mt-2">
                      <input
                        value={moment(formData.Pricelist2PromoDate).format('YYYY-MM-DD')}
                        id="Pricelist2PromoDate"
                        name="Pricelist2PromoDate"
                        type="date"
                        
                        min={new Date().toISOString().split("T")[0]}
                        autoComplete="Pricelist2PromoDate"
                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 
                 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 
                 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                      />
                    </div>
                  </div>

                  {businessInfo.subscriptionplan === "Standard" && (
                    <>
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist3Promo"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList3} Promo
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist3Promo || 0}
                            id="Pricelist3Promo"
                            name="Pricelist3Promo"
                            type="number"
                            step="any"
                            min={0}
                            
                            autoComplete="Pricelist3Promo"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="Pricelist3PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                         {businessInfo.priceList3} Promo End Date
                        </label>
                        <div className="mt-2">
                          <input
                            value={moment(formData.Pricelist3PromoDate).format('YYYY-MM-DD')}
                            id="Pricelist3PromoDate"
                            name="Pricelist3PromoDate"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            
                            autoComplete="Pricelist3PromoDate"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist4Promo"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList4} Promo
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist4Promo || 0}
                            id="Pricelist4Promo"
                            name="Pricelist4Promo"
                            type="number"
                            step="any"
                            min={0}
                            
                            autoComplete="Pricelist4Promo"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="Pricelist4PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                         {businessInfo.priceList4} Promo End Date
                        </label>
                        <div className="mt-2">
                          <input
                            value={moment(formData.Pricelist4PromoDate).format('YYYY-MM-DD') }
                            id="Pricelist4PromoDate"
                            name="Pricelist4PromoDate"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            
                            autoComplete="Pricelist4PromoDate"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist5Promo"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList5} Promo
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist5Promo || 0}
                            id="Pricelist5Promo"
                            name="Pricelist5Promo"
                            type="number"
                            step="any"
                            min={0}
                            
                            autoComplete="Pricelist5Promo"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="Pricelist5PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                         {businessInfo.priceList5} Promo End Date
                        </label>
                        <div className="mt-2">
                          <input
                            value={moment(formData.Pricelist5PromoDate).format('YYYY-MM-DD')}
                            id="Pricelist5PromoDate"
                            name="Pricelist5PromoDate"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            
                            autoComplete="Pricelist5PromoDate"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist6Promo"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList6} Promo
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist6Promo || 0}
                            id="Pricelist6Promo"
                            name="Pricelist6Promo"
                            type="number"
                            step="any"
                            min={0}
                            
                            autoComplete="Pricelist6Promo"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="Pricelist6PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                          {businessInfo.priceList6} Promo End Date
                        </label>
                        <div className="mt-2">
                          <input
                            value={moment(formData.Pricelist6PromoDate).format('YYYY-MM-DD')}
                            id="Pricelist6PromoDate"
                            name="Pricelist6PromoDate"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            
                            autoComplete="Pricelist6PromoDate"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist7Promo"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList7} Promo
                        </label>
                        <div className="mt-2">
                          <input
                            value={formData.Pricelist7Promo || 0 }
                            id="Pricelist7Promo"
                            name="Pricelist7Promo"
                            type="number"
                            step="any"
                            min={0}
                            
                            autoComplete="Pricelist7Promo-level1"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                        <label
                          htmlFor="Pricelist7PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                         {businessInfo.priceList7} Promo End Date
                        </label>
                        <div className="mt-2">
                          <input
                            value={moment(formData.Pricelist7PromoDate).format('YYYY-MM-DD')}
                            id="Pricelist7PromoDate"
                            name="Pricelist7PromoDate"
                            type="date"
                            min={new Date().toISOString().split("T")[0]}
                            
                            autoComplete="Pricelist7PromoDate"
                            className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 
                 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 
                 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                          />
                        </div>
                      </div>
                    </>
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
                  
                  value={formData.Description}
                  className="w-full text-black h-32 p-3 border border-dashed border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your text here..."
                />
              </div>

            </div>
          </div>
        </form>
      </div>
    </Suspense>
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
            dbConnect: `Bearer ${business.rustyRoof}`,
            access: `${Encrypt(user._id)}`,
          },
          next: {
            revalidate: 120,
            cache: "force-cache",
          },
        });

        const result = await response.json();
        if (!result?.invoice) return;

        const data = result.invoice.filter(entry => entry.salesPerson === user._id).flatMap((invoice) =>
          invoice.orders.map((order) => ({
            sold: order.total,
            InvoiceDate: invoice.startDate,
            _id: order.item._id,
          }))
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
      }, 60000); //  Delay for 1 minute (60000 ms)

      // Cleanup in case the component unmounts before timeout
      return () => clearTimeout(timeoutId);
    }
  }, [product]);
}
