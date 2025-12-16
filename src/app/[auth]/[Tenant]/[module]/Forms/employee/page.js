"use client";
import BackButton from "@/app/Components/BackBotton";
const NaijaStates = require("naija-state-local-government");
import {
  PhotoIcon,
  UserCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {React,useState,useEffect} from "react";
import { Encrypt, ErrorMessage,SuccessToast,plsWait,} from "../../../../../../../Functions/Mics";
import {EXPRESS_PRIVATE_URL} from "../../../../../../../Functions/Functions"
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function NewEmployeeForm({userData}) {
  const states = NaijaStates.states();
  const [Formtext,setFormText] = useState('')
  const [formData, setFormData] = useState({});
  const router = useRouter();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    plsWait('Please wait... Do not refresh this page')
    try {
      const response = await fetch(`/api/UsersApi`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userData.business.tenantId}`,
      },
      body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      if (!response.ok) {
      throw new Error(result.error);
      }else{
        SuccessToast(result.message)
        setFormData({});
        router.refresh();
        setTimeout(() => {
          router.push(`/${userData.business.companyName}/${Encrypt(userData.business.tenantId)}/employee/employee/${result.user}?Modules=employee`);
        }, 2000);
      }
      setFormData({});
      e.target.reset();
    } catch (error) {
      ErrorMessage(error);
    }
  };

  const handlePurchaseLicenses = (formData) => {
    Swal.fire({
      title: "Purchase User Licenses",
      html: `
        <div class="text-left">
          <p class="text-gray-700 mb-4">How many licenses would you like to purchase?</p>
          <input 
            id="licenseInput" 
            type="number" 
            min="1" 
            step="1" 
            class="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
            placeholder="Enter number of licenses"
          />
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Calculate Price",
      confirmButtonColor: "#4f46e5",
      cancelButtonColor: "#6b7280",
      preConfirm: () => {
        const inputValue = document.getElementById("licenseInput").value;
        const numberOfUsers = parseInt(inputValue);
        if (isNaN(numberOfUsers) || numberOfUsers < 1) {
          Swal.showValidationMessage("Please enter a valid number (minimum 1)");
          return false;
        }
        const baseAmount = formData.plan === "Basic" ? 1500 : 4000;
        const vat = baseAmount * numberOfUsers * 0.075;
        const total = (baseAmount * numberOfUsers + vat) * 12;
        return { numberOfUsers, baseAmount, vat, total };
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { numberOfUsers, baseAmount, vat, total } = result.value;
        Swal.fire({
          icon: "info",
          title: "Payment Summary",
          html: `
            <div class="text-left bg-gray-50 p-6 rounded-lg">
              <div class="space-y-4">
                <div class="flex justify-between border-b pb-2">
                  <span class="text-gray-600">Number of Licenses:</span>
                  <span class="font-semibold text-gray-900">${numberOfUsers}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="text-gray-600">Base Amount (per license):</span>
                  <span class="font-semibold text-gray-900">₦${baseAmount.toLocaleString()}</span>
                </div>
                <div class="flex justify-between border-b pb-2">
                  <span class="text-gray-600">Subtotal:</span>
                  <span class="font-semibold text-gray-900">₦${(baseAmount * numberOfUsers).toLocaleString()}</span>
                </div>
                <div class="flex justify-between pb-4">
                  <span class="text-gray-600">VAT (7.5%):</span>
                  <span class="font-semibold text-orange-600">₦${vat.toLocaleString()}</span>
                </div>
                <div class="flex justify-between bg-indigo-50 p-3 rounded border border-indigo-200">
                  <span class="font-bold text-indigo-900">Total (12 months):</span>
                  <span class="font-bold text-indigo-600 text-lg">₦${total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "Proceed to Payment",
          confirmButtonColor: "#059669",
          cancelButtonColor: "#6b7280",
        }).then((paymentResult) => {
          if (paymentResult.isConfirmed) {
            plsWait("Processing payment...");
            fetch(`${EXPRESS_PRIVATE_URL}/purchase/License`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${Encrypt(userData.business._id)}`,
              },
              body: JSON.stringify({
                numberOfUsers,
                plan: formData.plan,
                totalAmount: total,
              }),
            })
              .then((response) => {
                if (!response.ok) throw new Error("Payment request failed");
                return response.json();
              })
              .then((data) => {
                router.push(data.data);
                SuccessToast("Redirecting to payment...");
              })
              .catch((error) => ErrorMessage(error.message));
          }
        });
      }
    });
  };

  useEffect(() => {
    const numberOfUsers = parseInt(1);
    const baseAmount = formData.plan === "Basic" ? 1500 : 4000;
    const vat = baseAmount * numberOfUsers * 0.075;
    const total = (baseAmount * numberOfUsers + vat) * 12;
    setFormText(total);
  }, [formData.plan]);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className=" mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gray-700 px-8 py-8">
            <h1 className="text-3xl font-bold text- mb-2">New User Profile</h1>
            <p className="text-indigo-100">Add a new employee to your organization</p>
          </div>

          <form className="space-y-8 p-8" onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <UserCircleIcon className="w-5 h-5 mr-3 text-indigo-600" />
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    id="firstName"
                    required
                    name="firstName"
                    type="text"
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    id="lastName"
                    required
                    name="lastName"
                    type="text"
                    onChange={handleChange}
                    placeholder="Doe"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="Email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    id="Email"
                    required
                    name="Email"
                    type="email"
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="DOB" className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth *
                  </label>
                  <input
                    id="DOB"
                    required
                    name="DOB"
                    type="date"
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="telephone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telephone *
                  </label>
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    required
                    onChange={handleChange}
                    placeholder="+234 XXX XXX XXXX"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="workTelephone" className="block text-sm font-medium text-gray-700 mb-2">
                    Work Line
                  </label>
                  <input
                    id="workTelephone"
                    name="workTelephone"
                    type="tel"
                    onChange={handleChange}
                    placeholder="+234 XXX XXX XXXX"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Location Information Section */}
            <div className="border-t pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Location Information</h2>
              
              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                <div className="sm:col-span-2">
                  <label htmlFor="Country" className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    id="Country"
                    name="Country"
                    type="text"
                    placeholder="Nigeria"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="stateOfOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                    State / Province
                  </label>
                  <input
                    id="stateOfOrigin"
                    name="stateOfOrigin"
                    type="text"
                    onChange={handleChange}
                    placeholder="Lagos"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="border-t pt-8 flex flex-col sm:flex-row gap-4 justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
              >
                Register New User
              </button>

              <button
                type="button"
                onClick={() => handlePurchaseLicenses(formData)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-3 rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
              >
                Purchase User Licenses
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
