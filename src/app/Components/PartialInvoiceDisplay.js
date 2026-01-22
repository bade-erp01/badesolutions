"use client";
import Swal from "sweetalert2";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {totalInWords} from "../../../Functions/Functions";
import moment from "moment";
import {plsWait} from "../../../Functions/Mics"


export default function PartialInvoiceDisplay({data , business}) {

  // helper function to load image as data URL
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

  // generate PDF function
   const generatePdf = async ( ) => {
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
          `${data.billStatus?.slice(0, 3).toUpperCase()}/${
            data.billReferenceNo
          }/${data.invoicelocation}`,
          10,
          currentY
        );
        currentY += 10;
  
        // Left Column: Customer Info
        doc.setFont("helvetica", "bold").setTextColor(0, 0, 0).setFontSize(13);
        doc.text(`${data.customerName?.toUpperCase() || ""}`, 10, currentY);
  
        currentY += 2;
  
        // 🧾 Bill Metadata
        autoTable(doc, {
          startY: currentY,
          tableWidth: 80,
          margin: { left: pageWidth - 90 },
          head: [],
          body: [
            [
              "Download Date:",
              moment().format("YYYY-MM-DD") || "",
            ],
          ],
          theme: "plain",
          styles: { fontSize: 7, cellPadding: 1 },
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
              "P/RTC",
              "P/RTP",
              "Total",
            ],
          ],
          body: data?.orders.filter(ord => ord.RCRT > 0 || ord.RPCS > 0).map((ord, i) => [
            i + 1,
            `${ord.item?.Name} - [${ord.item?.Pieces} pcs]`,
            ord.item?.ACDcode || "N/A",
            ord.priceListPrice?.toFixed(2) || 0,
            ord.promotionData || 0,
            ord.Qty,
            ord.pcsReq || 0,
            ord.RCRT,
            ord.RPCS,
            ord.total?.toFixed(2) || 0,
          ]),
          theme: "grid",
          styles: { fontSize: 7 },
        });
        currentY = doc.lastAutoTable.finalY + 10;
  
        
        // 💰 Summary Table
        autoTable(doc, {
          startY: currentY,
          tableWidth: 80,
          margin: { left: pageWidth - 90 },
          head: [],
          body: [
            ["Total", data.orders?.filter(ord => ord.RCRT > 0 || ord.RPCS > 0).reduce((sum, ord) => sum + (ord.total || 0), 0).toFixed(2) || 0],
          ],
          theme: "grid",
          styles: { fontSize: 7, cellPadding: 1 },
          columnStyles: {
            0: { fontStyle: "bold", halign: "right" },
            1: { halign: "right" },
          },
        });
        currentY = doc.lastAutoTable.finalY + 10;
  
        // ✍️ Signatures
        doc.setFontSize(7);
        doc.text(
          `${totalInWords(data.orders?.filter(ord => ord.RCRT > 0 || ord.RPCS > 0).reduce((sum, ord) => sum + (ord.total || 0), 0), business.currency?.currency)}`,
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
          doc.save(`${data.billReferenceNo || "return"}.pdf`);
          Swal.close();
        }
      } catch (error) {
        Swal.close();
        console.error("Error generating PDF:", error);
      }
    };
  
  
  // 🧾 Show modal with altered line
  const showModal = () => {

    Swal.fire({
      title: `${data.billStatus.slice(0,3).toUpperCase()}/${data.billReferenceNo}`,
      html: `
        <table style="width:100%; border-collapse: collapse; font-size: 13px;">
          <thead style="background-color: #edf2f7;">
            <tr>
              <th style="padding: 6px; text-align: center;">S/No</th>
              <th style="padding: 6px; text-align: center;">Product</th>
              <th style="padding: 6px; text-align: center;">Trace</th>
              <th style="padding: 6px; text-align: center;">Code</th>
              <th style="padding: 6px; text-align: center;">Case</th>
              <th style="padding: 6px; text-align: center;">Pcs</th>
              <th style="padding: 6px; text-align: center;">P/RTC</th>
              <th style="padding: 6px; text-align: center;">P/RTP</th>
              <th style="padding: 6px; text-align: center;">Price</th>
              <th style="padding: 6px; text-align: center;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${data?.orders.filter(ord => ord.RCRT > 0 || ord.RPCS > 0).map(
                (line, index) => `
              <tr style="border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 6px;">${index + 1}</td>
                <td style="padding: 6px; text-align: center;">${line.item.Name}</td>
                <td style="padding: 6px; text-align: center;">${line.returnId}</td>
                <td style="padding: 6px; text-align: center;">${line.item.ADCcode || line.item.ACDcode}</td>
                <td style="padding: 6px; text-align: center;">${line.Qty}</td>
                <td style="padding: 6px; text-align: center;">${line.pcsReq}</td>
                <td style="padding: 6px; text-align: center;">${line.RCRT}</td>
                <td style="padding: 6px; text-align: center;">${line.RPCS}</td>
                <td style="padding: 6px; text-align: center;">${line.priceListPrice?.toFixed(2)}</td>
                <td style="padding: 6px; text-align: center;">${line.total?.toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 12px; text-align: right; display: flex; justify-content: flex-end; gap: 8px;">
          <button id="downloadAgingExcel" style="
            background-color: #2b6cb0;
            color: white;
            padding: 6px 12px;
            border-radius: 6px;
            border: none;
            cursor: pointer;
            font-size: 13px;
          ">
            Print a Copy
          </button>
        </div>
      `,
      width: "70%",
      showConfirmButton: false,
      didOpen: () => {

        document.getElementById("downloadAgingExcel").onclick = () => {
          const excelBtn = generatePdf();
          if (excelBtn instanceof HTMLElement) {
            excelBtn.click();
          }
        };
      },
    });
  };

  return (
    <button
      onClick={showModal}
      className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition text-xs w-full"
    >
      <ClipboardDocumentListIcon className="w-4 h-4 inline-block" />
      View adjustment
    </button>
  );
}
