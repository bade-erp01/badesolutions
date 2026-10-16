'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CloudArrowUpIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { EXPRESS_PRIVATE_URL, Encrypt } from "../../../Functions/Functions";
import { plsWait } from "../../../Functions/Mics";
import { useRouter } from "next/navigation";

const MySwal = withReactContent(Swal);

const BulkUploader = ({ tenantId, collectionName }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsedData = XLSX.utils.sheet_to_json(sheet);

      showPreviewModal(parsedData);
    } catch (error) {
      Swal.fire('❌ Error', 'Failed to parse file.', 'error');
    }
  };

  const showPreviewModal = (data) => {
    const tableHeaders = Object.keys(data[0] || {}).map(
      (key) => `<th style="padding:8px; border-bottom:1px solid #ddd;">${key}</th>`
    ).join('');

    const tableRows = data.map((row, i) => `
      <tr style="background-color:${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
        ${Object.values(row).map(
          (val) => `<td style="padding:8px; border-bottom:1px solid #eee;">${val}</td>`
        ).join('')}
      </tr>
    `).join('');

    MySwal.fire({
      title: '✅ Data Preview',
      html: `
        <div style="max-height:300px; overflow-y:auto; width:1000px;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
        <div style="margin-top:16px; text-align:right;">
          <button id="uploadToDB" style="
            background-color: #2563eb;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            border: none;
            cursor: pointer;
          ">
            Upload to DB
          </button>
        </div>
      `,
      showConfirmButton: false,
      width: '1100px',
      didOpen: () => {
        const btn = document.getElementById('uploadToDB');
        btn.onclick = () => {
          plsWait('Uploading to server...');
          uploadToDB(data);
        };
      },
    });
  };

  const uploadToDB = async (data) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/uploadbulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tenantId.business.tenantId}`,
          dbConnect: `Bearer ${tenantId.business.rustyRoof}`,
          access: `${Encrypt(tenantId.user._id)}`,
          sessionKey: `Bearer ${Encrypt(tenantId.SessionId)}`
        },
        body: JSON.stringify({ collectionName, data }),
      });

      if (!res.ok) throw new Error('Upload failed');

      Swal.fire('🎉 Success', 'Data uploaded to DB 🗃️!', 'success');
      router.refresh();
    } catch (err) {
      Swal.fire('❌ Error', err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const worksheet = XLSX.utils.json_to_sheet([
      { name: '', email: '', age: '' }
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
    XLSX.writeFile(workbook, 'UploadTemplate.xlsx');
  };

  return (
    <div className="w-full space-y-3" title="Ensure to use recommended upload template">
      <input
        type="file"
        accept=".xlsx, .xls, .csv"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      <button
        onClick={() => fileInputRef.current.click()}
        className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition w-full"
        aria-label="Upload bulk file"
      >
        <CloudArrowUpIcon className="h-5 w-5" />
        Bulk Upload File
      </button>

      {/* <button
        onClick={downloadTemplate}
        className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition w-full"
        aria-label="Download template"
      >
        <DocumentArrowDownIcon className="h-5 w-5" />
        Download Template
      </button> */}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default BulkUploader;
