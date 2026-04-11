"use client";

import { termsAndConditions, Encrypt } from "../../../../Functions/Functions";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";
import Link from "next/link";
import TermsAndConditionsLink from "@/app/Components/TermsAndCondition";

export default function SignUpPage() {
  const params = useSearchParams();
  const plan = params.get("plan");

  // check plan and ensure the match Basic or Standard
  useEffect(() => {
    if (plan !== "Basic" && plan !== "Standard") {
      window.location.href = "/"; // Redirect to home if plan is invalid
    }
  }, [plan]);

  const [formData, setFormData] = useState({
    CompayName: "",
    email: "",
    Tel: "",
    plan: plan,
    NumberOfUsers: plan === "Basic" ? 4 : 6,
    renewalFee: plan === "Basic" ? 129000 : 309600,
    totalAmount: plan === "Basic" ? 129000 : 379600,
    referalCode: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await termsAndConditions(formData);
  };

  return (
    <div  style={{
            backgroundImage: 'url("/adrian-sulyok-c_4eaGRDSVU-unsplash.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(90%)",
            zIndex: -2,
          }}>
      <Nav1 />
      <div className="min-h-screen flex items-center justify-center mb-1 shadow-lg animate__animated animate__zoomInDown">

          <div className="w-120 bg-gray-300/80 p-4 shadow-lg rounded-sm border-lg animate__animated animate__fadeInUpBig animate__delay-2s">
            <h1 className="text-2xl font-extrabold text-gray-800 mb-2 text-black">
              Sign up~{formData.plan} License
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <input
                type="text"
                name="CompayName"
                placeholder="Business Name"
                value={formData.CompayName}
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 "
              />
              <input
                type="email"
                name="email"
                placeholder="Business Email"
                value={formData.email}
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 "
              />
              <input
                type="tel"
                name="Tel"
                placeholder="+234 123 456 7890"
                value={formData.Tel}
                required
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 "
              />

              <div>
                <label className="block text-md font-bold text-gray-700 mb-1 text-black">
                  Referal code
                </label>
                <input
                  type="text"
                  name="referalCode"
                  placeholder="Referal Code"
                  value={formData.referalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-3 bg-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 "
                />
              </div>

              {formData.NumberOfUsers > 0 && (
                <div className="text-md font-semibold text-black mt-2">
                  <p className="text-gray-700 text-black">
                    Total Due (incl. 7.5% VAT): ₦
                    {formData.totalAmount.toLocaleString()} (
                    {formData.NumberOfUsers} user access)
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <TermsAndConditionsLink BusinessPlan={formData.plan} />

                <div className="bg-gray-50 border border-gray-200 rounded-md p-2">
                  <span className="text-gray-700">
                    Subsequent renewal fee will be
                  </span>
                  <span className="ml-1 font-bold text-green-600 text-xl">
                    ₦{formData.renewalFee.toLocaleString()} /Yearly
                  </span>
                </div>
              </div>
              {formData.NumberOfUsers > 0 && (
                <>
                  <button
                    type="submit"
                    className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 transition duration-300 font-semibold hover:transition-transform duration-500 hover:scale-100 hover:shadow-md"
                  >
                    Proceed to Pay ₦{formData.totalAmount.toLocaleString()}
                  </button>
                  <div className="text-center ">
                    <p className="text-gray-500 font-semibold text-sm">
                      Pay securely with
                    </p>
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
            </form>
          </div>
        
      </div>
      <Footer1 />
    </div>
  );
}
