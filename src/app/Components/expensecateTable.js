"use client";
import Swal from "sweetalert2";
import { TagIcon } from "@heroicons/react/24/outline";
import { Dencrypt } from "../../../Functions/Functions";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { escapeHtml } from "@/lib/security/escapeHtml";

export default function ExpenseCategoriesModal({
  data,
  baseUrl,
  userData,
}) {
  const Router = useRouter();
  const [categories,setCategories] = useState(data || [])



  const showModal = () => {
    Swal.fire({
      title: "Expense Tags",
      html: `
        <table style="width:100%; border-collapse: collapse; font-size: 13px;">
          <thead style="background-color: #edf2f7;">
            <tr>
              <th style="padding: 6px; text-align: left;">Name</th>
              <th style="padding: 6px; text-align: center;">Grouped as</th>
              <th style="padding: 6px; text-align: right;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${categories
              .map(
                (cat, i) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px; text-align: left;">${escapeHtml(cat.NAME)}</td>
                <td style="padding: 6px; text-align: center;">${escapeHtml(
                  cat.type
                )} expense</td>
                <td style="padding: 6px; text-align: right;">
                  <input 
                    type="checkbox" 
                    id="status-${i}" 
                    data-id="${escapeHtml(cat._id?.$oid || cat._id)}" 
                    ${cat.status ? "checked" : ""} 
                    class="form-checkbox h-4 w-4 text-blue-600"
                  />
                </td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
      `,
      width: "max(50%, min(95vw, 640px))",
      showConfirmButton: true,
      confirmButtonText: "Close",
      didOpen: () => {
        // Attach event listeners to each checkbox
        categories.forEach((cat, i) => {
          const checkbox = document.getElementById(`status-${i}`);
          if (checkbox) {
            checkbox.addEventListener("change", async (e) => {
              const newStatus = e.target.checked;
              const categoryId = e.target.getAttribute("data-id");

              try {
                // Example API request — adjust URL & payload to your backend
                const res = await api.patch(
                  `/api/expenseCategory/update/${categoryId}`,
                  { status: newStatus }
                );

                const response = res.data || {}
                
                if (!res.ok) {
                    throw new Error(response.error || res.error || "Something went wrong");
                }
                
                Swal.showValidationMessage(
                  `Status for "${escapeHtml(cat.NAME)}" updated successfully`
                );
                setCategories(Dencrypt(response.data))
                Router.refresh();
              } catch (err) {
                Swal.showValidationMessage(
                  `Error updating "${escapeHtml(cat.NAME)}": ${escapeHtml(err.message)}`
                );
                // revert checkbox if failed
                e.target.checked = !newStatus;
              }
            });
          }
        });
      },
    });
  };

  return (
    <button
      onClick={showModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <TagIcon className="w-4 h-4 inline-block" />
      Expense Tags
    </button>
  );
}
