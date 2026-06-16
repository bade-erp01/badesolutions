"use client";

import { mutate } from "swr"; // make sure this is imported
import { useState, useEffect, Suspense } from "react";
import QRCode from "qrcode";
import Swal from "sweetalert2";
import Image from "next/image";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import {
  totalInWords,
  Encrypt,
  EXPRESS_PRIVATE_URL,
} from "../../../../../Functions/Functions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../Functions/Mics";
import { useRouter } from "next/navigation";
import {
  TrashIcon,
  PrinterIcon,
  ShoppingCartIcon,
} from "@heroicons/react/24/solid";

export default function DraftInvoicePage({
  Business,
  bill,
  products,
  user,
}) {
  // Use useState to store products
  const [inputValue, setInputValue] = useState("");
  // const [qty,setQty] = useState('')
  const router = useRouter();

  // check epirt date function
  const checkExpiryDate = (createdAt) => {
    try {
      // Expiry is 24 hours later
      const expiryTime = moment(createdAt).add(24, "hours");

      // Current time
      const now = moment();

      // Calculate time left
      const duration = moment.duration(expiryTime.diff(now));
      if (duration.asMilliseconds() <= 0) {
        return "⛔ Expired";
      } else {
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        const seconds = duration.seconds();
        return `⏳Expire in: ${hours}h ${minutes}m ${seconds}s`;
      }
    } catch (err) {
      return "";
    }
  };

  useEffect(() => {
    Swal.close();
  }, []);

  const createdAt = moment(bill.createdAt);
  const now = moment();
  const isOlderThan24Hours = now.diff(createdAt, "hours") < 24;

  const loadImageAsDataURL = async (src, watermarkText = "B.A.D.E") => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");

        // Draw image
        ctx.drawImage(img, 0, 0);

        // 💧 Add watermark (bottom right)

        ctx.font = "italic bold 16px 'Courier New'";
        ctx.textAlign = "center"; // Or "left" depending on your layout
        ctx.textBaseline = "bottom";
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Semi-transparent white
        ctx.globalAlpha = 0.5; // Semi-transparent watermark
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 10); // Centered horizontally, 10px from bottom

        // Convert to PNG
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Image loading failed"));
      img.src = src;
    });
  };

  // Dummy implementations for missing functions (replace with your actual implementations)
  const generatePdf = async (business, customer, bill) => {
    try {
      Swal.fire({
        title: "Setting things up ⌛...",
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // 🖼️ Logo on the Left, Business Info on the Right
      if (business.companyLogo) {
        try {
          const logo = await loadImageAsDataURL(business.companyLogo);
          doc.addImage(logo, "JPEG", 10, 12, 30, 30);
        } catch (err) {
          console.warn("Logo failed to load");
        }
      }

      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text(business.companyName || "", pageWidth - 10, 12, {
        align: "right",
      });

      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(
        `${business.shopAddress || ""}, ${business.companyState || ""}, ${business.companyCity || ""}`,
        pageWidth - 10,
        20,
        { align: "right" },
      );
      doc.text(business.email || "", pageWidth - 10, 26, { align: "right" });
      doc.text(`Tel: ${business.Tel || "N/A"}`, pageWidth - 10, 32, {
        align: "right",
      });

      let currentY = 50;

      // 🚚 Customer Info + 🔳 QR Code in same row
      doc.setFontSize(15).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text("QUOTATION", 10, currentY);
      currentY += 10;

      // Left Column: Customer Info
      doc.setFont("helvetica", "bold").setTextColor(0, 0, 0).setFontSize(13);
      doc.text(`${bill.customerName?.toUpperCase() || ""}`, 10, currentY);
      doc.setFontSize(8).setTextColor(0, 0, 0);
      doc.text(`${customer?.billingAddress || "N/A"}`, 10, currentY + 6);
      doc.text(`${customer?.phone || "N/A"}`, 10, currentY + 12);
      doc.text(
        `Contact Person: ${customer?.contactPerson || bill.customerName || "N/A"}`,
        10,
        currentY + 18,
      );
      doc.text(
        `Download Date: ${moment().format("YYYY-MM-DD")}`,
        10,
        currentY + 24,
      );

      // Right Column: QR Code
      try {
        const qrDataURL = await QRCode.toDataURL(
          "https://badesolutions.com.ng",
        );
        doc.addImage(qrDataURL, "PNG", pageWidth - 40, currentY, 35, 35);
      } catch (err) {
        console.warn("QR code failed to generate");
      }

      currentY += 30;

      // 🧾 Bill Metadata (Placeholder for future use)
      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      // 📊 Invoice Table
      autoTable(doc, {
        startY: currentY,
        head: [
          [
            "#",
            "Product",
            "Code",
            "Price",
            "Promo",
            "CASE",
            "PCS",
            "VAT",
            "Total",
          ],
        ],
        body: bill.orders.map((ord, i) => [
          i + 1,
          ord.item?.Name || "N/A",
          ord.item?.ACDcode || ord.item?.ADCcode || "N/A",
          ord.priceListPrice || 0,
          ord.promotionData || 0,
          ord.Qty || 0,
          ord.pcsReq || 0,
          ord.item?.VAT?.$numberDecimal || ord.item?.VAT || 0,
          ord.total?.toFixed(2) || "0.00",
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      //  Summary Table
      autoTable(doc, {
        startY: currentY,
        tableWidth: 76,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          ["Tax Rate", `${bill.taxRate?.toFixed(2) || 0} (inc in sub.)`],
          ["Subtotal", bill.subTotal?.toFixed(2) || "0.00"],
          ["Discount", bill.discount?.toFixed(2) || "0.00"],
          ["Total Due", bill.grandTotal?.toFixed(2) || "0.00"],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      // Signatures
      doc.setFontSize(10);
      doc.text(
        `${totalInWords(bill.grandTotal, business.currency?.currency)}`,
        10,
        currentY,
      );
      currentY += 10;
      doc.text("Authorized signatories", 10, currentY);
      currentY += 10;
      doc.text(
        `${business.companyName.toLowerCase()} _______________________________`,
        10,
        currentY,
      );
      currentY += 10;
      doc.text(
        "Customer Sign & Date _______________________________",
        10,
        currentY,
      );
      currentY += 10;
      if (business.invoicePolicy) {
        doc.text(business.invoicePolicy, 10, currentY);
        currentY += 10;
      }

      // 📎 Footer
      doc.setFontSize(9);
      doc.text(
        `Kindly note that this ${bill.billStatus} is invalid after ${moment().format("l")}`,
        10,
        pageHeight - 20,
      );

      // 📄 Page Numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: "right" },
        );
      }

      // Output
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      const win = window.open(url, "_blank");

      if (win) {
        win.onload = () => {
          Swal.close();
          win.print();
        };
      } else {
        doc.save(`${bill.customerName || "invoice"}.pdf`);
        Swal.close();
      }
    } catch (error) {
      Swal.close();
      console.error("Error generating PDF:");
    }
  };

  // Optimized product selection handler
  const handleProductSelection = async (productId) => {
    try {
      // return
      plsWait("Adding product...");
      // find the product and return the id
      const cleanedProducts = await products.find((product) => {
        return (
          product.item?.ACDcode === productId ||
          product.item?.ADCcode === productId
        );
      });

      if (!cleanedProducts) {
        throw new Error("Product not found");
      }

      const url = `${EXPRESS_PRIVATE_URL}/api/Draft/add/order/${Encrypt(bill._id)}?productId=${productId}&priceList=${Singlebill.customer.priceList}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`
        },
        body: JSON.stringify({ product: cleanedProducts.storeId }), // Ensure it's sent as an object
      });
      const data = await res.json();
      if (data.message) {
        SuccessToast(data.message);
        setInputValue("");
        // Use Next.js router.reload() instead of window.location.reload()
        router.refresh();
      } else {
        throw new Error(data.error || "Unknown error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message);
      setInputValue("");
      router.refresh();
    }
  };

  // Delete draft invoice (optimized & Next.js compatible)
  const deleteDraftInvoice = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (!result.isConfirmed) {
        return;
      }
      plsWait("Deleting Requisition. Please wait.");
      const url = `${EXPRESS_PRIVATE_URL}/api/Draft/order/Delete/${Encrypt(bill._id)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          "idempotency-key": `delete-${bill._id}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`
        },
      });
      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);
        router.back();
      } else {
        ErrorMessage(data.error || "Failed to delete Requisition.");
        Swal.close();
        router.refresh();
      }
    } catch (error) {
      ErrorMessage(error.message || "Unexpected error occurred.");
      Swal.close();
      router.refresh();
    }
  };

  const handleQtyChange = async (
    lineId,
    value,
    toUpdate,
    billId,
    storeId,
    userId,
  ) => {
    try {
      plsWait("Updating cart...");

      const url = `${EXPRESS_PRIVATE_URL}/api/Invoice/Cart/Update?user=${Encrypt(
        userId,
      )}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`
        },
        body: JSON.stringify({ lineId, value, toUpdate, billId, storeId }),
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);

        // Revalidate the invoice data (instead of reload)
        mutate(`${EXPRESS_PRIVATE_URL}/api/Invoice/${Encrypt(billId)}`);
        router.refresh();
      } else {
        throw new Error(data.error || "An unknown error occurred.");
      }
    } catch (err) {
      ErrorMessage(err.message);
      router.refresh();
    }
  };

  // processInvoice

  let isProcessing = false;

  const processInvoice = async () => {
    if (isProcessing) return; // Prevent multiple triggers
    isProcessing = true;

    try {
      const { value: userInput } = await Swal.fire({
        title: "Enter your Operational Code",
        input: "password",
        inputLabel: "This action will Adjust Inventory of Billing location.",
        inputPlaceholder: "Provide OPS CODE",
        inputAutoFocus: true,
        showCancelButton: true,
        inputValidator: (value) => {
          if (!value) {
            return "You need to Enter your code!";
          }
        },
      });

      if (!userInput) {
        isProcessing = false;
        return;
      }

      // loading indicator
      plsWait(
        "Please wait while i process your request. This should only take a bit. Do not reload this page...",
      );

      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/wareHouse/Bill?user=${Encrypt(user._id)}&ops=${Encrypt(userInput)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            access: `${Encrypt(user._id)}`,
            "idempotency-key": `invoice-${bill._id}`,
            sessionKey: `Bearer ${Encrypt(user.SessionId)}`
          },
          body: JSON.stringify({
            billId: bill._id,
            customer: Singlebill.customer._id,
            restriction: userInfo.business?.InvoiceRestriction,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        SuccessToast(data.message || "Operation completed successfully!");
        router.refresh();
      } else {
        throw new Error(data.error || "An error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message);
      router.refresh();
    } finally {
      isProcessing = false; // Reset flag after completion
    }
  };

  // delete line items from ivoice
  const removeLineItem = async (lineId) => {
    try {
      plsWait("Removing item from order...");

      const url = `${EXPRESS_PRIVATE_URL}/api/Draft/delete/order?user=${Encrypt(user._id)}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
          access: `${Encrypt(user._id)}`,
          sessionKey: `Bearer ${Encrypt(user.SessionId)}`
        },
        body: JSON.stringify({ lineId, billId: bill._id }),
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);

        // Refresh invoice data instead of reloading the page
        // mutate(`/api/invoice/${billId}`);
        router.refresh();
      } else {
        ErrorMessage(data.error || "Something went wrong.");
        router.refresh();
      }
    } catch (err) {
      ErrorMessage("Unexpected error occurred.");
      router.refresh();
    }
  };

  // Use props instead of undefined variables
  const userInfo = {
    user: user,
    business: Business,
  };
  const Singlebill = bill;
  const isCancelled = Singlebill?.billStatus?.toLowerCase() === "cancelled";

  return (
    <Suspense fallback={<SuspenenseFallBack pagedata={"Requisition"} />}>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 bg-white shadow-2xl text-xs m-6 animate__animated animate__fadeIn invoicecontainer border border-gray-200">
        <div className="grid gap-3 sm:flex sm:items-center sm:justify-between mb-8">
          <span
            className={`inline-flex items-center px-4 py-2 rounded-full font-semibold text-sm sm:text-base tracking-wide shadow-sm border ${
              isCancelled
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            {Singlebill.billStatus}
          </span>
          <div className="text-left sm:text-right text-xs sm:text-sm text-gray-900 tracking-tight">
            Created on:{" "}
            <span className="font-medium">
              {moment(Singlebill.createdAt).format(
                "dddd DD MMMM YYYY [at] hh:mm A",
              )}
            </span>
          </div>
        </div>

        {/* Company + Customer Info */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr] border-t border-b py-8 mb-6">
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 bg-white">
                <Image
                  src={userInfo.business.companyLogo}
                  width={90}
                  height={90}
                  alt="logo"
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="min-w-0 space-y-1 text-sm text-gray-700">
                <h3 className="textsm font-extrabold text-gray-900 tracking-tight truncate">
                  {Singlebill.customerName?.toUpperCase()}
                </h3>
                <p className="truncate">
                   <a
                    href={`mailto:${Singlebill.customer.Email}`}
                    className="hover:underline truncate"
                  >
                    {Singlebill.customer.Email || "N/A"}
                  </a>
                </p>
                <p>{Singlebill.customer.phone}</p>
                <p className="truncate">{Singlebill.customer.billingAddress?.slice(0, 80)}</p>
                <p>{moment(Singlebill.startDate).format("YYYY-MM-DD")}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            {((!userInfo.business.InvoiceRestriction &&
              user._id === Singlebill.invoicerId &&
              user.raiseInvoice &&
              Singlebill.billStatus.toLowerCase() === "requisition") ||
              (userInfo.business.InvoiceRestriction &&
                user._id === Singlebill.invoicerId &&
                user.raiseInvoice &&
                Singlebill.billStatus.toLowerCase() === "requisition" &&
                isOlderThan24Hours)) &&
              Singlebill.orders.length > 0 && (
                <button
                  title="Process this Requisition to Draft"
                  onClick={processInvoice}
                  className="w-full md:w-auto px-5 py-2 rounded-md font-semibold text-base shadow border border-green-500 bg-green-600 text-white inline-flex items-center justify-center hover:bg-green-700 transition duration-200 ease-in-out"
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  <span>Checkout Cart</span>
                </button>
              )}

            {user._id === Singlebill.invoicerId &&
              user.raiseInvoice &&
              Singlebill.billStatus.toLowerCase() === "requisition" && (
                <button
                  title="Delete this Requisition"
                  onClick={deleteDraftInvoice}
                  className="w-full md:w-auto px-5 py-2 rounded-md font-semibold text-base inline-flex items-center justify-center bg-red-600 text-white hover:bg-red-700 transition duration-200 ease-in-out"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  <span>Delete</span>
                </button>
              )}
          </div>

          {/* Print Button */}
          {bill.billStatus.toLowerCase() === "requisition" && (
            <button
              title={`Download and Print ${Singlebill.billStatus}`}
              onClick={() => generatePdf(Business, Singlebill.customer, bill)}
              className="w-full md:w-auto px-5 py-2 rounded-md font-semibold text-base inline-flex items-center justify-center bg-gray-800 text-white hover:bg-gray-900 transition duration-200 ease-in-out"
            >
              <PrinterIcon className="h-5 w-5 mr-2" />
              <span className="whitespace-nowrap">Print</span>
            </button>
          )}
        </div>

        {/* Product Table */}
        <div className="rounded-sm border border-gray-200 bg-white mb-8 overflow-x-auto">
          <table className="min-w-[900px] w-full text-center">
            <thead className="bg-gray-50 text-gray-700 uppercase text-[10px] sm:text-xs">
              <tr>
                {[
                  "Product",
                  "Case",
                  "PCS",
                  "Price",
                  "Promo",
                  `Total`,
                  " ",
                ].map((th, i) => (
                  <th
                    key={i}
                    className={`px-4 py-3 font-semibold whitespace-nowrap text-center ${
                      (Singlebill.billStatus.toLowerCase() !== "requisition" || i === 7)
                        ? "hidden sm:table-cell"
                        : ""
                    }`}
                  >
                    {th}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {Singlebill.orders.map((bill) => (
                <tr
                  key={bill._id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="px-4 py-2 text-indigo-700 text-center text-xs">
                    {Singlebill.billStatus.toLowerCase() !== "requisition" ? (
                      <a
                      href={`/SalesPortal/Products/${Encrypt(
                        bill.item._id,
                      )}`}
                      className="hover:underline block truncate"
                    >
                      {bill.item.Name}
                    </a>
                    ):(
                      bill.item.Name
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {user._id === Singlebill.invoicerId &&
                    Singlebill.billStatus.toLowerCase() === "requisition" ? (
                      <input
                        type="number"
                        defaultValue={bill.Qty || 0}
                        min={0}
                        onBlur={(e) => {
                          let val = e.target.value;
                          if (val < 0) val = 0;
                          handleQtyChange(
                            bill._id,
                            val,
                            "Qty",
                            Singlebill._id,
                            bill.storeProductId,
                            userInfo.user._id,
                          );
                        }}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                      />
                    ) : (
                      bill.Qty
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {Business.allowSkuSplitting &&
                    user._id === Singlebill.invoicerId &&
                    Singlebill.billStatus.toLowerCase() === "requisition" ? (
                      <input
                        type="number"
                        defaultValue={bill.pcsReq || 0}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                        onBlur={(e) => {
                          let val = e.target.value;
                          if (val < 0) val = 0;
                          handleQtyChange(
                            bill._id,
                            val,
                            "pcs",
                            Singlebill._id,
                            bill.storeProductId,
                            userInfo.user._id,
                          );
                        }}
                      />
                    ) : (
                      bill.pcsReq || 0
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {userInfo.business.currency?.currency.Symbol}{bill.priceListPrice?.toFixed(2)}
                  </td>

                  <td className="px-4 py-2 text-center text-xs hidden sm:table-cell">
                    {userInfo.business.currency?.currency.Symbol}
                    {bill.promotionData || 0}
                  </td>
                  <td className="px-4 py-2 font-bold text-right text-xs">
                    {userInfo.business.currency?.currency.Symbol}
                    {bill.total?.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {user._id === Singlebill.invoicerId &&
                      user.raiseInvoice &&
                      Singlebill.billStatus.toLowerCase() === "requisition" && (
                        <button onClick={() => removeLineItem(bill._id)}>
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
            <caption className="text-sm font-medium text-gray-700 bg-gray-100 p-2 rounded" />
          </table>
        </div>

        {user._id === Singlebill.invoicerId && Singlebill.billStatus === "Requisition" && (
          <div className="mb-8">
            <div className="block md:hidden">
              <label
                htmlFor="productDropdown"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Select {products.length} Products
              </label>
              <select
                onChange={(e) => {
                  if (e.target.value !== "") {
                    handleProductSelection(e.target.value);
                  }
                }}
                id="productDropdown"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value={""}>Choose...</option>
                {products.map((product) => (
                  <option
                    key={product.item._id}
                    value={product.item.ACDcode || product.item.ADCcode}
                  >
                    {product.item.Name} [ Case:{product.Case} Pcs:{product.pcs}{" "}
                    ]
                  </option>
                ))}
              </select>
            </div>

            <div className="hidden md:flex flex-col items-start justify-center space-y-4">
              <label
                htmlFor="productDatalist"
                className="text-sm font-medium text-gray-700"
              >
                Search {products.length} Products
              </label>

              <div className="flex w-full max-w-xl items-center space-x-2">
                <input
                  type="text"
                  defaultValue={inputValue}
                  list="productsList"
                  id="productDatalist"
                  onBlur={(e) => {
                    const trimmedValue = e.target.value.trim();
                    setInputValue(trimmedValue);
                    if (trimmedValue !== "") {
                      handleProductSelection(trimmedValue);
                      setInputValue("");
                    }
                    e.target.value = "";
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  placeholder="Type to search products..."
                />
              </div>

              <datalist id="productsList">
                {products.map((product) => (
                  <option
                    key={product.item._id}
                    value={product.item.ACDcode || product.item.ADCcode}
                  >
                    {product.item.Name} [ Case:{product.Case} Pcs:{product.pcs}{" "}
                    ]
                  </option>
                ))}
              </datalist>
            </div>
          </div>
        )}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="bg-linear-to-br from-white via-orange-50 to-white rounded-xl border border-orange-100 shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">
              Summary
            </h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <strong>
                  {userInfo.business.currency?.currency.Symbol}
                  {Singlebill.subTotal.toFixed(2) -
                    Singlebill.taxRate.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Tax Rate:</span>
                <strong>
                  {userInfo.business.currency?.currency.Symbol}
                  {Singlebill.taxRate.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <strong>
                  {userInfo.business.currency?.currency.Symbol}
                  {Singlebill.shippingFee.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 border-t pt-2">
                <span>Grand Total:</span>
                <span>
                  {userInfo.business.currency?.currency.Symbol}
                  {Singlebill.grandTotal?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow p-6 text-gray-700 flex flex-col justify-between">
            <h3 className="text-lg font-bold mb-4">Total In Words</h3>
            <p className="italic text-base text-orange-700">
              {totalInWords(
                Singlebill.grandTotal,
                userInfo.business.currency?.currency,
              )}
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-md">
            <h4 className="font-semibold text-gray-700 mb-2">
              Terms & Conditions
            </h4>
            <p className="text-sm text-gray-500 whitespace-pre-line">
              {userInfo.business.invoicePolicy}
            </p>
          </div>
          <div className="text-right">
            <h4 className="font-semibold text-gray-700 mb-2">Issued by</h4>
            <p className="text-sm font-medium text-gray-800">
              {Singlebill.RaiseBy}
            </p>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-md text-gray-800 tracking-wide">
          {userInfo.business.InvoiceRestriction ? (
            <>{checkExpiryDate(Singlebill.createdAt)}</>
          ) : (
            <h2
              className={`mt-3 font-bold text-base ${
                isCancelled ? "text-red-600" : "text-gray-800"
              }`}
            >
              {Singlebill.billStatus.toUpperCase()} /{" "}
              {Singlebill.billReferenceNo} / {Singlebill.invoicelocation}
            </h2>
          )}
        </div>
      </div>
    </Suspense>
  );
}
