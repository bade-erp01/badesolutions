"use client";
import axios from "axios";
import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import BackButton from "@/app/Components/BackBotton";
import { plsWait, ErrorMessage, SuccessToast, Encrypt } from "../../../../../../../Functions/Mics";
import { Dencrypt,EXPRESS_PRIVATE_URL } from "../../../../../../../Functions/Functions";
// const NaijaStates = require("naija-state-local-government");
 import { useRouter,useParams } from 'next/navigation';

const sanitizeObject = (obj) => {
  if (obj && typeof obj === "object" && obj.toJSON) {
    return JSON.parse(JSON.stringify(obj));
  }
  return obj;
};

export default function NewCustomerForm({ userData, businessData, salesperson }) {
  const sanitizedUserData = sanitizeObject(userData);
  const sanitizedSalespersons = salesperson.map(sanitizeObject);
  const router =  useRouter();
  const params = useParams()
  const [user] = useState(sanitizedUserData.user);
  const [salespersons] = useState(sanitizedSalespersons);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverMsg, setServerMsg] = useState(null);
  const [serverError, setServerError] = useState(null);


  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setServerMsg(null);
    setServerError(null);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Username || formData.Username.length < 2) {
      newErrors.Username = "Name is required and must be at least 2 characters.";
    }
    if (!formData.phone || !/^\d{10,15}$/.test(formData.phone)) {
      newErrors.phone = "Telephone is required and must be valid.";
    }
    if (!formData.Email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.Email)) {
      newErrors.Email = "Email is required and must be valid.";
    }
    if (formData.Debt && isNaN(formData.Debt)) {
      newErrors.Debt = "Opening Balance must be a number.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      plsWait('')
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(businessData.tenantId)}`,
          "X-Requested-With": "XMLHttpRequest",
        },
      };

      const response = await axios.post(
        `${EXPRESS_PRIVATE_URL}/${businessData.companyName}/Sales/Register-customer`,
        formData,
        config
      );

      SuccessToast(response.data?.message || "Customer created successfully!");
      setFormData({});

      ///redirect to sigle customer page
      router.push(`/${params.auth}/${params.Tenant}/${`crm`}/${`crm`}/${response.data.newCustomer }?Modules=${`crm`}`)
      
    } catch (error) {
      ErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create customer. Please try again."
      );
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen ">
      <div className="w-full max-w-2xl bg-white shadow-2xl p-8 border border-gray-200">
        <BackButton />
        <form className="space-y-6" onSubmit={handleSubmit} autoComplete="off">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 tracking-tight">New Customer</h2>
            <p className="text-gray-500 mt-1">Please provide accurate customer information.</p>
          </div>

          {serverMsg && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded px-4 py-2 mb-2">
              <CheckCircleIcon className="h-5 w-5 text-green-500" />
              <span className="text-green-700">{serverMsg}</span>
            </div>
          )}
          {serverError && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-4 py-2 mb-2">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="Name" className="block text-sm font-medium text-gray-700">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="Name"
                name="Username"
                type="text"
                required
                onChange={handleChange}
                value={formData.Username || ""}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.Username ? "border-red-400" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-3 py-2 bg-gray-50`}
                placeholder="Customer Name"
              />
              {errors.Username && (
                <p className="text-red-500 text-xs mt-1">{errors.Username}</p>
              )}
            </div>

            <div>
              <label htmlFor="Telephone" className="block text-sm font-medium text-gray-700">
                Telephone <span className="text-red-500">*</span>
              </label>
              <input
                id="Telephone"
                name="phone"
                type="tel"
                required
                onChange={handleChange}
                value={formData.phone || ""}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.phone ? "border-red-400" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-3 py-2 bg-gray-50`}
                placeholder="e.g. 08012345678"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="Email" className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="Email"
                name="Email"
                type="email"
                onChange={handleChange}
                value={formData.Email || ""}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.Email ? "border-red-400" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-3 py-2 bg-gray-50`}
                placeholder="customer@email.com"
              />
              {errors.Email && (
                <p className="text-red-500 text-xs mt-1">{errors.Email}</p>
              )}
            </div>

            <div>
              <label htmlFor="Debt" className="block text-sm font-medium text-gray-700">
                Start Balance
              </label>
              <input
                id="Debt"
                name="Debt"
                type="number"
                onChange={handleChange}
                value={formData.Debt || ""}
                className={`mt-1 block w-full rounded-lg border ${
                  errors.Debt ? "border-red-400" : "border-gray-300"
                } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-3 py-2 bg-gray-50`}
                placeholder="0"
              />
              {errors.Debt && (
                <p className="text-red-500 text-xs mt-1">{errors.Debt}</p>
              )}
            </div>

            {/* <div>
              <label htmlFor="PriceList" className="block text-sm font-medium text-gray-700">
                Price List
              </label>
              <select
                id="PriceList"
                name="priceList"
                onChange={handleChange}
                value={formData.priceList || ""}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-3 py-2 bg-gray-50"
              >
                <option value="">Choose...</option>
               {Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={`Pricelist${num}`}>
                  {`PriceList ${num}`}
                </option>
              ))}
              </select>
            </div> */}

            <div>
              <label htmlFor="SalesPerson" className="block text-sm font-medium text-gray-700">
                Sales Person <span className="text-red-500">*</span>
              </label>
              <select
                id="SalesPerson"
                name="SalesPerson"
                required
                onChange={handleChange}
                value={formData.SalesPerson || ""}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-3 py-2 bg-gray-50"
              >
                <option value="">Choose...</option>
                {salespersons.map((person) => (
                  <option key={person._id} value={person._id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="AccountManager" className="block text-sm font-medium text-gray-700">
                Account Manager
              </label>
              <select
                id="AccountManager"
                name="AccountManager"
                onChange={handleChange}
                value={formData.AccountManager || ""}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-3 py-2 bg-gray-50"
              >
                <option value="">Select...</option>
                {salespersons.map((person) => (
                  <option key={person._id} value={person._id}>
                    {person.firstName} {person.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="DeliveryAddress" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <textarea
                id="DeliveryAddress"
                name="DeliveryAddress"
                rows="3"
                onChange={handleChange}
                value={formData.DeliveryAddress || ""}
                className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-3 py-2 bg-gray-50"
                placeholder="Customer delivery address"
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            {user.createCustomer && (
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 rounded-lg px-6 py-2 text-sm font-semibold shadow transition ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  "Create New Customer"
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}