
import CryptoJS from 'crypto-js';
import Swal from "sweetalert2/dist/sweetalert2.js";
import "sweetalert2/src/sweetalert2.scss";
import "animate.css";
import { ErrorMessage, SuccessToast, plsWait } from "./Mics";
import jwt from "jsonwebtoken";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import QRCode from "qrcode";
import { escapeHtml } from "../src/lib/security/escapeHtml";

const EXPRESS_PRIVATE_URL = "https://api.badesolutions.com.ng"
// const EXPRESS_PRIVATE_URL = "http://localhost:3000" 
// const EXPRESS_PRIVATE_URL = "https://1492-102-91-102-30.ngrok-free.app" 
const ENCRYPTION_KEY = '12345678901234567890123456789012'; // 32 chars
const IV = '1234567890123456'; // 16 chars


async function termsAndConditions(payload) {
  const { value: accept } = await Swal.fire({
    title: "Terms and Conditions",
    html: `
      <p> By signing up, you agree to our Terms and conditions for ${escapeHtml(payload.plan)} plan.</p>
    `,
    input: "checkbox",
    inputValue: 0,
    inputPlaceholder: "I agree with the terms and conditions",
    confirmButtonText: `Continue&nbsp;<i class="fa fa-arrow-right"></i>`,
    showClass: {
      popup: "animate__animated animate__fadeInUp animate__faster",
    },
    hideClass: {
      popup: "animate__animated animate__fadeOutDown animate__faster",
    },
    inputValidator: (result) => {
      return !result && "You need to agree with T&C";
    },
  });

  if (accept) {
    plsWait(`You've agreed with T&C for ${payload.plan} plan.`);
    // Simulate a delay for the sake of example
    await new Promise((resolve) => setTimeout(resolve, 3000));
    //make post request to server using axios for payment collection

    try {
      const url = `${EXPRESS_PRIVATE_URL}/auth/SignUp?`;

      const { data } = await axios.post(url, payload);

      if (data.data) {
        return data
      }
      // Handle success
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        ErrorMessage(error.response.data.error); // Call your error handler with message
      }
    }
  }
}

// Encrypt data from frontend
function Encrypt(arg) {
  return jwt.sign(
    { id: arg },
    "THESTARTUPWAY", //  Use a secure secret key
    { expiresIn: "3d" } //  Token expires in 3 days
  );
}

function formatMongooseError(err) {
   // Case 1: Validation errors (e.g. required fields, regex mismatch)
  if (err.name === "ValidationError") {
    return "Validation failed: One or more inputs are invalid.";
  }

  // Case 2: Duplicate key error (MongoDB error code 11000)
  if (err.code === 11000) {
    return "Duplicate error: A record with this value already exists.";
  }

  // Case 3: CastError (invalid ObjectId or wrong type)
  if (err.name === "CastError") {
    return "Invalid input: Provided value is not in the correct format.";
  }

  // Case 4: MongoNetworkError (connection issues)
  if (err.name === "MongoNetworkError") {
    return "Connection error. Please try again later.";
  }

  // Case 5: Timeout or server selection error
  if (err.message && err.message.includes("timed out")) {
    return "Request timed out. Please retry.";
  }

  // Fallback for other errors
  return "An unexpected error occurred. Please try again.";
}

// Encrypt data from frontend
function Dencrypt(payload) {
  const data = jwt.verify(payload,"THESTARTUPWAY");

  return data.id || null
}


// data in rest decrypt
 const CryptoJSdecrypt = (encryptedText) => {
  const key = CryptoJS.enc.Utf8.parse(ENCRYPTION_KEY);
  const iv = CryptoJS.enc.Utf8.parse(IV);

  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  return decrypted.toString(CryptoJS.enc.Utf8);
};


//update employee data
const UpdateEmployeeData = async (id, fieldName, value,userInfo, businessInfo, SessionId) => {
  try {
    plsWait(`Updating User...⌛`);

    const { data } = await axios.patch(
      `${EXPRESS_PRIVATE_URL}/api/updateUser/${Encrypt(id)}`,
      {
        [fieldName]: value,
        id,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(businessInfo.tenantId)}`,
          sessionKey: `Bearer ${Encrypt(userInfo.SessionId)}`,
          access: `${Encrypt(userInfo._id)}`,
        },
      }
    );

    SuccessToast(data.message);
  } catch (error) {
    console.log(err.message)
    ErrorMessage(error.response?.data?.error || "Something went wrong");
  }
};


const UpdateEmployeeModules = async (id, object) => {
  try {
    plsWait("Attempting remote access on user Work space");
    const body = JSON.stringify({
      id,
      object,
    });
    const response = await fetch("/api/EmployeeUpdate", {
      method: "PUT",
      body,
      timeout: 10000, //10s timeout for better error handling
    });
    const req = await response.json();

    if (req.message) {
      SuccessToast(req.message);

    } else {
      throw new Error(req.error);
    }
  } catch (error) {
    ErrorMessage(error.message);
  }
};


const downloadExcel = (data, page) => {
  try {
    if (!data || data.length === 0) {
      throw new Error("No data available for export.");
    }

    // Dynamically extract column headers excluding "image" and "_id"
    const workSheetColumnsNames = Object.keys(data[0]).filter(
      (key) => key !== "image" && key !== "_id" && key !== "password" && key !== "opsCode" && key !=='TextToSpeech' && key !=='firstTimeOnboard' && key !=='firstTimeOnboard' && key !== "Equiptment" && key !== 'BirthdayMailsent' && key !== "AnnivaryMailsent" && key !== "isAdmin" && key !== "tenantId" && key !== "Apps" && key !== "createdAt" && key !== "updatedAt" && key !== "Conversations" && key !== "isDev" && key !== "Attachments" && key !== '__v' && key!=="QrCode" && key!=="HistoricalPrice" && key!=="ActivityLog" && key !== "FOCID" && key !== "CopyID" && key !== "comments" && key !== 'customerId' && key !== 'cr' && key !== 'dr'&& key  !== "customer" && key !== "invoicerId" && key !=='salesPerson' && key !=="whId" && key !=="productId" && key !=="Vendor" && key !== "WHIDS" && key !== "WHID" && key !== "Attachment" && key !== "ActivitiyLog" && key !== "isAservice" && key !== "Van_Price"  && key !=="Market_Price" && key !== "WareHouse_Price"
    );

    // Convert data to worksheet format dynamically
    const formattedData = data.map((entry) => workSheetColumnsNames.map((key) => entry[key] || entry[key[0].$numberDecimal] || ""));

    // Create a new workbook & append data
    const workBook = XLSX.utils.book_new();
    const workSheetData = [workSheetColumnsNames, ...formattedData];
    const workSheet = XLSX.utils.aoa_to_sheet(workSheetData);
    XLSX.utils.book_append_sheet(workBook, workSheet, page);

    // Generate Excel file as a Blob
    const excelBuffer = XLSX.write(workBook, { bookType: "xlsx", type: "array" });
    const fileBlob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });

    // Trigger download
    saveAs(fileBlob, `${page}.xlsx`);

    // Show success toast
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: "info",
      title: "Download Completed",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  } catch (error) {
    ErrorMessage(error.message || "Error generating report")
  }
};



const generateQRCode = async (text) => {
  try {
    const qrCodeURL = await QRCode.toDataURL(text);
    return qrCodeURL; // Returns a base64 image string
  } catch (error) {
    console.error("Error generating QR Code:", error);
  }
};


//convert numbeers to words 
const totalInWords = (amount, currency) => {
  if (!Number.isFinite(amount) || amount < 0) {
    return "Invalid amount";
  }

  const ONES = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
  ];

  const TEENS = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const TENS = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  const SCALES = [
    ["Billion", 1_000_000_000],
    ["Million", 1_000_000],
    ["Thousand", 1_000],
    ["Hundred", 100],
  ];

  const toWords = (num) => {
    if (num === 0) return "Zero";

    if (num < 10) return ONES[num];

    if (num < 20) return TEENS[num - 10];

    if (num < 100) {
      return `${TENS[Math.floor(num / 10)]} ${
        ONES[num % 10]
      }`.trim();
    }

    for (const [label, value] of SCALES) {
      if (num >= value) {
        const major = Math.floor(num / value);
        const remainder = num % value;

        return `${toWords(major)} ${label} ${
          remainder ? toWords(remainder) : ""
        }`.trim();
      }
    }

    return "";
  };

  const wholeNumber = Math.floor(amount);

  const currencyName =
    currency?.Currency
      ? currency.Currency.charAt(0).toUpperCase() +
        currency.Currency.slice(1).toLowerCase()
      : "Currency";

  return `${toWords(wholeNumber)} ${currencyName} Only`;
};


async function postPayment(customerId, user, config) {
  const { value: formValues } = await Swal.fire({
    title: 'Register Down Payment',
    html: `
      <style>
        .swal2-input, .swal2-select {
          padding: .75rem 1rem;
          border: 1px solid #D1D5DB;
          border-radius: .375rem;
          font-size: 1rem;
          box-shadow: none;
          transition: border-color .2s, box-shadow .2s;
          width: 60%;
          margin-top: .5rem;
        }
        .swal2-input:focus, .swal2-select:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          outline: none;
        }
      </style>

      <div className="w-full p-1 justify-center overflow-hidden">
        <input
          id="swal-amount"
          type="number"
          min="1"
          class="swal2-input"
          placeholder="Amount (₦)"
        />
        <input
          id="swal-date"
          type="date"
          class="swal2-input"
          placeholder="Payment Date"
        />
        <input
          id="swal-ref"
          type="text"
          class="swal2-input"
          placeholder="Reference"
        />
        <select id="swal-method" class="swal2-select">
          <option value="" disabled selected>Select Payment Method</option>
          <option value="Cash">Cash</option>
          <option value="Transfer">Transfer</option>
        </select>
      </div>
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Submit',
    preConfirm: () => {
      const amount = document.getElementById('swal-amount').value;
      const date = document.getElementById('swal-date').value;
      const refInput = document.getElementById('swal-ref');
      let reference = refInput.value;
      const type = document.getElementById('swal-method').value;

      if (!amount || !date || !type) {
        Swal.showValidationMessage('Amount, Date, and Payment Method are required');
        return false;
      }

      // Auto-generate reference if type is Cash and reference is empty
      if (type === 'Cash' && !reference) {
        const timestamp = Date.now();
        reference = `Cash-${timestamp}`;
        refInput.value = reference; // Update the input field visually
      }

      if (!reference) {
        Swal.showValidationMessage('Reference is required');
        return false;
      }

      return { amount, date, reference, type };
    },
    showClass: {
      popup: 'animate__animated animate__fadeInUp animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutDown animate__faster'
    }
  });

  if (!formValues) return; // User cancelled

  Swal.fire({
    title: 'Registering payment Entry …',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const response = await fetch(`${EXPRESS_PRIVATE_URL}/api/Payment/${customerId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config?.headers || {})
      },
      body: JSON.stringify({
        customer: customerId,
        Amount: formValues.amount,
        Date: formValues.date,
        paymentReferenceNo: formValues.reference,
        type: formValues.type,
        Accountant: user
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Payment failed');
    }

    Swal.fire({
      icon: 'success',
      title: 'Payment Registered and pending approval',
      html: `
        <p><strong>Amount:</strong> ₦${escapeHtml(formValues.amount)}</p>
        <p><strong>Date:</strong> ${escapeHtml(formValues.date)}</p>
        <p><strong>Reference:</strong> ${escapeHtml(formValues.reference)}</p>
        <p><strong>Method:</strong> ${escapeHtml(formValues.type)}</p>
      `,
      confirmButtonText: 'OK'
    });

    window.location.href = `/auth/V4/payment/payment/${Encrypt(data.data)}?Module=payment`;
  } catch (err) {
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: err.message || 'Something went wrong. Please try again.',
      confirmButtonText: 'Close'
    });
  }
}


async function GenerateSummary(customerId) {
  const { value: formValues } = await Swal.fire({
    title: 'Generate Statement',
    html: `
      <style>
        .swal2-input {
          padding: .75rem 1rem;
          width: 50%;
          border: 1px solid #D1D5DB;
          border-radius: .375rem;
          font-size: 1rem;
          box-shadow: none;
          margin-bottom: .75rem;
          transition: border-color .2s, box-shadow .2s;
        }
        .swal2-input:focus {
          border-color: #3B82F6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          outline: none;
        }
      </style>

      <input
        id="report-start"
        type="date"
        class="swal2-input"
        placeholder="Start Date"
      />
      <input
        id="report-end"
        type="date"
        class="swal2-input"
        placeholder="End Date"
      />
    `,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'Generate',
    preConfirm: () => {
      const startDate = document.getElementById('report-start').value;
      const endDate = document.getElementById('report-end').value;
      if (!startDate || !endDate) {
        Swal.showValidationMessage('Please select both dates');
      }
      return { startDate, endDate };
    },
    showClass: {
      popup: 'animate__animated animate__fadeInUp animate__faster'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOutDown animate__faster'
    }
  });

  if (!formValues) return;

  Swal.fire({
    title: 'Fetching report…',
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading()
  });

  try {
    const start =  formValues.startDate
    const end = formValues.endDate

    const response = await fetch(`/api/crm/${customerId}?Start=${start}&End=${end}`);
    const data = await response.json();

    const downloadeData = data.transcations

    if (!response.ok) {
      throw new Error(data.error || 'Unable to generate report');
    }

    Swal.fire({
      icon: 'success',
      title: 'Report Ready',
      confirmButtonText: 'Close'
    });

     downloadExcel(downloadeData,`${start}-${end} Report`)

  } catch (err) {
    ErrorMessage(err.message)
  }
}


const pricelistSetter = (priceList, Business) => {
  switch (priceList) {
    case 'Pricelist1':
      return Business.priceList1;
    case 'Pricelist2':
      return Business.priceList2;
    case 'Pricelist3':
      return Business.priceList3;
    case 'Pricelist4':
      return Business.priceList4;
    case 'Pricelist5':
      return Business.priceList5;
    case 'Pricelist6':
      return Business.priceList6;
    case 'Pricelist7':
      return Business.priceList7; 
    default:
      return priceList;
  }
};



module.exports = {
  termsAndConditions,
  Encrypt,
  UpdateEmployeeData,
  UpdateEmployeeModules,
  downloadExcel,
  Dencrypt,
  generateQRCode,
  formatMongooseError,
  totalInWords,
  CryptoJSdecrypt,
  postPayment,
  GenerateSummary,
  EXPRESS_PRIVATE_URL,
  pricelistSetter
};
