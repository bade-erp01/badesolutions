import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import DebtorsReportModal from "@/app/Components/Reports/DebtorsReport";
import ReceivablesAgingModal from "@/app/Components/Reports/AgingSchedul";
import Users from "../../../../../../models/Users";
import Link from "next/link";
import { Encrypt } from "../../../../../../Functions/Mics";
import { pricelistSetter } from "../../../../../../Functions/Functions";
import CustomerCategoryPieChart from "@/app/Components/CustomerCategory";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import BulkUploader from "@/app/Components/BulkUploadProduct";
import { notFound } from "next/navigation";
import axios from "axios";
import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import React, { Suspense } from "react";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import CustomerGrid from "./CustomerGrid";
import Notch from "@/app/Components/Notch";
import { PlusIcon, UserIcon,Plus,Package } from "lucide-react";

export default async function crmLayout({ params }) {
  const userData = await fetchUser(); // Fetch user data
  const RawUsers = await Users.findByTenant(userData.business.tenantId)
    .select("firstName lastName")
    .lean();
  const StringedUser = JSON.stringify(RawUsers);
  const parsedUsers = JSON.parse(StringedUser);

  let customerList = [];

  const FilterSaLePerson = (id) => {
    try {
      const SP = parsedUsers.find((user) => user._id === id);
      return `${SP.firstName} ${SP.lastName}` || "N/A";
    } catch (err) {
      return "N/A";
    }
  };

  try {
    const crmApp = userData.user.Apps.find((app) => app.Name === "CRM");

    // Option 1: Strict check (only allow if they have CRM or are on Basic plan)
    if (userData.business?.subscriptionplan !== "Basic" && !crmApp) {
      return notFound(); // or redirect, or show upgrade message
    }

    const baseUrl = process.env.EXPRESS_PRIVATE_URL;

    const res = await axios.get(`${baseUrl}/api/crm`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
        sessionKey: `Bearer ${Encrypt(userData.SessionId)}`,
      },
      next: { revalidate: 120 }, // cache for 2 minutes
    });

    customerList = res.data;
  } catch (error) {
    return (
      <div className="text-red-500 p-6">
        Failed to load. Please try again later.
      </div>
    );
  }

  const moduleParams = await params;

  return (
    <div className="h-screen">
      <div className="">
        {/* Sidebar */}
        <Notch>
          <Link
            href={`/${moduleParams.auth}/V4/Sales/Sales`}
            className="flex items-center gap-3 p-3 rounded-md hover: transition hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <ClipboardDocumentListIcon className="h-6 w-6" />
            <span className="text-xs">Sales Management</span>
          </Link>

          {userData?.user?.isAdmin && (
            <>
              <BulkUploader tenantId={userData} collectionName="customer" />
              {customerList.length > 0 && (
                <ExcelDownloadBtn
                  data={customerList.map((customer) => ({
                    Name: customer.Username,
                    Email: customer.Email,
                    Phone: customer.phone,
                    Code: customer.CustomerCode,
                    state: customer.State || customer.state,
                    Rep: FilterSaLePerson(customer.salesPerson),
                    Manager: FilterSaLePerson(
                      customer.Manager || customer.accountManager,
                    ),
                    creditLimit: customer.creditLimit,
                    balance: customer.Debt,
                    priceList: pricelistSetter(
                      customer.priceList,
                      userData.business,
                    ),
                    lastTransactionDate: customer.lastPayDate,
                    Tags: customer.category,
                  }))}
                  page="CRM list"
                />
              )}
            </>
          )}

          {userData.user.ReportUser && (
            <>
              <DebtorsReportModal
                users={parsedUsers}
                business={userData.business}
                data={customerList}
              />
              <ReceivablesAgingModal data={customerList} />
            </>
          )}

          {userData.user.createCustomer && (
            <Link
              href={`/${moduleParams.auth}/V4/Forms/crm`}
              className="flex items-center gap-3 p-3 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              <div className="relative">
                <UserIcon className="h-6 w-6" />
                <PlusIcon className="absolute -bottom-1 -right-1 h-4 w-4 bg-primary text-primary-foreground rounded-full p-0.5" />
              </div>
              <span className="text-xs">Create New Customer</span>
            </Link>
          )}
        </Notch>

        {/* Main Content */}
        <main className="overflow-y-auto">
          <Suspense fallback={<SuspenenseFallBack pagedata={"Customer"} />}>
            <section className="w-full flex flex-col gap-6 rounded-lg">
              {customerList.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                  <div className="w-20 h-20 rounded-full bg-gray-800/60 flex items-center justify-center mb-6">
                    <Package className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">
                    No Customer yet
                  </h3>
                  <p className="text-sm text-gray-400 max-w-sm mb-6">
                    Get started by adding your first Customer. Once you create
                    one, it will appear here.
                  </p>
                  {userData?.user?.createCustomer && (
                    <Link
                      href={`/${moduleParams.auth}/V4/Forms/crm`}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition"
                    >
                      <Plus className="h-4 w-4" />
                      Create Customer
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {userData.user.c_levelDash && (
                    <div className="shadow-xl bg-white/60 backdrop-blur-md transition-all duration-700 mb-5">
                      <CustomerCategoryPieChart
                        customersList={customerList}
                        userData={userData}
                      />
                    </div>
                  )}

                  {/* Customer Cards */}
                  <CustomerGrid
                    customerList={customerList}
                    moduleParams={moduleParams.module}
                  />
                </>
              )}
            </section>
          </Suspense>
        </main>
      </div>
    </div>
  );
}
