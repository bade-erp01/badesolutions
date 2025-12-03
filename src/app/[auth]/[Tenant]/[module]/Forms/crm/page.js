"use client";
import axios from "axios";
import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
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
      plsWait('Submitung customer data...');
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(businessData.tenantId)}`,
          dbConnect: `Bearer ${businessData.rustyRoof}`,
          // "X-Requested-With": "XMLHttpRequest",
          access: `${Encrypt(userData._id)}`,
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
  <div className="w-full max-w-6xl p-8 bg-white shadow-2xl border border-gray-100">
    <form className="space-y-8" onSubmit={handleSubmit} autoComplete="off">
      <div>
        <h2 className="text-xl font-extrabold text-black tracking-tight"> New Customer</h2>
        <p className="text-gray-500 mt-2 text-sm">Please provide accurate customer information to ensure smooth onboarding.</p>
      </div>

      {serverMsg && (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 rounded-lg px-4 py-2 text-green-700">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
          <span>{serverMsg}</span>
        </div>
      )}
      {serverError && (
        <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-lg px-4 py-2 text-red-700">
          <ExclamationCircleIcon className="h-5 w-5 text-red-600" />
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name */}
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
            className={`mt-2 block w-full  border ${
              errors.Username ? "border-red-400" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50`}
            placeholder="Customer Name"
          />
          {errors.Username && <p className="text-red-500 text-xs mt-1">{errors.Username}</p>}
        </div>

        {/* Telephone */}
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
            className={`mt-2 block w-full  border ${
              errors.phone ? "border-red-400" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50`}
            placeholder="e.g. 08012345678"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Email */}
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
            className={`mt-2 block w-full  border ${
              errors.Email ? "border-red-400" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50`}
            placeholder="customer@email.com"
          />
          {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
        </div>

        {/* Start Balance */}
        <div>
          <label htmlFor="Debt" className="block text-sm font-medium text-gray-700">Start Balance</label>
          <input
            id="Debt"
            name="Debt"
            type="number"
            onChange={handleChange}
            value={formData.Debt || 0}
            required
            className={`mt-2 block w-full  border ${
              errors.Debt ? "border-red-400" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50`}
            placeholder="0"
          />
          {errors.Debt && <p className="text-red-500 text-xs mt-1">{errors.Debt}</p>}
        </div>

        {/* Sales Person */}
        <div>
          <label htmlFor="salesPerson" className="block text-sm font-medium text-gray-700">
            Sales Person <span className="text-red-500">*</span>
          </label>
          <select
            id="salesPerson"
            name="salesPerson"
            required
            onChange={handleChange}
            value={formData.salesPerson || ""}
            className="mt-2 block w-full  border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50"
          >
            <option value="">Choose...</option>
            {salespersons.map((person) => (
              <option key={person._id} value={person._id}>
                {person.firstName} {person.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Account Manager */}
        <div>
          <label htmlFor="Manager" className="block text-sm font-medium text-gray-700">Account Manager</label>
          <select
            id="Manager"
            name="Manager"
            onChange={handleChange}
            value={formData.Manager || ""}
            className="mt-2 block w-full  border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50"
          >
            <option value="">Select...</option>
            {salespersons.map((person) => (
              <option key={person._id} value={person._id}>
                {person.firstName} {person.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="billingAddress" className="block text-sm font-medium text-gray-700">Address</label>
          <textarea
            id="billingAddress"
            name="billingAddress"
            rows="3"
            onChange={handleChange}
            value={formData.billingAddress || ""}
            className="mt-2 block w-full  border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50"
            placeholder="Customer delivery address"
          ></textarea>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-10">
        {user.createCustomer && (
          <button
            type="submit"
            disabled={loading}
            className={`inline-flex items-center gap-2  px-6 py-3 text-sm font-semibold shadow-md transition ${
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
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
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

  );
}