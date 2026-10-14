"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

export default function Tenanterror({ error }) {
  const router = useRouter();

  return (
    <div className="bg-white flex items-center justify-center min-h-dvh px-4">
      <div className="flex flex-col items-center gap-3 text-center sm:block">
        {/* <!-- Large 404 --> */}
        <Link  href={`/auth/Forgot_password`} className="inline-block sm:border-r sm:border-gray-300 sm:mr-5 sm:pr-6 text-lg font-bold align-top cursor-pointer">
         Request Token ?
        </Link>

        {/* <!-- Message --> */}
        <div className="inline-block text-center sm:text-left">
          <h2 className="text-sm font-normal text-gray-600 mb-2">
            Tokens are short lived and it seems this one has expired. Try again.!
          </h2>
        </div>
      </div>
    </div>
  );
}
