"use client";
import { useState } from "react";
import Image from "next/image";
import { Encrypt, Dencrypt } from "../../../../../../../Functions/Functions";

export default function page({ DecryptedAsset, StoreList,userInfo }) {
  const [Stores] = useState(StoreList);
  const [formData,setFormData] = useState(DecryptedAsset || {});
  const [user] = useState(userInfo);


   const [headers] = useState({
      "Content-Type": "application/json",
      Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
      dbConnect: `Bearer ${userInfo.business.rustyRoof}`,
      access: `${Encrypt(userInfo.user._id)}`,
    });

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
        const { data } = await axios.post(
          `${baseUrl}/api/createAsset`,
          formData,
          { headers }
        );
  
        if (data && data.data) {
          SuccessToast("Asset List updated...");
          setFormData({})
          router.push(`/${Params.auth}/${Params.Tenant}/${Params.module}/vendor/${data.data}`);
        } else {
          throw new Error(data.error);
        }
      } catch (error) {
        ErrorMessage(error.message);
        router.refresh()
      }
    };

  return (
    <>
      <div className=" p-4 rounded shadow-2xl border-lg border-2-black bg-white animate__animated animate__fadeInUpBig animate__delay-2s">
        <form className="space-y-5 mx-auto" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl font-bold text-gray-800">
              {formData.Name}
            </h4>
            <span
              className={`px-5 py-1.5 rounded-full font-small font-semibold tracking-wide shadow-sm border bg-indigo-50 text-gray-700 border-indigo-200`}
            >
              {formData.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-8 items-center py-4">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="w-28 h-28 rounded overflow-hidden bg-linear-to-tr from-gray-200 to-gray-300 shadow-sm border-2 border-gray-300 flex items-center justify-center">
                <Image
                  height={40}
                  width={40}
                  src={
                    "https://img.icons8.com/stickers/100/decentralized-network.png"
                  }
                  alt="Avatar"
                  quality={100}
                  priority={true}
                  loading="eager"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="border-b bg- border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">
              {formData.AssetCode}
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Location of use {formData.Location.WHName}.
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
                    value={formData.Name}
                    placeholder={`Enter Asset Name`}
                    required
                    onChange={handleChange}
                    autoComplete="Name-name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Categories"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Location of use
                </label>
                <div className="mt-2">
                  <select
                    id="Location"
                    name="Location"
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    <option
                      value= {formData.Location._id}
                      disabled
                      selected
                      className="text-gray-400"
                    >
                      {formData.Location.WHName}
                    </option>
                    {Stores.map((store, index) => (
                      <option key={index} value={store._id}>
                        {store.WHName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/*Assigned staff  */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="Categories"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Assigned To
                </label>
                <div className="mt-2">
                  <select
                    id="Location"
                    name="Location"
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    <option
                      value= {formData.AssignedTo?.firstName}
                      disabled
                      selected
                      className="text-gray-400"
                    >
                       {formData.AssignedTo?.firstName}  {formData.AssignedTo?.lastName}
                    </option>
                    {Stores.map((store, index) => (
                      <option key={index} value={store._id}>
                        {store.WHName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Change status */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="Categories"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Status
                </label>
                <div className="mt-2">
                  <select
                    id="Location"
                    name="Location"
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    <option
                      value={formData.status}
                      disabled
                      selected
                      className="text-gray-400"
                    >
                      {formData.status}
                    </option>
                   <option
                      value="Running"
                      className="text-gray-400"
                    >
                      Running
                    </option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="SerialNumber"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Serial Number
                </label>
                <div className="mt-2">
                  <input
                    value={formData.SerialNumber}
                    id="SerialNumber"
                    name="SerialNumber"
                    required
                    type="text"
                    placeholder={`Enter a serial number for ${
                      formData.Name ? formData.Name : "Asset"
                    }`}
                    onChange={handleChange}
                    autoComplete="SerialNumber"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="PurchasedValue"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Purchase Value
                </label>
                <div className="mt-2">
                  <input
                    value={formData.PurchasedValue || 0}
                    id="PurchasedValue"
                    name="PurchasedValue"
                    required
                    placeholder={`Enter a Purchase value for ${
                      formData.Name ? formData.Name : "Asset"
                    }`}
                    type="number"
                    step={`any`}
                    min={0}
                    onChange={handleChange}
                    autoComplete="PurchasedValue"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="PurchsedDate"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Purchsed Date
                </label>
                <div className="mt-2">
                  <input
                    value={formData.PurchsedDate}
                    id="PurchsedDate"
                    name="PurchsedDate"
                    onChange={handleChange}
                    type="date"
                    autoComplete="PurchsedDate"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="CurrentValue"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Currently Valued at
                </label>
                <div className="mt-2">
                  <input
                    value={formData.CurrentValue}
                    id="CurrentValue"
                    name="CurrentValue"
                    type="number"
                    placeholder={`What is the current Value for ${
                      formData.Name ? formData.Name : "Asset"
                    }`}
                    step={`any`}
                    min={0}
                    onChange={handleChange}
                    autoComplete="CurrentValue"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Category"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Category
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Category}
                    id="Category"
                    name="Category"
                    onChange={handleChange}
                    placeholder={`Type a group category for ${
                      formData.Name ? formData.Name : "Asset"
                    }`}
                    type="text"
                    autoComplete="Category"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="usefulYear"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Years of usefulness
                </label>
                <div className="mt-2">
                  <input
                    value={formData.usefulYear}
                    id="usefulYear"
                    name="usefulYear"
                    onChange={handleChange}
                    placeholder={`How many years should ${
                      formData.Name ? formData.Name : "Asset"
                    } run for`}
                    type="number"
                    min={0}
                    autoComplete="usefulYear"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="vendor"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Supplier / Vendor
                </label>
                <div className="mt-2">
                  <input
                    value={formData.vendor}
                    id="vendor"
                    name="vendor"
                    placeholder={`Enter a name of vendor / supplier for ${
                      formData.Name ? formData.Name : "Asset"
                    }`}
                    onChange={handleChange}
                    type="text"
                    autoComplete="vendor"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
            </div>
          </div>

          {user.user.AssetManager && (
            <>
              <small className="text-black italic">
                A unique id will be generated for{" "}
                {formData.Name ? formData.Name : "Asset"}{" "}
              </small>{" "}
              <br />
              <button
                type="submit"
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-500 focus-visible:outline-indigo-600 transition"
              >
                Save Edit on {formData.Name ? formData.Name : "Asset"}
              </button>
            </>
          )}
        </form>
      </div>
    </>
  );
}
