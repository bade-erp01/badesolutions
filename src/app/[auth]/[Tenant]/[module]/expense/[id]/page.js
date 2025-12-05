"use client";
import { useState } from "react";
import Image from "next/image";
import {
  plsWait,
  ErrorMessage,
  SuccessToast,
  Encrypt,
} from "../../../../../../../Functions/Mics";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Page({ data, Currentuser, business, baseUrl }) {
  const [expense] = useState(data.expense);
  const Router = useRouter();
  const [AccountList] = useState(data.Accounts || []);
  const [formData, setFormData] = useState({
    BankAccount: "",
    Amount: expense.Amount || "",
    paymentDate: expense.paymentDate?.slice(0, 10) || "",
    status: "",
    Accountant: `${Currentuser.firstName} ${Currentuser.lastName}`
  });

  // getBankAccount
  const getBankAccount = (accountId) => {
    try {
      const account = AccountList.find((acc) => acc._id === accountId);
      return account ? account.NAME : "N/A";
    } catch (err) {
      return "N/A";
    }
  };

  const DeleteExpense = async () => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This action will permanently delete the expense.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) {
      Swal.fire("Cancelled", "Expense deletion was aborted.", "info");
      return;
    }

    try {
      plsWait("Submitting delete request...");

      const request = await fetch(
        `${baseUrl}/api/Expense/${Encrypt(expense._id)}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${business.tenantId}`,
            dbConnect: `Bearer ${business.rustyRoof}`,
            access: `${Encrypt(Currentuser._id)}`,
          },
        }
      );

      const response = await request.json();

      if (request.ok) {
        Swal.fire("Deleted!", "Expense has been deleted.", "success");
        Router.back();
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      ErrorMessage(err.message);
    }
  };


// Action Button Handler
  const ActionBTN = async (action) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: `This action will set Expense as ${action} and register entries into Head and sub accounting Ledgers.`,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "green",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Proceed",
      cancelButtonText: "Cancel",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      setFormData({ ...formData, status: action });
      
      // validate user input and ensure all fields are filled
      if (
        action === "Approved" && !formData.Amount ||
        action === "Approved" && !formData.paymentDate ||
        action === "Approved" && !formData.status ||
        action === "Approved" && !formData.BankAccount
      ) {
        ErrorMessage("Validation Error,Please fill in all fields.");
        return;
      }
      
      plsWait(`Submitting ${action} request...`);

      const request = await fetch(
        `${baseUrl}/api/Expense/${Encrypt(expense._id)}`,
        {
          method: "PATCH",
          body: JSON.stringify(formData),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Encrypt(business.tenantId)}`,
            dbConnect: `Bearer ${business.rustyRoof}`,
            access: Encrypt(Currentuser._id),
          },
        }
      );

      const response = await request.json();

      if (request.ok) {
        SuccessToast(response.message);
        Router.refresh();
        location.reload();
      } else {
        throw new Error(response.error);
      }
    } catch (err) {
      ErrorMessage(err.message);
      Router.refresh();
      location.reload();
    }
  };

  return (
    <>
      <div className="max-w-full p-3 m-3 md:py-10 bg-white shadow-md animate__animated animate__fadeIn rounded-lg">
        {/* Product Image */}
        <div className="w-full flex justify-center mb-3">
          {expense.image ? (
            <Image
              src={expense.image}
              alt="Product Image"
              width={50}
              height={50}
              quality={75} // Adjust quality for balance between size and clarity
              priority={false} // Set to true only if this image is above the fold
              loading="lazy" // Lazy load images not immediately visible
              placeholder="blur" // Optional: use blur placeholder if available
              blurDataURL={expense.image || "/placeholder.png"} // Fallback blur image
              className="rounded-lg object-contain"
            />
          ) : (
            <div className="w-[180px] h-[180px] flex items-center justify-center bg-gray-100 text-gray-500 rounded-lg">
              No Image Available
            </div>
          )}
        </div>

        {/* Workflow Status Tracker */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {/* Pending */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                expense.status === "pending" ? "bg-yellow-500" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-xs mt-1 text-gray-700">Pending</span>
          </div>

          {/* Line */}
          <div className="flex-1 h-0.5 bg-black"></div>

          {/* Approved */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                expense.status === "Approved" ? "bg-green-600" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-xs mt-1 text-gray-700">Approved</span>
          </div>

          {/* Line */}
          <div className="flex-1 h-0.5 bg-black"></div>

          {/* Cancelled */}
          <div className="flex flex-col items-center">
            <div
              className={`w-3 h-3 rounded-full ${
                expense.status === "Reversed" ? "bg-red-600" : "bg-gray-300"
              }`}
            ></div>
            <span className="text-xs mt-1 text-gray-700">Reversed</span>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* currentQty */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Reference-No:
              </label>
              <h3 className="text-gray-700 text-xl font-medium">
                {expense?.refNo}
              </h3>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Payee
              </label>
              <h5 className="text-gray-700 text-sm font-medium">
                {" "}
                {expense.payee}
              </h5>
            </div>

            {/* pcs */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Raised By:
              </label>
              <h5 className="text-gray-700 text-sm font-medium">
                {expense?.initiatorId}
              </h5>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Request Date:
              </label>
              <h5 className="text-gray-700 text-sm font-medium">
                {expense?.Date}
              </h5>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Store:
              </label>
              <h5 className="text-gray-700 text-sm font-medium">
                {expense?.WHID.WHName}
              </h5>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Requested Amount:
              </label>
              {Currentuser.expenseApprover && expense.status === "pending" ? (
                <input
                  type="number"
                  value={formData?.Amount}
                  min={1}
                  step="any"
                  name="Amount"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, Amount: e.target.value })
                  }
                  placeholder="Modify amount paid here"
                  className="bg-white px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
              ) : (
                <h5 className="text-gray-700 text-sm font-medium">
                  {expense?.Amount}
                </h5>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                payment Date:
              </label>
              {Currentuser.expenseApprover && expense.status === "pending" ? (
                <input
                  type="date"
                  value={formData.paymentDate}
                  name="paymentDate"
                  onChange={(e) =>
                    setFormData({ ...formData, paymentDate: e.target.value })
                  }
                  className="bg-white px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                />
              ) : (
                <h5 className="text-gray-700 text-sm font-medium">
                  {expense?.paymentDate}
                </h5>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expense Account:
              </label>
              {Currentuser.expenseApprover && expense.status === "pending" ? (
                <select
                  id="BankAccount"
                  name="BankAccount"
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, BankAccount: e.target.value })
                  }
                  value={formData.BankAccount}
                  className="bg-white px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-700 placeholder-gray-400"
                >
                  <option disabled value="">
                    Choose...
                  </option>
                  {AccountList.map((acc) => (
                    <option key={acc._id} value={acc._id}>
                      {acc.NAME}
                    </option>
                  ))}
                </select>
              ) : (
                <h5 className="text-gray-700 text-sm font-medium">
                  {expense?.BankAccount?.NAME}
                </h5>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Remarks:
              </label>
              <h5 className="text-gray-700 text-sm font-medium">
                {expense?.remarks}
              </h5>
            </div>
          </div>

          {/* Submit Button */}
        </form>

        <div className="flex flex-wrap gap-4 pt-2">
          {Currentuser.expenseApprover && expense.status === "pending" && (
            <>
              <button
                onClick={() => ActionBTN("Approved")}
                className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-green-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400"
                aria-label="Approve Expense"
              >
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m4.5 12.75 6 6 9-13.5"
                  ></path>
                </svg>
                <span className="text-sm font-semibold">Approve Expense</span>
              </button>

              <button
                onClick={DeleteExpense}
                className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg shadow hover:bg-red-700 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 "
                aria-label="Delete Expense"
              >
                <svg
                  data-slot="icon"
                  fill="none"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  className="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                  ></path>
                </svg>
                <span className="text-sm font-semibold">Delete Expense</span>
              </button>
            </>
          )}

          {Currentuser.expenseApprover && expense.status === "Approved" && (
            <button
              onClick={() => ActionBTN("Reversed")}
              className="flex items-center gap-2 bg-red-400 text-white px-5 py-2.5 rounded-lg shadow hover:bg-red-500 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-400 "
              aria-label="Reverse Expense"
            >
              <svg
                data-slot="icon"
                fill="none"
                strokeWidth="1.5"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="w-5 h-5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                ></path>
              </svg>
              <span className="text-sm font-semibold">Reverse Expense</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
}
