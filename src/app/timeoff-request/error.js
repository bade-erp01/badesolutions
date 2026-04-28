"use client";
import React from "react";

export default function Tenanterror({ error }) {

  return (
    <div className="bg-white flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* <!-- Large 503 --> */}
        <h3 className="inline-block border-r border-gray-300 mr-5 pr-6 text-lg font-bold align-top cursor-pointer">
          503
        </h3>

        {/* <!-- Message --> */}
        <div className="inline-block text-left">
          <h2 className="text-sm font-normal text-gray-600 mb-2">
            Unfortunatly,Tokens are short lived and it seems this one has expired!
          </h2>
        </div>
      </div>
    </div>
  );
}
