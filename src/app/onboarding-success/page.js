"use client";

import React,{useEffect} from "react";
import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function OnboardingSuccess() {
  const router = useRouter();
  const handleGetStarted = () => {
    router.push("/");
  };
  useEffect(() => {
  // Confetti burst
  confetti({
    particleCount: 550,
    spread: 70,
    origin: { y: 0.6 },
  });

  },[])

  return (
    <>
      <Nav1 />
      <div className="flex flex-col items-center justify-center min-h-screen p-4 animate__animated animate__zoomInDown">
        <div
          className="bg-white rounded-lg shadow-xl p-8 max-w-md text-center"
          style={{
            backgroundImage: 'url("/thanks.jpg")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "grayscale(40%)",
            zIndex: -2,
          }}
        >
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-red-800 mb-3">
            Welcome Aboard!
          </h1>
          <p className="mb-6 text-gray-800 font-semibold text-pretty text-center bg-black/7 backdrop-blur-xs rounded-xl p-2">
            Congratulations on successfully completing your onboarding. Your
            business is almost ready to thrive with us. We sent you an
            activation email.If you have any questions, feel free to reach out
            to our support team. Let's get started on this exciting journey
            together!.
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
