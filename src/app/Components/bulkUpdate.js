'use client';

import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { CloudArrowUpIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import { plsWait ,ErrorMessage,SuccessToast} from "../../../Functions/Mics";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { escapeHtml } from "@/lib/security/escapeHtml";

const MySwal = withReactContent(Swal);
const MAX_BULK_UPDATE_ROWS = 500;

const getPriceListDefinitions = (products) => {
  const definitions = new Map();

  products.forEach((product) => {
    (Array.isArray(product.PriceLists) ? product.PriceLists : []).forEach((priceList) => {
      if (!priceList?.Name) return;
      const name = String(priceList.Name).trim();
      const key = name.replace(/\s+/g, "_");
      if (!definitions.has(key)) definitions.set(key, name);
      else if (definitions.get(key) !== name) {
        throw new Error("Price list names must be unique after replacing spaces with underscores.");
      }
    });
  });

  return Array.from(definitions, ([key, name]) => ({ key, name }));
};

const getProductTemplateHeaders = (priceLists) => [
  "id",
  "Name",
  "Pieces",
  "category",
  "sub_category",
  ...priceLists.flatMap(({ key }) => [key, `${key}_VAT`, `${key}_Promo`, `${key}_PromoDate`]),
];

const BulkUpdate = ({ collectionName, WHID, products = [] }) => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      if (collectionName === "product" && !file.name.toLowerCase().endsWith(".xlsx")) {
        throw new Error("Upload the recommended .xlsx product template.");
      }

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { cellDates: true });
      if (collectionName === "product" && (workbook.SheetNames.length !== 1 || workbook.SheetNames[0] !== "ProductBulkUpdate")) {
        throw new Error("This is not the recommended product bulk-update template.");
      }

      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      let parsedData;
      let uploadData;

      if (collectionName === "product") {
        const priceLists = getPriceListDefinitions(products);
        const expectedHeaders = getProductTemplateHeaders(priceLists);
        const grid = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", blankrows: false });
        const actualHeaders = (grid[0] || []).map((value) => String(value).trim());
        if (actualHeaders.length !== expectedHeaders.length || actualHeaders.some((value, index) => value !== expectedHeaders[index])) {
          throw new Error("The columns do not match the recommended product bulk-update template.");
        }

        parsedData = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: true });
        const knownProductIds = new Set(products.map((product) => String(product._id)));
        const seenIds = new Set();
        uploadData = parsedData.map((row, index) => {
          const id = String(row.id || "").trim();
          if (!/^[a-f\d]{24}$/i.test(id) || !knownProductIds.has(id)) {
            throw new Error(`Row ${index + 2} has an invalid or unknown product id.`);
          }
          if (seenIds.has(id)) throw new Error(`Row ${index + 2} repeats a product id.`);
          seenIds.add(id);

          const pieces = Number(row.Pieces);
          if (!Number.isFinite(pieces) || pieces <= 0) {
            throw new Error(`Row ${index + 2} must have a Pieces value greater than zero.`);
          }

          const productPriceLists = priceLists.map(({ key, name }) => {
            const values = { Name: name };
            const price = row[key];
            if (price !== "") {
              if (!Number.isFinite(Number(price)) || Number(price) < 0) {
                throw new Error(`Row ${index + 2} has an invalid ${key} value.`);
              }
              values.price = String(price);
            }

            const vat = row[`${key}_VAT`];
            if (vat !== "") {
              if (![true, false, 1, 0, "1", "0", "true", "false"].includes(typeof vat === "string" ? vat.toLowerCase() : vat)) {
                throw new Error(`Row ${index + 2} has an invalid ${key}_VAT value; use true or false.`);
              }
              values.vat = vat === true || vat === 1 || vat === "1" || String(vat).toLowerCase() === "true";
            }

            const promo = row[`${key}_Promo`];
            if (promo !== "") {
              if (!Number.isFinite(Number(promo)) || Number(promo) < 0) {
                throw new Error(`Row ${index + 2} has an invalid ${key}_Promo value.`);
              }
              values.promo = Number(promo);
            }

            const promoDate = row[`${key}_PromoDate`];
            if (promoDate === "") {
              values.PromoDate = null;
            } else if (promoDate instanceof Date && !Number.isNaN(promoDate.getTime())) {
              values.PromoDate = promoDate.toISOString();
            } else if (!Number.isNaN(new Date(promoDate).getTime())) {
              values.PromoDate = new Date(promoDate).toISOString();
            } else {
              throw new Error(`Row ${index + 2} has an invalid ${key}_PromoDate value.`);
            }

            return values;
          });

          return {
            id,
            Pieces: pieces,
            category: String(row.category ?? ""),
            sub_category: String(row.sub_category ?? ""),
            PriceLists: productPriceLists,
          };
        });
      } else {
        parsedData = XLSX.utils.sheet_to_json(sheet);
        uploadData = parsedData;
      }

      if (parsedData.length === 0) throw new Error("The template contains no product rows.");
      if (parsedData.length > MAX_BULK_UPDATE_ROWS) {
        throw new Error(`Limit exceeded. Upload no more than ${MAX_BULK_UPDATE_ROWS} records at once.`);
      }

      showPreviewModal(parsedData, uploadData);
    } catch (error) {
      ErrorMessage( error.message || 'Failed to process the file. Please ensure it is a valid Excel or CSV file.' );
    } finally {
      e.target.value = "";
    }
  };

  const showPreviewModal = (data, uploadData) => {
    const tableHeaders = Object.keys(data[0] || {}).map(
      (key) => `<th style="padding:8px; border-bottom:1px solid #ddd;">${escapeHtml(key)}</th>`
    ).join('');

    const tableRows = data.map((row, i) => `
      <tr style="background-color:${i % 2 === 0 ? '#fff' : '#f9f9f9'};">
        ${Object.values(row).map(
          (val) => `<td style="padding:8px; border-bottom:1px solid #eee;">${escapeHtml(val)}</td>`
        ).join('')}
      </tr>
    `).join('');

    MySwal.fire({
      title: 'Data Preview',
      html: `
        <div style="max-height:300px; overflow-y:auto; width:100%;">
          <table style="width:100%; border-collapse:collapse; font-size:12px;">
            <thead><tr>${tableHeaders}</tr></thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>
        <div style="margin-top:16px; text-align:right;">
          <button id="uploadToDB" style="
            background-color: #121314;
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 14px;
            border: none;
            cursor: pointer;
          ">
            Bulk update on DB
          </button>
        </div>
      `,
      showConfirmButton: false,
      width: '1100px',
      didOpen: () => {
        const btn = document.getElementById('uploadToDB');
        btn.onclick = () => {
          // Confirmation before upload
          Swal.fire({
            title: 'Confirm Upload',
            text: `Ensure that billing is not ongoing while uploading ${data.length} records to the database.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, upload to server',
            cancelButtonText: 'Cancel',
          }).then((result) => {
            if (result.isConfirmed) {
              plsWait('Uploading to server...');
              uploadToDB(uploadData);
            }
          });
        };
      },
    });
  };

  const uploadToDB = async (data) => {
    setIsLoading(true);
    try {
      const res = await api.post(`/api/updatebulk/${WHID}`, { data, collectionName });

      if (!res.ok) throw new Error(res.error || 'Upload failed');

      SuccessToast(res.data?.message);
    } catch (err) {
      ErrorMessage(err.message);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  };

  const downloadProductTemplate = () => {
    try {
      if (products.length === 0) throw new Error("No products are available for the template.");
      const priceLists = getPriceListDefinitions(products);
      const headers = getProductTemplateHeaders(priceLists);
      const rows = products.map((product) => {
        const row = {
          id: String(product._id || ""),
          Name: product.Name ?? "",
          Pieces: product.Pieces ?? 1,
          category: product.category ?? "",
          sub_category: product.Subcategory ?? "",
        };
        const productPriceLists = new Map(
          (Array.isArray(product.PriceLists) ? product.PriceLists : []).map((priceList) => [String(priceList.Name), priceList])
        );
        priceLists.forEach(({ key, name }) => {
          const priceList = productPriceLists.get(name) || {};
          row[key] = priceList.price ?? "";
          row[`${key}_VAT`] = priceList.vat ?? "";
          row[`${key}_Promo`] = priceList.promo ?? "";
          row[`${key}_PromoDate`] = priceList.PromoDate
            ? new Date(priceList.PromoDate).toISOString().slice(0, 10)
            : "";
        });
        return row;
      });
      const worksheet = XLSX.utils.json_to_sheet(rows, { header: headers });
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ProductBulkUpdate");
      XLSX.writeFile(workbook, "RecommendedProductBulkUpdate.xlsx");
    } catch (error) {
      ErrorMessage(error.message || "Failed to create the product template.");
    }
  };

  return (
    <div className="w-full space-y-3" title="Ensure to use recommended upload template">
      <input
        type="file"
        accept={collectionName === "product" ? ".xlsx" : ".xlsx, .xls, .csv"}
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition w-full"
        aria-label="Upload bulk file"
        disabled={collectionName === "product" && products.length === 0}
      >
        <CloudArrowUpIcon className="h-5 w-5" />
        Bulk Update {collectionName} records
      </button>

      {collectionName === "product" && (
        <button
          onClick={downloadProductTemplate}
          className="flex items-center text-xs gap-3 p-3 rounded-md hover:bg-gray-700 transition w-full"
          aria-label="Download recommended product bulk-update template"
          disabled={products.length === 0}
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          Download Recommended Template
        </button>
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
};

export default BulkUpdate;
