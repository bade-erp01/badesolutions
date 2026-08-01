"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
    <Button
      variant="ghost"
      size="sm"
      type="button"
      onClick={handleBack}
      className="flex items-center gap-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all duration-200 group w-full"
    >
      <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
      <span>Back to previous page</span>
    </Button>
  );
};

export default BackButton;