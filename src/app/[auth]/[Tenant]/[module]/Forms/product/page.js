"use client";
import BackButton from "@/app/Components/BackBotton";
import {
  PhotoIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import {
  plsWait,
  SuccessToast,
  ErrorMessage,
} from "../../../../../../../Functions/Mics";
import { Encrypt,EXPRESS_PRIVATE_URL } from "../../../../../../../Functions/Functions";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProductForm({ userData, businessData, VendorList }) {
  const [user] = useState(userData);
  const [business] = useState(businessData);
  const router = useRouter();
  const [formData, setFormData] = useState({
    Name: "",
    UOM: "",
    category: "",
    Pricelist1: 1,
    Pricelist2: 1,
    Pricelist3: 1,
    Pricelist4: 1,
    Pricelist5: 1,
    Pricelist6: 1,
    Pricelist7: 1,
    Vendor: "",
    ADCcode: "",
    color: "",
    Description: "",
    Sellable: false,
    Ecom_sale: false,
    Manufacturer: "",
    VAT: 0,
    Pieces: 1,
    category: "",
    BuyingPrice: 0,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Use a single config object for axios
  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(business.tenantId)}`,
      "X-Requested-With": "XMLHttpRequest",
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      plsWait("Creating Product...⌛");

      const url = `${EXPRESS_PRIVATE_URL}/${business.companyName}/Product/Create-new`;

      const { data } = await axios.post(url, formData, config);

      if (data.Message) {
        SuccessToast(data.Message);
        setFormData({}); // Clear form safely
        router.refresh(); // Refresh UI
      } else {
        throw new Error(data.error || "Unexpected error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message || "Failed to create product.");
    }
  };

  return (
    <>
      <div className="m-5 p-4 shadow-2xl border-lg border-2-black bg-white">
        <BackButton />
        <form className="space-y-5 mx-auto" onSubmit={handleSubmit}>
          <div className="border-b bg- border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">
              Product Information
            </h2>
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
                  <input
                    id="Name"
                    name="Name"
                    type="text"
                    required
                    onChange={handleChange}
                    autoComplete="Name-name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              {/* <div className="sm:col-span-3">
                <label
                  htmlFor="product_code"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Product Code
                </label>
                <div className="mt-2">
                  <input
                    id="product_code"
                    required
                    name="product_code"
                    type="text"
                    onChange={handleChange}
                    autoComplete="family-name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div> */}

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="category"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Product category
                </label>
                <div className="mt-2">
                  <input
                    id="category"
                    name="category"
                    type="text"
                    onChange={handleChange}
                    autoComplete="category-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="BuyingPrice"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Vendor Price
                </label>
                <div className="mt-2">
                  <input
                    required
                    id="BuyingPrice"
                    name="BuyingPrice"
                    type="number"
                    step="any"
                    onChange={handleChange}
                    autoComplete="address-level1"
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
                    id="Manufacturer"
                    name="Manufacturer"
                    type="text"
                    onChange={handleChange}
                    autoComplete="postal-code"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              {/* <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Rolls"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Rolls in a Carton
                </label>
                <div className="mt-2">
                  <input
                    required
                    id="Rolls"
                    name="Rolls"
                     onChange={handleChange}
                    type="number"
                    autoComplete="address-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div> */}

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Pieces"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Pieces in a Carton
                </label>
                <div className="mt-2">
                  <input
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
                    <option> Choose...</option>
                    {VendorList.map((vendor) => (
                      <option value={vendor._id} key={vendor._id}>
                        {vendor.Name}
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
                  Unit of Measure
                </label>
                <div className="mt-2">
                  <input
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
                    id="color"
                    name="color"
                    onChange={handleChange}
                    type="color"
                    autoComplete="address-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Sellable"
                  className="block text-sm font-medium text-gray-900"
                >
                  I want to Sell this product on BADE ERP?
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    onChange={handleChange}
                    id="Sellable"
                    name="Sellable"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Ecom_sale"
                  className="block text-sm font-medium text-gray-900"
                >
                  I want to Sell this product on BADE E-commerce?
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    onChange={handleChange}
                    id="Ecom_sale"
                    name="Ecom_sale"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="VAT"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  VAT
                </label>
                <div className="mt-2">
                  <input
                    id="VAT"
                    name="VAT"
                    onChange={handleChange}
                    type="text"
                    step="any"
                    autoComplete="address-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Pricelist1"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Pricelist 1
                </label>
                <div className="mt-2">
                  <input
                    id="Pricelist1"
                    name="Pricelist1"
                    type="text"
                    step="any"
                    onChange={handleChange}
                    autoComplete="Pricelist-level1"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Pricelist2"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Pricelist2
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleChange}
                    id="Pricelist2"
                    name="Pricelist2"
                    type="text"
                    step="any"
                    autoComplete="Pricelist2-code"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

               {businessData.subscriptionplan === "Standard" && (
                <>
              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Pricelist3"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Pricelist3
                </label>
                <div className="mt-2">
                  <input
                    id="Pricelist3"
                    name="Pricelist3"
                    onChange={handleChange}
                    type="text"
                    step="any"
                    autoComplete="Pricelist-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Pricelist4"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Pricelist4
                </label>
                <div className="mt-2">
                  <input
                    id="Pricelist4"
                    name="Pricelist4"
                    type="text"
                    step="any"
                    onChange={handleChange}
                    autoComplete="Pricelist1-level1"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Pricelist5"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Pricelist5
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleChange}
                    id="Pricelist5"
                    name="Pricelist5"
                    type="text"
                    step="any"
                    autoComplete="Pricelist1-code"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Pricelist6"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Pricelist6
                </label>
                <div className="mt-2">
                  <input
                    id="Pricelist6"
                    name="Pricelist6"
                    step="any"
                    onChange={handleChange}
                    type="text"
                    autoComplete="Pricelist1-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Pricelist7"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Pricelist7
                </label>
                <div className="mt-2">
                  <input
                    id="Pricelist7"
                    name="Pricelist7"
                    type="text"
                    step="any"
                    onChange={handleChange}
                    autoComplete="Pricelist1-level1"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
              </>
              )}
            </div>
          </div>

          <div className="border-b border-gray-900/10 pb-12">
            <h5> Write a description.</h5>
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
                  onChange={handleChange}
                  name="Description"
                  className="w-full h-32 p-3 border border-dashed border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your text here..."
                ></textarea>
              </div>
              <div className="mt-6 flex items-center justify-end gap-x-6">
                {user.createProduct && (
                  <button
                    type="submit"
                    className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-green-500 focus-visible:outline-indigo-600 transition"
                  >
                    Create new Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
