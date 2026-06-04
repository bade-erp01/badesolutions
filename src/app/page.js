"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Nav1 from "./Components/Nav1";
import Footer from "@/app/Components/Footer1";
import Autoplay from "embla-carousel-autoplay";

// shadcn
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Nav1 />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <Badge className="mb-4">ERP Platform</Badge>

        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
          Control your business from{" "}
          <span className="text-blue-600">one system</span>
        </h1>

        <p className="mt-6 text-lg text-zinc-500 max-w-2xl mx-auto">
          Finance, inventory, HR, and sales — fully integrated into a single
          enterprise platform built for structured operations regardless of your business sector.
        </p>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Button
            size="lg"
            onClick={() => router.push("/Pricing")}
            className="rounded-xl"
          >
            Create Account
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/Marketers")}
            className="rounded-xl"
          >
           Refer & Earn
          </Button>
        </div>
      </section>

      {/* BENTO GRID  */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[220px]">
          {/* DASHBOARD */}
          <Card className="md:col-span-2 md:row-span-2 overflow-hidden relative">
            <Image
              src="/WhatsApp Image 2026-05-06 at 6.19.03 PM.jpeg"
              alt="dashboard"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />

            <CardContent className="relative z-10 text-white p-6">
              <h3 className="text-2xl font-semibold">Real-time dashboard</h3>
              <p className="text-sm mt-2 text-zinc-200 max-w-md">
                Monitor Sales operations, financial reporting, and inventory from a unified
                command center.
              </p>
            </CardContent>
          </Card>

          {/* FINANCE */}
          <Card
            style={{
              backgroundImage: `url("/WhatsApp Image 2026-05-06 at 10.22.19 PM.jpeg")`,
              backgroundSize: "cover", // ensures the image covers the card
              backgroundPosition: "center", // centers the image
              backgroundRepeat: "no-repeat", // prevents tiling
            }}
            className="relative overflow-hidden text-white"
          >
            <div className="absolute inset-0 bg-black/40" />

            <CardHeader className="relative z-10">
              <CardTitle>Finance</CardTitle>
              <CardDescription className={"text-white"}>
                Asset management, Expenses, Reporting, Recievables, Payables, Budgeting,Equity, Income statement, trial Balance, Charts of account
              </CardDescription>
            </CardHeader>
          </Card>

          {/* INVENTORY */}
          <Card
            style={{
              backgroundImage: `url("/image.png")`,
              backgroundSize: "cover", // ensures the image covers the card
              backgroundPosition: "center", // centers the image
              backgroundRepeat: "no-repeat", // prevents tiling
            }}
            className="relative overflow-hidden text-white"
          >
            <div className="absolute inset-0 bg-black/40" />

            <CardHeader className="relative z-10">
              <CardTitle>Inventory</CardTitle>
              <CardDescription className={"text-white"}>
                Stock, warehouses, supply chain, Manufacturing.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* HR */}
          <Card
            style={{
              backgroundImage: `url("/christina-wocintechchat-com-m-vzfgh3RAPzM-unsplash.jpg")`,
              backgroundSize: "cover", // ensures the image covers the card
              backgroundPosition: "center", // centers the image
              backgroundRepeat: "no-repeat", // prevents tiling
            }}
            className="relative overflow-hidden text-white"
          >
            <div className="absolute inset-0 bg-black/40" />

            <CardHeader className="relative z-10">
              <CardTitle>HR & Payroll</CardTitle>
              <CardDescription className={"text-white"}>
                Staff, attendance, Payroll, Help desk,staff Appraisal, Time-off.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* SALES */}
          <Card
            style={{
              backgroundImage: `url("/markus-winkler-IrRbSND5EUc-unsplash.jpg")`,
              backgroundSize: "cover", // ensures the image covers the card
              backgroundPosition: "center", // centers the image
              backgroundRepeat: "no-repeat", // prevents tiling
            }}
            className="relative overflow-hidden text-white"
          >
            <div className="absolute inset-0 bg-black/40" />

            <CardHeader className="relative z-10">
              <CardTitle>Sales</CardTitle>
              <CardDescription className={"text-white"}>
                CRM, invoice lifecycle, transaction ledgers
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            style={{
              backgroundImage: `url("/image copy.png")`,
              backgroundSize: "cover", // ensures the image covers the card
              backgroundPosition: "center", // centers the image
              backgroundRepeat: "no-repeat", // prevents tiling
            }}
            className="relative overflow-hidden text-white"
          >
            <div className="absolute inset-0 bg-black/40" />

            <CardHeader className="relative z-10">
              <CardTitle>Personalization</CardTitle>
              <CardDescription className={"text-white"}>
                Get an application tailored specifically to how your business
                works.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* ANALYTICS */}
          <Card className="md:col-span-2 overflow-hidden border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 shadow-sm hover:shadow-md transition-all duration-300">
            <CardContent className="p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* LEFT CONTENT */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Infrastructure
                </div>

                <h3 className="mt-5 text-3xl font-semibold tracking-tight text-zinc-900">
                  Cloud-based ERP Software
                </h3>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-3">
                  {[
                    "Real-time reporting",
                    "Multi-user access",
                    "Automated workflows",
                    "Enterprise security",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-zinc-700">
                        * {item}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* User section */}
      <TrustedBusinessesSection />

      {/* VALUE SECTION */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold">
            Designed for operational clarity
          </h2>

          <p className="mt-4 text-zinc-500 max-w-2xl mx-auto">
            Everything you need to run and scale your business efficiently.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <h2 className="text-3xl font-semibold">
          Start managing your business properly
        </h2>

        <p className="text-zinc-500 mt-4">
          Replace fragmented tools with a unified ERP system.
        </p>

        <Button
          size="lg"
          className="mt-6 rounded-xl"
          onClick={() => router.push("/Pricing")}
        >
          Get Started
        </Button>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const logos = [
  "/logo.jpg",
  "/logo2.jpg",
  "/logo3.jpg",
  "/WhatsApp Image 2025-03-12 at 09.55.20_dfbb45cd.jpg",
  "/logo.webp",
];

export function TrustedBusinessesSection() {
  return (
    <section className="bg-zinc-50 py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Trusted by growing businesses
          </h2>

          <p className="mt-4 text-zinc-500 max-w-2xl mx-auto">
            Businesses across retail, logistics, distribution, and operations
            trust BADE to manage daily workflows efficiently.
          </p>
        </div>

        {/* Main Layout */}
        <div className="mt-14 grid lg:grid-cols-3 gap-6">
          {/* LOGO CAROUSEL */}
          <Card className="lg:col-span-2 rounded-3xl border border-zinc-200 shadow-sm overflow-hidden bg-white">
            <CardHeader>
              <CardTitle>Organizations using BADE</CardTitle>

              <CardDescription>
                Enterprise software infrastructure built for modern operations.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 4500,
                  }),
                ]}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {logos.map((logo, index) => (
                    <CarouselItem
                      key={index}
                      className="basis-1/2 md:basis-1/3 lg:basis-1/4"
                    >
                      <div className="p-2">
                        <div className="h-32 rounded-2xl border border-zinc-200 bg-white hover:shadow-md transition flex items-center justify-center">
                          <Image
                            src={logo}
                            alt={`Client logo ${index + 1}`}
                            width={90}
                            height={90}
                            className="object-contain max-h-20 w-auto"
                          />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </CardContent>
          </Card>

          {/* SIDE INFO */}
          <div className="space-y-6">
            <Card className="rounded-3xl border border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle>Centralized system</CardTitle>

                <CardDescription>
                  Manage finance, inventory, HR, procurement, and sales from one
                  platform.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-3xl border border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle>Scalable architecture</CardTitle>

                <CardDescription>
                  Built to support growing teams, multiple branches, and
                  expanding operations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="rounded-3xl border border-zinc-200 shadow-sm">
              <CardHeader>
                <CardTitle>Secure infrastructure</CardTitle>

                <CardDescription>
                  Enterprise-grade cloud deployment with controlled access and
                  protected data.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
