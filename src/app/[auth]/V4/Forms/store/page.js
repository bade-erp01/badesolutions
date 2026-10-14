"use client"

import React from 'react'
const NaijaStates = require("naija-state-local-government");
import {PhotoIcon,UserCircleIcon,ChevronDownIcon,} from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { ErrorMessage,SuccessToast,plsWait } from "../../../../../../Functions/Mics";
import {Encrypt,EXPRESS_PRIVATE_URL} from '../../../../../../Functions/Functions'
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

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
            access:`${Encrypt(user._id)}`,
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`
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
        <div className="p-4 rounded border">
        <form className="space-y-5 mx-auto text-xs" onSubmit={handleSubmit}>
          <div className=" pb-2 ">
            <h2 className="text-base/7 font-semibold ">
              NEW STORE
            </h2>
            
          </div>

          <div className="">
            <h2 className="text-base/7 font-semibold ">
              Store Information
            </h2>
            <p className="mt-1 text-sm/6 ">
              Ensure to provide correct Information.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="WHName"
                  className="block text-sm/6 font-medium "
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
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="Tel"
                  className="block text-sm/6 font-medium "
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
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Email"
                  className="block text-sm/6 font-medium "
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
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              
              <div className="sm:col-span-2">
                <label
                  htmlFor="Region"
                  className="block text-sm/6 font-medium "
                >
                 State
                </label>
                <div className="mt-2 grid grid-cols-1">
                  <select
                    id="Region"
                    name="Region"
                     onChange={handleChange}
                    autoComplete="Region"
                    className="col-start-1 w-full row-start-1 appearance-none rounded-md  py-1.5 pr-8 pl-3 text-base  outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
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
                    className="pointer-events-none col-start-1 row-start-1 mr-2 size-5 self-center justify-self-end text-gray-500 sm:size-4"
                  />
                </div>
              </div>
             
              <div className="col-span-full">
                <label
                  htmlFor="Address"
                  className="block text-sm/6 font-medium "
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
                    className="block w-full rounded-md  px-3 py-1.5 text-base  outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
             
            </div>
          </div>

              <div className="mt-6 flex items-center justify-end gap-x-6">
              <Button type="submit" variant='default'>
                  Create new Store
              </Button>
              </div>
        </form>
      </div>
    </>
  )
}
