"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Nav1 from "../Components/Nav1";
import Footer1 from "../Components/Footer1";
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

  const logos = [
    "/logo.jpg",
    "/logo2.jpg",
    "/logo3.jpg",
    "/WhatsApp Image 2025-03-12 at 09.55.20_dfbb45cd.jpg",
    "/logo.webp",
  ];

  const testimonials = [
    {
      text: "B.A.D.E transformed how we manage inventory and sales. What used to take hours now takes minutes.",
      name: "Chinedu Okafor",
      role: "Operations Manager",
      img: "/person.png",
      metric: "+38% efficiency",
    },
    {
      text: "The automation alone paid for itself in the first month. Reporting is now instant and accurate.",
      name: "Aisha Bello",
      role: "Finance Lead",
      img: "/person.png",
      metric: "4x faster reporting",
    },
    {
      text: "We scaled from one store to three without operational chaos. That’s the real value.",
      name: "Tunde Adebayo",
      role: "Business Owner",
      img: "/person.png",
      metric: "3x scale growth",
    },
  ];

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

        {/* TRUST SECTION */}
        <section className="max-w-6xl mx-auto mb-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center text-sm text-zinc-500 mb-5"
          >
            Trusted by growing businesses
          </motion.p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
            {logos.map((src, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-center bg-white border border-zinc-200 rounded-2xl h-16 shadow-sm hover:shadow-md transition"
              >
                <Image
                  src={src}
                  alt="client"
                  width={50}
                  height={30}
                  quality={"100px"}
                  loading="lazy"
                  className="object-contain grayscale opacity90 hover:grayscale-0 hover:opacity-100 transition"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-full mb-28 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl font-semibold tracking-tight">
              What our clients say
            </h2>
            <p className="text-zinc-500 mt-3 text-sm">
              Real businesses. Measurable outcomes.
            </p>
          </motion.div>

          <motion.div
            className="flex gap-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              repeat: Infinity,
              duration: 22,
              ease: "linear",
            }}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <div
                key={i}
                className="min-w-[300px] md:min-w-[360px] bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm"
              >
                <p className="text-sm text-zinc-600 leading-relaxed">
                  “{t.text}”
                </p>

                <div className="mt-4 text-xs font-semibold text-green-600">
                  {t.metric}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Image
                    src={t.img}
                    alt={t.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-zinc-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* PRICING */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">

          {/* BASIC */}
          <Card className="rounded-3xl border border-zinc-200 bg-white shadow-sm hover:shadow-md transition">
            <CardHeader>
              <CardTitle>Basic</CardTitle>
              <CardDescription>For small businesses</CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div>
                <p className="text-3xl font-semibold">₦2,500</p>
                <p className="text-sm text-zinc-500">per user / month</p>
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
              <div>
                <p className="text-3xl font-semibold">₦4,000</p>
                <p className="text-sm text-zinc-500">per user / month</p>
              </div>

              <Button
                className="w-full rounded-xl bg-zinc-900 text-white hover:bg-zinc-800"
                onClick={() => router.push("/auth/SignUp?plan=Standard")}
              >
                Start scaling
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

              <Button className="w-full rounded-xl">
                Contact sales
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