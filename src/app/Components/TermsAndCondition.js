"use client";

import React from "react";
import Swal from "sweetalert2";

export default function TermsAndConditionsLink({ BusinessPlan }) {
  const showEulaModal = async () => {
    const isDark = document.documentElement.classList.contains("dark");

    await Swal.fire({
      title: "End User License Agreement (EULA)",
      html: `
        <div class="text-left text-sm leading-relaxed space-y-6 ${
          isDark 
            ? "text-slate-300" 
            : "text-slate-700"
        }">
          <p><strong class="${isDark ? 'text-white' : 'text-slate-900'}">1. License Grant</strong><br>
          You are granted a limited, non‑exclusive, non‑transferable license to use the App.</p>

          <p><strong class="${isDark ? 'text-white' : 'text-slate-900'}">2. No Ownership</strong><br>
          Your payment grants rights to <em>use/lease</em> the App only. You do not acquire ownership or intellectual property rights.</p>

          <p><strong class="${isDark ? 'text-white' : 'text-slate-900'}">3. Restrictions</strong><br>
          You may not copy, modify, distribute, reverse engineer, or transfer the App without consent.</p>

          <p><strong class="${isDark ? 'text-white' : 'text-slate-900'}">4. Payment Terms</strong><br>
          Payments are strictly for the license to use the App during the agreed period. No purchase of the App itself.</p>

          <p><strong class="${isDark ? 'text-white' : 'text-slate-900'}">5. Termination</strong><br>
          The provider may suspend or terminate your license if you breach these terms.</p>

          <p><strong class="${isDark ? 'text-white' : 'text-slate-900'}">6. Acceptance</strong><br>
          By virtue of viewing or usage of the application, you acknowledge and agree to our Terms and Conditions.</p>
        </div>
      `,
      icon: false,
      showConfirmButton: false,
      showCancelButton: false,
      width: "680px",
      padding: window.innerWidth < 640 ? "1.25rem" : "2rem",
      background: isDark ? "#0f172a" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#0f172a",
      backdrop: isDark 
        ? "rgba(15, 23, 42, 0.8)" 
        : "rgba(0, 0, 0, 0.6)",
      
      customClass: {
        popup: `rounded-2xl shadow-xl border font-sans ${
          isDark 
            ? "border-slate-700 bg-slate-900" 
            : "border-slate-200 bg-white"
        }`,
        title: `text-xl sm:text-2xl font-semibold mb-6 ${
          isDark ? "text-white" : "text-slate-900"
        }`,
        htmlContainer: "text-inherit",
        closeButton: isDark ? "hover:bg-slate-800 text-slate-400" : "",
      },
      showCloseButton: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
    });
  };

  return (
    <span
      onClick={showEulaModal}
      className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-500 cursor-pointer text-sm tracking-wide underline-offset-4 hover:underline"
    >
      Read T&C&apos;s of Use for {BusinessPlan} plan.
    </span>
  );
}