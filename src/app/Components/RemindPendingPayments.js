"use client";
import React, { useEffect, useRef } from "react";
import Swal from "sweetalert2";
import { escapeHtml } from "@/lib/security/escapeHtml";
import { safeUrl } from "@/lib/security/safeUrl";
// Ensure Animate.css is imported globally: import 'animate.css';

const PendingPaymentReminder = ({ data, business }) => {
  const pendingPayments = Array.isArray(data) ? data : [];
  const shownPaymentSignature = useRef("");
  const paymentSignature = JSON.stringify(
    pendingPayments
      .map((payment) => String(
        payment?._id ||
        payment?.paymentReferenceNo ||
        `${payment?.PaymentDate || ""}:${payment?.Amount ?? payment?.crAmount ?? ""}`,
      ))
      .sort(),
  );

  useEffect(() => {
    if (!pendingPayments.length || shownPaymentSignature.current === paymentSignature) return;
    shownPaymentSignature.current = paymentSignature;

    Swal.fire({
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 10000,
      timerProgressBar: true,
      customClass: {
        popup: "swal2-pending-toast animate__animated animate__slideInRight",
      },
      background: "#f9f9f9",
      html: `
            <div style="display: flex; align-items: center;">
                <img src="${escapeHtml(safeUrl(business?.companyLogo || "", ""))}" 
                    alt="Company Logo" 
                    style="width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; border: 2px solid #b22222; flex-shrink: 0;" />
                <div style="text-align: left; line-height: 1.5;">
                <strong style="font-size: 16px; color: #b22222; text-transform: uppercase;">
                    ⚠️ Payment Alert
                </strong><br/>
                <span style="font-size: 15px; color: #000; font-weight: 600;">
                    You have <strong style="color:#d32f2f;">${escapeHtml(pendingPayments.length)}</strong> payment(s) awaiting approval.
                </span><br/>
                <span style="font-size: 14px; color: #444;">
                    👉 Kindly visit your <strong style="color:#b22222;">Cash Register</strong> to update payment status 
                    and customer ledger <strong style="color:#b22222;">immediately</strong>.
                </span>
                </div>
            </div>
            `,
    });
  }, [paymentSignature, pendingPayments.length, business?.companyLogo]);

  return null; // Component only triggers the toast
};

export default PendingPaymentReminder;
