"use client";

import React from "react";
import Link from "next/link";
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

// Module overview: real headings and copy for the search terms the site targets.
const MODULES = [
  {
    title: "Accounting software",
    body: "Chart of accounts, receivables and payables, expenses, budgeting, bank accounts, credit and debit notes, trial balance, income statement, balance sheet and cash flow statement.",
  },
  {
    title: "Inventory and warehouse management",
    body: "Track stock across stores and warehouses with a full audit trail, transfer products between locations, manage purchase orders and vendors, and follow goods in transit.",
  },
  {
    title: "POS and sales management",
    body: "Sell from the point of sale, take a sale from quotation to invoice and payment, track deliveries, and keep every transaction in one ledger.",
  },
  {
    title: "HR and payroll software",
    body: "Staff records and permissions, payroll runs with payslips (PAYE and pension), time-off requests, sales targets and team tasks.",
  },
  {
    title: "CRM and field sales",
    body: "Manage customers and leads, and give your field sales team a mobile Sales Portal for routes, orders, requisitions and stock checks.",
  },
  {
    title: "NRS e-invoicing",
    body: "Report invoices to the Nigeria Revenue Service through B.A.D.E's e-invoicing integration, straight from your sales records.",
  },
];

const FAQS = [
  {
    q: "What is B.A.D.E ERP?",
    a: "B.A.D.E (Business Automated Dynamic Enterprise) is cloud-based ERP software. It brings accounting, inventory, POS and sales, HR and payroll, and CRM into one system, so your teams work from the same data.",
  },
  {
    q: "Is B.A.D.E built for businesses in Nigeria?",
    a: "Yes. B.A.D.E is built for Nigerian and African businesses, with naira pricing, Paystack payments and NRS e-invoicing integration for taxpayer reporting.",
  },
  {
    q: "Which businesses use B.A.D.E?",
    a: "Retail, distribution, logistics and service businesses, from growing SMEs to multi-branch companies with several warehouses and field sales teams.",
  },
  {
    q: "Do I need to install anything?",
    a: "No. B.A.D.E runs in the browser and can be installed on phones and computers as an app. Your data is stored securely in the cloud.",
  },
  {
    q: "How do I get started?",
    a: "Choose a plan on the pricing page and create your business account. You can add your team, products and stores straight away.",
  },
];

export default function LandingPage() {

  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <Nav1 />

      {/* HERO */}
      <section className="max-w-6xl mx-auto px-4 py-12 sm:py-20 text-center">
        <Badge className="mb-4">ERP Platform</Badge>

        <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
          Cloud ERP software to control your business from{" "}
          <span className="text-blue-600">one system</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto">
          B.A.D.E brings accounting, inventory, POS and sales, HR and payroll into
          one cloud ERP built for businesses in Nigeria, whatever your sector.
        </p>

        <div className="mt-5 inline-flex max-w-full items-center gap-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-900">
          <Image
            src="/nrs-e-invoicing-logo.png"
            alt="Nigeria Revenue Service"
            width={90}
            height={38}
            className="h-9 w-auto shrink-0 object-contain"
          />

          <span>
            NRS e-invoicing integration for taxpayer reporting
          </span>
        </div>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Button asChild size="lg" className="rounded-xl">
            <Link href="/Pricing">Create Account</Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="rounded-xl">
            <Link href="/Careers">Careers</Link>
          </Button>
        </div>
      </section>

      {/* BENTO GRID  */}
      <section className="max-w-6xl mx-auto px-4 pb-12 sm:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(220px,auto)]">
          {/* DASHBOARD */}
          <Card className="md:col-span-2 md:row-span-2 overflow-hidden relative">
            <Image
              src="/WhatsApp Image 2026-05-06 at 6.19.03 PM.jpeg"
              alt="B.A.D.E ERP real-time dashboard for sales, finance and inventory"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40" />

            <CardContent className="relative z-10 text-white p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-semibold">Real-time dashboard</h3>
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
                Asset management, Expenses, Reporting, Receivables, Payables, Budgeting, Equity, Income statement, trial Balance, Charts of account
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
                Staff, attendance, Payroll, Help desk, staff Appraisal, Time-off, Contracts and Subscription.
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
                CRM, E-commerce store, invoice lifecycle, transaction ledgers
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
            <CardContent className="p-4 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* LEFT CONTENT */}
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Cloud Infrastructure
                </div>

                <h3 className="mt-5 text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-900">
                  Cloud-based ERP Software
                </h3>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
      <section className="bg-zinc-50 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Designed for operational clarity
          </h2>

          <p className="mt-4 text-zinc-500 max-w-2xl mx-auto">
            Everything you need to run and scale your business efficiently.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {MODULES.map(({ title, body }) => (
            <div key={title} className="rounded-2xl border border-zinc-200 bg-white p-6">
              <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
              <p className="mt-2 text-sm text-zinc-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-semibold text-center">
            Questions about B.A.D.E ERP
          </h2>
          <div className="mt-8 divide-y divide-zinc-200 border-y border-zinc-200">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="group py-4">
                <summary className="cursor-pointer list-none font-medium text-zinc-900 flex justify-between gap-4">
                  {q}
                  <span className="text-zinc-400 group-open:rotate-45 transition">+</span>
                </summary>
                <p className="mt-3 text-sm text-zinc-600">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-20 px-4 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold">
          Start managing your business properly
        </h2>

        <p className="text-zinc-500 mt-4">
          Replace fragmented tools with a unified ERP system.
        </p>

        <Button asChild size="lg" className="mt-6 rounded-xl">
          <Link href="/Pricing">Get Started</Link>
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
  "https://res.cloudinary.com/dgiajxtvn/image/upload/v1785151551/qc6dc_hyndll.jpg"
];

export function TrustedBusinessesSection() {
  return (
    <section className="bg-zinc-50 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Heading */}
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
            Trusted by growing businesses
          </h2>

          <p className="mt-4 text-zinc-500 max-w-2xl mx-auto">
            Businesses across retail, logistics, distribution, and operations
            trust BADE to manage daily workflows efficiently.
          </p>
        </div>

        {/* Main Layout */}
        <div className="mt-10 sm:mt-14 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LOGO CAROUSEL */}
          <Card className="lg:col-span-2 min-w-0 rounded-3xl border border-zinc-200 shadow-sm overflow-hidden bg-white">
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
                            alt={`Logo of a business using B.A.D.E ERP (${index + 1})`}
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
