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
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* <!-- Large 404 --> */}
        <h1  onClick={handleRefresh} className="inline-block border-r border-gray-300 mr-5 pr-6 text-lg font-bold align-top cursor-pointer">
          Try again?
        </h1>

        {/* <!-- Message --> */}
        <div className="inline-block text-left">
          <h2 className="text-sm font-normalmb-2">
            Sorry, We couldn’t complete your request..!
          </h2>
        </div>
      </div>
    </div>
  );
}
