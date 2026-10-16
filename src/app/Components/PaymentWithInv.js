"use client"; // if using Next.js App Router

import React from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import {useRouter} from "next/navigation";
import {BanknotesIcon} from "@heroicons/react/24/outline";
import moment from "moment";
import {Encrypt} from "../../../Functions/Functions"
import { escapeHtml } from "@/lib/security/escapeHtml";

const InvoicePaymentForm = ({ customerId, user, config, invoices,baseUrl }) => {
  const Router = useRouter()
  const handlePayment = async () => {
    // Build invoice options dynamically
    const InvOptions = invoices.sort((a, b) => moment(b.startDate).diff(moment(a.startDate)))
      .map(
        (c) => `<option className="text-xs" value="${escapeHtml(c._id)}">${escapeHtml(c.billStatus.toUpperCase().slice(0,3))}/${escapeHtml(c.billReferenceNo)}</option>`
      )
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Register Payment on Invoice",
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
            <option value="" disabled selected>Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Transfer">Transfer</option>
          </select>
          <select id="swal-inv" class="swal2-select">
            <option value="" disabled selected>Select an Invoice Ref</option>
            ${InvOptions}
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
        const Invoice = document.getElementById("swal-inv").value;

        if (!amount || !date || !type || !Invoice) {
          Swal.showValidationMessage("All fields are required");
          return false;
        }

        // Auto-generate reference if type is Cash and reference is empty
        if (type === "Cash" && !reference) {
          const timestamp = Date.now();
          reference = `Cash-${timestamp}`;
          refInput.value = reference;
        }

        if (!reference) {
          Swal.showValidationMessage("Reference is required");
          return false;
        }

        return { amount, date, reference, type, Invoice };
      },
      showClass: {
        popup: "animate__animated animate__fadeInUp animate__faster",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutDown animate__faster",
      },
    });

    if (!formValues) return; // User cancelled

    Swal.fire({
      title: "Registering payment …",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch(
        `${baseUrl}/api/Payment/${customerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(config?.headers || {}),
          },
          body: JSON.stringify({
            customer: customerId,
            Amount: formValues.amount,
            Date: formValues.date,
            paymentReferenceNo: formValues.reference,
            type: formValues.type,
            Accountant: user,
            BillNo: formValues.Invoice,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Payment failed");
      }

      Swal.fire({
        icon: "success",
        title: "Payment Registered and pending approval",
        html: `
          <p><strong>Invoice:</strong> ${escapeHtml(formValues.Invoice)}</p>
          <p><strong>Amount:</strong> ₦${escapeHtml(formValues.amount)}</p>
          <p><strong>Date:</strong> ${escapeHtml(formValues.date)}</p>
          <p><strong>Reference:</strong> ${escapeHtml(formValues.reference)}</p>
          <p><strong>Method:</strong> ${escapeHtml(formValues.type)}</p>
        `,
        confirmButtonText: "OK",
      });

      // Redirect after success
      Router.push(`/auth/${Encrypt(user._id)}/payment/payment/${Encrypt(data.data)}?Module=payment`);

    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Something went wrong. Please try again.",
        confirmButtonText: "Close",
      });
    }
  };

  return (
    <span
      onClick={handlePayment}
      className="flex items-center gap-2 bg-gray-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-gray-800 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-400 cursor-pointer"
    >
      <BanknotesIcon className="h-5 w-5 text-white" />
      Register Payment on Invoice
    </span>
  );
};

export default InvoicePaymentForm;
