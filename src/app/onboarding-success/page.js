"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

import Nav1 from "@/app/Components/Nav1";
import Footer1 from "@/app/Components/Footer1";

// shadcn ui
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// icons
import {
  CheckCircle2,
  ArrowRight,
  MailCheck,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function OnboardingSuccess() {
  const router = useRouter();

  useEffect(() => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;

    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 80,
      zIndex: 9999,
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 60 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: {
          x: Math.random(),
          y: Math.random() - 0.2,
        },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleGetStarted = () => {
    router.push("/");
  };

  return (
    <>
      <Nav1 />

      <main className="relative min-h-dvh overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-blue-50">
        {/* Background Glow */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-200/30 blur-3xl" />

          <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-violet-200/30 blur-3xl" />

          <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-200/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-10 sm:py-20">
          <Card className="w-full max-w-2xl overflow-hidden rounded-[2rem] border-0 bg-white/90 shadow-2xl backdrop-blur-xl">
            {/* TOP HEADER */}
            <div className="relative overflow-hidden bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-800 px-5 py-8 sm:px-8 sm:py-12 text-white">
              <div className="absolute inset-0 opacity-20 bg-[url('/grid.svg')]" />

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-emerald-500/20 backdrop-blur-md">
                  <CheckCircle2 className="h-12 w-12 sm:h-14 sm:w-14 text-emerald-400" />
                </div>

                <Badge className="rounded-full bg-white/10 px-4 py-1 text-white whitespace-normal hover:bg-white/10">
                  Business Onboarding Complete
                </Badge>

                <h1 className="mt-6 text-3xl sm:text-4xl font-semibold tracking-tight md:text-5xl">
                  Welcome to BADE
                </h1>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg">
                  Your onboarding was completed successfully and your business
                  workspace is now being prepared.
                </p>
              </div>
            </div>

            {/* BODY */}
            <CardContent className="space-y-6 sm:space-y-8 p-5 sm:p-8 md:p-10">
              {/* MESSAGE */}
              <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-4 sm:p-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="flex shrink-0 items-center justify-center">
                    <MailCheck className="h-6 w-6 text-blue-600" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-zinc-900">
                      Activation Email Sent
                    </h3>

                    <p className="mt-2 text-sm sm:text-base leading-relaxed text-zinc-600">
                      We’ve sent an activation email to your registered business
                      address. Please check your inbox and follow the
                      instructions to activate your workspace and begin using
                      BADE.
                    </p>
                  </div>
                </div>
              </div>

              {/* FEATURES */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <Sparkles className="mb-4 h-8 w-8 text-violet-600" />

                  <h3 className="font-semibold text-zinc-900">
                    Smart Automation
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Automate operations, workflows, and business processes with
                    ease.
                  </p>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <ShieldCheck className="mb-4 h-8 w-8 text-emerald-600" />

                  <h3 className="font-semibold text-zinc-900">
                    Secure Platform
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Enterprise-grade infrastructure built with security and
                    reliability in mind.
                  </p>
                </div>

                <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
                  <CheckCircle2 className="mb-4 h-8 w-8 text-blue-600" />

                  <h3 className="font-semibold text-zinc-900">
                    Ready to Scale
                  </h3>

                  <p className="mt-2 text-sm leading-relaxed text-zinc-500">
                    Built to support growing teams, expanding operations, and
                    future business growth.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-4 pt-2 sm:flex-row">
                <Button
                  onClick={handleGetStarted}
                  className="h-12 flex-1 rounded-2xl text-base"
                >
                  Go to Homepage
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-2xl"
                  onClick={() =>
                    window.open(
                      "mailto:operations@badesolutions.com.ng",
                      "_blank",
                    )
                  }
                >
                  Contact Support
                </Button>
              </div>

              {/* FOOT NOTE */}
              <p className="text-center text-sm text-zinc-400">
                Business Automated Dynamic Enterprise (B.A.D.E)
              </p>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer1 />
    </>
  );
}