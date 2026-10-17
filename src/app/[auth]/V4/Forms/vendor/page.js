"use client";
import { useRouter, useParams } from "next/navigation";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../Functions/Mics";
import api from "@/lib/api";
import {
  Dencrypt,
} from "../../../../../../Functions/Functions";
import { useState } from "react";
import Image from "next/image";

export default function SingleVendorpage({
  userInfo,
  baseUrl,
}) {
  const [user] = useState(userInfo);
  const [formData,setFormData] = useState({});
  const router = useRouter();
  const Params = useParams()


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
      plsWait("Onboarding new supplier please wait...");
      const r = await api.post("/api/Vendor/New", formData);
      if (!r.ok) throw new Error(r.error);
      const { data } = r;

      if (data && data.data) {
        SuccessToast("New supplier added to list ");
        setFormData({})
        router.push(`/${Params.auth}/V4/vendor/vendor/${data.data}`);
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
      <div className=" p-4 rounded border animate__animated animate__fadeInUpBig animate__delay-2s">
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl font-bold">
              Suppliers Form.
            </h4>
            <span
              className={`px-5 py-1.5 rounded-full font-small font-semibold tracking-wide shadow-sm border text-indigo-700 border-indigo-200`}
            >
              New
            </span>
          </div>
          <div className="flex flex-wrap gap-8 items-center py-4">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="w-28 h-28 rounded overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-sm border-2 border-gray-300 flex items-center justify-center">
                <Image
                  height={40}
                  width={40}
                  src={
                    "https://img.icons8.com/?size=100&id=6LvtpL48Lmmx&format=png"
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

          <div className="border pb-12">
            <h2 className="text-base/7 font-semibold ">
              Supplier Information
            </h2>
            <p className="mt-1 text-sm/6 ">
              Ensure to provide correct Information.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="Name"
                  className="block text-sm/6 font-medium "
                >
                  Name
                </label>
                <div className="mt-2">
                  <input
                    id="Name"
                    name="Name"
                    type="text"
                    value={formData.Name}
                    required
                    onChange={handleChange}
                    autoComplete="Name-name"
                    className="block w-full rounded-md px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Categories"
                  className="block text-sm/6 font-medium "
                >
                  Vendor category
                </label>
                <div className="mt-2">
                  <select
                    id="Categories"
                    name="Categories"
                    onChange={handleChange}
                    required
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    <option
                      value={formData.Categories}
                      className=""
                    >
                      {formData.Categories || "Choose a category"}
                    </option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Retail">Retail</option>
                    <option value="Distribution">Distribution</option>
                    <option value="Manufacturing">Manufacturing</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium "
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    value={formData.email}
                    id="email"
                    name="email"
                    type="email"
                    onChange={handleChange}
                    autoComplete="email"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="vendor_tel"
                  className="block text-sm/6 font-medium "
                >
                  Telephone
                </label>
                <div className="mt-2">
                  <input
                    value={formData.vendor_tel}
                    id="vendor_tel"
                    name="vendor_tel"
                    type="text"
                    onChange={handleChange}
                    autoComplete="vendor_tel"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Address"
                  className="block text-sm/6 font-medium "
                >
                  Address
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Address}
                    id="Address"
                    name="Address"
                    onChange={handleChange}
                    type="text"
                    autoComplete="Address"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Account_num"
                  className="block text-sm/6 font-medium "
                >
                  Account Number
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Account_num}
                    id="Account_num"
                    name="Account_num"
                    type="text"
                    onChange={handleChange}
                    autoComplete="Account_num"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Account_name"
                  className="block text-sm/6 font-medium "
                >
                  Account Title
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Account_name}
                    id="Account_name"
                    name="Account_name"
                    onChange={handleChange}
                    type="text"
                    autoComplete="Account_name"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Bank_name"
                  className="block text-sm/6 font-medium "
                >
                  Bank Name
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Bank_name}
                    id="Bank_name"
                    name="Bank_name"
                    onChange={handleChange}
                    type="text"
                    autoComplete="Bank_name"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Balance"
                  className="block text-sm/6 font-medium "
                >
                  Opening Balance [Nagative values indicates that the supplier owes your business]
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Bank_name}
                    id="Balance"
                    name="Balance"
                    onChange={handleChange}
                    type="number"
                    step={`any`}
                    autoComplete="Balance"
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="block_vendor"
                  className="block text-sm font-medium "
                >
                  Block this vendor?
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    checked={formData.block_vendor || false}
                    onChange={handleChange}
                    id="block_vendor"
                    name="block_vendor"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {user.user.createVendor && (
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-500 focus-visible:outline-indigo-600 transition"
            >
              Create New Vendor
            </button>
          )}
        </form>
      </div>
    </>
  );
}
