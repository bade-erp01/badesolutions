"use client";
import axios from "axios";
import { useState } from "react";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/solid";
import { plsWait, ErrorMessage, SuccessToast, Encrypt } from "../../../../../../../Functions/Mics";
import { Dencrypt,EXPRESS_PRIVATE_URL } from "../../../../../../../Functions/Functions";
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
  <div className="w-full min-h-screen">
    <div className=" mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="bg-gray-700 px-8 py-6 border-b border-gray-700 ">
          <h2 className="text-2xl font-bold text-white">New Customer</h2>
          <p className="text-white mt-1 text-sm">Please provide accurate customer information to ensure smooth onboarding.</p>
        </div>

        <form className="p-8 space-y-6 text-black" onSubmit={handleSubmit} autoComplete="off">
          {serverMsg && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-green-800">
              <CheckCircleIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <span className="text-sm font-medium">{serverMsg}</span>
            </div>
          )}
          {serverError && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800">
              <ExclamationCircleIcon className="h-5 w-5 text-red-600 flex-shrink-0" />
              <span className="text-sm font-medium">{serverError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label htmlFor="Name" className="block text-sm font-semibold text-gray-700 mb-2">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                id="Name"
                name="Username"
                type="text"
                required
                onChange={handleChange}
                value={formData.Username || ""}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  errors.Username ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                }`}
                placeholder="Customer Name"
              />
              {errors.Username && <p className="text-red-500 text-xs mt-1">{errors.Username}</p>}
            </div>

            {/* Telephone */}
            <div>
              <label htmlFor="Telephone" className="block text-sm font-semibold text-gray-700 mb-2">
                Telephone <span className="text-red-500">*</span>
              </label>
              <input
                id="Telephone"
                name="phone"
                type="tel"
                required
                onChange={handleChange}
                value={formData.phone || ""}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  errors.phone ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                }`}
                placeholder="+234 080*****"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="Email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="Email"
                name="Email"
                type="email"
                onChange={handleChange}
                value={formData.Email || ""}
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  errors.Email ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                }`}
                placeholder="customer@email.com"
              />
              {errors.Email && <p className="text-red-500 text-xs mt-1">{errors.Email}</p>}
            </div>

            {/* Start Balance */}
            <div>
              <label htmlFor="Debt" className="block text-sm font-semibold text-gray-700 mb-2">Start Balance <i><small className="text-red-600">[Nagative values signifies that your business owes the customer.]</small></i></label>
              <input
                id="Debt"
                name="Debt"
                type="number"
                onChange={handleChange}
                value={formData.Debt || 0}
                required
                className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition ${
                  errors.Debt ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
                }`}
                placeholder="0"
              />
              {errors.Debt && <p className="text-red-500 text-xs mt-1">{errors.Debt}</p>}
            </div>

            {/* Sales Person */}
            <div>
              <label htmlFor="salesPerson" className="block text-sm font-semibold text-gray-700 mb-2">
                Sales Person <span className="text-red-500">*</span>
              </label>
              <select
                id="salesPerson"
                name="salesPerson"
                required
                onChange={handleChange}
                value={formData.salesPerson || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
              <label htmlFor="Manager" className="block text-sm font-semibold text-gray-700 mb-2">Account Manager</label>
              <select
                id="Manager"
                name="Manager"
                onChange={handleChange}
                value={formData.Manager || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
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
              <label htmlFor="billingAddress" className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
              <textarea
                id="billingAddress"
                name="billingAddress"
                rows="3"
                onChange={handleChange}
                value={formData.billingAddress || ""}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                placeholder="Customer delivery address"
              ></textarea>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            {user.createCustomer && (
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg transition ${
                  loading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md hover:shadow-lg"
                } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
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
    </div>
  </div>
  );
}
