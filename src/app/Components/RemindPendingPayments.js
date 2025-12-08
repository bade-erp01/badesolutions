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
                 style="width: 40px; height: 40px; border-radius: 50%; margin-right: 12px;" />
            <div style="text-align: left;">
              <strong style="font-size: 14px; color: #b22222;">
                PENDING PAYMENT
              </strong><br/>
              <span style="font-size: 14px; color: #000;">
                ⚠️ You have <strong>${pendingPayments.length}</strong> pending payment(s).
              </span>
            </div>
          </div>
        `,
      });
  }, [pendingPayments, business]);

  return null; // Component only triggers the toast
};

export default PendingPaymentReminder;
