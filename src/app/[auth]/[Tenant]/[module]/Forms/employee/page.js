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
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/UsersApi`, {
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
        // reset the form
        setFormData({});
        router.refresh();
        // redirect to employee list page
        setTimeout(() => {
          router.push(`/${userData.business.companyName}/${Encrypt(userData.business.tenantId)}/employee/employee/${result.user}?Modules=employee`);
        }, 2000);
      }
      //reset the form
      setFormData({});
      e.target.reset();
    } catch (error) {
      ErrorMessage(error);
    }
  };

  
  // Calculate the total amount based on the plan and number of users
  function handlePurchaseLicenses(formData) {
  Swal.fire({
    title: "Enter number of Licenses",
    input: "number",
    inputAttributes: {
      min: 1,
      step: 1,
      autocapitalize: "off"
    },
    showCancelButton: true,
    confirmButtonText: "Calculate",
    showLoaderOnConfirm: true,
    preConfirm: (inputValue) => {
      const numberOfUsers = parseInt(inputValue);
      if (isNaN(numberOfUsers) || numberOfUsers < 1) {
        Swal.showValidationMessage("Number of users must be at least 1");
        return false;
      }

      const baseAmount = formData.plan === "Basic" ? 1500 : 4000;
      const vat = baseAmount * numberOfUsers * 0.075;
      const total = (baseAmount * numberOfUsers + vat) * 12;

      return {
        numberOfUsers,
        baseAmount,
        vat,
        total
      };
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { numberOfUsers, baseAmount, vat, total } = result.value;

      Swal.fire({
        icon: "info",
        title: "Total Payment",
        html: `
          <p><strong>Licenses:</strong> ${numberOfUsers}</p>
          <p><strong>Base Amount:</strong> ₦${baseAmount.toLocaleString()}</p>
          <p><strong>VAT (7.5%):</strong> ₦${vat.toLocaleString()}</p>
          <hr>
          <p><strong>Total for 12 months:</strong> ₦${total.toLocaleString()}</p>
        `,
        showCancelButton: true,
        confirmButtonText: "Proceed to Payment"
      }).then((paymentResult) => {
        if (paymentResult.isConfirmed) {
          plsWait('Processing...')
          fetch(`${EXPRESS_PRIVATE_URL}/purchase/License`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
               Authorization: `Bearer ${Encrypt(userData.business._id)}`,
            },
            body: JSON.stringify({
              numberOfUsers,
              plan: formData.plan,
              totalAmount: total
            })
          })
          .then(response => {
            if (!response.ok) {
              throw new Error("Payment request failed");
            }
            return response.json();
          })
          .then(data => {
            router.push(data.data)
            SuccessToast("Redirecting...!");
          })
          .catch(error => {
            ErrorMessage(error.message);
          });
        }
      });
    }
  });
}

 


  useEffect(() => {
    const numberOfUsers = parseInt(1);
    const baseAmount = formData.plan === "Basic" ? 1500 : 4000;
    const vat = baseAmount * numberOfUsers * 0.075;
    const total = (baseAmount * numberOfUsers + vat) * 12; // Assuming the total is for a year
    setFormText(total);
  }, [formData.plan]);



  return (
    <>
      <div className="m-5 p-4 rounded shadow-2xl border-lg border-2-black bg-white animate__animated animate__fadeInUpBig animate__delay-2">
        <form className="space-y-5 mx-auto" onSubmit={handleSubmit}>
            <h2 className="text-base/7 font-semibold text-gray-900">
              New User Profile
            </h2>
          <div className="border-b bg- border-gray-900/10 pb-12">

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="first-name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  First Name
                </label>
                <div className="mt-2">
                  <input
                    id="firstName"
                    required
                    name="firstName"
                    type="text"
                    onChange={handleChange}
                    autoComplete="given-name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="last-name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Last Name
                </label>
                <div className="mt-2">
                  <input
                    id="lastName"
                    required
                    name="lastName"
                    type="text"
                    onChange={handleChange}
                    autoComplete="family-name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="city"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Email
                </label>
                <div className="mt-2">
                  <input
                    id="Email"
                    required
                    name="Email"
                    type="email"
                    onChange={handleChange}
                    autoComplete="Email-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="region"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Date of Birth
                </label>
                <div className="mt-2">
                  <input
                    id="DOB"
                    required
                    name="DOB"
                    type="date"
                    onChange={handleChange}
                    autoComplete="address-level1"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="postal-code"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Telephone
                </label>
                <div className="mt-2">
                  <input
                    id="telephone"
                    name="telephone"
                    type="tel"
                    required
                    onChange={handleChange}
                    autoComplete="postal-code"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Country"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Country
                </label>
                <div className="mt-2">
                  <input
                    id="Country"
                    name="Country"
                    type="text"
                    autoComplete="address-level2"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="region"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  State / Province
                </label>
                <div className="mt-2">
                  <input
                    id="stateOfOrigin"
                    name="stateOfOrigin"
                    type="text"
                    onChange={handleChange}
                    className="col-start-1 w-full row-start-1 appearance-none rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="workTelephone"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Work Line
                </label>
                <div className="mt-2">
                  <input
                    id="workTelephone"
                    name="workTelephone"
                    type="tel"
                    onChange={handleChange}
                    autoComplete="workTelephone"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>
            </div>
          </div>

         <div className="mt-6 flex items-center justify-end gap-x-6">
           <button type="submit" className="bg-green-500 rounded-md px-3 py-2 mt-3 text-sm font-semibold text-white hover:bg-green-700 transition">Register New user</button>

         <span
          onClick={handlePurchaseLicenses}
          className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 mt-3 text-sm font-semibold rounded shadow-md cursor-pointer transition duration-200 ease-in-out inline-block"
        >
          Purchase User Licenses
        </span>

         </div>
        </form>
      </div>
    </>
  );
}
