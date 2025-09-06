"use client";

import { Dencrypt,EXPRESS_PRIVATE_URL,Encrypt } from "../../../../../../../Functions/Functions";
import { useSearchParams,useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { plsWait, ErrorMessage, SuccessToast, } from "../../../../../../../Functions/Mics";
import {WrenchScrewdriverIcon,ChartPieIcon,ShieldExclamationIcon,PuzzlePieceIcon,CloudArrowUpIcon,QueueListIcon,CloudArrowDownIcon} from "@heroicons/react/24/outline"

export default function Page({ staffs, stores }) {
  const searchParams = useSearchParams();
  const Router = useRouter();
  const storeParam = searchParams.get("store");

  const decryptedStoreId = useMemo(
    () => (storeParam ? Dencrypt(storeParam) : null),
    [storeParam]
  );

  const parsedStores = useMemo(() => {
    try {
      return JSON.parse(stores);
    } catch {
      return [];
    }
  }, [stores]);

  const parsedStaffs = useMemo(() => {
    try {
      return JSON.parse(staffs);
    } catch {
      return [];
    }
  }, [staffs]);

  const [selectedStore, setSelectedStore] = useState([]);
  const [formData, setFormData] = useState({
    WHName: "",
    Email: "",
    InvoiceNo: "",
    Address: "",
    Status: false,
    limit: "0",
    StoreManager: "",
    StoreKeeper: "",
  });

  useEffect(() => {
    if (decryptedStoreId) {
      const foundStore = parsedStores.find((s) => s._id === decryptedStoreId);
      setSelectedStore(foundStore ? [foundStore] : []);
      if (foundStore) {
        setFormData({
          WHName: foundStore.WHName || "",
          Email: foundStore.Email || "",
          InvoiceNo: foundStore.InvoiceNo || "",
          Address: foundStore.Address || "",
          Status: foundStore.Status || false,
          limit: foundStore.limit?.$numberDecimal || "0",
          StoreManager: foundStore.StoreManager || "",
          StoreKeeper: foundStore.StoreKeeper || "",
        });
      }
    }
  }, [decryptedStoreId, parsedStores]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    plsWait('Saving store settings...')
    fetch(`${EXPRESS_PRIVATE_URL}/api/warehouse/edit/${Encrypt(Store._id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        SuccessToast(data.result);
        Router.refresh();
      })
      .catch((error) => {
        ErrorMessage(error.message);
        Router.refresh()
      });
  };

  const Store = selectedStore[0];

  return (
    <div>
      {Store && (
        <div className="m-5 bg-gray-100 p-6 shadow-sm ">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            <WrenchScrewdriverIcon className="h-6 w-6 text-gray-800 inline-block mr-2" /> {Store.WHName}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Store Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Store Name
              </label>
              <input
                type="text"
                name="WHName"
                value={formData.WHName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            {/* Invoice No */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Invoice No
              </label>
              <input
                type="text"
                name="InvoiceNo"
                value={formData.InvoiceNo}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <input
                type="text"
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            {/* Status */}
            <div className="flex items-center pt-2">
              <input
                type="checkbox"
                name="Status"
                checked={formData.Status}
                onChange={handleChange}
                className="h-4 w-4 text-green-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                {formData.Status ? "Active" : "Inactive"}
              </label>
            </div>

            {/* Limit */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Limit
              </label>
              <input
                type="text"
                step={`any`}
                name="limit"
                value={formData.limit}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700"
              />
            </div>

            {/* Store Manager */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Store Manager
              </label>
              <select
                name="StoreManager"
                value={formData.StoreManager}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white"
              >
                <option value={Store.StoreManager}>
                  {Store.StoreManager
                    ? parsedStaffs.find(staff => staff._id === Store.StoreManager)?.firstName + " (Current)"
                    : "Select Manager"}
                </option>
                {parsedStaffs
                  .filter((staff) => staff._id !== Store.StoreManager)
                  .map((staff, index) => (
                    <option key={index} value={staff._id}>
                      {staff.firstName} {staff.lastName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Store Keeper */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Store Keeper
              </label>
              <select
                name="StoreKeeper"
                value={formData.StoreKeeper}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-gray-700 bg-white"
              >
                {/* find and display current StoreKeeper FirstName  */}
                {Store.StoreKeeper && (
                  <option value={Store.StoreKeeper}>
                    {Store.StoreKeeper
                      ? parsedStaffs.find(staff => staff._id === Store.StoreKeeper)?.firstName + " (Current)"
                      : "Select StoreKeeper"}
                  </option>
                )}
                {parsedStaffs
                  .filter((staff) => staff._id !== Store.StoreKeeper)
                  .map((staff, index) => (
                    <option key={index} value={staff._id}>
                      {staff.firstName} {staff.lastName}
                    </option>
                  ))}
              </select>
            </div>

            {/* Submit Button */}
            <div className="col-span-2">
              <button
                type="submit"
                className=" bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
