import { fetchUser } from "../../../../../../Functions/useerDataRefresh";
import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import DebtorsReportModal from "@/app/Components/Reports/DebtorsReport";
import ReceivablesAgingModal from "@/app/Components/Reports/AgingSchedul";
import Users from "../../../../../../models/Users";
import Link from "next/link";
import { Encrypt } from "../../../../../../Functions/Mics";
import CustomerCategoryPieChart from "@/app/Components/CustomerCategory";
import Card from "@/app/Components/Card";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import BulkUploader from "@/app/Components/BulkUploadProduct";
import Footer2 from "@/app/Components/Footer2";
import { notFound } from "next/navigation";
import axios from "axios";
import {
  ClipboardDocumentListIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import React, { Suspense } from "react";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";

export default async function crmLayout({ params }) {
  const userData = await fetchUser(); // Fetch user data
  const RawUsers = await Users.findByTenant(userData.business.tenantId).select("firstName lastName").lean();
  const StringedUser = JSON.stringify(RawUsers);
  const parsedUsers = JSON.parse(StringedUser);

  let customerList = [];

  try {
    const AppFinder = userData.user.Apps.find((app) => app.Name === "CRM");

    if (!AppFinder) {
      return notFound();
    }

    const baseUrl = process.env.EXPRESS_PRIVATE_URL;

    const res = await axios.get(`${baseUrl}/api/crm`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
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
    <div className="flex flex-col h-screen">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={moduleParams.module}
        Module={customerList}
      />

      <div className="flex flex-1 overflow-hidden text-white">
        {/* Sidebar */}
        <aside className="bg-[#1e1e20]/70 backdrop-blur-md w-72 px-4 py-6 overflow-hidden">
          <BackButton />
          <hr />
          <nav className="space-y-4">
            {userData?.user?.createCustomer && (
              <Link
                href={`/${userData.business.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                  userData.user._id
                )}/Module/Forms/${moduleParams.module.toLowerCase()}`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <PlusCircleIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">Create Customer</span>
              </Link>
            )}

            {userData?.user?.raiseInvoice && (
              <Link
                href={`/${userData.business.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                  userData.user._id
                )}/invoice/invoice`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">Invoicing</span>
              </Link>
            )}

            {/* {userData?.user?.isAdmin && (
              <>
                <BulkUploader
                  tenantId={userData}
                  collectionName="customer"
                />
                {customerList.length > 0 && (
                  <ExcelDownloadBtn
                    data={customerList}
                    page="CRM list"
                  />
                )}
              </>
            )} */}

            <DebtorsReportModal
              users={parsedUsers}
              business={userData.business}
              data={customerList}
            />
            <ReceivablesAgingModal data={customerList} />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<SuspenenseFallBack pagedata={"Customer"} />}>
            <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-6">
              {customerList.length === 0 ? (
                <>
                  <div className="text-center text-gray-700">
                    <h2 className="text-2xl font-semibold mb-4">
                      No Customers Found
                    </h2>
                    <p className="mb-6">
                      It looks like you haven't added any customers yet. Start
                      by creating a new customer to manage your relationships
                      effectively.
                    </p>
                  </div>
                </>
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
                  <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6">
                    {customerList
                      .sort((a, b) => a.Username.localeCompare(b.Username))
                      .map((element) => (
                        <Card
                          key={element._id}
                          data={element}
                          module={moduleParams.module}
                        />
                      ))}
                  </div>
                </>
              )}
            </section>
          </Suspense>
        </main>
      </div>

      <Footer2 />
    </div>
  );
}
