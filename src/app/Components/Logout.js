"use client";

import { useState } from "react";
import { SuccessToast, ErrorMessage } from "../../../Functions/Mics";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout as logoutAction } from "../../../lib/User";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Logout({ userData }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    try {
      setIsLoggingOut(true);
      SuccessToast("Signing out...");

      await dispatch(logoutAction()); // Await if it's async

      SuccessToast("You have been logged out successfully.");
      router.push("/Login");
    } catch (e) {
      ErrorMessage("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const companySlug = userData?.business?.companyName
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const accountUrl = `/${companySlug}/account/${userData?.business?._id}`;

  return (
    <button
      onClick={logout}
      disabled={isLoggingOut}
      className={`flex items-center text-xs gap-3 px-4 py-2 w-full mt-2 rounded-md transition-colors ${
        isLoggingOut ? "bg-gray-400 cursor-not-allowed" : "bg-purple-500 hover:bg-purple-700"
      }`}
      aria-label="Logout"
    >
      {isLoggingOut ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
      ) : (
        <ArrowRightStartOnRectangleIcon className="h-6 w-6 text-white" />
      )}
      <span className="text-sm text-white font-medium">
        {isLoggingOut ? "Logging out..." : "Logout"}
      </span>
    </button>
  );
}
