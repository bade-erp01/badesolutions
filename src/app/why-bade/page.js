"use client";

import React from "react";
import Nav1 from "../Components/Nav1";
import Footer1 from "../Components/Footer1";
import { useRouter } from "next/navigation";

// shadcn
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function WhyBADE() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white text-zinc-900 flex flex-col">
      <Nav1 />

      <main className="flex-1">

        {/* HERO */}
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <Badge className="mb-4">Why B.A.D.E</Badge>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight">
            Built for businesses that need structure and control
          </h1>

          <p className="mt-6 text-lg text-zinc-500 max-w-2xl mx-auto">
            Most businesses struggle with scattered tools, poor visibility,
            and inefficient workflows. B.A.D.E solves this by unifying your
            operations into a single, structured system.
          </p>
        </section>

        {/* CORE PROBLEM */}
        <section className="bg-zinc-50 py-16">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold">
              The problem with traditional systems
            </h2>

            <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
              {[
                ["Fragmented tools", "Multiple systems that don’t communicate"],
                ["Manual processes", "Time-consuming and error-prone workflows"],
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
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">

            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold">
                How B.A.D.E solves it
              </h2>

              <p className="text-zinc-500 mt-4 max-w-2xl mx-auto">
                A unified ERP platform designed to streamline operations,
                improve decision-making, and scale with your business.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

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
        <section className="bg-zinc-50 py-20">
          <div className="max-w-6xl mx-auto px-4">

            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold">
                What makes B.A.D.E different
              </h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

              {[
                [
                  "Built for Nigerian businesses",
                  "Designed with local operational realities in mind"
                ],
                [
                  "Modular architecture",
                  "Use only what your business needs, scale when required"
                ],
                [
                  "Enterprise-grade structure",
                  "Processes designed for accountability and control"
                ],
                [
                  "Scalable infrastructure",
                  "Supports growth from SME to enterprise level"
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
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">

            <div className="text-center mb-16">
              <h2 className="text-3xl font-semibold">
                Who is it for
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6">

              {[
                ["SMEs", "Looking to replace spreadsheets and manual processes"],
                ["Growing businesses", "Needing structured operations and control"],
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

        {/* CTA */}
        <section className="py-20 text-center">
          <h2 className="text-3xl font-semibold">
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