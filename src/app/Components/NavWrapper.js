"use client";
import { useState } from "react";
import Nav2 from "@/app/Components/Nav2";
import Card from "@/app/Components/Card";
import Link from "next/link";
import Image from "next/image";
import Logout from "@/app/Components/Logout";
import UserNotification from "@/app/Components/UserNotification";
import { PresentationChartLineIcon,UserGroupIcon,MapIcon,CubeIcon } from "@heroicons/react/24/outline";

export default function NavWrapper({ userData, data, navtitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [Data] = useState(data || []);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSideNav = () => setIsOpen((prev) => !prev);

  // Filter logic
  const filteredData = Data.filter(
    (item) =>
      item?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) || item?.Username?.toLowerCase().includes(searchTerm.toLowerCase()),
    ).sort((a, b) => a.Name.trim().localeCompare(b.Name.trim()));

  return (
    <div className="relative flex flex-col min-h-[90dvh]">
      {/* Nav gets toggle + search setter */}
      <Nav2
        navtitle={navtitle}
        onToggleSideNav={toggleSideNav}
        onSearchChange={setSearchTerm}
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
          <Link
            href={`/SalesPortal/Dashboard`}
            className={"flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition "}
          >
            <PresentationChartLineIcon class="h-6 w-6 text-gray-100" />
            <span className="text-xs">Dashboard</span>
          </Link>
          
            <Link
              href="/SalesPortal/Products"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Products" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <CubeIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Products</span>
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
            <Logout />
          </div>
        </aside>
      )}

      {/* Main content */}
      <main
        className="flex-1"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#453d46ff transparent",
        }}
      >
        {filteredData.length > 0 ? (
          <section className="mx-auto flex flex-col gap-6 rounded-lg p-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
              {filteredData.map((element) => (
                <Card
                  key={element._id}
                  data={element}
                  module="product"
                  className="shadow-md hover:shadow-lg transition rounded-lg"
                />
              ))}
            </div>
          </section>
        ) : (
          <div className="p-10 text-center">
            <p className="text-gray-500">Nothing to show.</p>
          </div>
        )}
      </main>
    </div>
  );
}
