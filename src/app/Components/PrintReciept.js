import React from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {useState} from "react"
import moment from "moment"
import {totalInWords} from "../../../Functions/Functions"
import {plsWait} from "../../../Functions/Mics"
import Swal from "sweetalert2"

const PaymentReceipt = ({business,payment,cust}) => {
    const [Payment] = useState(payment)


  const generatePDF = () => {
    const doc = new jsPDF();
    plsWait("")

   new Promise((resolve) => setTimeout(resolve, 1000))
    // Header
    doc.setFontSize(11);
    doc.text('Payment Receipt', 105, 20, null, null, 'center');

    // Company Info
    doc.setFontSize(18);
    doc.text(`${business.companyName}`, 20, 35);
    doc.setFontSize(8);
    doc.text(business.shopAddress.toLowerCase() || "", 20, 42);
    doc.text(`${business.email} | ${business.Tel}`, 20, 49);

    // Receipt Info
    doc.setFontSize(11);
    doc.text(`Ref: #${Payment.paymentReferenceNo}`, 150, 35);
    doc.text(`Print Date: ${moment().format('l')}`, 150, 42);

    // Table Data
    const tableColumn = ['Customer', 'Payment Date', 'Accountant', 'Amount'];
    const tableRows = [
      [cust,moment(Payment.PaymentDate).format('l') , Payment.Accountant ,Payment.crAmount],
    ];

    autoTable(doc, {
      startY: 60,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [255, 165, 0],
        textColor: 0,
        fontStyle: 'bold',
      },
    });

    // Footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text(`In words: ${totalInWords(Payment.crAmount,business.currency.currency)}`, 20, finalY);
    doc.text(`Payment Method:${Payment?.type}`, 20, finalY + 7);
    doc.text('Generated with Business Automated Dynamic Enterprise!', 105, finalY + 20, null, null, 'center');

    doc.save(`${Payment.paymentReferenceNo}.pdf`);
    Swal.close()
  };

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <button
        onClick={generatePDF}
        className="px-6 py-2  text-black rounded hover:bg-orange-300 transition"
      >
        Download Payment Receipt
      </button>
    </div>
  );
};

export default PaymentReceipt;
