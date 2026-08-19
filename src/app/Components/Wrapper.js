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
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Plus,
  LogOut,
  Settings,
  User,
  Bell,
  PlusIcon,
  X,
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
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ThemeToggle from "@/components/theme-toggle.jsx";
import { useUser } from "@/components/UserProvider";
import CookiesPolicyAlert from "@/app/Components/Cookies";
import PrivacyIdleOverlay from "@/app/Components/PrivacyOverlay";
import ParticleBackground from "@/app/Components/Particles";
import TermsAndConditionsLink from "@/app/Components/TermsAndCondition";
import SideNavWrapper from "@/app/Components/sideNavWrapper";
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

export default function Wrapper({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [selectedForm, setSelectedForm] = useState("");
  const { user } = useUser();
  const Params = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const page = Params.Module;
  const dispatch = useDispatch();

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
    if (!tenantId || tenantId === user?.business?.tenantId) return;

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
      imageUrl: user?.business?.companyLogo || "", // Your company logo
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
        image: "mx-auto rounded-2xl object-contain", // Clean logo styling
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

        // delete user cookies
        SuccessToast("Tenant switched successfully.");
        await dispatch(logoutAction());
        router.refresh();
      } catch (error) {
        ErrorMessage("An error occurred while switching tenant.");
      }
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 border-r bg-card flex-col">
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

          {/* for basic plan */}
          {user.business?.subscriptionplan?.trim() === "Basic" &&
            [
              {
                name: "CRM",
                url: "crm",
                icon: "https://img.icons8.com/?size=80&id=6Dhx5KybHIh2&format=png",
                description: "Customer relationship management.",
              },
              {
                name: "Product Management",
                url: "product",
                icon: "https://img.icons8.com/?size=64&id=aR2Ar4o65ts7&format=png",
                description: "Centralized product operations.",
              },
              {
                name: "Cash Register",
                url: "payment",
                icon: "https://img.icons8.com/dusk/64/cash-register.png",
                description: "Process transactions and payments.",
              },
              {
                name: "Stores Operations",
                url: "store",
                icon: "https://img.icons8.com/arcade/64/garage-closed.png",
                description: "Warehouse and inventory management.",
              },
            ].map((item) => {
              const isActive =
                pathname === `/${Params.auth}/V4/${item.url}/${item.url}`;

              return (
                <Button
                  key={item.url}
                  disabled={isActive}
                  variant={isActive ? "destructive" : "ghost"}
                  className="w-full justify-start cursor-pointer"
                  onClick={() =>
                    router.push(`/${Params.auth}/V4/${item.url}/${item.url}`)
                  }
                >
                  {item.name}
                </Button>
              );
            })}

          {user.businessInfo?.subscriptionplan?.trim() !== "Basic" &&
            user.user?.Apps?.filter((app) => app.url !== "employee").sort((a, b) => a.Name.localeCompare(b.Name)).map(
              (item) => {
                const isActive =
                  pathname === `/${Params.auth}/V4/${item.url}/${item.url}`;

                return (
                  <Button
                    key={item._id}
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
              },
            )}

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
        </nav>

        <div className="p-1 border-t w-full user-profile">
          <UserProfile user={user.user} biz={user.business} />
        </div>
      </div>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden fixed top-4 left-4 z-50"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-72 p-0">
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

            {user.user?.Apps?.filter((app) => app.url !== "employee").sort((a, b) => a.Name.localeCompare(b.Name)).map(
              (item) => {
                const isActive =
                  pathname === `/${Params.auth}/V4/${item.url}/${item.url}`;
                return (
                  <Button
                    key={item._id}
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
              },
            )}

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
          </nav>

          {/* Tenant Switch - Visible ONLY on mobile */}
          {user?.user?.toogledTenants?.length > 0 && (
            <div className="flex lg:hidden items-center gap-4 m-3">
            <div className="tenant-switch">
              <div className="text-sm text-muted-foreground">
                Switch Tenants
              </div>
              <Select
                value={user?.business?.tenantId}
                onValueChange={handleTenantSwitch}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select tenant..." />
                </SelectTrigger>
                <SelectContent>
                  {user?.user?.toogledTenants?.map((tenant) => (
                    <SelectItem
                      key={tenant?.tenantIds?._id}
                      value={tenant?.tenantIds?._id}
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        
        <div className="border-b bg-card p-4 flex items-center justify-between">
          {user?.user?.toogledTenants?.length > 0 && (
          <div className="hidden lg:flex items-center gap-4">
            <div className="tenant-switch lg:ml-0 ml-12">
              <div className="text-sm text-muted-foreground">
                Switch Tenants
              </div>
              <Select
                value={user?.business?.tenantId}
                onValueChange={handleTenantSwitch}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select tenant..." />
                </SelectTrigger>
                <SelectContent>
                  {user?.user?.toogledTenants?.map((tenant) => (
                    <SelectItem
                      key={tenant?.tenantIds?._id}
                      value={tenant?.tenantIds?._id}
                    >
                      {tenant?.tenantIds?.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          )}

          {/* Search */}
          {user.business &&
            user.user &&
            pathname !== `/${Params.auth}/V4` &&
            !pathname.includes("Search") &&
            !pathname.includes("store") &&
            !pathname.includes("purchases") &&
            !pathname.includes("product-transfer") &&
            !pathname.includes("Forms") &&
            !pathname.includes("inventory") &&
            pathname !== `/${Params.auth}/V4/Settings` &&
            Params.Module !== `accounting` && (
              <form
                onSubmit={handleSearch}
                className="flex flex-1 items-center mx-8 max-w-md search-form"
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

          <div className="flex items-center gap-6 text-sm justify-between">
            <div className="theme-toggle">
              <ThemeToggle />
            </div>

            {/* Hidden on mobile */}
            <div className="hidden lg:flex gap-4">
              <LastUpdated />

              <Button
                variant="outline"
                size="sm"
                onClick={startTour}
                className="text-xs"
              >
                Take a Tour
              </Button>
            </div>
          </div>
        </div>
        

        {/* Main View */}
        <div className="flex-1 overflow-auto p-4 space-y-8 view">
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
    <div className="flex items-center gap-4 text-sm text-muted-foreground">
      <Separator orientation="vertical" className="h-4" />

      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4" />
        <span className="font-medium text-foreground">{currentTime}</span>
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

      <DropdownMenuContent className="w-80 rounded-sm" align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-semibold">{user.Email}</span>
            <span className="text-xs text-muted-foreground">
              {user.firstName} {user.lastName}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Bell className="mr-2 h-4 w-4" />
          {user.Notification.length} Notification
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
          variant="destructive"
        >
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
