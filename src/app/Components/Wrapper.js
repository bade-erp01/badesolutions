"use client";

import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  LogOut,
  Settings,
  Bell,
  Sparkles
} from "lucide-react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRouter, usePathname, useParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import ThemeToggle from "@/components/theme-toggle.jsx";
import { useUser } from "@/components/UserProvider";
import CookiesPolicyAlert from "@/app/Components/Cookies";
import PrivacyIdleOverlay from "@/app/Components/PrivacyOverlay";
import ParticleBackground from "@/app/Components/Particles";
import TermsAndConditionsLink from "@/app/Components/TermsAndCondition";
import BackButton from "@/app/Components/BackBotton";
import Swal from "sweetalert2";
import { plsWait, SuccessToast, ErrorMessage } from "../../../Functions/Mics";
import { Encrypt, EXPRESS_PRIVATE_URL } from "../../../Functions/Functions";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../../lib/User";

// Normalize ids (ObjectId / string)
const toId = (v) =>
  v && typeof v === "object" ? String(v) : v != null ? String(v) : "";

export default function Wrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useUser();
  const Params = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const page = Params.Module;
  const dispatch = useDispatch();

  // Active tenants from toogledTenants
  const activeTenants = useMemo(() => {
    return (
      user?.user?.toogledTenants?.filter(
        (tenant) => tenant?.tenantIds?.isActive
      ) ?? []
    );
  }, [user?.user?.toogledTenants]);

  const navApps = useMemo(() => {
    if (user?.business?.subscriptionplan?.trim() === "Basic") {
      return [
        { Name: "CRM", url: "crm" },
        { Name: "Product Management", url: "product" },
        { Name: "Cash Register", url: "payment" },
        { Name: "Stores Operations", url: "store" },
      ];
    }
    return (
      user?.user?.Apps?.filter((app) => app.url !== "employee").sort((a, b) =>
        a.Name.localeCompare(b.Name),
      ) ?? []
    );
  }, [user?.business?.subscriptionplan, user?.user?.Apps]);

  // Selected value must come from the toogledTenants array
  const selectedTenantId = useMemo(() => {
    const currentBusinessId = toId(
      user?.business?.tenantId ?? user?.business?._id
    );

    const match = activeTenants.find(
      (tenant) => toId(tenant?.tenantIds?._id) === currentBusinessId
    );

    return match ? toId(match.tenantIds._id) : undefined;
  }, [activeTenants, user?.business?.tenantId, user?.business?._id]);

  // Driver.js Tour
  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      animate: true,
      nextBtnText: "Next →",
      prevBtnText: "← Prev",
      doneBtnText: "Finish Tour",
      allowClose: true,
      overlayClickBehavior: "close",
      onDestroyed: () => {
        localStorage.setItem("hasSeenTour", "true");
      },
    });

    driverObj.setSteps([
      {
        element: ".sidebar-logo",
        popover: {
          title: `How'dy ${user.user.firstName}, Welcome to Bade`,
          description:
            "I’m Kamsi, your personal tour assistant. You’re exploring Bade ERP, version 4.1 — let’s make this journey effortless and exciting.",
          side: "right",
        },
      },
      {
        element: "nav",
        popover: {
          title: "Business Modules",
          description: "Access all your apps and modules from here.",
          side: "right",
        },
      },
      {
        element: ".tenant-switch",
        popover: {
          title: "Switch Tenants",
          description: "Manage and switch between different companies.",
          side: "bottom",
        },
      },
      {
        element: ".search-form",
        popover: {
          title: "Smart Search",
          description: "Search across the current module instantly.",
          side: "bottom",
        },
      },
      {
        element: ".theme-toggle",
        popover: {
          title: "Theme Toggle",
          description: "Switch between light and dark mode.",
          side: "left",
        },
      },
      {
        element: ".view",
        popover: {
          title: "Display",
          description:
            "All content will be displayed right here at this target.",
          side: "top",
        },
      },
      {
        element: ".user-profile",
        popover: {
          title: "Profile & Settings",
          description:
            "Access your Notifications, Read T&C of use, settings, and logout.",
          side: "top",
        },
      },
    ]);

    driverObj.drive();
  };

  // Auto start tour for first time users
  useEffect(() => {
    const hasSeenTour = localStorage.getItem("hasSeenTour");
    if (!hasSeenTour && user?.user && pathname?.includes("/V4")) {
      const timer = setTimeout(() => {
        startTour();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, pathname]);

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmedTerm = searchTerm.trim();

    if (!trimmedTerm) {
      ErrorMessage("Please enter a search word");
      return;
    }
    router.push(
      `/${Params.auth}/V4/Search/${encodeURIComponent(page)}?search=${trimmedTerm}`,
    );
    setSearchTerm("");
  };

  const handleTenantSwitch = async (tenantId) => {
    if (!tenantId || toId(tenantId) === toId(user?.business?.tenantId)) return;

    const isDark = document.documentElement.classList.contains("dark");

    const result = await Swal.fire({
      title: "Switch Tenant?",
      html: `
      <div class="py-4">
        <p class="text-lg text-slate-600 dark:text-slate-400">
          Are you sure you want to switch to this tenant?
        </p>
        <p class="text-sm text-slate-500 dark:text-slate-500 mt-3">
          You will be logged into the new tenant's workspace.
        </p>
      </div>
    `,
      imageUrl: user?.business?.companyLogo || "",
      imageWidth: 80,
      imageHeight: 80,
      imageAlt: "Company Logo",
      showCancelButton: true,
      confirmButtonText: "Yes, Switch Tenant",
      cancelButtonText: "Cancel",
      confirmButtonColor: isDark ? "#18181b" : "#0f172a",
      cancelButtonColor: "#ef4444",
      width: "440px",
      padding: "2rem",
      background: isDark ? "#0f172a" : "#ffffff",
      color: isDark ? "#e2e8f0" : "#0f172a",
      customClass: {
        popup: `rounded-3xl shadow-2xl border ${isDark ? "border-slate-700" : "border-slate-200"}`,
        title: `text-2xl font-semibold ${isDark ? "text-white" : "text-slate-900"}`,
        htmlContainer: "text-center",
        confirmButton: "rounded-xl font-medium px-8 py-2.5 text-base",
        cancelButton: "rounded-xl font-medium px-8 py-2.5 text-base",
        image: "mx-auto rounded-2xl object-contain",
      },
      reverseButtons: true,
      allowOutsideClick: true,
      allowEscapeKey: true,
    });

    if (result.isConfirmed) {
      plsWait("Please wait while we switch your tenant...");

      try {
        const response = await fetch(
          `${EXPRESS_PRIVATE_URL}/api/switch-tenant/${Encrypt(user.user._id)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Encrypt(user.business.tenantId)}`,
              access: `${Encrypt(user.user._id)}`,
              sessionKey: `Bearer ${Encrypt(user.user.SessionId)}`,
            },
            body: JSON.stringify({ tenantId: Encrypt(tenantId) }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to switch tenant.");
        }

        SuccessToast("Tenant switched successfully.");
        await dispatch(logoutAction());
        router.refresh();
      } catch (error) {
        ErrorMessage("An error occurred while switching tenant.");
      }
    }
  };

  return (
    <div className="flex h-dvh bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 shrink-0 border-r bg-card flex-col">
        {/* Logo */}
        <div className="p-5 border-b sidebar-logo">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shadow-sm">
              <AvatarImage
                src="/bade.jpg"
                alt="Company Logo"
                className="object-contain p-0.5"
              />
            </Avatar>
            <div>
              <div className="font-semibold">Bade</div>
              <Badge
                variant="secondary"
                className="text-xs text-muted-foreground"
              >
                Business Manager .v4.1
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {user.business && user.user && pathname !== `/${Params.auth}/V4` && (
            <BackButton />
          )}

          {navApps.map((item) => {
            const isActive =
              pathname === `/${Params.auth}/V4/${item.url}/${item.url}`;

            return (
              <Button
                key={item._id || item.url}
                disabled={isActive}
                variant={isActive ? "destructive" : "ghost"}
                className="w-full justify-start cursor-pointer"
                onClick={() =>
                  router.push(`/${Params.auth}/V4/${item.url}/${item.url}`)
                }
              >
                {item.Name}
              </Button>
            );
          })}

          {pathname !== `/${Params.auth}/V4` && (
            <Button
              variant={
                pathname === `/${Params.auth}/V4` ? "destructive" : "ghost"
              }
              className="w-full justify-start cursor-pointer"
              onClick={() => router.push(`/${Params.auth}/V4/`)}
            >
              Business Overview
            </Button>
          )}

          {user.user.isDev && (
            <Button
              variant={pathname === `/${Params.auth}/V4/Assistant` ? "destructive" : "ghost"}
              disabled={pathname === `/${Params.auth}/V4/Assistant`}
              className="w-full justify-start cursor-pointer"
              onClick={() => router.push(`/${Params.auth}/V4/Assistant`)}
            >
              Try Kamsi Ai <Sparkles className="h-5 w-5 shrink-0" />
            </Button>
          )}
        </nav>

        <div className="p-1 border-t w-full user-profile">
          <UserProfile user={user.user} biz={user.business} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* ========== TOP HEADER ========== */}
        <div className="border-b bg-card px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* ===== LEFT ZONE ===== */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Mobile Menu */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden shrink-0"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>

                <SheetContent side="left" className="w-72 p-0 gap-0 overflow-hidden">
                  <SheetHeader className="p-5 border-b">
                    <SheetTitle className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 shadow-sm">
                        <AvatarImage
                          src="/bade.jpg"
                          alt="Company Logo"
                          className="object-contain p-0.5"
                        />
                      </Avatar>
                      <div>
                        <div className="font-semibold">Bade</div>
                        <Badge
                          variant="secondary"
                          className="text-xs text-muted-foreground"
                        >
                          Business Manager .v4.1
                        </Badge>
                      </div>
                    </SheetTitle>
                  </SheetHeader>

                  <nav className="flex-1 p-4 space-y-1 overflow-auto">
                    {user.business &&
                      user.user &&
                      pathname !== `/${Params.auth}/V4` && <BackButton />}

                    {navApps.map((item) => {
                        const isActive =
                          pathname ===
                          `/${Params.auth}/V4/${item.url}/${item.url}`;
                        return (
                          <Button
                            key={item._id || item.url}
                            disabled={isActive}
                            variant={isActive ? "destructive" : "ghost"}
                            className="w-full justify-start cursor-pointer"
                            onClick={() =>
                              router.push(
                                `/${Params.auth}/V4/${item.url}/${item.url}`,
                              )
                            }
                          >
                            {item.Name}
                          </Button>
                        );
                      })}

                    {pathname !== `/${Params.auth}/V4` && (
                      <Button
                        variant={
                          pathname === `/${Params.auth}/V4`
                            ? "destructive"
                            : "ghost"
                        }
                        className="w-full justify-start cursor-pointer"
                        onClick={() => router.push(`/${Params.auth}/V4/`)}
                      >
                        Business Overview
                      </Button>
                    )}
                    <Button
                      variant={pathname === `/${Params.auth}/V4/Assistant` ? "destructive" : "ghost"}
                      disabled={pathname === `/${Params.auth}/V4/Assistant`}
                      className="w-full justify-start cursor-pointer"
                      onClick={() => router.push(`/${Params.auth}/V4/Assistant`)}
                    >
                      Invoice Assistant
                    </Button>
                  </nav>

                  {/* Tenant Switch - Mobile */}
                  {activeTenants.length > 0 && (
                    <div className="p-4 border-t">
                      <div className="tenant-switch space-y-1.5">
                        <div className="text-sm text-muted-foreground">
                          Switch Tenants
                        </div>
                        <Select
                          value={selectedTenantId}
                          onValueChange={handleTenantSwitch}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select tenant..." />
                          </SelectTrigger>
                          <SelectContent>
                            {activeTenants.map((tenant) => (
                              <SelectItem
                                key={toId(tenant?.tenantIds?._id)}
                                value={toId(tenant?.tenantIds?._id)}
                              >
                                {tenant?.tenantIds?.companyName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )}

                  <div className="p-1 border-t w-full user-profile">
                    <UserProfile user={user.user} biz={user.business} />
                  </div>
                </SheetContent>
              </Sheet>

              {/* Tenant Switch - Desktop */}
              {activeTenants.length > 0 && (
                <div className="hidden lg:flex items-center">
                  <div className="tenant-switch space-y-0.5">
                    <div className="text-xs text-muted-foreground">
                      Switch Tenants
                    </div>
                    <Select
                      value={selectedTenantId}
                      onValueChange={handleTenantSwitch}
                    >
                      <SelectTrigger className="w-44 h-9">
                        <SelectValue placeholder="Select tenant..." />
                      </SelectTrigger>
                      <SelectContent>
                        {activeTenants.map((tenant) => (
                          <SelectItem
                            key={toId(tenant?.tenantIds?._id)}
                            value={toId(tenant?.tenantIds?._id)}
                          >
                            {tenant?.tenantIds?.companyName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            {/* ===== CENTER ZONE (Search) ===== */}
            <div className="flex-1 flex justify-center min-w-0">
              {user.business &&
                user.user &&
                pathname !== `/${Params.auth}/V4` &&
                !pathname.includes("Search") &&
                !pathname.includes("Assistant") &&
                !pathname.includes("store") &&
                !pathname.includes("purchases") &&
                !pathname.includes("product-transfer") &&
                !pathname.includes("Forms") &&
                !pathname.includes("inventory") &&
                !pathname.includes("pos") &&
                pathname !== `/${Params.auth}/V4/Settings` &&
                Params.Module !== `accounting` && (
                  <form
                    onSubmit={handleSearch}
                    className="flex items-center gap-2 w-full max-w-md search-form"
                  >
                    <div className="relative flex-1">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="search"
                        placeholder={`Search ${page || "module"}...`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 h-9"
                      />
                    </div>
                    <Button type="submit" size="sm" className="h-9 shrink-0 hidden sm:inline-flex">
                      Search
                    </Button>
                  </form>
                )}
            </div>

            {/* ===== RIGHT ZONE ===== */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <div className="theme-toggle">
                <ThemeToggle />
              </div>

              <div className="hidden lg:flex items-center gap-3">
                <LastUpdated />

                <Button
                  variant="outline"
                  size="sm"
                  onClick={startTour}
                  className="text-xs h-8"
                >
                  Take a Tour
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main View */}
        <div className="flex-1 min-w-0 overflow-auto p-3 sm:p-4 lg:p-6 space-y-6 sm:space-y-8 view">
          <PrivacyIdleOverlay
            idleTimeMs={300000}
            userData={user}
            SessionId={user.SessionId}
            requirePin={false}
          >
            <CookiesPolicyAlert />
            <ParticleBackground />
            {children}
          </PrivacyIdleOverlay>
        </div>
      </div>
    </div>
  );
}

// ==================== OTHER COMPONENTS ====================

export const LastUpdated = () => {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setCurrentTime(`${formattedDate} • ${formattedTime}`);
    };

    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-3 text-sm text-muted-foreground">
      <Separator orientation="vertical" className="h-4" />
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span className="font-medium text-foreground whitespace-nowrap">
          {currentTime}
        </span>
      </div>
    </div>
  );
};

export function UserProfile({ user, biz }) {
  const router = useRouter();
  const Path = useParams();
  const dispatch = useDispatch();

  const logout = async () => {
    try {
      await dispatch(logoutAction());
      SuccessToast("You have been logged out successfully.");
      router.push("/Login");
    } catch (e) {
      ErrorMessage("Logout failed. Please try again.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-auto p-1 w-full rounded-2xl hover:bg-muted"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11">
              <AvatarImage src={biz.companyLogo || user.image} alt="User" />
              <AvatarFallback>
                {user.firstName.charAt(0).toUpperCase()}{" "}
                {user.lastName.trim().charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="hidden md:flex flex-col items-start">
              <span className="text-xs text-muted-foreground">
                {biz.subscriptionplan} Plan
              </span>
              <span className="font-medium text-sm truncate max-w-[140px] block">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-72 sm:w-80 max-w-[calc(100vw-1rem)] rounded-sm" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-semibold truncate">{user.Email}</span>
            <span className="text-xs text-muted-foreground">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Bell className="mr-2 h-4 w-4" />
          {user.Notification?.length ?? 0} Notification
        </DropdownMenuItem>

        {user.isAdmin && (
          <DropdownMenuItem
            onClick={() => router.push(`/${Path.auth}/V4/Settings`)}
          >
            <Settings className="mr-2 h-4 w-4" /> Settings
          </DropdownMenuItem>
        )}

        <DropdownMenuItem>
          <TermsAndConditionsLink
            BusinessPlan={user?.business?.subscriptionplan}
          />
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}