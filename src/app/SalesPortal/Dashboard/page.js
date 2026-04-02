"use client";

import Footer2 from "@/app/Components/Footer2";
import Link from "next/link";
import Image from "next/image";
import moment from "moment";
import { Encrypt } from "../../../../Functions/Functions";
import UserNotification from "@/app/Components/UserNotification";
import Logout from "@/app/Components/Logout";
import MainDash from "@/app/Components/MainDash";
import SubscriptionReminder from "@/app/Components/SubscritionReminder";
import BirthdayGreetings from "@/app/Components/BithdayToast";
import { useState } from "react";

export default function TenantPage({ userData }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleToggle = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  const languages = ["es", "en", "de", "fr"];

  const getRandomLanguage = () =>
    languages[Math.floor(Math.random() * languages.length)];

  const getLocalizedGreeting = (name = "Guest", lang = getRandomLanguage()) => {
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

    return `${
      greetings[lang]?.[timeOfDay] || greetings.en[timeOfDay]
    }, ${name}.`;
  };

  const companySlug = userData?.business?.companyName
    ?.toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  return (
    <div className="relative flex flex-col bg-gray-100 min-h-screen">
      <nav className="sticky top-0 z-20 backdrop-blur w-full bg-[#fcfcfcda] p-2 shadow-xs shadow-gray-400 border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between ">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Sales Portal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleToggle}
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition hover:bg-slate-800"
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
          <aside className="absolute top-0 left-0 h-full w-72 bg-[#1e2939] text-white px-4 py-4 overflow-y-auto z-30 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-sm font-bold">Menu</h2>
            </div>
            <hr className="border-gray-600 mb-4" />

            {/* Navigation links */}
            <nav  className="w-full">
              <div
                className="max-h-[40vh] overflow-y-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#d9d1daff transparent",
                }}
              >
                <Link
                  href={`/SalesPortal/Customers`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <Image
                    src="https://img.icons8.com/?size=80&id=6Dhx5KybHIh2&format=png"
                    width={24}
                    height={24}
                    alt="crm"
                  />
                  <span className="text-xs">My customers</span>
                </Link>

                <Link
                  href={`/SalesPortal/Products`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <Image
                    src="https://img.icons8.com/?size=64&id=aR2Ar4o65ts7&format=png"
                    width={24}
                    height={24}
                    alt="Products"
                  />
                  <span className="text-xs">Products List</span>
                </Link>

                <Link
                  href={`/SalesPortal/Route`}
                  className="flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition"
                >
                  <Image
                    src="https://img.icons8.com/keek/100/map-marker.png"
                    width={24}
                    height={24}
                    alt="route"
                  />
                  <span className="text-xs">My route</span>
                </Link>
              </div>
            </nav>

            {/* Logout pinned at bottom */}
            <div className="mt-auto">
              <button
                className="flex items-center gap-3 px-4 py-2 w-full mt-2 rounded-md transition-colors bg-gray-200 hover:bg-gray-300"
                aria-label="User Profile"
              >
                {/* User avatar */}
                <Image
                  src={userData?.user?.image || "/person.png"}
                  alt="User avatar"
                  width={28}
                  height={28}
                  className="rounded-full border border-black object-cover"
                />

                {/* User info */}
                <div className="flex flex-col items-start">
                  <span className="text-sm text-black font-medium">
                    {userData?.user?.firstName} {userData?.user?.lastName}
                  </span>
                  <span className="text-xs text-gray-500">My Account</span>
                </div>
              </button>
              {userData?.Notification?.length > 0 && (
              <>
                <br/>
                <UserNotification user={userData} />
              </>
              )}
              <Logout />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main
          className="flex-1 w-full h-screen overflow-y-scroll p-6 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#453d46ff transparent",
          }}
        >
          <section className=" ">
            <header className="mb-2">
              <div className="flex items-center space-x-2">
                <Image
                  src={userData.user.image || "/person.png"}
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

            <MainDash userData={userData} />
          </section>
        </main>
      </div>
      <SubscriptionReminder Business={userData.business} />
      <BirthdayGreetings Business={userData.business} user={userData.user} />
      
    </div>
  );
}
