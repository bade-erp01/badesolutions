"use client";
import { useRouter } from "next/navigation";
import React from "react";
import Image from "next/image";

export default function Tenanterror({ error }) {
  const router = useRouter(); // ✅ Use Next.js router


  const handleRefresh = () => {
    router.refresh(); // ✅ Refreshes the page dynamically
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 via-white to-purple-200 p-4">
      <div className="bg-white/80 shadow-xl rounded-2xl p-8 flex flex-col items-center gap-6 max-w-md w-full">
        <Image
          src="https://img.icons8.com/3d-fluency/94/refresh.png"
          alt="Refresh Icon"
          width={64}
          height={64}
          className="mb-2 animate-spin-slow"
        />
        <h1 className="text-2xl font-semibold text-red-600 text-center">
          Oops! Something went wrong.
        </h1>
        <p className="text-gray-700 text-center">
          <span className="font-mono text-red-400">{error.message}</span>
          <br />
          Please refresh and try again.
        </p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow font-medium flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582M20 20v-5h-.581M5.635 19A9 9 0 1 1 19 5.635" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  );
}
