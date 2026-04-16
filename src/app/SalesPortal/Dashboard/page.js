"use client";

import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import UserNotification from "@/app/Components/UserNotification";
import Logout from "@/app/Components/Logout";
import SubscriptionReminder from "@/app/Components/SubscritionReminder";
import BirthdayGreetings from "@/app/Components/BithdayToast";
import { useState, useEffect, useMemo } from "react";
import { PresentationChartLineIcon, UserGroupIcon, MapIcon, CubeIcon, QueueListIcon } from "@heroicons/react/24/outline";
import GenerealSalesMargin from "@/app/Components/GenerealSalesMargin";
import {Separator} from "@/components/ui/separator";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveContainer,
} from "recharts";
// ChartRadialShape component remains the same
import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"

import {
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { ChartContainer } from "@/components/ui/chart"
import {Encrypt,Dencrypt} from "../../../../Functions/Functions"


export default function TenantPage({ userData, baseUrl }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleToggle = () => {
    setIsLoggedIn(!isLoggedIn);
  };

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
    <div className="relative flex flex-col bg-gray-100 min-h-screen">
      <nav className="sticky top-0 z-20 backdrop-blur w-full bg-[#fcfcfcda] p-2 shadow-xs shadow-gray-400 border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between ">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggle}
              className="rounded-lg px-5 py-2 text-sm font-semibold text-slate-900 transition hover:text-slate-800"
            >
              {isLoggedIn ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-2 max-h-[91vh] overflow-y-hidden">
        {/* Sidebar */}
        {isLoggedIn && (
          <aside className="fixed top-0 left-0 w-72 h-full bg-[#1e2939] text-white px-4 py-4 z-30 flex flex-col shadow-lg animate__animated animate__slideInLeft">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold">Menu</h2>
            </div>
            <hr className="border-gray-600 mb-4" />

            <nav className="w-full space-y-2">
              <Link
                href={`#`}
                className={"flex items-center gap-3 p-3 rounded-md bg-gray-200 text-gray-700 transition "}
              >
                <PresentationChartLineIcon className="h-6 w-6 text-gray-700" />
                <span className="text-xs">Dashboard</span>
              </Link>

              <Link
                href="/SalesPortal/Products"
                className={`flex items-center gap-3 p-3 rounded-md transition`}
              >
                <CubeIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">Products</span>
              </Link>

              <Link
                href="/SalesPortal/Customers"
                className={`flex items-center gap-3 p-3 rounded-md transition`}
              >
                <UserGroupIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">My customers</span>
              </Link>

              <Link
                href="/SalesPortal/Route"
                className={`flex items-center gap-3 p-3 rounded-md transition`}
              >
                <MapIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">My Route</span>
              </Link>

              <Link
                href="/SalesPortal/Requisitions"
                className={`flex items-center gap-3 p-3 rounded-md transition`}
              >
                <QueueListIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">Requisitions</span>
              </Link>
            </nav>

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
              <Logout />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main
          className="flex-1 w-full h-screen overflow-y-scroll p-6 bg-linear-to-br from-gray-200 via-gray-100 to-gray-300"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#453d46ff transparent",
          }}
        >
          <section className="mb-3 ">
            <header className="mb-2">
              <div className="flex items-center space-x-2">
                <Image
                  src={userData.user.image || "/person.png"}
                  className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] border-2 rounded-full object-cover "
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

            <Dashboard userData={userData} baseUrl={baseUrl} />
          </section>
        </main>
      </div>
      <SubscriptionReminder Business={userData.business} />
      <BirthdayGreetings Business={userData.business} user={userData.user} />
    </div>
  );
}


const kpis = [
  { title: "Today's Sales", value: "₦250,000" },
  { title: "Total Debt", value: "₦1,200,000" },
  { title: "Total Customers", value: "320" },
  { title: "Today's Route", value: "Abuja → Kaduna" },
];

const salesData = [
  { month: "Jan", sales: 200 },
  { month: "Feb", sales: 300 },
  { month: "Mar", sales: 250 },
  { month: "Apr", sales: 400 },
];

const tasks = [
  { id: 1, title: "Follow up with Client A", status: "pending" },
  { id: 2, title: "Deliver goods to Route B", status: "done" },
  { id: 3, title: "Prepare invoice for Client C", status: "pending" },
];

export function Dashboard({ userData, baseUrl }) {
  const [dashboardTasks, setDashboardData] = useState(tasks);
  const [selectedTask, setSelectedTask] = useState(null);
  const [error,setError] = useState("")
  
 useEffect(() => {
  const fetchTasks = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/Sales_Portal/Dashboard`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userData?.user?.tenantId)}`,
          access: `${Encrypt(userData?.user?._id)}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch tasks");
      const data = await response.json();
      setDashboardData(Dencrypt(data));
      console.log(Dencrypt(data))
    } catch (error) {
      setError(
          "The dashboard server is currently down or unreachable. Please try again later if the issue persists.",
        );
    }
  };

  // ensure on user with cleveldashboard acess can call the api
    if (userData.user.c_levelDash) {
     
      // Fetch immediately on mount
      fetchTasks();
      
      // Then fetch every 2 minutes
      const interval = setInterval(() => {
        fetchTasks();
      }, 120000);

      return () => clearInterval(interval);
    }

}, [userData]);


  const memoizedKpis = useMemo(() => kpis, []);
  const memoizedSalesData = useMemo(() => salesData, []);
  const memoizedTasks = useMemo(() => dashboardTasks, [dashboardTasks]);

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {memoizedKpis.map((kpi, i) => (
          <Card key={i} className="shadow-md hover:shadow-lg transition-shadow bg-linear-to-br from-white to-gray-50 border-gray-200">
            <CardHeader className="pb-1">
              <CardTitle className="text-xs font-bold text-gray-600 uppercase tracking-wide">{kpi.title}</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <p className="text-xl md:text-md font-bold text-gray-900">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Middle + Left Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Sales Target + Tasks */}
        <div className="space-y-4">
          {/* Sales Target */}
          <Card className="shadow-md border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold">Sales Target</CardTitle>
                <Badge className="bg-green-100 text-green-800">On Track</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ChartRadialShape data={[{ name: "Achieved", value: 70 }]} />
            </CardContent>
          </Card>

          {/* Tasks */}
          <Card className="shadow-md border-gray-200 bg-white">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-semibold">Tasks</CardTitle>
                <Badge variant="outline" className="text-xs">{memoizedTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {memoizedTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-gray-100 cursor-pointer transition"
                >
                  <span className={task.status === "done" ? "line-through text-gray-400" : "text-gray-900"}>{task.title}</span>
                  <Badge
                    variant={task.status === "done" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {task.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Middle + Right: Charts & Analytics */}
        <div className="lg:col-span-2 space-y-4">
          {/* MoM Sales Trend */}
                <Card className="shadow-md border-gray-200 bg-white">
                <CardHeader className="pb-3">
                </CardHeader>
                <CardContent>
                  <div className="w-full h-[250px] sm:h-[350px] md:h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <GenerealSalesMargin yearlysales={[]} warehouses={[]} />
                  </ResponsiveContainer>
                  </div>
                </CardContent>
                </Card>

                {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-md border-gray-200 bg-linear-to-br from-blue-50 to-indigo-50">
              <CardContent className="pt-4">
                <p className="text-xs text-gray-600 font-medium">Conversion Rate</p>
                <p className="text-2xl font-bold text-indigo-600 mt-1">24.5%</p>
                <p className="text-xs text-green-600 mt-2">↑ 2.3% from last week</p>
              </CardContent>
            </Card>
            <Card className="shadow-md border-gray-200 bg-linear-to-br from-purple-50 to-pink-50">
              <CardContent className="pt-4">
                <p className="text-xs text-gray-600 font-medium">Avg Order Value</p>
                <p className="text-2xl font-bold text-purple-600 mt-1">₦15,800</p>
                <p className="text-xs text-green-600 mt-2">↑ 5.1% from last week</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}


export const description = "A radial chart with a custom shape"

const chartData = [
  { browser: "safari", visitors: 1260, fill: "var(--color-safari)" },
]

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
}

export function ChartRadialShape() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Radial Chart - Shape</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            endAngle={100}
            innerRadius={65}
            outerRadius={95}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="visitors" background />
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
                          {chartData[0].visitors.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Visitors
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  )
}
