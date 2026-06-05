"use client";
import { useState, useEffect } from "react";
import Nav2 from "@/app/Components/Nav2";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logout from "@/app/Components/Logout";
import UserNotification from "@/app/Components/UserNotification";
import {
  PresentationChartLineIcon,
  UserGroupIcon,
  MapIcon,
  CubeIcon,
  UserPlusIcon,
  BuildingStorefrontIcon,
  QueueListIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import "animate.css";
import { Encrypt, EXPRESS_PRIVATE_URL } from "../../../Functions/Functions";
import { useParams } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { plsWait, SuccessToast, ErrorMessage } from "../../../Functions/Mics";
import axios from "axios";

export default function NavWrapper({ userData, data, navtitle }) {
  const [isOpen, setIsOpen] = useState(false);
  const [Data] = useState(data || []);
  const [searchTerm, setSearchTerm] = useState("");

  const toggleSideNav = () => setIsOpen((prev) => !prev);

  let filteredData = [];

  // Filter logic
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
            {userData.user.c_levelDash && (
              <Link
                href={`/SalesPortal/Dashboard`}
                className={
                  "flex items-center gap-3 p-3 rounded-md hover:bg-gray-700 transition "
                }
              >
                <PresentationChartLineIcon class="h-6 w-6 text-gray-100" />
                <span className="text-xs">Dashboard</span>
              </Link>
            )}

            <Link
              href="/SalesPortal/Products"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Products" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <CubeIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Products</span>
            </Link>

            <Link
              href="/SalesPortal/Reports"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Reports" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <Square3Stack3DIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Product Report</span>
            </Link>

            <Link
              href="/SalesPortal/Customers"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Customers" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <UserGroupIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">My customers</span>
            </Link>

            {navtitle === "Customers" && (
              <DialogDemo
                userData={userData}
                EXPRESS_PRIVATE_URL={EXPRESS_PRIVATE_URL}
              />
            )}

            <Link
              href="/SalesPortal/Route"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Route" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <MapIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">My Route</span>
            </Link>

            <Link
              href="/SalesPortal/Requisitions"
              className={`flex items-center gap-3 p-3 rounded-md transition 
                ${navtitle === "Requisitions" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
            >
              <QueueListIcon className="h-6 w-6 text-gray-100" />
              <span className="text-xs">Requisitions</span>
            </Link>

            {userData.user.workLocation && (
              <Link
                href="/SalesPortal/Inventory"
                className={`flex items-center gap-3 p-3 rounded-md transition 
                            ${navtitle === "Inventory" ? "bg-gray-200/50" : "hover:bg-gray-700"}`}
              >
                <BuildingStorefrontIcon className="h-6 w-6 text-gray-100" />
                <span className="text-xs">Inventory</span>
              </Link>
            )}
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
            <br/>
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
                  module={navtitle}
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

export function DialogDemo({ userData }) {
  const [formData, setFormData] = useState({ salesPerson: userData.user._id });
  const router = useRouter();

  // Auto-populate billingAddress + capture lat/lon
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const apiKey = "838e5f01c66d4d97a7334734fbd2e10a"; // your OpenCage key
          const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&no_annotations=1`;

          const res = await fetch(url);
          const data = await res.json();

          if (data.results.length > 0) {
            const comp = data.results[0].components;

            // Build a robust address string
            const house = comp.house_number || "";
            const road = comp.road || "";
            const suburb = comp.suburb || comp.neighbourhood || "";
            const city = comp.city || comp.town || comp.village || "";
            const state = comp.state || "";
            const country = comp.country || "";

            const address = [house, road, suburb, city, state, country]
              .filter(Boolean)
              .join(", ");

            setFormData((prev) => ({
              ...prev,
              billingAddress: address || data.results[0].formatted,
              latitude,
              longitude,
            }));
          } else {
            // still capture lat/lon even if no address found
            setFormData((prev) => ({
              ...prev,
              latitude,
              longitude,
            }));
          }
        } catch (err) {
          // console.error("Error reverse geocoding:", err);
          // fallback: just store lat/lon
          setFormData((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));
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
        },
      };

      const response = await axios.post(
        `${process.env.EXPRESS_PRIVATE_URL}/api/Sales/Register-customer`,
        formData,
        config,
      );

      SuccessToast(response.data?.message || "Customer created successfully!");
      setFormData({});
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
        <Button
          variant="default"
          className="group h-11 rounded-2xl px-5 shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <UserPlusIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
          Add New Lead
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl overflow-hidden rounded-[2rem] border-0 p-0 shadow-2xl">
        {/* TOP HEADER */}
        <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-8 py-8 text-white">
          {/* glow */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          {/* background grid */}
          <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]" />

          <DialogHeader className="relative z-10 space-y-3 text-left">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10">
                <UserPlusIcon className="h-7 w-7 text-white" />
              </div>

              <div>
                <DialogTitle className="text-2xl font-semibold tracking-tight">
                  Register Customer Lead
                </DialogTitle>

                <DialogDescription className="mt-1 text-sm text-zinc-300 leading-relaxed">
                  Create a prospect profile to manage customer engagement,
                  follow-ups, and conversion opportunities in one place.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-6 px-8 py-8 bg-white">
            {/* BUSINESS NAME */}
            <div className="space-y-2">
              <Label
                htmlFor="name-1"
                className="text-sm font-medium text-zinc-800"
              >
                Business Name
              </Label>

              <Input
                required
                id="name-1"
                name="Username"
                type="text"
                placeholder="ABC Enterprises Ltd."
                onChange={handleChange}
                value={formData.Username || ""}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70 focus-visible:ring-1"
              />
            </div>

            {/* GRID */}
            <div className="grid gap-5 md:grid-cols-2">
              {/* EMAIL */}
              <div className="space-y-2">
                <Label
                  htmlFor="Email"
                  className="text-sm font-medium text-zinc-800"
                >
                  Email Address
                </Label>

                <Input
                  id="Email"
                  name="Email"
                  type="email"
                  placeholder="company@example.com"
                  onChange={handleChange}
                  value={formData.Email || ""}
                  className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70"
                />
              </div>

              {/* PHONE */}
              <div className="space-y-2">
                <Label
                  htmlFor="phone"
                  className="text-sm font-medium text-zinc-800"
                >
                  Telephone
                </Label>

                <Input
                  required
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+234 801 234 5678"
                  onChange={handleChange}
                  value={formData.phone || ""}
                  className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70"
                />
              </div>
            </div>

            {/* CONTACT PERSON */}
            <div className="space-y-2">
              <Label
                htmlFor="ContactPerson"
                className="text-sm font-medium text-zinc-800"
              >
                Contact Person
              </Label>

              <Input
                required
                id="ContactPerson"
                name="ContactPerson"
                placeholder="John Doe"
                onChange={handleChange}
                value={formData.ContactPerson || ""}
                className="h-12 rounded-2xl border-zinc-200 bg-zinc-50/70"
              />
            </div>

            {/* ADDRESS */}
            <div className="space-y-2">
              <Label
                htmlFor="billingAddress"
                className="text-sm font-medium text-zinc-800"
              >
                Office Address
              </Label>

              <Textarea
                required
                placeholder="123 Main Street, Abuja..."
                id="billingAddress"
                name="billingAddress"
                onChange={handleChange}
                value={formData.billingAddress || ""}
                className="min-h-[50px] rounded-2xl border-zinc-200 bg-zinc-50/70 resize-none"
              />
            </div>

          </div>

          {/* FOOTER */}
          <DialogFooter className="border-t bg-zinc-50 px-8 py-5">
            <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-2xl px-6"
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button type="submit" className="h-11 rounded-2xl px-6 shadow-md">
                Save Lead
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function Card({ data, module }) {
  const { auth, Tenant } = useParams();

  const truncate = (str, length = 20) =>
    str && str.length > length ? str.substring(0, length) + "..." : str;

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
    `${data.currentQty ? `${data.currentQty} :case,` : ""}${data.pcs ? `${data.pcs}:pcs` : ""}`;

  const imageSrc = data.image || data.Image || data.icon || "/preview.png";
  const linkHref = `/SalesPortal/${module}/${Encrypt(data._id)}`;

  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={linkHref}
          className="block w-full h-full text-xs"
          style={{ textDecoration: "none" }}
        >
          <div className="flex flex-row items-center gap-4 bg-white border border-gray-200 rounded-md shadow-sm px-4 py-3 hover:shadow-md transition duration-200 animate__animated animate__fadeInUp min-h-20 w-full h-full">
            <Image
              src={imageSrc}
              width={60}
              height={60}
              alt={truncate(title) || "photo"}
              className="rounded-md object-cover w-16 h-16 drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]"
              quality={100}
              priority={true}
            />
            <div className="flex flex-col justify-center w-full">
              <p className="font-semibold text-gray-800 truncate text-xs">
                {truncate(title)}
              </p>
              <small className="text-gray-500 mt-1 text-xs">
                {truncate(subtitle)}
              </small>
            </div>
          </div>
        </Link>
      </HoverCardTrigger>
      <HoverCardContent className="bg-gray-50">
        <div className="space-y-2">
          <p className="font-semibold text-sm">{title}</p>
          <p className="text-xs text-gray-600">{subtitle}</p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
