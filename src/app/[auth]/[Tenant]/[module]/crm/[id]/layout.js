import React, { Suspense, lazy } from "react";
import { fetchUser } from "../../../../../../../Functions/useerDataRefresh";
import { Dencrypt, Encrypt } from "../../../../../../../Functions/Functions";
import axios from "axios";
import { setupCache } from "axios-cache-adapter";
import Employee from "../../../../../../../models/Users";
import SuspenenseFallBack from "@/app/Components/SuspenenseFallBack";
import { Badge } from "@/components/ui/badge"
import Nav1 from "@/app/Components/Nav1";
import BackButton from "@/app/Components/BackBotton";
import Footer2 from "@/app/Components/Footer2";
import {
  ClipboardDocumentListIcon,
  PlusCircleIcon,TrashIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";

const SingleCustomerpage = lazy(() => import("./page"));

export default async function StoreLayout2({ params }) {
  const userData = await fetchUser();
  const decoy = await params;
  let data = {};
  let PriceList = [];
  const staffRaw = await Employee.findByTenant(userData.business.tenantId)
    .select("firstName lastName")
    .lean();
  const StringedStaff = JSON.stringify(staffRaw);
  const ParsedStaff = JSON.parse(StringedStaff);

  try {
    const baseUrl = process.env.EXPRESS_PRIVATE_URL;
    // Create a cache instance with 3 minutes (180000 ms) max age
    const cache = setupCache({
      maxAge: 3 * 60 * 1000 // 3 minutes
    });

    // 2. Create an axios instance with the cache adapter
    const api = axios.create({
      adapter: cache.adapter
    });

    const res = await axios.get(`${baseUrl}/api/crm/${decoy.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
      },
    });

    // get pricelist
    const request = await api.get(`${baseUrl}/api/crm/${decoy.id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
        access: `${Encrypt(userData.user._id)}`,
      },
    });

    data = await res.data; // No need to await this
    PriceList = await request.data

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
          style={{ overflowY: "auto",scrollbarWidth: "thin",scrollbarColor: "#453d46ff transparent", }}
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
                <span className="text-xs">Sales Management</span>
              </Link>
            )}

            {/* AuditLog */}
            {data.result?.AuditLog?.length > 0 && (
              <div
              className="bg-gray-700 rounded-lg shadow-md overflow-y-scroll max-h-[30vh]"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#4B5563 transparent",
              }}
             >
              <ul className="divide-y divide-gray-700">
                {data.result?.AuditLog?.map((log, index) => {
                  return (
                    <li key={index} className="py-3 px-4 text-xs text-italic">
                      <div className="flex justify-between items-center">
                        <span className="text-italic">{log.message}</span>
                      </div>
                      <hr className="border-gray-500" />
                    </li>
                  );
                }) || (
                  <li className="py-3 px-4 text-sm">No audit trail logged.</li>
                )}
              </ul>
            </div>
            )}

            {/* RouteDays */}
            {userData.user._id === data.result?.accountManager && (
              <>
              <p className="text-xs">{data.result?.RouteDays?.length} Route day/days assigned</p>
              {data.result?.RouteDays?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {data.result?.RouteDays?.map((log, index) => (
                    <Badge key={log._id}>
                      {log.date} <TrashIcon
                          className="h-6 w-6 text-gray-100 cursor-pointer"
                          title={`Remove ${log.date} from list`}
                        />
                    </Badge>
                  ))}
                </div>
              )}
              </>
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
                PriceList={PriceList}
              />
            </Suspense>
          </section>
        </main>
      </div>

      <Footer2 />
    </div>
  );
}
