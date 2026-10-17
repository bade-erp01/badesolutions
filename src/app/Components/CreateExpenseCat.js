"use client"
import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { SquaresPlusIcon } from "@heroicons/react/24/outline";
import api from "@/lib/api";
import {ErrorMessage,SuccessToast,plsWait,} from "../../../Functions/Mics"
import { useRouter } from "next/navigation";

const MySwal = withReactContent(Swal);

const ExpenseCategoryModal = ({ baseUrl,userData }) => {
  const Router = useRouter()
  const openModal = () => {
    MySwal.fire({
      title: "Create Expense Tag",
      html: `
         <input 
        id="tagName" 
        class="swal2-input w-48 px-2 py-1 text-base sm:text-sm rounded-md border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500" 
        placeholder="Enter tag name" 
        />
        <div class="flex flex-wrap justify-around gap-2 mt-3 text-sm">
        <label class="flex items-center gap-2">
            <input type="radio" name="expenseType" value="Direct" checked />
            <span class="font-medium">Direct Expense</span>
        </label>
        <label class="flex items-center gap-2">
            <input type="radio" name="expenseType" value="Indirect" />
            <span class="font-medium">Indirect Expense</span>
        </label>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
      icon: "info",
      background: "#ffffff",
      color: "#333",
      confirmButtonColor: "#4CAF50",
      cancelButtonColor: "#d33",
      preConfirm: () => {
        const tagInput = document.getElementById("tagName");
        const tagName = tagInput ? tagInput.value.trim() : "";
        const selected = document.querySelector('input[name="expenseType"]:checked');
        const expenseType = selected ? selected.value : "";

        if (!tagName) {
          Swal.showValidationMessage("You need to enter a tag name!");
          return false;
        }
        if (!expenseType) {
          Swal.showValidationMessage("You need to select an expense type!");
          return false;
        }

        return { tagName, expenseType };
      },
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        plsWait("Please wait.")
        const { tagName, expenseType } = result.value;
        // send request to server
        const request = await api.post("/api/expense/Category/create", {NAME:tagName,type:expenseType})
        
        const response = request.data || {}

        if(request.ok){
          SuccessToast(response.message)
          Router.refresh()
        }else{
          ErrorMessage(response.error || request.error)
          Router.refresh()
        }
      }
    });
  };

  return (
    <button
      onClick={openModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <SquaresPlusIcon className="h-4 w-4 text-white" />
      Create Tag
    </button>
  );
};

export default ExpenseCategoryModal;
