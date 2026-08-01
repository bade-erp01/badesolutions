"use client";
import { useRouter, useParams } from "next/navigation";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../Functions/Mics";
import axios from "axios";
import { Encrypt, Dencrypt } from "../../../../../../Functions/Functions";
import { useState } from "react";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"


export default function Page({ userInfo, baseUrl, StoresList }) {
  const [user] = useState(userInfo);
  const [Stores] = useState(StoresList || []);
  const [formData, setFormData] = useState({});
  const router = useRouter();
  const Params = useParams();
  const [headers] = useState({
    "Content-Type": "application/json",
    Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
    access: `${Encrypt(userInfo.user._id)}`,
    sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
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
      plsWait("Onboarding new Asset please wait...");
      const { data } = await axios.post(
        `${baseUrl}/api/createAsset`,
        formData,
        { headers },
      );

      if (data && data.data) {
        SuccessToast("Asset List updated...");
        setFormData({});
        router.push(
          `/${Params.auth}/V4/asset/asset/${data.data}`,
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      ErrorMessage(error.message);
      router.refresh();
    }
  };

  return (
    <>
      <div className="animate__animated animate__fadeInUpBig animate__delay-2s">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl font-bold ">Asset / Equiptment Form.</h4>
            <span
              className={`px-5 py-1.5 rounded-full font-small font-semibold tracking-wide shadow-sm border bg-indigo-50 text-indigo-700 border-indigo-200`}
            >
              New
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
            <h2 className="text-base/7 font-semibold ">Asset Information</h2>
            <p className="mt-1 text-sm/6 ">
              Ensure to provide correct Information.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="Name" className="block text-sm/6 font-medium ">
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
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 placeholder: focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label htmlFor="Location" className="block text-sm font-medium">
                  Location of use
                </label>
                <div className="mt-2">
                  <Select onValueChange={handleChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Choose a Location" />
                    </SelectTrigger>
                    <SelectContent>
                      {Stores.map((store, index) => (
                        <SelectItem key={index} value={store._id}>
                          {store.WHName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="SerialNumber"
                  className="block text-sm/6 font-medium "
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
                    placeholder={`Enter a serial number for ${formData.Name ? formData.Name : "Asset"}`}
                    onChange={handleChange}
                    autoComplete="SerialNumber"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 placeholder: focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="PurchasedValue"
                  className="block text-sm/6 font-medium "
                >
                  Purchase Value
                </label>
                <div className="mt-2">
                  <input
                    value={formData.PurchasedValue || 0}
                    id="PurchasedValue"
                    name="PurchasedValue"
                    required
                    placeholder={`Enter a Purchase value for ${formData.Name ? formData.Name : "Asset"}`}
                    type="number"
                    step={`any`}
                    min={0}
                    onChange={handleChange}
                    autoComplete="PurchasedValue"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 placeholder: focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="PurchsedDate"
                  className="block text-sm/6 font-medium "
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
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 placeholder: focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="CurrentValue"
                  className="block text-sm/6 font-medium "
                >
                  Currently Valued at
                </label>
                <div className="mt-2">
                  <input
                    value={formData.CurrentValue}
                    id="CurrentValue"
                    name="CurrentValue"
                    type="number"
                    placeholder={`What is the current Value for ${formData.Name ? formData.Name : "Asset"}`}
                    step={`any`}
                    min={0}
                    onChange={handleChange}
                    autoComplete="CurrentValue"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 placeholder: focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Category"
                  className="block text-sm/6 font-medium "
                >
                  Category
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Category}
                    id="Category"
                    name="Category"
                    onChange={handleChange}
                    placeholder={`Type a group category for ${formData.Name ? formData.Name : "Asset"}`}
                    type="text"
                    autoComplete="Category"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 placeholder: focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="usefulYear"
                  className="block text-sm/6 font-medium "
                >
                  Years of usefulness
                </label>
                <div className="mt-2">
                  <input
                    value={formData.usefulYear}
                    id="usefulYear"
                    name="usefulYear"
                    onChange={handleChange}
                    placeholder={`How many years should ${formData.Name ? formData.Name : "Asset"} run for`}
                    type="number"
                    min={0}
                    autoComplete="usefulYear"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 placeholder: focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="vendor"
                  className="block text-sm/6 font-medium "
                >
                  Supplier / Vendor
                </label>
                <div className="mt-2">
                  <input
                    value={formData.vendor}
                    id="vendor"
                    name="vendor"
                    placeholder={`Enter a name of vendor / supplier for ${formData.Name ? formData.Name : "Asset"}`}
                    onChange={handleChange}
                    type="text"
                    autoComplete="vendor"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 placeholder: focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
            <Button type="submit" className="shadow-md">
              Create New {formData.Name ? formData.Name : "Asset"}
            </Button>
            </>
          )}
        </form>
      </div>
    </>
  );
}
