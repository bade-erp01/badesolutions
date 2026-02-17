"use client";
import { useState } from "react";
import Image from "next/image";
import { Encrypt, Dencrypt } from "../../../../../../../Functions/Functions";
import {plsWait,ErrorMessage,SuccessToast} from "../../../../../../../Functions/Mics";
import { useRouter } from "next/navigation";
import axios from "axios";

const ITEMS_PER_PAGE = 10;

export default function Page({ DecryptedAsset, StoreList, userInfo, users, baseUrl }) {
  const [Stores] = useState(StoreList);
  const [formData, setFormData] = useState(DecryptedAsset || {});
  const [user] = useState(userInfo);
  const [usersList] = useState(users || []);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();
  
  const [headers] = useState({
    "Content-Type": "application/json",
    Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
    dbConnect: `Bearer ${userInfo.business.rustyRoof}`,
    access: `${Encrypt(userInfo.user._id)}`,
  });

  const activityLogs = DecryptedAsset.AcivityLog || [];
  const totalPages = Math.ceil(activityLogs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = activityLogs.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };
  
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      plsWait("Please wait...");
      const { data } = await axios.patch(
        `${baseUrl}/api/update/asset/${Encrypt(DecryptedAsset._id)}`,
        formData,
        { headers }
      );

      if (data && data.message) {
        SuccessToast("Asset updated...");
        router.refresh();
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      ErrorMessage(error.message);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6 rounded-lg shadow-lg border border-gray-200 bg-white animate__animated animate__fadeInUpBig animate__delay-2s">
        <form className="space-y-8" onSubmit={handleSubmit}>
          {/* Header Section */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-200">
            <h4 className="text-xs font-bold text-gray-900">{formData.Name}</h4>
            <span className={`px-4 py-2 rounded-full font-semibold tracking-wide shadow-sm border text-xs ${
              formData.status === "Running" ? "bg-green-50 text-green-700 border-green-200" :
              formData.status === "Sold" ? "bg-blue-50 text-blue-700 border-blue-200" :
              "bg-red-50 text-red-700 border-red-200"
            }`}>
              {formData.status}
            </span>
          </div>

          {/* Image Section */}
          <div className="flex items-center space-x-6 pb-6">
            <div className="w-32 h-32 rounded-lg overflow-hidden bg-linear-to-br from-gray-200 to-gray-300 shadow-md border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
              <Image
                height={128}
                width={128}
                src={formData.image || "https://img.icons8.com/stickers/100/decentralized-network.png"}
                alt="Asset"
                quality={90}
                priority
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-900">{formData.AssetCode}</h3>
              <p className="text-gray-600 mt-1 text-xs">Location: {formData.Location?.WHName}</p>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Name */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Name</label>
              <input
                id="Name"
                name="Name"
                type="text"
                value={formData.Name}
                placeholder="Enter Asset Name"
                required
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Location */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Location</label>
              <select
                id="Location"
                name="Location"
                onChange={handleChange}
                required
                className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value={formData.Location?._id}>{formData.Location?.WHName}</option>
                {Stores.map((store) => (
                  <option key={store._id} value={store._id}>{store.WHName}</option>
                ))}
              </select>
            </div>

            {/* Assigned To */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Assigned To</label>
              <select
                id="AssignedTo"
                name="AssignedTo"
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              >
                <option value={formData.AssignedTo?._id}>{formData.AssignedTo?.firstName} {formData.AssignedTo?.lastName}</option>
                {usersList.map((u) => (
                  <option key={u._id} value={u._id}>{u.firstName} {u.lastName}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Status</label>
              {!DecryptedAsset.runDepreciation ? (
                <select
                  id="status"
                  name="status"
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                >
                  <option value={formData.status}>{formData.status}</option>
                  <option value="Running">Running</option>
                  <option value="Sold">Sold</option>
                  <option value="Disposed">Disposed</option>
                </select>
              ) : (
                <div className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-xs text-gray-900 border border-gray-300">
                  {DecryptedAsset?.status}
                </div>
              )}
            </div>

            {/* Serial Number */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Serial Number</label>
              <input
                value={formData.SerialNumber}
                id="SerialNumber"
                name="SerialNumber"
                required
                type="text"
                placeholder="Enter serial number"
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Purchase Value */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Purchase Value</label>
              <input
                value={formData.PurchasedValue || 0}
                id="PurchasedValue"
                name="PurchasedValue"
                required
                placeholder="0.00"
                type="number"
                step="any"
                min="0"
                onChange={handleChange}
                className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Depreciation Rate */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2" htmlFor="ResidualValue">Depreciation Rate</label>
              {!DecryptedAsset.runDepreciation ? (
                <input
                  value={Number(formData.ResidualValue?.$numberDecimal)}
                  id="ResidualValue"
                  name="ResidualValue"
                  required
                  placeholder="0.00"
                  type="number"
                  step="any"
                  min="0"
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              ) : (
                <div className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-xs text-gray-900 border border-gray-300">
                  {DecryptedAsset?.depreciationRate?.$numberDecimal || 0}%
                </div>
              )}
            </div>

            {/* Purchase Date */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Purchase Date</label>
              <input
                value={formData.PurchsedDate}
                id="PurchsedDate"
                name="PurchsedDate"
                onChange={handleChange}
                type="date"
                className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Current Value */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Current Value</label>
              {!DecryptedAsset.runDepreciation ? (
                <input
                  value={formData.CurrentValue || 0}
                  id="CurrentValue"
                  name="CurrentValue"
                  type="number"
                  placeholder="0.00"
                  step="any"
                  min="0"
                  onChange={handleChange}
                  className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              ) : (
                <div className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-xs text-gray-900 border border-gray-300">
                  {DecryptedAsset?.CurrentValue || 0}
                </div>
              )}
            </div>

            {/* Category */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Category</label>
              <input
                value={formData.Category}
                id="Category"
                name="Category"
                onChange={handleChange}
                placeholder="e.g., Equipment, Furniture"
                type="text"
                className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>

            {/* Useful Life */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Useful Life (Months)</label>
              {!DecryptedAsset.runDepreciation ? (
                <input
                  value={formData.usefulYear || 0}
                  id="usefulYear"
                  name="usefulYear"
                  onChange={handleChange}
                  placeholder="e.g., 24 months = 2 years"
                  type="number"
                  min="0"
                  className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
                />
              ) : (
                <div className="w-full rounded-lg bg-gray-100 px-4 py-2.5 text-xs text-gray-900 border border-gray-300">
                  {DecryptedAsset?.usefulYear} months
                </div>
              )}
            </div>

            {/* Vendor */}
            <div className="sm:col-span-1">
              <label className="block text-xs font-semibold text-gray-900 mb-2">Supplier / Vendor</label>
              <input
                value={formData.vendor}
                id="vendor"
                name="vendor"
                placeholder="Vendor name"
                onChange={handleChange}
                type="text"
                className="w-full rounded-lg bg-white px-4 py-2.5 text-xs text-gray-900 border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition"
              />
            </div>
          </div>

          {/* Depreciation Checkbox */}
          <div className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition">
            <input
              type="checkbox"
              id="runDepreciation"
              name="runDepreciation"
              checked={formData.runDepreciation || false}
              onChange={handleChange}
              className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="runDepreciation" className="text-xs font-semibold text-gray-800 cursor-pointer">
              Activate Depreciation
            </label>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-xs font-semibold text-gray-900 mb-2">
              Description
            </label>
            <textarea
              id="description"
              onChange={handleChange}
              name="description"
              value={formData.description || ""}
              className="w-full h-28 p-3 text-xs text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:outline-none transition resize-none"
              placeholder="Write something about this asset..."
            />
          </div>

          {/* Depreciation Schedule Table */}
          {activityLogs.length > 0 && (
            <div className="border-t pt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold text-gray-900">Depreciation Schedule</h2>
                <span className="text-xs text-gray-600">Page {currentPage} of {totalPages}</span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-700 text-white">
                      <th className="px-6 py-3 text-left font-semibold text-xs">Date</th>
                      <th className="px-6 py-3 text-left font-semibold text-xs">Depreciation Amount</th>
                      <th className="px-6 py-3 text-left font-semibold text-xs">Asset Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedLogs.map((schedule, index) => (
                      <tr key={index} className="border-t border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-6 py-3 text-xs text-gray-900">{schedule.Date}</td>
                        <td className="px-6 py-3 text-xs text-gray-900 font-medium">
                          {parseFloat(schedule.DepreciatedValue?.$numberDecimal).toFixed(2)}
                        </td>
                        <td className="px-6 py-3 text-xs text-gray-900 font-medium">
                          {parseFloat(schedule.Assetvalue || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg font-medium text-xs transition ${
                        currentPage === page
                          ? "bg-indigo-600 text-white"
                          : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-xs text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Submit Section */}
          <div>
          {user.user.AssetManager && DecryptedAsset.status === "Running" && (
            <div className="border-t pt-6 flex flex-col gap-3">
              <p className="text-xs text-gray-600 italic">📅 Depreciation runs on the 1st of every month</p>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-indigo-600 text-xs text-white font-semibold shadow-md hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition"
              >
                Save Changes
              </button>
            </div>
          )}

          {user.user.AssetManager && DecryptedAsset.status !== "Running" && DecryptedAsset.AcivityLog.length === 0 && (
            <div className="border-t pt-6 flex flex-row gap-3">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-lg bg-red-600 text-xs text-white font-semibold shadow-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition"
              >
                Delete Asset
              </button>
            </div>
           )} 
          </div>
        </form>
      </div>
    </div>
  );
}
