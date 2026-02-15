"use client";

import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import "animate.css";
import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Encrypt, EXPRESS_PRIVATE_URL } from "../../../Functions/Functions";
import { plsWait, SuccessToast, ErrorMessage } from "../../../Functions/Mics";
import { useRouter } from "next/navigation";
import moment from "moment";
import Logout from "@/app/Components/Logout";
import UserNotification from "@/app/Components/UserNotification";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

  const handleTenantSwitch = async (tenantId) => {
    const result = await Swal.fire({
      title: "Confirm Tenant Switch",
      text: "Are you sure you want to switch to this tenant?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, switch",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      plsWait("Please wait while we switch your tenant...");

      try {
        // Example API call or navigation
        const response = await fetch(
          `${EXPRESS_PRIVATE_URL}/api/switch-tenant/${Encrypt(user._id)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Encrypt(business.tenantId)}`,
              access: `${Encrypt(user._id)}`,
            },
            body: JSON.stringify({ tenantId }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to switch tenant.");
        }
        SuccessToast(response.message || "Tenant switched successfully.");
        router.refresh();
      } catch (error) {
        ErrorMessage("An error occurred while switching tenant.");
      }
    }
  };

  useEffect(() => {
    const now = new Date();
    setTime(moment().format("HH:mm"));

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            );
            const data = await res.json();
            setLocation(
              data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.state ||
                "Your area",
            );
          } catch {
            setLocation("Your area");
          }
        },
        () => setLocation("Your area"),
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
      ErrorMessage("Please enter a search word");
      return;
    }

    plsWait(`Searching for "${trimmedTerm}" in the ${page} list...`);

    setTimeout(() => {
      router.push(
        `/Search/${encodeURIComponent(page)}?search=${encodeURIComponent(
          trimmedTerm,
        )}`,
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
      <header className="w-full flex items-center justify-between px-4 py-4 z-20 relative ">
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
                  <Popover className="relative inline-block text-left">
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        className="p-0 rounded-full"
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
                      </Button>
                    </PopoverTrigger>

                    {isDropdownOpen && (
                      <PopoverContent className="w-80">
                        <div className="py-1" role="none">
                          <p
                            className="text-green-700 px-4 py-2 text-sm"
                            role="menuitem"
                            title="Active Business account"
                          >
                            <PowerIcon className="w-4 h-4 inline mr-2" />
                            {business.companyName.toUpperCase()}
                          </p>
                          <hr className="border-gray-200" />
                          <p
                            className="text-gray-500 px-4 py-2 text-sm"
                            role="menuitem"
                          >
                            Signed in as <br />{" "}
                            {user?.Email.slice(0, 20) || "Guest"}...
                          </p>
                          <hr className="border-gray-200" />

                          {user.toogledTenants.length > 0 && (
                            <>
                              <div
                                className="max-h-48 overflow-y-auto px-4 py-2 text-sm text-gray-700 border rounded-md"
                                role="menuitem"
                              >
                                {user.toogledTenants
                                  .filter(
                                    (tenant) =>
                                      tenant.tenantIds !== user.tenantId,
                                  )
                                  .map((tenant, index) => (
                                    <button
                                      key={tenant._id || index}
                                      className="w-full text-left text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 py-1 rounded transition-colors duration-200"
                                      onClick={() =>
                                        handleTenantSwitch(
                                          Encrypt(tenant.tenantIds),
                                        )
                                      }
                                    >
                                      🔄 Switch to{" "}
                                      {tenant.companyName ||
                                        `Tenant ${index + 1}`}
                                    </button>
                                  ))}
                              </div>
                              <hr className="border-gray-200" />
                            </>
                          )}

                          {user?.isAdmin && (
                            <Link
                              href={`/${sanitizedCompanyName}/account/${Encrypt(business._id)}`}
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
                      </PopoverContent>
                    )}
                  </Popover>
                </>
              ) : (
                <Button asChild variant="default">
                  <Link href="/Login">Get started →</Link>
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
