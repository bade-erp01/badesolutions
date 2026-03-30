"use client";
import { useState } from "react";
import Link from "next/link";
import Footer2 from "../Components/Footer1";

export default function SalesPortalLanding() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Newsletter signup:", email);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Navigation */}
      <nav className="sticky top-0 z-20 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-black tracking-tight text-slate-900">
              Sales Portal
            </h1>
            <p className="text-xs text-slate-500">
              Enterprise sales productivity suite
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/SalesPortal/Login"
              className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-md shadow-slate-900/20 transition hover:bg-slate-800"
            >
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        className="relative bg-cover bg-center bg-gradient-to-br from-green-700 via-yellow-600 to-amber-800 text-white py-24 px-6"
        style={{
          backgroundImage: "url('/salesfolks.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(50%) brightness(0.9)",
        }}
      >
        {/* <!-- Overlay for better text contrast --> */}
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-lg">
            Close Deals Anytime, Anywhere
          </h1>
          <p className="text-base md:text-lg text-gray-200 pb-6 max-w-2xl mx-auto">
            Empower your sales team with real‑time insights and mobile‑first
            tools to win more customers on the move.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border-l-4 border-crop">
              <h3 className="text-xs font-bold mb-3 text-crop">
                📋 Lead Management
              </h3>
              <p className="text-xs text-gray-600">
                Track prospects, manage pipelines, and never miss a follow-up
                opportunity
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border-l-4 border-harvest">
              <h3 className="text-xs font-bold mb-3 text-harvest">
                🎯 Customer Insights
              </h3>
              <p className="text-xs text-gray-600">
                Access customer history, preferences, and deal status in
                real-time from anywhere
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border-l-4 border-soil">
              <h3 className="text-xs font-bold mb-3 text-soil">
                📱 Mobile Sales Tools
              </h3>
              <p className="text-xs text-gray-600">
                Quote generation, contract signing, and deal closure all from
                your phone
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold text-center text-soil mb-12">
            Why Choose B.M.P?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <span className="text-accent text-lg">✓</span>
                  <div>
                    <h4 className="font-bold text-soil text-xs mb-1">
                      Increase Productivity
                    </h4>
                    <p className="text-xs text-gray-600">
                      Reduce admin time and focus on closing deals faster
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent text-lg">✓</span>
                  <div>
                    <h4 className="font-bold text-soil text-xs mb-1">
                      Data-Driven Decisions
                    </h4>
                    <p className="text-xs text-gray-600">
                      Real-time analytics to optimize your sales strategy
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-accent text-lg">✓</span>
                  <div>
                    <h4 className="font-bold text-soil text-xs mb-1">
                      Built for Teams
                    </h4>
                    <p className="text-xs text-gray-600">
                      Seamless collaboration and performance tracking
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-crop to-field p-8 rounded-xl text-white">
              <p className="text-xs leading-relaxed">
                Our platform is designed by sales professionals for sales
                professionals. With over 500+ active users and 10,000+ deals
                closed, BADE delivers results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section id="pricing" className="bg-white py-16 px-6">
        <div className="mx-auto max-w-5xl px-6">
          <h3 className="text-center text-3xl font-bold text-slate-900">
            Simple plans for growing teams
          </h3>
          <p className="mt-2 text-center text-slate-600">
            No surprises. Upgrade any time.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Starter",
                price: "$29/mo",
                features: ["Basic analytics", "Email support", "1 user"],
              },
              {
                name: "Pro",
                price: "$79/mo",
                features: [
                  "Pipeline AI",
                  "CRM sync",
                  "5 users",
                  "Priority support",
                ],
              },
              {
                name: "Enterprise",
                price: "Custom",
                features: [
                  "Custom onboarding",
                  "SLA",
                  "Unlimited users",
                  "Dedicated CSM",
                ],
              },
            ].map((plan) => (
              <article
                key={plan.name}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-7 shadow-sm"
              >
                <h4 className="text-lg font-bold text-slate-900">
                  {plan.name}
                </h4>
                <p className="mt-2 text-3xl font-extrabold text-slate-900">
                  {plan.price}
                </p>
                <ul className="mt-4 space-y-2 text-sm text-slate-600">
                  {plan.features.map((f) => (
                    <li key={f}>• {f}</li>
                  ))}
                </ul>
                <button className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800">
                  Choose
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <Footer2 />
    </div>
  );
}
