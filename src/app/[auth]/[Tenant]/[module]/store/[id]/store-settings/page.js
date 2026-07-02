"use client";

import { Dencrypt,Encrypt } from "../../../../../../../../Functions/Functions";
import { useSearchParams,useRouter } from "next/navigation";
import { useState, useEffect, useMemo } from "react";
import { plsWait, ErrorMessage, SuccessToast, } from "../../../../../../../../Functions/Mics";

export default function Page({ staffs, store ,currentStoreKeeper,EXPRESS_PRIVATE_URL,userId, SessionId}) {
  // const searchParams = useSearchParams();
  const Router = useRouter();
  // const storeParam = searchParams.get("store");

  const parsedStaffs = useMemo(() => {
    try {
      return JSON.parse(staffs);
    } catch {
      return [];
    }
  }, [staffs]);

  const [formData, setFormData] = useState({
    WHName: store.WHName || "",
    Email: store.Email || "",
    Address: store.Address || "",
    Status: store.Status || false,
    limit: store.limit?.$numberDecimal || "0",
    StoreManager: store.StoreManager || "",
    StoreKeeper: store.StoreKeeper || "",
  });

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
    fetch(`${EXPRESS_PRIVATE_URL}/api/warehouse/edit/${Encrypt(store._id)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(store.tenantId)}`,
        access: userId,
        sessionKey: `Bearer ${Encrypt(SessionId)}`
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.error);
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


  return (
    <div>
      
        <div className=" bg-white m-6 animate__animated animate__fadeIn text-xs p-6 shadow-sm ">
          <h4 className="text-sm font-bold text-gray-800">
              {store.WHName.toUpperCase()} Settings
          </h4>
          <hr className="my-4 border-gray-300" />
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
                {/* <option value={Store.StoreManager}>
                  {formData.StoreManager
                    ? parsedStaffs.find(staff => staff._id === Store.StoreManager)?.firstName + " (Current)"
                    : "Select Manager"}
                </option> */}
                {parsedStaffs
                  .filter((staff) => staff._id !== store.StoreManager)
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
                {formData.StoreKeeper && (
                  <option value={store.StoreKeeper}>
                    {store.StoreKeeper
                      ? `${currentStoreKeeper?.firstName} ${currentStoreKeeper?.lastName} (Current)`
                      : "Select StoreKeeper"}
                  </option>
                )}
                {parsedStaffs
                  .filter((staff) => staff._id !== store.StoreKeeper)
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
    </div>
  );
}
