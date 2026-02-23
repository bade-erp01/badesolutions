"use client";

import React from "react";
import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";
import {useRouter} from "next/navigation";

export default function OnboardingSuccess() {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push("/");
  };
  return (
    <>
    <Nav1 />
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Welcome Aboard!
          </h1>
          <p className="text-gray-600 mb-6">
            Congratulations on successfully completing your onboarding. Your
            business is almost ready to thrive with us. We sent you an activation
            email.If you have any questions, feel free to
            reach out to our support team. Let's get started on this exciting
            journey together!
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
      <Footer1 />
    </>
  );
}
