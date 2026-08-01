"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import Image from "next/image";
import {
  EXPRESS_PRIVATE_URL,
  Dencrypt,
  Encrypt,
  pricelistSetter,
} from "../../../Functions/Functions";
import { ErrorMessage, SuccessToast, plsWait } from "../../../Functions/Mics";
import Marquee from "react-fast-marquee";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import GenerealPaymentMargin from "@/app/Components/GeneratePayment";
import ExcelDownloadBtn from "@/app/Components/ExcelDownloadBtn";
import {
  ShoppingBagIcon,
  ArrowTrendingDownIcon,
  ShoppingCartIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import Link from "next/link";
import PendingPaymentReminder from "@/app/Components/RemindPendingPayments";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {useParams} from "next/navigation";

export default function MainDash({ userData }) {
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState(null);
  const inactivityTimer = useRef(null);
  const intervalRef = useRef(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  // for monitored products
  const [monitoredCurrentPage, setMonitoredCurrentPage] = useState(1);
  const monitoredItemsPerPage = 5;
  const [status, setStatus] = useState("Active"); // UI status indicator
  const MySwal = withReactContent(Swal);
  const Params = useParams()
  const truncate = (str, length = 20) =>
    str && str.length > length ? str.substring(0, length) + "..." : str;
  const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes

  // Memoized sorted invoices
  const sortedInvoices = useMemo(() => {
    return (
      tenantData?.invoice?.sort(
        (a, b) => b.billReferenceNo - a.billReferenceNo,
      ) || []
    );
  }, [tenantData]);

  // Memoized paginated invoices MonitoredProduct
  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedInvoices.slice(start, start + itemsPerPage);
  }, [sortedInvoices, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedInvoices.length / itemsPerPage);
  }, [sortedInvoices]);

  // ⏱ Debounced page change
  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setTimeout(() => {
          setCurrentPage(page);
        }, 300); // 300ms debounce
      }
    },
    [totalPages],
  );

  // Memoized paginated MonitoredProduct
  // Memoized sorted monitored products
  const sortedMonitoredProducts = useMemo(() => {
    return (
      tenantData?.MonitoredProduct?.sort((a, b) =>
        a.productName.localeCompare(b.productName),
      ) || []
    );
  }, [tenantData]);

  //  Memoized paginated MonitoredProduct
  const paginatedMonitoredProduct = useMemo(() => {
    const start = (monitoredCurrentPage - 1) * monitoredItemsPerPage;
    return sortedMonitoredProducts.slice(start, start + monitoredItemsPerPage);
  }, [sortedMonitoredProducts, monitoredCurrentPage]);

  const totalMonitoredProductPages = useMemo(() => {
    return Math.ceil(sortedMonitoredProducts.length / monitoredItemsPerPage);
  }, [sortedMonitoredProducts]);

  // ⏱ Debounced page change
  const handleMonitoredProductPageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalMonitoredProductPages) {
        setTimeout(() => {
          setMonitoredCurrentPage(page);
        }, 300); // 300ms debounce
      }
    },
    [totalMonitoredProductPages],
  );

  useEffect(() => {
    const fetchTenantData = async () => {
      const isVisible = document.visibilityState === "visible";
      const isOnline = navigator.onLine;

      if (!isVisible || !isOnline || status === "Inactive") {
        //  ErrorMessage("⏸ Fetch paused due to:", {
        //     visibility: isVisible,
        //     online: isOnline,
        //     activity: status
        //   });
        return;
      }

      try {
        const res = await fetch(`${EXPRESS_PRIVATE_URL}/api/Report`, {
          headers: {
            Authorization: `Bearer ${Encrypt(userData?.business.tenantId)}`,
            access: `${Encrypt(userData?.user._id)}`,
            "sessionKey": `Bearer ${Encrypt(userData.SessionId)}`
            // cache: "force-cache" // or "default", "reload", "no-store"
          },
        });

        if (!res.ok) throw new Error("Failed to fetch dashboard data");

        const data = await res.json();
        setTenantData(data);
      } catch (err) {
        setError(
          "The dashboard server is currently down or unreachable. Please try again later or contact support if the issue persists.",
        );
      } finally {
        setLoading(false);
      }
    };

    const resetInactivityTimer = () => {
      // if (status === "Inactive") {
      //   console.log("🔄 User became active again");
      // }
      setStatus("Active");
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setStatus("Inactive");
      }, INACTIVITY_LIMIT);
    };

    // ensure on user with cleveldashboard acess can call the api
    if (userData.user.c_levelDash) {
      // Initial fetch
      fetchTenantData();
      resetInactivityTimer();

      // Set interval for periodic fetch
      intervalRef.current = setInterval(fetchTenantData, 60000); // Every 1 min
    } else {
      // show second dashboard
      setLoading(false);
    }

    // Tab visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userData.user.c_levelDash) {
        // console.log(" Tab became visible");
        fetchTenantData();
      }
    };

    // Network status
    const handleOnline = () => {
      SuccessToast("Back online");
      if (userData.user.c_levelDash) fetchTenantData();
    };

    const handleOffline = () => {
      MySwal.fire({
        toast: true,
        position: "bottom-start",
        icon: "info",
        showConfirmButton: false,
        // timer: 10000,
        // timerProgressBar: true,
        customClass: {
          popup: "swal2-subscription-toast",
        },
        html: `
            <div style="display: flex; align-items: center;">
              <div style="text-align: left;">
                <strong style="font-size: 14px;"> No internet connection</strong><br/>
              </div>
            </div>
        `,
      });

      setTimeout(() => {
        plsWait("Currently Offline");
      }, 3000);
    };

    // User activity listeners
    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer),
    );

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Cleanup
    return () => {
      clearInterval(intervalRef.current);
      clearTimeout(inactivityTimer.current);
      activityEvents.forEach((event) =>
        window.removeEventListener(event, resetInactivityTimer),
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [userData, EXPRESS_PRIVATE_URL, Encrypt]);

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
      <div className="w-full px-6 py-10 flex flex-col items-center justify-center bg-grey-200 border border-red-200 rounded-md shadow-sm">
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
        <h2 className="text-lg font-semibold text-red-700">
          Dashboard Unavailable
        </h2>
        <p className="text-sm text-red-600 mt-2 max-w-md text-center">
          {error}
        </p>
      </div>
    );
  }

  return (
    <>
      {userData.user.c_levelDash ? (
        <div
          className="text-xs"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#453d46ff transparent",
          }}
        >
          {/* KPI */}
          <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-6">
            {/* SALES */}
            <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-white/10 blur-3xl" />

              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardDescription className="text-emerald-100">
                    Today's Sales
                  </CardDescription>

                  <CardTitle className="mt-3 text-4xl font-white">
                    <TodaySaleTotal
                      tenantData={tenantData}
                      userData={userData}
                    />
                  </CardTitle>
                </div>

                <div className="rounded-2xl bg-white/20 p-3 backdrop-blur-md">
                  <ArrowTrendingUpIcon className="h-7 w-7" />
                </div>
              </CardHeader>

              <CardContent>
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
                    Number(tenantData.TodaySale) >
                    Number(tenantData.yesterdaySale)
                      ? "bg-white/20"
                      : "bg-red-300/20"
                  }`}
                >
                  {(() => {
                    const today = Number(tenantData.TodaySale) || 0;
                    const yesterday = Number(tenantData.yesterdaySale) || 0;
                    const diff = today - yesterday;
                    let percentage;
                    if (yesterday > 0) {
                      percentage = ((diff / yesterday) * 100).toFixed(2);
                    } else {
                      percentage = "100";
                    }

                    if (today > yesterday) {
                      return (
                        <>
                          <ArrowTrendingUpIcon className="w-4 h-4" />
                          {`Up ${percentage}% from ${moment().subtract(1, "day").format("dddd")}'s (${userData.business.currency?.currency.Symbol}${formatNumberShort(yesterday)})`}
                        </>
                      );
                    } else if (today < yesterday) {
                      return (
                        <>
                          <ArrowTrendingDownIcon className="w-4 h-4" />
                          {`Dipped ${percentage}% from ${moment().subtract(1, "day").format("dddd")}'s (${userData.business.currency?.currency.Symbol}${formatNumberShort(yesterday)})`}
                        </>
                      );
                    } else {
                      return `No change from ${moment().subtract(1, "day").format("dddd")}'s (${userData.business.currency?.currency.Symbol}${formatNumberShort(yesterday)})`;
                    }
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* REVENUE */}
            <Card className="border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardDescription>Revenue</CardDescription>

                  <CardTitle className="mt-3 text-4xl font-white">
                    <TodaySRevenueTotal
                      tenantData={tenantData}
                      userData={userData}
                    />
                  </CardTitle>
                </div>

                <div className="rounded-2xl bg-violet-100 p-3">
                  <BanknotesIcon className="h-7 w-7 text-black" />
                </div>
              </CardHeader>

              <CardContent>
                <Badge variant="secondary" className="text-sm ">
                  Total posted revenue
                </Badge>
              </CardContent>
            </Card>

            {/* PURCHASE */}
            <Card className="border-0  border">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardDescription>Purchases</CardDescription>

                  <CardTitle className="mt-3 text-4xl ">
                    <PurchaseOrderTotal
                      tenantData={tenantData}
                      userData={userData}
                    />
                  </CardTitle>
                </div>

                <div className="rounded-2xl bg-amber-100 p-3">
                  <ShoppingBagIcon className="h-7 w-7 text-black" />
                </div>
              </CardHeader>

              <CardContent>
                <Badge variant="secondary" className="text-sm">
                  Total purchase orders
                </Badge>
              </CardContent>
            </Card>

            {/* EXPENSE */}
            <Card className="border ">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardDescription>Expenses</CardDescription>

                  <CardTitle className="mt-3 text-4xl  ">
                    <ExpenseTotal tenantData={tenantData} userData={userData} />
                  </CardTitle>
                </div>

                <div className="rounded-2xl bg-rose-100 p-3">
                  <ArrowTrendingDownIcon className="h-7 w-7 text-black" />
                </div>
              </CardHeader>

              <CardContent>
                <Badge variant="secondary" className="text-sm ">
                  Operational expenses
                </Badge>
              </CardContent>
            </Card>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Activity / feed */}
            <section className="lg:col-span-2">
              <div className=" rounded p-3  mb-3 ">
                {/* Chart */}
                <GenerealSalesMargin
                  yearlysales={tenantData.yearlysales}
                  warehouses={tenantData.warehouses}
                />
              </div>

              <div className="rounded p-3  border-0">
                {/* payment */}
                <GenerealPaymentMargin
                  yearlyPayment={tenantData.revenuePayments.filter(
                    (payment) => payment.status === "posted",
                  )}
                  warehouses={tenantData.warehouses}
                />
              </div>
              {/* === TODAY'S SALES TABLE (shadcn) === */}
              <div className="rounded-xl p-6 mt-6  border-0">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold">
                    Today's Sales
                  </h3>
                </div>

                <div className="overflow-hidden border-0">
                  <Table className="">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">S/N</TableHead>
                        <TableHead>Ref</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead className="text-right">Grand Total</TableHead>
                        <TableHead>Raised By</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInvoices.length > 0 ? (
                        paginatedInvoices.map((invoice, index) => (
                          <TableRow key={index} className="">
                            <TableCell className="font-medium">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell className="font-semibold">
                              <Link
                                href={`/${Params.auth}/V4/Sales/Sales/${Encrypt(invoice._id)}`}
                                className="text-indigo-600 hover:underline"
                              >
                                {invoice.billReferenceNo}/{invoice.invoicelocation}
                              </Link>
                            </TableCell>
                            <TableCell>{invoice.customerName}</TableCell>
                            <TableCell className="text-right font-medium font-mono">
                              {userData.business.currency?.currency.Symbol}
                              {invoice.grandTotal?.toLocaleString()}
                            </TableCell>
                            <TableCell>{invoice.RaiseBy}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  invoice.billStatus !== "Cancelled"
                                    ? "default"
                                    : "destructive"
                                }
                              >
                                {invoice.billStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center ">
                            No invoices found for this page.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-2 mt-6">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-md border border-gray-300  disabled:opacity-50 transition-colors"
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i + 1)}
                      className={`px-4 py-2 rounded-md border transition-colors ${
                        currentPage === i + 1
                          ? "bg-indigo-600 border-indigo-600"
                          : "border-gray-300 "
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-md border border-gray-300  disabled:opacity-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>

              {/* === MONITORED PRODUCTS TABLE (shadcn) === */}
              {sortedMonitoredProducts.length > 0 && (
                <div className="bg-white rounded-xl p-6 mt-6  border-0">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">
                      Monitored Products
                    </h3>
                  </div>

                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">S/N</TableHead>
                          <TableHead>Product Name</TableHead>
                          <TableHead>In Stock</TableHead>
                          <TableHead>Monitor</TableHead>
                          <TableHead>Re-Order Qty</TableHead>
                          <TableHead className="w-16"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedMonitoredProduct.map((product, index) => (
                          <TableRow key={index} className="">
                            <TableCell className="font-medium">
                              {(monitoredCurrentPage - 1) * monitoredItemsPerPage + index + 1}
                            </TableCell>
                            <TableCell className="font-semibold">
                              <Link
                                href={`/${Params.auth}/V4/product/product/${Encrypt(product.productId)}`}
                                className="text-indigo-600 hover:underline"
                              >
                                {product.productName}
                              </Link>
                            </TableCell>
                            <TableCell>{product.currentQty}</TableCell>
                            <TableCell>{product.replenishMin}</TableCell>
                            <TableCell>{product.replenishQty}</TableCell>
                            <TableCell>
                              <button
                                className="hover:text-indigo-600 transition-colors"
                                title="Raise purchase order"
                              >
                                <ShoppingCartIcon className="h-5 w-5" />
                              </button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Monitored Products Pagination */}
                  <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                      onClick={() => handleMonitoredProductPageChange(monitoredCurrentPage - 1)}
                      disabled={monitoredCurrentPage === 1}
                      className="px-4 py-2 rounded-md border border-gray-300  disabled:opacity-50 transition-colors text-gray-300"
                    >
                      Prev
                    </button>
                    {Array.from({ length: totalMonitoredProductPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => handleMonitoredProductPageChange(i + 1)}
                        className={`px-4 py-2 rounded-md border transition-colors ${
                          monitoredCurrentPage === i + 1
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "border-gray-300 "
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => handleMonitoredProductPageChange(monitoredCurrentPage + 1)}
                      disabled={monitoredCurrentPage === totalMonitoredProductPages}
                      className="px-4 py-2 rounded-md border border-gray-300  disabled:opacity-50 transition-colors text-gray-300"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
             
            </section>
            <aside className="rounded p-6 border-0 text-xs  animate__animated animate__fadeInRight animate__faster">
              <h3 className="text-lg font-semibold mb-4">
                Quick Stats Widget
              </h3>
              <div className="flex flex-col">
                <h4 className="text-lg font-semibold mb-4">
                  Tasks Reminder
                </h4>

                {userData?.user?.TaskLogs &&
                userData.user.TaskLogs.length > 0 ? (
                  userData.user.TaskLogs.map((task, idx) => (
                    <div
                      key={idx}
                      className="text-xs  flex gap-3 rounded-sm p-1 mb-1 hover:border-gray-200 hover: transition duration-200 animate__animated animate__fadeInRight"
                      title={task.notes}
                    >
                      <div>
                        <p className="font-medium ">{task.Text}</p>
                        <p className="text-xs font-semibold">
                          * {task.notes}
                        </p>
                        <p className="text-xs ">
                          Created:{" "}
                          {new Date(task.createdAt).toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>

                      {/* Badge button */}
                      <button
                        className={`ml-auto px-2 py-1 rounded-sm text-xs font-medium transition-all duration-200 ${
                          task.Status === "Done"
                            ? "bg-green-500"
                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                        }`}
                      >
                        {task.Status === "Done"
                          ? "✓ Completed"
                          : "○ Mark as Done"}
                      </button>
                      <hr />
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic">
                    No task assigned
                  </p>
                )}

                {/* <h4 className="text-sm text-gray-500 font-semibold mb-4">
                  Sales Team Kpi Millestone
                </h4> */}

                {/* {tenantData.result.map((person, index) => (
                  <div
                    key={index}
                    className="text-xs bg-white rounded-lg p-4 mb-2 hover:border-gray-200  hover: transition duration-200 animate__animated animate__fadeInRight"
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

                    <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mb-1">
                      <div
                        className={`h-full ${Math.round(person.percentage) > 50 ? "bg-green-400" : "bg-black"} transition-all duration-300`}
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
                ))} */}
                {/* <div className="text-center mt-6 border-bottom ">
                  <ExcelDownloadBtn
                    data={tenantData.result}
                    page={`Sales Team Performance`}
                  />
                </div> */}

                <div className="mt-6 border-t-2">
                  <h4 className="text-lg font-semibold mb-4">
                    💵 Todays Payments
                  </h4>
                  <ul
                    className="list-disc list-inside space-y-2 text-sm  overflow-y-auto max-h-80"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#453d46ff transparent",
                    }}
                  >
                    {tenantData.revenuePayments.filter(
                      (payment) =>
                        payment.PaymentDate === moment().format("YYYY-MM-DD") &&
                        payment.collectionRef === "PMNT" &&
                        payment.cr === true &&
                        payment.status === "posted",
                    ).length > 0 ? (
                      tenantData.revenuePayments
                        .filter(
                          (payment) =>
                            payment.PaymentDate ===
                              moment().format("YYYY-MM-DD") &&
                            payment.collectionRef === "PMNT" &&
                            payment.cr === true &&
                            payment.status === "posted",
                        )
                        .map((payment) => (
                          <li
                            key={payment._id}
                            className="flex items-center justify-between px-4 py-2 shadow-sm rounded-md border border-gray-200 hover: hover:border-green-400 transition-all  animate__animated animate__fadeInRight animate__faster"
                          >
                            <div className="flex flex-col">
                              <span className="text-sm font-semibold font-mono">
                                {userData.business.currency?.currency.Symbol}
                                {payment.crAmount.toLocaleString()}
                              </span>
                              <span className="text-xs">
                                {payment.collectionRef}/{payment.type}
                              </span>
                            </div>
                            <span className="text-xs text-green-600 font-mono bg-green-50 px-2 py-1 rounded">
                              Ref: {payment.paymentReferenceNo.slice(0, 6)}
                            </span>
                          </li>
                        ))
                    ) : (
                      <li className="text-gray-500 italic">
                        No revenue payments recorded yet.
                      </li>
                    )}
                  </ul>
                  <div className="text-center mt-6 border-bottom ">
                    <ExcelDownloadBtn
                      data={tenantData.revenuePayments
                        .filter(
                          (payment) =>
                            payment.PaymentDate ===
                              moment().format("YYYY-MM-DD") &&
                            payment.collectionRef === "PMNT" &&
                            payment.cr === true &&
                            payment.status === "posted",
                        )
                        .map((payment) => ({
                          Ref: payment.paymentReferenceNo,
                          Accountant: payment.Accountant,
                          Date: payment.PaymentDate,
                          Amount: payment.crAmount,
                          gateWay: payment.type,
                          status: payment.status,
                        }))}
                      page={`Payments for ${moment().format("DD-MM-YYYY")}`}
                    />
                  </div>
                  {/* gropued sales */}
                  <hr className="my-4 border-gray-300 mb-2" />

                  <div className="  transition-all duration-700 mt-5">
                    <GropuedInvRadarChart
                      invoice={tenantData.yearlysales}
                      business={userData.business}
                    />
                  </div>
                </div>
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
                    className="w-full py-2"
                  >
                    <span className="px-2 py-1 rounded mr-2">
                      ⚠️ Debtors:
                    </span>
                    {tenantData.debtorsArray.map((debtor) => (
                      <span
                        key={debtor._id}
                        className="mx-1 px-2 py-1 rounded"
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

          {/* produt promo */}
          {tenantData.promotions?.length > 0 && (
            <div className="w-full text-center mt-3">
              <Marquee
                gradient={false}
                speed={40}
                className="w-full py-2"
              >
                <span className="px-2 py-1 rounded mr-2">
                  🗂️ Products On Promo:
                </span>
                {tenantData.promotions.map((product) => (
                  <span
                    key={product._id}
                    className="mx-1 px-2 py-1 rounded"
                  >
                    {product.Name}
                  </span>
                ))}
              </Marquee>
            </div>
          )}

          {/* Footer */}
          <footer className="mt-8 text-sm">
            © <span id="year">{moment().format("YYYY")}</span> Business
            Automated Dynamic Enterprise — All rights reserved.
          </footer>

          {/* pending payment reminder */}
          {tenantData.revenuePayments.filter((payment) => {
            payment.collectionRef === "PMNT" &&
              payment.cr === true &&
              payment.status === "Pending";
          }).length > 0 &&
            userData.user.postPayment && (
              <PendingPaymentReminder
                data={tenantData.revenuePayments.filter((payment) => {
                  payment.collectionRef === "PMNT" &&
                    payment.cr === true &&
                    payment.status === "Pending";
                })}
                business={userData.business}
              />
            )}
        </div>
      ) : (
        <main
          className="flex-1"
          style={{
            backgroundImage: `url("/business-report-graphs-charts-business-reports-pile-documents-business-concept.jpg")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <section className="w-full max-w-4xl p-9">
            <div className="text-center space-y-6">
              <p className="text-gray-600 max-w-2xl mx-auto text-md">
                Track your sales performance, manage customer relationships, and
                monitor your daily activities all in one place.
              </p>
              <div className="flex justify-center pt-4">
                <Image
                  src={userData.business.companyLogo}
                  alt="Company Logo"
                  width={150}
                  height={150}
                  className="rounded-full shadow-lg hover: transition-shadow"
                />
              </div>
              <p className="text-gray-500 text-sm pt-6">
                Navigate through the menu to explore your dashboard features and
                gain valuable insights into your business operations.
              </p>
            </div>
          </section>
          <footer className="mt-12 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
            © <span id="year">{moment().format("YYYY")}</span> Business
            Automated Dynamic Enterprise — All rights reserved.
          </footer>
        </main>
      )}
    </>
  );
}

const formatNumberShort = (num) => {
  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + " B"; // billions
  } else if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + " M"; // millions
  } else if (num >= 1_000) {
    return (num / 1_000).toFixed(2) + " K"; // thousands
  }
  return num.toString();
};

const PurchaseOrderTotal = ({ tenantData, userData }) => {
  const total = tenantData?.PO?.reduce((sum, item) => {
    const val = Number(item?.grandTotal) || 0;
    return sum + val;
  }, 0);

  return (
    <p className="text-2xl font-bold mt-1">
      {userData.business.currency?.currency.Symbol}
      {formatNumberShort(total)}
    </p>
  );
};

const TodaySaleTotal = ({ tenantData, userData }) => {
  const total = tenantData?.TodaySale;

  return (
    <p className="text-2xl font-bold mt-1">
      {userData.business.currency?.currency.Symbol}
      {formatNumberShort(total)}
    </p>
  );
};

const TodaySRevenueTotal = ({ tenantData, userData }) => {
  const total = tenantData?.Revenue;

  return (
    <p className="text-2xl font-bold mt-1">
      {userData.business.currency?.currency.Symbol}
      {formatNumberShort(total)}
    </p>
  );
};

const ExpenseTotal = ({ tenantData, userData }) => {
  const total = tenantData?.Expenses?.reduce((sum, item) => {
    const val = Number(item?.Amount) || 0; // ensure it's a number
    return sum + val;
  }, 0);

  return (
    <p className="text-2xl font-bold mt-1">
      {userData.business.currency?.currency.Symbol}
      {formatNumberShort(total)}
    </p>
  );
};

// sales by category
import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, Radar, RadarChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export function GropuedInvRadarChart({ invoice, business }) {
  const startDate = useMemo(() => moment().startOf("month"), []);
  const endDate = useMemo(() => moment().endOf("month"), []);

  const chartData = useMemo(() => {
    const grouped = invoice
      .filter((entry) => {
        const entryDate = moment(entry.startDate, "YYYY-MM-DD");
        return entryDate.isBetween(startDate, endDate, "day", "[]");
      })
      .reduce((acc, entry) => {
        const key = entry.priceList || "Unknown";
        acc[key] = (acc[key] || 0) + (entry.grandTotal || 0);
        return acc;
      }, {});

    return Object.entries(grouped).map(([name, debt]) => ({
      name: pricelistSetter(name, business),
      debt,
    }));
  }, [invoice, business, startDate, endDate]);

  const chartConfig = useMemo(
    () => ({
      debt: {
        label: "Total sales",
        color: "var(--chart-3)",
      },
    }),
    [],
  );

  return (
    <Card>
      <CardHeader className="items-center p-4">
        <CardTitle>
          <div className="flex items-center gap-2 leading-none font-medium">
            Sales Categories <TrendingUp className="h-4 w-4" />
          </div>
        </CardTitle>
        <CardDescription>Sales overview grouped by pricelist</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadarChart data={chartData}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <PolarAngleAxis dataKey="name" />
            <Radar
              dataKey="debt"
              fill="var(--color-debt)"
              fillOpacity={0.6}
              dot={{ r: 4, fillOpacity: 1 }}
            />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground">
          {chartData.length} pricelists displayed for {moment().format("MMMM")}{" "}
          sales
        </div>
      </CardFooter>
    </Card>
  );
}
