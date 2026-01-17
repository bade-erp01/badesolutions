"use client";

import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import "animate.css";
import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Encrypt } from "../../../Functions/Functions";
import { useRouter } from "next/navigation";
import moment from "moment";
import Logout from "@/app/Components/Logout";
import UserNotification from "@/app/Components/UserNotification";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export default function Nav1({ page, Module, user, business }) {
  const pathName = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const [time, setTime] = useState("");
  const [location, setLocation] = useState("Loading location...");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const now = new Date();
    setTime(moment().format("HH:mm"));

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

  useEffect(() => {
    setHydrated(true);
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm) {
      Swal.fire("No search query", "Please enter a search word", "warning");
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
        className="w-full flex items-center justify-between px-5 py-5 z-20 relative "
      >
        <nav className="w-full bg-[#fcfcfcda] p-2 rounded-2xl shadow-xs shadow-gray-400">
          <div className="container mx-auto flex justify-between items-center">
            {/* Logo */}
            <Link
              href={href}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <Squares2X2Icon className="h-6 w-6 text-gray-800 mr-2 -mt-1 hover:text-gray-900 hover:scale-110 hover:drop-shadow-md transition-all duration-300 font-bold" />
              <span className="font-bold text-sm text-gray-900">
                {page ? page.toUpperCase() : "BADE"}
              </span>
            </Link>

            {/* Desktop Search Bar  fuchsia*/}
            {business && user && Module?.length > 0 && (
              <form
                onSubmit={handleSearch}
                className="hidden md:flex items-center gap-2 flex-1 mx-8 max-w-md"
              >
                <div className="relative w-full">
                  <Input
                    type="search"
                    placeholder={`Search ${page}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button type="submit" size="sm" variant="default">
                  Search
                </Button>
              </form>
            )}

            {/* Desktop Navigation */}
            {!business || !user ? (
              <div className="hidden md:flex gap-6 items-center">
                <Link
                  href="#"
                  className={`text-sm font-medium transition hover:text-blue-600 ${
                    pathName === "/Why_Badde"
                      ? "text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  Why Bade?
                </Link>
                <Link
                  href="/Pricing"
                  className={`text-sm font-medium transition hover:text-blue-600 ${
                    pathName === "/Pricing" ? "text-blue-600" : "text-gray-700"
                  }`}
                >
                  Pricing
                </Link>
              </div>
            ) : null}

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {business && user ? (
                <>
                  {/* Time & Location */}
                  <div className="hidden lg:flex items-center gap-2 text-xs text-gray-600">
                    <Badge variant="secondary" className="whitespace-nowrap">
                      🕒 {time}
                    </Badge>
                    <Badge variant="secondary" className="whitespace-nowrap">
                      📍 {location}
                    </Badge>
                  </div>

                  {/* User Dropdown */}
                  <div className="relative inline-block text-left">
                    <button
                      type="button"
                      className="inline-flex justify-center w-full rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      aria-expanded={isDropdownOpen}
                      aria-haspopup="true"
                      id="menu-button"
                    >
                      {user?.image && (
                        <Image
                          src={user.image || "/person.png"}
                          className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] border-2 rounded-full object-cover"
                          priority={true}
                          quality={100}
                          width={25}
                          height={25}
                          alt="user image"
                        />
                      )}
                    </button>

                    {isDropdownOpen && (
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate__animated animate__slideInRight"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="menu-button"
                      >
                        <div className="py-1" role="none">
                          <p
                            className="text-gray-500 px-4 py-2 text-sm"
                            role="menuitem"
                          >
                            🏢 {business.companyName.toUpperCase()}
                          </p>
                          <hr className="border-gray-200" />
                          <p
                            className="text-gray-500 px-4 py-2 text-sm"
                            role="menuitem"
                          >
                            Signed in as <br /> {user?.Email.slice(0,10) || "Guest"}...
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
                            >
                              Account settings ⚙️
                            </Link>
                          )}

                          {user?.Notification?.length > 0 && (
                            <UserNotification user={user} />
                          )}

                          <Logout />
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Button asChild variant="default">
                  <Link href="/Login">Login</Link>
                </Button>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? (
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

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {business && user && Module?.length > 0 && (
                <form onSubmit={handleSearch} className="flex gap-2">
                  <Input
                    type="search"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button type="submit" size="sm">
                    🔍
                  </Button>
                </form>
              )}
              <div className="space-y-2">
                <Link href="/" className="block py-2 text-blue-600 font-medium">
                  Home
                </Link>
                <Link
                  href="/services"
                  className="block py-2 text-blue-600 font-medium"
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  className="block py-2 text-blue-600 font-medium"
                >
                  Contact
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
