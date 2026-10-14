"use client";

import React from "react";
import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";
import { useRouter } from "next/navigation";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  LifeBuoy,
} from "lucide-react";

export default function OnboardingError({
  message = "We couldn't complete your onboarding request at the moment. Please try again shortly or contact support if the issue continues.",
}) {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/");
  };

  return (
    <>
      <Nav1 />

      <main className="relative min-h-dvh overflow-hidden bg-[#f5f7fb]">
        {/* BACKGROUND */}
        <div className="absolute inset-0 overflow-hidden">
          {/* top gradient */}
          <div className="absolute -top-32 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-red-200/40 blur-3xl" />

          {/* bottom blur */}
          <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-orange-200/40 blur-3xl" />

          {/* floating circles */}
          <div className="absolute top-24 left-10 h-24 w-24 rounded-full bg-white/50 backdrop-blur-xl" />
          <div className="absolute bottom-32 left-1/4 h-16 w-16 rounded-full bg-red-100/60 backdrop-blur-xl" />
          <div className="absolute top-1/3 right-20 h-20 w-20 rounded-full bg-orange-100/60 backdrop-blur-xl" />
        </div>

        <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10 sm:py-20">
          <Card className="w-full max-w-2xl overflow-hidden rounded-[2rem] border-0 bg-white/80 shadow-2xl backdrop-blur-2xl">
            {/* TOP SECTION */}
            <div className="relative overflow-hidden bg-gradient-to-br from-red-600 via-rose-600 to-orange-500 px-5 py-8 sm:px-8 sm:py-12 text-white">
              {/* grid overlay */}
              <div className="absolute inset-0 opacity-10 bg-[url('/grid.svg')]" />

              {/* glow */}
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-lg">
                  <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12" />
                </div>

                <h1 className="mt-6 text-2xl sm:text-4xl font-bold tracking-tight">
                  Onboarding Interrupted
                </h1>

                <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80">
                  Your request could not be completed successfully.
                  Don’t worry — your information is safe and no
                  setup progress has been lost.
                </p>
              </div>
            </div>

            {/* CONTENT */}
            <CardContent className="p-5 sm:p-8 md:p-10">
              {/* ERROR MESSAGE */}
              <div className="rounded-3xl border border-red-100 bg-red-50/70 p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-100">
                    <ShieldAlert className="h-6 w-6 text-red-600" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      Something went wrong
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 break-words">
                      {message}
                    </p>
                  </div>
                </div>
              </div>

              {/* SUPPORT CARD */}
              <div className="mt-6 rounded-3xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                    <LifeBuoy className="h-6 w-6 text-zinc-700" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-zinc-900">
                      Need assistance?
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                      If the issue persists, our support team is
                      available to help you complete your onboarding
                      and activate your business account quickly.
                    </p>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Button
                  onClick={handleGetStarted}
                  className="h-12 flex-1 rounded-2xl text-base font-medium shadow-lg"
                >
                  Return to Homepage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-2xl border-zinc-300 text-base"
                  onClick={() =>
                    window.location.reload()
                  }
                >
                  Try Again
                </Button>
              </div>

              {/* FOOTER NOTE */}
              <div className="mt-8 text-center">
                <p className="text-xs tracking-wide text-zinc-400 uppercase">
                  Business Automated Dynamic Enterprise
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer1 />
    </>
  );
}