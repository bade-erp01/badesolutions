"use client";

import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import api from "@/lib/api"
import { ErrorMessage, plsWait } from "../../../Functions/Mics";
import { safeUrl } from "@/lib/security/safeUrl";

const RenewButton = ({id ,baseUrl,User}) => {
  const MySwal = withReactContent(Swal);
  // works after the subscription has expired too (backend lib/payments/billing.js)
  const redirectUrl = "/api/v1/billing/subscription";

  const handleRenewClick = () => {
    MySwal.fire({
      title: <strong>Proceed to Payment</strong>,
      html: (
        <div className="text-sm text-gray-700">
          <p>You&apos;re about to renew your subscription and unlock premium features.</p>
          <p className="mt-2 font-medium text-indigo-600">Continue to secure payment?</p>
        </div>
      ),
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "Cancel",
      buttonsStyling: false,
      customClass: {
        popup: "rounded-xl shadow-lg",
        confirmButton:
          "bg-indigo-400 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition-all font-semibold",
        cancelButton:
          "bg-gray-200 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-300 transition-all font-medium",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        plsWait("Initiating secured Payment")
        const InitiatePayment = await api.post(redirectUrl, {});

        const url = InitiatePayment.ok ? safeUrl(InitiatePayment.data?.url || "") : "";
        if (url && url !== "#") {
          window.location.assign(url); // Paystack checkout, then back to the app
        } else {
          ErrorMessage(InitiatePayment.error || "Could not start the payment.")
        }
       
      }
    });
  };

  return (
    <span
      onClick={handleRenewClick}
      className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-black/50 px-8 py-3 font-semibold text-white shadow-lg transition-transform duration-300 hover:scale-105"
    >
      <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></span>
      Renew Subscription
    </span>
  );
};

export default RenewButton;
