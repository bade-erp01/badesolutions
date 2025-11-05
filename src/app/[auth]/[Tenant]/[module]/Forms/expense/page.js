"use client"
import React from 'react'
import axios from "axios";
import { useState } from "react";
import { useRouter,useParams } from 'next/navigation';
import { plsWait, ErrorMessage, SuccessToast, Encrypt } from "../../../../../../../Functions/Mics";



export default function Page({StoreList,businessData,userData,ExpenseCatList}) {
    const [serverMsg, setServerMsg] = useState(null);
    const [serverError, setServerError] = useState(null);
    const [formData, setFormData] = useState({
        initiatorId:`${userData.firstName } ${userData.lastName }`,

    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);



    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setServerMsg(null);
    setServerError(null);
    console.log(formData)
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
              "X-Requested-With": "XMLHttpRequest",
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
        <h2 className="text-xl font-extrabold text-black tracking-tight"> New Expense</h2>
      </div>

      {serverMsg && (
        <div className="flex items-center gap-2 bg-green-100 border border-green-300 rounded-lg px-4 py-2 text-green-700">
          <span>{serverMsg}</span>
        </div>
      )}
      {serverError && (
        <div className="flex items-center gap-2 bg-red-100 border border-red-300 rounded-lg px-4 py-2 text-red-700">
          <span>{serverError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Name */}
        <div>
          <label htmlFor="payee" className="block text-sm font-medium text-gray-700">
           Beneficiary <span className="text-red-500">*</span>
          </label>
          <input
            id="payee"
            name="payee"
            type="text"
            required
            onChange={handleChange}
            value={formData.payee || ""}
            className={`mt-2 block w-full  border ${
              errors.Username ? "border-red-400" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50`}
            placeholder="Beneficiary Name"
          />
          {errors.payee && <p className="text-red-500 text-xs mt-1">{errors.payee}</p>}
        </div>

        {/* Telephone */}
        <div>
          <label htmlFor="payeebankAccount" className="block text-sm font-medium text-gray-700">
            Beneficiary Account Number <span className="text-red-500">*</span>
          </label>
          <input
            id="payeebankAccount"
            name="payeebankAccount"
            type="text"
            required
            onChange={handleChange}
            value={formData.payeebankAccount || ""}
            className={`mt-2 block w-full  border ${
              errors.phone ? "border-red-400" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50`}
            placeholder="e.g. 0123456789"
          />
          {errors.payeebankAccount && <p className="text-red-500 text-xs mt-1">{errors.payeebankAccount}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="payeeBankName" className="block text-sm font-medium text-gray-700">
            Beneficiary Bank <span className="text-red-500">*</span>
          </label>
          <input
            id="payeeBankName"
            name="payeeBankName"
            type="text"
            onChange={handleChange}
            value={formData.payeeBankName || ""}
            className={`mt-2 block w-full  border ${
              errors.Email ? "border-red-400" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50`}
            placeholder="Gt Bank..."
          />
          {errors.payeeBankName && <p className="text-red-500 text-xs mt-1">{errors.payeeBankName}</p>}
        </div>

        {/* Start Balance */}
        <div>
          <label htmlFor="Amount" className="block text-sm font-medium text-gray-700"> 
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            id="Amount"
            name="Amount"
            type="number"
            onChange={handleChange}
            value={formData.Amount || 0}
            required
            className={`mt-2 block w-full  border ${
              errors.Amount ? "border-red-400" : "border-gray-300"
            } shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50`}
            placeholder="0"
          />
          {errors.Amount && <p className="text-red-500 text-xs mt-1">{errors.Amount}</p>}
        </div>

        {/* Sales Person */}
        <div>
          <label htmlFor="WHID" className="block text-sm font-medium text-gray-700">
            Store <span className="text-red-500">*</span>
          </label>
          <select
            id="WHID"
            name="WHID"
            required
            onChange={handleChange}
            value={formData.WHID || ""}
            className="mt-2 block w-full  border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50"
          >
            <option value="">Choose...</option>
            {StoreList.map((store) => (
              <option key={store._id} value={store._id}>
                {store.WHName}
              </option>
            ))}
          </select>
        </div>

        {/* Account Manager */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Expense Category</label>
          <select
            id="category"
            name="category"
            onChange={handleChange}
            value={formData.category || ""}
            className="mt-2 block w-full  border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50"
          >
            <option value="">Select...</option>
            {ExpenseCatList.sort((a, b) => a.NAME.localeCompare(b.NAME)).filter((cate)=> cate.status).map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.NAME} 
              </option>
            ))}
          </select>
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">Remarks</label>
          <textarea
            id="remarks"
            name="remarks"
            rows="3"
            onChange={handleChange}
            value={formData.remarks || ""}
            className="mt-2 block w-full  border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-gray-800 px-4 py-2 bg-gray-50"
            placeholder="Write a remark or note to approval office..."
          ></textarea>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end mt-10">
        {userData.expenseUser && (
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
              "Submit Expense for Approval"
            )}
          </button>
        )}
      </div>
    </form>
  </div>

  );
}
