"use client"

import React from "react";
import Swal from "sweetalert2";

// Your postPayment function (keep it as you wrote)
async function EquityFormFunc (customerId, user, config) {
  const { value: formValues } = await Swal.fire({
    title: "Entry Form",
    html: `
      <style>
        .swal2-input, .swal2-select {
          padding: .75rem 1rem;
          border: 1px solid #D1D5DB;
          border-radius: .375rem;
          font-size: 1rem;
          box-shadow: none;
          transition: border-color .2s, box-shadow .2s;
          width: 60%;
          margin-top: .5rem;
        }
        .swal2-input:focus, .swal2-select:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          outline: none;
        }
      </style>

      <div class="w-full p-1 justify-center overflow-hidden">
        <input id="swal-amount" type="number" min="1" class="swal2-input" placeholder="Amount (₦)" />
        <input id="swal-date" type="date" class="swal2-input" placeholder="Payment Date" />
        <input id="swal-ref" type="text" class="swal2-input" placeholder="Reference" />
        <select id="swal-method" class="swal2-select">
          <option value="" disabled selected>Choose...</option>
          <option value="Capital">Capital</option>
          <option value="Earnings">Earnings</option>
          <option value="Drawings">Drawings</option>
        </select>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: "Submit",
    preConfirm: () => {
      const amount = document.getElementById("swal-amount").value;
      const date = document.getElementById("swal-date").value;
      const refInput = document.getElementById("swal-ref");
      let reference = refInput.value;
      const type = document.getElementById("swal-method").value;

      if (!amount || !date || !type) {
        Swal.showValidationMessage("Amount, Date, and Payment Method are required");
        return false;
      }

      if (type === "Cash" && !reference) {
        const timestamp = Date.now();
        reference = `Cash-${timestamp}`;
        refInput.value = reference;
      }

      if (!reference) {
        Swal.showValidationMessage("Reference is required");
        return false;
      }

      return { amount, date, reference, type };
    },
    showClass: {
      popup: "animate__animated animate__fadeInUp animate__faster"
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutDown animate__faster"
    }
  });

  if (!formValues) return;

  Swal.fire({
    title: "Registering payment Entry …",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(`${EXPRESS_PRIVATE_URL}/api/Payment/${customerId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config?.headers || {})
      },
      body: JSON.stringify({
        customer: customerId,
        Amount: formValues.amount,
        Date: formValues.date,
        paymentReferenceNo: formValues.reference,
        type: formValues.type,
        Accountant: user
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Payment failed");
    }

    Swal.fire({
      icon: "success",
      title: "Payment Registered and pending approval",
      html: `
        <p><strong>Amount:</strong> ₦${formValues.amount}</p>
        <p><strong>Date:</strong> ${formValues.date}</p>
        <p><strong>Reference:</strong> ${formValues.reference}</p>
        <p><strong>Method:</strong> ${formValues.type}</p>
      `,
      confirmButtonText: "OK"
    });

    window.location.href = `/auth/${Encrypt(user._id)}/payment/payment/${Encrypt(data.data)}?Module=payment`;
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Error",
      text: err.message || "Something went wrong. Please try again.",
      confirmButtonText: "Close"
    });
  }
}

// ✅ React component that exports a button
export default function EquityForm({ customerId, user, config }) {
  return (
    <button
      onClick={() => EquityFormFunc(customerId, user, config)}
       className="flex items-center gap-3 p-3 rounded-md bg-orange-700 hover:bg-orange-800 transition text-xs w-full">
      Register Entry
    </button>
  );
}
