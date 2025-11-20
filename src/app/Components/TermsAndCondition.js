"use client";
import React from "react";
import Swal from "sweetalert2";

export default function TermsAndConditionsLink({ BusinessPlan }) {
  const showEulaModal = async () => {
    await Swal.fire({
      title: "End User License Agreement (EULA)",
      html: `
        <div class="text-left text-sm leading-relaxed">
          <p><strong>1. License Grant</strong><br>
          You are granted a limited, non‑exclusive, non‑transferable license to use the App.</p>

          <p><strong>2. No Ownership</strong><br>
          Your payment grants rights to <em>use/lease</em> the App only. You do not acquire ownership or intellectual property rights.</p>

          <p><strong>3. Restrictions</strong><br>
          You may not copy, modify, distribute, reverse engineer, or transfer the App without consent.</p>

          <p><strong>4. Payment Terms</strong><br>
          Payments are strictly for the license to use the App during the agreed period. No purchase of the App itself.</p>

          <p><strong>5. Termination</strong><br>
          The provider may suspend or terminate your license if you breach these terms.</p>

          <p><strong>6. Acceptance</strong><br>
          By viewing these terms you acknowledge and agree to them.</p>
        </div>
      `,
      icon: "info",
      showConfirmButton: false, // 🚫 no confirm button
      showCancelButton: false,  // 🚫 no cancel button
      width: 600,
      allowOutsideClick: true,  // allow closing by clicking outside
      allowEscapeKey: true,     // allow closing with ESC
    });
  };

  return (
    <span
      onClick={showEulaModal}
     className="text-indigo-700 hover:text-indigo-900 cursor-pointer font-bold text-sm tracking-wide"
    >
     Read T&C's of Use for {BusinessPlan} plan.
    </span>
  );
}