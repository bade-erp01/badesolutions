"use client";
import { React, useState ,useRef} from "react";
import Swal from "sweetalert2";
import BackButton from "@/app/Components/BackBotton";
import Image from "next/image";
import moment from "moment";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/navigation";
import {
  Encrypt,
  ErrorMessage,
  SuccessToast,
  plsWait,
} from "../../../../../../../Functions/Mics";
import {
  totalInWords,
  EXPRESS_PRIVATE_URL,
} from "../../../../../../../Functions/Functions";
import Link from "next/link"
import { TrashIcon,KeyIcon,CheckBadgeIcon, PencilIcon,PaperClipIcon,ArrowTrendingUpIcon,PrinterIcon} from "@heroicons/react/24/solid";

export default function DraftPurchasePage({
  user,
  Business,
  customer,
  bill,
  products,
  Whouse,
}) {
  const [Singlebill, setsingleBill] = useState(bill);
  const [cust] = useState(customer);
  const [productList] = useState(products);
  Swal.close();
  const router = useRouter();

  // upload docs
      const processAndUploadFile = async (file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = async (e) => {
            try {
              const img = new window.Image();
              img.onload = async () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const maxWidth = 800;
                const maxHeight = 600;
                let { width, height } = img;

                if (width > height) {
                  if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                  }
                } else {
                  if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                  }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                const resizedImage = canvas.toDataURL('image/jpeg', 0.7);

                const request = await fetch(`${EXPRESS_PRIVATE_URL}/api/attachement?po=${Encrypt(bill._id)}`, {
                  method: "POST",
                  body: JSON.stringify({ image: resizedImage }),
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
                    dbConnect: `Bearer ${Business.rustyRoof}`,
                    access: `${Encrypt(user._id)}`,
                  },
                });

                const response = await request.json();
                resolve({ success: !!response.message });
              };
              img.src = e.target.result;
            } catch (error) {
              resolve({ success: false });
            }
          };
          reader.readAsDataURL(file);
        });
      }


        const uploadLPOFile = async () => {
          try {
            const { value: files } = await Swal.fire({
              title: "Select Files",
              input: "file",
              inputAttributes: {
                accept: "image/*", // Accept only image types
                "aria-label": "Upload your Files",
                multiple: "multiple",
              },
              preConfirm: (fileInput) => {
                const maxSize = 1024 * 1024; // 1MB
                const files = fileInput instanceof FileList ? Array.from(fileInput) : [];

                for (const file of files) {
                  if (file.size > maxSize) {
                    Swal.showValidationMessage(`File "${file.name}" exceeds 1MB limit.`);
                    return false;
                  }
                  if (file.type === "application/pdf") {
                    Swal.showValidationMessage(`PDF files are not allowed: "${file.name}".`);
                    return false;
                  }
                }

                return files;
              },
            });
            if (files && files.length > 0) {
              plsWait("Uploading...");
              const uploadPromises = Array.from(files).map((file) =>
                processAndUploadFile(file)
              );

              const results = await Promise.all(uploadPromises);

              const successfulUploads = results.filter(
                (result) => result.success
              ).length;
              const failedUploads = results.filter(
                (result) => !result.success
              ).length;

              Swal.fire({
                title: "Upload Results",
                html: `Successfully uploaded ${successfulUploads} file(s).<br>Failed to upload ${failedUploads} file(s).`,
                icon: successfulUploads > 0 ? "success" : "warning",
              });
            }
          } catch (error) {
            ErrorMessage("Error uploading file:", error);
          }
        };
  

  const handleProductSelection = async (productId) => {
    plsWait("Adding product to list");


    const cleanedProducts = await productList.find((product) => {
        return product.item.ACDcode === productId;
      });

    try {
      const res = await fetch(
        `${EXPRESS_PRIVATE_URL}/api/VendorProduct/lpo?product=${cleanedProducts.storeId}&po=${bill._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            dbConnect: `Bearer ${Business.rustyRoof}`,
            access: `${Encrypt(user._id)}`,
          },
        }
      );

      const data = await res.json();

      if (data.message) {
        SuccessToast(data.message); // Replace with your custom ShowServerResponse
        router.refresh();
        window.location.reload();
      } else {
        throw new Error(data.error); // Replace with your custom serverError
      }
    } catch (error) {
      ErrorMessage(error);
    }
  };

  const removeLineItem = async (id) => {
    try {
      plsWait("Removing product from cart");

      const url = `${EXPRESS_PRIVATE_URL}/api/RemoveLinePo?po=${
        bill._id
      }&items=${encodeURIComponent(id)}`;

      const response = await fetch(url, {
        method: "DELETE",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            dbConnect: `Bearer ${Business.rustyRoof}`,
            access: `${Encrypt(user._id)}`,
          },
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message); 
        router.refresh();
        window.location.reload(); // Consider using router.reload() if you're using Next.js router
      } else {
        throw new Error(data.error || "Unknown error occurred");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  const DeleteDraftPo = async (id, userId) => {
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

      plsWait("");

      const url = `${EXPRESS_PRIVATE_URL}/api/Vendor/Bill/${encodeURIComponent(
        id
      )}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            dbConnect: `Bearer ${Business.rustyRoof}`,
            access: `${Encrypt(user._id)}`,
          },
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);
        setTimeout(() => {
          router.push(`/${Business.companyName}/${Encrypt(user._id)}/vendor/vendor`);
        }, 2000);
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  const handleQtyChange = async (newQty, lineId, field) => {
    try {
      // plsWait('updating...');

      const url = `${EXPRESS_PRIVATE_URL}/api/updateLinePo/?po=${encodeURIComponent(
        bill._id
      )}&${field}=${newQty}&lineId=${encodeURIComponent(
        lineId
      )}&update=${field}`;

      const response = await fetch(url, {
        method: "PATCH",
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            dbConnect: `Bearer ${Business.rustyRoof}`,
            access: `${Encrypt(user._id)}`,
          },
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);
        location.reload(); // Or use router.refresh() if you're in App Router
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  const updateRFP = async (status) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to proceed with updating this Request for Purchase?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
      });

      if (!result.isConfirmed) {
        return;
      }

      plsWait("Updating Request for Purchase");

      const url = `${EXPRESS_PRIVATE_URL}/api/VendorBillPost?po=${Singlebill._id}&user=${encodeURIComponent(`${user.firstName} ${user.lastName}`)}`;

      const response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify({
          status: status,
        }),
         headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(Business.tenantId)}`,
            dbConnect: `Bearer ${Business.rustyRoof}`,
            access: `${Encrypt(user._id)}`,
          },
      });

      const data = await response.json();

      if (data.message) {
        SuccessToast(data.message);
        window.location.reload();
        router.refresh(); // Or use router.refresh() if you're in App Router
      } else {
        throw new Error(data.error || "Update failed");
      }
    } catch (error) {
      ErrorMessage(error.message || "Network error");
    }
  };

  // generate pdf
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
    const generatePdf = async ({business = Business, bill = Singlebill}) => {
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
          `${
            bill.billReferenceNo
          }`,
          10,
          currentY
        );
        currentY += 10;
  
        // Left Column: Customer Info
        doc.setFont("helvetica", "bold").setTextColor(0, 0, 0).setFontSize(13);
        doc.text(`${bill.Vendor.Name?.toUpperCase() || ""}`, 10, currentY);
        doc.setFontSize(8).setTextColor(0, 0, 0);
        doc.text(`${bill.Vendor?.Address || "N/A"}`, 10, currentY + 6);
        doc.text(`${bill.Vendor?.vendor_tel || "N/A"}`, 10, currentY + 12);
  
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
            ["Store:", Whouse.WHName || ""],
            [
              "Receieve Date:",
              moment(bill.recievedDate).format("YYYY-MM-DD") || "",
            ],
            [
              "Status:",
             bill.status,
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
              "Batch",
              "Expiry Date",
              "Price",
              "Case",
              "Pcs",
              "Total",
            ],
          ],
          body: bill.orders.map((ord, i) => [
            i + 1,
            `${ord.item?.productName}`,
            ord.item?.ACDcode || ord.item?.ADCcode || "N/A",
            ord.BatchNo || "N/A",
            ord.ExpDate || "N/A",
            ord.VendorPrice?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 0,
            ord.Qty || 0 ,
            ord.pcsReq || 0,
            ord.total?.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2}) || 0,
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
          head: [["Subtotal", "Logistics", "Total Due"]],
          body: [
            [
    bill.subTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
    bill.shippingFee?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00",
    bill.grandTotal?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || "0.00"
  ],
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
        doc.text(`Remarks:${bill.Remarks}`, margin, currentY);
        // currentY += 10;
        // doc.text(
        //   `${business.companyName.toLowerCase()} _______________________________`,
        //   margin,
        //   currentY
        // );
        // currentY += 10;
        // doc.text(
        //   "Suppliers Sign & Date _______________________________",
        //   margin,
        //   currentY
        // );
        // currentY += 10;
        // if (business.invoicePolicy) {
        //   doc.text(business.invoicePolicy, margin, currentY);
        //   currentY += 10;
        // }
  
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
          doc.save(`${bill.customerName || "Purchase"}.pdf`);
          Swal.close();
        }
      } catch (error) {
        Swal.close();
        console.error("Error generating PDF:", error);
      }
    };
  

  return (
    <>
      <div className="max-w-5xl mx-auto px-6 py-10 bg-white shadow-2xl  m-6 animate__animated animate__fadeIn invoicecontainer border border-gray-200">
        {/* Top Controls */}
        <div className="flex items-center justify-between mb-8">
          <BackButton />
          <span
            className={`text-shadow-black text-purple-300 px-5 py-1.5 rounded-full font-semibold text-base tracking-wide shadow-sm border `}
          >
            {Singlebill.status}
          </span>
        </div>

        {/* Company + Customer Info */}
        <div className="flex flex-wrap justify-between gap-10 border-t border-b py-8 mb-6">
          <div className="flex items-start gap-6 w-full md:w-auto">
            <Image
              src={Business.companyLogo}
              width={90}
              height={90}
              alt="logo"
              priority
            />
            <div className="text-sm text-gray-700 space-y-1">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                {Business.companyName}
              </h3>
              <p className="text-gray-500 text-xl font-semibold">
                {Whouse.WHName}
              </p>
              <p className="text-gray-500">{Business.Tel}</p>
              <p className="text-gray-500">{Business.Address}</p>
              <p className="text-gray-500">{Business.CompanyCity}</p>
              <h2 className={`mt-3 font-bold text-base`}>
                {Singlebill.status} / {Singlebill.billReferenceNo}
              </h2>
            </div>
          </div>

          <div className="text-right text-sm text-gray-700 space-y-1 w-full md:w-auto min-w-[220px]">
            <h3 className="text-xl font-bold text-gray-900 tracking-tight">
              {cust?.Name?.toUpperCase()}
            </h3>
            <p>
              {/* <span className="mr-1">📞</span> */}
              <a
                href={`tel:${cust.vendor_tel}`}
                className="hover:underline text-indigo-700"
              >
                {cust.vendor_tel || "N/A"}
              </a>
            </p>
            <p>
              {/* <span className="mr-1">✉️</span> */}
              <a
                href={`mailto:${cust.email}`}
                className="hover:underline text-indigo-700"
              >
                {cust.email || "N/A"}
              </a>
            </p>
            <p>
              <span className="mr-1">🗓️</span>
              {new Date(Singlebill.recievedDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
          <div className="flex justify-evenly items-center gap-4">
            {user.raiseLpo &&
              Singlebill.status.toLowerCase() === "draft" && (
              <button
                onClick={() => updateRFP("Pending")}
                    title="Process this draft to order"
                    className="group inline-flex items-center justify-center gap-3 px-3 py-3 rounded-lg bg-gray-600 text-white font-semibold hover:shadow-xl  transition duration-200 ease-in-out text-xs"
                  >
                    <KeyIcon className="h-6 w-6 text-white" />
                    <span>Lock Request</span>
                  </button>
                  )}

                {/* for file upload */}
                  {user.raiseLpo &&
                  Singlebill.status.toLowerCase() === "draft" && (
                      <div>
                        <button className="inline-flex items-center justify-center bg-gray-600  border-2 px-3 py-3 rounded-lg text-white font-semibold hover:shadow-xl  transition duration-200 ease-in-out text-xs" onClick={uploadLPOFile}>
                          upload Attachement 
                          <PaperClipIcon className="h-6 w-6 text-white`" />
                        </button>
                      </div>
                  )}


                 {user.allowInternalTransfers && Singlebill.status.toLowerCase() === "pending" && (
                  <button
                  onClick={() => updateRFP("Draft")}
                  title="Set this purchase request back to draft"
                  className="group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gray-600 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 ease-in-out"
                  >
                 <PencilIcon className="h-5 w-5 text-white group-hover:text-white transition-colors duration-200 text-xs" />
                  <span>Set to Draft</span>
                  </button>
                )}

                {user.allowInternalTransfers && Singlebill.status.toLowerCase() === "pending" && (
                  <button
                  onClick={() => updateRFP("approved")}
                  title="Approve this purchase request"
                   className="group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gray-600 text-white font-medium shadow-md hover:shadow-lg  transition-all duration-200 ease-in-out"
                  >
                 <CheckBadgeIcon className="h-5 w-5 text-white group-hover:text-white transition-colors duration-200 text-xs" />
                  <span>Approve</span>
                  </button>
                )}

                {user.allowInternalTransfers && Singlebill.status.toLowerCase() === "approved" && (
                  <button
                  onClick={() => updateRFP("POSTED TO WAREHOUSE")}
                  title="Update warehouse inventory items"
                  className="group inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-teal-600 to-teal-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-teal-500 hover:to-teal-400 transition-all duration-200 ease-in-out text-xs"
                  >
                <ArrowTrendingUpIcon className="h-5 w-5 text-white group-hover:text-white transition-colors duration-200" />
                  <span>Update Inventory</span>
                </button>
                )}
                
                {user.raiseLpo &&
                  Singlebill.status.toLowerCase() === "draft" && (
                  <button
                    title="Delete this draft"
                    onClick={() => DeleteDraftPo(Singlebill._id)}
                    className="inline-flex items-center justify-center bg-red-300 border-2 px-3 py-3 rounded-lg text-white font-semibold hover:shadow-xl hover:bg-red-200 transition duration-200 ease-in-out text-xs"
                  >
                    Delete
                    <TrashIcon className="h-6 w-6 text-white" />
                  </button>
                  )}
                </div>

                {/* Print Button */}
          {bill.status.toLowerCase() !== "draft" && (
            <button
              onClick={generatePdf}
              title={`Download and Print ${Singlebill.status}`}
              className=" group inline-flex items-center rounded-lg justify-center gap-3 px-6 py-3 bg-gray-600 text-white font-semibold border transition duration-200 ease-in-out text-xs"
            >
              <span>Print</span>
              <PrinterIcon className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* Print Button */}
        {/* Product Table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white mb-8">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
              <tr>
                {[
                  "Product",
                  "Photo",
                  // "Trace",
                  "Code",
                  "Case",
                  "Pcs",
                  "Batch",
                  "eXPIRY DATE",
                  "Price",
                  `Total (${Business.currency?.currency.Symbol})`,
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
                  className="border-t hover:bg-orange-50 transition"
                >
                  <td className="flex-2 px-4 py-2 text-indigo-700 font-medium text-center text-xs">
                    <Link
                      href={`/${Business.companyName}/${Encrypt(user._id)}/product/product/${Encrypt(bill.item.productId)}`}
                      className="hover:underline"
                    >
                      {bill.item.productName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Image
                      src={
                        bill.item.image || bill.item.QrCode || "/preview.png"
                      }
                      width={38}
                      height={38}
                      alt="preview"
                      className="rounded-md "
                    />
                  </td>
                  {/* <td className="px-4 py-2 text-center">{bill.returnId}</td> */}
                  <td className="px-4 py-2 text-center text-xs">{bill?.item?.ADCcode || bill?.item?.ACDcode}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {Singlebill.status.toLowerCase() === "draft" ? (
                     <input
                      defaultValue={bill.Qty}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50 text-xs"
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if(val !==""){
                        handleQtyChange(
                          isNaN(val) || val < 0 ? 0 : val, // sanitized value
                          bill._id,
                          "Qty"
                        );
                      }
                      }}
                    />
                    ) : (
                      bill.Qty
                    )}
                  </td>
                  {Business.subscriptionplan === "Standard" ?(
                  <td>
                  {Singlebill.status.toLowerCase() === "draft" ? (
                     <input
                      defaultValue={bill.pcs || 0}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50 text-xs"
                      onBlur={(e) => {
                        const val = parseFloat(e.target.value);
                        if(val !==""){
                          handleQtyChange(
                            isNaN(val) || val < 0 ? 0 : val, // sanitized value
                            bill._id,
                            "Pcs"
                          );
                        }
                      }}
                    />
                    ) : (
                      <td className="px-4 py-2 text-center text-xs">
                        {bill.pcs || 0}
                      </td>
                    )}
                  </td>
                  ):(
                    <td className="px-4 py-2 text-center text-xs">
                         0
                    </td>
                  )}
                  <td className="px-4 py-2 text-center">
                    {Singlebill.status.toLowerCase() === "draft" ? (
                      <input
                      type="text"
                      defaultValue={bill.BatchNo}
                      className="w-30 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                      onBlur={(e) => {
                        const val = e.target.value.trim(); // Optional: remove leading/trailing spaces
                        handleQtyChange(val, bill._id, "BatchNo");
                      }}
                    />
                    ) : (
                      bill.BatchNo
                    )}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {Singlebill.status.toLowerCase() === "draft" ? (
                     <input
                      type="date"
                      defaultValue={bill.ExpDate}
                      className="w-30 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50 texxt-xs"
                      onBlur={(e) => {
                        const val = e.target.value;
                        handleQtyChange(val, bill._id, "ExpDate");
                      }}
                    />
                    ) : (
                      bill.ExpDate
                    )}
                  </td>
                  <td className="px-4 py-2 text-center text-xs">
                    {bill.buyingPrice}
                  </td>
                  <td className="px-4 py-2 font-bold text-right text-xs">
                    {Business.currency?.currency.Symbol}
                    {bill.total?.toFixed(2)}
                  </td>
                  {user.raiseInvoice &&
                    Singlebill.status.toLowerCase() === "draft" && (
                      <td
                        title={`Click to remove product from cart`}
                      >
                        <button onClick={() => removeLineItem(bill._id)}>
                          <TrashIcon className="w-5 h-5 text-red-500" />
                        </button>
                      </td>
                    )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {Singlebill.status.toLowerCase() === "draft" && (
          <div className="mb-8">
            {/* Dropdown for small screens */}
            <div className="block md:hidden">
              <label
                htmlFor="productDropdown"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Select from {productList.length} Product
              </label>
              <select
                onBlur={(e) => handleProductSelection(e.target.value)}
                id="productDropdown"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200"
              >
                <option value={""}>Choose...</option>
                {productList.map((product) => (
                    <option key={product.storeId} value={product?.item?.ADCcode || product?.item?.ACDcode}>
                      {product?.item?.Name}
                    </option>
                ))}
              </select>
            </div>

            {/* Datalist for medium and larger screens */}
            <div className="hidden md:block">
              <label
                htmlFor="productDatalist"
                className="block mb-2 text-sm font-medium text-gray-700"
              >
                Search from {productList.length} Products
              </label>
              <input
                onBlur={(e) => {
                  if (e.target.value.trim() !== "") {
                    handleProductSelection(e.target.value);
                  }
                  e.target.value = ""; // Reset the input value to an empty string
                }}
                type="text"
                list="productsList"
                id="productDatalist"
                className="w-70 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-200"
                placeholder="Type to search products..."
              />
              <datalist id="productsList">
                {productList.map((product) => (
                    <option key={product.storeId} value={product?.item?.ACDcode || product?.item?.ADCcode}>
                      {product?.item?.Name}
                    </option>
                ))}
              </datalist>
            </div>
          </div>
        )}

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
                  {Business.currency?.currency.Symbol}
                  {Singlebill.subTotal.toFixed(2) -
                    Singlebill.taxRate.toFixed(2)}
                </strong>
              </div>
              <div className="flex justify-between">
                <span>Discount Recieved:</span>
                {Singlebill.status === "Draft" ? (
                 <input
                  type="number"
                  defaultValue={Singlebill.discount || 0}
                  className="w-24 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                  onBlur={(e) => {
                    const val = parseFloat(e.target.value);
                    setsingleBill({
                      ...Singlebill,
                      discount: isNaN(val) || val < 0 ? 0 : val,
                    });
                  }}
                />
                ) : (
                  <strong>
                    {Business.currency?.currency.Symbol}
                    {Singlebill.discount.toFixed(2)}
                  </strong>
                )}
              </div>

              <div className="flex justify-between">
                <span>Shipping & Offloading Fee:</span>
                {Singlebill.status === "Draft" ? (
                  <input
                    type="number"
                    defaultValue={Singlebill.shippingFee || 0}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                    onBlur={(e) => {
                      const val = parseFloat(e.target.value);
                      setsingleBill({
                        ...Singlebill,
                        shippingFee: isNaN(val) || val < 0 ? 0 : val,
                      });
                    }}
                  />
                ) : (
                  <strong>
                    {Business.currency?.currency.Symbol}
                    {Singlebill.shippingFee.toFixed(2)}
                  </strong>
                )}
              </div>
              <div className="flex justify-between">
                <span>Remark:</span>
                {Singlebill.status === "Draft" ? (
                  <textarea
                    className="w-full ml-2 px-2 py-1 border border-gray-300 rounded text-center bg-gray-50"
                    defaultValue={Singlebill.Remarks || ""}
                    onBlur={(e) => {
                      const val = e.target.value.trim(); // Optional: remove extra spaces
                      setsingleBill({ ...Singlebill, Remarks: val });
                    }}
                  />
                ) : (
                 ""
                )}
              </div>
              <div className="flex justify-between text-lg font-bold mt-4 border-t pt-2">
                <span>Grand Total:</span>
                <span>
                  {Business.currency?.currency.Symbol}
                  {Singlebill.grandTotal?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Words representation */}
          <div className="bg-white rounded-xl border border-gray-100 shadow p-6 text-gray-700 flex flex-col justify-between">
            <h3 className="text-lg font-bold mb-4">Total In Words</h3>
            <p className="italic text-base text-orange-700">
              {totalInWords(Singlebill.grandTotal, Business.currency?.currency)}
            </p>
          </div>
        </div>

        {/* Signature & T&C */}
        <div className="mt-12 flex flex-col md:flex-row justify-between items-start gap-10">
          <div className="max-w-md">
            <h4 className="font-semibold text-gray-700 mb-2">Attachement</h4>
            <p className="text-sm text-gray-600 mb-4">
              Please ensure all documents are attached before finalizing the purchase request.</p>
            {/* display all attachements here  */}
            <div className="space-y-2">
              {Singlebill.Attachment?.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-md bg-gray-50 hover:bg-gray-100 transition">
                <PaperClipIcon className="h-5 w-5 text-gray-500" />
                <Link
                  href={file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Attachment {index + 1}
                </Link>
              </div>
              ))}
          </div>
          </div>
          <div className="text-right">
            <h4 className="font-semibold text-gray-700 mb-2"> {Singlebill.billReferenceNo}</h4>
            <p className="text-sm font-medium text-gray-800">
             
            </p>
            {/* Optional signature */}
            {/* <Image src="/QRBADE.png" width={150} height={150} alt="QR Code Signature" /> */}
          </div>
        </div>

        {/* Footer Reference */}
        <div className="mt-12 pt-8 border-t text-center text-sm text-gray-400 tracking-wide">
          {Singlebill.billReferenceNo}
        </div>
      </div>
    </>
  );
}