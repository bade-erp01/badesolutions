"use client";

import { termsAndConditions } from "../../../../Functions/Functions";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";
import Link from "next/link"
import TermsAndConditionsLink from "@/app/Components/TermsAndCondition";

export default function SignUpPage() {
  const params = useSearchParams();
  const plan = params.get("plan");

  const [formData, setFormData] = useState({
    CompayName: "",
    email: "",
    Tel: "",
    plan: plan,
    NumberOfUsers: "",
    totalAmount: 0,
  });

  useEffect(() => {
    const numberOfUsers = parseInt(formData.NumberOfUsers) || 0;
    const baseAmount = formData.plan === "Basic" ? 1500 : 4000;
    const vat = baseAmount * numberOfUsers * 0.075;
    const total = (baseAmount * numberOfUsers + vat) * 12;
    setFormData((prev) => ({ ...prev, totalAmount: total }));
  }, [formData.plan, formData.NumberOfUsers]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await termsAndConditions(formData);
  };

  return (
    <>
      <Nav1 />
      <div className="min-h-screen flex items-center justify-center mb-4 ">
        <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white/60 backdrop-blur-md rounded-xl shadow-2xl p-4">
          {/* Left Section: Illustration */}
          <div className="flex justify-center">
            <Image
              src="/Julian_Burford-removebg-preview.png"
              alt="Illustration"
              width={400}
              height={400}
              priority={true}
              quality={100}
              loading="eager"
              className="drop-shadow-xl transition-transform duration-500 hover:scale-105"
            />
          </div>

          {/* Right Section: Sign-Up Form */}
          <div className="w-full">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-2">
              Sign up~{formData.plan} License
            </h1>
            <p className="text-gray-600 mb-6 font-semibold">
              Business Automated Dynamic Enterprise [B.A.D.E]
            </p>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs ">
              <input
                type="text"
                name="CompayName"
                placeholder="Business Name"
                value={formData.CompayName}
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="email"
                name="email"
                placeholder="Business Email"
                value={formData.email}
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="tel"
                name="Tel"
                placeholder="+234 123 456 7890"
                value={formData.Tel}
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />

              <div>
                <label className="block text-md font-bold text-gray-700 mb-1">
                  Number of Users
                </label>
                <input
                  type="number"
                  name="NumberOfUsers"
                  placeholder="e.g. 5"
                  value={formData.NumberOfUsers}
                  required
                  min={1}
                  onChange={handleChange}
                  className="w-full px-4 py-3 text-center text-lg bg-gray-100 font-bold rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {formData.NumberOfUsers > 0 && (
                <div className="text-lg font-semibold text-gray-800 mt-2">
                  <p className="text-gray-700">
                    Gross Due (incl. 7.5% VAT): ₦
                    {formData.totalAmount.toLocaleString()} /Yearly
                  </p>
                </div>
              )}
              
                <TermsAndConditionsLink BusinessPlan={formData.plan}/>

              {formData.NumberOfUsers > 0 && (
                <>
                  <button
                    type="submit"
                    className="w-full bg-fuchsia-500 text-white py-3 rounded-lg hover:bg-fuchsia-600 transition duration-300 font-semibold"
                  >
                    Proceed to Pay ₦{formData.totalAmount.toLocaleString()}
                  </button>
                  <div className="text-center ">
                    <p className="text-gray-500 font-semibold text-sm">Pay securely with</p>
                    <Image
                      height={60}
                      width={120}
                      src="/assets/paystack-logo-png_seeklogo-409509-removebg-preview.png"
                      alt="Paystack Logo"
                      className="mx-auto"
                    />
                  </div>
                </>
              )}

              <p className="text-center mt-1 text-gray-600 text-sm">
                Already have an account?{" "}
                <Link href="/Login" className="text-blue-600 underline">
                  Login here
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
      <Footer1 />
    </>
  );
}
