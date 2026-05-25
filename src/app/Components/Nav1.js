"use client";

import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import "animate.css";

import {
  Squares2X2Icon,
  MagnifyingGlassIcon,
  PowerIcon,
  Bars3Icon,
  XMarkIcon,
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

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Badge } from "@/components/ui/badge";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export default function Nav1({ page, Module, user, business, IconArray }) {
  const pathName = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  const [time, setTime] = useState("");

  const [location, setLocation] = useState("Loading location...");

  const [searchTerm, setSearchTerm] = useState("");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTenantSwitch = async (tenantId) => {
    const result = await Swal.fire({
      title: "Confirm Tenant Switch",
      text: "Are you sure you want to switch to this tenant?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#18181b",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, switch",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      plsWait("Please wait while we switch your tenant...");

      try {
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

    const trimmedTerm = searchTerm.trim().replace(/\s/g, "%");

    if (!trimmedTerm) {
      ErrorMessage("Please enter a search word");

      return;
    }

    plsWait(`Searching for "${trimmedTerm}" in the ${page} list...`);

    setTimeout(() => {
      router.push(
        `/Search/${encodeURIComponent(page)}?search=${trimmedTerm}`,
      );
      setLoading(false);
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
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")
    ?.replace(/[^a-z0-9-]/g, "");

  const href =
    business && user ? `/${sanitizedCompanyName}/${Encrypt(user._id)}` : "/";

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-1 py-1 text-xs">
        <nav className=" flex w-full items-center justify-between border border-white/20 bg-white/75 px-4 py-3 shadow-xl backdrop-blur-2xl">
          {/* LEFT */}
          <div className="flex items-center gap-3 p-2">
            {/* MOBILE MENU */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              {IconArray && (
                <SheetTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="lg:hidden rounded-2xl"
                  >
                    <Bars3Icon className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
              )}

              <SheetContent
                side="left"
                className="w-[300px] border-0 bg-white/95 backdrop-blur-2xl"
              >
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>

                <div className="mt-8 flex flex-col gap-4">
                  {/* SEARCH */}
                  {business && user && Module?.length > 0 && (
                    <Card className="p-3 shadow-sm m-1">
                      <form onSubmit={handleSearch} className="space-y-4">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />

                          <Input
                            type="search"
                            placeholder={`Search ${page}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-12 rounded-xl pl-10 pr-10 border border-zinc-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                          />

                          {searchTerm && (
                            <button
                              type="button"
                              onClick={() => setSearchTerm("")}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full rounded-xl bg-gray-500 text-white font-semibold shadow-md transition flex items-center justify-center gap-2"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Searching...
                            </>
                          ) : (
                            <>Search {page}</>
                          )}
                        </Button>
                      </form>
                    </Card>
                  )}

                  {/* PUBLIC LINKS */}
                  {!business || !user ? (
                    <div className="flex flex-col gap-2 p-3">
                      <Link
                        href="/why-bade"
                        className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-zinc-100"
                      >
                        Why Bade?
                      </Link>

                      <Link
                        href="/Pricing"
                        className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-zinc-100"
                      >
                        Pricing
                      </Link>

                      <Link
                        href="/Marketers"
                        className="rounded-2xl px-4 py-3 text-sm font-medium hover:bg-zinc-100"
                      >
                        Refer & Earn
                      </Link>
                    </div>
                  ) : (
                    <div
                      className="
                      flex-1
                      overflow-hidden
                      bg-gradient-to-b
                      from-[#0f172a]
                      via-[#111827]
                      to-[#020617]
                    "
                    >
                      {IconArray && (
                        <div
                          className="
                          h-full
                          overflow-y-auto
                          px-3
                          pb-24
                          pt-2
                          space-y-1
                        "
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "#334155 transparent",
                          }}
                        >
                          {user?.Apps.map((app, index) => {
                            const appHref = `/${business?.companyName
                              ?.toLowerCase()
                              .replace(/\s+/g, "-")
                              .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                              user._id,
                            )}/${app.url
                              .toLowerCase()
                              .replace(/\s+/g, "")}/${app.url
                              .toLowerCase()
                              .replace(/\s+/g, "")}`;

                            return (
                              <Link
                                key={index}
                                href={appHref}
                                title={app.Description || ""}
                                className="
                                group
                                relative
                                flex
                                items-center
                                gap-3
                                rounded-xl
                                px-2
                                py-2
                                transition-all
                                duration-300
                                hover:bg-white/8
                                border
                                border-transparent
                                hover:border-white/10
                              "
                              >
                                {/* ACTIVE GLOW */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* ICON */}
                                <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 group-hover:bg-white/10 transition-all duration-300 shadow-lg shrink-0">
                                  <Image
                                    src={
                                      app.icon ||
                                      "https://img.icons8.com/deco/48/open-box.png"
                                    }
                                    width={20}
                                    height={20}
                                    alt={app.Name}
                                    priority
                                    quality={100}
                                    className="object-contain"
                                  />
                                </div>

                                {/* TEXT */}
                                <div className="flex-1 min-w-0 relative">
                                  <p className="text-xs font-medium text-gray-100 truncate">
                                    {app.Name}
                                  </p>

                                  <p className="text-[11px] text-gray-400 truncate mt-0.5">
                                    {app.Description?.slice(0, 45) ||
                                      "Business module"}
                                  </p>
                                </div>
                              </Link>
                            );
                          })}

                          {/* SPECIAL APPS */}
                          {user?.Email.trim() === "tobenna970@gmail.com" && (
                            <>
                              {[
                                {
                                  name: "CRM",
                                  url: "crm",
                                  icon: "https://img.icons8.com/?size=80&id=6Dhx5KybHIh2&format=png",
                                  description:
                                    "Customer relationship management.",
                                },
                                {
                                  name: "Employee Management",
                                  url: "employee",
                                  icon: "https://img.icons8.com/?size=80&id=SiarGqFdE5SR&format=png",
                                  description:
                                    "Manage employee operations efficiently.",
                                },
                                {
                                  name: "Product Management",
                                  url: "product",
                                  icon: "https://img.icons8.com/?size=64&id=aR2Ar4o65ts7&format=png",
                                  description:
                                    "Centralized product operations.",
                                },
                                {
                                  name: "Cash Register",
                                  url: "payment",
                                  icon: "https://img.icons8.com/dusk/64/cash-register.png",
                                  description:
                                    "Process transactions and payments.",
                                },
                                {
                                  name: "Stores Operations",
                                  url: "store",
                                  icon: "https://img.icons8.com/arcade/64/garage-closed.png",
                                  description:
                                    "Warehouse and inventory management.",
                                },
                              ].map((item, i) => (
                                <Link
                                  key={i}
                                  href={`/${business?.companyName
                                    ?.toLowerCase()
                                    .replace(/\s+/g, "-")
                                    .replace(/[^a-z0-9-]/g, "")}/${Encrypt(
                                    user._id,
                                  )}/${item.url}/${item.url}`}
                                  className="
                                    group
                                    relative
                                    flex
                                    items-center
                                    gap-3
                                    rounded-2xl
                                    px-3
                                    py-3
                                    transition-all
                                    duration-300
                                    hover:bg-white/8
                                    border
                                    border-transparent
                                    hover:border-white/10
                                  "
                                >
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 border border-white/10 shrink-0">
                                    <Image
                                      src={item.icon}
                                      width={24}
                                      height={24}
                                      alt={item.name}
                                    />
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-100 truncate">
                                      {item.name}
                                    </p>

                                    <p className="text-[11px] text-gray-400 truncate">
                                      {item.description}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {/* LOGO */}
            {IconArray ? (
              <div className="group flex items-center gap-3 transition">
                <div className="">
                  <h2
                    className={`${business ? "text-sm font-semibold" : "text-sm font-bold"} tracking-tight text-zinc-900`}
                  >
                    {business ? page.toUpperCase() : "B.A.D.E"}
                  </h2>

                  <Badge
                    variant="secondary"
                    className="rounded-xl text-xs text-zinc-500"
                  >
                    {business
                      ? `${business?.subscriptionplan.toLowerCase()} plan`
                      : "Enterprise Platform"}
                  </Badge>
                </div>
              </div>
            ) : (
              <Link
                href={href}
                className="group flex items-center gap-3 transition"
              >
                {business && (
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md transition-all duration-300 group-hover:scale-105">
                    <Squares2X2Icon className="h-5 w-5" />
                  </div>
                )}

                <div className="">
                  <h2
                    className={`${business ? "text-sm font-semibold" : "text-sm font-bold"} tracking-tight text-zinc-900`}
                  >
                    {business ? page.toUpperCase() : "B.A.D.E"}
                  </h2>

                  <Badge
                    variant="secondary"
                    className="rounded-xl text-xs text-zinc-500"
                  >
                    {business
                      ? `${business?.subscriptionplan.toLowerCase()} plan`
                      : "Enterprise Platform"}
                  </Badge>
                </div>
              </Link>
            )}
          </div>

          {/* CENTER SEARCH */}
          {business && user && Module?.length > 0 && (
            <form
              onSubmit={handleSearch}
              className="hidden lg:flex flex-1 items-center mx-8 max-w-md"
            >
              <div className="relative w-full mr-1">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />

                <Input
                  type="search"
                  placeholder={`Search ${page}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button type="submit" size="sm" variant="default">
                Search
              </Button>
            </form>
          )}

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            {/* PUBLIC LINKS */}
            {!business || !user ? (
              <>
                <div className="hidden md:flex items-center gap-6">
                  <Link
                    href="/why-bade"
                    className={`text-sm font-medium transition hover:text-blue-600 ${
                      pathName === "/why-bade"
                        ? "text-blue-600"
                        : "text-zinc-700"
                    }`}
                  >
                    Why Bade?
                  </Link>

                  <Link
                    href="/Pricing"
                    className={`text-sm font-medium transition hover:text-blue-600 ${
                      pathName === "/Pricing"
                        ? "text-blue-600"
                        : "text-zinc-700"
                    }`}
                  >
                    Pricing
                  </Link>

                  <Link
                    href="/Marketers"
                    className={`text-sm font-medium transition hover:text-blue-600 ${
                      pathName === "/Marketers"
                        ? "text-blue-600"
                        : "text-zinc-700"
                    }`}
                  >
                    Refer & Earn
                  </Link>
                </div>

                {!business && !user && (
                  <Button asChild className="shadow-md" variant="default">
                    <Link
                      href={`${pathName === "/Login" ? "/Pricing" : "/Login"}`}
                    >
                      {pathName === "/Login" ? "Signup →" : "Login →"}
                    </Link>
                  </Button>
                )}
              </>
            ) : (
              <>
                {/* TIME + LOCATION */}
                <div className="hidden xl:flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-xl px-3 py-1">
                    🕒 {time}
                  </Badge>

                  <Badge variant="secondary" className="rounded-xl px-3 py-1">
                    📍 {location}
                  </Badge>
                </div>

                {/* USER MENU */}
                <Popover open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" className="h-auto rounded-full p-0">
                      <Image
                        src={user?.image || "/person.png"}
                        className="drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)] border-2 rounded-full object-cover"
                        priority
                        quality={100}
                        width={30}
                        height={30}
                        alt="user image"
                      />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-80 rounded-3xl border-0 bg-white/95 p-0 shadow-2xl backdrop-blur-xl">
                    <div className="overflow-hidden rounded-3xl">
                      {/* TOP */}
                      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 p-5 text-white">
                        <div className="flex items-center gap-4">
                          <Image
                            src={business.companyLogo || "/person.png"}
                            width={52}
                            height={52}
                            alt="user"
                            priority
                            className="rounded-2xl border border-white/10 object-cover"
                          />

                          <div>
                            <h3 className="font-semibold text-xs">
                              {business.companyName}
                            </h3>

                            <p className="text-xs text-zinc-300">
                              {user?.Email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* BODY */}
                      <div className="space-y-2 p-4 ">
                        {user.toogledTenants?.length > 0 && (
                          <div
                            className="rounded-2xl border p-2 h-50 overflow-y-scroll"
                            style={{
                              scrollbarWidth: "thin",
                              scrollbarColor: "#453d46ff transparent",
                            }}
                          >
                            <p className="mb-2 px-2 text-xs font-medium text-zinc-500">
                              Switch Business
                            </p>

                            {user.toogledTenants
                              .filter(
                                (tenant) =>
                                  tenant.tenantIds?.tenantId.toString() !==
                                  user.tenantId.toString(),
                              )
                              .map((tenant, index) => (
                                <button
                                  key={tenant.tenantIds?._id || index}
                                  onClick={() =>
                                    handleTenantSwitch(
                                      Encrypt(tenant.tenantIds?._id),
                                    )
                                  }
                                  className="flex w-full items-center rounded-xl px-3 py-2 text-left text-xs transition hover:bg-zinc-100"
                                >
                                  <PowerIcon className="mr-2 h-4 w-4 text-blue-600" />
                                  Switch to {tenant.tenantIds?.companyName}
                                </button>
                              ))}
                          </div>
                        )}

                        {user?.isAdmin && (
                          <>
                            <Link
                              href={`/${sanitizedCompanyName}/account/${Encrypt(
                                business._id,
                              )}`}
                              className="flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition hover:bg-zinc-100"
                            >
                              ⚙️ Account settings
                            </Link>

                            {/* app store on mobile screen */}
                            {business.subscriptionplan === "Standard" && (
                              <Link
                                href={`/auth/Apps`}
                                className="flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition bg-black  hover:bg-zinc-400 md:hidden"
                              >
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                                  <Image
                                    src="https://img.icons8.com/avantgarde/100/apple-app-store.png"
                                    width={22}
                                    height={22}
                                    priority
                                    quality={100}
                                    alt="App Store"
                                  />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-white">
                                    App Store
                                  </p>

                                  <p className="text-[11px] text-blue-200">
                                    Install more modules
                                  </p>
                                </div>
                              </Link>
                            )}
                          </>
                        )}

                        {user?.Notification?.length > 0 && (
                          <UserNotification user={user} />
                        )}

                        <div className="pt-2">
                          <Logout />
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            )}
          </div>
        </nav>
      </header>
    </>
  );
}
