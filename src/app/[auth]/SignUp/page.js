"use client";

import { termsAndConditions } from "../../../../Functions/Functions";
import { SuccessToast, ErrorMessage } from "../../../../Functions/Mics";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

import Nav1 from "@/app/Components/Nav1";
import TermsAndConditionsLink from "@/app/Components/TermsAndCondition";

// shadcn components
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const params = useSearchParams();
  const router = useRouter();
  const plan = params.get("plan");

  useEffect(() => {
    if (plan !== "Basic" && plan !== "Standard") {
      router.replace("/");
    }
  }, [plan, router]);


  
  
  
  const [formData, setFormData] = useState({
    CompayName: "",
    email: "",
    Tel: "",
    plan: plan,
    NumberOfUsers: plan === "Basic" ? 4 : 6 ,
    renewalFee: plan === "Basic" ? 139750 : 332820,
    totalAmount: plan === "Basic" ? 139750 : 332820,
    referalCode: "",
  });


  // scrap user data 
const hasCapturedLead = useRef(false);

useEffect(() => {
  const saveDraft = async () => {
    if (hasCapturedLead.current) return;
    if (!formData.email && !formData.Tel) return;

    try {
      const res = await fetch(
        "https://api.badesolutions.com.ng/api/lead-capture",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: formData.email,
            phone: formData.Tel,
            company: formData.CompayName,
            plan: formData.plan,
            source: "signup-page",
            capturedAt: new Date(),
          }),
        }
      );

      const data = await res.json();

      if (data?.success) {
        hasCapturedLead.current = true;
      }
    } catch (err) {
      // console.error(err.message);
    }
  };

  const interval = setInterval(saveDraft, 20000);

  return () => clearInterval(interval);
}, [formData]);


  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await termsAndConditions(formData);
    if (res.data){
      SuccessToast(res.data) 
      router.push("/onboarding-success")
    }else{
       ErrorMessage(res.error)
       router.push("/onbarding-error")
    }
    
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <Nav1 />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-3xl overflow-hidden border border-zinc-800 shadow-xl">

          {/* LEFT PANEL */}
          <div className="relative hidden lg:block">
            <Image
              src="/original-9fb073b9c59cd90e574db1b12f7d769b.webp"
              alt="Enterprise office"
              fill
              className="object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90" />

            <div className="relative z-10 p-10 flex flex-col justify-between h-full">
              <div>
                <h1 className="text-3xl font-semibold leading-tight">
                  Business Automated Dynamic Enterprise
                </h1>
                <p className="mt-4 text-sm text-zinc-400 max-w-md">
                  Structured automation, enterprise workflows, and scalable
                  infrastructure designed for operational clarity.
                </p>
              </div>

              <p className="text-xs text-zinc-500">
                © {new Date().getFullYear()} B.A.D.E
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="bg-white text-black flex items-center">
            <Card className="w-full max-w-md mx-auto border-none shadow-none">
              
              <CardHeader>
                <CardTitle className="text-2xl">
                  Create account
                </CardTitle>
                <CardDescription>
                  {formData.plan} plan
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">

                  {/* BUSINESS NAME */}
                  <div className="space-y-2">
                    <Label htmlFor="CompayName">Business name</Label>
                    <Input
                      id="CompayName"
                      name="CompayName"
                      value={formData.CompayName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* EMAIL */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Business email</Label>
                    <Input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* PHONE */}
                  <div className="space-y-2">
                    <Label htmlFor="Tel">Phone number</Label>
                    <Input
                      id="Tel"
                      type="tel"
                      name="Tel"
                      value={formData.Tel}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {/* REFERRAL */}
                  <div className="space-y-2">
                    <Label htmlFor="referalCode">Referal Code</Label>
                    <Input
                      id="referalCode"
                      name="referalCode"
                      value={formData.referalCode}
                      onChange={handleChange}
                    />
                  </div>

                  {/* PRICING */}
                  <div className="rounded-xl border p-4 bg-zinc-50">
                    
                    <p className="text-xs text-zinc-500">
                      {formData.NumberOfUsers} users included
                    </p>

                    <p className="text-sm mt-2">
                      7.5% VAT included.
                    </p>
                    <br/>

                    <p className="text-xs text-zinc-500">Total due</p>
                    <p className="text-xl font-semibold">
                      ₦{formData.totalAmount.toLocaleString()}
                    </p>
                  </div>

                  <p className="text-[11px] text-zinc-500">
                    We may securely save your signup progress to help complete onboarding.
                  </p>

                  {/* TERMS */}
                  <TermsAndConditionsLink BusinessPlan={formData.plan} />

                  {/* BUTTON */}
                  <Button className="w-full h-11">
                    Signup
                  </Button>

                  {/* PAYMENT */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-zinc-500 mb-2">
                      Secure payment via
                    </p>

                    <Image
                      src="/assets/paystack-logo-png_seeklogo-409509-removebg-preview.png"
                      alt="Paystack"
                      width={90}
                      height={30}
                      className="mx-auto opacity-80"
                    />
                  </div>

                </form>
              </CardContent>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}