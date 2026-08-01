"use client";

import { downloadExcel } from "../../../Functions/Functions";
import {Download} from "lucide-react";
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
      <Download className="h-4 w-4 ml-2" /> Export {page}
    </Button>
  );
}