"use client"
import {downloadExcel} from '../../../Functions/Functions'
import { ArrowDownTrayIcon } from "@heroicons/react/24/outline";

export default function ExcelDownloadBtn({data,page}) {

  return (
    <span
    title={`Export ${page} data to Excel`}
     onClick={()=>downloadExcel(data,page)}
      className="w-full flex items-center bg-gray-500 gap-3 text-xs p-3 rounded-md hover:bg-gray-700 transition"
    >
      <ArrowDownTrayIcon className="h-6 w-6 text-gray-100" />
      <small>Export {page}</small>
    </span>
  );
}
