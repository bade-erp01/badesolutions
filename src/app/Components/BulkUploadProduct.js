'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";
import { EXPRESS_PRIVATE_URL } from "../../../Functions/Functions";
import { plsWait } from "../../../Functions/Mics";
import {useRouter} from "next/navigation"

const MySwal = withReactContent(Swal);

const BulkUploader = ({tenantId}) => {
  const fileInputRef = useRef(null);
  const [jsonData, setJsonData] = useState([]);
  const [hasErrors, setHasErrors] = useState(false);
  const navigation = useRouter()
  const validateEntry = (entry) => entry.name && entry.email && entry.age;

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const parsedData = XLSX.utils.sheet_to_json(sheet);

    const faultyEntries = parsedData.filter((entry) => !validateEntry(entry));
    setHasErrors(faultyEntries.length > 0);
    setJsonData(parsedData);

    MySwal.fire({
      title: hasErrors ? '⚠️ Invalid Entries Found' : '✅ Data Preview',
      html: `
        <div style="max-height:300px; overflow-y:auto; width:1200px; margin:0 auto;">
          <table style="width:100%; border-collapse:collapse; font-size:12px; box-shadow:0 0 10px rgba(0,0,0,0.1);">
            <thead style="background-color:#f4f4f4;">
              <tr>
                ${Object.keys(parsedData[0])
                  .map(
                    (key) =>
                      `<th style="padding:8px; border-bottom:1px solid #ddd; text-align:left;">${key}</th>`
                  )
                  .join('')}
              </tr>
            </thead>
            <tbody>
              ${parsedData
                .map(
                  (row, i) => `
                <tr style="background-color:${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
                  ${Object.values(row)
                    .map(
                      (val) =>
                        `<td style="padding:8px; border-bottom:1px solid #eee; color:#333;">${val}</td>`
                    )
                    .join('')}
                </tr>`
                )
                .join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:16px; display:flex; justify-content:flex-end; gap:10px;">
          <button id="uploadToDB" style="
            background-color: #2563eb;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            border: none;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          ">
            ${hasErrors ? 'Fix Errors First' : 'Upload to DB'}
          </button>
        </div>
      `,
      showConfirmButton: false,
      width: '1300px',
      didOpen: () => {
        document.getElementById('uploadToDB').onclick = () => {
          if (hasErrors) {
            Swal.showValidationMessage('Please fix the faulty entries before uploading.');
            return;
          }
          uploadToDB(parsedData);
          plsWait('uploading to server...')
        };
      },
    });
  };

  const uploadToDB = async (data) => {
    try {
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/uploadbulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json',
          "Authorization": `Bearer ${tenantId}`
         },
        body: JSON.stringify({collectionName:"products",data}),
        
      });

      if (!res.ok) throw new Error('Upload failed');

      Swal.fire('🎉 Success', 'Data uploaded to DB 🗃️!', 'success');
      navigation.refresh()
    } catch (err) {
      Swal.fire('❌ Error', err.message, 'error');
    }
  };

    return (
    <div className="w-full">
        <input
        type="file"
        accept=".xlsx, .xls"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        />
        <button
        onClick={() => fileInputRef.current.click()}
        className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
        >
        <CloudArrowUpIcon className="h-6 w-6 text-gray-100" />
        Bulk Upload Files
        </button>
    </div>
    );
};

export default BulkUploader;
