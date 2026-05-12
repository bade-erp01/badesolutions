"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const BackButton = () => {
  const router = useRouter();
  const [previousPage, setPreviousPage] = useState("");

  useEffect(() => {
    const lastPage = sessionStorage.getItem("lastVisitedPage");
    if (lastPage) {
      setPreviousPage(lastPage);
    }
  }, []);

  const handleBack = () => {
    if (previousPage) {
      router.push(previousPage);
    } else {
      router.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleBack}
      className="text-xs w-full flex items-center gap-3 p-3 rounded-md hover:bg-gray-400 transition duration-300 ease-in-out"
    >
      <svg
        className="w-5 h-5 text-gray-100 group-hover:text-indigo-500 transition"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      <span className="text-xs md:text-base">Back to previous page</span>
    </button>
  );
};

export default BackButton;
