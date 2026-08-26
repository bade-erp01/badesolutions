"use client";
import { useState } from "react";
import Link from "next/link";
import Footer2 from "../Components/Footer1";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

export default function SalesPortalLanding() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
    // Add your actual signup logic here
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">SP</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">SalesPortal</h1>
              <p className="text-xs text-slate-500 -mt-1">by BADE</p>
            </div>
          </div>

          <Button asChild size="lg" className="font-semibold">
            <Link href="/SalesPortal/Login">Login to Portal</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/salesfolks.jpg')] bg-cover bg-center opacity-30" />
        
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge variant="secondary" className="mb-4 text-emerald-400 bg-emerald-950 border-emerald-800">
            Sales Team Management Platform
          </Badge>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-6">
            Manage Your Sales Team.<br />
            Close More Deals.
          </h1>

          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10">
            Real-time visibility into your sales reps&apos; activity, 
            pipeline progress, and performance — all in one powerful platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="text-lg h-14 px-10">
              <Link href="/Pricing">Get Started </Link>
            </Button>
            {/* <Button size="lg" variant="outline" className="text-lg h-14 px-10 border-white/30 text-white hover:bg-white/10">
              Watch Demo
            </Button> */}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Everything your sales team needs
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Powerful tools to track, manage, and optimize sales rep performance
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-10">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  📋
                </div>
                <h3 className="text-2xl font-semibold mb-3">Lead & Pipeline Management</h3>
                <p className="text-slate-600">
                  Track every lead, manage your sales pipeline, and ensure no opportunity slips through.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-10">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  📊
                </div>
                <h3 className="text-2xl font-semibold mb-3">Real-time Activity Tracking</h3>
                <p className="text-slate-600">
                  Monitor calls, meetings, follow-ups, and field activities of your sales reps live.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardContent className="p-10">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  🎯
                </div>
                <h3 className="text-2xl font-semibold mb-3">Performance Analytics</h3>
                <p className="text-slate-600">
                  Deep insights into individual and team performance with clear KPIs and leaderboards.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-8">
                Built for Sales Managers who want results
              </h2>
              <ul className="space-y-8">
                {[
                  ["Increase Productivity", "Cut admin work and give reps more time to sell"],
                  ["Real-time Visibility", "Know exactly what your team is doing at any moment"],
                  ["Data-Driven Coaching", "Identify top performers and help struggling reps improve"],
                  ["Mobile-First Design", "Your team can update deals and activities from the field"],
                ].map(([title, desc], i) => (
                  <li key={i} className="flex gap-4">
                    <CheckCircle className="w-7 h-7 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">{title}</h4>
                      <p className="text-slate-600 mt-1">{desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <Card className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white border-0 shadow-2xl">
              <CardContent className="p-12">
                <p className="text-lg leading-relaxed">
                  “SalesPortal transformed how we manage our field sales team. 
                  We now have complete visibility into daily activities and 
                  our close rate has increased by 38% in just three months.”
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-full" />
                  <div>
                    <p className="font-semibold">Michael Okoro</p>
                    <p className="text-sm text-emerald-200">Sales Director, AgroTrade Ltd</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-slate-900 text-white py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to take control of your sales team?</h2>
          <p className="text-slate-400 mb-10 text-lg">
            Join hundreds of sales managers already using SalesPortal to boost performance.
          </p>
          <Button size="lg" asChild className="text-lg px-12 h-14 bg-emerald-600 hover:bg-emerald-700">
            <Link href="/SalesPortal/Login">Access SalesPortal Now</Link>
          </Button>
        </div>
      </section>

      <Footer2 />
    </div>
  );
}