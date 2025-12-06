"use client"
import React from "react";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { TagIcon } from "@heroicons/react/24/outline";

const MySwal = withReactContent(Swal);

const ExpenseCategoryModal = ({ onCreate }) => {
  const openModal = () => {
    MySwal.fire({
      title: "Create Expense Tag",
      input: "text",
      inputPlaceholder: "Enter tag name",
      showCancelButton: true,
      confirmButtonText: "Create",
      cancelButtonText: "Cancel",
      icon: "info", // options: success, error, warning, info, question
      background: "#f9f9f9", // light background
      color: "#333", // text color
      confirmButtonColor: "#4CAF50", // green confirm button
      cancelButtonColor: "#d33", // red cancel button
      customClass: {
        title: "swal-title",
        input: "swal-input",
        confirmButton: "swal-confirm",
        cancelButton: "swal-cancel",
      },
      inputValidator: (value) => {
        if (!value) {
          return "You need to enter a tag name!";
        }
      },
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        onCreate(result.value);
        MySwal.fire({
          title: "✅ Success",
          text: `Tag "${result.value}" created!`,
          icon: "success",
          confirmButtonColor: "#4CAF50",
        });
      }
    });
  };

  return (
    <button
      onClick={openModal}
      className="flex items-center bg-gray-500 gap-3 p-3 rounded-md hover:bg-gray-700 transition w-full mt-2"
    >
     <TagIcon className="h-6 w-6 text-gray-100" />
     <span className="text-xs">Create expense Tags</span>
    </button>
  );
};

export default ExpenseCategoryModal;
