"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Nav1 from "../Components/Nav1";
import Footer1 from "../Components/Footer1";
import Link from "next/link"
import Image from "next/image";
import { motion } from "framer-motion";

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

export default function Pricing() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#f8f9fb] text-zinc-900 flex flex-col">
      <Nav1 />

      <main className="flex-1 px-4 py-10">

        {/* HEADER */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Simple, scalable pricing
          </h1>
          <p className="mt-4 text-zinc-500 text-base">
            Built for businesses that demand structure, clarity, and growth.
          </p>
        </div>

        {/* PRICING */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* BASIC */}
          <Card className="rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition">
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <CardDescription>For small businesses</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* <div> */}
                {/* <p className="text-3xl font-semibold">₦139,750</p> */}
                {/* <p className="text-3xl font-semibold">₦420,000 </p>
                <p className="text-sm text-zinc-500"> current promo :10% off </p>
              </div> */}

              {/* promo div */}
              <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-emerald-100/60 p-5 shadow-sm">
                {/* Glow */}
                <div className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-emerald-300/20 blur-3xl" />

                <div className="relative flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      🎉 Limited Promo Active
                    </div>

                    <div className="space-y-1">
                      {/* Old price */}
                      <p className="text-sm text-zinc-400 line-through">
                        ₦366,102
                      </p>

                      {/* Promo price */}
                      <h2 className="text-4xl font-bold tracking-tight text-zinc-900">
                        ₦332,820
                      </h2>

                      <p className="text-sm text-zinc-600">
                        Save <span className="font-semibold text-emerald-700">10%[₦33,282]</span> on Basic plan.
                      </p>
                    </div>
                  </div>

                  {/* Promo badge */}
                  <div className="rounded-2xl bg-emerald-600 px-4 py-3 text-center text-white shadow-lg">
                    <p className="text-xs uppercase tracking-wider opacity-80">
                      Promo
                    </p>

                    <p className="text-2xl font-bold leading-none">
                      10%
                    </p>

                    <p className="text-xs opacity-80 mt-1">
                      OFF
                    </p>
                  </div>
                </div>
              </div>
              <Button
                className="w-full rounded-xl"
                onClick={() => router.push("/auth/SignUp?plan=Basic")}
              >
                Get started
              </Button>

              <ul className="text-sm text-zinc-600 space-y-2">
                <li>Sales module access</li>
                <li>Limited API access</li>
                <li>4 active users</li>
                <li>Email support</li>
              </ul>
            </CardContent>
          </Card>

          {/* STANDARD */}
          <Card className="relative rounded-3xl border border-zinc-900 bg-white shadow-lg scale-[1.03]">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-zinc-900 text-white">
              Most Popular
            </Badge>

            <CardHeader>
              <CardTitle>Standard</CardTitle>
              <CardDescription>Best for growing teams</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* <div>
                <p className="text-3xl font-semibold">₦332,820</p>
                <p className="text-sm text-zinc-500">Yearly</p>
              </div> */}

              {/* <Button
                className="w-full rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
                onClick={() => router.push("/auth/SignUp?plan=Standard")}
              >
                Start scaling
              </Button> */}

              <Button
                className="w-full rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
              >
                <Link
                  href="mailto:Operations@badesolutions.com.ng"
                >
                  Contact Sales
                </Link>
              </Button>

              <ul className="text-sm text-zinc-600 space-y-2">
                <li>Multi-business management</li>
                <li>Private cloud backup</li>
                <li>Financial API integrations</li>
                <li>Custom module support</li>
                <li>6 active users</li>
                <li>Training & onboarding</li>
              </ul>
            </CardContent>
          </Card>

          {/* PRO */}
          <Card className="rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition">
            <CardHeader>
              <CardTitle>Pro</CardTitle>
              <CardDescription>Enterprise deployment</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <p className="text-sm text-zinc-500">
                Custom pricing based on your business needs.
              </p>

              <Button
                className="w-full rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
              >
                <Link
                  href="mailto:Operations@badesolutions.com.ng"
                >
                  Contact Sales
                </Link>
              </Button>

              <ul className="text-sm text-zinc-600 space-y-2">
                <li>Unlimited users</li>
                <li>Dedicated VPS</li>
                <li>Custom deployment</li>
                <li>AI-powered business model</li>
                <li>Priority support</li>
                <li>Full API access</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* FOOTER NOTE */}
        <div className="text-center mt-20 text-sm text-zinc-500">
          <p>
            Support:{" "}
            <a
              href="mailto:Operations@badesolutions.com.ng"
              className="underline text-zinc-900"
            >
              Operations@badesolutions.com.ng
            </a>
          </p>

          <p className="mt-4">
            Fully built ERP tailored for your operations.
          </p>

        </div>

      </main>

      <Footer1 />
    </div>
  );
}