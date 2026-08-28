"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import { EXPRESS_PRIVATE_URL, Encrypt } from "../../../../Functions/Functions";
import { SuccessToast, plsWait } from "../../../../Functions/Mics";
import Marquee from "react-fast-marquee";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import {
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  BellAlertIcon,
} from "@heroicons/react/24/outline";
import moment from "moment";
import Link from "next/link";
import withReactContent from "sweetalert2-react-content";
import Swal from "sweetalert2";
import { TrendingUp } from "lucide-react";
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import Nav2 from "@/app/Components/Nav2";
import Image from "next/image";
import Logout from "@/app/Components/Logout";
import UserNotification from "@/app/Components/UserNotification";
import {
  PresentationChartLineIcon,
  UserGroupIcon,
  MapIcon,
  CubeIcon,
  UserPlusIcon,
  BuildingStorefrontIcon,
  QueueListIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import "animate.css";
import {Badge} from "@/components/ui/badge";
import {Skeleton} from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function DashboardLayout({ userData, baseUrl }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm] = useState("");
  const navtitle = "Dashboard";

  const toggleSideNav = () => setIsOpen((prev) => !prev);

  const languages = useMemo(() => ["es", "en", "de", "fr"], []);

  const getRandomLanguage = () =>
    languages[Math.floor(Math.random() * languages.length)];

  const getLocalizedGreeting = useMemo(() => {
    return (name = "Guest", lang = getRandomLanguage()) => {
      const hour = moment().hour();
      const timeOfDay =
        hour >= 5 && hour < 12
          ? "morning"
          : hour >= 12 && hour < 17
            ? "afternoon"
            : hour >= 17 && hour < 22
              ? "evening"
              : "generic";

      const greetings = {
        en: {
          morning: "Good morning",
          afternoon: "Good afternoon",
          evening: "Good evening",
          generic: "Hello",
        },
        fr: {
          morning: "Bonjour",
          afternoon: "Bon après-midi",
          evening: "Bonsoir",
          generic: "Salut",
        },
        es: {
          morning: "Buenos días",
          afternoon: "Buenas tardes",
          evening: "Buenas noches",
          generic: "Hola",
        },
        de: {
          morning: "Guten Morgen",
          afternoon: "Guten Tag",
          evening: "Guten Abend",
          generic: "Hallo",
        },
      };

      return `${greetings[lang]?.[timeOfDay] || greetings.en[timeOfDay]}, ${name}.`;
    };
  }, [languages]);

  return (
    <div className="relative flex flex-col min-h-[90dvh]">
      {/* Nav gets toggle + search setter */}
      <Nav2
        navtitle={"Dashboard"}
        onToggleSideNav={toggleSideNav}
        onSearchChange={searchTerm}
        userData={userData}
      />

      {/* Side nav */}
      {isOpen && (
        <aside className="fixed top-0 left-0 w-72 h-full bg-[#1e2939] text-white px-4 py-4 z-30 flex flex-col shadow-lg animate__animated animate__slideInLeft">
          <div className="flex items-center gap-2 mb-4">
            <h2 className="text-sm font-bold">Menu</h2>
          </div>
          <hr className="border-gray-600 mb-4" />

          {/* Navigation links bg-gray-200/50*/}
          <nav className="w-full space-y-2">
            {userData.user.c_levelDash && (
              <Link
                href={`#`}
                className={
                  "flex items-center gap-3 p-3 rounded-md transition bg-gray-200/50"
                }
              >
                <PresentationChartLineIcon class="h-6 w-6 text-gray-100" />
                <span className="text-xs">Dashboard</span>
              </Link>
            )}

            <Link
              href="/SalesPortal/Products"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                 ${navtitle === "Products" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <CubeIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Products</span>
            </Link>

            <Link
              href="/SalesPortal/Reports"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                 ${navtitle === "Reports" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <Square3Stack3DIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Product Report</span>
            </Link>

            <Link
              href="/SalesPortal/Customers"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                 ${navtitle === "Customers" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <UserGroupIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">My customers</span>
            </Link>

            <Link
              href="/SalesPortal/Route"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                 ${navtitle === "Route" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <MapIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">My Route</span>
            </Link>

            <Link
              href="/SalesPortal/Requisitions"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                 ${navtitle === "Requisitions" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <QueueListIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Requisitions</span>
            </Link>

            {userData.user.workLocation && (
              <Link
                href="/SalesPortal/Inventory"
                className={`flex items-center gap-3 p-3 rounded-md transition 
                            ${navtitle === "Inventory" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
              >
                <BuildingStorefrontIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">Inventory</span>
              </Link>
            )}
          </nav>

          {/* Logout pinned at bottom */}
          <div className="mt-auto pt-6">
            <button
              className="flex items-center gap-3 px-4 py-2 w-full rounded-md transition-colors bg-gray-200 hover:bg-gray-300"
              aria-label="User Profile"
            >
              <Image
                src={userData?.user?.image || "/person.png"}
                alt="User avatar"
                width={28}
                height={28}
                className="rounded-full border border-black object-cover"
              />
              <div className="flex flex-col items-start">
                <span className="text-sm text-black font-medium">
                  {userData?.user?.firstName} {userData?.user?.lastName}
                </span>
                <span className="text-xs text-gray-500">My Account</span>
              </div>
            </button>
            {userData?.Notification?.length > 0 && (
              <>
                <br />
                <UserNotification user={userData} />
              </>
            )}
            <br />
            <Logout />
          </div>
        </aside>
      )}

      {/* Main content */}
      <main
        className="flex-1 m-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#453d46ff transparent",
        }}
      >
        <header className="mb-2">
          <div className="flex items-center space-x-2">
            <Image
              src={
                userData.business.companyLogo ||
                userData.user.image ||
                "/person.png"
              }
              className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] border-2 rounded-full object-cover "
              // loading="lazy"
              priority={true}
              quality={100}
              width={25}
              height={25}
              alt="user image"
            />
            <h2 className="text-xl font-bold text-gray-900">
              {getLocalizedGreeting(userData.user.firstName)}
            </h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {`It's ${moment().format("dddd, Do MMMM YYYY")}`}
          </p>
        </header>
        <MainDash userData={userData} baseUrl={baseUrl} />
      </main>
    </div>
  );
}

export function MainDash({ userData, baseUrl }) {
  const [loading, setLoading] = useState(true);
  const [tenantData, setTenantData] = useState(null);
  const inactivityTimer = useRef(null);
  const intervalRef = useRef(null);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [status, setStatus] = useState("Active");
  const MySwal = withReactContent(Swal);

  const INACTIVITY_LIMIT = 5 * 60 * 1000;

  const sortedInvoices = useMemo(() => {
    return (
      tenantData?.invoice?.sort(
        (a, b) => b.billReferenceNo - a.billReferenceNo,
      ) || []
    );
  }, [tenantData]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedInvoices.slice(start, start + itemsPerPage);
  }, [sortedInvoices, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(sortedInvoices.length / itemsPerPage);
  }, [sortedInvoices]);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setTimeout(() => setCurrentPage(page), 300);
      }
    },
    [totalPages],
  );

  useEffect(() => {
    const fetchTenantData = async () => {
      const isVisible = document.visibilityState === "visible";
      const isOnline = navigator.onLine;

      if (!isVisible || !isOnline || status === "Inactive") return;

      try {
        const res = await fetch(`${baseUrl}/api/Sales_Portal/Dashboard`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
            access: `${Encrypt(userData.user._id)}`,
            sessionKey: `Bearer ${userData.SessionId}`,
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
      setStatus("Active");
      clearTimeout(inactivityTimer.current);
      inactivityTimer.current = setTimeout(() => {
        setStatus("Inactive");
      }, INACTIVITY_LIMIT);
    };

    if (userData.user.c_levelDash) {
      fetchTenantData();
      resetInactivityTimer();
      intervalRef.current = setInterval(fetchTenantData, 60000);
    } else {
      setLoading(false);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && userData.user.c_levelDash) {
        fetchTenantData();
      }
    };

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
        customClass: { popup: "swal2-subscription-toast" },
        html: `
          <div style="display: flex; align-items: center;">
            <div style="text-align: left;">
              <strong style="font-size: 14px;">🧩 No internet connection</strong><br/>
            </div>
          </div>
        `,
      });
      setTimeout(() => plsWait("Currently Offline"), 3000);
    };

    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart"];
    activityEvents.forEach((event) =>
      window.addEventListener(event, resetInactivityTimer),
    );

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

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

  // ─── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="w-full space-y-6 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-4" />
                <Skeleton className="h-9 w-32 mb-3" />
                <Skeleton className="h-3 w-40" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <Skeleton className="h-72 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <Skeleton className="h-[480px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto mt-12">
        <AlertTitle>Dashboard Unavailable</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // ─── C-Level Dashboard ──────────────────────────────────────────────────────
  if (userData.user.c_levelDash) {
    const currency = userData.business.currency?.currency.Symbol || "";

    // Trend calculation for Sales card
    const todaySales = Number(tenantData?.TodaySale) || 0;
    const yesterdaySales = Number(tenantData?.yesterdaySale) || 0;
    const salesDiff = todaySales - yesterdaySales;
    const salesPercentage =
      yesterdaySales > 0
        ? ((salesDiff / yesterdaySales) * 100).toFixed(1)
        : "100";
    const salesIsUp = todaySales > yesterdaySales;
    const salesIsDown = todaySales < yesterdaySales;

    const overdueTotal =
      tenantData.Routes?.filter((c) => c.Debt > 0).reduce(
        (sum, c) => sum + (Number(c.Debt) || 0),
        0,
      ) || 0;

    const pendingTasks =
      tenantData.result?.Task?.filter((t) => t.status === "pending").length ||
      0;

    return (
      <div className="space-y-6 text-sm">
        {/* ───────────────────── KPI CARDS ───────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {/* 1. Today's Sales */}
          <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-emerald-400 to-emerald-600" />
            <CardContent className="p-5 pl-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                    Today’s Sales
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {currency}
                    {formatNumberShort(todaySales)}
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-2.5 group-hover:bg-emerald-100 transition-colors">
                  <ArrowTrendingUpIcon className="h-5 w-5 text-emerald-600" />
                </div>
              </div>

              <div className="mt-3">
                {salesIsUp ? (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 gap-1"
                  >
                    <ArrowTrendingUpIcon className="h-3.5 w-3.5" />
                    +{salesPercentage}% vs yesterday
                  </Badge>
                ) : salesIsDown ? (
                  <Badge
                    variant="secondary"
                    className="bg-red-50 text-red-700 hover:bg-red-50 gap-1"
                  >
                    <ArrowTrendingDownIcon className="h-3.5 w-3.5" />
                    {salesPercentage}% vs yesterday
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="text-muted-foreground">
                    No change vs yesterday
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 2. Overdue Payments */}
          <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-violet-400 to-violet-600" />
            <CardContent className="p-5 pl-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                    Overdue Payments
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {currency}
                    {overdueTotal.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl bg-violet-50 p-2.5 group-hover:bg-violet-100 transition-colors">
                  <BanknotesIcon className="h-5 w-5 text-violet-600" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {tenantData.Routes?.filter((c) => c.Debt > 0).length || 0}{" "}
                customers with outstanding debt
              </p>
            </CardContent>
          </Card>

          {/* 3. Today's Route */}
          <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-sky-400 to-sky-600" />
            <CardContent className="p-5 pl-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                    Today’s Route
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {tenantData.Routes?.length || 0}
                  </p>
                </div>
                <div className="rounded-xl bg-sky-50 p-2.5 group-hover:bg-sky-100 transition-colors">
                  <MapIcon className="h-5 w-5 text-sky-600" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Customers scheduled for today
              </p>
            </CardContent>
          </Card>

          {/* 4. Pending Tasks */}
          <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-400 to-amber-600" />
            <CardContent className="p-5 pl-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
                    Pending Tasks
                  </p>
                  <p className="text-2xl font-bold tracking-tight text-foreground">
                    {pendingTasks}
                  </p>
                </div>
                <div className="rounded-xl bg-amber-50 p-2.5 group-hover:bg-amber-100 transition-colors">
                  <BellAlertIcon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Tasks waiting for action
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ───────────────────── MAIN CONTENT ───────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <section className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <GenerealSalesMargin
                  yearlysales={tenantData.yearlysales}
                  warehouses={tenantData.warehouses}
                />
              </CardContent>
            </Card>

            {/* Today's Sales Table */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Today’s Sales
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInvoices.length > 0 ? (
                        paginatedInvoices.map((invoice, index) => (
                          <TableRow key={invoice._id || index}>
                            <TableCell className="font-medium text-muted-foreground">
                              {(currentPage - 1) * itemsPerPage + index + 1}
                            </TableCell>
                            <TableCell>
                              <Link
                                href={`/${userData.business.companyName}/${Encrypt(
                                  userData.user._id,
                                )}/bill/bill/${Encrypt(invoice._id)}`}
                                className="font-medium text-primary hover:underline"
                              >
                                {invoice.billReferenceNo}/
                                {invoice.invoicelocation}
                              </Link>
                            </TableCell>
                            <TableCell>{invoice.customerName}</TableCell>
                            <TableCell>
                              {currency}
                              {invoice.grandTotal?.toLocaleString()}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  invoice.billStatus !== "Cancelled"
                                    ? "default"
                                    : "destructive"
                                }
                                className="capitalize"
                              >
                                {invoice.billStatus}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="h-28 text-center text-muted-foreground"
                          >
                            No invoices found for this page.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Prev
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => (
                      <Button
                        key={i}
                        variant={currentPage === i + 1 ? "default" : "outline"}
                        size="sm"
                        className="w-9"
                        onClick={() => handlePageChange(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Right Sidebar */}
          <aside className="space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">
                  Tasks & Target
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-3">
                    Task Reminder
                  </h4>
                  <ScrollArea className="h-56 pr-3">
                    <div className="space-y-2.5">
                      {tenantData.result?.Task?.length > 0 ? (
                        tenantData.result.Task.map((task, idx) => (
                          <div
                            key={idx}
                            className="flex gap-3 rounded-lg border bg-muted/30 p-3 hover:bg-muted/50 transition-colors"
                            title={task.notes}
                          >
                            <div className="flex-1 min-w-0 space-y-1">
                              <p className="text-sm font-medium truncate">
                                {task.Text}
                              </p>
                              <p className="text-xs text-muted-foreground line-clamp-1">
                                {task.notes}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {new Date(task.createdAt).toLocaleString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </p>
                            </div>
                            <Badge
                              variant={
                                task.Status === "Done" ? "default" : "secondary"
                              }
                              className="shrink-0 self-start"
                            >
                              {task.Status === "Done" ? "Done" : "Pending"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          No tasks available
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </div>

                <Separator />

                <ChartRadialShape data={tenantData?.result} />
              </CardContent>
            </Card>
          </aside>
        </div>

        {/* Debtors Marquee */}
        {tenantData.Routes?.filter((c) => c.Debt > 0).length > 0 && (
          <Card className="shadow-sm overflow-hidden">
            <CardContent className="py-3 px-0">
              <Marquee gradient={false} speed={32}>
                <Badge variant="destructive" className="mr-4 ml-4">
                  ⚠️ Debtors
                </Badge>
                {tenantData.Routes.filter((c) => c.Debt > 0).map((debtor) => (
                  <span
                    key={debtor._id}
                    className="mx-2 inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium"
                  >
                    {debtor.Username} owes {currency}
                    {debtor.Debt?.toLocaleString()}
                  </span>
                ))}
              </Marquee>
            </CardContent>
          </Card>
        )}

        {/* Promotions Marquee */}
        {tenantData.promotions?.length > 0 && (
          <Card className="shadow-sm overflow-hidden">
            <CardContent className="py-3 px-0">
              <Marquee gradient={false} speed={38}>
                <Badge className="mr-4 ml-4 bg-amber-100 text-amber-800 hover:bg-amber-100">
                  🗂️ Products On Promo
                </Badge>
                {tenantData.promotions.map((product) => (
                  <span
                    key={product._id}
                    className="mx-2 inline-flex items-center rounded-md bg-muted px-2.5 py-1 text-xs font-medium"
                  >
                    {product.Name}: {currency}
                    {(
                      product.Pricelist1Promo ??
                      product.Pricelist2Promo ??
                      product.Pricelist3Promo ??
                      product.Pricelist4Promo ??
                      product.Pricelist5Promo ??
                      product.Pricelist6Promo ??
                      product.Pricelist7Promo
                    )?.toLocaleString()}
                  </span>
                ))}
              </Marquee>
            </CardContent>
          </Card>
        )}

        <footer className="pt-4 text-center text-xs text-muted-foreground">
          © {moment().format("YYYY")} Business Automated Dynamic Enterprise —
          All rights reserved.
        </footer>
      </div>
    );
  }

  // ─── Non C-Level Fallback ───────────────────────────────────────────────────
  return (
    <section className="w-full max-w-3xl mx-auto py-16 px-6 text-center space-y-8">
      <p className="text-muted-foreground text-base max-w-xl mx-auto leading-relaxed">
        Track your sales performance, manage customer relationships, optimize
        your routes, and monitor your daily activities all in one place.
      </p>
      <div className="flex justify-center">
        <Avatar className="h-24 w-24 shadow-lg ring-4 ring-background">
          <AvatarImage
            src={userData.business.companyLogo}
            alt="Company Logo"
          />
          <AvatarFallback className="text-xl">CO</AvatarFallback>
        </Avatar>
      </div>
      <p className="text-sm text-muted-foreground">
        Navigate through the menu to explore your dashboard features.
      </p>
      <footer className="pt-10 border-t text-xs text-muted-foreground">
        © {moment().format("YYYY")} Business Automated Dynamic Enterprise — All
        rights reserved.
      </footer>
    </section>
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

const TodaySaleTotal = ({ tenantData, userData }) => {
  const total = tenantData?.TodaySale;

  return (
    <p className="text-2xl text-gray-500 font-bold mt-1">
      {userData.business.currency?.currency.Symbol}
      {formatNumberShort(total)}
    </p>
  );
};

// sales millstone
export function ChartRadialShape({ data }) {
  const chartData = [
    {
      browser: "Target",
      visitors: data?.salesTarget || 0,
      fill: "var(--color-safari)",
    },
  ];

  const chartConfig = {
    visitors: {
      label: "Sales",
    },
    safari: {
      label: "Target set",
      color: "var(--chart-2)",
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{data?.firstName} Sales Target</CardTitle>
        <CardDescription>
          from: {data?.start} - To: {data?.end}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            outerRadius={90}
            innerRadius={80}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[90, 80]}
            />
            <RadialBar dataKey="visitors" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {(data?.totalSales || 0).toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Sales
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          You have completed {(data?.totalSales || 0).toLocaleString()} /{" "}
          {(data?.salesTarget || 0).toLocaleString()}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          {data?.percentage || "0.00"}% of target achieved
        </div>
      </CardFooter>
    </Card>
  );
}
