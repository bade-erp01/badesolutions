"use client";

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
import { Encrypt } from "../../../../../../../Functions/Functions";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function ProductForm({ userData, businessData, VendorList,EXPRESS_PRIVATE_URL }) {
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
    Sellable: true,
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

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(businessData.tenantId)}`,
      dbConnect: `Bearer ${businessData.rustyRoof}`,
      access: `${Encrypt(userData._id)}`,
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      plsWait("Creating Product...⌛");

      const url = `${EXPRESS_PRIVATE_URL}/api/Product/Create-new`;

      const { data } = await axios.post(url, formData, config);

      if (data.Message) {
        SuccessToast(data.Message);
        setFormData({});
        router.refresh();
      } else {
        throw new Error(data.error || "Unexpected error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message || "Failed to create product.");
    }
  };

  const inputClass = "block w-full rounded-md bg-white px-2.5 py-1 text-sm text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 transition-colors";
  const labelClass = "block text-xs font-semibold text-gray-700 mb-1.5";

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <form className="space-y-0" onSubmit={handleSubmit}>
          {/* Header Section */}
          <div className="bg-gray-700 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">Create Product</h2>
            <p className="text-indigo-100 text-sm mt-1">Ensure to provide correct information for your product</p>
          </div>

          {/* Form Content */}
          <div className="px-8 py-8">
            {/* Basic Information Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Product Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Name */}
                <div>
                  <label htmlFor="Name" className={labelClass}>Product Name</label>
                  <input
                    id="Name"
                    name="Name"
                    type="text"
                    required
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., Product Name"
                  />
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className={labelClass}>Category</label>
                  <input
                    id="category"
                    name="category"
                    type="text"
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., Electronics"
                  />
                </div>

                {/* Buying Price */}
                <div>
                  <label htmlFor="BuyingPrice" className={labelClass}>Vendor Price</label>
                  <input
                    required
                    id="BuyingPrice"
                    name="BuyingPrice"
                    defaultValue={formData.BuyingPrice || 0}
                    type="number"
                    step="any"
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="0.00"
                  />
                </div>

                {/* Manufacturer */}
                <div>
                  <label htmlFor="Manufacturer" className={labelClass}>Manufacturer</label>
                  <input
                    id="Manufacturer"
                    name="Manufacturer"
                    type="text"
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Manufacturer name"
                  />
                </div>

                {/* Pieces */}
                <div>
                  <label htmlFor="Pieces" className={labelClass}>Pieces in Carton</label>
                  <input
                    id="Pieces"
                    required
                    name="Pieces"
                    defaultValue={formData.Pieces || 0}
                    onChange={handleChange}
                    type="number"
                    className={inputClass}
                    placeholder="0"
                  />
                </div>

                {/* Vendor */}
                <div>
                  <label htmlFor="Vendor" className={labelClass}>Vendor</label>
                  <select
                    id="Vendor"
                    name="Vendor"
                    required
                    onChange={handleChange}
                    className={inputClass}
                  >
                    <option value="">Select Vendor...</option>
                    {VendorList.map((vendor) => (
                      <option value={vendor._id} key={vendor._id}>
                        {vendor.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unit of Measure */}
                <div>
                  <label htmlFor="UMO" className={labelClass}>Unit of Measure</label>
                  <input
                    id="UMO"
                    name="UMO"
                    type="text"
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g., pcs, kg"
                  />
                </div>

                {/* Color */}
                <div>
                  <label htmlFor="color" className={labelClass}>Color</label>
                  <input
                    id="color"
                    name="color"
                    onChange={handleChange}
                    type="color"
                    className={inputClass}
                  />
                </div>

                {/* VAT */}
                <div>
                  <label htmlFor="VAT" className={labelClass}>VAT (%)</label>
                  <input
                    id="VAT"
                    name="VAT"
                    onChange={handleChange}
                    defaultValue={formData.VAT || 0}
                    type="number"
                    step="any"
                    className={inputClass}
                    placeholder="0"
                  />
                </div>

                {/* Sellable Checkbox */}
                <div className="flex items-end pb-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      onChange={handleChange}
                      id="Sellable"
                      name="Sellable"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700">Sell on ERP</span>
                  </label>
                </div>

                {/* E-commerce Checkbox */}
                <div className="flex items-end pb-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      onChange={handleChange}
                      id="Ecom_sale"
                      name="Ecom_sale"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-xs font-medium text-gray-700">Sell on E-commerce</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Price Lists Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Price Lists</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                  businessData.subscriptionplan === "Standard" || num <= 2 ? (
                    <div key={num}>
                      <label htmlFor={`Pricelist${num}`} className={labelClass}>
                        {business[`priceList${num}`]} price
                      </label>
                      <input
                        id={`Pricelist${num}`}
                        name={`Pricelist${num}`}
                        type="number"
                        step="any"
                        defaultValue={formData[`Pricelist${num}`] || 0}
                        onChange={handleChange}
                        className={inputClass}
                        placeholder="0.00"
                      />
                    </div>
                  ) : null
                ))}
              </div>
            </div>

            {/* Description Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">Description</h3>
              <div>
                <label htmlFor="Description" className={labelClass}>Product Description</label>
                <textarea
                  id="Description"
                  onChange={handleChange}
                  name="Description"
                  className="w-full text-black h-24 p-2.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 focus:outline-none transition-colors resize-none"
                  placeholder="Write a simple and concise description about this product..."
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              {user.createProduct && (
                <button
                  type="submit"
                  className="px-6 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors shadow-md"
                >
                  Create Product
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
