"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function Tenanterror({ error }) {
  const router = useRouter();

  return (
    <div className="bg-white flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* <!-- Large 404 --> */}
        <Link  href={`/auth/Forgot_password`} className="inline-block border-r border-gray-300 mr-5 pr-6 text-lg font-bold align-top cursor-pointer">
         Request Token ?
        </Link>

        {/* <!-- Message --> */}
        <div className="inline-block text-left">
          <h2 className="text-sm font-normal text-gray-600 mb-2">
            Token is short lived and has expired. Try again.!
          </h2>
        </div>
      </div>
    </div>
  );
}
