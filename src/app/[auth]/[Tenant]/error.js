"use client";
import { useRouter } from "next/navigation";
import React from "react";

export default function Tenanterror({ error }) {
  const router = useRouter();

  const handleRefresh = () => {
    // router.refresh();
    router.back();
  };

  return (
    <div class="bg-white flex items-center justify-center min-h-screen">
      <div class="text-center">
        {/* <!-- Large 404 --> */}
        <h1  onClick={handleRefresh} class="inline-block border-r border-gray-300 mr-5 pr-6 text-2xl font-medium align-top">
          Try again?
        </h1>

        {/* <!-- Message --> */}
        <div class="inline-block text-left">
          <h2 class="text-sm font-normal text-gray-600 mb-2">
            Sorry, We couldn’t complete your request. Please refresh the page or contact support if it continues.!
          </h2>
        </div>
      </div>
    </div>
  );
}
