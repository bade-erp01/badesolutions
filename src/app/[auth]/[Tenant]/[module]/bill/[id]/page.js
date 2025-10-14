"use client";
import QRCode from "qrcode";
import { showDeliveryModal } from "@/app/Components/Delivery";
import { React, useState } from "react";
import Swal from "sweetalert2";
import Image from "next/image";
import Footer2 from "@/app/Components/Footer2";
import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import {
  totalInWords,
  EXPRESS_PRIVATE_URL,
} from "../../../../../../../Functions/Functions";
import {
  Encrypt,
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../../../Functions/Mics";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import axios from "axios"
import moment from "moment";
import { useRouter, useParams } from "next/navigation";
import {
  AtSymbolIcon,
  ArrowPathRoundedSquareIcon,
  PrinterIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/solid";

export default function InvoicePage({
  userInfo,
  SinglebillItem,
  customerList,
}) {
  const Router = useRouter();
  const path = useParams();
  const [expanded, setExpanded] = useState(false);
  const [cust] = useState(customerList);
  const [Singlebill] = useState(SinglebillItem);
  const isCancelled = Singlebill.billStatus?.toUpperCase() === "CANCELLED";

  // 🛠️ Safe image loader as Data URL
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
        ctx.fillStyle = "rgba(109, 107, 107, 0.59)"; // Semi-transparent white
        ctx.globalAlpha = 0.5; // Semi-transparent watermark
        ctx.fillText(watermarkText, canvas.width / 2, canvas.height - 10); // Centered horizontally, 10px from bottom

        // Convert to PNG
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Image loading failed"));
      img.src = src;
    });
  };

  // 📄 Full PDF generator
  const generatePdf = async (business, customer, bill) => {
    try {
      plsWait("Setting things up, Ensure your printer is connected ⌛...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      let currentY = margin;

      // 🖼️ Logo
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
        `${business.shopAddress || ""}, ${business.companyState || ""}, ${
          business.companyCity || ""
        }`,
        pageWidth - 10,
        20,
        { align: "right" }
      );
      doc.text(business.email || "", pageWidth - 10, 26, { align: "right" });
      doc.text(`Tel: ${business.Tel || "N/A"}`, pageWidth - 10, 32, {
        align: "right",
      });

      currentY = 50;

      // 🚚 Customer Info + 🔳 QR Code in same row
      doc.setFontSize(17).setTextColor(0, 0, 0).setFont("helvetica", "bold");
      doc.text(
        `${bill.billStatus?.slice(0, 3).toUpperCase()}/${
          bill.billReferenceNo
        }/${bill.invoicelocation}`,
        10,
        currentY
      );
      currentY += 10;

      // Left Column: Customer Info
      doc.setFont("helvetica", "bold").setTextColor(0, 0, 0).setFontSize(13);
      doc.text(`${bill.customerName?.toUpperCase() || ""}`, 10, currentY);
      doc.setFontSize(10);
      doc.text(
        `Address: ${customer?.billingAddress || "N/A"}`,
        10,
        currentY + 6
      );
      doc.text(`Phone: ${customer?.phone || "N/A"}`, 10, currentY + 12);
      doc.text(
        `Contact Person: ${
          customer?.contactPerson || bill.customerName || "N/A"
        }`,
        10,
        currentY + 18
      );
      doc.text(
        `Download Date: ${moment().format("YYYY-MM-DD")}`,
        10,
        currentY + 24
      );

      // Right Column: QR Code
      // try {
      //   const qrDataURL = await QRCode.toDataURL("https://badesolutions.com.ng");
      //   doc.addImage(qrDataURL, "PNG", pageWidth - 40, currentY, 35, 35);
      // } catch (err) {
      //   console.warn("QR code failed to generate");
      // }

      currentY += 2;

      // 🧾 Bill Metadata
      autoTable(doc, {
        startY: currentY,
        tableWidth: 80,
        margin: { left: pageWidth - 90 },
        head: [],
        body: [
          [
            `${bill.billStatus} No:`,
            `${bill.billStatus?.slice(0, 3).toUpperCase()}/${
              bill.billReferenceNo
            }/${bill.invoicelocation}`,
          ],
          ["Waybill No:", bill.WayBillNo || ""],
          ["Order Date:", bill.startDate || ""],
          [
            "Invoice Date:",
            moment(bill.DELIVERYDATE).format("YYYY-MM-DD") || "",
          ],
        ],
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
            "Case",
            "Pcs",
            "VAT",
            "Total",
          ],
        ],
        body: bill.orders.map((ord, i) => [
          i + 1,
          `${ord.item?.Name} - [${ord.item?.Pieces} pcs]`,
          ord.item?.ACDcode || "N/A",
          ord.priceListPrice.toFixed(2),
          ord.promotionData || 0,
          ord.Qty,
          ord.pcsReq || 0,
          ord.item?.VAT?.$numberDecimal || ord.item?.VAT || 0,
          ord.total.toFixed(2),
        ]),
        theme: "grid",
        styles: { fontSize: 9 },
      });
      currentY = doc.lastAutoTable.finalY + 10;

      // 💰 Summary Table
      autoTable(doc, {
        startY: currentY,
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
      currentY = doc.lastAutoTable.finalY + 10;

      // ✍️ Signatures
      doc.setFontSize(10);
      doc.text(
        `${totalInWords(bill.grandTotal, business.currency?.currency)}`,
        margin,
        currentY
      );
      currentY += 10;
      doc.text("Authorized Signatures", margin, currentY);
      currentY += 10;
      doc.text(
        `${business.companyName.toLowerCase()} _______________________________`,
        margin,
        currentY
      );
      currentY += 10;
      doc.text(
        "Customer Sign & Date _______________________________",
        margin,
        currentY
      );
      currentY += 10;
      if (business.invoicePolicy) {
        doc.text(business.invoicePolicy, margin, currentY);
        currentY += 10;
      }

      // 📎 Footer
      // doc.setFontSize(9);
      // doc.text(`This ${bill.billStatus} is generated on Business Automated Dynamic Enterprise`, margin, pageHeight - 20);

      // 📄 Page Numbers
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${totalPages}`,
          pageWidth - 20,
          pageHeight - 10,
          { align: "right" }
        );
      }

      // 🖨️ Preview or Save
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
      console.error("Error generating PDF:", error);
    }
  };


  const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userInfo.business.tenantId}`,
        dbConnect: `Bearer ${userInfo.business.rustyRoof}`,
        access: `${Encrypt(userInfo.user._id)}`,
      },
    };

  // rebill a canceled invoice to return items
  const Rebill = async () => {
    plsWait(
      "Hold tight — we’re preparing everything for you. This won’t take long ⏳ Please don’t refresh or leave this page. Also note that this Bill will carry a new Reference."
    );

    try {
      // Use destructuring for required IDs
      const Biller = Encrypt(userInfo.user._id);

      // Avoid unnecessary template literals
      const url = `${EXPRESS_PRIVATE_URL}/api/Redo/invoice/${Encrypt(
        Singlebill._id
      )}?Biller=${Biller}`;

      // Await axios call directly
      const { data } = await axios.post(url, {}, config);

      // Handle response (redirect or update UI as needed)
      // Redirect to the new invoice page
      if (data && data.result) {
        // Simulate a delay for the sake of example
        await new Promise((resolve) => setTimeout(resolve, 3000));
        Router.push(
          `/${path.auth}/${path.Tenant}/${path.module}/Forms/invoice/${Encrypt(
            data.result
          )}`
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Invoice Creation Error",
          text: "Could not retrieve invoice ID for redirection.",
          confirmButtonText: "Close",
        });
      }
    } catch (error) {
      // Prefer error.message fallback
      ErrorMessage(error?.response?.data?.error || error.message);
    }
  };

  // print waybill
  const printWayBill = async (business, customer, bill, userInfo) => {
    try {
      plsWait("Setting things up, Ensure your printer is connected⌛...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 10;
      let currentY = margin;

      // 🖼️ Logo
      if (business.companyLogo) {
        try {
          const logoDataURL = await loadImageAsDataURL(business.companyLogo);
          const logoWidth = pageWidth * 0.2;
          const logoHeight = logoWidth * 0.75;
          doc.addImage(
            logoDataURL,
            "JPEG",
            margin,
            currentY,
            logoWidth,
            logoHeight
          );
        } catch (imgErr) {
          console.warn("Logo failed to load:", imgErr.message);
        }
      }

      // 🏢 Business Info
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(business.companyName, pageWidth - margin, currentY + 5, {
        align: "right",
      });
      doc.setFontSize(10);
      const address = `${business.shopAddress}, ${business.companyCity}, ${business.companyState}`;
      const wrappedAddress = doc.splitTextToSize(
        address.toLowerCase(),
        pageWidth * 0.5
      );
      doc.text(wrappedAddress, pageWidth - margin, currentY + 12, {
        align: "right",
      });
      doc.text(`${business.email}`, pageWidth - margin, currentY + 20, {
        align: "right",
      });
      doc.text(`(${business.Tel})`, pageWidth - margin, currentY + 26, {
        align: "right",
      });
      doc.text(
        `Invoiced By: ${bill.RaiseBy}`,
        pageWidth - margin,
        currentY + 32,
        { align: "right" }
      );

      currentY += 50;

      // 🔳 QR Code
      const qrDataURL = await QRCode.toDataURL("https://badesolutions.com.ng");
      doc.addImage(qrDataURL, "PNG", pageWidth - margin - 30, currentY, 30, 30);

      // 🚚 Customer Info
      doc.setFontSize(17);
      doc.setFont("helvetica", "bold");
      doc.text(`${bill.WayBillNo}`, margin, currentY);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(13);
      doc.text(
        `${bill.customerName?.toUpperCase() || ""}`,
        margin,
        currentY + 8
      );
      doc.setFontSize(10);
      doc.text(
        `Address: ${customer?.billingAddress || "N/A"}`,
        margin,
        currentY + 14
      );
      doc.text(`Phone: ${customer?.phone || "N/A"}`, margin, currentY + 18);
      doc.text(
        `Contact Person: ${customer?.contactPerson || bill.customerName}`,
        margin,
        currentY + 22
      );
      doc.text(
        `Download Date: ${moment().format("YYYY-MM-DD")}`,
        margin,
        currentY + 26
      );

      // 📋 Metadata Table
      autoTable(doc, {
        startY: currentY + 30,
        tableWidth: pageWidth * 0.4,
        margin: { left: pageWidth - pageWidth * 0.4 - margin },
        body: [
          [
            `${bill.billStatus} No:`,
            `${bill.billStatus?.slice(0, 3).toUpperCase()}/${
              bill.billReferenceNo
            }/${bill.invoicelocation}`,
          ],
          // ["Order Date:", bill.startDate || ""],
          // ["Invoice Date:", moment(bill.DELIVERYDATE).format("YYYY-MM-DD") || ""],
        ],
        theme: "plain",
        styles: { fontSize: 9, cellPadding: 1 },
        columnStyles: {
          0: { fontStyle: "bold", halign: "right" },
          1: { halign: "right" },
        },
      });

      // 📊 Invoice Table with Pagination
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [["#", "Product", "Code", "Case", "Pcs"]],
        body: bill.orders.map((ord, i) => [
          i + 1,
          ord.item?.Name,
          ord.item?.ADCcode || ord.item?.ACDcode || "N/A",
          ord.Qty,
          ord.pcsReq || 0,
        ]),
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          halign: "start",
          valign: "middle",
          lineColor: [200, 200, 200],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [0, 102, 204],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
        didDrawPage: function (data) {
          const pageSize = doc.internal.pageSize;
          const pageHeight = pageSize.height || pageSize.getHeight();
          const pageWidth = pageSize.width || pageSize.getWidth();
          const pageNumber = doc.internal.getCurrentPageInfo().pageNumber;

          doc.setFontSize(9);
          doc.text(`${business.invoicePolicy}`, margin, pageHeight - 10);
          doc.text(`Page ${pageNumber}`, pageWidth - 60, pageHeight - 10);
        },
      });

      // 💰 Summary Table
      autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        margin: { left: margin },
        body: [
          [{ content: "Approved By Sign & Date:", colSpan: 2 }],
          [{ content: "Supplied By Sign & Date:", colSpan: 2 }],
          [{ content: "Checked By:", colSpan: 2 }],
          [
            {
              content: `Driver Name, Sign & Date: _${bill.DriverName},___________________________`,
              colSpan: 2,
            },
          ],
          [
            {
              content: `Vehicle Number: ______________${bill.vehicleNumber}____________`,
              colSpan: 2,
            },
          ],
          [
            {
              content: `Customer Sign & Date: ____________________________________________`,
              colSpan: 2,
            },
          ],
          [{ content: `Comment: ${bill.DeliveryComment}`, colSpan: 2 }],
        ],
        theme: "striped",
        styles: {
          fontSize: 10,
          cellPadding: 4,
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.5,
        },
      });

      // 🖨️ Preview or Save
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
      console.error("Error generating Waybill:", error);
    } finally {
      Swal.close();
    }
  };

  const cancelSales = async (orderId) => {
    const confirmed = await Swal.fire({
      title: "Cancel Order?",
      text: "Are you sure you want to cancel this order?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "No",
      reverseButtons: true,
    });

    if (!confirmed.isConfirmed) return;

    const { value: opCode } = await Swal.fire({
      title: "Security Check point",
      input: "password",
      inputLabel: "Enter Ops Code to proceed",
      inputPlaceholder: "Type in Ops code 🔐",
      showCancelButton: true,
      confirmButtonText: "Submit",
    });

    if (!opCode) {
      Swal.fire("Cancelled", "Operation was cancelled.", "info");
      return;
    }

    try {
      plsWait("Processing cancellation Request...");
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/SingleReturn/${Encrypt(
          orderId
        )}?user=${Encrypt(userInfo.user._id)}&ops=${Encrypt(opCode)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            dbConnect: `Bearer ${userInfo.business.rustyRoof}`,
            access: `${Encrypt(userInfo.user._id)}`,
          },
          body: JSON.stringify({ id: Encrypt(orderId) }),
        }
      );

      const result = await res.json();

      if (res.ok) {
        SuccessToast(result.message);
          Router.refresh();
      } else {
        throw new Error(result.error || "Cancellation failed");
      }
    } catch (err) {
      ErrorMessage(
        err.message || "An error occurred while cancelling the order."
      );
      Router.refresh();
    }
  };

  return (
    <>
      <Nav1
        user={userInfo.user}
        business={userInfo.business}
        page={`${Singlebill.billStatus.toUpperCase()} / ${
          Singlebill.billReferenceNo
        } /${Singlebill.invoicelocation}`}
      />
      <div className="max-w-5xl text-xs mx-auto px-6 py-10 bg-white shadow-2xl  m-6 animate__animated animate__fadeIn invoicecontainer border border-gray-200">
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
          <div className="flex items-start gap-6">
            <Image
              src={userInfo.business.companyLogo}
              width={90}
              height={90}
              alt="logo"
            />
            <div className="text-sm text-gray-700 space-y-1">
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {userInfo.business.companyName}
              </h3>
              <p className="text-gray-500">{userInfo.business.email}</p>
              <p className="text-gray-500">{userInfo.business.Tel}</p>
              <p className="text-gray-500">{userInfo.business.shopAddress.slice(0,30)}...</p>
              <p className="text-gray-500">{userInfo.business.CompanyCity}</p>
              <h2
                className={`mt-3 font-bold text-base ${
                  isCancelled ? "text-red-600" : "text-gray-800"
                }`}
              >
                {Singlebill.billStatus.toUpperCase()} /{" "}
                {Singlebill.billReferenceNo} / {Singlebill.invoicelocation}
              </h2>
              <h2 className=" mb-2 text-md font-bold text-indigo-700 tracking-wide">
                {Singlebill.WayBillNo}
              </h2>
            </div>
          </div>

          <div className="text-right text-sm text-gray-700 space-y-1 min-w-[220px]">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">
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

        {/* cancel invoice button */}

        {/* Print Button */}
        <div className="flex justify-end mb-6">
          {/* send bill via mail */}
          <button
            title={`Send via Mail ${Singlebill.billStatus}`}
            onClick={async () => {
              plsWait("Sending Mail");
              const api = `${EXPRESS_PRIVATE_URL}/api/sendmail/${Singlebill._id}/${userInfo.user.firstName}`;

              const request = await fetch(api, {
                method: "GET",
                headers: {
                  "content-type": "application/json",
                  dbConnect: `Bearer ${userInfo.business.rustyRoof}`,
                  access: `${Encrypt(userInfo.user._id)}`,
                },
              });
              const response = await request.json();

              if (response.message) {
                SuccessToast(response.message);
                Router.refresh();
              }
              if (response.error) ErrorMessage(response.error);
            }} // Replace with your email sending function
            className="mr-1 group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-50 to-white text-gray-800 font-semibold border border-blue-200 hover:shadow-lg hover:border-blue-400 hover:text-blue-700 transition duration-200 ease-in-out"
          >
            <AtSymbolIcon className="w-7 h-7 text-gray-400" />
            <span>Mail {Singlebill.billStatus}</span>
          </button>

          {Singlebill.billStatus?.toUpperCase() !== "CANCELLED" &&
            userInfo.user.cancelInvoice && (
              <button
                title={`Cancel and return SKU in ${Singlebill.billStatus}`}
                onClick={() => cancelSales(Singlebill._id)}
                className="group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-red-500 transition duration-200 ease-in-out mr-2 hover:bg-red-600 text-white font-semibold border border-red-400 hover:shadow-lg"
              >
                < ArrowUturnLeftIcon className="w-7 h-7 text-white" />
                <span>
                  Cancel {Singlebill.billStatus}/{Singlebill.billReferenceNo}
                </span>
              </button>
            )}

          {Singlebill.billStatus?.toUpperCase() === "ORDER" && (
            <button
              title={`Cancel and return SKU in ${Singlebill.billStatus}`}
              onClick={() =>
                showDeliveryModal(
                  Singlebill._id,
                  Encrypt(userInfo.user._id),
                  userInfo.business
                )
              }
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-blue-500 transition duration-200 ease-in-out mr-2 hover:bg-blue-600 text-white font-semibold border border-blue-400 hover:shadow-lg"
            >
              <span>Generate WayBill</span>
            </button>
          )}

          {Singlebill.billStatus?.toUpperCase() === "INVOICE" && (
            <button
              title={`Print WayBill ${Singlebill.billStatus}`}
              onClick={() => {
                printWayBill(userInfo.business, cust, Singlebill);
              }}
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-blue-200 transition duration-200 ease-in-out mr-2 hover:bg-blue-600 text-white font-semibold border border-blue-400 hover:shadow-lg"
            >
              <PrinterIcon className="w-7 h-7 text-gray-700" />
              <span>Print WB/{Singlebill.WayBillNo}</span>
            </button>
          )}

          {/* duplicate */}
            {/* {userInfo.business.subscriptionplan === "Standard" && userInfo.user.raiseInvoice && Singlebill.billStatus?.toUpperCase() === "CANCELLED" && (
              <button
              title={`Re-Bill ${Singlebill.billReferenceNo}`}
              onClick={Rebill}
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-green-200 transition duration-200 ease-in-out mr-2 hover:bg-green-600 font-semibold"
            >
              <ArrowPathRoundedSquareIcon className="w-7 h-7 text-gray-700" />
              <span>Recycle</span>
            </button> */}
          {/* )} */}

          <button
            title={`Download and Print ${Singlebill.billStatus}`}
            onClick={() => generatePdf(userInfo.business, cust, Singlebill)}
            className="group inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-gradient-to-r from-orange-50 to-white text-gray-800 font-semibold border border-orange-200 hover:shadow-lg hover:border-orange-400 hover:text-orange-700 transition duration-200 ease-in-out"
          >
            <PrinterIcon className="w-7 h-7 text-gray-700" />
            <span>Print {Singlebill.billStatus}</span>
          </button>
        </div>

        {/* Product Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white mb-8 text-xs">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                {[
                  "#",
                  "Product",
                  "Photo",
                  "Trace",
                  "Code",
                  "Case",
                  "Pcs",
                  "Price",
                  "Promo",
                  "VAT",
                  `Total (${userInfo.business.currency?.currency.Symbol})`,
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
              {Singlebill.orders.map((bill, index) => (
                <tr
                  key={bill._id}
                  className="border-t hover:bg-orange-50 transition"
                >
                  <td className="px-4 py-2 text-center text-xs">{index + 1}</td>
                  <td className="px-4 py-2 font-medium text-center text-xs">
                    {bill.item.Name}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Image
                      src={
                        bill.item.image || bill.item.QrCode || "/preview.png"
                      }
                      width={38}
                      height={38}
                      alt="preview"
                      className="rounded-md"
                    />
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {bill.returnId}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {bill.item.ADCcode || bill.item.ACDcode}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">{bill.Qty}</td>
                  <td className="px-4 py-2 text-center text-xs">
                    {bill.pcsReq || 0}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.priceListPrice.toFixed(2)}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.promotionData.toFixed(2) || 0}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">0</td>
                  <td className="px-4 py-2 font-bold text-right text-xs">
                    {userInfo.business.currency.currency.Symbol}
                    {bill.total?.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
          <div className="bg-gradient-to-br from-white via-orange-50 to-white rounded-xl border border-orange-100 shadow p-6">
            <h3 className="text-lg font-bold mb-4 text-gray-700 border-b pb-2">
              Summary
            </h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <strong>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.subTotal?.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Discount:</span>
                <strong>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.discount.toFixed(2) || 0}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Tax Rate:</span>
                <strong>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.taxRate.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee:</span>
                <strong>
                  {userInfo.business.currency.currency.Symbol}
                  {Singlebill.shippingFee.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 border-t pt-2">
                <span>Grand Total:</span>
                <span>
                  {userInfo.business.currency.currency.Symbol}
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
                userInfo.business.currency.currency
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
          </div>
        </div>
        {/* aCTIVITYLOG */}

        <button
          className="text-blue-500 text-sm mt-2 hover:underline"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Close Activity" : "Show Activity"}
        </button>

        {expanded && (
          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
              📋 Activity Log
            </h3>
            <ul className="divide-y divide-gray-200" start="0">
              {Singlebill.ActivityLog.map((log, index) => (
                <li key={index} className="py-3 text-gray-700 text-sm">
                  {log.logMsg}
                </li>
              ))}
            </ul>
          </div>
        )}

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
