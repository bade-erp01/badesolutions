"use client";
import React, { useEffect } from "react";
import Swal from "sweetalert2";

export default function CookiesPolicyAlert() {
  useEffect(() => {


    // Check localStorage flag
    const hasSeenPolicy = localStorage.getItem("cookiesPolicy");

    if (!hasSeenPolicy) {
      Swal.fire({
        title: '<span class="text-lg font-bold text-gray-800">🍪 Cookies Policy</span>',
        html: `
          <div class="text-left text-sm leading-relaxed text-gray-700">
            <p>We use cookies to improve your experience, analyze Application usage, and deliver personalized content.</p>
            <p class="mt-2">By continuing to use this site, you agree to our cookies policy.</p>
          </div>
        `,
        icon: "info",
        toast: true,
        position: "bottom-end",   // bottom-right corner
        showConfirmButton: false, // no buttons
        timer: 30000,             // auto-close after 30s
        timerProgressBar: true,
        background: "#f9fafb",    // Tailwind gray-50
        customClass: {
          popup: "shadow-lg rounded-lg border border-gray-200 p-4",
        },
        didClose: () => {
          // Save flag in localStorage so it won't show again
          localStorage.setItem("cookiesPolicy", "true");
        },
      });
    }
  }, []);

  return null;
}
