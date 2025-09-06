"use client"

import React from 'react'
const NaijaStates = require("naija-state-local-government");
import {PhotoIcon,UserCircleIcon,ChevronDownIcon,} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { ErrorMessage,SuccessToast,plsWait } from "../../../../../../../Functions/Mics";
import {Encrypt,EXPRESS_PRIVATE_URL} from '../../../../../../../Functions/Functions'
import {useRouter} from "next/navigation"

export default function StoreForm({business, user}) {
    const states = NaijaStates.states();
    const router = useRouter()
    const [formData, setFormData] = useState({
        WHName:'',
        Tel:'',
        Email:'',
        Address:'',
        Region:'',
        InvRefNo: Math.random().toString(36).slice(-4)
    })


   const handleSubmit = async (e) => {
      e.preventDefault();
      plsWait('Creating New Store...⌛');

      const encryptedTenantId = Encrypt(business?.tenantId);

      try {
        const response = await fetch(`${EXPRESS_PRIVATE_URL}/api/warehouse/create-new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${encryptedTenantId}`,
          },
          body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (data.success) {
          SuccessToast(data.success);
          setFormData({
            WHName: '',
            Tel: '',
            Email: '',
            Address: '',
            InvRefNo: Math.random().toString(36).slice(-4),
          });
          router.refresh()
        } else {
          throw new Error(data.error || 'Something went wrong');
        }
      } catch (err) {
        ErrorMessage('Network error or server issue');
        router.refresh()
      }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    

  return (
    <>
        <div className="m-5 p-4 rounded shadow-2xl border-lg border-2-black bg-white">
        <form className="space-y-5 mx-auto text-xs" onSubmit={handleSubmit}>
          <div className=" pb-2 bg-[#ffedd4] p-2 ">
            <h2 className="text-base/7 font-semibold text-gray-900">
              NEW STORE
            </h2>
            
          </div>

          <div className="border-b bg- border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">
              Store Information
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Ensure to provide correct Information.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="WHName"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Name
                </label>
                <div className="mt-2">
                  <input
                    id="WHName"
                    name="WHName"
                    type="text"
                    required
                    onChange={handleChange}
                    autoComplete="Name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="Tel"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                 Telephone 
                </label>
                <div className="mt-2">
                  <input
                    id="Tel"
                    name="Tel"
                    type="tel"
                    onChange={handleChange}
                    autoComplete="Tel"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="Email"
                    name="Email"
                    type="email"
                    onChange={handleChange}
                    autoComplete="Email"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              
              <div className="sm:col-span-2">
                <label
                  htmlFor="Region"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                 State
                </label>
                <div className="mt-2">
                  <select
                    id="Region"
                    name="Region"
                     onChange={handleChange}
                    autoComplete="Region"
                    className="col-start-1 w-full row-start-1 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  >
                    <option> Choose...</option>
                    {states.map((state, index) => (
                      <option value={state} key={index}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon
                    aria-hidden="true"
                    className="pointer-events-auto col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </div>
              </div>
             
              <div className="col-span-full">
                <label
                  htmlFor="Address"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Store Address
                </label>
                <div className="mt-2">
                  <input
                    onChange={handleChange}
                    required
                    id="Address"
                    name="Address"
                    type="text"
                    autoComplete="Address"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
             
            </div>
          </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
              <button type="submit"
               className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-green-500 focus-visible:outline-indigo-600 transition"
              >
                  Create new Store
                </button>
              </div>
        </form>
      </div>
    </>
  )
}
