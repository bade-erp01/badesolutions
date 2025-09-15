"use client";

import { mutate } from "swr"; // make sure this is imported
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import Swal from "sweetalert2";
import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import Image from "next/image";
import Footer2 from "@/app/Components/Footer2";
import {
  totalInWords,
  Encrypt,
  EXPRESS_PRIVATE_URL,
} from "../../../../../../../../Functions/Functions";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
} from "../../../../../../../../Functions/Mics";
import { useRouter } from "next/navigation";
import {
  TrashIcon,
  PrinterIcon,
  ShoppingCartIcon,
  PlusIcon,
} from "@heroicons/react/24/solid";

export default function DraftInvoicePage({
  Business,
  customer,
  Whouse,
  bill,
  products,
  user,
}) {
  // Use useState to store products
  const [inputValue, setInputValue] = useState("");
  const [productList, setProductList] = useState(products);
  // const [qty,setQty] = useState('')
  const router = useRouter();

  useEffect(() => {
    Swal.close();
  }, []);

  // update discount of draft
  const updateDiscount = async (billId, value) => {
    try {
      // plsWait("Updating Discount Received"); // starts spinner or loading indicator

      const url = `${EXPRESS_PRIVATE_URL}/${
        Business.companyName
      }/Draft/discount/update?user=${Encrypt(user._id)}`;

      const response = await fetch(url, {
        body: JSON.stringify({ billId, value }),
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.message) {
        SuccessToast(result.message); // toast or alert
        router.refresh(); // refresh the page to see changes
      } else {
        throw new Error(result.error || "Something went wrong.");
      }
    } catch (error) {
      ErrorMessage(
        error.message || "Network or server error. Please try again."
      );
    }
  };

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
      plsWait("Setting things up ⌛...");
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // 🖼️ Logo Image
      if (business.companyLogo) {
        try {
          const logo = await loadImageAsDataURL(Business.companyLogo);
          doc.addImage(logo, "JPEG", 10, 10, 40, 30);
        } catch (err) {
          console.warn("Logo failed to load");
        }
      }

      // 🏢 Business Info
      const rightX = pageWidth - 10;
      doc.setFontSize(16).setFont("helvetica", "bold");
      doc.text(business.companyName || "", rightX, 20, { align: "right" });

      doc.setFontSize(10).setTextColor(0, 0, 0);
      doc.text(business.shopAddress.toLowerCase() + " " + business.companyState.toLowerCase() + " " + business.companyCity.toLowerCase() || "[Your Business Address]", rightX, 26, {
        align: "right",
      });
      doc.text(business.email || "", rightX, 32, { align: "right" });
      doc.text(`(${business.Tel}) ${business.Tel}`, rightX, 38, {
        align: "right",
      });
      doc.text(`${bill.billStatus} By: ${bill.RaiseBy || ""}`, rightX, 44, {
        align: "right",
      });

      // 🔳 QR Code
      try {
        const qrDataURL = await QRCode.toDataURL(
          "https://badesolutions.com.ng"
        );
        doc.addImage(qrDataURL, "PNG", pageWidth - 40, 50, 30, 30);
      } catch (err) {
        console.warn("QR code failed to generate");
      }

      // 🚚 Customer Info
      doc.setFontSize(15).setTextColor(255, 0, 0).setFont("helvetica", "bold");
      doc.text("QUOTATION", 10, 58);
      doc.setFont("helvetica", "bold").setTextColor(0, 0, 0).setFontSize(13);
      doc.text(`${bill.customerName?.toUpperCase() || ""}`, 10, 66);

      doc.setFontSize(10);
      doc.text(`Address: ${customer?.billingAddress || "N/A"}`, 10, 70);
      doc.text(`Phone: ${customer?.phone || "N/A"}`, 10, 74);
      doc.text(
        `Contact Person: ${
          customer?.contactPerson || bill.customerName || "N/A"
        }`,
        10,
        79
      );
      doc.text(`Download Date: ${moment().format("YYYY-MM-DD")}`, 10, 84);

      // 🧾 Bill Metadata (Optional Fields Could Be Re-enabled)
      autoTable(doc, {
        startY: 87,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1, overflow: "linebreak" },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });

      // 📊 Invoice Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 3,
        head: [
          ["#", "Product", "Code", "Price", "CASE", "PCS", "VAT", "Total"],
        ],
        body: bill.orders.map((ord, i) => [
          i + 1,
          `${ord.item?.Name}`,
          ord.item?.ACDcode || "N/A",
          ord.priceListPrice || 0,
          ord.Qty || 0,
          ord.pcsReq || 0,
          ord.item?.VAT?.$numberDecimal || ord.item?.VAT || 0,
          ord.total.toFixed(2) || 0,
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
      });

      // 💰 Summary Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 3,
        tableWidth: 76,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          ["Tax Rate", `${bill.taxRate.toFixed(2) || 0} (inc in sub.)`],
          ["Subtotal", bill.subTotal.toFixed(2) || 0],
          ["Discount", bill.discount.toFixed(2) || 0],
          ["Total Due", bill.grandTotal.toFixed(2) || 0],
        ],
        theme: "grid",
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });

      // ✍️ Signatures
      const signatureY = doc.lastAutoTable.finalY + 20;
      doc.setFontSize(10);
      doc.text(
        `${totalInWords(bill.grandTotal, business.currency?.currency)}`,
        10,
        signatureY
      );
      doc.text("Authorized Signatures", 10, signatureY + 15);
      doc.text(
        "Customer Sign & Date _______________________________",
        10,
        signatureY + 22
      );
      doc.text(
        `${business.companyName.toLowerCase()} _______________________________`,
        10,
        signatureY + 30
      );
      if (business.invoicePolicy)
        doc.text(business.invoicePolicy, 10, signatureY + 40);

      // 📎 Footer
      doc.setFontSize(9);
      doc.text(
        `This ${bill.billStatus} is generated on Business Automated Dynamic Enterprise`,
        10,
        280
      );

      // 📄 Page Numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, 290, {
          align: "right",
        });
      }

      // 📥 Output
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
      console.error("PDF generation failed:", error);
      Swal.close();
    }
  };

  // Optimized product selection handler
  const handleProductSelection = async (productId) => {
    try {
      // return
      plsWait("Adding product...");
      // find the product and return the id
      const cleanedProducts = productList.find((product) => {
        return product.ADCcode === productId;
      });

      const url = `${EXPRESS_PRIVATE_URL}/${Business.companyName}/Draft/add/order?order_id=${bill._id}&productId=${productId}&priceList=${customer.priceList}`;
      const res = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ product: cleanedProducts._id }), // Ensure it's sent as an object
      });
      const data = await res.json();
      if (data.message) {
        SuccessToast(data.message);
        // Use Next.js router.reload() instead of window.location.reload()
        router.refresh();
      } else {
        throw new Error(data.error || "Unknown error occurred.");
      }
    } catch (error) {
      ErrorMessage(error.message);
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

      const url = `${EXPRESS_PRIVATE_URL}/${
        Business.companyName
      }/Draft/salesDelete?id=${Encrypt(bill._id)}&user=${Encrypt(user._id)}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);
        setTimeout(() => {
          router.back();
        }, 1200);
      } else {
        ErrorMessage(data.error || "Failed to delete draft invoice.");
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
    companyName
  ) => {
    try {
      plsWait('Updating cart...');

      const url = `${EXPRESS_PRIVATE_URL}/${companyName}/Invoice/Cart/Update?user=${Encrypt(
        userId
      )}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineId, value , toUpdate, billId, storeId }),
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);

        // ✅ Revalidate the invoice data (instead of reload)
        mutate(`/api/storeApi/invoice/${billId}`);
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
      plsWait("Please wait while i process your request. This should only take a bit. Do not reload this page...");

      const response = await fetch(
        `${EXPRESS_PRIVATE_URL}/${
          Business.CompanyName
        }/wareHouse/Bill?user=${Encrypt(user._id)}&ops=${Encrypt(userInput)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Business._id}`,
          },
          body: JSON.stringify({ billId: bill._id, customer: customer._id }),
        }
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

      const url = `${EXPRESS_PRIVATE_URL}/${
        Business.companyName
      }/Draft/delete/order?user=${Encrypt(user._id)}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lineId, billId: bill._id }),
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);

        // ✅ Refresh invoice data instead of reloading the page
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
  const cust = customer;
  const isCancelled = Singlebill?.billStatus?.toLowerCase() === "cancelled";

  return (
    <>
      <Nav1
        user={userInfo.user}
        business={userInfo.business}
        page={`${Singlebill.billStatus.toUpperCase()} / ${
          Singlebill.billReferenceNo
        } /${Singlebill.invoicelocation}`}
      />
      <div className="max-w-5xl mx-auto px-6 py-10 bg-white shadow-2xl text-xs m-6 animate__animated animate__fadeIn invoicecontainer border border-gray-200">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <span
            className={`px-5 py-1.5 rounded-full font-semibold text-base tracking-wide shadow-sm border ${
              isCancelled
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-indigo-50 text-indigo-700 border-indigo-200"
            }`}
          >
            {Singlebill.billStatus}
          </span>
        </div>

        {/* Company + Customer Info */}
        <div className="flex flex-wrap justify-between gap-10 border-t border-b py-8 mb-6">
          <div className="flex items-start gap-6 w-full md:w-auto">
            <Image
              src={userInfo.business.companyLogo}
              width={90}
              height={90}
              alt="logo"
            />
            <div className="text-sm text-gray-700 space-y-1">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {userInfo.business.companyName}
              </h3>
              <p className="text-gray-500">{userInfo.business.email}</p>
              <p className="text-gray-500">{userInfo.business.Tel}</p>
              <p className="text-gray-500">{userInfo.business.Address}</p>
              <p className="text-gray-500">{userInfo.business.CompanyCity}</p>
              <h2
                className={`mt-3 font-bold text-base ${
                  isCancelled ? "text-red-600" : "text-gray-800"
                }`}
              >
                {Singlebill.billStatus.toUpperCase()} /{" "}
                {Singlebill.billReferenceNo} / {Singlebill.invoicelocation}
              </h2>
              <h2 className=" mb-2 text-lg font-bold text-indigo-700 tracking-wide">
                {Singlebill.WayBillNo}
              </h2>
            </div>
          </div>

          <div className="text-right text-sm text-gray-700 space-y-1 w-full md:w-auto min-w-[220px]">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {Singlebill.customerName?.toUpperCase()}
            </h3>
            <p>
              <span className="mr-1">📞</span>
              <a
                href={`tel:${cust.phone}`}
                className="hover:underline text-indigo-700"
              >
                {cust.phone}
              </a>
            </p>
            <p>
              <span className="mr-1">✉️</span>
              <a
                href={`mailto:${cust.Email}`}
                className="hover:underline text-indigo-700"
              >
                {cust.Email}
              </a>
            </p>
            <p>
              <span className="mr-1">🗓️</span>
              {new Date(Singlebill.startDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          {/* CheckOut Button */}
          <div className="flex justify-evenly items-center gap-4">
            {user._id === Singlebill.invoicerId && user.raiseInvoice &&
              Singlebill.billStatus.toLowerCase() === "draft" &&
              moment(Singlebill.startDate).isSame(moment(), "day") && (
                <button
                  title="Process this draft to order"
                  onClick={processInvoice}
                  className="group inline-flex items-center justify-center gap-3 px-3 py-3 rounded-lg bg-green-300 text-white font-semibold hover:shadow-xl hover:bg-green-500 transition duration-200 ease-in-out"
                >
                  <ShoppingCartIcon className="h-6 w-6 text-gray-500" />
                  <span className="text-gray-500">CheckOut Draft</span>
                </button>
              )}

            {user._id === Singlebill.invoicerId && user.raiseInvoice &&
              Singlebill.billStatus.toLowerCase() === "draft" && (
                <button
                  title="Delete this draft"
                  onClick={deleteDraftInvoice}
                  className="inline-flex items-center justify-center px-3 py-3 rounded-lg  text-white font-semibold hover:shadow-xl hover:bg-red-100 transition duration-200 ease-in-out"
                >
                  <TrashIcon className="h-6 w-6 text-red-500" />
                  {/* <span className="text-gray-500">Delete</span> */}
                </button>
              )}
          </div>

          {/* Print Button */}
          {bill.billStatus.toLowerCase() === "draft" && (
            <button
              title={`Download and Print ${Singlebill.billStatus}`}
              onClick={() => generatePdf(Business, customer, bill)}
              className="inline-flex items-center justify-center px-3 py-3 rounded-lg  text-white font-semibold hover:shadow-xl hover:bg-blue-100 transition duration-200 ease-in-out"
            >
              <PrinterIcon className="h-6 w-6 text-gray-500" />
              {/* <span>Print Quotation</span> */}
            </button>
          )}
        </div>

        {/* Print Button */}
        {/* Product Table */}
        <div className="overflow-x-auto max-h-100 overflow-y-auto rounded-lg border border-gray-200 bg-white mb-8">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                {[
                  "Product",
                  "Photo",
                  // "Trace",
                  "Code",
                  "Case",
                  "PCS",
                  "Price",
                  "Promo",
                  "VAT",
                  `Total (${userInfo.business.currency?.currency.Symbol})`,
                  " ",
                ].map((th, i) => (
                  <th
                    key={i}
                    className="px-4 py-3 font-semibold whitespace-nowrap text-center"
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
                  <td className="flex-2 px-4 py-2 text-indigo-700 font-medium text-center">
                    <a
                      href={`/${userInfo.business.companyName}/Product/${bill.item._id}`}
                      className="hover:underline"
                    >
                      {bill.item.Name}
                    </a>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Image
                      src={
                        bill.item.image || bill.item.QrCode || "/preview.png"
                      }
                      width={38}
                      height={38}
                      alt="preview"
                      className="rounded-md border border-gray-200"
                    />
                  </td>
                  {/* <td className="px-4 py-2 text-center">{bill.returnId}</td> */}
                  <td className="px-4 py-2 text-center">{bill.item.ACDcode}</td>
                  <td className="px-4 py-2 text-center">
                    {user._id === Singlebill.invoicerId && Singlebill.billStatus.toLowerCase() === "draft" ? (
                      <input
                        type="number"
                        defaultValue={bill.Qty || 0}
                        onChange={(e) =>
                          handleQtyChange(
                            bill._id, // lineId
                            e.target.value, // new value inputValue, setInputValue
                            "Qty", // toUpdate
                            Singlebill._id, // billId
                            bill.storeProductId, // storeId
                            userInfo.user._id, // userId
                            userInfo.business.companyName // companyName
                          )
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                      />
                    ) : (
                      bill.Qty
                    )}
                  </td>

                  <td className="px-4 py-2 text-center">
                    {Business.allowSkuSplitting && user._id === Singlebill.invoicerId &&
                    Singlebill.billStatus.toLowerCase() === "draft" ? (
                      <input
                        type="number"
                        value={bill.pcsReq || 0}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                        onChange={(e) =>
                          handleQtyChange(
                            bill._id, // lineId
                            e.target.value, // new value
                            "pcs", // toUpdate
                            Singlebill._id, // billId
                            bill.storeProductId, // storeId
                            userInfo.user._id, // userId
                            userInfo.business.companyName // companyName
                          )
                        }
                      />
                    ) : (
                      bill.pcsReq || 0
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {Business.allowPriceChangeOnInvoice &&
                    Singlebill.billStatus.toLowerCase() === "draft" ? (
                      <input
                        type="number"
                        value={bill.priceListPrice || 0}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                        onChange={(e) =>
                          handleQtyChange(
                            bill._id, // lineId
                            e.target.value, // new value
                            "priceListPrice", // toUpdate
                            Singlebill._id, // billId
                            bill.storeProductId, // storeId
                            userInfo.user._id, // userId
                            userInfo.business.companyName // companyName
                          )
                        }
                      />
                    ) : (
                      bill.priceListPrice
                    )}
                  </td>

                  <td className="px-4 py-2 text-center">
                    {userInfo.business.currency?.currency.Symbol}
                    {bill.promotionData || 0}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {bill.item.VAT.$numberDecimal}
                  </td>
                  <td className="px-4 py-2 font-bold text-right">
                    {userInfo.business.currency?.currency.Symbol}
                    {bill.total?.toFixed(2)}
                  </td>
                  <td>
                    {user._id === Singlebill.invoicerId && user.raiseInvoice &&
                      Singlebill.billStatus.toLowerCase() === "draft" && (
                        <span
                          title={`Click to remove ${bill.item?.ADCcode?.toLowerCase()} from cart`}
                        >
                          <button onClick={() => removeLineItem(bill._id)}>
                            <TrashIcon className="w-5 h-5 text-red-500" />
                          </button>
                        </span>
                      )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {user._id === Singlebill.invoicerId &&  Singlebill.billStatus.toLowerCase() === "draft" && (
          <div className="mb-8">
            {/* Dropdown for small screens */}
            <div className="block md:hidden">
              <label
                htmlFor="productDropdown"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Select Product
              </label>
              <select
                onChange={(e) => {
                  handleProductSelection(e.target.value);
                }}
                id="productDropdown"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value={""}>Choose...</option>
                {(() => {
                  const orderedProductCodes = Singlebill.orders.map(
                    (order) => order.item?.ADCcode
                  );
                  const availableProducts = productList.filter(
                    (product) => !orderedProductCodes.includes(product.ADCcode)
                  );
                    return availableProducts.map((product) => (
                    <option key={product._id} value={product.ADCcode}>
                      {product.productName} Case:{product.currentQty} Pcs:{product.pcs}
                    </option>
                    ));
                  })()}
                  </select>
                </div>

                {/* Datalist for medium and larger screens */}
                <div className="hidden md:flex flex-col items-start justify-center space-y-4">
                  <label
                  htmlFor="productDatalist"
                  className="text-sm font-medium text-gray-700"
                  >
                  Search Product
                  </label>

                  <div className="flex items-center space-x-2">
                  <input
                    onChange={(e) => {
                    const val = e.target.value;
                    setInputValue(val);

                    // If user types or selects an exact ADCcode or exact product name,
                    // automatically add it and clear the input.
                    const orderedProductCodes = Singlebill.orders.map(
                      (order) => order.item?.ADCcode
                    );
                    const availableProducts = productList.filter(
                      (product) => !orderedProductCodes.includes(product.ADCcode)
                    );

                    const matched =
                      availableProducts.find(
                      (p) => p.ADCcode === val || p.productName === val
                      ) || null;

                    if (matched) {
                      // add product by ADCcode
                      handleProductSelection(matched.ADCcode);
                      setInputValue("");
                    }
                    }}
                    onKeyDown={(e) => {
                    // allow Enter to add typed ADCcode
                    if (e.key === "Enter") {
                      const trimmed = inputValue.trim();
                      if (trimmed !== "") {
                      handleProductSelection(trimmed);
                      setInputValue("");
                      }
                    }
                    }}
                    type="text"
                    value={inputValue}
                    list="productsList"
                    id="productDatalist"
                    className="w-72 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="Type to search products..."
                  />
                  </div>

                  <datalist id="productsList">
                  {(() => {
                    const orderedProductCodes = Singlebill.orders.map(
                    (order) => order.item?.ADCcode
                    );
                    const availableProducts = productList.filter(
                    (product) => !orderedProductCodes.includes(product.ADCcode)
                    );
                    return availableProducts.map((product) => (
                    <option key={product._id} value={product.ADCcode}>
                      {product.productName} Case:{product.currentQty} Pcs:{product.pcs}
                    </option>
                    ));
                  })()}
                  </datalist>
                </div>
                </div>
              )} 
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="bg-gradient-to-br from-white via-orange-50 to-white rounded-xl border border-orange-100 shadow p-6">
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
                <span>Discount Allowed:</span>
                {user._id === Singlebill.invoicerId && Singlebill.billStatus === "Draft" ? (
                  <input
                    type="number"
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                    value={Singlebill.discount || 0}
                    onChange={(e) =>
                      updateDiscount(
                        Singlebill._id,
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                ) : (
                  <strong>
                    {userInfo.business.currency?.currency.Symbol}
                    {Singlebill.discount.toFixed(2)}
                  </strong>
                )}
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

          {/* Words representation */}
          <div className="bg-white rounded-xl border border-gray-100 shadow p-6 text-gray-700 flex flex-col justify-between">
            <h3 className="text-lg font-bold mb-4">Total In Words</h3>
            <p className="italic text-base text-orange-700">
              {totalInWords(
                Singlebill.grandTotal,
                userInfo.business.currency?.currency
              )}
            </p>
          </div>
        </div>

        {/* Signature & T&C */}
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
            {/* Optional signature */}
            {/* <Image src="/QRBADE.png" width={150} height={150} alt="QR Code Signature" /> */}
          </div>
        </div>

        {/* Footer Reference */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-400 tracking-wide">
          {Singlebill.billStatus.toUpperCase()} / {Singlebill.billReferenceNo} /{" "}
          {Singlebill.invoicelocation}
        </div>
      </div>
      <Footer2 />
    </>
  );
}
