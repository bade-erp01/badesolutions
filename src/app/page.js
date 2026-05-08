"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Nav1 from "./Components/Nav1";
import Footer from "@/app/Components/Footer1";

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
          enterprise platform built for structured operations.
        </p>

        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          <Button
            size="lg"
            onClick={() => router.push("/Pricing")}
            className="rounded-xl"
          >
            Sign-Up
          </Button>

          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/SalesPortal")}
            className="rounded-xl"
          >
            Access Portal
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
                Monitor operations, financials, and inventory from a unified
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
                Invoices, expenses, reporting, payment, vendors
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
                Stock, warehouses, supply chain
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
                Staff, attendance, salaries, Time-off
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
                Customers, invoices, lifecycle
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
               Get an application tailored specifically to how your business works.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* ANALYTICS */}
          <Card className="md:col-span-2 flex items-center">
            <CardContent>
              <h3 className="text-xl font-semibold">Built-in analytics</h3>
              <p className="text-zinc-500 mt-2 max-w-xl">
                Gain insight across all modules with real-time reports that
                support better decision-making.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* VALUE SECTION */}
      <section className="bg-zinc-50 py-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-semibold">
            Designed for operational clarity
          </h2>

          <p className="mt-4 text-zinc-500 max-w-2xl mx-auto">
            Everything you need to run and scale your business efficiently.
          </p>

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            <Card>
              <CardHeader>
                <CardTitle>Centralized system</CardTitle>
                <CardDescription>
                  All operations in one platform
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Scalable architecture</CardTitle>
                <CardDescription>Built for growing businesses</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Secure infrastructure</CardTitle>
                <CardDescription>Enterprise-grade reliability</CardDescription>
              </CardHeader>
            </Card>
          </div>
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
