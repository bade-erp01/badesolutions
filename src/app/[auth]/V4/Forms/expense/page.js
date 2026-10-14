"use client";
import React from "react";
import axios from "axios";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
  Encrypt,
} from "../../../../../../Functions/Mics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

export default function Page({
  StoreList,
  businessData,
  userData,
  ExpenseCatList,
  baseUrl,
}) {
  const [serverMsg, setServerMsg] = useState(null);
  const [serverError, setServerError] = useState(null);
  const [formData, setFormData] = useState({
    initiatorId: `${userData.firstName} ${userData.lastName}`,
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useParams();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setServerMsg(null);
    setServerError(null);
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: undefined });
    setServerMsg(null);
    setServerError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      plsWait("Submitting Expense data...");
      setLoading(true);
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(businessData.tenantId)}`,
          access: `${Encrypt(userData._id)}`,
          sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
        },
      };

      const response = await axios.post(
        `${baseUrl}/api/Expense`,
        formData,
        config,
      );

      SuccessToast(response.data?.message || "Expense created successfully!");
      setFormData({});

      router.push(
        `/${params.auth}/V4/expense/expense/${response.data.expense}`,
      );
    } catch (error) {
      ErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create expense. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full border p-3 sm:p-4">
      <form className="space-y-10" onSubmit={handleSubmit} autoComplete="off">
        {/* Header */}
        <div className="border-b pb-4">
          <h2 className="text-xl sm:text-2xl font-bold  tracking-tight">New Expense</h2>
          <p className="text-sm  mt-1">
            Fill in the details below to record a new expense.
          </p>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* Beneficiary */}
          <div>
            <label
              htmlFor="payee"
              className="block text-sm font-semibold  mb-2"
            >
              Beneficiary <span className="text-red-500">*</span>
            </label>
            <Input
              id="payee"
              name="payee"
              type="text"
              required
              onChange={handleChange}
              value={formData.payee || ""}
              placeholder="Beneficiary Name"
              className={`${errors.payee ? "border-red-400" : ""} `}
            />
            {errors.payee && (
              <p className="text-red-500 text-xs mt-1">{errors.payee}</p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label
              htmlFor="payeebankAccount"
              className="block text-sm font-semibold  mb-2"
            >
              Beneficiary Account Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="payeebankAccount"
              name="payeebankAccount"
              type="text"
              required
              onChange={handleChange}
              value={formData.payeebankAccount || ""}
              placeholder="e.g. 0123456789"
              className={`${errors.payeebankAccount ? "border-red-400" : ""}`}
            />
            {errors.payeebankAccount && (
              <p className="text-red-500 text-xs mt-1">
                {errors.payeebankAccount}
              </p>
            )}
          </div>

          {/* Bank Name */}
          <div>
            <label
              htmlFor="payeeBankName"
              className="block text-sm font-semibold  mb-2"
            >
              Beneficiary Bank <span className="text-red-500">*</span>
            </label>
            <Input
              id="payeeBankName"
              name="payeeBankName"
              type="text"
              onChange={handleChange}
              value={formData.payeeBankName || ""}
              placeholder="GT Bank..."
              className={`${errors.payeeBankName ? "border-red-400" : ""}`}
            />
            {errors.payeeBankName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.payeeBankName}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label htmlFor="Date" className="block text-sm font-semibold  mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <Input
              id="Date"
              name="Date"
              type="date"
              onChange={handleChange}
              value={formData.Date || ""}
              className={`${errors.Date ? "border-red-400" : ""}`}
            />
            {errors.Date && (
              <p className="text-red-500 text-xs mt-1">{errors.Date}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <label
              htmlFor="Amount"
              className="block text-sm font-semibold  mb-2"
            >
              Amount <span className="text-red-500">*</span>
            </label>
            <Input
              id="Amount"
              name="Amount"
              type="number"
              onChange={handleChange}
              value={formData.Amount || 0}
              required
              placeholder="0"
              className={`${errors.Amount ? "border-red-400" : ""}`}
            />
            {errors.Amount && (
              <p className="text-red-500 text-xs mt-1">{errors.Amount}</p>
            )}
          </div>

          {/* Store */}

          <div className="w-full">
            <label htmlFor="WHID" className="block text-sm font-semibold mb-2">
              Store <span className="text-red-500">*</span>
            </label>

            <Select
              value={formData.WHID || ""}
              onValueChange={(value) => handleSelectChange("WHID", value)}
            >
              <SelectTrigger className="w-full shadow-sm">
                <SelectValue placeholder="Choose a store..." />
              </SelectTrigger>
              <SelectContent>
                {StoreList?.map((store) => (
                  <SelectItem key={store._id} value={store._id}>
                    {store.WHName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {errors.WHID && (
              <p className="text-xs text-red-500 mt-1">{errors.WHID}</p>
            )}
          </div>

          {/* Expense Tags */}
          <div className="w-full">
            <label
              htmlFor="category"
              className="block text-sm font-semibold mb-2"
            >
              Expense Tags
            </label>

            <Select
              value={formData.category || ""}
              onValueChange={(value) => handleSelectChange("category", value)}
            >
              <SelectTrigger className="w-full shadow-sm">
                <SelectValue placeholder="Select a tag..." />
              </SelectTrigger>
              <SelectContent>
                {ExpenseCatList.sort((a, b) => a.NAME.localeCompare(b.NAME))
                  .filter((cate) => cate.status)
                  .map((cat) => (
                    <SelectItem key={cat._id} value={cat._id}>
                      {cat.NAME}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {errors.category && (
              <p className="text-xs text-red-500 mt-1">{errors.category}</p>
            )}
          </div>

          {/* Remarks */}
          <div className="md:col-span-2">
            <label
              htmlFor="remarks"
              className="block text-sm font-semibold  mb-2"
            >
              Remarks
            </label>
            <textarea
              id="remarks"
              name="remarks"
              rows={3}
              onChange={handleChange}
              value={formData.remarks || ""}
              placeholder="Write a remark or note to approval office..."
              className="w-full rounded-md px-3 py-2 text-base sm:text-sm shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
            {errors.remarks && (
              <p className="text-xs text-red-500 mt-1">{errors.remarks}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-10">
          {userData.expenseUser && (
            <Button type="submit" disabled={loading} className="w-full sm:w-auto">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Submitting..." : "Submit Expense for Approval"}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
