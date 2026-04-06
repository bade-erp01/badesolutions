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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SingleProductpage({
  userInfo,
  businessInfo,
  Backdata,
}) {
  const [data] = useState(Backdata);
  const [isOpen3, setIsOpen3] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useProductEditTour(Backdata.Name); // for driver

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
                      <h3 className="font-semibold text-gray-900">
                        {formData.Name}
                      </h3>
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
                      <h3 className="font-semibold text-gray-900">
                        {formData.category}
                      </h3>
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
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Subcategory}
                      </h5>
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
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Manufacturer}
                      </h5>
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
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Manufacture_code}
                      </h5>
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
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Pieces}
                      </h5>
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
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.UMO}
                      </h5>
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
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.VAT.$numberDecimal}
                      </h5>
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
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 sm:text-sm">
                        {formData.Pricelist1}
                      </h5>
                    </div>
                    <label
                      htmlFor="VatpriceList1"
                      className="block font-medium text-gray-900 items-start justify-start text-start text-xs mt-4"
                    >
                      Apply {data.VAT.$numberDecimal}% Vat on{" "}
                      {businessInfo.priceList1}?
                    </label>
                    <div className="mt-2">
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 outline-gray-300 sm:text-sm">
                        {formData.VatpriceList1 ? "Yes" : "No"}
                      </h5>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="Pricelist2"
                      className="block text-sm/6 font-medium text-gray-900"
                    >
                      {businessInfo.priceList2} Price
                    </label>
                    <div className="mt-2">
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Pricelist2}
                      </h5>
                    </div>
                    <label
                      htmlFor="VatpriceList2"
                      className="block font-medium text-gray-900 items-start justify-start text-start text-xs mt-4"
                    >
                      Apply {data.VAT.$numberDecimal}% Vat on{" "}
                      {businessInfo.priceList2}?
                    </label>
                    <div className="mt-2">
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.VatpriceList2 ? "Yes" : "No"}
                      </h5>
                    </div>
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
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist3}
                          </h5>
                        </div>
                        <label
                          htmlFor="VatpriceList3"
                          className="block font-medium text-gray-900 items-start justify-start text-start text-xs mt-4"
                        >
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList3}?
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.VatpriceList3 ? "Yes" : "No"}
                          </h5>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist4"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList4} Price
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist4}
                          </h5>
                        </div>
                        <label
                          htmlFor="VatpriceList4"
                          className="block font-medium text-gray-900 items-start justify-start text-start text-xs mt-4"
                        >
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList4}?
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.VatpriceList4 ? "Yes" : "No"}
                          </h5>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist5"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList5} Price
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist5}
                          </h5>
                        </div>
                        <label
                          htmlFor="VatpriceList5"
                          className="block font-medium text-gray-900 items-start justify-start text-start text-xs mt-4"
                        >
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList5}?
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.VatpriceList5 ? "Yes" : "No"}
                          </h5>
                        </div>
                      </div>

                      <div className="sm:col-span-2 sm:col-start-1">
                        <label
                          htmlFor="Pricelist6"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList6} Price
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist6}
                          </h5>
                        </div>
                        <label
                          htmlFor="VatpriceList6"
                          className="block font-medium text-gray-900 items-start justify-start text-start text-xs mt-4"
                        >
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList6}?
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.VatpriceList6 ? "Yes" : "No"}
                          </h5>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="Pricelist7"
                          className="block text-sm/6 font-medium text-gray-900"
                        >
                          {businessInfo.priceList7} Price
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist7}
                          </h5>
                        </div>
                        <label
                          htmlFor="VatpriceList7"
                          className="block font-medium text-gray-900 items-start justify-start text-start text-xs mt-4"
                        >
                          Apply {data.VAT.$numberDecimal}% Vat on{" "}
                          {businessInfo.priceList7}?
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.VatpriceList7 ? "Yes" : "No"}
                          </h5>
                        </div>
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

                    {/* Promo value */}
                    <div className="mt-2">
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Pricelist1Promo ?? ""}
                      </h5>
                    </div>

                    {/* End Date label */}
                    <label
                      htmlFor="Pricelist1PromoDate"
                      className="block text-sm/6 font-medium text-gray-900 mt-4"
                    >
                      {businessInfo.priceList1} Promo End Date
                    </label>

                    {/* End Date value */}
                    <div className="mt-2">
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Pricelist1PromoDate
                          ? moment(formData.Pricelist1PromoDate).format(
                              "YYYY-MM-DD",
                            )
                          : ""}
                      </h5>
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

                    {/* Promo value */}
                    <div className="mt-2">
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Pricelist2Promo ?? ""}
                      </h5>
                    </div>

                    {/* End Date label */}
                    <label
                      htmlFor="Pricelist2PromoDate"
                      className="block text-sm/6 font-medium text-gray-900 mt-4"
                    >
                      {businessInfo.priceList2} Promo End Date
                    </label>

                    {/* End Date value */}
                    <div className="mt-2">
                      <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                        {formData.Pricelist2PromoDate
                          ? moment(formData.Pricelist2PromoDate).format(
                              "YYYY-MM-DD",
                            )
                          : ""}
                      </h5>
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
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist3Promo ?? ""}
                          </h5>
                        </div>
                        <label
                          htmlFor="Pricelist3PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                          {businessInfo.priceList3} Promo End Date
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist3PromoDate
                              ? moment(formData.Pricelist3PromoDate).format(
                                  "YYYY-MM-DD",
                                )
                              : ""}
                          </h5>
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
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist4Promo ?? ""}
                          </h5>
                        </div>
                        <label
                          htmlFor="Pricelist4PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                          {businessInfo.priceList4} Promo End Date
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist4PromoDate
                              ? moment(formData.Pricelist4PromoDate).format(
                                  "YYYY-MM-DD",
                                )
                              : ""}
                          </h5>
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
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist5Promo ?? ""}
                          </h5>
                        </div>
                        <label
                          htmlFor="Pricelist5PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                          {businessInfo.priceList5} Promo End Date
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist5PromoDate
                              ? moment(formData.Pricelist5PromoDate).format(
                                  "YYYY-MM-DD",
                                )
                              : ""}
                          </h5>
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
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist6Promo ?? ""}
                          </h5>
                        </div>
                        <label
                          htmlFor="Pricelist6PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                          {businessInfo.priceList6} Promo End Date
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist6PromoDate
                              ? moment(formData.Pricelist6PromoDate).format(
                                  "YYYY-MM-DD",
                                )
                              : ""}
                          </h5>
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
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist7Promo ?? ""}
                          </h5>
                        </div>
                        <label
                          htmlFor="Pricelist7PromoDate"
                          className="block text-sm/6 font-medium text-gray-900 mt-4"
                        >
                          {businessInfo.priceList7} Promo End Date
                        </label>
                        <div className="mt-2">
                          <h5 className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6">
                            {formData.Pricelist7PromoDate
                              ? moment(formData.Pricelist7PromoDate).format(
                                  "YYYY-MM-DD",
                                )
                              : ""}
                          </h5>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <CommentForm userData={userInfo} product={data} />
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

        const data = result.invoice
          .filter((entry) => entry.salesPerson === user._id)
          .flatMap((invoice) =>
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
          <p className="text-md font-semibold text-gray-700 mb-1">
            📈 Sales Insight for {productName},{tottalSales}
            <hr />
            <br />
          </p>
          <i className="text-gray-500 text-sm">
            Last updated: {moment().format("YYYY-MM-DD HH:mm:ss")}
          </i>
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

// comment
export function CommentForm({ userData, product }) {
  const [formData, setFormData] = useState({
    comment: "",
    rating: 0,
    userId: userData._id,
    userName: userData.firstName
  });

  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRating = (value) => {
    setFormData({ ...formData, rating: value });
  };

  const handleSubmit = async () => {
    plsWait("Submitting review.");
    try {
        const request = await axios.post(
        `${EXPRESS_PRIVATE_URL}/api/product/review/${Encrypt(product._id)}`,
        formData,
        {
            headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userData.tenantId)}`,
            access: `${Encrypt(userData._id)}`
            },
        }
        );

        const response = request.data;

        SuccessToast(response.message || "Review submitted successfully!");
        setFormData({});
        // router.refresh(); // refresh page or redirect
    } catch (err) {
        console.error(err); // helpful for debugging
        ErrorMessage(err.response?.data?.message || err.message || "Error saving comment");
    }
    };

  return (
    <Card className="max-w-full mx-auto shadow-lg">
      <CardHeader>
        <CardTitle>Submit a Review for {product.Name.toLowerCase()}</CardTitle>
      </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              name="comment"
              placeholder="Write your review..."
              maxLength={500}
              required
              value={formData.comment}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="rating">Rating</Label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleRating(value)}
                  className={`text-3xl transition-colors ${
                    formData.rating >= value
                      ? "text-yellow-400"
                      : "text-gray-300 hover:text-yellow-300"
                  }`}
                  aria-label={`${value} star${value > 1 ? "s" : ""}`}
                >
                  {formData.rating >= value ? "★" : "☆"}
                </button>
              ))}
            </div>
            <input type="hidden" name="rating" value={formData.rating} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button
          onClick={handleSubmit}
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Submit Review
          </Button>
        </CardFooter>
    </Card>
  );
}
