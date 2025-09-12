"use client";
import React, { useEffect } from "react";
import Image from "next/image"
import {
  EXPRESS_PRIVATE_URL,
  Dencrypt,
  Encrypt,
} from "../../../Functions/Functions";
import Marquee from "react-fast-marquee";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import { ScaleIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import moment from "moment";

export default function MainDash({ userData }) {
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenantData = async () => {
      try {
        const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Report`, {
          headers: {
            Authorization: `Bearer ${Encrypt(userData?.business.tenantId)}`,
          },
        });

        if (!res.ok) throw new Error("Failed to fetch dashboard data");

        const data = await res.json();
        setTenantData(data);
      } catch (err) {
        setError(" The dashboard server is currently down or unreachable. Please try again later or contact support if the issue persists.");
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData(); // Initial fetch

    // Set up interval for periodic refresh

    const interval = setInterval(() => {
      fetchTenantData(); // Re-fetch every 20 seconds
    }, 20000);

    return () => clearInterval(interval); // Cleanup on unmount

  }, []);

  if (loading) {
    return (
      <div className="w-full px-6 py-8 animate-pulse space-y-6">
        <div className="h-6 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-48 bg-gray-300 rounded w-full"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
        <div className="h-10 bg-gray-300 rounded w-40 mt-4"></div>
      </div>
    );
  }

  if (error) {
    return (
    <div className="w-full px-6 py-10 flex flex-col items-center justify-center bg-red-50 border border-red-200 rounded-md shadow-sm">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-red-500 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
    >
        <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"
        />
    </svg>
    <h2 className="text-lg font-semibold text-red-700">Dashboard Unavailable</h2>
    <p className="text-sm text-red-600 mt-2 max-w-md text-center">
       {error}
    </p>
    </div>
    );
  }

  return (
    <>
      {userData.user.c_levelDash ? (
        <div className="text-xs">
            {/* KPI cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-5 rounded card-shadow shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-gray-500">
                      Today&lsquo;s Sales
                    </h3>
                    <p className="text-2xl text-green-600 font-bold mt-1">
                      {userData.business.currency?.currency.Symbol}
                      {tenantData.TodaySale?.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Updated at {moment().format("HH:MM")}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-700 text-white text-xl shadow-md">
                    📈
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded card-shadow shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm text-gray-500">Revenue</h3>
                    <p className="text-2xl text-gray-500 font-bold mt-1">
                      {userData.business.currency?.currency.Symbol}
                      {tenantData.Revenue?.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-gray-500 text-white shadow-md">
                    💰
                  </div>
                </div>
              </div>
              {tenantData.yearlysales.length > 0 ? (
                <div className="bg-white p-5 rounded-lg shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-500">Avg Sales</h3>
                      <p className="text-sm text-gray-800 font-semibold mt-1">
                        {userData.business.currency?.currency.Symbol}
                        {Math.round(
                          tenantData.yearlysales.reduce(
                            (acc, curr) => acc + (curr.grandTotal || 0),
                            0
                          ) / tenantData.yearlysales.length
                        ).toLocaleString() || 0}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-red-100 text-white px-4 py-2 rounded shadow-sm">
                      <ScaleIcon className="h-6 w-6 text-gray-900" />
                    </div>
                  </div>
                </div>
              ) : (
                ""
              )}

              {tenantData.Bestproduct.length > 0 ? (
                <div className="bg-white p-5 rounded card-shadow shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-500">Best Seller</h3>
                      <p className="text-sm text-gray-500 font-bold mt-1">
                        {tenantData.Bestproduct[0]?.Name} [
                        {tenantData.Bestproduct[0]?.TotalSale?.toLocaleString()}
                        ]
                      </p>
                    </div>
                    <Image
                      src={tenantData.Bestproduct[0]?.image || null}
                      width={58}
                      height={58}
                      quality={100}
                      priority={true}
                      alt={tenantData.Bestproduct[0]?.Name}
                      className="w-18 h-18 rounded-full"
                    />
                  </div>
                </div>
              ) : (
                ""
              )}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity / feed */}
              <section className="lg:col-span-2">
                <div className="bg-white rounded p-3 shadow-xl">
                  {/* Chart */}
                  <GenerealSalesMargin
                    yearlysales={tenantData.yearlysales}
                    warehouses={tenantData.warehouses}
                  />
                </div>

                {/* Properties table */}
                {tenantData.invoice?.length > 0 && (
                  <div className="bg-white rounded p-6 mt-6 card-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg text-gray-500 font-semibold">
                        Recent Sales
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="text-xs text-gray-500 border-b">
                          <tr>
                            <th className="py-3">Ref</th>
                            <th className="py-3">Customer</th>
                            <th className="py-3">Grand Total</th>
                            <th>Raised By</th>
                            <th className="py-3">Status</th>
                            <th> Action</th>
                          </tr>
                        </thead>
                        <tbody className="text-gray-700">
                          {tenantData.invoice.map((invoice, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-3">
                                {invoice.billReferenceNo}
                              </td>
                              <td className="py-3">{invoice.customerName}</td>
                              <td className="py-3">
                                {userData.business.currency?.currency.Symbol}
                                {invoice.grandTotal?.toLocaleString()}
                              </td>
                              <td className="py-3">{invoice.RaiseBy}</td>
                              <td
                                className={`py-3 ${
                                  invoice.billStatus !== "Cancelled"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {invoice.billStatus}
                              </td>
                              <td className="py-3">
                                {" "}
                                <a href="#" className="text-indigo-600">
                                  View
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </section>

              {/* Quick stats / chart placeholder */}
              <aside className="bg-white rounded p-6 card-shadow text-xs">
                <h4 className="text-sm text-gray-500 font-semibold mb-4">
                  Sales target Millestone
                </h4>

                {tenantData.result.map((person, index) => (
                  <div
                    key={index}
                    className="text-xs bg-white rounded-lg p-4 mb-2 hover: border hover:border-gray-200  hover:shadow-md transition duration-200"
                    title={`${person.firstName}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-gray-600 text-right justify-content-end">
                        {userData.business.currency?.currency.Symbol}
                        {person.totalSales?.toLocaleString()} /
                        {userData.business.currency?.currency.Symbol}
                        {person.salesTarget?.toLocaleString()}
                      </span>
                    </div>

                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-green-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            Math.round(person.percentage),
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="text-gray-700 font-semibold truncate max-w-[100px]">
                        {truncate(person.firstName, 10)}
                      </span>
                      <span className="text-green-600 font-medium text-xs">
                        {`${parseFloat(person.percentage).toFixed(
                          2
                        )}% achieved`}
                      </span>
                    </div>
                  </div>
                ))}
                <div className="text-center mt-6 border-bottom ">
                  <ExcelDownloadBtn
                    data={tenantData.result}
                    page={`Sales Team Performance`}
                  />
                </div>
                
                <div className="mt-6 border-t-2">
                  <h4 className="text-lg text-gray-500 font-semibold mb-4">
                    Upcoming Events 📆
                  </h4>
                  <ul className="list-disc list-inside">
                    {tenantData.birthdayCelebrants.map((element) => (
                      <li key={element._id} className="text-gray-700 ">
                        <Image
                          src={"/person.png"}
                          priority={false}
                          quality={100}
                          loading="lazy"
                          alt={`${element.name}s profile`}
                          className="inline-block w-6 h-6 rounded-full mr-2"
                          width={24}
                          height={24}
                        />
                        Today is {element.name}&lsquo;s birthday
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            </div>
            {tenantData.debtorsArray?.length > 0 && (
              <div className="w-full text-center mt-3">
                {tenantData.debtorsArray?.length > 0 && (
                  <div className="w-full text-center mt-3">
                    <Marquee
                      gradient={false}
                      speed={30}
                      className="w-full bg-gray-600 py-2"
                    >
                      <span className="text-gray-700 bg-red-200 px-2 py-1 rounded mr-2">
                        ⚠️ Debtors:
                      </span>
                      {tenantData.debtorsArray.map((debtor) => (
                        <span
                          key={debtor._id}
                          className="mx-1 text-white bg-gray-400 px-2 py-1 rounded"
                        >
                          {debtor.Username} owes{" "}
                          {userData.business.currency?.currency.Symbol}
                          {debtor.Debt?.toLocaleString()},
                        </span>
                      ))}
                    </Marquee>
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <footer className="mt-8 text-sm text-gray-500">
              © <span id="year">{moment().format("YYYY")}</span> Business
              Automated Dynamic Enterprise — All rights reserved.
            </footer>
          </div>
      ) : (
        <main className="flex-1">
          <section className="w-full max-w-screen-xl mx-auto p-6 h-[500px] overflow-y-auto bg-gradient-to-br from-gray-100 via-white to-gray-200 backdrop-blur-md rounded-xl shadow-xl">
            {/* Birthday Marquee */}
            <div className="mt-6">
              <div className="w-full text-center">
                {tenantData.birthdayCelebrants?.length > 0 ? (
                  <div className="bg-indigo-50 rounded-lg py-2 px-4 shadow-inner">
                    <marquee
                      behavior="scroll"
                      direction="left"
                      scrollamount="3"
                      className="text-sm text-indigo-700 font-medium"
                      style={{ width: "100%" }}
                    >
                      <ul className="flex gap-6 list-none">
                        {tenantData.birthdayCelebrants.map((element) => (
                          <li
                            key={element._id}
                            className="flex items-center gap-2"
                          >
                            <Image
                              src="/person.png"
                              alt={`${element.name}s profile`}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                            <span>
                              🎉 Today is <strong>{element.name}</strong>
                              &lsquo;s birthday!
                            </span>
                          </li>
                        ))}
                      </ul>
                    </marquee>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
          </section>
        </main>
      )}
    </>
  );
}
