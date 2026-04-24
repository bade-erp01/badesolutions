"use client";
import { UpdateEmployeeData ,EXPRESS_PRIVATE_URL} from "../../../Functions/Functions";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorMessage, plsWait, SuccessToast } from "../../../Functions/Mics";
import { Encrypt } from "../../../Functions/Functions";
import { Combobox } from "@headlessui/react";
import Swal from "sweetalert2";

export default function AccessControl({
  TenantData,
  userInfo,
  businessInfo,
  data,
}) {
  const [businessModules] = useState([...businessInfo.modules]);
  const [formData, setFormData] = useState({ ...data });
  const router = useRouter();


  const UpdateEmployeeModules = async (id, object) => {
    try {
      plsWait("Attempting remote access on user Work space");
      const body = JSON.stringify({
        id,
        object,
      });
      const response = await fetch("/api/EmployeeUpdate", {
        method: "PUT",
        body,
        headers: {
          dbConnect: `Bearer ${businessInfo.rustyRoof}`,
          access: `${Encrypt(formData._id)}`,
        },
        timeout: 10000, // ✅ 10s timeout for better error handling
      });
      const req = await response.json();

      if (req.message) {
        SuccessToast(req.message);
        router.refresh();
      } else {
        throw new Error(req.error);
      }
    } catch (error) {
      ErrorMessage(error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    UpdateEmployeeData(formData._id, e.target.name, e.target.checked,userInfo._id);
  };

  const handleChange2 = async (e) => {
    const { name, value, type, checked } = e.target;

    // Update form data state
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Find the selected module by name
    const selectedAppName = name;
    const selectedModule = businessModules.find(
      (mod) => mod.Name === selectedAppName,
    );

    // Call update function if module is found
    if (selectedModule) {
      UpdateEmployeeModules(formData._id, selectedModule);
    }
  };

  return (
    <form>
      <fieldset className="grid grid-cols-1 ">
        <legend className="text-sm/6 font-semibold text-gray-900 ">
          Assign Operational Access
        </legend>
        <div className="flex flex-wrap gap-2 p-4">
          <div className="flex gap-1" title={`${formData.firstName} will be able to onboard new customers`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.createCustomer || false} // Ensure `checked` is a boolean
                  onChange={handleChange}
                  id="createCustomer"
                  name="createCustomer"
                  type="checkbox"
                  aria-describedby="comments-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="createCustomer"
                className="font-medium text-gray-900"
              >
                Create Customer
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to register new products`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.createProduct || false}
                  onChange={handleChange}
                  id="createProduct"
                  name="createProduct"
                  type="checkbox"
                  aria-describedby="createProduct-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="createProduct"
                className="font-medium text-gray-900"
              >
                Create Product
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to update create new supplier`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.createVendor || false}
                  onChange={handleChange}
                  id="createVendor"
                  name="createVendor"
                  type="checkbox"
                  aria-describedby="createVendor-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="createVendor"
                className="font-medium text-gray-900"
              >
                Create Vendor
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to update customer information `}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.editCustomer || false}
                  onChange={handleChange}
                  id="editCustomer"
                  name="editCustomer"
                  type="checkbox"
                  aria-describedby="editCustomer-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="editCustomer"
                className="font-medium text-gray-900"
              >
                Update Customer
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to update general products information `}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.editProduct || false}
                  onChange={handleChange}
                  id="editProduct"
                  name="editProduct"
                  type="checkbox"
                  aria-describedby="comments-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="editProduct"
                className="font-medium text-gray-900"
              >
                Update Products
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData?.firstName} will be able to update purchase price of products`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.editPurchasePrice || false}
                  onChange={handleChange}
                  id="editPurchasePrice"
                  name="editPurchasePrice"
                  type="checkbox"
                  aria-describedby="editPurchasePrice"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="editPurchasePrice"
                className="font-medium text-gray-900"
              >
                Update Buying Price
              </label>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.isCFO || false}
                  onChange={handleChange}
                  id="isCFO"
                  name="isCFO"
                  type="checkbox"
                  aria-describedby="isCFO"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="isCFO"
                className="font-medium text-gray-900"
              >
                Chief Financial Officer
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to update Suppliers infomation`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.editVendor || false}
                  onChange={handleChange}
                  id="editVendor"
                  name="editVendor"
                  type="checkbox"
                  aria-describedby="comments-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label htmlFor="editVendor" className="font-medium text-gray-900">
                Update Vendor
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to generate Sales receipt from BADE`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.raiseInvoice || false}
                  onChange={handleChange}
                  id="raiseInvoice"
                  name="raiseInvoice"
                  type="checkbox"
                  aria-describedby="raiseInvoice-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="raiseInvoice"
                className="font-medium text-gray-900"
              >
                Raise Invoice
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to generate L.P.O`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.raiseLpo || false}
                  onChange={handleChange}
                  id="raiseLpo"
                  name="raiseLpo"
                  type="checkbox"
                  aria-describedby="raiseLpo-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label htmlFor="raiseLpo" className="font-medium text-gray-900">
                Raise Purchase Order
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to POST and APPROVE credit and debit note respectively`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.creditOfficer || false}
                  onChange={handleChange}
                  id="creditOfficer"
                  name="creditOfficer"
                  type="checkbox"
                  aria-describedby="comments-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="creditOfficer"
                className="font-medium text-gray-900"
              >
                Credit Officer
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to manage asset`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.AssetManager || false}
                  onChange={handleChange}
                  id="AssetManager"
                  name="AssetManager"
                  type="checkbox"
                  aria-describedby="comments-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="AssetManager"
                className="font-medium text-gray-900"
              >
                Asset Manager
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to Raise/Request expense`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.expenseUser || false}
                  onChange={handleChange}
                  id="expenseUser"
                  name="expenseUser"
                  type="checkbox"
                  aria-describedby="expenseUser-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="expenseUser"
                className="font-medium text-gray-900"
              >
                Create Expense
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to Approve expense`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.expenseApprover || false}
                  onChange={handleChange}
                  id="expenseApprover"
                  name="expenseApprover"
                  type="checkbox"
                  aria-describedby="expenseApprover-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="expenseApprover"
                className="font-medium text-gray-900"
              >
                Expense Approver
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to create and manage expense tags`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.expenseManager || false}
                  onChange={handleChange}
                  id="expenseManager"
                  name="expenseManager"
                  type="checkbox"
                  aria-describedby="expenseManager-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="expenseManager"
                className="font-medium text-gray-900"
              >
                Expense Manager
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be notified when a new Sales order is generated`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.notifySalesOrder || false}
                  onChange={handleChange}
                  id="notifySalesOrder"
                  name="notifySalesOrder"
                  type="checkbox"
                  aria-describedby="notifySalesOrder-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="notifySalesOrder"
                className="font-medium text-gray-900"
              >
                Notify Sales Order
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to register payment to vendors ledger.`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.postVendorPayment || false}
                  onChange={handleChange}
                  id="postVendorPayment"
                  name="postVendorPayment"
                  type="checkbox"
                  aria-describedby="postVendorPayment-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="postVendorPayment"
                className="font-medium text-gray-900"
              >
                Register Vendor Payment
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to post payent to customers ledger.`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.postPayment || false}
                  onChange={handleChange}
                  id="postPayment"
                  name="postPayment"
                  type="checkbox"
                  aria-describedby="comments-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="postPayment"
                className="font-medium text-gray-900"
              >
                Register Customer Payment
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be able to Assign credit limit to a customer's account`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.EditCreditLimit || false}
                  onChange={handleChange}
                  id="EditCreditLimit"
                  name="EditCreditLimit"
                  type="checkbox"
                  aria-describedby="EditCreditLimit"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="EditCreditLimit"
                className="font-medium text-gray-900"
              >
                Edit Credit Limit
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will be notified when purchase price of products are updated`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.notifyPriceChange || false}
                  onChange={handleChange}
                  id="notifyPriceChange"
                  name="notifyPriceChange"
                  type="checkbox"
                  aria-describedby="comments-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="notifyPriceChange"
                className="font-medium text-gray-900"
              >
                Notify Price Change
              </label>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.isHRM || false}
                  onChange={handleChange}
                  id="isHRM"
                  name="isHRM"
                  type="checkbox"
                  aria-describedby="isHRM-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label htmlFor="isHRM" className="font-medium text-gray-900">
                Human Resource Manager
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will verify inter-stores transfers and purchase from suppliers`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.allowInternalTransfers || false}
                  onChange={handleChange}
                  id="allowInternalTransfers"
                  name="allowInternalTransfers"
                  type="checkbox"
                  aria-describedby="allowInternalTransfers-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="allowInternalTransfers"
                className="font-medium text-gray-900"
              >
                Approve Transfers / Purchase
              </label>
            </div>
          </div>

          <div className="flex gap-1" title={`${formData.firstName} will be responsible for support related issue.`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.isHelpDeskOfficer || false}
                  onChange={handleChange}
                  id="isHelpDeskOfficer"
                  name="isHelpDeskOfficer"
                  type="checkbox"
                  aria-describedby="isHelpDeskOfficer-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label htmlFor="isHelpDeskOfficer" className="font-medium text-gray-900">
                Help-Desk Officer
              </label>
            </div>
          </div>

          <div className="flex gap-1" title={`${formData.firstName} will be able to perform full sales return`}>
            <div className="flex h-6 shrink-0 items-center ">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.cancelInvoice || false}
                  onChange={handleChange}
                  id="cancelInvoice"
                  name="cancelInvoice"
                  type="checkbox"
                  aria-describedby="cancelInvoice-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="cancelInvoice"
                className="font-medium text-gray-900"
              >
                Cancel Invoice
              </label>
            </div>
          </div>

          {/*  */}
          <div className="flex gap-1">
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.requestLeave || false}
                  onChange={handleChange}
                  id="requestLeave"
                  name="requestLeave"
                  type="checkbox"
                  aria-describedby="requestLeave-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="requestLeave"
                className="font-medium text-gray-900"
              >
                Request Leave
              </label>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.AppraisalUser || false}
                  onChange={handleChange}
                  id="AppraisalUser"
                  name="AppraisalUser"
                  type="checkbox"
                  aria-describedby="AppraisalUser-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="AppraisalUser"
                className="font-medium text-gray-900"
              >
                Appraisal User
              </label>
            </div>
          </div>
          <div className="flex gap-1">
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.approveLeave || false}
                  onChange={handleChange}
                  id="approveLeave"
                  name="approveLeave"
                  type="checkbox"
                  aria-describedby="candidates-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="approveLeave"
                className="font-medium text-gray-900"
              >
                Approve Leave
              </label>
            </div>
          </div>
          <div className="flex gap-1" title={`${formData.firstName} will act as a middleman to verify payments befor they impact customer ledger`}>
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.isAccountant || false}
                  onChange={handleChange}
                  id="isAccountant"
                  name="isAccountant"
                  type="checkbox"
                  aria-describedby="isAccountant-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="isAccountant"
                className="font-medium text-gray-900"
              >
                Accountant
              </label>
            </div>
          </div>

          <div className="flex gap-1">
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.approveLeave || false}
                  onChange={handleChange}
                  id="approveLeave"
                  name="approveLeave"
                  type="checkbox"
                  aria-describedby="approveLeave-description"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="approveLeave"
                className="font-medium text-gray-900"
              >
                Appraisal Manager
              </label>
            </div>
          </div>

          <div className="flex gap-1" title={`Grant ${formData.firstName} access to view sensitive business dashboards.`}>
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.c_levelDash || false}
                  onChange={handleChange}
                  id="c_levelDash"
                  name="c_levelDash"
                  type="checkbox"
                  aria-describedby="c_levelDash"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="c_levelDash"
                className="font-medium text-gray-900"
              >
                C-level Dashboard
              </label>
            </div>
          </div>
          
          <div className="flex gap-1" title={`Grant ${formData.firstName} access to view sensitive business Reports.`}>
            <div className="flex h-6 shrink-0 items-center">
              <div className="group grid size-4 grid-cols-1">
                <input
                  checked={formData.ReportUser}
                  onChange={handleChange}
                  id="ReportUser"
                  name="ReportUser"
                  type="checkbox"
                  aria-describedby="ReportUser"
                  className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                />
                <svg
                  fill="none"
                  viewBox="0 0 14 14"
                  className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                >
                  <path
                    d="M3 8L6 11L11 3.5"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-checked:opacity-100"
                  />
                  <path
                    d="M3 7H11"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="opacity-0 group-has-indeterminate:opacity-100"
                  />
                </svg>
              </div>
            </div>
            <div className="text-sm/6 pr-1">
              <label
                htmlFor="ReportUser"
                className="font-medium text-gray-900"
              >
                Report User
              </label>
            </div>
          </div>

        </div>
      </fieldset>
      {/* moduar acces */}
      <hr />
      <div className="mt-10 space-y-10 " title={`Assign view only access to ${formData.firstName} on Apps installed on business enviroment`}>
        <fieldset className="grid grid-cols-4">
          <legend className="text-sm/6 font-semibold text-gray-900 col-span-4">
            Push Modular Application Access
          </legend>
          <div className="mt-6 space-y-6 flex col-span-4 flex-wrap">
            {/*  show business installed modules */}
            {businessInfo?.modules && Array.isArray(businessInfo.modules) ? (
              businessInfo.modules.map((app, index) => {
                const isChecked = formData.Apps?.some(
                  (a) => a.Name === app.Name,
                );

                return (
                  <div key={index} className="flex gap-3">
                    <div className="flex h-6 shrink-0 items-center">
                      <div className="group grid size-4 grid-cols-1">
                        <input
                          id={`${app.Name}-${index}`}
                          checked={isChecked || false}
                          onChange={handleChange2}
                          name={app.Name}
                          type="checkbox"
                          title={`${app.Name}`}
                          className="col-start-1 row-start-1 appearance-none rounded-sm border border-gray-300 bg-white checked:border-indigo-600 checked:bg-indigo-600 indeterminate:border-indigo-600 indeterminate:bg-indigo-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:border-gray-300 disabled:bg-gray-100 disabled:checked:bg-gray-100 forced-colors:appearance-auto"
                        />
                        <svg
                          fill="none"
                          viewBox="0 0 14 14"
                          className="pointer-events-none col-start-1 row-start-1 size-3.5 self-center justify-self-center stroke-white group-has-disabled:stroke-gray-950/25"
                        >
                          <path
                            d="M3 8L6 11L11 3.5"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-checked:opacity-100"
                          />
                          <path
                            d="M3 7H11"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="opacity-0 group-has-indeterminate:opacity-100"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="text-sm/6 pr-1">
                      <label
                        htmlFor={`${app.Name}-${index}`}
                        className="font-medium text-gray-900"
                      >
                        {app?.Name || ""}
                      </label>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No business apps available.</p>
            )}
          </div>
        </fieldset>
      </div>
      <hr />

      {/* display all TenantData in a drop down */}
      {userInfo?.isDev && (
        <>
          <AssignTenantDropdown businessData={TenantData} businessInfo={businessInfo} userInfo={userInfo} data={data}/>

          {/* display all tenants assigned to the user account */}
          <div className="mt-10">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Assigned Tenants
            </h3>
            <div className="flex flex-wrap gap-2">
              {data?.toogledTenants?.filter((tenant) => tenant.tenantIds !== data.tenantId).map((tenant) => (
                <span
                  key={tenant._id}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
                >
                   {tenant.companyName || "Unknown Tenant"}
                  <button
                    onClick={() => handleRemoveTenant(tenant._id)}
                    className="ml-2 text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </form>
  );
}



export function AssignTenantDropdown({businessInfo, businessData,userInfo,data }) {
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [query, setQuery] = useState("");

  const filteredTenants =
    query === ""
      ? businessData
      : businessData.filter((tenant) =>
          tenant.companyName.toLowerCase().includes(query.toLowerCase()),
        );


// handleTenantAssign
const handleTenantAssign = async (tenantId) => {
  try {
    const result = await Swal.fire({
      title: "Assign Tenant?",
      text: "Are you sure you want to assign this tenant?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#30d6b2",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, assign it",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      plsWait('Assigning tenant...');
      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/assign-tenant/${Encrypt(data._id)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(businessInfo.tenantId)}`,
            access: `${Encrypt(userInfo._id)}`,
          },
          body: JSON.stringify({ tenantId: Encrypt(tenantId) }),
        }
      );

      if (response.ok) {
        SuccessToast(response.message || "Tenant assigned successfully.");
        setQuery("");
        setSelectedTenant(null);
        window.location.reload();
      } else {
        throw new Error("Failed to assign tenant.");
      }
    }
  } catch (error) {
    setQuery("");
    setSelectedTenant(null);
    ErrorMessage(error.message);
  }
};

  return (
    <div className="mt-10 space-y-10">
      <fieldset className="grid grid-cols-4 gap-4">
        <legend className="text-sm font-semibold text-gray-900 col-span-4">
          Assign Tenant
        </legend>

        <div className="col-span-4">
          <Combobox
            value={selectedTenant}
            onChange={(tenant) => {
              setSelectedTenant(tenant);
              handleTenantAssign(tenant._id);
            }}
          >
            <Combobox.Input
              className="w-full rounded-md border border-gray-300 py-2 px-3 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
              displayValue={(tenant) => tenant?.companyName || ""}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tenant..."
            />
            <Combobox.Options className="mt-2 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg">
              {filteredTenants.length === 0 && (
                <div className="px-4 py-2 text-gray-500">No tenants found</div>
              )}
              {filteredTenants.map((tenant,index) => (
                <Combobox.Option
                  key={tenant.tenantId}
                  value={tenant}
                  className={({ active }) =>
                    `cursor-pointer px-4 py-2 text-xs ${
                      active ? "bg-blue-600 text-white" : "text-gray-900"
                    }`
                  }
                >
                  {tenant.companyName || `Tenant ${index + 1}`}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
        </div>
      </fieldset>
    </div>
  );
}
