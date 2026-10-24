"use client";

import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";
import "animate.css";
import {
  Squares2X2Icon,
  PowerIcon,
  Bars3Icon,
} from "@heroicons/react/24/outline";
import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { plsWait, SuccessToast, ErrorMessage } from "../../../Functions/Mics";
import { useRouter } from "next/navigation";
import moment from "moment";
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
  SheetClose,
} from "@/components/ui/sheet";

export default function Nav1({ page, user, business, IconArray }) {
  const pathName = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const [hydrated, setHydrated] = useState(false);

  const [time, setTime] = useState("");

  const [location, setLocation] = useState("Loading location...");

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  if (!hydrated) {
    return (
      <div className="p-4 space-y-4 animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-80 max-w-full"></div>
      </div>
    );
  }

  const sanitizedCompanyName = business?.companyName
    ?.toLowerCase()
    ?.replace(/\s+/g, "-")
    ?.replace(/[^a-z0-9-]/g, "");

  const getDashboardHref = (business, user, sanitizedCompanyName) => {
    if (!business || !user) return "/";

    // Check if the user is a sales rep
    if (user.isSalesRep) {
      return `/SalesPortal/Dashboard`;
    }

    // Default dashboard for other users
    return `/${sanitizedCompanyName}/V4`;
  };

  const href = getDashboardHref(business, user, sanitizedCompanyName);

  const publicLinks = [
    { href: "/why-bade", label: "Why Bade?" },
    { href: "/Pricing", label: "Pricing" },
    { href: "/Careers", label: "Careers" },
    { href: "/About_Us", label: "About Us" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-1 py-1 text-xs">
        <nav className="flex w-full items-center justify-between border bg-white/75 border-white/20 px-3 sm:px-4 py-2.5 sm:py-3 shadow-xl backdrop-blur-2xl">
          {/* LEFT */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* LOGO */}
            {IconArray ? (
              <div className="group flex items-center gap-2 sm:gap-3 transition min-w-0">
                <div className="min-w-0">
                  <h2
                    className={`${
                      business ? "text-sm font-semibold" : "text-sm font-bold"
                    } tracking-tight truncate`}
                  >
                    {business ? page.toUpperCase() : "B.A.D.E"}
                  </h2>

                  <Badge variant="secondary" className="rounded-xl text-[10px] sm:text-xs">
                    {business
                      ? `${business?.subscriptionplan.toLowerCase()} plan`
                      : "Business Manager"}
                  </Badge>
                </div>
              </div>
            ) : (
              <Link
                href={href}
                className="group flex items-center gap-2 sm:gap-3 transition min-w-0"
              >
                {business && (
                  <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 text-white shadow-md transition-all duration-300 group-hover:scale-105">
                    <Squares2X2Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                )}

                <div className="min-w-0">
                  <h2
                    className={`${
                      business ? "text-sm font-semibold" : "text-sm font-bold"
                    } tracking-tight text-zinc-900 truncate`}
                  >
                    {business ? page.toUpperCase() : "B.A.D.E"}
                  </h2>

                  <Badge
                    variant="secondary"
                    className="text-[10px] sm:text-xs text-muted-foreground"
                  >
                    {business
                      ? `${business?.subscriptionplan.toLowerCase()} plan`
                      : "Business Manager .v4.1"}
                  </Badge>
                </div>
              </Link>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* PUBLIC LINKS - Desktop */}
            {!business || !user ? (
              <>
                <div className="hidden md:flex items-center gap-4 lg:gap-6">
                  {publicLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`text-sm font-medium transition hover:text-blue-600 ${
                        pathName === link.href
                          ? "text-blue-600"
                          : "text-zinc-700"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Login / Signup - Desktop */}
                {!business && !user && (
                  <Button
                    asChild
                    className="hidden md:inline-flex shadow-md"
                    variant="default"
                  >
                    <Link
                      href={pathName === "/Login" ? "/Pricing" : "/Login"}
                    >
                      {pathName === "/Login" ? "Signup →" : "Login →"}
                    </Link>
                  </Button>
                )}

                {/* Mobile Sheet Menu (Public) */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden h-9 w-9 rounded-full"
                      aria-label="Open menu"
                    >
                      <Bars3Icon className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent
                    side="right"
                    className="w-[85vw] max-w-sm rounded-l-3xl border-0 bg-white/95 p-0 shadow-2xl backdrop-blur-xl"
                  >
                    <SheetHeader className="border-b bg-linear-to-br from-zinc-900 to-zinc-800 p-5 text-left text-white">
                      <SheetTitle className="text-white text-base font-semibold">
                        B.A.D.E
                      </SheetTitle>
                      <Badge
                        variant="secondary"
                        className="text-[10px] sm:text-xs text-muted-foreground">
                        Business Manager .v4.1
                      </Badge>
                    </SheetHeader>

                    <div className="flex flex-col gap-1 p-4">
                      {publicLinks.map((link) => (
                        <SheetClose asChild key={link.href}>
                          <Link
                            href={link.href}
                            className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                              pathName === link.href
                                ? "bg-zinc-100 text-blue-600"
                                : "text-zinc-800 hover:bg-zinc-50"
                            }`}
                          >
                            {link.label}
                          </Link>
                        </SheetClose>
                      ))}

                      {!business && !user && (
                        <div className="mt-4 pt-4 border-t">
                          <SheetClose asChild>
                            <Button asChild className="w-full shadow-md" size="lg">
                              <Link
                                href={
                                  pathName === "/Login" ? "/Pricing" : "/Login"
                                }
                              >
                                {pathName === "/Login"
                                  ? "Signup →"
                                  : "Login →"}
                              </Link>
                            </Button>
                          </SheetClose>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <>
                {/* TIME + LOCATION - Desktop only */}
                <div className="hidden xl:flex items-center gap-2">
                  <Badge variant="secondary" className="rounded-xl px-3 py-1">
                    🕒 {time}
                  </Badge>

                  <Badge variant="secondary" className="rounded-xl px-3 py-1">
                    📍 {location}
                  </Badge>
                </div>

                {/* USER MENU (Popover) - always visible when logged in */}
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

                  <PopoverContent className="w-80 max-w-[calc(100vw-1rem)] rounded-3xl border-0 p-0 shadow-2xl backdrop-blur-xl">
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

                          <div className="min-w-0">
                            <h3 className="font-semibold text-xs truncate">
                              {business.companyName}
                            </h3>

                            <p className="text-xs text-zinc-300 truncate">
                              {user?.Email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* BODY */}
                      <div className="space-y-2 p-4">
                        {/* Mobile-only time + location inside popover */}
                        <div className="xl:hidden flex flex-wrap gap-2 mb-2">
                          <Badge variant="secondary" className="rounded-xl px-3 py-1 text-xs">
                            🕒 {time}
                          </Badge>
                          <Badge variant="secondary" className="rounded-xl px-3 py-1 text-xs">
                            📍 {location}
                          </Badge>
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