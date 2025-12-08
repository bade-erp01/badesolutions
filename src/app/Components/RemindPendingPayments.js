"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
// Ensure Animate.css is imported globally: import 'animate.css';

const PendingPaymentReminder = ({ data, business }) => {
  const MySwal = withReactContent(Swal);
  const [pendingPayments] = useState(data || []);

  useEffect(() => {
      MySwal.fire({
        toast: true,
        position: "top-end", // ✅ top right
        showConfirmButton: false,
        timer: 10000,
        timerProgressBar: true,
        customClass: {
          popup: "swal2-pending-toast animate__animated animate__slideInRight",
        },
        background: "#f9f9f9", // ✅ softer background color
        html: `
            <div style="display: flex; align-items: center;">
                <img src="${business?.companyLogo || ""}" 
                    alt="Company Logo" 
                    style="width: 50px; height: 50px; border-radius: 50%; margin-right: 15px; border: 2px solid #b22222;" />
                <div style="text-align: left; line-height: 1.5;">
                <strong style="font-size: 16px; color: #b22222; text-transform: uppercase;">
                    ⚠️ Pending Payment Alert
                </strong><br/>
                <span style="font-size: 15px; color: #000; font-weight: 600;">
                    You have <strong style="color:#d32f2f;">${pendingPayments.length}</strong> payment(s) awaiting approval.
                </span><br/>
                <span style="font-size: 14px; color: #444;">
                    👉 Kindly visit your <strong style="color:#b22222;">Cash Register</strong> to update payment status 
                    and customer ledger <strong style="color:#b22222;">immediately</strong>.
                </span>
                </div>
            </div>
            `,
      });
  }, [pendingPayments, business]);

  return null; // Component only triggers the toast
};

export default PendingPaymentReminder;
