"use client";
import { useState } from "react";
import Image from "next/image";
import { Encrypt, Dencrypt } from "../../../../../../../Functions/Functions";
import {plsWait,ErrorMessage,SuccessToast} from "../../../../../../../Functions/Mics";
import { useRouter } from "next/navigation";
import axios from "axios";


export default function Page({ DecryptedAsset, StoreList,userInfo,users,baseUrl }) {
  const [Stores] = useState(StoreList);
  const [formData,setFormData] = useState(DecryptedAsset || {});
  const [user] = useState(userInfo);
  const [usersList] = useState(users || [])
  const router = useRouter();
  
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
                  src={formData.image || "https://img.icons8.com/stickers/100/decentralized-network.png"}
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
                  htmlFor="Location"
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
                  htmlFor="AssignedTo"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Assigned To
                </label>
                <div className="mt-2">
                  <select
                    id="AssignedTo"
                    name="AssignedTo"
                    onChange={handleChange}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    <option
                      value= {formData.AssignedTo?._id}
                      disabled
                      selected
                      className="text-gray-400"
                    >
                       {formData.AssignedTo?.firstName}  {formData.AssignedTo?.lastName}
                    </option>
                    {usersList.map((user, index) => (
                      <option key={index} value={user._id}>
                        {user.firstName}  {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>


              {/* Change status */}
              <div className="sm:col-span-2">
                <label
                  htmlFor="status"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Status
                </label>
                <div className="mt-2">
                   {!DecryptedAsset.runDepreciation  ? (
                  <select
                    id="status"
                    name="status"
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
                    <option
                      value="Sold"
                      className="text-gray-400"
                    >
                      Sold
                    </option>
                    <option
                      value="Disposed"
                      className="text-gray-400"
                    >
                      Disposed
                    </option>
                  </select>
                   ):(
                    // show a dive that looks like an input but is disabled
                    <div
                    className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  >
                    {DecryptedAsset?.status}
                  </div>
                  )}
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
                  htmlFor="depreciationRate"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Depreciation Rate
                </label>
                <div className="mt-2">
                  {!DecryptedAsset.runDepreciation  ? (
                    <input
                    value={formData.depreciationRate.$numberDecimal || 0}
                    id="depreciationRate"
                    name="depreciationRate"
                    required
                    placeholder={`Enter a Purchase value for ${
                      formData.Name ? formData.Name : "Asset"
                    }`}
                    type="number"
                    step={`any`}
                    min={0}
                    onChange={handleChange}
                    autoComplete="depreciationRate"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                  ):(
                    // show a dive that looks like an input but is disabled
                    <div
                    className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  >
                    {DecryptedAsset?.depreciationRate?.$numberDecimal || 0}
                  </div>
                  )}
                  
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
                   {!DecryptedAsset.runDepreciation  ? (
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
                  ):(
                    // show a dive that looks like an input but is disabled
                    <div
                    className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  >
                    {DecryptedAsset?.CurrentValue || 0}
                  </div>
                  )}
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
                  Years of usefulness [This value should be calculated in months]
                  <br/>
                  multiply 2yrs * 12Months = {2*12}Months
                </label>
                <div className="mt-2">
                   {!DecryptedAsset.runDepreciation  ? (
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
                   ):(
                    // show a dive that looks like an input but is disabled
                    <div
                    className="block w-full rounded-md bg-gray-100 px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 sm:text-sm/6"
                  >
                    {DecryptedAsset?.usefulYear }
                  </div>
                  )}
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
              {/* check box to activate depreciation */}
              <div className="sm:col-span-2">
                <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition">
                  <input
                    type="checkbox"
                    name="runDepreciation"
                    checked={formData.runDepreciation || false}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    Activate Depreciation
                  </span>
                </label>
              </div>

              <div className="col-span-full">
              <label
                htmlFor="description"
                className="block text-sm/6 font-medium text-gray-900"
              >
                Write Something Simple and Consise about this Asset
              </label>
              <div className="">
                <textarea
                  id="description"
                  onChange={handleChange}
                  name="description"
                  className="w-full h-32 p-3 text-black border border-dashed border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter your text here..."
                >{formData.description}</textarea>
              </div>
              </div>


            </div>
          </div>

          {user.user.AssetManager && (
            <>
              <small className="text-black italic">
               Depreciation runs on the 28th of every month.
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
