"use client"
import {downloadExcel} from '../../../Functions/Functions'
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import Image from "next/image"

export default function ExcelDownloadBtn({data,page}) {
  return (
    <span
    title={`Export ${page} data to Excel`}
     onClick={()=>downloadExcel(data,page)}
      className="w-full flex items-center bg-gray-200 gap-3 text-xs p-3 rounded-md hover:bg-gray-400 transition"
    >
      <Image src={`https://img.icons8.com/color/48/microsoft-excel-2025.png`}
      alt='Download icon'
      width={25}
      height={25}
      priority={true}
      quality={100}
      />
      {/* <ArrowDownTrayIcon className="h-6 w-6 text-gray-100" /> */}
      <small>Export {page}</small>
    </span>
  );
}
