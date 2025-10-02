"use client";

import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import "animate.css";
import { Squares2X2Icon } from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Encrypt } from "../../../Functions/Functions";
import { useRouter } from "next/navigation";
import moment from "moment";
import Logout from "@/app/Components/Logout";
import UserNotification from "@/app/Components/UserNotification";

export default function Nav1({ page, Module, user, business }) {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const [date, setDate] = useState("");
  const [weekday, setWeekday] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Loading location...");

  useEffect(() => {
    const now = new Date();
    setDate(now.getDate() + getOrdinal(now.getDate()));
    setWeekday(now.toLocaleDateString(undefined, { weekday: "short" }));
    setTime(
      // now.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
      moment().format("HH:mm")
    );
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            );
            const data = await res.json();
            setLocation(
              data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state ||
                "Your area"
            );
          } catch {
            setLocation("Your area");
          }
        },
        () => setLocation("Your area")
      );
    } else {
      setLocation("Your area");
    }
  }, []);

  function getOrdinal(n) {
    if (n > 3 && n < 21) return "th";
    switch (n % 10) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredModules, setFilteredModules] = useState(Module || []);

  useEffect(() => {
    setFilteredModules(Module || []);
  }, [Module]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm) {
      Swal.fire("No search query", "Please enter a search word", "warning");
      setFilteredModules([]);
      return;
    }

    Swal.fire({
      title: "Searching...",
      text: `Searching for "${trimmedTerm}" in the ${page} list...`,
      icon: "info",
      showClass: {
        popup: "animate__animated animate__fadeInUp animate__faster",
      },
      hideClass: {
        popup: "animate__animated animate__fadeOutDown animate__faster",
      },
    });

    setTimeout(() => {
      router.push(
        `/Search/${encodeURIComponent(page)}?search=${encodeURIComponent(
          trimmedTerm
        )}`
      );
      Swal.close();
      setSearchTerm("");
    }, 400);
  };

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-80"></div>
      </div>
    );
  }

  const sanitizedCompanyName = business?.companyName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const href =
    business && user ? `/${sanitizedCompanyName}/${Encrypt(user._id)}` : "/";

  return (
    <>
      <header
        className="w-full flex items-center justify-between px-5 py-5 
 z-20 relative "
      >
        <nav className="w-full bg-[#fcfcfcda] p-2 rounded-2xl shadow-xs shadow-gray-400">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo */}
            <Link
              href={href}
              className="text-fuchsia-800 text-sm font-bold flex items-center"
            >
              {page ? (
                <>
                  <Squares2X2Icon className="h-6 w-6 text-gray-700 mr-2 -mt-1 hover:text-pink-500 hover:scale-110 hover:drop-shadow-md transition-all duration-300" />
                  {page.toUpperCase()}
                </>
              ) : (
                <h5 className="font-bold ">BADE</h5>
              )}
            </Link>
            {business && user ? (
              // Search Bar - Visible on Desktop
              Module?.length > 0 ? (
                <form
                  onSubmit={handleSearch}
                  title={`Search through ${page} collection ...🪄✨`}
                  className="md:flex items-center bg-white rounded-md px-3 py-1 shadow shadow-purple-300"
                >
                  <input
                    type="search"
                    className="outline-none px-2 w-40 lg:w-60"
                    placeholder={`Search ${page} ...🪄✨`}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <button type="submit" className="text-blue-600 px-2">
                    <Image
                      src="https://img.icons8.com/ios-filled/50/google-web-search.png"
                      width={`25`}
                      height={`25`}
                      alt="search"
                    />
                  </button>
                </form>
              ) : null
            ) : (
              <div className="md:flex gap-8 text-gray-700 font-medium text-sm">
                <Link
                  href="#"
                  className={`hover:text-pink-500 transition ${
                    pathName === "/Why_Badde"
                      ? "text-pink-500 bg-gray-100 "
                      : ""
                  }`}
                >
                  Why Bade?
                </Link>
                <Link
                  href="/Pricing"
                  className={`hover:text-pink-500 transition ${
                    pathName === "/Pricing"
                      ? "text-pink-500 bg-gray-100 "
                      : ""
                  }`}
                >
                  Pricing
                </Link>
              </div>
            )}

            {business && user ? (
              <div className="hidden md:flex space-x-6 items-center">
                <div
                  className="relative z-10 text-sm text-gray-600 mt-2"
                  title={` 🕒${time},📍${location}`}
                >
                  <div className="flex items-center ">
                    <small className="text-xs text-gray-500 font-small">
                      🕒{time}, 📍{location}
                    </small>
                  </div>
                </div>

                {/* Dropdown Menu */}
                <div className="relative inline-block text-left">
                  <button
                    type="button"
                    className="inline-flex justify-center w-full rounded-md border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    aria-expanded="true"
                    aria-haspopup="true"
                  >
                    {user?.image ? (
                      <Image
                        src={user.image}
                        className="drop-shadow-sm border-2 rounded-full object-cover"
                        // loading="lazy"
                        priority={true}
                        quality={100}
                        width={25}
                        height={25}
                        alt="user image"
                      />
                    ) : (
                      <Image
                        src="/person.png"
                        loading="lazy"
                        alt="user image"
                        priority={false}
                        quality={100}
                        height={25}
                        width={25}
                        className=" rounded-full object-cover"
                      />
                    )}
                  </button>

                  {isDropdownOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate__animated animate__slideInRight"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="menu-button"
                      tabIndex={-1} // Corrected tabIndex usage
                    >
                      <div className="py-1" role="none">
                        <p
                          className="text-gray-500 px-4 py-2 text-sm"
                          role="menuitem"
                          tabIndex={-1}
                        >
                          🏢 {business.companyName.toUpperCase()}
                        </p>
                        <hr className="border-gray-200" />
                        <p
                          className="text-gray-500 px-4 py-2 text-sm"
                          role="menuitem"
                          tabIndex={-1}
                        >
                          Signed in as <br /> {user?.Email || "Guest"}
                        </p>
                        <hr className="border-gray-200" />
                        {user?.isAdmin && (
                          <Link
                            href={`/${sanitizedCompanyName}/account/${business._id}`}
                            className={
                              pathName === "/Account"
                                ? "text-blue-400 block px-4 py-2 text-sm hover:bg-gray-100"
                                : "text-gray-700 block px-4 py-2 text-sm hover:bg-gray-100"
                            }
                            role="menuitem"
                            tabIndex={-1}
                          >
                            Account settings ⚙️
                          </Link>
                        )}
                        {user.Notification.length > 0 && (
                          // <Link
                          //   href={`/${sanitizedCompanyName}/Notification`}
                          //   className="text-gray-700 block px-4 py-2 text-sm hover:bg-gray-300"
                          //   role="menuitem"
                          //   tabIndex={-1}
                          // >
                          //   {user.Notification.length} Notifications 🔔
                          // </Link>
                          <UserNotification user={user} />
                        )}

                        <Logout />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/Login"
                className={`hover:text-pink-500 transition ${
                  pathName === "/Login" ? "text-pink-500 bg-gray-100" : ""
                }`}
              >
                Login
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-dark focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? "✖" : "☰"}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Search Bar */}
      {isOpen && (
        <form className="md:hidden mt-2 bg-white rounded-md shadow-md p-3 flex items-center">
          <input
            type="search"
            className="outline-none px-2 w-full"
            placeholder="Search..."
          />
          <button type="submit" className="text-blue-600 px-2">
            🔍
          </button>
        </form>
      )}

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden mt-2 bg-white rounded-lg shadow-md p-4">
          <Link
            href="/"
            className="block py-2 text-blue-600 hover:bg-gray-100 rounded"
          >
            Home
          </Link>
          <Link
            href="/services"
            className="block py-2 text-blue-600 hover:bg-gray-100 rounded"
          >
            Services
          </Link>
          <Link
            href="/contact"
            className="block py-2 text-blue-600 hover:bg-gray-100 rounded"
          >
            Contact
          </Link>
        </div>
      )}
    </>
  );
}
