"use client";
import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-gray-100">
      {/* Top nav loader */}
      <div
        className="h-12 bg-gray-300 animate-pulse w-full mb-2"
        aria-hidden="true"
      ></div>

      <div className="flex flex-1 flex-col md:flex-row">

        {/* Main Content */}
        <main className="flex-1 p-4 overflow-y-auto">
          <section className="w-full max-w-7xl mx-auto flex items-center justify-center min-h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-black"></div>
          </section>
        </main>
      </div>

      {/* Footer */}
      <div
        className="h-12 bg-gray-300 animate-pulse w-full mt-2"
        aria-hidden="true"
      ></div>
    </div>
  );
}
