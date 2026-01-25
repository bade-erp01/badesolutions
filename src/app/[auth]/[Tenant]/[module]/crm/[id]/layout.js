import React, { Suspense, lazy } from "react";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Dencrypt, Encrypt } from "../../../../../../../Functions/Functions";
import axios from "axios";
import Employee from "../../../../../../../models/Users";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import Footer2 from "@/app/Components/Footer2";
import {
  ClipboardDocumentListIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const SingleCustomerpage = lazy(() => import("./page"));

export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params;
  let data = {};
  const staffRaw = await Employee.findByTenant(userData.business.tenantId)
    .select("firstName lastName")
    .lean();
  const StringedStaff = JSON.stringify(staffRaw);
  const ParsedStaff = JSON.parse(StringedStaff);

  try {
    const baseUrl = process.env.EXPRESS_PRIVATE_URL;

    const res = await axios.get(`${baseUrl}/api/crm/${decoy.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
      },
    });

    data = await res.data; // No need to await this
  } catch (err) {
    return (
      <div className="text-red-500 p-6">
        Failed to load. Please try again later.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <Nav1
        user={userData.user}
        business={userData.business}
        page={data.result.Username}
      />

      <div className="flex flex-1 text-white bt-2">
        {/* Sidebar */}
        <aside
          className="w-70 bg-[#1e1e20]/70 backdrop-blur-md text-white px-4 py-6 transition-all duration-300 max-h-[90dvh] md:block"
          style={{ overflowY: "auto" }}
        >
          <BackButton />
          <hr />
          <nav className="space-y-4">
            {userData?.user?.createCustomer && (
              <Link
                href={`/${userData.business.companyName
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                  userData.user._id,
                )}/Module/Forms/${decoy.module.toLowerCase()}`}
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
                  userData.user._id,
                )}/invoice/invoice`}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
              >
                <ClipboardDocumentListIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">Invoicing</span>
              </Link>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <section className="w-full max-w-screen-xl mx-auto flex flex-col gap-6 rounded-lg p-7 relative z-10 max-h-[83dvh] overflow-y-auto">
            <Suspense
              fallback={
                <SuspenenseFallBack pagedata={`${data.result?.Username}`} />
              }
            >
              <SingleCustomerpage
                userInfo={userData}
                data={data}
                cust={data.result}
                salesPerson={ParsedStaff}
              />
            </Suspense>
          </section>
        </main>
      </div>

      <Footer2 />
    </div>
  );
}
