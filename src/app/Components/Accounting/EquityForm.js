"use client";

import React from "react";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";
import {Encrypt} from "../../../../Functions/Functions"

export default function EquityForm({ EXPRESS_PRIVATE_URL, user,Accounts} ) {
  const Router = useRouter();

  async function EquityFormFunc() {

    const BankOptions = Accounts
      .map((c) => `<option value="${c._id}">${c.NAME}</option>`)
      .join("");

    const { value: formValues } = await Swal.fire({
      title: "Journal Entry Form",
      html: `
      <style>
        .swal2-input, .swal2-select {
          padding: .5rem .75rem;
          border: 1px solid #D1D5DB;
          border-radius: .375rem;
          font-size: .9rem;
          width: 70%;
          margin-top: .5rem;
        }
      </style>

      <div class="w-full p-1 justify-center overflow-hidden">
        <input id="swal-amount" type="number" min="1" class="swal2-input" placeholder="Amount (₦)" required/>
        <input id="swal-date" type="date" class="swal2-input" required/>
        <input id="swal-desc" type="text" class="swal2-input" placeholder="Description" required/>
        <select id="swal-accountType" class="swal2-select" required>
          <option value="" disabled selected>Choose account type...</option>
          <option value="ownersCapital">Owners Capital</option>
          <option value="retainedEarnings">Retained Earnings</option>
          <option value="drawings">Drawings</option>
        </select>
         <select id="bankDropdown" required class="swal2-select">
          <option value="" >Choose Bank...</option>
          ${BankOptions}
        </select>
      </div>
    `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Submit",
      preConfirm: () => {
        const amount = document.getElementById("swal-amount").value;
        const date = document.getElementById("swal-date").value;
        const description = document.getElementById("swal-desc").value;
        const accountType = document.getElementById("swal-accountType").value;
        const bankDropdown = DOCUMENT.getElementById("bankDropdown").value

        if (!amount || !date || !accountType || bankDropdown) {
          Swal.showValidationMessage(
            "All fields are required"
          );
          return false;
        }

        // Auto-assign debit/credit based on accountType
        let debitCredit;
        switch (accountType) {
          case "ownersCapital":
          case "retainedEarnings":
          case "shareCapital":
          case "reserves":
            debitCredit = "credit"; // equity increases with credit
            break;
          case "drawings":
            debitCredit = "debit"; // drawings reduce equity
            break;
          default:
            debitCredit = "credit";
        }

        return { amount, date, description, accountType, debitCredit,bankDropdown };
      },
    });

    if (!formValues) return;

    Swal.fire({
      title: "Registering journal entry…",
      didOpen: () => Swal.showLoading(),
    });

    try {
      const response = await fetch(`${EXPRESS_PRIVATE_URL}/api/Equity/journal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(user.tenantId)}`,
          access: `${Encrypt(user._id)}`,
        },
        body: JSON.stringify({
          accountType: formValues.accountType,
          amount: formValues.amount,
          debitCredit: formValues.debitCredit, // auto-computed
          date: formValues.date,
          description: formValues.description,
          raisedBy: user,
          bank:formValues.bankDropdown
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");

      Swal.fire({
        icon: "success",
        title: "Journal Entry Registered",
        html: `
        <p><strong>Amount:</strong> ₦${formValues.amount}</p>
        <p><strong>Date:</strong> ${formValues.date}</p>
        <p><strong>Account:</strong> ${formValues.accountType}</p>
        <p><strong>Description:</strong> ${formValues.description}</p>
      `,
      });

      Router.refresh();
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: err.message });
    }
  }
  return (
    <button
      onClick={() => EquityFormFunc()}
      className="flex items-center gap-3 p-3 rounded-md bg-green-500 hover:bg-green-600 transition text-xs w-full"
    >
      Register Journal Entry
    </button>
  );
}
