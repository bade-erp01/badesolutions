"use client";

import { downloadExcel } from "../../../Functions/Functions";

import Image from "next/image";

import { Button } from "@/components/ui/button";

export default function ExcelDownloadBtn({
  data,
  page,
}) {
  return (
    <Button
      type="button"
      variant="outline"
      title={`Export ${page} data to Excel`}
      onClick={() => downloadExcel(data, page)}
      className="
        w-full
        max-w-full
        h-auto
        min-h-[48px]
        flex
        items-center
        justify-start
        gap-2
        p-2
        overflow-hidden
        whitespace-normal
        break-words
        text-left
        hover:bg-muted
        bg-gray-300
      "
    >
      <Image
        src="https://img.icons8.com/color/48/microsoft-excel-2025.png"
        alt="Download icon"
        width={24}
        height={24}
        priority
        quality={100}
        className="shrink-0"
      />

      <span
        className="
          text-xs
          font-semibold
          text-black
          leading-tight
          break-words
          whitespace-normal
        "
      >
        Export {page}
      </span>
    </Button>
  );
}