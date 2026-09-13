"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import {
  LayoutDashboard,
  Package,
  FileBarChart2,
  Users,
  Map,
  ClipboardList,
  Warehouse,
  UserPlus,
  Menu,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import Nav2 from "@/app/Components/Nav2";
import Logout from "@/app/Components/Logout";
import UserNotification from "@/app/Components/UserNotification";
import { Encrypt, EXPRESS_PRIVATE_URL } from "../../../Functions/Functions";
import { plsWait, SuccessToast, ErrorMessage } from "../../../Functions/Mics";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card as ShadCard, CardContent } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NavWrapper({ userData, data, navtitle }) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const Data = data || [];
  let filteredData = [];

  if (navtitle === "Requisitions") {
    filteredData = Data.filter(
      (item) =>
        item?.billStatus?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.billReferenceNo?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  } else if (navtitle === "Reports") {
    filteredData = Data.filter(
      (item) =>
        item?.Ref?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.status?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  } else {
    filteredData = Data.filter(
      (item) =>
        item?.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item?.Username?.toLowerCase().includes(searchTerm.toLowerCase()),
    ).sort((a, b) => a.Name?.trim().localeCompare(b.Name?.trim()));
  }

  const handleTenantSwitch = async (tenantId) => {
    if (!tenantId || tenantId === userData?.business?.tenantId) return;

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
      imageUrl: userData?.business?.companyLogo || "",
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
          `${EXPRESS_PRIVATE_URL}/api/switch-tenant/${Encrypt(userData.user._id)}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
              access: `${Encrypt(userData.user._id)}`,
              sessionKey: `Bearer ${Encrypt(userData.user.SessionId)}`,
            },
            body: JSON.stringify({ tenantId: Encrypt(tenantId) }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to switch tenant.");
        }

        SuccessToast("Tenant switched successfully.");
        router.refresh();
      } catch (error) {
        ErrorMessage("An error occurred while switching tenant.");
      }
    }
  };

  const navItems = [
    {
      href: "/SalesPortal/Dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      show: userData?.user?.c_levelDash,
      active: navtitle === "Dashboard",
    },
    {
      href: "/SalesPortal/Products",
      label: "Products",
      icon: Package,
      show: true,
      active: navtitle === "Products",
    },
    {
      href: "/SalesPortal/Reports",
      label: "Product Report",
      icon: FileBarChart2,
      show: true,
      active: navtitle === "Reports",
    },
    {
      href: "/SalesPortal/Customers",
      label: "My customers",
      icon: Users,
      show: true,
      active: navtitle === "Customers",
    },
    {
      href: "/SalesPortal/Route",
      label: "My Route",
      icon: Map,
      show: true,
      active: navtitle === "Route",
    },
    {
      href: "/SalesPortal/Requisitions",
      label: "Requisitions",
      icon: ClipboardList,
      show: true,
      active: navtitle === "Requisitions",
    },
    {
      href: "/SalesPortal/Inventory",
      label: "Inventory",
      icon: Warehouse,
      show: !!userData?.user?.workLocation,
      active: navtitle === "Inventory",
    },
  ];

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="px-1 pb-4">
        <h2 className="text-sm font-semibold text-white/90 tracking-tight">
          Menu
        </h2>
      </div>

      <Separator className="bg-white/10 mb-4" />

      <ScrollArea className="flex-1 pr-2">
        <nav className="space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  item.active
                    ? "bg-white/15 text-white font-medium"
                    : "text-white/80 hover:bg-white/10 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            ))}

          {navtitle === "Customers" && (
            <div className="pt-2">
              <DialogDemo userData={userData} />
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Tenant Switch - Mobile only */}
      {userData?.user?.toogledTenants?.filter(
        (tenant) => tenant?.tenantIds?.isActive,
      )?.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <div className="tenant-switch space-y-1.5">
            <div className="text-sm text-white/60">Switch Tenants</div>
            <Select
              value={userData?.business?.tenantId}
              onValueChange={handleTenantSwitch}
            >
              <SelectTrigger className="w-full bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="Select tenant..." />
              </SelectTrigger>
              <SelectContent>
                {userData?.user?.toogledTenants?.map((tenant) => (
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

      {/* User footer */}
      <div className="mt-auto pt-6 space-y-3">
        <div className="flex items-center gap-3 rounded-xl bg-white/10 px-3 py-2.5">
          <Avatar className="h-9 w-9 border border-white/20">
            <AvatarImage
              src={userData?.user?.image || "/person.png"}
              alt="User"
            />
            <AvatarFallback className="bg-white/20 text-white text-xs">
              {userData?.user?.firstName?.[0]}
              {userData?.user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {userData?.user?.firstName} {userData?.user?.lastName}
            </p>
            <p className="text-xs text-white/60">My Account</p>
          </div>
        </div>

        {userData?.Notification?.length > 0 && (
          <UserNotification user={userData} />
        )}

        <Logout />
      </div>
    </div>
  );

  return (
    <div className="relative flex min-h-[90dvh] flex-col">
      <Nav2
        navtitle={navtitle}
        onToggleSideNav={() => setOpen(true)}
        onSearchChange={setSearchTerm}
        userData={userData}
      />

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="w-72 border-r border-white/10 bg-zinc-950/95 p-0 text-white backdrop-blur-xl [&>button]:hidden"
        >
          <div className="flex items-center justify-between px-5 py-4">
            <SheetHeader className="p-0">
              <SheetTitle className="text-base font-semibold text-white">
                Navigation
              </SheetTitle>
            </SheetHeader>
            <SheetClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </SheetClose>
          </div>
          <Separator className="bg-white/10" />
          <div className="h-[calc(100vh-73px)] px-4 py-4">
            <SidebarContent />
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1">
        {filteredData.length > 0 ? (
          <section className="mx-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {filteredData.map((element) => (
                <Card key={element._id} data={element} module={navtitle} />
              ))}
            </div>
          </section>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-muted-foreground">Nothing to show.</p>
          </div>
        )}
      </main>
    </div>
  );
}

/* ───────────────────────── DialogDemo ───────────────────────── */

export function DialogDemo({ userData }) {
  const [formData, setFormData] = useState({
    salesPerson: userData.user._id,
    signUpVia: "sales-app",
  });
  const router = useRouter();

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const apiKey = "838e5f01c66d4d97a7334734fbd2e10a";
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&no_annotations=1`;
          const res = await fetch(url);
          const data = await res.json();

          if (data.results?.length > 0) {
            const comp = data.results[0].components;
            const address = [
              comp.house_number,
              comp.road,
              comp.suburb || comp.neighbourhood,
              comp.city || comp.town || comp.village,
              comp.state,
              comp.country,
            ]
              .filter(Boolean)
              .join(", ");

            setFormData((prev) => ({
              ...prev,
              billingAddress: address || data.results[0].formatted,
              latitude,
              longitude,
            }));
          } else {
            setFormData((prev) => ({ ...prev, latitude, longitude }));
          }
        } catch {
          setFormData((prev) => ({ ...prev, latitude, longitude }));
        }
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      plsWait("Submitting customer data...");
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Encrypt(userData.business.tenantId)}`,
          access: `${Encrypt(userData.user._id)}`,
          sessionkey: `Bearer ${userData.SessionId}`,
        },
      };

      const response = await axios.post(
        `${EXPRESS_PRIVATE_URL}/api/Sales/Register-customer`,
        formData,
        config,
      );

      SuccessToast(response.data?.message || "Customer created successfully!");
      setFormData({ salesPerson: userData.user._id, signUpVia: "sales-app" });
      router.push(`/SalesPortal/Customers/${response.data.newCustomer}`);
    } catch (error) {
      ErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to create customer. Please try again.",
      );
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full justify-start gap-2 rounded-lg" size="sm">
          <UserPlus className="h-4 w-4" />
          Add New Lead
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl overflow-hidden rounded-2xl p-0">
        {/* Header */}
        <div className="relative bg-zinc-950 px-6 py-6 text-white">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-3xl" />
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Register Lead
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-5 px-6 py-6">
            <div className="space-y-2">
              <Label htmlFor="Username">Business Name</Label>
              <Input
                required
                id="Username"
                name="Username"
                placeholder="ABC Enterprises Ltd."
                value={formData.Username || ""}
                onChange={handleChange}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="Email">Email Address</Label>
                <Input
                  id="Email"
                  name="Email"
                  type="email"
                  placeholder="company@example.com"
                  value={formData.Email || ""}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telephone</Label>
                <Input
                  required
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+234 801 234 5678"
                  value={formData.phone || ""}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ContactPerson">Contact Person</Label>
              <Input
                required
                id="ContactPerson"
                name="ContactPerson"
                placeholder="John Doe"
                value={formData.ContactPerson || ""}
                onChange={handleChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="billingAddress">Office Address</Label>
              <Textarea
                required
                id="billingAddress"
                name="billingAddress"
                placeholder="123 Main Street, Abuja..."
                value={formData.billingAddress || ""}
                onChange={handleChange}
                className="min-h-[80px] resize-none"
              />
            </div>
          </div>

          <DialogFooter className="border-t bg-muted/40 px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Lead</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ───────────────────────── Card ───────────────────────── */

export function Card({ data, module }) {
  const truncate = (str, length = 22) =>
    str && str.length > length ? str.substring(0, length) + "…" : str;

  const title =
    data.Name ||
    data.firstName ||
    data.WHName ||
    data.productName ||
    data.billReferenceNo ||
    data.Username ||
    data.CustomerCode ||
    data.paymentReferenceNo ||
    data.accountName ||
    data.Ref ||
    data.refNo ||
    `${data.billStatus}/${data.billReferenceNo}`;

  const subtitle =
    data.CustomerCode ||
    data.Email ||
    data.billStatus ||
    data.ADCcode ||
    data.ACDcode ||
    data.status ||
    `${data.currentQty ? `${data.currentQty} case` : ""}${
      data.pcs ? `, ${data.pcs} pcs` : ""
    }`;

  const imageSrc = data.image || data.Image || data.icon || "/preview.png";
  const linkHref = `/SalesPortal/${module}/${Encrypt(data._id)}`;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link href={linkHref} className="block h-full">
          <ShadCard className="h-full transition-all hover:shadow-md hover:-translate-y-0.5">
            <CardContent className="flex items-center gap-4 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border bg-muted">
                <Image
                  src={imageSrc}
                  alt={title || "item"}
                  fill
                  className="object-cover"
                  sizes="56px"
                  quality={90}
                />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <p className="truncate text-sm font-semibold leading-none">
                  {truncate(title)}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {truncate(subtitle, 28)}
                </p>
              </div>
            </CardContent>
          </ShadCard>
        </Link>
      </HoverCardTrigger>

      <HoverCardContent className="w-64" side="top">
        <div className="space-y-1.5">
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
