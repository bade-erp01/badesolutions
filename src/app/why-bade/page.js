"use client";

import React from "react";
import Nav1 from "../Components/Nav1";
import Footer1 from "../Components/Footer1";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";

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

export default function WhyBADE() {
  const router = useRouter();

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
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Nav1 />

      <main className="flex-1">
        {/* HERO */}
        <section className="max-w-5xl mx-auto px-4 py-12 sm:py-20 text-center">
          <Badge className="mb-4">Why B.A.D.E</Badge>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Built for businesses that need structure and control
          </h1>

          <p className="mt-6 text-base sm:text-lg text-zinc-500 max-w-2xl mx-auto">
            Most businesses struggle with scattered tools, poor visibility, and
            inefficient workflows. B.A.D.E solves this by unifying your
            operations into a single, structured system.
          </p>
        </section>

        {/* CORE PROBLEM */}
        <section className="bg-zinc-50 py-12 sm:py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold">
              The problem with traditional systems
            </h2>

            <div className="mt-8 sm:mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              {[
                ["Fragmented tools", "Multiple systems that don’t communicate"],
                [
                  "Manual processes",
                  "Time-consuming and error-prone workflows",
                ],
                ["Limited visibility", "No real-time insight into operations"],
              ].map(([title, desc]) => (
                <Card key={title}>
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* SOLUTION */}
        <section className="py-12 sm:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold">How B.A.D.E solves it</h2>

              <p className="text-zinc-500 mt-4 max-w-2xl mx-auto">
                A unified ERP platform designed to streamline operations,
                improve decision-making, and scale with your business.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Centralized operations</CardTitle>
                  <CardDescription>
                    Finance, HR, inventory, and sales in one system
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Automation</CardTitle>
                  <CardDescription>
                    Reduce manual work with intelligent workflows
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real-time insights</CardTitle>
                  <CardDescription>
                    Make decisions based on live business data
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* DIFFERENTIATORS */}
        <section className="bg-zinc-50 py-12 sm:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold">
                What makes B.A.D.E different
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                [
                  "Built for Nigerian businesses",
                  "Designed with local operational realities in mind",
                ],
                [
                  "Modular architecture",
                  "Use only what your business needs, scale when required",
                ],
                [
                  "Enterprise-grade structure",
                  "Processes designed for accountability and control",
                ],
                [
                  "Scalable infrastructure",
                  "Supports growth from SME to enterprise level",
                ],
              ].map(([title, desc]) => (
                <Card key={title}>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg">{title}</h3>
                    <p className="text-zinc-500 mt-2 text-sm">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* USE CASES */}
        <section className="py-12 sm:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl font-semibold">Who is it for</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                [
                  "SMEs",
                  "Looking to replace spreadsheets and manual processes",
                ],
                [
                  "Growing businesses",
                  "Needing structured operations and control",
                ],
                ["Enterprises", "Requiring scalable and customizable systems"],
              ].map(([title, desc]) => (
                <Card key={title}>
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{desc}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="max-w-full mb-16 sm:mb-28 overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-center mb-10 sm:mb-14 px-4"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
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
                className="shrink-0 min-w-[260px] sm:min-w-[300px] md:min-w-[360px] bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm"
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

        {/* CTA */}
        <section className="py-12 sm:py-20 px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Ready to structure your business?
          </h2>

          <p className="text-zinc-500 mt-4">
            Move from fragmented tools to a unified ERP system.
          </p>

          <Button
            size="lg"
            className="mt-6 rounded-xl"
            onClick={() => router.push("/Pricing")}
          >
            Get Started
          </Button>
        </section>
      </main>

      <Footer1 />
    </div>
  );
}
