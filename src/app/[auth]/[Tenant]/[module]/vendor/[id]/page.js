"use client";
import Swal from 'sweetalert2';
import {useRouter} from "next/navigation";
import {ClipboardIcon,PrinterIcon,BanknotesIcon} from "@heroicons/react/24/outline";
import { plsWait, ErrorMessage,SuccessToast } from "../../../../../../../Functions/Mics";
import axios from "axios";
import moment from "moment";
import { useEffect } from 'react';
import Plotly from 'plotly.js-dist-min';
import { Encrypt,Dencrypt,EXPRESS_PRIVATE_URL } from "../../../../../../../Functions/Functions";
import {driver} from "driver.js";
import "driver.js/dist/driver.css"; // Make sure the CSS is imported!
import {useState} from 'react'
import Image from "next/image"


export default function SingleVendorpage({AccountingFinder,userInfo,Backdata,wh,baseUrl,banks,Locations}) {
  const [user] = useState(userInfo);
  const [data] = useState(Backdata);
  const router = useRouter()

  useProductEditTour(Backdata.Name) // for driver

  const [headers] = useState({
    "Content-Type": "application/json",
    Authorization: `Bearer ${Encrypt(userInfo.business.tenantId)}`,
    "X-Requested-With": "XMLHttpRequest",
     dbConnect:`Bearer ${userInfo.business.rustyRoof}`,
     access:`${Encrypt(userInfo.user._id)}`
  });



const RFP = async () => {
  Swal.fire({
    title: '<strong class="text-xl font-semibold">📦 New Purchase Request </strong>',
    html: `
      <div class="space-y-4 text-left">
        <div>
          <label for="warehouse" class="block font-medium mb-1">Store</label>
          <select id="warehouse" class=" w-full border rounded px-3 py-2">
            <option value="">Select a warehouse</option>
             ${wh.map(
            (wh) => `<option value="${wh._id}">${wh.WHName}</option>`
          ).join('')}
          </select>
        </div>
        <div>
          <label for="receivedDate" class="block font-medium mb-1">Received Date</label>
          <input type="date" id="receivedDate" class="w-full border rounded px-3 py-2">
        </div>
        <div>
          <label for="refNo" class="block font-medium mb-1">Ref No</label>
          <input type="text" id="refNo" class=" w-full border rounded px-3 py-2" placeholder="Enter reference number">
        </div>
      </div>
    `,
    showCancelButton: true,
    confirmButtonText: '<span class="font-semibold">🚀 Submit</span>',
    cancelButtonText: '<span class="text-gray-300">Cancel</span>',
    customClass: {
      popup: 'max-w-md p-6 rounded-lg',
      confirmButton: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700',
      cancelButton: 'bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300'
    },
    preConfirm: () => {
      const warehouse = document.getElementById('warehouse').value.trim();
      const recievedDate = document.getElementById('receivedDate').value.trim();
      const refNo = document.getElementById('refNo').value.trim();
      const vendor = data._id;

      if (!warehouse || !recievedDate || !refNo || !vendor) {
        Swal.showValidationMessage('⚠️ All fields must be filled out.');
        return false;
      }

      return { warehouse, recievedDate, refNo ,vendor};
    }
  }).then(async (result) => {
    if (result.isConfirmed) {
      plsWait('setting things up... please wait')
      //send  post request to server
      const request = await fetch(`${baseUrl}/api/purchase/request`,{
        method:'POST',
        body:JSON.stringify( result.value),
        headers
      })

      const res = await request.json()

      if(res.newPurchase){
        router.push(`/${userInfo.business.companyName}/${userInfo.user._id}/Module/purchase-request/${res.newPurchase}`)
      }else{
        ErrorMessage(res.error)
      }
    }
  });
};



   const [formData, setFormData] = useState({...data})
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    
  };


  const handleSubmit = async (e) =>{
    try {
      e.preventDefault()
      plsWait('Updating ...')
     const { data } = await axios.patch(`${baseUrl}/${userInfo.business.companyName}/vendor/update/${Encrypt(Backdata._id)}`,formData,{headers})

     if (data && data.message) {
       SuccessToast(data.message);
       router.refresh();
     } else {
       throw new Error(data.error);
     }

    } catch (error) {
      ErrorMessage(error.message)
    }
  }


  // post payment for vendor
  async function postPayment(customerId) {
    const { value: formValues } = await Swal.fire({
      title: 'Register Payment',
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
            <option value="" disabled selected>Select Payment Journal</option>
            ${banks.map(bank => `<option value="${Encrypt(bank._id)}">${bank.NAME}</option>`).join('')}
          </select>
          <select id="swal-location" class="swal2-select">
            <option value="" disabled selected>Select Location</option>
            ${Locations.map(location => `<option value="${Encrypt(location._id)}">${location.name}</option>`).join('')}
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
        const location = document.getElementById('swal-location').value;

        if (!amount || !date || !type || !reference) {
          Swal.showValidationMessage('Amount, Date, Bank Journal, and Reference are required');
          return false;
        }
  
        // Auto-generate reference if type is Cash and reference is empty
        // if (type === 'Cash' && !reference) {
        //   const timestamp = Date.now();
        //   reference = `Cash-${timestamp}`;
        //   refInput.value = reference; // Update the input field visually
        // }
  
        if (!reference) {
          Swal.showValidationMessage('Reference is required');
          return false;
        }
  
        return { amount, date, reference, type, location  };
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
      title: 'Registering Vendor payment…',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  
    try {
      const response = await fetch(`${baseUrl}/api/Payable/Payment`, {
        method: 'POST',
        body: JSON.stringify({
          vendor: Dencrypt(customerId),
          Amount: formValues.amount,
          PaymentDate: formValues.date,
          billReferenceNo: `VND-PYMT-${formValues.reference}`,
          bankAccount: Dencrypt(formValues.type),
          location: formValues.location !== "" ? Dencrypt(formValues.location):"",
          AccountatntId: `${userInfo.user.firstName} ${userInfo.user.lastName}`,
        }),
        headers,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }
  
      Swal.fire({
        icon: 'success',
        title: 'Payment Registered and pending approval',
        html: `
          <p><strong>Amount:</strong> ₦${formValues.amount}</p>
          <p><strong>Date:</strong> ${formValues.date}</p>
          <p><strong>Reference:</strong> ${formValues.reference}</p>
        `,
        confirmButtonText: 'OK'
      });
  
      window.location.href = `/${userInfo.business.companyName.trim()}/${Encrypt(userInfo.user._id)}/accounting/accounting/vendorsPayment/vendorsPayment/${data.data}`;
    } catch (err) {
      ErrorMessage(err.message || 'Something went wrong. Please try again.')
    }
  }


  return (
    <>
      <div className=" p-4 rounded shadow-2xl border-lg border-2-black bg-white animate__animated animate__fadeInUpBig animate__delay-2s">
        <form className="space-y-5 mx-auto" onSubmit={handleSubmit}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h4 className="text-xl font-bold text-gray-800">
              {Backdata.Name.charAt(0).toUpperCase() + Backdata.Name.slice(1)}
            </h4>
            <span
              className={`px-5 py-1.5 rounded-full font-small font-semibold tracking-wide shadow-sm border bg-indigo-50 text-indigo-700 border-indigo-200`}
            >
            Balance: {Backdata.Balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </span>
          </div>
          <div className="flex flex-wrap gap-8 items-center py-4">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="w-28 h-28 rounded overflow-hidden bg-gradient-to-tr from-gray-200 to-gray-300 shadow-sm border-2 border-gray-300 flex items-center justify-center">
                <Image height={40} width={40}
                  src={data.image || "https://img.icons8.com/?size=100&id=6LvtpL48Lmmx&format=png"}
                  alt="Avatar"
                  quality={100}
                  priority={true}
                  loading='eager'
                  className="w-full h-full object-cover"
                />
              </div>
             
            </div>

            {/* Divider */}
            <div className="hidden md:block h-24 border-l border-gray-200 mx-6"></div>
            {!formData.block_vendor && userInfo.user.raiseLpo && (
            <span onClick={RFP}  className="bg-gray-500 flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"> 
              <ClipboardIcon className="h-6 w-6 text-gray-100" />
              Request for Purchase
            </span>
            )}

            {AccountingFinder && !formData.block_vendor && userInfo.user.postVendorPayment &&(
              <span onClick={() => postPayment(Encrypt(formData._id))}  className="bg-gray-500 flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"> 
              <BanknotesIcon className="h-6 w-6 text-gray-100" />
              Pay Supplier
            </span>
            )}

            {/* <span onClick={RFP}  className="bg-gray-500 flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"> 
              <PrinterIcon className="h-6 w-6 text-gray-100" />
              Generate Report
            </span> */}

          </div>

          {/* Sales Insight */}
          {/* <ProductChart
            productId={Backdata._id}
            productName={Backdata.Name}
            umo={Backdata.UMO}
            business={businessInfo}
          /> */}

          <div className="border-b bg- border-gray-900/10 pb-12">
            <h2 className="text-base/7 font-semibold text-gray-900">
              Vendor Information
            </h2>
            <p className="mt-1 text-sm/6 text-gray-600">
              Ensure to provide correct Information.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label
                  htmlFor="Name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Name
                </label>
                <div className="mt-2">
                 
                    <input
                      id="Name"
                      name="Name"
                      type="text"
                      value={formData.Name}
                      required
                      onChange={handleChange}
                      autoComplete="Name-name"
                      className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                    />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Categories"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Vendor category
                </label>
                <div className="mt-2">
                  <select
                  id="Categories"
                  name="Categories"
                  onChange={handleChange}
                  required
                  className='block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'
                  >
                    <option value={formData.Categories} className="text-gray-400">{formData.Categories || "Choose a category"}</option>
                    <option value="Wholesale">Wholesale</option>
                    <option value="Retail">Retail</option>
                    <option value="Distribution">Distribution</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="email"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Vendor Email
                </label>
                <div className="mt-2">
                  <input
                    value={formData.email}
                    required
                    id="email"
                    name="email"
                    type="email"
                    onChange={handleChange}
                    autoComplete="email"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="vendor_tel"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Telephone Number
                </label>
                <div className="mt-2">
                  <input
                    value={formData.vendor_tel}
                    id="vendor_tel"
                    name="vendor_tel"
                    type="text"
                    onChange={handleChange}
                    autoComplete="vendor_tel"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Address"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Address
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Address}
                    id="Address"
                    required
                    name="Address"
                    onChange={handleChange}
                    type="text"
                    autoComplete="Address"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="Account_num"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                 Account Number
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Account_num}
                    id="Account_num"
                    name="Account_num"
                    type="text"
                    onChange={handleChange}
                    autoComplete="Account_num"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Account_name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Account Title
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Account_name}
                    id="Account_name"
                    name="Account_name"
                    onChange={handleChange}
                    type="text"
                    autoComplete="Account_name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>


              <div className="sm:col-span-2 sm:col-start-1">
                <label
                  htmlFor="Bank_name"
                  className="block text-sm/6 font-medium text-gray-900"
                >
                  Bank Name
                </label>
                <div className="mt-2">
                  <input
                    value={formData.Bank_name}
                    id="Bank_name"
                    name="Bank_name"
                    onChange={handleChange}
                    type="text"
                    autoComplete="Bank_name"
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                  />
                </div>
              </div>


              <div className="sm:col-span-2">
                <label
                  htmlFor="block_vendor"
                  className="block text-sm font-medium text-gray-900"
                >
                  Block this vendor?
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    checked={formData.block_vendor || false}
                    onChange={handleChange}
                    id="block_vendor"
                    name="block_vendor"
                    type="checkbox"
                    className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
              </div>

            </div>
          
          </div>

         {user.user.editVendor && (
                  <button
                    type="submit"
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-500 focus-visible:outline-indigo-600 transition"
                  >
                    Update {formData.Name}
                  </button>
                )}
        </form>
      </div>
    </>
  );
}



function Section({ title, children }) {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {children}
    </div>
  );
}



function ProductChart({ productId, productName, umo, business }) {
  const [loading, setLoading] = useState(true);
  const [monthlySalesArray, setMonthlySalesArray] = useState([]);
  const [errormssg,setErrorMssg] = useState("");
  const [tottalSales, setTotalSales] = useState();

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const currentYear = moment().format("YYYY");
        const url = `${EXPRESS_PRIVATE_URL}/${business.companyName}/SalseandStock?Year=${currentYear}`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${Encrypt(business.tenantId)}`,
            dbConnect:`Bearer ${userInfo.business.rustyRoof}`,
            access:`${Encrypt(userInfo.user._id)}`
          },
        });


        const result = await response.json();
        if (!result?.invoice) return;

        const data = result.invoice.flatMap((invoice) =>
          invoice.orders.map((order) => ({
            sold: order.total,
            InvoiceDate: invoice.startDate,
            _id: order.item._id,
          }))
        );

        const productSales = data.filter((item) => item._id === productId);

        const monthlySales = productSales.reduce((acc, curr) => {
          const month = moment(curr.InvoiceDate).format("MM");
          acc[month] = acc[month] || { sold: 0 };
          acc[month].sold += curr.sold;
          return acc;
        }, {});

        // Fill missing months
        for (let i = 1; i <= 12; i++) {
          const monthStr = i.toString().padStart(2, "0");
          if (!monthlySales[monthStr]) {
            monthlySales[monthStr] = { sold: 0 };
          }
        }

        const formattedArray = Object.entries(monthlySales)
          .map(([month, data]) => ({ month, ...data }))
          .sort((a, b) => a.month.localeCompare(b.month));

        setMonthlySalesArray(formattedArray);
      } catch (err) {
        setErrorMssg("❌" + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [productId, productName, umo, business]);

  useEffect(() => {
    if (!loading && monthlySalesArray.length > 0) {
      const NDxArray = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const NDyArray = monthlySalesArray.map((item) => item.sold);
      const totalSales = NDyArray.reduce((sum, val) => sum + val, 0).toFixed(1);

      const chartTitle = `estimated net sales of ${business.currency?.currency?.Symbol}${totalSales} for ${moment().format("YYYY")}`;
      const chartColor = business?.Color || "#1e2939";

      const dataPlot = [{
        x: NDxArray,
        y: NDyArray,
        type: "scabarter",
        mode: "lines+markers",
        marker: { color: chartColor },
      }];
      setTotalSales(chartTitle);

      const layoutPlot = { title: chartTitle };

      Plotly.newPlot("myPlot", dataPlot, layoutPlot);
    }
  }, [loading, monthlySalesArray, business]);

 return (
  <>
    {/* Show error if exists */}
    {errormssg ? (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-lg font-semibold">
          {errormssg}
        </div>
      </div>
    ) : (
      // No error: show loading spinner or chart
      loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-9 w-9 border-t-2 border-blue-500"></div>
        </div>
      ) : (
        <div id="code">
          <h5 className="text-lg font-semibold text-gray-700 mb-1">
            📈 Month-on-Month Sales Insight for {productName},{tottalSales} 
            <br/>
            <hr/>
            <br/>
            <i className="text-gray-500 text-sm">Last updated: {moment().format("YYYY-MM-DD HH:mm:ss")}</i>
          </h5>
          <div id="myPlot" className="" style={{ width: "100%", height: "400px" }} />
        </div>
      )
    )}
  </>
);

}


function useProductEditTour(product) {
  useEffect(() => {
    if (typeof window === "undefined") return; // Prevent SSR crash

    const ProductTour = localStorage.getItem("ProductTour");

    if (!ProductTour && product) {
      const timeoutId = setTimeout(() => {
        localStorage.setItem("ProductTour", "ProductTour");

        const driverObj = driver({
          showProgress: true,
          popoverClass: "driverjs-theme",
          steps: [
            {
              element: "#code",
              popover: {
                title: "Product sales Insight",
                description: `Get real-time analytics insight on ${product} estimated sales for the current year.`,
                side: "left",
                align: "start",
              },
            },
            {
              element: "#qrcode",
              popover: {
                title: "QR-CODE",
                description: "Scan the QR code to view product on another device.",
                side: "right",
                align: "end",
              },
            },
            {
              element: "#others",
              popover: {
                title: "VAT & Others",
                description: "Manage VAT and other applicable charges on the product.",
                side: "left",
                align: "start",
              },
            },
          ],
        });

        driverObj.drive();
      }, 60000); // ⏳ Delay for 1 minute (60000 ms)

      // Cleanup in case the component unmounts before timeout
      return () => clearTimeout(timeoutId);
    }
  }, [product]);
}
