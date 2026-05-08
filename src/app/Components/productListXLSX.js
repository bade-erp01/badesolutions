"use client";

import React from "react";
import * as XLSX from "xlsx";
import {pricelistSetter} from "../../../Functions/Functions"
import Image from "next/image"



const ProductXLSXDownload = ({ productList  }) => {
  const handleDownload = () => {
    if (!Array.isArray(productList) || productList.length === 0) {
      alert("No products available");
      return;
    }

    /**
     * Collect all unique price list names
     */
    const allPriceListNames = new Set();

    productList.forEach((product) => {
      if (Array.isArray(product.PriceLists)) {
        product.PriceLists.forEach((pl) => {
          if (pl?.Name) {
            const key = pl.Name.trim().replace(/\s+/g, "_");
            allPriceListNames.add(key);
          }
        });
      }
    });
    const priceListColumns = Array.from(allPriceListNames);

    /**
     * Build XLSX rows
     */
    const rows = productList.map((product) => {
      const base = {
        id: product?._id || "",
        Name: product?.Name || "",
        Description: product?.Description || "",
        Category: product?.category || "",
        Subcategory:
          product?.Subcategory ||
          product?.sub_category ||
          "",
        Manufacturer: product?.Manufacturer || "",
        Code:
          product?.ADCcode ||
          product?.ACDcode ||
          "",
        Sales_count: product?.TotalSale || 0,
        Pieces: product?.Pieces || 0,
        Buying_Price: product?.BuyingPrice || 0,
        Manufacture_code: product?.Manufacture_code || "",
        VAT:
          typeof product?.VAT === "object"
            ? product?.VAT?.$numberDecimal || 0
            : product?.VAT || 0,
        FOC: product?.isAservice ? "Yes" : "No",
      };

      /**
       * Initialize all dynamic price list fields
       */
      const dynamicPriceLists = {};

      priceListColumns.forEach((name) => {
        dynamicPriceLists[name] = "";
        dynamicPriceLists[`${name}_VAT`] = "";
        dynamicPriceLists[`${name}_Promo`] = "";
        dynamicPriceLists[`${name}_PromoDate`] = "";
      });

      /**
       * Fill actual values
       */
      if (Array.isArray(product.PriceLists)) {
        product.PriceLists.forEach((pl) => {
          if (!pl?.Name) return;

          const key = pl.Name.trim().replace(/\s+/g, "_");

          dynamicPriceLists[key] = pl?.price ?? "";
          dynamicPriceLists[`${key}_VAT`] = pl?.vat ?? "";
          dynamicPriceLists[`${key}_Promo`] = pl?.promo ?? "";
          dynamicPriceLists[`${key}_PromoDate`] = pl?.PromoDate ?? "";
        });
      }

      return {
        ...base,
        ...dynamicPriceLists,
      };
    });

    /**
     * Create worksheet
     */
    const worksheet = XLSX.utils.json_to_sheet(rows);

    /**
     * Auto column sizing
     */
    const columnWidths = Object.keys(rows[0] || {}).map((key) => ({
      wch: Math.max(key.length + 5, 20),
    }));

    worksheet["!cols"] = columnWidths;

    /**
     * Create workbook
     */
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Products"
    );

    /**
     * Download file
     */
    XLSX.writeFile(
      workbook,
      `products_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  return (
    <button
      onClick={handleDownload}
      className="w-full flex  text-black font-bold items-center bg-gray-200 gap-3 text-xs p-3 rounded-md hover:bg-gray-400 transition"
    >
     <Image src={`https://img.icons8.com/color/48/microsoft-excel-2025.png`}
      alt='Download icon'
      width={25}
      height={25}
      priority={true}
      quality={100}
      />
      Export Products list
    </button>
  );
};

export default ProductXLSXDownload;