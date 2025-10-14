"use client";
import Nav1 from "@/app/Components/Nav1";
import {EXPRESS_PRIVATE_URL} from "../../../../../../../Functions/Functions"
import BackButton from "@/app/Components/BackBotton";
import Image from "next/image";
import { useState } from "react";
import {
  plsWait,
  Encrypt,
  SuccessToast,
  ErrorMessage,
} from "../../../../../../../Functions/Mics";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function SingleStoreProductpage({ storeProduct, userInfo }) {
  const router = useRouter();
  const [formData, setFormData] = useState({ ...storeProduct });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : Number(value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      plsWait("Updating Fields...");

      const response = await axios.patch(
        `${EXPRESS_PRIVATE_URL}/api/Adjust/Product/${Encrypt(formData._id)}`, // Replace with your actual endpoint
        {
          currentQty: formData.currentQty,
          pcs: formData.pcs,
          isActivated: formData.isActivated,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`, // Replace with your actual token
            dbConnect:`Bearer ${userInfo.business.rustyRoof}`,
            access:`${Encrypt(userInfo.user._id)}`
          },
        }
      );

      // Inside your async function (e.g., handleSubmit)
      if (response.data.message) {
        SuccessToast(response.data.message);
        router.refresh(); // This will reload server-side data and re-render the page
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      ErrorMessage("Update failed:", error.message);
    }
  };

  return (
    <>
      <Nav1
        user={userInfo.user}
        business={userInfo.business}
        page={storeProduct.productName}
      />

      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8 md:py-10 bg-white shadow-2xl m-4 animate__animated animate__fadeIn rounded-lg">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-6">
          <BackButton />
        </div>

        {/* Product Image */}
        <div className="w-full flex justify-center mb-6">
          {storeProduct.image ? (
            <Image
              src={storeProduct.image}
              alt="Product Image"
              width={180}
              height={180}
              className="rounded-lg object-contain"
            />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
              No Image Available
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="text-center mb-6 space-y-1">
          <h2 className="text-xl font-bold text-gray-800">
            {storeProduct.productName}
          </h2>
          <p className="text-sm text-gray-500">
            <strong>Category:</strong> {storeProduct.category}
          </p>
          <p className="text-sm text-gray-500">
            <strong>Last Batch Date:</strong>{" "}
            {storeProduct.LastBatchDate || "Not Available"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* currentQty */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CRTN
              </label>
              <input
                type="number"
                name="currentQty"
                value={formData.currentQty}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
              />
            </div>

            {/* pcs */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                PCS
              </label>
              <input
                type="number"
                name="pcs"
                value={formData.pcs}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50"
              />
            </div>

            {/* isActivated */}
            <div className="col-span-2 flex items-center pt-2">
              <input
                type="checkbox"
                name="isActivated"
                checked={formData.isActivated}
                onChange={handleChange}
                className="h-4 w-4 text-orange-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                {formData.isActivated ? "Activate" : "Deactivate"}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          {userInfo?.user?.isAdmin && !formData?.FOCProId && (
          <div className="space-y-2">
            <p className="text-sm text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-md px-4 py-2">
              ⚠️ Ensure this product is <strong>not being billed</strong> when the update is performed.
            </p>
            <button
              type="submit"
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
            >
              Update Product
            </button>
          </div>
        )}
        </form>

        {/* Activity Log */}
        <div className="mt-10">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Audit Log</h3>
          <div className="relative max-h-64 overflow-y-auto bg-gray-50 rounded-md p-4">
            <div className="border-l border-gray-500 pl-6 space-y-6">
              {storeProduct.ActivitiyLog?.map((log, index) => (
                <div key={index} className="relative">
                  {/* Dot */}
                  <div className="absolute -left-3 top-1 w-3 h-3 bg-gray-500 rounded-full border-1 border-black"></div>

                  {/* Content */}
                  <div className="text-sm text-gray-700">
                    <p className="font-medium">{" "} {log.message}</p>
                    {log.timestamp && (
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
      </div>
    </>
  );
}
