"use client";

import Swal from "sweetalert2";
import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import BackButton from "@/app/Components/BackBotton";
import Nav1 from "@/app/Components/Nav1";
import { plsWait, ErrorMessage, Encrypt } from "../../../../../../../Functions/Mics";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Card from "../../../../../Components/Card";
import ExcelDownloadButton from "../../../../../Components/ExcelDownloadBtn"
import Footer2 from "@/app/Components/Footer2";
import {WrenchScrewdriverIcon,ChartPieIcon,ShieldExclamationIcon,PuzzlePieceIcon,CloudArrowUpIcon,QueueListIcon,CloudArrowDownIcon} from "@heroicons/react/24/outline"


export default function StoreLayout({ userInfo, store }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchRef, setSearchRef] = useState("");
  const [Page, setPage] = useState(store);
  const [Data, setDataArray] = useState({});
  const params = useParams();
  const pathName = usePathname();

  const navItems = [
    // {
    //   label: "Sales Order",
    //   icon: <QueueListIcon className="h-6 w-6 text-gray-100" />,
    //   href: `/api/storeApi/invoice?whId=${params.id}&category=all&page=1&limit=10`,
    // },
    // {
    //   label: "Purchase Order",
    //   icon: <CloudArrowDownIcon className="h-6 w-6 text-gray-100" />,
    //   href: `/api/storeApi/purchase-order?whId=${params.id}&category=all&page=1&limit=10`,
    // },
    {
      label: "Product Transfers",
      icon: <CloudArrowUpIcon className="h-6 w-6 text-gray-100" />,
      href: `/api/storeApi/product-transfers?whId=${params.id}&category=all&page=1&limit=10`,
    },
    {
      label: "Inventory Items",
      icon: <PuzzlePieceIcon className="h-6 w-6 text-gray-100" />,
      href: `/api/storeApi/inventory-items?whId=${params.id}&category=all&page=1&limit=10`,
    },
    {
      label: "Scrap Products",
      icon: <ShieldExclamationIcon className="h-6 w-6 text-gray-100" />,
      href: "/scrap-products",
    },
    {
      label: "Reports",
      icon: <ChartPieIcon className="h-6 w-6 text-gray-100" />,
      href: "/reports",
    },
    // {
    //   label: "Store Settings",
    //   icon: "https://img.icons8.com/3d-fluency/94/gear--v1.png",
    //   href: "/store-settings",
    // },
  ];

  const getStoreData = useCallback(
    async (item) => {
      try {
        plsWait(`Fetching ${item.label}...⌛`);
        const response = await axios.get(item.href, {
          headers: {
            Authorization: `Bearer ${userInfo?.user?.tenantId}`,
            "Content-Type": "application/json",
          },
        });
        setDataArray(response.data);
        setPage(response.data.display);
      } catch (err) {
        ErrorMessage("Error fetching store data:", err.message);
      } finally {
        setSidebarOpen(false);
        Swal.close();
      }
    },
    [userInfo]
  );

  return (
    <>
      <Nav1
        user={userInfo.user}
        business={userInfo.business}
        page={Page}
        Module={Data.deliveredBills}
      />

      <div className="flex w-full text-white min-h-screen  relative">
        {/* Sidebar */}
        <aside
          className={`fixed z-40 top-0 left-0 h-full  bg-[#1e1e20]/80 backdrop-blur-lg p-4 shadow-xl border-r border-white/10 transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <div className="flex justify-between items-center mb-4">
            <BackButton />
          </div>
          <hr />

          <nav className="flex flex-col gap-3">
            {navItems.map((item, index) => {
              const isActive = pathName
                .toLowerCase()
                .includes(item.label.toLowerCase());
              return (
                <button
                  key={index}
                  onClick={() => getStoreData(item)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition duration-200
                    ${
                      isActive
                        ? "bg-gray-100 text-pink-500 shadow-sm"
                        : "bg-white/5 hover:bg-purple-500/20 text-white/80"
                    }
                  `}
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
            {/* store settings */}
             <Link
                 href={`/${userInfo.business.companyName}/${params.Tenant}/${params.module}/store/store-settings?store=${params.id}&Name=${Page}`}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg transition duration-200 not-visited:bg-purple-500/20`}
                >
                 <WrenchScrewdriverIcon className="h-6 w-6 text-gray-100" />
                  <span className="text-sm font-medium">Store Settings</span>
                </Link>
            <hr />

            {/* for invoice */}
            {Data.display === "Invoice" && (
              <div className="mb-4">
                <label
                  htmlFor="billSearch"
                  className="block mb-1 text-sm font-medium text-white"
                >
                  Search Pending Order to Action
                </label>
                <input
                  list="billOptions"
                  id="billSearch"
                  name="billSearch"
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  placeholder="Type or select a reference no..."
                  className="px-4 py-2 rounded-md bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                <datalist id="billOptions">
                  {Array.isArray(Data.PendingOrders) &&
                    Data.PendingOrders.map((bill) => (
                      <option key={bill._id} value={bill.billReferenceNo}>
                        {bill.billStatus}/{bill.billReferenceNo}
                      </option>
                    ))}
                </datalist>
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="relative flex-1 flex flex-col w-full text-white overflow-hidden">
          {/* Floating Sidebar Toggle Button */}
          <button
            onClick={() => setSidebarOpen((prev) => !prev)}
            aria-label="Toggle Sidebar"
            className="fixed top-2 left-2 z-50 bg-red-600/5 hover:bg-red-300/5 text-black p-2 rounded-full shadow-lg backdrop-blur-md transition-all"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="white"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>

           <section className="relative w-full h-full flex-grow overflow-x-auto shadow-inner backdrop-blur-md bg-[#0e0e11]/5 p-6 rounded-xl">
              {Array.isArray(Data.deliveredBills) && Data.deliveredBills.length > 0 ? (
                Data.display === "Invoice" ? (
                  <>
                    {/* Invoice Table */}
                    <div className="overflow-auto rounded-lg border border-white/10">
                      <table className="min-w-full text-sm bg-[#0e0e11] text-white/90">
                        <thead className="sticky top-0 bg-white/10 text-white uppercase text-xs z-10">
                          <tr>
                            <th className="border px-4 py-2" />
                            <th className="border px-4 py-2">S/NO</th>
                            <th className="border px-4 py-2">REF NO</th>
                            <th className="border px-4 py-2">CUSTOMER</th>
                            <th className="border px-4 py-2">ORDER DATE</th>
                            <th className="border px-4 py-2">C/N</th>
                            <th className="border px-4 py-2">INVOICE DATE</th>
                            <th className="border px-4 py-2">W/B</th>
                            <th className="border px-4 py-2">DISPATCHER</th>
                            <th className="border px-4 py-2">STATUS</th>
                            <th className="border px-4 py-2 text-right">VALUE</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Data.deliveredBills.map((bill, index) => (
                            <tr
                              key={bill._id}
                              className={`transition-all ${
                                index % 2 === 0 ? "bg-[#0e0e11]/30" : "bg-[#0e0e11]/10"
                              } hover:bg-white/10`}
                            >
                              <td
                                className="border px-4 py-2"
                                title={`Send ${bill.billStatus} to ${bill.customerName}`}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="w-4 h-4 text-white/80 hover:text-white transition"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 10l18-6-9 18-2-8-7-4z"
                                  />
                                </svg>
                              </td>
                              <td className="border px-4 py-2">{index + 1}</td>
                              <td className="border px-4 py-2">
                                <Link
                                  href={`/${params.auth}/${params.Tenant}/bill/bill/${Encrypt(bill._id)}`}
                                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 hover:underline underline-offset-4 font-medium transition-all"
                                >
                                  {bill.billReferenceNo}
                                </Link>
                              </td>
                              <td className="border px-4 py-2">{bill.customerName}</td>
                              <td className="border px-4 py-2">{bill.startDate}</td>
                              <td className="border px-4 py-2">{bill.CN?.length || 0}</td>
                              <td className="border px-4 py-2">
                                {bill.DELIVERYDATE?.slice(0, 10)}
                              </td>
                              <td className="border px-4 py-2">{bill.WayBillNo}</td>
                              <td className="border px-4 py-2">{bill.DriverName}</td>
                              <td className="border px-4 py-2">
                                <span
                                  className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                                    bill.billStatus === "Invoice"
                                      ? "bg-green-500/30 text-green-300"
                                      : "bg-yellow-500/30 text-yellow-200"
                                  }`}
                                >
                                  {bill.billStatus}
                                </span>
                              </td>
                              <td className="border px-4 py-2 text-right">
                                ₦{bill.grandTotal.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  // Inventory view
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {Data.deliveredBills.map((item) => (
                      <Card key={item._id} data={item} module="inventory" />
                    ))}
                  </div>
                )
              ) : (
                <h5 className="w-full h-full text-black flex justify-center items-center italic">
                  {`Nothing to show`}
                </h5>
              )}

              {/* Download Button */}
              {Data.deliveredBills &&
                Data.deliveredBills.length > 0 && (
                  <div className="absolute bottom-4 right-4">
                    <ExcelDownloadButton data={Data.deliveredBills} page={Data.display} />
                  </div>
                )}
            </section>
          
        </main>
      </div>
      <Footer2 />
    </>
  );
}
